"use client";
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

interface Props { }




function RulesPage(props: Props) {
    const { contestId } = useParams();
    if (!contestId || Array.isArray(contestId)) {
        return <div>Loading...</div>;
    }
    const router = useRouter();
    const rules = [
        {
            icon: "⏱️",
            title: "Duration & Questions",
            description: "This contest is of 2 hours duration and consists of 6 questions."
        },
        {
            icon: "💻",
            title: "Allowed Languages",
            description: "C, C++, Python, Java and Javascript are permitted."
        },
        {
            icon: "📝",
            title: "Submission Deadline",
            description: "All submissions must be made before the contest ends."
        },
        {
            icon: "🖥️",
            title: "Full Screen Mode",
            description: "You must attempt this contest in full screen mode. No external tools or resources are allowed."
        },
        {
            icon: "🚫",
            title: "Tab Switching Prohibited",
            description: "Tab switching is not allowed during the contest. Doing so will result in disqualification."
        },
        {
            icon: "👁️",
            title: "Proctoring Active",
            description: "Multiple software proctoring and monitoring tools will be active during the contest. Exiting full screen or tab switching will be detected and may result in disqualification."
        },
        {
            icon: "✅",
            title: "Agreement",
            description: "By participating in this contest, you agree to abide by the rules and decisions of the contest organizers."
        }
    ];

    const handleOnClick = async () => {
        try {
            if (document.fullscreenEnabled && !document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
            }
        } catch (err) {
            console.warn("Fullscreen request failed:", err);
        }
        router.push(`/contests/${contestId}/problemspage`);
    };

    return (
        <div className="min-h-screen bg-white text-black overflow-auto">

            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="text-center mb-16">
                    <div className="inline-block mb-4">
                        <span className="text-6xl">📋</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4 text-black">
                        Contest Rules
                    </h1>
                    <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
                        Please read and understand the following rules carefully before entering the contest
                    </p>
                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                    {rules.map((rule, index) => (
                        <div
                            key={index}
                            className="group bg-white border-2 border-black rounded-2xl p-6 hover:bg-black hover:text-white transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                        >
                            <div className="flex items-start gap-4">
                                <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                                    {rule.icon}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold mb-2 text-black group-hover:text-white transition-colors">
                                        {rule.title}
                                    </h3>
                                    <p className="text-neutral-600 group-hover:text-neutral-200 leading-relaxed transition-colors">
                                        {rule.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>


                <div className="bg-white border-2 border-black rounded-2xl p-6 mb-12">
                    <div className="flex items-start gap-4">
                        <div className="text-3xl">⚠️</div>
                        <div>
                            <h3 className="text-xl font-semibold mb-2 text-black">Important Notice</h3>
                            <p className="text-neutral-700 leading-relaxed">
                                Any violation of the above rules may result in immediate disqualification.
                                The decision of the contest organizers is final and binding.
                            </p>
                        </div>
                    </div>
                </div>


                <div className="flex flex-col items-center gap-6">
                    <button onClick={handleOnClick} className="group relative px-8 py-4 bg-black text-white border-2 border-black rounded-xl font-bold text-lg hover:bg-white hover:text-black transition-all duration-300 hover:shadow-2xl hover:scale-105 active:scale-95">
                        <span className="relative z-10 flex items-center gap-2">
                            Enter Contest
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </span>
                    </button>
                    <p className="text-sm text-neutral-500">
                        By clicking "Enter Contest", you acknowledge that you have read and agree to all the rules
                    </p>
                </div>
            </div>
        </div>
    )
}

export default RulesPage
