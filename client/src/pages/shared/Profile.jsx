import { useState, useEffect } from 'react';
import { profileAPI, organizationAPI, qrAPI } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import {
    User, Save, RefreshCw, CheckCircle, AlertCircle, Lock,
    Phone, Mail, Calendar, Heart, MapPin, AlertTriangle, Pill,
    Stethoscope, Building2, IndianRupee, UserPlus, Trash2, Users
} from 'lucide-react';

export default function Profile() {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);

    // Form state
    const [formData, setFormData] = useState({});

    // Password change
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [passwordError, setPasswordError] = useState(null);
    const [passwordSuccess, setPasswordSuccess] = useState(null);

    // Doctor management (for providers)
    const [doctors, setDoctors] = useState([]);
    const [showAddDoctor, setShowAddDoctor] = useState(false);
    const [doctorInput, setDoctorInput] = useState({ hpr_id: '', email: '' });
    const [addingDoctor, setAddingDoctor] = useState(false);
    const [doctorError, setDoctorError] = useState(null);
    const [doctorSuccess, setDoctorSuccess] = useState(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await profileAPI.get();
            setProfile(res.data);
            setFormData({
                first_name: res.data.first_name || '',
                last_name: res.data.last_name || '',
                phone_number: res.data.phone_number || '',
                ...res.data.profile
            });

            // Fetch doctors if provider
            if (res.data.type === 'PROVIDER') {
                fetchDoctors();
            }
        } catch (err) {
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const fetchDoctors = async () => {
        try {
            const res = await organizationAPI.getDoctors();
            setDoctors(res.data.doctors || []);
        } catch (err) {
            console.error('Failed to fetch doctors:', err);
        }
    };

    const handleAddDoctor = async () => {
        if (!doctorInput.hpr_id && !doctorInput.email) {
            setDoctorError('Please provide HPR ID or email');
            return;
        }

        setAddingDoctor(true);
        setDoctorError(null);
        setDoctorSuccess(null);

        try {
            const res = await organizationAPI.addDoctor(doctorInput);
            setDoctorSuccess(res.data.message);
            setDoctorInput({ hpr_id: '', email: '' });
            setShowAddDoctor(false);
            fetchDoctors();
            setTimeout(() => setDoctorSuccess(null), 3000);
        } catch (err) {
            setDoctorError(err.response?.data?.error || 'Failed to add doctor');
        } finally {
            setAddingDoctor(false);
        }
    };

    const handleRemoveDoctor = async (doctorId, doctorName) => {
        if (!confirm(`Remove ${doctorName} from your organization?`)) return;

        try {
            await organizationAPI.removeDoctor(doctorId);
            setDoctorSuccess(`${doctorName} has been removed`);
            fetchDoctors();
            setTimeout(() => setDoctorSuccess(null), 3000);
        } catch (err) {
            setDoctorError(err.response?.data?.error || 'Failed to remove doctor');
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            // Separate user fields from profile fields
            const userFields = ['first_name', 'last_name', 'phone_number'];
            const userData = {};
            const profileData = {};

            Object.entries(formData).forEach(([key, value]) => {
                if (userFields.includes(key)) {
                    userData[key] = value;
                } else {
                    profileData[key] = value;
                }
            });

            await profileAPI.update({
                ...userData,
                profile: profileData
            });

            // Regenerate QR code for patients after profile update
            if (profile?.type === 'PATIENT') {
                try {
                    await qrAPI.getQRData();
                    setSuccess('Profile updated successfully! Your QR code has been regenerated.');
                } catch (qrErr) {
                    // QR regeneration failed but profile was saved
                    setSuccess('Profile updated successfully! (QR code update pending)');
                }
            } else {
                setSuccess('Profile updated successfully!');
            }

            setTimeout(() => setSuccess(null), 4000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save profile');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordError(null);
        setPasswordSuccess(null);

        if (passwords.new !== passwords.confirm) {
            setPasswordError("New passwords don't match");
            return;
        }

        if (passwords.new.length < 8) {
            setPasswordError("Password must be at least 8 characters");
            return;
        }

        setPasswordSaving(true);
        try {
            await profileAPI.changePassword(passwords.current, passwords.new);
            setPasswordSuccess('Password changed successfully!');
            setPasswords({ current: '', new: '', confirm: '' });
            setTimeout(() => {
                setShowPasswordForm(false);
                setPasswordSuccess(null);
            }, 2000);
        } catch (err) {
            setPasswordError(err.response?.data?.error || 'Failed to change password');
        } finally {
            setPasswordSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <RefreshCw className="w-8 h-8 animate-spin text-brand-mint" />
            </div>
        );
    }

    const isPatient = profile?.type === 'PATIENT';
    const isDoctor = profile?.type === 'DOCTOR';
    const isProvider = profile?.type === 'PROVIDER';

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Profile Settings</h1>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-brand-mint text-brand-dark font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                >
                    {saving ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    Save Changes
                </button>
            </div>

            {/* Success/Error Messages */}
            {success && (
                <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-green-300 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    {success}
                </div>
            )}
            {error && (
                <div className="p-4 bg-brand-red/20 border border-brand-red/30 rounded-xl text-brand-red flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {/* Basic Info */}
            <div className="bg-brand-slate/50 rounded-xl p-6 border border-brand-cream/10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-14 h-14 rounded-full bg-brand-mint/20 flex items-center justify-center">
                        <User className="w-7 h-7 text-brand-mint" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-lg">{formData.first_name} {formData.last_name}</h2>
                        <p className="text-sm text-brand-cream/60">{profile?.email}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-brand-cream/60 mb-1">First Name</label>
                        <input
                            type="text"
                            value={formData.first_name || ''}
                            onChange={(e) => handleChange('first_name', e.target.value)}
                            className="w-full px-4 py-2.5 bg-brand-dark/50 border border-brand-cream/20 rounded-lg text-brand-cream focus:outline-none focus:border-brand-mint"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-brand-cream/60 mb-1">Last Name</label>
                        <input
                            type="text"
                            value={formData.last_name || ''}
                            onChange={(e) => handleChange('last_name', e.target.value)}
                            className="w-full px-4 py-2.5 bg-brand-dark/50 border border-brand-cream/20 rounded-lg text-brand-cream focus:outline-none focus:border-brand-mint"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-brand-cream/60 mb-1">
                            <Phone className="w-4 h-4 inline mr-1" />
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            value={formData.phone_number || ''}
                            onChange={(e) => handleChange('phone_number', e.target.value)}
                            className="w-full px-4 py-2.5 bg-brand-dark/50 border border-brand-cream/20 rounded-lg text-brand-cream focus:outline-none focus:border-brand-mint"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-brand-cream/60 mb-1">
                            <Mail className="w-4 h-4 inline mr-1" />
                            Email
                        </label>
                        <input
                            type="email"
                            value={profile?.email || ''}
                            disabled
                            className="w-full px-4 py-2.5 bg-brand-dark/30 border border-brand-cream/10 rounded-lg text-brand-cream/50 cursor-not-allowed"
                        />
                    </div>
                </div>
            </div>

            {/* Patient-specific fields */}
            {isPatient && (
                <div className="bg-brand-slate/50 rounded-xl p-6 border border-brand-cream/10">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Heart className="w-5 h-5 text-brand-mint" />
                        Health Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm text-brand-cream/60 mb-1">
                                <Calendar className="w-4 h-4 inline mr-1" />
                                Date of Birth
                            </label>
                            <input
                                type="date"
                                value={formData.dob || ''}
                                onChange={(e) => handleChange('dob', e.target.value)}
                                className="w-full px-4 py-2.5 bg-brand-dark/50 border border-brand-cream/20 rounded-lg text-brand-cream focus:outline-none focus:border-brand-mint"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-brand-cream/60 mb-1">Gender</label>
                            <select
                                value={formData.gender || ''}
                                onChange={(e) => handleChange('gender', e.target.value)}
                                className="w-full px-4 py-2.5 bg-brand-dark/50 border border-brand-cream/20 rounded-lg text-brand-cream focus:outline-none focus:border-brand-mint"
                            >
                                <option value="">Select</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-brand-cream/60 mb-1">Blood Group</label>
                            <select
                                value={formData.blood_group || ''}
                                onChange={(e) => handleChange('blood_group', e.target.value)}
                                className="w-full px-4 py-2.5 bg-brand-dark/50 border border-brand-cream/20 rounded-lg text-brand-cream focus:outline-none focus:border-brand-mint"
                            >
                                <option value="">Select</option>
                                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                                    <option key={bg} value={bg}>{bg}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-brand-cream/60 mb-1">ABHA ID</label>
                            <input
                                type="text"
                                value={formData.abha_id || ''}
                                disabled
                                className="w-full px-4 py-2.5 bg-brand-dark/30 border border-brand-cream/10 rounded-lg text-brand-cream/50 cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm text-brand-cream/60 mb-1">
                            <MapPin className="w-4 h-4 inline mr-1" />
                            Address
                        </label>
                        <textarea
                            value={formData.address || ''}
                            onChange={(e) => handleChange('address', e.target.value)}
                            rows={2}
                            className="w-full px-4 py-2.5 bg-brand-dark/50 border border-brand-cream/20 rounded-lg text-brand-cream focus:outline-none focus:border-brand-mint resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm text-brand-cream/60 mb-1">Emergency Contact Name</label>
                            <input
                                type="text"
                                value={formData.emergency_contact_name || ''}
                                onChange={(e) => handleChange('emergency_contact_name', e.target.value)}
                                className="w-full px-4 py-2.5 bg-brand-dark/50 border border-brand-cream/20 rounded-lg text-brand-cream focus:outline-none focus:border-brand-mint"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-brand-cream/60 mb-1">Emergency Contact Phone</label>
                            <input
                                type="tel"
                                value={formData.emergency_contact_phone || ''}
                                onChange={(e) => handleChange('emergency_contact_phone', e.target.value)}
                                className="w-full px-4 py-2.5 bg-brand-dark/50 border border-brand-cream/20 rounded-lg text-brand-cream focus:outline-none focus:border-brand-mint"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-brand-cream/60 mb-1">
                                <AlertTriangle className="w-4 h-4 inline mr-1" />
                                Allergies
                            </label>
                            <textarea
                                value={formData.allergies || ''}
                                onChange={(e) => handleChange('allergies', e.target.value)}
                                rows={2}
                                placeholder="e.g., Penicillin, Peanuts"
                                className="w-full px-4 py-2.5 bg-brand-dark/50 border border-brand-cream/20 rounded-lg text-brand-cream placeholder-brand-cream/40 focus:outline-none focus:border-brand-mint resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-brand-cream/60 mb-1">
                                <Pill className="w-4 h-4 inline mr-1" />
                                Current Medications
                            </label>
                            <textarea
                                value={formData.current_medications || ''}
                                onChange={(e) => handleChange('current_medications', e.target.value)}
                                rows={2}
                                placeholder="e.g., Metformin 500mg"
                                className="w-full px-4 py-2.5 bg-brand-dark/50 border border-brand-cream/20 rounded-lg text-brand-cream placeholder-brand-cream/40 focus:outline-none focus:border-brand-mint resize-none"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Doctor-specific fields */}
            {isDoctor && (
                <div className="bg-brand-slate/50 rounded-xl p-6 border border-brand-cream/10">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Stethoscope className="w-5 h-5 text-brand-mint" />
                        Professional Information
                    </h3>

                    {/* HPR ID - Full width for visibility */}
                    <div className="mb-4">
                        <label className="block text-sm text-brand-cream/60 mb-1">HPR ID</label>
                        <input
                            type="text"
                            value={formData.hpr_id || ''}
                            disabled
                            className="w-full px-4 py-2.5 bg-brand-dark/30 border border-brand-cream/10 rounded-lg text-brand-cream/70 cursor-not-allowed font-mono text-sm"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-brand-cream/60 mb-1">Specialization</label>
                            <input
                                type="text"
                                value={formData.specialization || ''}
                                onChange={(e) => handleChange('specialization', e.target.value)}
                                className="w-full px-4 py-2.5 bg-brand-dark/50 border border-brand-cream/20 rounded-lg text-brand-cream focus:outline-none focus:border-brand-mint"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-brand-cream/60 mb-1">
                                <IndianRupee className="w-4 h-4 inline mr-1" />
                                Consultation Fee
                            </label>
                            <input
                                type="number"
                                value={formData.consultation_fee || ''}
                                onChange={(e) => handleChange('consultation_fee', e.target.value)}
                                className="w-full px-4 py-2.5 bg-brand-dark/50 border border-brand-cream/20 rounded-lg text-brand-cream focus:outline-none focus:border-brand-mint"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm text-brand-cream/60 mb-1">Organization</label>
                            <input
                                type="text"
                                value={formData.organization || 'Not affiliated'}
                                disabled
                                className="w-full px-4 py-2.5 bg-brand-dark/30 border border-brand-cream/10 rounded-lg text-brand-cream/50 cursor-not-allowed"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Provider-specific fields */}
            {isProvider && (
                <>
                    <div className="bg-brand-slate/50 rounded-xl p-6 border border-brand-cream/10">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-brand-mint" />
                            Organization Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm text-brand-cream/60 mb-1">Organization Name</label>
                                <input
                                    type="text"
                                    value={formData.name || ''}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-brand-dark/50 border border-brand-cream/20 rounded-lg text-brand-cream focus:outline-none focus:border-brand-mint"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-brand-cream/60 mb-1">Type</label>
                                <input
                                    type="text"
                                    value={formData.type || ''}
                                    disabled
                                    className="w-full px-4 py-2.5 bg-brand-dark/30 border border-brand-cream/10 rounded-lg text-brand-cream/50 cursor-not-allowed"
                                />
                            </div>
                        </div>

                        {/* HFR ID - Full width */}
                        <div className="mb-4">
                            <label className="block text-sm text-brand-cream/60 mb-1">HFR ID</label>
                            <input
                                type="text"
                                value={formData.hfr_id || ''}
                                disabled
                                className="w-full px-4 py-2.5 bg-brand-dark/30 border border-brand-cream/10 rounded-lg text-brand-cream/70 cursor-not-allowed font-mono text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-brand-cream/60 mb-1">
                                <MapPin className="w-4 h-4 inline mr-1" />
                                Address
                            </label>
                            <textarea
                                value={formData.address || ''}
                                onChange={(e) => handleChange('address', e.target.value)}
                                rows={2}
                                className="w-full px-4 py-2.5 bg-brand-dark/50 border border-brand-cream/20 rounded-lg text-brand-cream focus:outline-none focus:border-brand-mint resize-none"
                            />
                        </div>
                    </div>

                    {/* Affiliated Doctors */}
                    <div className="bg-brand-slate/50 rounded-xl p-6 border border-brand-cream/10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Users className="w-5 h-5 text-brand-mint" />
                                Affiliated Doctors
                            </h3>
                            <button
                                onClick={() => setShowAddDoctor(!showAddDoctor)}
                                className="px-3 py-1.5 bg-brand-mint/20 text-brand-mint rounded-lg hover:bg-brand-mint/30 transition-colors flex items-center gap-1 text-sm"
                            >
                                <UserPlus className="w-4 h-4" />
                                Add Doctor
                            </button>
                        </div>

                        {/* Success/Error Messages */}
                        {doctorSuccess && (
                            <div className="p-3 mb-4 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300 text-sm flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                {doctorSuccess}
                            </div>
                        )}
                        {doctorError && (
                            <div className="p-3 mb-4 bg-brand-red/20 border border-brand-red/30 rounded-lg text-brand-red text-sm flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                {doctorError}
                            </div>
                        )}

                        {/* Add Doctor Form */}
                        {showAddDoctor && (
                            <div className="p-4 mb-4 bg-brand-dark/50 rounded-lg border border-brand-cream/10">
                                <p className="text-sm text-brand-cream/70 mb-3">
                                    Add a doctor by their HPR ID or email address.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                    <div>
                                        <label className="block text-xs text-brand-cream/50 mb-1">HPR ID</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., HPR-12345"
                                            value={doctorInput.hpr_id}
                                            onChange={(e) => setDoctorInput(p => ({ ...p, hpr_id: e.target.value }))}
                                            className="w-full px-3 py-2 bg-brand-dark/50 border border-brand-cream/20 rounded-lg text-brand-cream text-sm focus:outline-none focus:border-brand-mint"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-brand-cream/50 mb-1">Or Email</label>
                                        <input
                                            type="email"
                                            placeholder="doctor@example.com"
                                            value={doctorInput.email}
                                            onChange={(e) => setDoctorInput(p => ({ ...p, email: e.target.value }))}
                                            className="w-full px-3 py-2 bg-brand-dark/50 border border-brand-cream/20 rounded-lg text-brand-cream text-sm focus:outline-none focus:border-brand-mint"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleAddDoctor}
                                        disabled={addingDoctor}
                                        className="px-4 py-2 bg-brand-mint text-brand-dark font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2 text-sm"
                                    >
                                        {addingDoctor ? (
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <UserPlus className="w-4 h-4" />
                                        )}
                                        Add Doctor
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowAddDoctor(false);
                                            setDoctorInput({ hpr_id: '', email: '' });
                                            setDoctorError(null);
                                        }}
                                        className="px-4 py-2 bg-brand-dark/50 text-brand-cream/70 rounded-lg hover:bg-brand-dark/70 transition-colors text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Doctors List */}
                        {doctors.length === 0 ? (
                            <div className="text-center py-8 text-brand-cream/50">
                                <Stethoscope className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                <p>No doctors affiliated yet</p>
                                <p className="text-sm">Add doctors to your organization to get started</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {doctors.map(doc => (
                                    <div key={doc.id} className="flex items-center justify-between p-4 bg-brand-dark/50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-brand-mint/20 flex items-center justify-center">
                                                <Stethoscope className="w-5 h-5 text-brand-mint" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{doc.name}</p>
                                                <p className="text-sm text-brand-cream/60">{doc.specialization} • ₹{doc.consultation_fee}</p>
                                                <p className="text-xs text-brand-cream/40">{doc.email}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveDoctor(doc.id, doc.name)}
                                            className="p-2 text-brand-cream/40 hover:text-brand-red hover:bg-brand-red/10 rounded-lg transition-colors"
                                            title="Remove from organization"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Change Password Section */}
            <div className="bg-brand-slate/50 rounded-xl p-6 border border-brand-cream/10">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center gap-2">
                        <Lock className="w-5 h-5 text-brand-mint" />
                        Change Password
                    </h3>
                    {!showPasswordForm && (
                        <button
                            onClick={() => setShowPasswordForm(true)}
                            className="text-sm text-brand-mint hover:underline"
                        >
                            Change
                        </button>
                    )}
                </div>

                {showPasswordForm ? (
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        {passwordError && (
                            <div className="p-3 bg-brand-red/20 border border-brand-red/30 rounded-lg text-brand-red text-sm">
                                {passwordError}
                            </div>
                        )}
                        {passwordSuccess && (
                            <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300 text-sm">
                                {passwordSuccess}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm text-brand-cream/60 mb-1">Current Password</label>
                            <input
                                type="password"
                                value={passwords.current}
                                onChange={(e) => setPasswords(p => ({ ...p, current: e.target.value }))}
                                className="w-full px-4 py-2.5 bg-brand-dark/50 border border-brand-cream/20 rounded-lg text-brand-cream focus:outline-none focus:border-brand-mint"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-brand-cream/60 mb-1">New Password</label>
                                <input
                                    type="password"
                                    value={passwords.new}
                                    onChange={(e) => setPasswords(p => ({ ...p, new: e.target.value }))}
                                    className="w-full px-4 py-2.5 bg-brand-dark/50 border border-brand-cream/20 rounded-lg text-brand-cream focus:outline-none focus:border-brand-mint"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-brand-cream/60 mb-1">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={passwords.confirm}
                                    onChange={(e) => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                                    className="w-full px-4 py-2.5 bg-brand-dark/50 border border-brand-cream/20 rounded-lg text-brand-cream focus:outline-none focus:border-brand-mint"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={passwordSaving}
                                className="px-4 py-2 bg-brand-mint text-brand-dark font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                            >
                                {passwordSaving ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Lock className="w-4 h-4" />
                                )}
                                Update Password
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowPasswordForm(false);
                                    setPasswordError(null);
                                    setPasswords({ current: '', new: '', confirm: '' });
                                }}
                                className="px-4 py-2 bg-brand-dark/50 text-brand-cream/70 rounded-lg hover:bg-brand-dark/70 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                ) : (
                    <p className="text-sm text-brand-cream/50">
                        Use a strong password with at least 8 characters.
                    </p>
                )}
            </div>
        </div>
    );
}
