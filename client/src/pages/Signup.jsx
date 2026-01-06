import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, Mail, Lock, Phone, CreditCard, Stethoscope, Building2, User, AlertCircle, Check } from 'lucide-react';

const ROLE_OPTIONS = [
    { id: 'patient', label: 'Patient', icon: User, description: 'Book appointments & manage health records' },
    { id: 'doctor', label: 'Doctor', icon: Stethoscope, description: 'Manage consultations & patient care' },
    { id: 'provider', label: 'Healthcare Provider', icon: Building2, description: 'Hospital, Lab, or Pharmacy' },
];

const PROVIDER_TYPES = [
    { value: 'HOSPITAL', label: 'Hospital' },
    { value: 'LAB', label: 'Diagnostic Lab' },
    { value: 'PHARMACY', label: 'Pharmacy' },
];

export default function Signup() {
    const [role, setRole] = useState('patient');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        phone_number: '',
        aadhaar: '',
        // Doctor specific
        specialization: '',
        // Provider specific
        type: 'HOSPITAL',
        name: '',
        address: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const { registerPatient, registerDoctor, registerProvider } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setLoading(true);

        try {
            if (role === 'patient') {
                await registerPatient({
                    email: formData.email,
                    password: formData.password,
                    phone_number: formData.phone_number,
                    aadhaar: formData.aadhaar,
                });
            } else if (role === 'doctor') {
                await registerDoctor({
                    email: formData.email,
                    password: formData.password,
                    phone_number: formData.phone_number,
                    aadhaar: formData.aadhaar,
                    specialization: formData.specialization,
                });
            } else if (role === 'provider') {
                await registerProvider({
                    email: formData.email,
                    password: formData.password,
                    phone_number: formData.phone_number,
                    type: formData.type,
                    name: formData.name,
                    address: formData.address,
                });
            }

            setSuccess(true);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.email?.[0] || err.response?.data?.detail || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mb-6">
                        <Check className="w-10 h-10 text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-brand-cream mb-2">Registration Successful!</h2>
                    <p className="text-brand-cream/60">Redirecting to login...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
            <div className="max-w-lg w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-brand-mint to-brand-teal mb-4">
                        <UserPlus className="w-8 h-8 text-brand-dark" />
                    </div>
                    <h1 className="text-3xl font-bold text-brand-cream">Create Account</h1>
                    <p className="text-brand-cream/60 mt-2">Join the Crescare platform</p>
                </div>

                {/* Role Selection */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    {ROLE_OPTIONS.map((option) => (
                        <button
                            key={option.id}
                            type="button"
                            onClick={() => setRole(option.id)}
                            className={`p-4 rounded-xl border-2 transition-all text-center ${role === option.id
                                ? 'border-brand-mint bg-brand-mint/10'
                                : 'border-brand-cream/20 hover:border-brand-cream/40'
                                }`}
                        >
                            <option.icon className={`w-6 h-6 mx-auto mb-2 ${role === option.id ? 'text-brand-mint' : 'text-brand-cream/60'}`} />
                            <span className={`text-sm font-medium ${role === option.id ? 'text-brand-mint' : 'text-brand-cream/80'}`}>
                                {option.label}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-brand-slate/50 backdrop-blur-sm rounded-2xl p-8 border border-brand-cream/10">
                    {error && (
                        <div className="flex items-center gap-2 p-4 mb-6 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Common Fields */}
                        <div>
                            <label className="block text-sm font-medium text-brand-cream/80 mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-cream/40" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-12 pr-4 py-3 bg-brand-dark/50 border border-brand-cream/20 rounded-xl text-brand-cream placeholder-brand-cream/40 focus:outline-none focus:border-brand-mint"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-brand-cream/80 mb-2">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-cream/40" />
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-12 pr-4 py-3 bg-brand-dark/50 border border-brand-cream/20 rounded-xl text-brand-cream placeholder-brand-cream/40 focus:outline-none focus:border-brand-mint"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-brand-cream/80 mb-2">Confirm</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-brand-dark/50 border border-brand-cream/20 rounded-xl text-brand-cream placeholder-brand-cream/40 focus:outline-none focus:border-brand-mint"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-brand-cream/80 mb-2">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-cream/40" />
                                <input
                                    type="tel"
                                    name="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    required
                                    pattern="[0-9]{10}"
                                    className="w-full pl-12 pr-4 py-3 bg-brand-dark/50 border border-brand-cream/20 rounded-xl text-brand-cream placeholder-brand-cream/40 focus:outline-none focus:border-brand-mint"
                                    placeholder="9876543210"
                                />
                            </div>
                        </div>

                        {/* Patient/Doctor: Aadhaar */}
                        {(role === 'patient' || role === 'doctor') && (
                            <div>
                                <label className="block text-sm font-medium text-brand-cream/80 mb-2">Aadhaar Number</label>
                                <div className="relative">
                                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-cream/40" />
                                    <input
                                        type="text"
                                        name="aadhaar"
                                        value={formData.aadhaar}
                                        onChange={handleChange}
                                        required
                                        pattern="[0-9]{12}"
                                        className="w-full pl-12 pr-4 py-3 bg-brand-dark/50 border border-brand-cream/20 rounded-xl text-brand-cream placeholder-brand-cream/40 focus:outline-none focus:border-brand-mint"
                                        placeholder="123456789012"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Doctor: Specialization */}
                        {role === 'doctor' && (
                            <div>
                                <label className="block text-sm font-medium text-brand-cream/80 mb-2">Specialization</label>
                                <input
                                    type="text"
                                    name="specialization"
                                    value={formData.specialization}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-brand-dark/50 border border-brand-cream/20 rounded-xl text-brand-cream placeholder-brand-cream/40 focus:outline-none focus:border-brand-mint"
                                    placeholder="e.g., Cardiology, Dermatology"
                                />
                            </div>
                        )}

                        {/* Provider: Type, Name, Address */}
                        {role === 'provider' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-brand-cream/80 mb-2">Provider Type</label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-brand-dark/50 border border-brand-cream/20 rounded-xl text-brand-cream focus:outline-none focus:border-brand-mint"
                                    >
                                        {PROVIDER_TYPES.map(t => (
                                            <option key={t.value} value={t.value}>{t.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-brand-cream/80 mb-2">Organization Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 bg-brand-dark/50 border border-brand-cream/20 rounded-xl text-brand-cream placeholder-brand-cream/40 focus:outline-none focus:border-brand-mint"
                                        placeholder="e.g., Apollo Diagnostics"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-brand-cream/80 mb-2">Address</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 bg-brand-dark/50 border border-brand-cream/20 rounded-xl text-brand-cream placeholder-brand-cream/40 focus:outline-none focus:border-brand-mint"
                                        placeholder="Full address"
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-8 py-3.5 bg-gradient-to-r from-brand-mint to-brand-teal text-brand-dark font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-brand-dark border-t-transparent"></div>
                        ) : (
                            <>
                                <UserPlus className="w-5 h-5" />
                                Create Account
                            </>
                        )}
                    </button>

                    <p className="text-center mt-6 text-brand-cream/60">
                        Already have an account?{' '}
                        <Link to="/login" className="text-brand-mint hover:underline">
                            Sign in
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
