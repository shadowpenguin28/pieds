import { useState, useEffect } from 'react';
import { journeyAPI } from '../../api/client';
import {
    FileSearch, Search, RefreshCw, CheckCircle, Clock, XCircle,
    User, AlertCircle, FileText, ChevronRight, Eye
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

    // List of all consent requests
    const [consents, setConsents] = useState([]);
    const [consentsLoading, setConsentsLoading] = useState(true);
    const [selectedPatientAbha, setSelectedPatientAbha] = useState(null);

    // Fetch consents on mount
    useEffect(() => {
        fetchConsents();
    }, []);

    const fetchConsents = async () => {
        setConsentsLoading(true);
        try {
            const res = await journeyAPI.getDoctorConsents();
            setConsents(res.data);
        } catch (err) {
            console.error('Failed to fetch consents:', err);
        } finally {
            setConsentsLoading(false);
        }
    };

    const handleRequestAccess = async (e) => {
        e.preventDefault();
        if (!abhaId.trim()) return;

        setLoading(true);
        setError(null);
        setResult(null);
        setPatientData(null);

        try {
            const res = await journeyAPI.requestAccess(abhaId.trim(), purpose);
            console.log('Request Access Response:', res.data);
            console.log('Consent Status:', res.data.consent?.status);
            setResult(res.data);

            // If access was already granted, automatically fetch the data
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
                            placeholder="Enter ABHA ID (e.g., John_Doe.1234@crescare)"
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
                    </div>

                    {/* View Patient Data button - show when consent is granted */}
                    {result.consent?.status === 'GRANTED' && (
                        <button
                            onClick={handleViewData}
                            disabled={loadingData}
                            className="w-full mt-4 py-3 bg-gradient-to-r from-brand-mint to-brand-teal text-brand-dark font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loadingData ? (
                                <RefreshCw className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <FileText className="w-5 h-5" />
                                    View Patient Health Records
                                </>
                            )}
                        </button>
                    )}
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

            {/* Consent Requests Section */}
            <div className="bg-brand-slate/50 rounded-xl border border-brand-cream/10 overflow-hidden">
                <div className="p-4 border-b border-brand-cream/10 flex items-center justify-between">
                    <h2 className="font-semibold flex items-center gap-2">
                        <FileText className="w-5 h-5 text-brand-mint" />
                        Your Consent Requests
                    </h2>
                    <button
                        onClick={fetchConsents}
                        className="p-2 hover:bg-brand-dark/50 rounded-lg transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${consentsLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {consentsLoading ? (
                    <div className="p-8 text-center">
                        <RefreshCw className="w-6 h-6 animate-spin text-brand-mint mx-auto" />
                    </div>
                ) : consents.length === 0 ? (
                    <div className="p-8 text-center text-brand-cream/50">
                        <FileSearch className="w-10 h-10 mx-auto mb-2 opacity-50" />
                        <p>No consent requests yet</p>
                        <p className="text-xs mt-1">Use the form above to request patient records</p>
                    </div>
                ) : (
                    <div className="divide-y divide-brand-cream/10">
                        {/* Pending Requests */}
                        {consents.filter(c => c.status === 'PENDING').length > 0 && (
                            <div className="p-4">
                                <h3 className="text-sm font-medium text-yellow-400 mb-3 flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    Pending ({consents.filter(c => c.status === 'PENDING').length})
                                </h3>
                                <div className="space-y-2">
                                    {consents.filter(c => c.status === 'PENDING').map(consent => (
                                        <div key={consent.id} className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                                    <User className="w-4 h-4 text-yellow-400" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{consent.patient_name}</p>
                                                    <p className="text-xs text-brand-cream/50">Awaiting patient approval</p>
                                                </div>
                                            </div>
                                            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded-full">Pending</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Granted Requests */}
                        {consents.filter(c => c.status === 'GRANTED').length > 0 && (
                            <div className="p-4">
                                <h3 className="text-sm font-medium text-green-400 mb-3 flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" />
                                    Granted Access ({consents.filter(c => c.status === 'GRANTED').length})
                                </h3>
                                <div className="space-y-2">
                                    {consents.filter(c => c.status === 'GRANTED').map(consent => (
                                        <div key={consent.id} className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                                    <User className="w-4 h-4 text-green-400" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{consent.patient_name}</p>
                                                    <p className="text-xs text-brand-cream/50">
                                                        Granted {consent.responded_at ? new Date(consent.responded_at).toLocaleDateString('en-IN') : ''}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    // Clear previous results and fetch patient data by ABHA ID
                                                    setResult(null);
                                                    setPatientData(null);
                                                    fetchPatientData(consent.patient_abha_id);
                                                }}
                                                className="px-3 py-1.5 bg-green-500/20 text-green-300 text-sm rounded-lg hover:bg-green-500/30 transition-colors flex items-center gap-1"
                                            >
                                                <Eye className="w-4 h-4" />
                                                View Records
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Denied/Revoked Requests */}
                        {consents.filter(c => c.status === 'DENIED' || c.status === 'REVOKED').length > 0 && (
                            <div className="p-4">
                                <h3 className="text-sm font-medium text-red-400 mb-3 flex items-center gap-2">
                                    <XCircle className="w-4 h-4" />
                                    Denied/Revoked ({consents.filter(c => c.status === 'DENIED' || c.status === 'REVOKED').length})
                                </h3>
                                <div className="space-y-2">
                                    {consents.filter(c => c.status === 'DENIED' || c.status === 'REVOKED').map(consent => (
                                        <div key={consent.id} className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                                                    <User className="w-4 h-4 text-red-400" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{consent.patient_name}</p>
                                                    <p className="text-xs text-brand-cream/50">{consent.status}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
