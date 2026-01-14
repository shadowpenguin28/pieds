import { useState, useEffect } from 'react';
import { walletAPI } from '../../api/client';
import {
    Wallet, Plus, ArrowUpRight, ArrowDownLeft, RefreshCw,
    TrendingUp, Clock, CheckCircle
} from 'lucide-react';

export default function PatientWallet() {
    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [topUpAmount, setTopUpAmount] = useState('');
    const [topUpLoading, setTopUpLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const fetchData = async () => {
        try {
            const [walletRes, txRes] = await Promise.all([
                walletAPI.getBalance(),
                walletAPI.getTransactions()
            ]);
            setWallet(walletRes.data);
            setTransactions(txRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleTopUp = async (e) => {
        e.preventDefault();
        if (!topUpAmount || topUpAmount <= 0) return;

        setTopUpLoading(true);
        setMessage(null);

        try {
            const res = await walletAPI.topUp(parseFloat(topUpAmount));
            setMessage({ type: 'success', text: res.data.message });
            setTopUpAmount('');
            fetchData();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Top-up failed' });
        } finally {
            setTopUpLoading(false);
        }
    };

    const getTransactionIcon = (type, reason) => {
        if (type === 'CREDIT') return <ArrowDownLeft className="w-4 h-4 text-green-400" />;
        return <ArrowUpRight className="w-4 h-4 text-brand-red" />;
    };

    const getReasonLabel = (reason) => {
        const labels = {
            'TOP_UP': 'Wallet Top Up',
            'PAYMENT_DONE': 'Appointment Payment',
            'PAYMENT_RECEIVED': 'Payment Received',
            'REFUND': 'Refund',
            'WITHDRAWAL': 'Withdrawal'
        };
        return labels[reason] || reason;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <RefreshCw className="w-8 h-8 animate-spin text-brand-mint" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">My Wallet</h1>

            {/* Balance Card */}
            <div className="bg-gradient-to-br from-brand-mint/20 to-brand-teal/20 rounded-2xl p-6 border border-brand-mint/30">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-brand-cream/60 text-sm">Available Balance</p>
                        <p className="text-4xl font-bold mt-1">₹{wallet?.balance || '0.00'}</p>
                    </div>
                    <div className="w-14 h-14 rounded-full bg-brand-mint/20 flex items-center justify-center">
                        <Wallet className="w-7 h-7 text-brand-mint" />
                    </div>
                </div>
            </div>

            {/* Top Up Form */}
            <div className="bg-brand-slate/50 rounded-xl p-5 border border-brand-cream/10">
                <h2 className="font-semibold mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-brand-mint" />
                    Add Money
                </h2>

                {message && (
                    <div className={`p-3 rounded-lg mb-4 text-sm ${message.type === 'success'
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                        : 'bg-brand-red/20 text-brand-red border border-brand-red/30'
                        }`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleTopUp} className="flex gap-3">
                    <div className="flex-1 relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-cream/50">₹</span>
                        <input
                            type="number"
                            value={topUpAmount}
                            onChange={(e) => setTopUpAmount(e.target.value)}
                            placeholder="Enter amount"
                            min="1"
                            className="w-full pl-8 pr-4 py-3 bg-brand-dark/50 border border-brand-cream/20 rounded-xl text-brand-cream placeholder-brand-cream/40 focus:outline-none focus:border-brand-mint"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={topUpLoading || !topUpAmount}
                        className="px-6 py-3 bg-gradient-to-r from-brand-mint to-brand-teal text-brand-dark font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                    >
                        {topUpLoading ? (
                            <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <Plus className="w-5 h-5" />
                                Add
                            </>
                        )}
                    </button>
                </form>

                <div className="flex gap-2 mt-3">
                    {[100, 500, 1000].map(amount => (
                        <button
                            key={amount}
                            type="button"
                            onClick={() => setTopUpAmount(amount.toString())}
                            className="px-4 py-2 bg-brand-dark/50 border border-brand-cream/20 rounded-lg text-sm hover:border-brand-mint transition-colors"
                        >
                            ₹{amount}
                        </button>
                    ))}
                </div>
            </div>

            {/* Transaction History */}
            <div className="bg-brand-slate/50 rounded-xl p-5 border border-brand-cream/10">
                <h2 className="font-semibold mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-brand-cream/60" />
                    Transaction History
                </h2>

                {transactions.length === 0 ? (
                    <p className="text-brand-cream/50 text-center py-8">No transactions yet</p>
                ) : (
                    <div className="space-y-3">
                        {transactions.map(tx => (
                            <div key={tx.id} className="flex items-center justify-between p-3 bg-brand-dark/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'CREDIT' ? 'bg-green-500/20' : 'bg-brand-red/20'
                                        }`}>
                                        {getTransactionIcon(tx.type, tx.reason)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{getReasonLabel(tx.reason)}</p>
                                        <p className="text-xs text-brand-cream/50">
                                            {new Date(tx.created_at).toLocaleDateString('en-IN', {
                                                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <span className={`font-semibold ${tx.type === 'CREDIT' ? 'text-green-400' : 'text-brand-red'
                                    }`}>
                                    {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
