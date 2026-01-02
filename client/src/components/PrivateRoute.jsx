import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function PrivateRoute({ children, allowedRoles = [] }) {
    const { isAuthenticated, isPatient, isDoctor, isProvider, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-mint"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check role-based access
    if (allowedRoles.length > 0) {
        const hasAccess = allowedRoles.some(role => {
            if (role === 'patient') return isPatient;
            if (role === 'doctor') return isDoctor;
            if (role === 'provider') return isProvider;
            return false;
        });

        if (!hasAccess) {
            // Redirect to appropriate dashboard
            if (isPatient) return <Navigate to="/patient" replace />;
            if (isDoctor) return <Navigate to="/doctor" replace />;
            if (isProvider) return <Navigate to="/provider" replace />;
            return <Navigate to="/" replace />;
        }
    }

    return children;
}
