
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Code, Database, Lock, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingPageB2B = () => {
    return (
        <div className="relative overflow-hidden bg-brand-dark">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-red/10 rounded-full blur-[120px]" />
                <div className="absolute top-[40%] left-[-10%] w-[40%] h-[60%] bg-brand-mint/10 rounded-full blur-[100px]" />
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
                        For Developers & Healthcare Businesses
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
                        Build on the Universal <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-mint to-brand-cream">Health Infrastructure.</span>
                    </h1>
                    <p className="text-xl text-brand-cream/60 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Instant APIs for ABHA creation, Medical Records, and Consent Management.
                        Launch your digital health app in days, not months.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="px-8 py-4 bg-brand-cream text-brand-dark font-semibold rounded-full hover:bg-white transition-all flex items-center justify-center gap-2">
                            Read Documentation <Code className="w-4 h-4" />
                        </button>
                        <Link to="/" className="px-8 py-4 bg-brand-cream/5 border border-brand-cream/10 text-brand-cream font-medium rounded-full hover:bg-brand-cream/10 transition-all flex items-center justify-center">
                            View Patient App
                        </Link>
                    </div>
                </motion.div>

                {/* Code Snippet Visual */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="mt-20 w-full max-w-4xl glass-card relative overflow-hidden text-left font-mono text-sm leading-6"
                >
                    <div className="bg-white/5 px-6 py-3 border-b border-brand-cream/10 flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-brand-red/50" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                        <div className="w-3 h-3 rounded-full bg-brand-mint/50" />
                        <span className="ml-2 text-xs text-brand-cream/60">create_abha.py</span>
                    </div>
                    <div className="p-6 text-gray-300 overflow-x-auto">
                        <span className="text-purple-400">import</span> requests<br /><br />
                        <span className="text-blue-400">def</span> <span className="text-yellow-300">create_patient_abha</span>(mobile, aadhaar):<br />
                        &nbsp;&nbsp;response = requests.post(<span className="text-brand-mint">"https://api.pieds.dev/v1/abha/create"</span>, json={`{`}<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-brand-mint">"mobile"</span>: mobile,<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-brand-mint">"aadhaar"</span>: aadhaar<br />
                        &nbsp;&nbsp;{`}`})<br />
                        &nbsp;&nbsp;<span className="text-purple-400">return</span> response.json()<br /><br />
                        <span className="text-gray-500"># Returns verified ABHA ID + KYC Data instantly</span>
                    </div>
                </motion.div>
            </section>

            {/* Features Grid */}
            <section className="py-24 px-6 relative">
                <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<Database className="w-6 h-6 text-brand-mint" />}
                        title="Unified Registry Access"
                        description="Query our mock registry to find patients, doctors, and facilities instantly via standardized IDs (HPR/HFR)."
                    />
                    <FeatureCard
                        icon={<Lock className="w-6 h-6 text-brand-red" />}
                        title="Secure Consent Flow"
                        description="Implement complex consent management flows (Grant/Revoke/Expiry) with a simple REST API abstraction."
                    />
                    <FeatureCard
                        icon={<Zap className="w-6 h-6 text-brand-cream" />}
                        title="Real-time Events"
                        description="Subscribe to webhooks for appointment updates, new reports, and patient check-ins. Build reactive apps."
                    />
                </div>
            </section>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }) => (
    <div className="glass-card p-8 hover:bg-brand-cream/5 transition-colors duration-300 border-l-4 border-l-transparent hover:border-l-brand-red">
        <div className="w-12 h-12 rounded-xl bg-brand-cream/5 flex items-center justify-center mb-6 border border-brand-cream/10">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-3 text-brand-cream">{title}</h3>
        <p className="text-brand-cream/60 leading-relaxed">
            {description}
        </p>
    </div>
)

export default LandingPageB2B;
