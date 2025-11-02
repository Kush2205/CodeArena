'use client';

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import ProblemCard from "./Card";
const CACHE_EXPIRY_MS = 5 * 60 * 1000;

interface Problem {
    id: number;
    name: string;
}

interface CachedProblems {
    data: Problem[];
    timestamp: number;
}

interface Props {
    contestId: string;
}

export default function ProblemsPage({ contestId }: Props) {
    const [problems, setProblems] = useState<Problem[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                const cacheKey = `problems_contest_${contestId}`;
                const cachedData = localStorage.getItem(cacheKey);

                if (cachedData) {
                    const parsed: CachedProblems = JSON.parse(cachedData);
                    const now = Date.now();



                    if (now - parsed.timestamp < CACHE_EXPIRY_MS) {
                        setProblems(parsed.data);
                        setLoading(false);
                        return;
                    }
                }

                const response = await axios.get(`/api/contest/getProblems?contestId=${contestId}`);
                const problemsData = response.data;

                setProblems(problemsData);

                const cacheData: CachedProblems = {
                    data: problemsData,
                    timestamp: Date.now(),
                };
                localStorage.setItem(cacheKey, JSON.stringify(cacheData));
            } catch (error) {
                console.error("Error fetching problems:", error);
            } finally {
                setLoading(false);
            }
        };

        if (contestId) {
            fetchProblems();
        }
    }, [contestId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white p-8">
                <div className="max-w-6xl mx-auto">
                    <p className="text-center text-white">Loading problems...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-7xl font-bold mb-8 text-black text-center border-b-4 border-black pb-4">
                    Contest Problems
                </h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {problems.map((problem) => (
                        <ProblemCard
                            key={problem.id}
                            name={problem.name}
                            onClick={() => {
                                router.push(`/RTE/?contestId=${contestId}&problem=${problem.name}`);
                            }}
                        />
                    ))}
                </div>
                {problems.length === 0 && (
                    <p className="text-center text-white mt-8">
                        No problems available for this contest.
                    </p>
                )}
            </div>
        </div>
    );
}