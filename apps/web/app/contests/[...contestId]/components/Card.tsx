'use client';

interface Props {
    name: string;
    onClick: () => void;
}

function ProblemCard(props: Props) {
    const { name, onClick } = props;

    return (
        <div className="bg-white border-2  border-black p-6 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
            <h3 className="text-xl font-bold text-black mb-4">{name}</h3>
            
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