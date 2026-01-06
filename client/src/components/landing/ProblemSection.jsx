import { FileX, Clock, ClipboardList } from 'lucide-react';

const problems = [
    {
        icon: FileX,
        title: "Lost Records",
        description: "Your medical files are scattered across hospitals, clinics, and labs. Finding old prescriptions or reports is a nightmare.",
    },
    {
        icon: Clock,
        title: "Long Wait Times",
        description: "Sitting for hours in crowded waiting rooms without knowing when you'll actually be seen by the doctor.",
    },
    {
        icon: ClipboardList,
        title: "Repetitive Forms",
        description: "Filling the same registration form every single time you visit a new hospital. Your information should travel with you.",
    },
];

const ProblemSection = () => {
    return (
        <section id="problem" className="py-24" style={{ background: 'hsl(222 40% 8%)' }}>
            <div className="container mx-auto px-6">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <span className="text-[hsl(174_72%_56%)] font-medium text-sm uppercase tracking-wider mb-4 block">
                        The Challenge
                    </span>
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">
                        Healthcare is <span className="text-gradient">Broken</span>
                    </h2>
                    <p className="text-[hsl(220_20%_60%)] text-lg">
                        The current healthcare experience is fragmented, frustrating,
                        and wastes your precious time.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {problems.map((problem, index) => (
                        <div
                            key={problem.title}
                            className="group bg-card-gradient rounded-2xl p-8 border border-[hsl(222_30%_20%/0.5)] hover:border-[hsl(174_72%_56%/0.3)] transition-all duration-500 hover:shadow-hover"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="w-14 h-14 rounded-xl bg-[hsl(174_72%_56%/0.1)] flex items-center justify-center mb-6 group-hover:bg-[hsl(174_72%_56%/0.2)] transition-colors">
                                <problem.icon className="w-7 h-7 text-[hsl(174_72%_56%)]" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">{problem.title}</h3>
                            <p className="text-[hsl(220_20%_60%)] leading-relaxed">{problem.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ProblemSection;
