import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, LogOut, User, Stethoscope, Building2 } from 'lucide-react';

const Navbar = () => {
    const { isAuthenticated, isPatient, isDoctor, isProvider, user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const getDashboardLink = () => {
        if (isPatient) return '/patient';
        if (isDoctor) return '/doctor';
        if (isProvider) return '/provider';
        return '/';
    };

    const getUserIcon = () => {
        if (isDoctor) return <Stethoscope className="w-4 h-4" />;
        if (isProvider) return <Building2 className="w-4 h-4" />;
        return <User className="w-4 h-4" />;
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-brand-dark/50 border-b border-brand-cream/10">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                <Link to="/" className="text-xl font-bold bg-gradient-to-r from-brand-mint to-brand-cream bg-clip-text text-transparent">
                    Crescere
                </Link>

                <div className="flex items-center gap-6 text-sm font-medium">
                    {!isAuthenticated ? (
                        <>
                            <Link to="/" className="text-brand-cream/70 hover:text-brand-mint transition-colors">
                                For Patients
                            </Link>
                            <Link to="/business" className="text-brand-cream/70 hover:text-brand-mint transition-colors">
                                For Business
                            </Link>
                            <Link
                                to="/login"
                                className="flex items-center gap-2 px-4 py-2 bg-brand-mint/20 text-brand-mint rounded-lg hover:bg-brand-mint/30 transition-colors"
                            >
                                <LogIn className="w-4 h-4" />
                                Login
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link
                                to={getDashboardLink()}
                                className="flex items-center gap-2 text-brand-cream/70 hover:text-brand-mint transition-colors"
                            >
                                {getUserIcon()}
                                <span>Dashboard</span>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
