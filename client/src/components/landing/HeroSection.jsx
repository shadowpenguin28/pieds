import { ArrowRight, Code2, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroBg from '../../assets/hero-bg.jpg';

const HeroSection = () => {
    return (
        <section
            className="relative min-h-screen flex items-center justify-center overflow-hidden pt-10"
            style={{ background: 'hsl(222 47% 6%)' }}
        >
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${heroBg})` }}
            >
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, hsl(222 47% 6% / 0.4), hsl(222 47% 6% / 0.6), hsl(222 47% 6%))' }} />
            </div>

            {/* Animated Orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[hsl(174_72%_56%/0.1)] rounded-full blur-3xl animate-pulse-glow" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[hsl(174_72%_40%/0.1)] rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1.5s' }} />

            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass glass-border mb-8 animate-fade-up" style={{ animationDelay: '0.2s' }}>
                        <span className="w-2 h-2 bg-[hsl(174_72%_56%)] rounded-full animate-pulse" />
                        <span className="text-sm text-[hsl(220_20%_60%)]">The Future of Digital Health</span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 animate-fade-up" style={{ animationDelay: '0.3s' }}>
                        Everything about your{" "}
                        <span className="text-gradient">Health</span>.{" "}
                        <br className="hidden md:block" />
                        In one place.
                    </h1>

                    {/* Subheadline */}
                    <p className="text-lg md:text-xl text-[hsl(220_20%_60%)] max-w-2xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: '0.4s' }}>
                        Connect directly with doctors, labs, and pharmacies.
                        Carry your medical history securely wherever you go.
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: '0.5s' }}>
                        <Link
                            to="/developers"
                            className="px-8 py-4 bg-[hsl(180_100%_98%)] text-[hsl(222_47%_6%)] font-semibold rounded-full hover:bg-white transition-all flex items-center justify-center gap-2"
                        >
                            <Code2 className="w-5 h-5" />
                            For Developers
                        </Link>
                        <Link
                            to="/hsp"
                            className="px-8 py-4 glass glass-border text-[hsl(180_100%_98%)] font-medium rounded-full hover:bg-[hsl(180_100%_98%/0.1)] transition-all flex items-center justify-center gap-2"
                        >
                            <Building2 className="w-5 h-5" />
                            For HSPs
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-8 mt-16 pt-16 border-t border-[hsl(222_30%_20%/0.3)] animate-fade-up" style={{ animationDelay: '0.6s' }}>
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-gradient">10L+</div>
                            <div className="text-sm text-[hsl(220_20%_60%)] mt-1">Patients Reachable</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-gradient">35K+</div>
                            <div className="text-sm text-[hsl(220_20%_60%)] mt-1">Clinics Targeted</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-gradient">500+</div>
                            <div className="text-sm text-[hsl(220_20%_60%)] mt-1">Labs Connected</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                <div className="w-6 h-10 rounded-full border-2 border-[hsl(220_20%_60%/0.3)] flex items-start justify-center p-2">
                    <div className="w-1.5 h-3 bg-[hsl(174_72%_56%)] rounded-full animate-pulse" />
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
