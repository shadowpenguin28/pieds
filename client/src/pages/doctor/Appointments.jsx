import { useState, useEffect } from 'react';
import { appointmentAPI } from '../../api/client';
import {
    Calendar, RefreshCw, Clock, CheckCircle, XCircle, Play,
    User, Phone, Filter, ChevronDown
} from 'lucide-react';

const STATUS_STYLES = {
    SCHEDULED: { bg: 'bg-blue-500/20', text: 'text-blue-300', icon: Clock },
    IN_PROGRESS: { bg: 'bg-yellow-500/20', text: 'text-yellow-300', icon: Play },
    COMPLETED: { bg: 'bg-green-500/20', text: 'text-green-300', icon: CheckCircle },
    CANCELLED: { bg: 'bg-red-500/20', text: 'text-red-300', icon: XCircle },
};

export default function DoctorAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL'); // ALL, SCHEDULED, COMPLETED, CANCELLED

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const res = await appointmentAPI.list();
            // Sort by date descending (newest first)
            const sorted = res.data.sort((a, b) =>
                new Date(b.scheduled_time) - new Date(a.scheduled_time)
            );
            setAppointments(sorted);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStart = async (id) => {
        try {
            await appointmentAPI.start(id);
            fetchAppointments();
        } catch (err) {
            console.error(err);
        }
    };

    const handleComplete = async (id) => {
        try {
            await appointmentAPI.complete(id);
            fetchAppointments();
        } catch (err) {
            console.error(err);
        }
    };

    const filteredAppointments = filter === 'ALL'
        ? appointments
        : appointments.filter(a => a.status === filter);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <RefreshCw className="w-8 h-8 animate-spin text-brand-mint" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">All Appointments</h1>
                <button
                    onClick={fetchAppointments}
                    className="p-2 hover:bg-brand-slate/50 rounded-lg transition-colors"
                >
                    <RefreshCw className="w-5 h-5" />
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
                {['ALL', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${filter === status
                                ? 'bg-brand-mint text-brand-dark'
                                : 'bg-brand-slate/50 text-brand-cream/70 hover:bg-brand-slate/70'
                            }`}
                    >
                        {status.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {/* Appointments List */}
            {filteredAppointments.length === 0 ? (
                <div className="text-center py-16 bg-brand-slate/50 rounded-2xl border border-brand-cream/10">
                    <Calendar className="w-12 h-12 mx-auto text-brand-cream/30 mb-4" />
                    <p className="text-brand-cream/60">No appointments found</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredAppointments.map(appt => {
                        const statusStyle = STATUS_STYLES[appt.status] || STATUS_STYLES.SCHEDULED;
                        const StatusIcon = statusStyle.icon;
                        const date = new Date(appt.scheduled_time);

                        return (
                            <div key={appt.id} className="bg-brand-slate/50 rounded-xl p-4 border border-brand-cream/10">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-brand-mint/20 flex items-center justify-center flex-shrink-0">
                                            <User className="w-6 h-6 text-brand-mint" />
                                        </div>
                                        <div>
                                            <p className="font-semibold">{appt.patient_name || 'Patient'}</p>
                                            <p className="text-sm text-brand-cream/60">
                                                {date.toLocaleDateString('en-IN', {
                                                    weekday: 'short',
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })} at {date.toLocaleTimeString('en-IN', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                            {appt.patient_phone && (
                                                <p className="text-sm text-brand-cream/50 flex items-center gap-1 mt-1">
                                                    <Phone className="w-3 h-3" />
                                                    {appt.patient_phone}
                                                </p>
                                            )}
                                            {appt.notes && (
                                                <p className="text-sm text-brand-cream/50 mt-1">{appt.notes}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusStyle.bg} ${statusStyle.text}`}>
                                            <StatusIcon className="w-3 h-3" />
                                            {appt.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                {appt.status === 'SCHEDULED' && (
                                    <div className="mt-4 pt-3 border-t border-brand-cream/10 flex gap-2">
                                        <button
                                            onClick={() => handleStart(appt.id)}
                                            className="flex-1 py-2 bg-brand-mint/20 text-brand-mint rounded-lg text-sm hover:bg-brand-mint/30 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Play className="w-4 h-4" />
                                            Start Consultation
                                        </button>
                                    </div>
                                )}

                                {appt.status === 'IN_PROGRESS' && (
                                    <div className="mt-4 pt-3 border-t border-brand-cream/10 flex gap-2">
                                        <button
                                            onClick={() => handleComplete(appt.id)}
                                            className="flex-1 py-2 bg-green-500/20 text-green-300 rounded-lg text-sm hover:bg-green-500/30 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Complete Consultation
                                        </button>
                                    </div>
                                )}

                                {appt.is_paid && (
                                    <div className="mt-2">
                                        <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded">
                                            ₹{appt.consultation_fee} Paid
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
