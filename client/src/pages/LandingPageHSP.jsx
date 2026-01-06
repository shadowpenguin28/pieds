import { Link } from 'react-router-dom';
import {
    ArrowRight, CheckCircle, Stethoscope, Building, FlaskConical,
    Zap, Video, Activity, Eye, BarChart3, Route, Users, Gift
} from 'lucide-react';

const doctorBenefits = [
    { icon: Zap, title: "Zero Commission", description: "No commission charged on bookings, forever" },
    { icon: Gift, title: "Free Trial", description: "3-6 months free software trial" },
    { icon: Video, title: "Free Telemedicine", description: "For follow-ups and online consultations" },
    { icon: Activity, title: "Patient Wait Status", description: "Less angry patients, save doctor's time" },
    { icon: Eye, title: "Increased Visibility", description: "Discover new patients via Crescere network" },
];

const labBenefits = [
    { icon: Gift, title: "Free Software", description: "First X months completely free" },
    { icon: Eye, title: "Higher Visibility", description: "Attract more patients online" },
    { icon: CheckCircle, title: "Online Reports", description: "Share reports directly with patients" },
    { icon: Route, title: "Route Directions", description: "Show patients how to reach test centers" },
    { icon: BarChart3, title: "Sample Tracker", description: "Track monthly sample counts" },
    { icon: Users, title: "Doctor Referrals", description: "Partner with doctors for trusted referrals" },
];

const LandingPageHSP = () => {
    return (
        <div className="min-h-screen" style={{ background: 'hsl(222 47% 6%)' }}>
            {/* Hero */}
            <section className="relative pt-32 pb-24 overflow-hidden" style={{ background: 'linear-gradient(to bottom, hsl(222 47% 6%), hsl(222 50% 10%), hsl(222 47% 6%))' }}>
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[hsl(174_72%_56%/0.1)] rounded-full blur-3xl animate-pulse-glow" />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass glass-border mb-8">
                            <span className="w-2 h-2 bg-[hsl(174_72%_56%)] rounded-full animate-pulse" />
                            <span className="text-sm text-[hsl(220_20%_60%)]">For Healthcare Service Providers</span>
                        </span>

                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
                            <span className="text-gradient">Zero</span>{" "}
                            <br className="hidden md:block" />
                            Commission
                        </h1>

                        <p className="text-lg md:text-xl text-[hsl(220_20%_60%)] max-w-2xl mx-auto mb-10">
                            Join India's fastest growing healthcare network. Get Crescere integration,
                            increase visibility, and manage your practice effortlessly.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                to="/signup"
                                className="px-8 py-4 bg-[hsl(180_100%_98%)] text-[hsl(222_47%_6%)] font-semibold rounded-full hover:bg-white transition-all flex items-center gap-2"
                            >
                                Start Free Trial
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <a
                                href="mailto:sales@crescere.health"
                                className="px-8 py-4 glass glass-border text-[hsl(180_100%_98%)] font-medium rounded-full hover:bg-[hsl(180_100%_98%/0.1)] transition-all"
                            >
                                Contact Sales
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* For Doctors */}
            <section className="py-24" style={{ background: 'hsl(222 40% 8%)' }}>
                <div className="container mx-auto px-6">
                    <div className="flex items-center gap-4 mb-12">
                        <div className="w-16 h-16 rounded-2xl bg-[hsl(174_72%_56%/0.1)] flex items-center justify-center">
                            <Stethoscope className="w-8 h-8 text-[hsl(174_72%_56%)]" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold">For Doctors</h2>
                            <p className="text-[hsl(220_20%_60%)]">Everything you need to grow your practice</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {doctorBenefits.map((benefit) => (
                            <div
                                key={benefit.title}
                                className="flex gap-4 p-6 bg-card-gradient rounded-xl border border-[hsl(222_30%_20%/0.5)] hover:border-[hsl(174_72%_56%/0.3)] transition-all"
                            >
                                <div className="w-12 h-12 rounded-xl bg-[hsl(174_72%_56%/0.1)] flex items-center justify-center shrink-0">
                                    <benefit.icon className="w-6 h-6 text-[hsl(174_72%_56%)]" />
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-1">{benefit.title}</h3>
                                    <p className="text-sm text-[hsl(220_20%_60%)]">{benefit.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* For Hospitals */}
            <section className="py-24" style={{ background: 'hsl(222 47% 6%)' }}>
                <div className="container mx-auto px-6">
                    <div className="flex items-center gap-4 mb-12">
                        <div className="w-16 h-16 rounded-2xl bg-[hsl(174_72%_40%/0.1)] flex items-center justify-center">
                            <Building className="w-8 h-8 text-[hsl(174_72%_40%)]" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold">For Hospitals</h2>
                            <p className="text-[hsl(220_20%_60%)]">Enterprise solutions for healthcare institutions</p>
                        </div>
                    </div>

                    <div className="bg-card-gradient rounded-2xl p-8 border border-[hsl(222_30%_20%/0.5)]">
                        <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-xl font-semibold mb-4">All Doctor Benefits, Plus:</h3>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-[hsl(174_72%_56%)] mt-0.5" />
                                        <span className="text-[hsl(220_20%_60%)]">Data optimization and analytics dashboard</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-[hsl(174_72%_56%)] mt-0.5" />
                                        <span className="text-[hsl(220_20%_60%)]">Free analytics for the first X months</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-[hsl(174_72%_56%)] mt-0.5" />
                                        <span className="text-[hsl(220_20%_60%)]">Multi-department management</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-[hsl(174_72%_56%)] mt-0.5" />
                                        <span className="text-[hsl(220_20%_60%)]">API integration with existing HMS</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="flex items-center justify-center">
                                <div className="glass glass-border rounded-2xl p-8 text-center">
                                    <BarChart3 className="w-16 h-16 text-[hsl(174_72%_56%)] mx-auto mb-4" />
                                    <h4 className="text-lg font-semibold">Data Optimization</h4>
                                    <p className="text-sm text-[hsl(220_20%_60%)] mt-2">
                                        We optimize the data gathered from bookings and provide
                                        actionable insights back to you.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* For Labs */}
            <section className="py-24" style={{ background: 'hsl(222 40% 8%)' }}>
                <div className="container mx-auto px-6">
                    <div className="flex items-center gap-4 mb-12">
                        <div className="w-16 h-16 rounded-2xl bg-[hsl(0_84%_60%/0.1)] flex items-center justify-center">
                            <FlaskConical className="w-8 h-8 text-[hsl(0_84%_60%)]" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold">For Labs & Pharma</h2>
                            <p className="text-[hsl(220_20%_60%)]">Expand your reach and streamline operations</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {labBenefits.map((benefit) => (
                            <div
                                key={benefit.title}
                                className="flex gap-4 p-6 bg-card-gradient rounded-xl border border-[hsl(222_30%_20%/0.5)] hover:border-[hsl(174_72%_56%/0.3)] transition-all"
                            >
                                <div className="w-12 h-12 rounded-xl bg-[hsl(174_72%_56%/0.1)] flex items-center justify-center shrink-0">
                                    <benefit.icon className="w-6 h-6 text-[hsl(174_72%_56%)]" />
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-1">{benefit.title}</h3>
                                    <p className="text-sm text-[hsl(220_20%_60%)]">{benefit.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24" style={{ background: 'hsl(222 47% 6%)' }}>
                <div className="container mx-auto px-6">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">
                            Ready to <span className="text-gradient">Grow Your Practice</span>?
                        </h2>
                        <p className="text-[hsl(220_20%_60%)] text-lg mb-10">
                            Join the Crescere network today and start connecting with patients across India.
                        </p>
                        <Link
                            to="/signup"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-[hsl(180_100%_98%)] text-[hsl(222_47%_6%)] font-semibold rounded-full hover:bg-white transition-all"
                        >
                            Start Free Trial
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPageHSP;
