import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { doctorAPI, appointmentAPI, journeyAPI } from '../../api/client';
import {
    Calendar, Clock, User, RefreshCw, Search, Check,
    Stethoscope, IndianRupee, ChevronLeft, ChevronRight, FileText, Shield
} from 'lucide-react';

export default function BookAppointment() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [doctors, setDoctors] = useState([]);
    const [journeys, setJourneys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [reason, setReason] = useState('');
    const [selectedJourneyId, setSelectedJourneyId] = useState(null);
    const [grantConsent, setGrantConsent] = useState(true);
    const [booking, setBooking] = useState(false);
    const [message, setMessage] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFollowUp, setIsFollowUp] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [doctorsRes, journeysRes] = await Promise.all([
                    doctorAPI.list(),
                    journeyAPI.list()
                ]);
                setDoctors(doctorsRes.data);
                setJourneys(journeysRes.data.filter(j => j.status === 'ACTIVE'));

                // Check if coming from HealthJourneys with a journey_id
                const journeyIdParam = searchParams.get('journey_id');
                if (journeyIdParam) {
                    setSelectedJourneyId(parseInt(journeyIdParam));
                    setIsFollowUp(true);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [searchParams]);

    const filteredDoctors = doctors.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.specialization && doc.specialization.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Generate time slots
    const timeSlots = [];
    for (let hour = 9; hour <= 17; hour++) {
        timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
        if (hour < 17) {
            timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
        }
    }

    // Get minimum date (tomorrow)
    const getMinDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    const handleBook = async () => {
        if (!selectedDoctor || !selectedDate || !selectedTime) {
            setMessage({ type: 'error', text: 'Please select a doctor, date, and time' });
            return;
        }

        if (!isFollowUp && !reason.trim()) {
            setMessage({ type: 'error', text: 'Please enter a reason for the consultation' });
            return;
        }

        setBooking(true);
        setMessage(null);

        try {
            const scheduledTime = new Date(`${selectedDate}T${selectedTime}:00`).toISOString();
            const payload = {
                doctor: selectedDoctor.id,
                scheduled_time: scheduledTime,
            };

            if (isFollowUp && selectedJourneyId) {
                payload.journey_id = selectedJourneyId;
                payload.grant_consent = grantConsent;
            } else {
                payload.reason = reason;
            }

            await appointmentAPI.create(payload);
            setMessage({ type: 'success', text: 'Appointment booked successfully!' });
            setTimeout(() => navigate('/patient/appointments'), 1500);
        } catch (err) {
            // Check for slot conflict error
            const errorData = err.response?.data;
            const slotError = errorData?.scheduled_time;

            if (slotError) {
                // Slot conflict - show specific notification
                setMessage({
                    type: 'error',
                    text: '⚠️ This slot is unavailable. Please select a different time.'
                });
                // Reset time selection so user picks another slot
                setSelectedTime('');
            } else {
                setMessage({
                    type: 'error',
                    text: errorData?.error || errorData?.detail || 'Booking failed. Please try again.'
                });
            }
        } finally {
            setBooking(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <RefreshCw className="w-8 h-8 animate-spin text-brand-mint" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/patient/appointments')}
                    className="p-2 hover:bg-brand-slate/50 rounded-lg transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-bold">Book Appointment</h1>
            </div>

            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-2 ${message.type === 'success'
                    ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                    : 'bg-brand-red/20 text-brand-red border border-brand-red/30'
                    }`}>
                    {message.text}
                </div>
            )}

            {/* Step 1: Select Doctor */}
            <div className="bg-brand-slate/50 rounded-xl p-5 border border-brand-cream/10">
                <h2 className="font-semibold mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-brand-mint" />
                    Step 1: Select Doctor
                </h2>

                {/* Search */}
                <div className="relative mb-4">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-cream/50" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by name or specialization..."
                        className="w-full pl-10 pr-4 py-2.5 bg-brand-dark/50 border border-brand-cream/20 rounded-lg text-brand-cream placeholder-brand-cream/40 focus:outline-none focus:border-brand-mint"
                    />
                </div>

                {/* Doctor List */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {filteredDoctors.length === 0 ? (
                        <p className="text-brand-cream/50 text-center py-4">No doctors found</p>
                    ) : (
                        filteredDoctors.map(doc => (
                            <button
                                key={doc.id}
                                onClick={() => setSelectedDoctor(doc)}
                                className={`w-full p-4 rounded-lg border text-left transition-all flex items-center justify-between ${selectedDoctor?.id === doc.id
                                    ? 'bg-brand-mint/20 border-brand-mint'
                                    : 'bg-brand-dark/30 border-brand-cream/10 hover:border-brand-cream/30'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-brand-mint/20 flex items-center justify-center">
                                        <Stethoscope className="w-5 h-5 text-brand-mint" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{doc.name}</p>
                                        <p className="text-sm text-brand-cream/60">{doc.specialization || 'General'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-1 text-brand-mint">
                                        <IndianRupee className="w-4 h-4" />
                                        <span className="font-semibold">{Math.ceil(doc.consultation_fee * 1.05)}</span>
                                    </div>
                                    {selectedDoctor?.id === doc.id && (
                                        <Check className="w-5 h-5 text-brand-mint ml-auto mt-1" />
                                    )}
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Step 2: Select Date & Time */}
            {selectedDoctor && (
                <div className="bg-brand-slate/50 rounded-xl p-5 border border-brand-cream/10">
                    <h2 className="font-semibold mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-brand-mint" />
                        Step 2: Select Date & Time
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Date Picker */}
                        <div>
                            <label className="block text-sm text-brand-cream/70 mb-2">Select Date</label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                min={getMinDate()}
                                className="w-full px-4 py-3 bg-brand-dark/50 border border-brand-cream/20 rounded-lg text-brand-cream focus:outline-none focus:border-brand-mint [color-scheme:dark]"
                            />
                        </div>

                        {/* Time Slots */}
                        <div>
                            <label className="block text-sm text-brand-cream/70 mb-2">Select Time</label>
                            <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                                {timeSlots.map(time => (
                                    <button
                                        key={time}
                                        onClick={() => setSelectedTime(time)}
                                        className={`py-2 px-3 rounded-lg text-sm transition-all ${selectedTime === time
                                            ? 'bg-brand-mint text-brand-dark font-semibold'
                                            : 'bg-brand-dark/50 border border-brand-cream/20 hover:border-brand-cream/40'
                                            }`}
                                    >
                                        {time}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 3: Consultation Type */}
            {selectedDoctor && selectedDate && selectedTime && (
                <div className="bg-brand-slate/50 rounded-xl p-5 border border-brand-cream/10">
                    <h2 className="font-semibold mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-brand-mint" />
                        Step 3: Consultation Type
                    </h2>

                    {/* New vs Follow-up Toggle */}
                    <div className="flex gap-3 mb-4">
                        <button
                            onClick={() => {
                                setIsFollowUp(false);
                                setSelectedJourneyId(null);
                            }}
                            className={`flex-1 py-3 px-4 rounded-lg border transition-all ${!isFollowUp
                                ? 'bg-brand-mint/20 border-brand-mint text-brand-cream'
                                : 'bg-brand-dark/30 border-brand-cream/20 text-brand-cream/60 hover:border-brand-cream/40'
                                }`}
                        >
                            <p className="font-medium">New Consultation</p>
                            <p className="text-xs opacity-70">Start a new health journey</p>
                        </button>
                        <button
                            onClick={() => setIsFollowUp(true)}
                            disabled={journeys.length === 0}
                            className={`flex-1 py-3 px-4 rounded-lg border transition-all ${isFollowUp
                                ? 'bg-brand-mint/20 border-brand-mint text-brand-cream'
                                : 'bg-brand-dark/30 border-brand-cream/20 text-brand-cream/60 hover:border-brand-cream/40'
                                } ${journeys.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <p className="font-medium">Follow-up</p>
                            <p className="text-xs opacity-70">Continue existing journey</p>
                        </button>
                    </div>

                    {/* New Consultation: Reason Input */}
                    {!isFollowUp && (
                        <div>
                            <label className="block text-sm text-brand-cream/70 mb-2">
                                Reason for Consultation *
                            </label>
                            <input
                                type="text"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="e.g., Fever and headache, Annual checkup..."
                                className="w-full px-4 py-3 bg-brand-dark/50 border border-brand-cream/20 rounded-lg text-brand-cream placeholder-brand-cream/40 focus:outline-none focus:border-brand-mint"
                            />
                            <p className="text-xs text-brand-cream/40 mt-1">
                                This will be the title of your health journey
                            </p>
                        </div>
                    )}

                    {/* Follow-up: Journey Selection */}
                    {isFollowUp && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-brand-cream/70 mb-2">
                                    Select Journey to Continue
                                </label>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {journeys.map(journey => (
                                        <button
                                            key={journey.id}
                                            onClick={() => setSelectedJourneyId(journey.id)}
                                            className={`w-full p-3 rounded-lg border text-left transition-all ${selectedJourneyId === journey.id
                                                ? 'bg-brand-mint/20 border-brand-mint'
                                                : 'bg-brand-dark/30 border-brand-cream/20 hover:border-brand-cream/40'
                                                }`}
                                        >
                                            <p className="font-medium">{journey.title}</p>
                                            <p className="text-xs text-brand-cream/50">
                                                Started: {new Date(journey.created_at).toLocaleDateString('en-IN')}
                                                {journey.steps?.length && ` • ${journey.steps.length} steps`}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Grant Consent Checkbox */}
                            {selectedJourneyId && (
                                <label className="flex items-start gap-3 p-4 bg-brand-dark/30 rounded-lg border border-brand-cream/10 cursor-pointer hover:bg-brand-dark/40 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={grantConsent}
                                        onChange={(e) => setGrantConsent(e.target.checked)}
                                        className="mt-0.5 w-5 h-5 rounded border-brand-cream/30 bg-brand-dark text-brand-mint focus:ring-brand-mint"
                                    />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Shield className="w-4 h-4 text-brand-mint" />
                                            <span className="font-medium">Grant Access to Doctor</span>
                                        </div>
                                        <p className="text-xs text-brand-cream/50 mt-1">
                                            Allow this doctor's organization to view your health journey and medical history
                                        </p>
                                    </div>
                                </label>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Summary & Book */}
            {selectedDoctor && selectedDate && selectedTime && (
                <div className="bg-gradient-to-r from-brand-mint/20 to-brand-teal/20 rounded-xl p-5 border border-brand-mint/30">
                    <h2 className="font-semibold mb-4">Booking Summary</h2>
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                            <p className="text-brand-cream/60">Doctor</p>
                            <p className="font-medium">{selectedDoctor.name}</p>
                        </div>
                        <div>
                            <p className="text-brand-cream/60">Specialization</p>
                            <p className="font-medium">{selectedDoctor.specialization || 'General'}</p>
                        </div>
                        <div>
                            <p className="text-brand-cream/60">Date</p>
                            <p className="font-medium">
                                {new Date(selectedDate).toLocaleDateString('en-IN', {
                                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                                })}
                            </p>
                        </div>
                        <div>
                            <p className="text-brand-cream/60">Time</p>
                            <p className="font-medium">{selectedTime}</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-brand-mint/20">
                        <div>
                            <p className="text-brand-cream/60 text-sm">Total Amount</p>
                            <p className="text-2xl font-bold text-brand-mint">₹{Math.ceil(selectedDoctor.consultation_fee * 1.05)}</p>
                            <p className="text-xs text-brand-cream/50">Includes 5% platform fee</p>
                        </div>
                        <button
                            onClick={handleBook}
                            disabled={booking}
                            className="px-8 py-3 bg-gradient-to-r from-brand-mint to-brand-teal text-brand-dark font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                        >
                            {booking ? (
                                <RefreshCw className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <Check className="w-5 h-5" />
                                    Confirm Booking
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
