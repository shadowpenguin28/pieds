import { useState, useEffect } from 'react';
import { appointmentAPI } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import {
    Users, Clock, Play, CheckCircle, RefreshCw, User, Calendar
} from 'lucide-react';

export default function DoctorQueue() {
    const { user } = useAuth();
    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [message, setMessage] = useState(null);

    const fetchQueue = async () => {
        try {
            // For now, fetch all appointments - in production would filter by doctor ID
            const res = await appointmentAPI.list();
            // Filter to today's scheduled/in-progress appointments
            const today = new Date().toDateString();
            const filtered = res.data.filter(appt =>
                new Date(appt.scheduled_time).toDateString() === today &&
                ['SCHEDULED', 'IN_PROGRESS'].includes(appt.status)
            ).sort((a, b) => new Date(a.scheduled_time) - new Date(b.scheduled_time));
            setQueue(filtered);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQueue();
        // Refresh every 30 seconds
        const interval = setInterval(fetchQueue, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleStart = async (id) => {
        setActionLoading(id);
        setMessage(null);
        try {
            await appointmentAPI.start(id);
            setMessage({ type: 'success', text: 'Consultation started' });
            fetchQueue();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to start' });
        } finally {
            setActionLoading(null);
        }
    };

    const handleComplete = async (id) => {
        setActionLoading(id);
        setMessage(null);
        try {
            await appointmentAPI.complete(id);
            setMessage({ type: 'success', text: 'Consultation completed' });
            fetchQueue();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to complete' });
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <RefreshCw className="w-8 h-8 animate-spin text-brand-mint" />
            </div>
        );
    }

    const inProgress = queue.find(a => a.status === 'IN_PROGRESS');
    const waiting = queue.filter(a => a.status === 'SCHEDULED');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Today's Queue</h1>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-brand-cream/60">
                        {queue.length} patient{queue.length !== 1 ? 's' : ''}
                    </span>
                    <button
                        onClick={fetchQueue}
                        className="p-2 hover:bg-brand-slate/50 rounded-lg transition-colors"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-2 ${message.type === 'success'
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                        : 'bg-brand-red/20 text-brand-red border border-brand-red/30'
                    }`}>
                    {message.text}
                </div>
            )}

            {/* Current Patient */}
            {inProgress && (
                <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl p-6 border border-yellow-500/30">
                    <div className="flex items-center gap-2 text-yellow-300 text-sm font-medium mb-4">
                        <Play className="w-4 h-4" />
                        Currently Consulting
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                <User className="w-7 h-7 text-yellow-300" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">{inProgress.patient_name || `Patient #${inProgress.patient}`}</h3>
                                <p className="text-sm text-brand-cream/60">
                                    Started at {new Date(inProgress.actual_start_time).toLocaleTimeString('en-IN', {
                                        hour: '2-digit', minute: '2-digit'
                                    })}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleComplete(inProgress.id)}
                            disabled={actionLoading === inProgress.id}
                            className="px-5 py-2.5 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {actionLoading === inProgress.id ? (
                                <RefreshCw className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    Complete
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Waiting Queue */}
            <div className="bg-brand-slate/50 rounded-xl border border-brand-cream/10">
                <div className="p-4 border-b border-brand-cream/10 flex items-center gap-2">
                    <Users className="w-5 h-5 text-brand-cream/60" />
                    <h2 className="font-semibold">Waiting ({waiting.length})</h2>
                </div>

                {waiting.length === 0 ? (
                    <div className="p-8 text-center text-brand-cream/50">
                        <Users className="w-10 h-10 mx-auto mb-3 opacity-50" />
                        <p>No patients waiting</p>
                    </div>
                ) : (
                    <div className="divide-y divide-brand-cream/10">
                        {waiting.map((appt, index) => (
                            <div key={appt.id} className="p-4 flex items-center justify-between hover:bg-brand-dark/30 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-brand-mint/20 flex items-center justify-center text-sm font-bold text-brand-mint">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <h3 className="font-medium">{appt.patient_name || `Patient #${appt.patient}`}</h3>
                                        <div className="flex items-center gap-3 text-sm text-brand-cream/60">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(appt.scheduled_time).toLocaleTimeString('en-IN', {
                                                    hour: '2-digit', minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {!inProgress && index === 0 && (
                                    <button
                                        onClick={() => handleStart(appt.id)}
                                        disabled={actionLoading === appt.id}
                                        className="px-4 py-2 bg-gradient-to-r from-brand-mint to-brand-teal text-brand-dark font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {actionLoading === appt.id ? (
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Play className="w-4 h-4" />
                                                Start
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
