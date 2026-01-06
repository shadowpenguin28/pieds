import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { walletAPI, appointmentAPI, qrAPI } from '../../api/client';
import { QRCodeSVG } from 'qrcode.react';
import {
    Home, Calendar, Clock, FileText, Shield, Wallet, QrCode,
    Plus, ChevronRight, RefreshCw, User, Copy, Check, Settings
} from 'lucide-react';

// Import sub-pages
import PatientWallet from './Wallet';
import PatientAppointments from './Appointments';
import BookAppointment from './BookAppointment';
import HealthJourneys from './HealthJourneys';
import Consents from './Consents';
import Profile from '../shared/Profile';
import WaitTime from './WaitTime';

// Sub-pages (inline for now)
function Overview() {
    const { user } = useAuth();
    const [wallet, setWallet] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [walletRes, apptRes] = await Promise.all([
                    walletAPI.getBalance(),
                    appointmentAPI.list()
                ]);
                setWallet(walletRes.data);
                setAppointments(apptRes.data.slice(0, 3));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <RefreshCw className="w-8 h-8 animate-spin text-brand-mint" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Welcome */}
            <div className="bg-gradient-to-r from-brand-mint/20 to-brand-teal/20 rounded-2xl p-6 border border-brand-mint/30">
                <h2 className="text-2xl font-bold">Welcome back, {user?.first_name || 'Patient'}!</h2>
                <p className="text-brand-cream/70 mt-1">Here's your health dashboard</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Wallet Card */}
                <div className="bg-brand-slate/50 rounded-xl p-5 border border-brand-cream/10">
                    <div className="flex items-center justify-between mb-3">
                        <Wallet className="w-5 h-5 text-brand-mint" />
                        <Link to="/patient/wallet" className="text-xs text-brand-mint hover:underline">View</Link>
                    </div>
                    <p className="text-sm text-brand-cream/60">Wallet Balance</p>
                    <p className="text-2xl font-bold text-brand-cream">₹{wallet?.balance || '0.00'}</p>
                </div>

                {/* Appointments Card */}
                <div className="bg-brand-slate/50 rounded-xl p-5 border border-brand-cream/10">
                    <div className="flex items-center justify-between mb-3">
                        <Calendar className="w-5 h-5 text-brand-teal" />
                        <Link to="/patient/appointments" className="text-xs text-brand-mint hover:underline">View All</Link>
                    </div>
                    <p className="text-sm text-brand-cream/60">Upcoming Appointments</p>
                    <p className="text-2xl font-bold text-brand-cream">{appointments.length}</p>
                </div>

                {/* QR Code Card */}
                <div className="bg-brand-slate/50 rounded-xl p-5 border border-brand-cream/10">
                    <div className="flex items-center justify-between mb-3">
                        <QrCode className="w-5 h-5 text-purple-400" />
                        <Link to="/patient/qr" className="text-xs text-brand-mint hover:underline">View QR</Link>
                    </div>
                    <p className="text-sm text-brand-cream/60">My Health QR</p>
                    <p className="text-sm text-brand-cream/70">Scan for quick form filling</p>
                </div>
            </div>

            {/* Recent Appointments */}
            <div className="bg-brand-slate/50 rounded-xl p-5 border border-brand-cream/10">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Recent Appointments</h3>
                    <Link to="/patient/appointments" className="text-sm text-brand-mint hover:underline flex items-center gap-1">
                        View All <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
                {appointments.length === 0 ? (
                    <p className="text-brand-cream/50 text-center py-6">No appointments yet</p>
                ) : (
                    <div className="space-y-3">
                        {appointments.map(appt => (
                            <div key={appt.id} className="flex items-center justify-between p-3 bg-brand-dark/50 rounded-lg">
                                <div>
                                    <p className="font-medium">{appt.doctor_name || `Doctor #${appt.doctor}`}</p>
                                    <p className="text-sm text-brand-cream/60">{new Date(appt.scheduled_time).toLocaleString()}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs rounded-full ${appt.status === 'SCHEDULED' ? 'bg-blue-500/20 text-blue-300' :
                                    appt.status === 'IN_PROGRESS' ? 'bg-yellow-500/20 text-yellow-300' :
                                        appt.status === 'COMPLETED' ? 'bg-green-500/20 text-green-300' :
                                            'bg-red-500/20 text-red-300'
                                    }`}>
                                    {appt.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function PatientQR() {
    const [qrData, setQrData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        qrAPI.getQRData().then(res => {
            setQrData(res.data.qr_data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const copyToClipboard = () => {
        if (qrData) {
            navigator.clipboard.writeText(JSON.stringify(qrData));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const qrString = qrData ? JSON.stringify(qrData) : '';

    return (
        <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-6">My Health QR Code</h2>
            <div className="bg-brand-slate/50 rounded-2xl p-8 border border-brand-cream/10 text-center">
                {loading ? (
                    <RefreshCw className="w-8 h-8 animate-spin text-brand-mint mx-auto" />
                ) : qrData ? (
                    <>
                        <div className="bg-white p-4 rounded-xl inline-block mb-4">
                            <QRCodeSVG
                                value={qrString}
                                size={200}
                                level="M"
                                includeMargin={true}
                            />
                        </div>
                        <p className="text-brand-cream/70 text-sm">
                            Show this QR code at hospitals for quick form filling
                        </p>
                        <p className="text-xs text-brand-cream/50 mt-2">
                            ABHA: {qrData.a}
                        </p>
                        <div className="mt-4 p-3 bg-brand-dark/50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs text-brand-cream/60">QR Data (for testing):</p>
                                <button
                                    onClick={copyToClipboard}
                                    className="flex items-center gap-1 text-xs text-brand-mint hover:text-brand-cream transition-colors"
                                >
                                    {copied ? (
                                        <><Check className="w-3 h-3" /> Copied!</>
                                    ) : (
                                        <><Copy className="w-3 h-3" /> Copy</>
                                    )}
                                </button>
                            </div>
                            <code className="text-xs text-brand-mint break-all block text-left">{qrString}</code>
                        </div>
                    </>
                ) : (
                    <p className="text-brand-cream/60">Unable to load QR code</p>
                )}
            </div>
        </div>
    );
}

const NAV_ITEMS = [
    { path: '/patient', icon: Home, label: 'Dashboard', exact: true },
    { path: '/patient/appointments', icon: Calendar, label: 'Appointments' },
    { path: '/patient/journeys', icon: FileText, label: 'Health Journeys' },
    { path: '/patient/qr', icon: QrCode, label: 'My QR Code' },
    { path: '/patient/consents', icon: Shield, label: 'Consents' },
    { path: '/patient/wallet', icon: Wallet, label: 'Wallet' },
    { path: '/patient/profile', icon: Settings, label: 'Profile' },
];

export default function PatientDashboard() {
    const location = useLocation();

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex gap-8">
                {/* Sidebar */}
                <aside className="w-64 flex-shrink-0 hidden lg:flex lg:items-center">
                    <nav className="bg-brand-slate/50 rounded-xl p-4 border border-brand-cream/10 sticky top-24 w-full">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-brand-cream/10">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-mint to-brand-teal flex items-center justify-center">
                                <User className="w-5 h-5 text-brand-dark" />
                            </div>
                            <div>
                                <p className="font-medium text-sm">Patient Portal</p>
                                <p className="text-xs text-brand-cream/60">Manage your health</p>
                            </div>
                        </div>
                        <ul className="space-y-1">
                            {NAV_ITEMS.map(item => {
                                const isActive = item.exact
                                    ? location.pathname === item.path
                                    : location.pathname.startsWith(item.path);
                                return (
                                    <li key={item.path}>
                                        <Link
                                            to={item.path}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive
                                                ? 'bg-brand-mint/20 text-brand-mint'
                                                : 'text-brand-cream/70 hover:bg-brand-cream/5'
                                                }`}
                                        >
                                            <item.icon className="w-5 h-5" />
                                            <span className="text-sm">{item.label}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0">
                    <Routes>
                        <Route index element={<Overview />} />
                        <Route path="qr" element={<PatientQR />} />
                        <Route path="appointments" element={<PatientAppointments />} />
                        <Route path="appointments/book" element={<BookAppointment />} />
                        <Route path="book-appointment" element={<Navigate to="/patient/appointments/book" replace />} />
                        <Route path="wait-time/:appointmentId" element={<WaitTime />} />
                        <Route path="journeys" element={<HealthJourneys />} />
                        <Route path="consents" element={<Consents />} />
                        <Route path="wallet" element={<PatientWallet />} />
                        <Route path="profile" element={<Profile />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
}
