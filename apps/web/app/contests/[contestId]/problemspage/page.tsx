'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import ProblemCard from "../components/Card";
import ProctoringGuard from "./components/ProctoringGuard";

const CACHE_EXPIRY_MS = 5 * 60 * 1000;

interface Problem {
    id: number;
    name: string;
    solved?: boolean | null;
}

interface ContestMeta {
    id: number;
    name: string;
    proctoringEnabled: boolean;
    endTime: string | null;
}

interface UserStats {
    totalPoints: number;
    totalSubmissions: number;
    solvedProblems: number;
}

interface CachedProblems {
    problems?: Problem[];
    contest?: ContestMeta | null;
    data?: Problem[]; // legacy cache shape
    timestamp: number;
}

export default function ProblemsPage() {
    const [problems, setProblems] = useState<Problem[]>([]);
    const [loading, setLoading] = useState(true);
    const [contestMeta, setContestMeta] = useState<ContestMeta | null>(null);
    const [userStats, setUserStats] = useState<UserStats | null>(null);
    const [countdown, setCountdown] = useState<string | null>(null);
    const [contestEnded, setContestEnded] = useState(false);
    const router = useRouter();
    const { contestId } = useParams();
    const contestIdParam = Array.isArray(contestId) ? contestId[0] : contestId;

    useEffect(() => {
        if (typeof window === "undefined" || !contestIdParam || !contestMeta?.proctoringEnabled) {
            return;
        }

        const redirectToProblems = () => {
            router.replace(`/contests/${contestIdParam}/problemspage`);
            window.history.pushState(null, "", window.location.href);
        };

        const blockBackNavigation = () => {
            redirectToProblems();
        };

        window.history.pushState(null, "", window.location.href);
        window.addEventListener("popstate", blockBackNavigation);

        return () => {
            window.removeEventListener("popstate", blockBackNavigation);
        };
    }, [contestIdParam, router, contestMeta?.proctoringEnabled]);

    useEffect(() => {
        const fetchProblems = async () => {
            let servedFromCache = false;
            try {
                const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
                const cacheKeyBase = `problems_contest_${contestIdParam}`;
                const cacheKey = token ? `${cacheKeyBase}_${token}` : cacheKeyBase;

                let cachedData: string | null = null;
                if (typeof window !== "undefined") {
                    cachedData = localStorage.getItem(cacheKey);
                    if (!cachedData && token) {
                        const legacyCache = localStorage.getItem(cacheKeyBase);
                        if (legacyCache) {
                            cachedData = legacyCache;
                        }
                    }
                }

                if (cachedData) {
                    const parsed: CachedProblems = JSON.parse(cachedData);
                    const now = Date.now();

                    if (now - parsed.timestamp < CACHE_EXPIRY_MS) {
                        const cachedProblems = Array.isArray(parsed.problems)
                            ? parsed.problems
                            : Array.isArray(parsed.data)
                                ? parsed.data
                                : [];
                        const cachedContest: ContestMeta | null = parsed.contest ?? null;

                        if (cachedProblems.length > 0) {
                            setProblems(cachedProblems);
                        }
                        if (cachedContest) {
                            setContestMeta(cachedContest);
                        }
                        setLoading(false);
                        servedFromCache = true;
                    }
                }

                const headers = token
                    ? {
                          Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
                      }
                    : undefined;

                const response = await axios.get(`/api/contest/getProblems?contestId=${contestIdParam}` , {
                    headers,
                });
                const problemsData: Problem[] = response.data.problems ?? [];
                const contestData: ContestMeta | null = response.data.contest ?? null;
                setProblems(problemsData);
                setContestMeta(contestData);

                if (typeof window !== "undefined") {
                    const cacheData: CachedProblems = {
                        problems: problemsData,
                            contest: contestData,
                        timestamp: Date.now(),
                    };
                    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
                    if (token && cacheKey !== cacheKeyBase) {
                        localStorage.removeItem(cacheKeyBase);
                    }
                }
            } catch (error) {
                console.error("Error fetching problems:", error);
                setContestMeta((prev) => prev ?? null);
            } finally {
                if (!servedFromCache) {
                    setLoading(false);
                }
            }
        };

        if (contestIdParam) {
            void fetchProblems();
        }
    }, [contestIdParam]);

    useEffect(() => {
        const fetchUserStats = async () => {
            try {
                const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
                if (!token) return;

                const headers = {
                    Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
                };

                const response = await axios.get('/api/user/stats', { headers });
                setUserStats(response.data);
            } catch (error) {
                console.error("Error fetching user stats:", error);
            }
        };

        void fetchUserStats();
    }, []);

    useEffect(() => {
        if (!contestMeta?.endTime) {
            setCountdown(null);
            setContestEnded(false);
            return;
        }

        const target = new Date(contestMeta.endTime).getTime();
        let intervalId: number | null = null;

        const updateCountdown = () => {
            const now = Date.now();
            const diff = target - now;

            if (Number.isNaN(target) || diff <= 0) {
                setCountdown("Contest ended");
                setContestEnded(true);
                if (intervalId !== null) {
                    window.clearInterval(intervalId);
                    intervalId = null;
                }
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setCountdown(`${hours.toString().padStart(2, "0")}:${minutes
                .toString()
                .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`);
            setContestEnded(false);
        };

        updateCountdown();
        intervalId = window.setInterval(updateCountdown, 1000);

        return () => {
            if (intervalId !== null) {
                window.clearInterval(intervalId);
            }
        };
    }, [contestMeta?.endTime]);

    const primaryProblemId = problems[0]?.id;

    const pageContent = (
        <div className="relative min-h-screen bg-white p-8 pb-24">
            <div className="max-w-6xl mx-auto">
                {loading ? (
                    <p className="text-center text-white">Loading problems...</p>
                ) : (
                    <>
                        <div className="mb-8">
                            <h1 className="text-7xl font-bold mb-4 text-black text-center border-b-4 border-black pb-4">
                                Contest Problems
                            </h1>
                            {userStats && (
                                <div className="mt-6 flex justify-center gap-4">
                                    <div className="bg-neutral-50 border-2 border-black px-6 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                        <div className="text-sm text-gray-600 font-medium">Total Points</div>
                                        <div className="text-3xl font-bold text-green-700">{userStats.totalPoints}</div>
                                    </div>
                                    <div className="bg-neutral-50 border-2 border-black px-6 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                        <div className="text-sm text-gray-600 font-medium">Problems Solved</div>
                                        <div className="text-3xl font-bold text-blue-700">{userStats.solvedProblems}</div>
                                    </div>
                                    <div className="bg-neutral-50 border-2 border-black px-6 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                        <div className="text-sm text-gray-600 font-medium">Submissions</div>
                                        <div className="text-3xl font-bold text-purple-700">{userStats.totalSubmissions}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {problems.map((problem) => (
                                <ProblemCard
                                    key={problem.id}
                                    name={problem.name}
                                    solved={(problem as { solved?: boolean }).solved ?? false}
                                    onClick={() => {
                                        router.push(`/contests/${contestIdParam}/problemspage/RTE?problem=${problem.name}`);
                                    }}
                                />
                            ))}
                        </div>
                        {problems.length === 0 && (
                            <p className="text-center text-white mt-8">
                                No problems available for this contest.
                            </p>
                        )}
                    </>
                )}
            </div>
            {contestMeta && (
                <div className="absolute inset-x-0 bottom-0 bg-black text-white">
                    <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-8 py-4">
                        <span className="text-lg font-semibold">Time Remaining</span>
                        <span
                            className={`text-2xl font-bold ${contestEnded ? "text-red-400" : "text-green-400"}`}
                        >
                            {countdown ?? "--:--:--"}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );

    if (contestMeta?.proctoringEnabled) {
        return (
            <ProctoringGuard contestId={contestIdParam} problemId={primaryProblemId}>
                {pageContent}
            </ProctoringGuard>
        );
    }

    return pageContent;
}