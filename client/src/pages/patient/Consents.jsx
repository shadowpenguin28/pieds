import { useState, useEffect } from 'react';
import { journeyAPI } from '../../api/client';
import {
    RefreshCw, Shield, Check, X, Clock, User, Eye, FileText,
    CheckCircle, XCircle, AlertCircle
} from 'lucide-react';

const STATUS_STYLES = {
    PENDING: { bg: 'bg-yellow-500/20', text: 'text-yellow-300', label: 'Pending' },
    APPROVED: { bg: 'bg-green-500/20', text: 'text-green-300', label: 'Approved' },
    GRANTED: { bg: 'bg-green-500/20', text: 'text-green-300', label: 'Granted' },
    REJECTED: { bg: 'bg-red-500/20', text: 'text-red-300', label: 'Rejected' },
    DENIED: { bg: 'bg-red-500/20', text: 'text-red-300', label: 'Denied' },
    REVOKED: { bg: 'bg-gray-500/20', text: 'text-gray-400', label: 'Revoked' },
    EXPIRED: { bg: 'bg-gray-500/20', text: 'text-gray-400', label: 'Expired' },
};

export default function Consents() {
    const [consents, setConsents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [responding, setResponding] = useState(null);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchConsents();
    }, []);

    const fetchConsents = async () => {
        try {
            const res = await journeyAPI.getConsents();
            setConsents(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRespond = async (consentId, status) => {
        setResponding(consentId);
        setMessage(null);

        try {
            await journeyAPI.respondConsent(consentId, status);
            setMessage({
                type: 'success',
                text: `Consent ${status === 'GRANTED' ? 'granted' : 'denied'} successfully`
            });
            fetchConsents();
        } catch (err) {
            setMessage({
                type: 'error',
                text: err.response?.data?.error || 'Failed to respond to consent'
            });
        } finally {
            setResponding(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <RefreshCw className="w-8 h-8 animate-spin text-brand-mint" />
            </div>
        );
    }

    const pendingConsents = consents.filter(c => c.status === 'PENDING');
    const pastConsents = consents.filter(c => c.status !== 'PENDING');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Consent Management</h1>
                <button
                    onClick={fetchConsents}
                    className="p-2 hover:bg-brand-slate/50 rounded-lg transition-colors"
                >
                    <RefreshCw className="w-5 h-5" />
                </button>
            </div>

            <p className="text-brand-cream/60">
                Control who can access your health records
            </p>

            {/* Grant Consent Button */}
            <div className="bg-brand-slate/50 rounded-xl p-4 border border-brand-cream/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-mint/20 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-brand-mint" />
                    </div>
                    <div>
                        <p className="font-medium">Grant New Consent</p>
                        <p className="text-xs text-brand-cream/50">Allow a healthcare provider to access your records</p>
                    </div>
                </div>
                <button
                    onClick={() => setMessage({ type: 'info', text: 'Ask your doctor to request access using your ABHA ID' })}
                    className="px-4 py-2 bg-brand-mint/20 text-brand-mint border border-brand-mint/30 rounded-lg hover:bg-brand-mint/30 transition-colors text-sm font-medium"
                >
                    How to Grant
                </button>
            </div>

            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-2 ${message.type === 'success'
                    ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                    : message.type === 'info'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-brand-red/20 text-brand-red border border-brand-red/30'
                    }`}>
                    {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    {message.text}
                </div>
            )}

            {/* Pending Requests */}
            {pendingConsents.length > 0 && (
                <div className="space-y-4">
                    <h2 className="font-semibold text-lg flex items-center gap-2">
                        <Clock className="w-5 h-5 text-yellow-400" />
                        Pending Requests ({pendingConsents.length})
                    </h2>

                    {pendingConsents.map(consent => (
                        <div key={consent.id} className="bg-brand-slate/50 rounded-xl p-5 border border-yellow-500/30">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                        <User className="w-6 h-6 text-yellow-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{consent.requesting_org_name || 'Healthcare Provider'}</h3>
                                        <p className="text-sm text-brand-cream/60">{consent.requesting_doctor_name || 'Doctor'}</p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300">
                                    Pending
                                </span>
                            </div>

                            <div className="mb-4 p-3 bg-brand-dark/50 rounded-lg">
                                <p className="text-sm text-brand-cream/70 mb-1">Purpose:</p>
                                <p className="text-sm">{consent.purpose || 'Access to your health records'}</p>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-brand-cream/50 mb-4">
                                <Clock className="w-3 h-3" />
                                Requested: {consent.requested_at ? new Date(consent.requested_at).toLocaleString('en-IN') : 'Unknown'}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleRespond(consent.id, 'GRANTED')}
                                    disabled={responding === consent.id}
                                    className="flex-1 py-2.5 bg-gradient-to-r from-brand-mint to-brand-teal text-brand-dark font-semibold rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                                >
                                    {responding === consent.id ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Check className="w-4 h-4" />
                                            Grant Access
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => handleRespond(consent.id, 'DENIED')}
                                    disabled={responding === consent.id}
                                    className="flex-1 py-2.5 bg-brand-red/20 text-brand-red border border-brand-red/30 font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-brand-red/30 transition-colors disabled:opacity-50"
                                >
                                    <X className="w-4 h-4" />
                                    Deny
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Past Consents */}
            <div className="space-y-4">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                    <Shield className="w-5 h-5 text-brand-mint" />
                    Consent History
                </h2>

                {pastConsents.length === 0 && pendingConsents.length === 0 ? (
                    <div className="text-center py-16 bg-brand-slate/50 rounded-2xl border border-brand-cream/10">
                        <Shield className="w-12 h-12 mx-auto text-brand-cream/30 mb-4" />
                        <p className="text-brand-cream/60">No consent requests yet</p>
                        <p className="text-sm text-brand-cream/40 mt-1">Requests from doctors will appear here</p>
                    </div>
                ) : pastConsents.length === 0 ? (
                    <p className="text-brand-cream/50 text-center py-4">No past consent records</p>
                ) : (
                    <div className="space-y-2">
                        {pastConsents.map(consent => {
                            const status = STATUS_STYLES[consent.status] || STATUS_STYLES.PENDING;

                            return (
                                <div key={consent.id} className="bg-brand-slate/50 rounded-xl p-4 border border-brand-cream/10">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-brand-dark/50 flex items-center justify-center">
                                                <User className="w-5 h-5 text-brand-cream/60" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{consent.requesting_org_name || 'Healthcare Provider'}</p>
                                                <p className="text-xs text-brand-cream/50">
                                                    {consent.requested_at ? new Date(consent.requested_at).toLocaleDateString('en-IN') : 'Unknown'}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                                            {status.label}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
