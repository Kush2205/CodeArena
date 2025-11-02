'use client';

import { useEffect, useState } from 'react';

interface Props {
    title: string
    started?: boolean
    startTime?: string
    endTime?: string
    
    onClick: () => void
}

function ContestCard(props: Props) {
    const { title, started, startTime, endTime, onClick } = props;
    const [timeLeft, setTimeLeft] = useState('');
    const [contestStatus, setContestStatus] = useState<'upcoming' | 'live' | 'ended'>('upcoming');

    useEffect(() => {
        const updateCountdown = () => {
            const now = new Date().getTime();
            const start = new Date(startTime ?? '').getTime();
            const end = new Date(endTime ?? '').getTime();

            if (now < start) {
                setContestStatus('upcoming');
                const distance = start - now;
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
            } else if (now >= start && now < end) {
                setContestStatus('live');
                const distance = end - now;
                const hours = Math.floor(distance / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
            } else {
                setContestStatus('ended');
                setTimeLeft('Contest Ended');
            }
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);

        return () => clearInterval(interval);
    }, [startTime, endTime]);

    return (
        <div className="bg-white border-2 border-zinc-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-black">{title}</h3>
                <div className="flex items-center gap-2">
                    <div
                        className={`w-3 h-3 rounded-full ${
                            contestStatus === 'live'
                                ? 'bg-green-500'
                                : contestStatus === 'ended'
                                ? 'bg-red-500'
                                : 'bg-gray-400'
                        }`}
                    />
                    <span className="text-sm font-medium text-black">
                        {contestStatus === 'live'
                            ? 'Started'
                            : contestStatus === 'ended'
                            ? 'Ended'
                            : 'Upcoming'}
                    </span>
                </div>
            </div>

            <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">
                    {contestStatus === 'upcoming' ? 'Starts in:' : contestStatus === 'live' ? 'Ends in:' : ''}
                </p>
                <p className="text-2xl font-mono font-bold text-black">{timeLeft}</p>
            </div>

            <button
                onClick={onClick}
                disabled={contestStatus === 'ended'}
                className={`w-full py-3 px-4 rounded-lg font-bold transition-all ${
                    contestStatus === 'ended'
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-black text-white hover:bg-zinc-800'
                }`}
            >
                {contestStatus === 'ended' ? 'Contest Ended' : 'Enter Contest'}
            </button>
        </div>
    );
}

export default ContestCard;