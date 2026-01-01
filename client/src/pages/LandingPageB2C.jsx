
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, History, Activity, QrCode } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingPageB2C = () => {
    return (
        <div className="relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-mint/10 rounded-full blur-[120px]" />
                <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] bg-brand-red/10 rounded-full blur-[100px]" />
            </div>

            {/* Hero Section */}
            <section className="min-h-screen flex flex-col justify-center items-center px-6 pt-20 text-center relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl"
                >
                    <span className="inline-block py-1 px-3 rounded-full bg-brand-mint/10 border border-brand-mint/20 text-brand-mint text-sm font-medium mb-6">
                        The Future of Digital Health
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
                        Everything about your health.<br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-mint to-brand-cream">In one place.</span>
                    </h1>
                    <p className="text-xl text-brand-cream/60 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Connect directly with doctors, labs, and pharmacies.
                        Carry your medical history securely wherever you go.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="px-8 py-4 bg-brand-cream text-brand-dark font-semibold rounded-full hover:bg-white transition-all flex items-center justify-center gap-2">
                            Get the App <ArrowRight className="w-4 h-4" />
                        </button>
                        <Link to="/business" className="px-8 py-4 bg-brand-cream/5 border border-brand-cream/10 text-brand-cream font-medium rounded-full hover:bg-brand-cream/10 transition-all flex items-center justify-center">
                            For Healthcare Providers
                        </Link>
                    </div>
                </motion.div>

                {/* Hero Visual Placeholder */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="mt-20 w-full max-w-5xl aspect-[16/9] glass-card relative flex items-center justify-center overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-brand-dark/90 z-10" />
                    <div className="text-brand-cream/40 font-mono text-sm z-20">
                        [App interface mockup]
                        <br />
                        Appointment Booking | Live Queue | Reports and History
                    </div>
                    {/* Abstract Grid */}
                    <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 gap-4 opacity-10 p-8 transform rotate-x-12 perspective-1000">
                        {[...Array(24)].map((_, i) => (
                            <div key={i} className="bg-brand-cream/20 rounded-lg w-full h-full" />
                        ))}
                    </div>
                </motion.div>
            </section>

            {/* Features Section */}
            <section className="py-24 px-6 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">Why Us?</h2>
                        <p className="text-brand-cream/60 text-lg">Powerful features for a unified healthcare experience.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        <FeatureCard
                            icon={<History className="w-6 h-6 text-brand-mint" />}
                            title="Unified Medical History"
                            description="Your complete health record travels with you. No more carrying bulky files or losing prescriptions. Access your history instantly."
                        />
                        <FeatureCard
                            icon={<ShieldCheck className="w-6 h-6 text-brand-mint" />}
                            title="Consent-Based Access"
                            description="You are in clear control. Grant temporary access to doctors for your records, and revoke it whenever you want. Privacy first."
                        />
                        <FeatureCard
                            icon={<Activity className="w-6 h-6 text-brand-red" />}
                            title="Live Queue Status"
                            description="Stop waiting in crowded waiting rooms. Track your appointment status in real-time and arrive just when the doctor is ready."
                        />
                        <FeatureCard
                            icon={<QrCode className="w-6 h-6 text-brand-cream" />}
                            title="QR Quick Share"
                            description="Walk into any hospital and scan a QR code to instantly share your registration details. No more forms to fill."
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }) => (
    <div className="glass-card p-8 hover:bg-brand-cream/5 transition-colors duration-300 flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-xl bg-brand-cream/5 flex items-center justify-center mb-6 border border-brand-cream/10">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-3 text-brand-cream">{title}</h3>
        <p className="text-brand-cream/60 leading-relaxed">
            {description}
        </p>
    </div>
)

export default LandingPageB2C;
