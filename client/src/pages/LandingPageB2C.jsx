import HeroSection from '../components/landing/HeroSection';
import ProblemSection from '../components/landing/ProblemSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import CTASection from '../components/landing/CTASection';
import Footer from '../components/landing/Footer';

const LandingPageB2C = () => {
    return (
        <div className="min-h-screen" style={{ background: 'hsl(222 47% 6%)' }}>
            <HeroSection />
            <ProblemSection />
            <FeaturesSection />
            <CTASection />
            <Footer />
        </div>
    );
};

export default LandingPageB2C;
