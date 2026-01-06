import { Link } from 'react-router-dom';
import { ArrowRight, Code2, Zap, Shield, Layers, GitBranch, BookOpen, Terminal } from 'lucide-react';

const apiFeatures = [
    { icon: Zap, title: "Fast & Reliable", description: "99.9% uptime with sub-100ms response times" },
    { icon: Shield, title: "Secure by Default", description: "OAuth 2.0, end-to-end encryption, HIPAA-ready" },
    { icon: Layers, title: "RESTful APIs", description: "Simple, intuitive endpoints for all operations" },
    { icon: GitBranch, title: "Versioned", description: "Backward-compatible versioning for stability" },
];

const codeExample = `// Book an appointment
const response = await fetch('https://api.crescere.health/v1/appointments', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    patient_id: 'abha_123456',
    doctor_id: 'doc_789',
    scheduled_time: '2026-01-15T10:00:00Z'
  })
});

const appointment = await response.json();
console.log(appointment.id); // apt_abc123`;

const LandingPageDev = () => {
    return (
        <div className="min-h-screen" style={{ background: 'hsl(222 47% 6%)' }}>
            {/* Hero */}
            <section className="relative pt-32 pb-24 overflow-hidden" style={{ background: 'linear-gradient(to bottom, hsl(222 47% 6%), hsl(222 50% 10%), hsl(222 47% 6%))' }}>
                <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[hsl(174_72%_56%/0.1)] rounded-full blur-3xl animate-pulse-glow" />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass glass-border mb-8">
                            <Terminal className="w-4 h-4 text-[hsl(174_72%_56%)]" />
                            <span className="text-sm text-[hsl(220_20%_60%)]">Developer Platform</span>
                        </span>

                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
                            Build on <span className="text-gradient">Crescere</span>
                        </h1>

                        <p className="text-lg md:text-xl text-[hsl(220_20%_60%)] max-w-2xl mx-auto mb-10">
                            Integrate India's Unified Health Interface into your application.
                            Access patient records, schedule appointments, and connect healthcare providers.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <a
                                href="#docs"
                                className="px-8 py-4 bg-[hsl(180_100%_98%)] text-[hsl(222_47%_6%)] font-semibold rounded-full hover:bg-white transition-all flex items-center gap-2"
                            >
                                <BookOpen className="w-5 h-5" />
                                Read the Docs
                            </a>
                            <a
                                href="#api-key"
                                className="px-8 py-4 glass glass-border text-[hsl(180_100%_98%)] font-medium rounded-full hover:bg-[hsl(180_100%_98%/0.1)] transition-all flex items-center gap-2"
                            >
                                <Code2 className="w-5 h-5" />
                                Get API Key
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* API Features */}
            <section className="py-24" style={{ background: 'hsl(222 40% 8%)' }}>
                <div className="container mx-auto px-6">
                    <div className="max-w-3xl mx-auto text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">
                            Developer-First <span className="text-gradient">APIs</span>
                        </h2>
                        <p className="text-[hsl(220_20%_60%)] text-lg">
                            Built by developers, for developers. Simple, powerful, and well-documented.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {apiFeatures.map((feature) => (
                            <div
                                key={feature.title}
                                className="p-6 bg-card-gradient rounded-xl border border-[hsl(222_30%_20%/0.5)] hover:border-[hsl(174_72%_56%/0.3)] transition-all text-center"
                            >
                                <div className="w-14 h-14 rounded-xl bg-[hsl(174_72%_56%/0.1)] flex items-center justify-center mx-auto mb-4">
                                    <feature.icon className="w-7 h-7 text-[hsl(174_72%_56%)]" />
                                </div>
                                <h3 className="font-semibold mb-2">{feature.title}</h3>
                                <p className="text-sm text-[hsl(220_20%_60%)]">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Code Example */}
            <section className="py-24" style={{ background: 'hsl(222 47% 6%)' }}>
                <div className="container mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">
                                Simple <span className="text-gradient">Integration</span>
                            </h2>
                            <p className="text-[hsl(220_20%_60%)] text-lg mb-8">
                                Get started in minutes. Our APIs are designed to be intuitive
                                and easy to integrate into any application.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[hsl(174_72%_56%/0.2)] flex items-center justify-center">
                                        <span className="text-[hsl(174_72%_56%)] font-bold">1</span>
                                    </div>
                                    <span className="text-[hsl(220_20%_60%)]">Sign up and get your API key</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[hsl(174_72%_56%/0.2)] flex items-center justify-center">
                                        <span className="text-[hsl(174_72%_56%)] font-bold">2</span>
                                    </div>
                                    <span className="text-[hsl(220_20%_60%)]">Authenticate with OAuth 2.0</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[hsl(174_72%_56%/0.2)] flex items-center justify-center">
                                        <span className="text-[hsl(174_72%_56%)] font-bold">3</span>
                                    </div>
                                    <span className="text-[hsl(220_20%_60%)]">Start making API calls</span>
                                </li>
                            </ul>
                        </div>
                        <div className="glass glass-border rounded-2xl overflow-hidden">
                            <div className="flex items-center gap-2 px-4 py-3 bg-[hsl(222_47%_6%/0.5)] border-b border-[hsl(222_30%_20%)]">
                                <div className="w-3 h-3 rounded-full bg-[hsl(0_84%_60%/0.6)]" />
                                <div className="w-3 h-3 rounded-full bg-[hsl(45_100%_50%/0.6)]" />
                                <div className="w-3 h-3 rounded-full bg-[hsl(120_60%_50%/0.6)]" />
                                <span className="ml-2 text-xs text-[hsl(220_20%_60%/0.4)]">appointments.js</span>
                            </div>
                            <pre className="p-6 overflow-x-auto text-sm">
                                <code className="text-[hsl(180_100%_98%/0.8)]">{codeExample}</code>
                            </pre>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24" style={{ background: 'hsl(222 40% 8%)' }}>
                <div className="container mx-auto px-6">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">
                            Ready to <span className="text-gradient">Start Building</span>?
                        </h2>
                        <p className="text-[hsl(220_20%_60%)] text-lg mb-10">
                            Create your developer account and get instant access to the Crescere API sandbox.
                        </p>
                        <Link
                            to="/signup"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-[hsl(180_100%_98%)] text-[hsl(222_47%_6%)] font-semibold rounded-full hover:bg-white transition-all"
                        >
                            Get Started
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPageDev;
