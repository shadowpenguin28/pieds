import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="py-16 border-t border-[hsl(222_30%_20%)]" style={{ background: 'hsl(222 47% 6%)' }}>
            <div className="container mx-auto px-6">
                <div className="grid md:grid-cols-4 gap-12">
                    {/* Brand */}
                    <div className="md:col-span-2">
                        <Link to="/" className="text-2xl font-bold text-gradient">
                            Crescere
                        </Link>
                        <p className="text-[hsl(220_20%_60%)] mt-4 max-w-md">
                            Connecting India's healthcare ecosystem. Unified health records,
                            seamless appointments, and better patient experiences.
                        </p>
                        <div className="flex gap-4 mt-6">
                            <a href="#" className="w-10 h-10 rounded-full glass glass-border flex items-center justify-center hover:bg-[hsl(174_72%_56%/0.2)] transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full glass glass-border flex items-center justify-center hover:bg-[hsl(174_72%_56%/0.2)] transition-colors">
                                <Linkedin className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full glass glass-border flex items-center justify-center hover:bg-[hsl(174_72%_56%/0.2)] transition-colors">
                                <Github className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-semibold mb-4">Product</h4>
                        <ul className="space-y-3 text-[hsl(220_20%_60%)]">
                            <li><Link to="/" className="hover:text-[hsl(174_72%_56%)] transition-colors">For Patients</Link></li>
                            <li><Link to="/hsp" className="hover:text-[hsl(174_72%_56%)] transition-colors">For Healthcare Providers</Link></li>
                            <li><Link to="/developers" className="hover:text-[hsl(174_72%_56%)] transition-colors">For Developers</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Company</h4>
                        <ul className="space-y-3 text-[hsl(220_20%_60%)]">
                            <li><a href="#" className="hover:text-[hsl(174_72%_56%)] transition-colors">About</a></li>
                            <li><a href="#" className="hover:text-[hsl(174_72%_56%)] transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-[hsl(174_72%_56%)] transition-colors">Terms of Service</a></li>
                            <li><a href="mailto:hello@crescere.health" className="hover:text-[hsl(174_72%_56%)] transition-colors flex items-center gap-2">
                                <Mail className="w-4 h-4" /> Contact
                            </a></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-[hsl(222_30%_20%)] flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-[hsl(220_20%_60%/0.6)] text-sm">
                        © 2026 Crescere. All rights reserved.
                    </p>
                    <p className="text-[hsl(220_20%_60%/0.6)] text-sm">
                        Built with ❤️ for India's healthcare
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
