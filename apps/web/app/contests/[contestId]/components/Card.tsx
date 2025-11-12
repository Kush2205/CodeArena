'use client';

import { Check } from "lucide-react";

interface Props {
    name: string;
    onClick: () => void;
    solved?: boolean;
}

function ProblemCard(props: Props) {
    const { name, onClick, solved = false } = props;

    return (
        <div className="bg-white border-2  border-black p-6 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
            <div className="flex items-start justify-between gap-3 mb-4">
                <h3 className="text-xl font-bold text-black">{name}</h3>
                {solved && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-green-600 bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Solved</span>
                    </span>
                )}
            </div>
            
            <button
                onClick={onClick}
                className="w-full rounded-xl py-3 px-4 border-2 border-black font-bold transition-all bg-black text-white hover:bg-white hover:text-black"
            >
                Solve
            </button>
        </div>
    );
}

export default ProblemCard;