import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing session
        const token = localStorage.getItem('access_token');
        const userData = localStorage.getItem('user_data');

        if (token && userData) {
            try {
                setUser(JSON.parse(userData));
            } catch (e) {
                localStorage.removeItem('user_data');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const response = await authAPI.login(email, password);
        const { access, refresh, user: userData } = response.data;

        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        if (userData) {
            localStorage.setItem('user_data', JSON.stringify(userData));
            setUser(userData);
        }

        return response.data;
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        setUser(null);
    };

    const registerPatient = async (data) => {
        const response = await authAPI.registerPatient(data);
        return response.data;
    };

    const registerDoctor = async (data) => {
        const response = await authAPI.registerDoctor(data);
        return response.data;
    };

    const registerProvider = async (data) => {
        const response = await authAPI.registerProvider(data);
        return response.data;
    };

    // Determine user type
    const isPatient = user?.is_patient === true;
    const isDoctor = user?.is_doctor === true;
    const isProvider = user?.is_provider === true;
    const isAuthenticated = !!user;

    const value = {
        user,
        setUser,
        loading,
        login,
        logout,
        registerPatient,
        registerDoctor,
        registerProvider,
        isAuthenticated,
        isPatient,
        isDoctor,
        isProvider,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
