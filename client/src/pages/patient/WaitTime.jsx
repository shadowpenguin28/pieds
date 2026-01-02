import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { appointmentAPI } from '../../api/client';
import {
    Clock, Users, Calendar, TrendingUp, RefreshCw, ArrowLeft,
    AlertCircle, CheckCircle, User
} from 'lucide-react';

export default function WaitTime() {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const [waitData, setWaitData] = useState(null);
    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchWaitTime = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await appointmentAPI.getWaitTime(appointmentId);
            setWaitData(res.data);

            // Also fetch appointment details
            const apptRes = await appointmentAPI.get(appointmentId);
            setAppointment(apptRes.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch wait time');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWaitTime();
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchWaitTime, 30000);
        return () => clearInterval(interval);
    }, [appointmentId]);

    if (loading && !waitData) {
        return (
            <div className="flex items-center justify-center py-20">
                <RefreshCw className="w-8 h-8 animate-spin text-brand-mint" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <button
                    onClick={() => navigate('/patient/appointments')}
                    className="flex items-center gap-2 text-brand-cream/70 hover:text-brand-cream"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Appointments
                </button>
                <div className="p-6 bg-brand-red/20 border border-brand-red/30 rounded-xl text-brand-red flex items-center gap-3">
                    <AlertCircle className="w-6 h-6" />
                    {error}
                </div>
            </div>
        );
    }

    const isInProgress = waitData?.current_status === 'in_progress';
    const isCompleted = waitData?.current_status === 'completed';
    const isWaiting = waitData?.current_status === 'waiting';

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/patient/appointments')}
                    className="flex items-center gap-2 text-brand-cream/70 hover:text-brand-cream"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Appointments
                </button>
                <button
                    onClick={fetchWaitTime}
                    disabled={loading}
                    className="p-2 hover:bg-brand-slate/50 rounded-lg transition-colors"
                >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Status Banner */}
            {isInProgress && (
                <div className="p-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20rounded-xl border border-yellow-500/30">
                    <div className="flex items-center gap-3 text-yellow-300">
                        <CheckCircle className="w-6 h-6" />
                        <div>
                            <h3 className="font-semibold text-lg">Your Consultation is In Progress</h3>
                            <p className="text-sm text-brand-cream/70 mt-1">{waitData.message}</p>
                        </div>
                    </div>
                </div>
            )}

            {isCompleted && (
                <div className="p-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30">
                    <div className="flex items-center gap-3 text-green-300">
                        <CheckCircle className="w-6 h-6" />
                        <div>
                            <h3 className="font-semibold text-lg">Consultation Completed</h3>
                            <p className="text-sm text-brand-cream/70 mt-1">Your appointment has been completed.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Appointment Info */}
            {appointment && (
                <div className="bg-brand-slate/50 rounded-xl p-6 border border-brand-cream/10">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-full bg-brand-mint/20 flex items-center justify-center">
                            <User className="w-7 h-7 text-brand-mint" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{appointment.doctor_name || `Doctor #${appointment.doctor}`}</h2>
                            <p className="text-brand-cream/60">{appointment.specialization || 'General'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-brand-cream/70">
                        <Calendar className="w-4 h-4" />
                        <span>
                            {new Date(appointment.scheduled_time).toLocaleDateString('en-IN', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            })}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-brand-cream/70 mt-2">
                        <Clock className="w-4 h-4" />
                        <span>
                            {new Date(appointment.scheduled_time).toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </span>
                    </div>
                </div>
            )}

            {/* Queue Position & Wait Time */}
            {isWaiting && waitData && (
                <>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-brand-slate/50 rounded-xl p-6 border border-brand-cream/10">
                            <div className="flex items-center gap-2 text-brand-cream/60 mb-2">
                                <Users className="w-5 h-5" />
                                <span className="text-sm">Queue Position</span>
                            </div>
                            <p className="text-4xl font-bold text-brand-mint">#{waitData.queue_position}</p>
                            <p className="text-sm text-brand-cream/60 mt-1">
                                {waitData.people_ahead} {waitData.people_ahead === 1 ? 'person' : 'people'} ahead
                            </p>
                        </div>

                        <div className="bg-brand-slate/50 rounded-xl p-6 border border-brand-cream/10">
                            <div className="flex items-center gap-2 text-brand-cream/60 mb-2">
                                <Clock className="w-5 h-5" />
                                <span className="text-sm">Est. Wait Time</span>
                            </div>
                            <p className="text-4xl font-bold text-brand-mint">
                                {Math.round(waitData.estimated_wait_minutes)}
                                <span className="text-xl text-brand-cream/60 ml-1">min</span>
                            </p>
                            {waitData.estimated_wait_minutes === 0 ? (
                                <p className="text-sm text-green-400 mt-1 flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" />
                                    On time! Feel free to arrive early
                                </p>
                            ) : waitData.delay_minutes > 0 && (
                                <p className="text-sm text-yellow-400 mt-1">
                                    ~{Math.round(waitData.delay_minutes)} min delay
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="bg-brand-slate/50 rounded-xl p-6 border border-brand-cream/10">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-brand-mint" />
                            Estimated Start Time
                        </h3>
                        <p className="text-2xl font-bold text-brand-cream">
                            {waitData.predicted_start_time
                                ? new Date(waitData.predicted_start_time).toLocaleTimeString('en-IN', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })
                                : 'Calculating...'}
                        </p>
                        <p className="text-sm text-brand-cream/60 mt-2">
                            Avg. consultation time: {Math.round(waitData.avg_consultation_minutes)} min
                        </p>
                    </div>

                    {/* Live Updates Info */}
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-300 text-sm">
                        <p className="flex items-center gap-2">
                            <RefreshCw className="w-4 h-4" />
                            Updates automatically every 30 seconds
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}
