import {
    Search, Video, Activity, QrCode, Truck, Camera,
    Clock, Building
} from 'lucide-react';

const features = [
    {
        icon: Search,
        title: "Marketplace",
        description: "Book appointments and discover healthcare services through Crescere integration.",
    },
    {
        icon: Video,
        title: "Telemedicine",
        description: "Consult doctors remotely from the comfort of your home.",
    },
    {
        icon: Activity,
        title: "Live Queue Status",
        description: "Know exactly how late your appointment is running. Arrive when the doctor is ready.",
    },
    {
        icon: QrCode,
        title: "Health ID & QR",
        description: "All your details accessible via QR code. Digital prescriptions, records, reports.",
    },
    {
        icon: Truck,
        title: "Ambulance Booking",
        description: "Nearest available ambulance operators pinged as soon as you book.",
    },
    {
        icon: Camera,
        title: "AI Document Scanner",
        description: "Digitalize photos of reports and prescriptions. Saved as PDF documents.",
    },
    {
        icon: Clock,
        title: "24/7 Services",
        description: "Clear information about emergency and night-time consultations with rates and distance.",
    },
    {
        icon: Building,
        title: "Bed Availability",
        description: "Check available rooms, emergency beds, and rates in hospitals near you.",
    },
];

const FeaturesSection = () => {
    return (
        <section id="features" className="py-24" style={{ background: 'hsl(222 47% 6%)' }}>
            <div className="container mx-auto px-6">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <span className="text-[hsl(174_72%_56%)] font-medium text-sm uppercase tracking-wider mb-4 block">
                        Why Choose Us
                    </span>
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">
                        Everything You Need for{" "}
                        <span className="text-gradient">Better Healthcare</span>
                    </h2>
                    <p className="text-[hsl(220_20%_60%)] text-lg">
                        A comprehensive suite of tools to make your healthcare experience
                        seamless, efficient, and stress-free.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <div
                            key={feature.title}
                            className="group relative bg-card-gradient rounded-2xl p-8 border border-[hsl(222_30%_20%/0.5)] hover:border-[hsl(174_72%_56%/0.3)] transition-all duration-500 hover:-translate-y-1"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(174_72%_56%/0.05)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />

                            <div className="relative z-10">
                                <div className="w-14 h-14 rounded-2xl bg-[hsl(174_72%_56%/0.1)] flex items-center justify-center mb-6 group-hover:bg-[hsl(174_72%_56%/0.2)] group-hover:scale-110 transition-all">
                                    <feature.icon className="w-7 h-7 text-[hsl(174_72%_56%)]" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                                <p className="text-[hsl(220_20%_60%)] leading-relaxed">{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;
