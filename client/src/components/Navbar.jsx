import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-brand-dark/50 border-b border-brand-cream/10">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                <Link to="/" className="text-xl font-bold bg-gradient-to-r from-brand-mint to-brand-cream bg-clip-text text-transparent">
                    UHI App
                </Link>
                <div className="flex gap-6 text-sm font-medium text-brand-cream/70">
                    <Link to="/" className="hover:text-brand-mint transition-colors">For Patients</Link>
                    <Link to="/business" className="hover:text-brand-mint transition-colors">For Business</Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
