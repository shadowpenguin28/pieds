import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentAPI, walletAPI } from '../../api/client';
import {
    Calendar, Clock, User, RefreshCw, MapPin, CreditCard,
    Play, CheckCircle, XCircle, AlertCircle, Plus
} from 'lucide-react';

const STATUS_STYLES = {
    SCHEDULED: { bg: 'bg-blue-500/20', text: 'text-blue-300', label: 'Scheduled' },
    IN_PROGRESS: { bg: 'bg-yellow-500/20', text: 'text-yellow-300', label: 'In Progress' },
    COMPLETED: { bg: 'bg-green-500/20', text: 'text-green-300', label: 'Completed' },
    CANCELLED: { bg: 'bg-red-500/20', text: 'text-red-300', label: 'Cancelled' },
};



export default function PatientAppointments() {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [payingId, setPayingId] = useState(null);
    const [message, setMessage] = useState(null);
    const [showAll, setShowAll] = useState(false);

    const [cancelTarget, setCancelTarget] = useState(null);

    const INITIAL_DISPLAY_COUNT = 3;

    const fetchAppointments = async () => {
        try {
            const res = await appointmentAPI.list();
            // Separate upcoming and past appointments
            const now = new Date();
            const upcoming = res.data.filter(a => new Date(a.scheduled_time) >= now && a.status === 'SCHEDULED');
            const others = res.data.filter(a => new Date(a.scheduled_time) < now || a.status !== 'SCHEDULED');

            // Sort upcoming by closest first (ascending), others by most recent first (descending)
            upcoming.sort((a, b) => new Date(a.scheduled_time) - new Date(b.scheduled_time));
            others.sort((a, b) => new Date(b.scheduled_time) - new Date(a.scheduled_time));

            // Combine: upcoming first, then past
            setAppointments([...upcoming, ...others]);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const handlePay = async (appointmentId, amount) => {
        setPayingId(appointmentId);
        setMessage(null);

        try {
            await walletAPI.payForAppointment(appointmentId);
            setMessage({ type: 'success', text: `Payment of ₹${amount} successful!` });
            fetchAppointments();
        } catch (err) {
            setMessage({
                type: 'error',
                text: err.response?.data?.error || 'Payment failed'
            });
        } finally {
            setPayingId(null);
        }
    };

    const requestCancel = (appointmentId) => {
        setCancelTarget(appointmentId);
    };

    const confirmCancel = async () => {
        try {
            await appointmentAPI.cancel(cancelTarget);
            setMessage({ type: 'success', text: 'Appointment cancelled' });
            fetchAppointments();
        } catch (err) {
            setMessage({
                type: 'error',
                text: err.response?.data?.error || 'Cancellation failed'
            });
        } finally {
            setCancelTarget(null);
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
        <div className="min-h-[60vh] flex flex-col justify-center space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">My Appointments</h1>
                <button
                    onClick={() => navigate('/patient/appointments/book')}
                    className="px-4 py-2 bg-gradient-to-r from-brand-mint to-brand-teal text-brand-dark font-semibold rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Book New
                </button>
            </div>

            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-2 ${message.type === 'success'
                    ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                    : 'bg-brand-red/20 text-brand-red border border-brand-red/30'
                    }`}>
                    {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    {message.text}
                </div>
            )}

            {appointments.length === 0 ? (
                <div className="text-center py-16 bg-brand-slate/50 rounded-2xl border border-brand-cream/10">
                    <Calendar className="w-12 h-12 mx-auto text-brand-cream/30 mb-4" />
                    <p className="text-brand-cream/60">No appointments yet</p>
                    <p className="text-sm text-brand-cream/40 mt-1">Book an appointment to get started</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {(showAll ? appointments : appointments.slice(0, INITIAL_DISPLAY_COUNT)).map(appt => {
                        const status = STATUS_STYLES[appt.status] || STATUS_STYLES.SCHEDULED;
                        const isPaid = appt.is_paid;
                        const canPay = appt.status === 'SCHEDULED' && !isPaid;
                        const canCancel = appt.status === 'SCHEDULED';

                        return (
                            <div key={appt.id} className="bg-brand-slate/50 rounded-xl p-5 border border-brand-cream/10">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-brand-mint/20 flex items-center justify-center">
                                            <User className="w-6 h-6 text-brand-mint" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{appt.doctor_name || `Doctor #${appt.doctor}`}</h3>
                                            <p className="text-sm text-brand-cream/60">{appt.specialization || 'General'}</p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                                        {status.label}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                    <div className="flex items-center gap-2 text-brand-cream/70">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(appt.scheduled_time).toLocaleDateString('en-IN', {
                                            weekday: 'short', day: 'numeric', month: 'short'
                                        })}
                                    </div>
                                    <div className="flex items-center gap-2 text-brand-cream/70">
                                        <Clock className="w-4 h-4" />
                                        {new Date(appt.scheduled_time).toLocaleTimeString('en-IN', {
                                            hour: '2-digit', minute: '2-digit'
                                        })}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-3 pt-4 border-t border-brand-cream/10">
                                    {canPay && (
                                        <button
                                            onClick={() => handlePay(appt.id, appt.consultation_fee || 200)}
                                            disabled={payingId === appt.id}
                                            className="flex-1 py-2.5 bg-gradient-to-r from-brand-mint to-brand-teal text-brand-dark font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {payingId === appt.id ? (
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <CreditCard className="w-4 h-4" />
                                                    Pay ₹{Math.ceil((appt.consultation_fee || 200) * 1.05)}
                                                </>
                                            )}
                                        </button>
                                    )}

                                    {isPaid && appt.status === 'SCHEDULED' && (
                                        <span className="flex-1 py-2.5 bg-green-500/20 text-green-300 font-medium rounded-lg text-center flex items-center justify-center gap-2">
                                            <CheckCircle className="w-4 h-4" />
                                            Paid
                                        </span>
                                    )}

                                    {canCancel && (
                                        <button
                                            onClick={() => requestCancel(appt.id)}
                                            className="px-4 py-2.5 bg-brand-red/20 text-brand-red border border-brand-red/30 rounded-lg hover:bg-brand-red/30 transition-colors"
                                        >
                                            <XCircle className="w-4 h-4" />
                                        </button>
                                    )}


                                    {appt.status === 'SCHEDULED' && (
                                        <button
                                            onClick={() => navigate(`/patient/wait-time/${appt.id}`)}
                                            className="px-4 py-2.5 bg-brand-dark/50 border border-brand-cream/20 rounded-lg hover:border-brand-mint transition-colors"
                                        >
                                            <Clock className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );

                    })}

                    {/* View All / Show Less button */}
                    {appointments.length > INITIAL_DISPLAY_COUNT && (
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className="w-full py-3 mt-2 bg-brand-slate/50 border border-brand-cream/10 rounded-xl text-brand-cream/70 hover:text-brand-mint hover:border-brand-mint/30 transition-colors font-medium"
                        >
                            {showAll ? 'Show Less' : `View All (${appointments.length} appointments)`}
                        </button>
                    )}
                </div>
            )}
            {/* Cancel Confirmation Modal */}
            {cancelTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-brand-dark rounded-xl p-6 w-full max-w-sm border border-brand-cream/20">
                        <h3 className="text-lg font-semibold mb-2">
                            Cancel Appointment?
                        </h3>
                        <p className="text-sm text-brand-cream/70 mb-6">
                            This action cannot be undone.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setCancelTarget(null)}
                                className="flex-1 py-2 rounded-lg border border-brand-cream/20 hover:bg-brand-slate/50"
                            >
                                No
                            </button>
                            <button
                                onClick={confirmCancel}
                                className="flex-1 py-2 rounded-lg bg-brand-red text-white hover:opacity-90"
                            >
                                Yes, Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>


    );

}
