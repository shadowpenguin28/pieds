import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { walletAPI, appointmentAPI } from '../../api/client';
import {
    Home, Users, QrCode, Calendar, Wallet, FileSearch,
    RefreshCw, Stethoscope, Clock, Play, CheckCircle, Settings
} from 'lucide-react';

// Import sub-pages
import DoctorQueue from './Queue';
import DoctorAppointments from './Appointments';
import RequestAccess from './RequestAccess';
import ScanQR from '../shared/ScanQR';
import Profile from '../shared/Profile';
import PatientWallet from '../patient/Wallet'; // Reuse wallet component

function Overview() {
    const { user } = useAuth();
    const [wallet, setWallet] = useState(null);
    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const walletRes = await walletAPI.getBalance();
                setWallet(walletRes.data);
                // Fetch today's appointments
                const apptRes = await appointmentAPI.list();
                const today = new Date().toDateString();
                const todayAppts = apptRes.data.filter(a =>
                    new Date(a.scheduled_time).toDateString() === today &&
                    ['SCHEDULED', 'IN_PROGRESS'].includes(a.status)
                );
                setQueue(todayAppts);
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
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl p-6 border border-blue-500/30">
                <h2 className="text-2xl font-bold">Welcome, Dr. {user?.first_name || 'Doctor'}!</h2>
                <p className="text-brand-cream/70 mt-1">Manage your consultations and patients</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-brand-slate/50 rounded-xl p-5 border border-brand-cream/10">
                    <div className="flex items-center justify-between mb-3">
                        <Users className="w-5 h-5 text-blue-400" />
                        <Link to="/doctor/queue" className="text-xs text-brand-mint hover:underline">View Queue</Link>
                    </div>
                    <p className="text-sm text-brand-cream/60">Today's Patients</p>
                    <p className="text-2xl font-bold text-brand-cream">{queue.length}</p>
                </div>

                <div className="bg-brand-slate/50 rounded-xl p-5 border border-brand-cream/10">
                    <div className="flex items-center justify-between mb-3">
                        <Wallet className="w-5 h-5 text-brand-mint" />
                        <Link to="/doctor/wallet" className="text-xs text-brand-mint hover:underline">View</Link>
                    </div>
                    <p className="text-sm text-brand-cream/60">Earnings</p>
                    <p className="text-2xl font-bold text-brand-cream">₹{wallet?.balance || '0.00'}</p>
                </div>

                <div className="bg-brand-slate/50 rounded-xl p-5 border border-brand-cream/10">
                    <div className="flex items-center justify-between mb-3">
                        <QrCode className="w-5 h-5 text-purple-400" />
                        <Link to="/doctor/scan" className="text-xs text-brand-mint hover:underline">Scan</Link>
                    </div>
                    <p className="text-sm text-brand-cream/60">Scan Patient QR</p>
                    <p className="text-sm text-brand-cream/70">Quick patient lookup</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-brand-slate/50 rounded-xl p-5 border border-brand-cream/10">
                <h3 className="font-semibold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Link to="/doctor/queue" className="flex flex-col items-center p-4 bg-brand-dark/50 rounded-xl hover:bg-brand-dark/70 transition">
                        <Users className="w-6 h-6 text-blue-400 mb-2" />
                        <span className="text-sm">View Queue</span>
                    </Link>
                    <Link to="/doctor/scan" className="flex flex-col items-center p-4 bg-brand-dark/50 rounded-xl hover:bg-brand-dark/70 transition">
                        <QrCode className="w-6 h-6 text-purple-400 mb-2" />
                        <span className="text-sm">Scan QR</span>
                    </Link>
                    <Link to="/doctor/request-access" className="flex flex-col items-center p-4 bg-brand-dark/50 rounded-xl hover:bg-brand-dark/70 transition">
                        <FileSearch className="w-6 h-6 text-yellow-400 mb-2" />
                        <span className="text-sm">Request Records</span>
                    </Link>
                    <Link to="/doctor/appointments" className="flex flex-col items-center p-4 bg-brand-dark/50 rounded-xl hover:bg-brand-dark/70 transition">
                        <Calendar className="w-6 h-6 text-green-400 mb-2" />
                        <span className="text-sm">All Appointments</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}

const NAV_ITEMS = [
    { path: '/doctor', icon: Home, label: 'Dashboard', exact: true },
    { path: '/doctor/queue', icon: Users, label: "Today's Queue" },
    { path: '/doctor/scan', icon: QrCode, label: 'Scan Patient QR' },
    { path: '/doctor/appointments', icon: Calendar, label: 'Appointments' },
    { path: '/doctor/request-access', icon: FileSearch, label: 'Request Records' },
    { path: '/doctor/wallet', icon: Wallet, label: 'Wallet' },
    { path: '/doctor/profile', icon: Settings, label: 'Profile' },
];

export default function DoctorDashboard() {
    const location = useLocation();

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex gap-8">
                {/* Sidebar */}
                <aside className="w-64 flex-shrink-0 hidden lg:block">
                    <nav className="bg-brand-slate/50 rounded-xl p-4 border border-brand-cream/10 sticky top-24">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-brand-cream/10">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                                <Stethoscope className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="font-medium text-sm">Doctor Portal</p>
                                <p className="text-xs text-brand-cream/60">Manage patients</p>
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
                                                ? 'bg-blue-500/20 text-blue-400'
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
                        <Route path="queue" element={<DoctorQueue />} />
                        <Route path="scan" element={<ScanQR />} />
                        <Route path="appointments" element={<DoctorAppointments />} />
                        <Route path="request-access" element={<RequestAccess />} />
                        <Route path="wallet" element={<PatientWallet />} />
                        <Route path="profile" element={<Profile />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
}
