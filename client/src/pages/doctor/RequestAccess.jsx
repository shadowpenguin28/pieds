import { useState, useEffect } from 'react';
import { journeyAPI } from '../../api/client';
import {
    FileSearch, Search, RefreshCw, CheckCircle, Clock, XCircle,
    User, AlertCircle, FileText, ChevronRight
} from 'lucide-react';

const STATUS_STYLES = {
    PENDING: { bg: 'bg-yellow-500/20', text: 'text-yellow-300', icon: Clock },
    GRANTED: { bg: 'bg-green-500/20', text: 'text-green-300', icon: CheckCircle },
    DENIED: { bg: 'bg-red-500/20', text: 'text-red-300', icon: XCircle },
    REVOKED: { bg: 'bg-gray-500/20', text: 'text-gray-300', icon: XCircle },
};

export default function RequestAccess() {
    const [abhaId, setAbhaId] = useState('');
    const [purpose, setPurpose] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    // For viewing patient data if already granted
    const [patientData, setPatientData] = useState(null);
    const [loadingData, setLoadingData] = useState(false);

    const handleRequestAccess = async (e) => {
        e.preventDefault();
        if (!abhaId.trim()) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await journeyAPI.requestAccess(abhaId.trim(), purpose);
            setResult(res.data);

            // If access was already granted, fetch the data
            if (res.data.consent?.status === 'GRANTED') {
                fetchPatientData(abhaId.trim());
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to request access');
        } finally {
            setLoading(false);
        }
    };

    const fetchPatientData = async (id) => {
        setLoadingData(true);
        try {
            const res = await journeyAPI.getByAbha(id);
            setPatientData(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingData(false);
        }
    };

    const handleViewData = () => {
        if (abhaId.trim()) {
            fetchPatientData(abhaId.trim());
        }
    };

    const resetForm = () => {
        setAbhaId('');
        setPurpose('');
        setResult(null);
        setError(null);
        setPatientData(null);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Request Patient Records</h1>

            {/* Request Form */}
            <div className="bg-brand-slate/50 rounded-xl p-6 border border-brand-cream/10">
                <div className="flex items-center gap-3 mb-4">
                    <FileSearch className="w-6 h-6 text-brand-mint" />
                    <h2 className="font-semibold">Request Access by ABHA ID</h2>
                </div>

                <p className="text-sm text-brand-cream/60 mb-4">
                    Enter the patient's ABHA ID to request access to their health records.
                    The patient will receive a notification and must approve your request.
                </p>

                <form onSubmit={handleRequestAccess} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-brand-cream/80 mb-2">
                            Patient ABHA ID
                        </label>
                        <input
                            type="text"
                            value={abhaId}
                            onChange={(e) => setAbhaId(e.target.value)}
                            placeholder="Enter ABHA ID (e.g., John_Doe.1234@crescere)"
                            className="w-full px-4 py-3 bg-brand-dark/50 border border-brand-cream/20 rounded-xl text-brand-cream placeholder-brand-cream/40 focus:outline-none focus:border-brand-mint"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-brand-cream/80 mb-2">
                            Purpose (Optional)
                        </label>
                        <textarea
                            value={purpose}
                            onChange={(e) => setPurpose(e.target.value)}
                            placeholder="Reason for requesting access (e.g., Follow-up consultation)"
                            rows={2}
                            className="w-full px-4 py-3 bg-brand-dark/50 border border-brand-cream/20 rounded-xl text-brand-cream placeholder-brand-cream/40 focus:outline-none focus:border-brand-mint resize-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !abhaId.trim()}
                        className="w-full py-3 bg-gradient-to-r from-brand-mint to-brand-teal text-brand-dark font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <Search className="w-5 h-5" />
                                Request Access
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Error */}
            {error && (
                <div className="p-4 bg-brand-red/20 border border-brand-red/30 rounded-xl text-brand-red flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    {error}
                </div>
            )}

            {/* Result */}
            {result && (
                <div className="bg-brand-slate/50 rounded-xl p-6 border border-brand-cream/10">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">Request Status</h3>
                        <button
                            onClick={resetForm}
                            className="text-sm text-brand-cream/60 hover:text-brand-cream"
                        >
                            New Request
                        </button>
                    </div>

                    <div className="p-4 bg-brand-dark/30 rounded-lg">
                        <p className="text-brand-cream/80 mb-2">{result.message}</p>

                        {result.consent && (
                            <div className="flex items-center gap-2 mt-2">
                                {(() => {
                                    const style = STATUS_STYLES[result.consent.status] || STATUS_STYLES.PENDING;
                                    const Icon = style.icon;
                                    return (
                                        <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${style.bg} ${style.text}`}>
                                            <Icon className="w-4 h-4" />
                                            {result.consent.status}
                                        </span>
                                    );
                                })()}
                            </div>
                        )}

                        {result.consent?.status === 'GRANTED' && !patientData && (
                            <button
                                onClick={handleViewData}
                                disabled={loadingData}
                                className="mt-4 px-4 py-2 bg-brand-mint/20 text-brand-mint rounded-lg hover:bg-brand-mint/30 transition-colors flex items-center gap-2"
                            >
                                {loadingData ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <FileText className="w-4 h-4" />
                                        View Patient Data
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Patient Data */}
            {patientData && (
                <div className="bg-brand-slate/50 rounded-xl border border-brand-cream/10 overflow-hidden">
                    <div className="p-4 bg-green-500/20 border-b border-green-500/30 flex items-center gap-2 text-green-300">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Access Granted - Patient Records</span>
                    </div>

                    <div className="p-6">
                        {/* Patient Info */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 rounded-full bg-brand-mint/20 flex items-center justify-center">
                                <User className="w-7 h-7 text-brand-mint" />
                            </div>
                            <div>
                                <p className="text-lg font-semibold">{patientData.patient_name}</p>
                                <p className="text-sm text-brand-cream/60">ABHA: {patientData.patient_abha_id}</p>
                            </div>
                        </div>

                        {/* Journeys */}
                        <h4 className="font-medium mb-3">Health Journeys</h4>
                        {patientData.journeys?.length === 0 ? (
                            <p className="text-brand-cream/50 text-center py-4">No health journeys found</p>
                        ) : (
                            <div className="space-y-3">
                                {patientData.journeys?.map(journey => (
                                    <div key={journey.id} className="border border-brand-cream/10 rounded-lg overflow-hidden">
                                        <div className="px-4 py-3 bg-brand-dark/30 flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">{journey.title || `Journey #${journey.id}`}</p>
                                                <p className="text-xs text-brand-cream/50">
                                                    {new Date(journey.created_at).toLocaleDateString('en-IN')}
                                                </p>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-full text-xs ${journey.status === 'ACTIVE'
                                                ? 'bg-green-500/20 text-green-300'
                                                : 'bg-gray-500/20 text-gray-300'
                                                }`}>
                                                {journey.status}
                                            </span>
                                        </div>

                                        {journey.steps?.length > 0 && (
                                            <div className="p-3 space-y-2">
                                                {journey.steps.map(step => (
                                                    <div key={step.id} className="flex items-center gap-2 text-sm text-brand-cream/70">
                                                        <ChevronRight className="w-4 h-4 text-brand-cream/40" />
                                                        <span className="capitalize">{step.type?.toLowerCase()}</span>
                                                        {step.notes && (
                                                            <span className="text-brand-cream/50">- {step.notes}</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
