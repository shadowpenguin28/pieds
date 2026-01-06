import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CTASection = () => {
    return (
        <section className="py-24 relative" style={{ background: 'hsl(222 40% 8%)' }}>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[hsl(174_72%_56%/0.1)] rounded-full blur-3xl" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">
                        Ready to Transform Your{" "}
                        <span className="text-gradient">Healthcare Experience</span>?
                    </h2>
                    <p className="text-[hsl(220_20%_60%)] text-lg mb-10 max-w-2xl mx-auto">
                        Join thousands of patients who are already enjoying seamless,
                        connected healthcare. Get started today.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/signup"
                            className="px-8 py-4 bg-[hsl(180_100%_98%)] text-[hsl(222_47%_6%)] font-semibold rounded-full hover:bg-white transition-all flex items-center justify-center gap-2"
                        >
                            Get Started Free
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link
                            to="/login"
                            className="px-8 py-4 glass glass-border text-[hsl(180_100%_98%)] font-medium rounded-full hover:bg-[hsl(180_100%_98%/0.1)] transition-all"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CTASection;
