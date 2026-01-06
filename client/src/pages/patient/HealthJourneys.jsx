import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { journeyAPI, reportAPI } from '../../api/client';
import {
    RefreshCw, FileText, ChevronDown, ChevronRight, Download,
    Stethoscope, FlaskConical, Calendar, CheckCircle, Clock, AlertCircle, CalendarPlus
} from 'lucide-react';

const STEP_TYPE_ICONS = {
    CONSULTATION: Stethoscope,
    TEST: FlaskConical,
    FOLLOWUP: Calendar,
};

const STEP_STATUS_STYLES = {
    PENDING: { bg: 'bg-yellow-500/20', text: 'text-yellow-300', icon: Clock },
    COMPLETED: { bg: 'bg-green-500/20', text: 'text-green-300', icon: CheckCircle },
    CANCELLED: { bg: 'bg-red-500/20', text: 'text-red-300', icon: AlertCircle },
};

export default function HealthJourneys() {
    const navigate = useNavigate();
    const [journeys, setJourneys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedJourney, setExpandedJourney] = useState(null);
    const [downloadingStep, setDownloadingStep] = useState(null);

    useEffect(() => {
        fetchJourneys();
    }, []);

    const fetchJourneys = async () => {
        try {
            const res = await journeyAPI.list();
            setJourneys(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleJourney = (journeyId) => {
        setExpandedJourney(expandedJourney === journeyId ? null : journeyId);
    };

    const handleDownloadReport = async (stepId) => {
        setDownloadingStep(stepId);
        try {
            const res = await reportAPI.download(stepId);
            // Create download link
            const url = res.data.file_url;
            window.open(url, '_blank');
        } catch (err) {
            console.error('Download failed:', err);
        } finally {
            setDownloadingStep(null);
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
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">My Health Journeys</h1>
                <button
                    onClick={fetchJourneys}
                    className="p-2 hover:bg-brand-slate/50 rounded-lg transition-colors"
                >
                    <RefreshCw className="w-5 h-5" />
                </button>
            </div>

            <p className="text-brand-cream/60">
                Track your medical care from diagnosis through treatment
            </p>

            {journeys.length === 0 ? (
                <div className="text-center py-16 bg-brand-slate/50 rounded-2xl border border-brand-cream/10">
                    <FileText className="w-12 h-12 mx-auto text-brand-cream/30 mb-4" />
                    <p className="text-brand-cream/60">No health journeys yet</p>
                    <p className="text-sm text-brand-cream/40 mt-1">Your journeys will appear here after doctor consultations</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {journeys.map(journey => {
                        const isExpanded = expandedJourney === journey.id;

                        return (
                            <div key={journey.id} className="bg-brand-slate/50 rounded-xl border border-brand-cream/10 overflow-hidden">
                                {/* Journey Header */}
                                <button
                                    onClick={() => toggleJourney(journey.id)}
                                    className="w-full p-5 flex items-center justify-between hover:bg-brand-dark/30 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-brand-mint/20 flex items-center justify-center">
                                            <FileText className="w-6 h-6 text-brand-mint" />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-semibold">{journey.title || `Journey #${journey.id}`}</h3>
                                            <p className="text-sm text-brand-cream/60">
                                                Started: {new Date(journey.created_at).toLocaleDateString('en-IN')}
                                                {journey.steps_count && ` • ${journey.steps_count} steps`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {journey.status === 'ACTIVE' && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/patient/appointments/book?journey_id=${journey.id}`);
                                                }}
                                                className="px-3 py-1.5 bg-brand-mint/20 text-brand-mint rounded-lg text-xs font-medium hover:bg-brand-mint/30 transition-colors flex items-center gap-1"
                                            >
                                                <CalendarPlus className="w-4 h-4" />
                                                Book Follow-up
                                            </button>
                                        )}
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${journey.status === 'ACTIVE'
                                            ? 'bg-green-500/20 text-green-300'
                                            : journey.status === 'COMPLETED'
                                                ? 'bg-blue-500/20 text-blue-300'
                                                : 'bg-gray-500/20 text-gray-300'
                                            }`}>
                                            {journey.status}
                                        </span>
                                        {isExpanded ? (
                                            <ChevronDown className="w-5 h-5 text-brand-cream/50" />
                                        ) : (
                                            <ChevronRight className="w-5 h-5 text-brand-cream/50" />
                                        )}
                                    </div>
                                </button>

                                {/* Journey Steps */}
                                {isExpanded && journey.steps && (
                                    <div className="border-t border-brand-cream/10 p-5 space-y-3">
                                        {journey.steps.length === 0 ? (
                                            <p className="text-brand-cream/50 text-center py-4">No steps in this journey yet</p>
                                        ) : (
                                            journey.steps.map((step, idx) => {
                                                const StepIcon = STEP_TYPE_ICONS[step.type] || FileText;
                                                const statusStyle = STEP_STATUS_STYLES[step.status] || STEP_STATUS_STYLES.PENDING;
                                                const StatusIcon = statusStyle.icon;

                                                // Get performer info
                                                const performedBy = step.created_by_doctor_name || step.created_by_org_name || 'Unknown';
                                                const performedDate = step.created_at ? new Date(step.created_at).toLocaleDateString('en-IN', {
                                                    day: 'numeric', month: 'short', year: 'numeric'
                                                }) : null;

                                                // Check if report exists
                                                const hasReport = step.report && step.report.file;

                                                return (
                                                    <div key={step.id} className="flex items-start gap-4 p-4 bg-brand-dark/30 rounded-lg">
                                                        <div className="flex flex-col items-center">
                                                            <div className="w-10 h-10 rounded-full bg-brand-mint/10 flex items-center justify-center">
                                                                <StepIcon className="w-5 h-5 text-brand-mint" />
                                                            </div>
                                                            {idx < journey.steps.length - 1 && (
                                                                <div className="w-0.5 h-8 bg-brand-cream/20 mt-2" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="font-medium capitalize">{step.type?.toLowerCase().replace('_', ' ')}</span>
                                                                <span className={`px-2 py-0.5 rounded-full text-xs ${statusStyle.bg} ${statusStyle.text} flex items-center gap-1`}>
                                                                    <StatusIcon className="w-3 h-3" />
                                                                    {step.status}
                                                                </span>
                                                            </div>

                                                            {/* Performer and Date */}
                                                            <div className="flex items-center gap-2 text-xs text-brand-cream/50 mb-2">
                                                                <span>By: <span className="text-brand-mint">{performedBy}</span></span>
                                                                {performedDate && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <span>{performedDate}</span>
                                                                    </>
                                                                )}
                                                            </div>

                                                            {step.notes && (
                                                                <p className="text-sm text-brand-cream/60 mb-2">{step.notes}</p>
                                                            )}

                                                            {/* Report Download */}
                                                            {hasReport && (
                                                                <a
                                                                    href={step.report.file}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-brand-mint/10 text-brand-mint rounded-lg text-sm hover:bg-brand-mint/20 transition-colors"
                                                                >
                                                                    <Download className="w-4 h-4" />
                                                                    Download Report
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
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
