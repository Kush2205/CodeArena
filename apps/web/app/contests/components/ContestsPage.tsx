'use client';

import ContestCard from "./Card";
import axios from "axios";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const CACHE_KEY = 'contests_cache';
const CACHE_EXPIRY_MS = 5 * 60 * 1000; 
interface Contest {
    id: number;
    name: string;
    started: boolean;
    StartTime: string;
    EndTime: string;
}

interface CachedData {
    data: Contest[];
    timestamp: number;
}

export default function ContestPage() {
    const [contests, setContests] = useState<Contest[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchContests = async () => {
            try {
                
                const cachedData = localStorage.getItem(CACHE_KEY);
                if (cachedData) {
                    const parsed: CachedData = JSON.parse(cachedData);
                    const now = Date.now();
                    
                   
                    if (now - parsed.timestamp < CACHE_EXPIRY_MS) {
                        setContests(parsed.data);
                        setLoading(false);
                        return;
                    }
                }

                
                const response = await axios.get("/api/contest/getcontests");
                const contestsData = response.data;
                console.log("Fetched contests:", contestsData);
                
                setContests(contestsData);
                
                
                const cacheData: CachedData = {
                    data: contestsData,
                    timestamp: Date.now()
                };
                localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
                
            } catch (error) {
                console.error("Error fetching contests:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchContests();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-white p-8">
                <div className="max-w-6xl mx-auto">
                    <p className="text-center text-gray-600">Loading contests...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen  p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-7xl font-bold mb-8 text-black text-center border-b-4 border-black pb-4">
                    Contests
                </h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {contests.map((contest) => (
                        <ContestCard
                            key={contest.id}
                            title={contest.name}
                            started={contest.started}
                            startTime={contest.StartTime}
                            endTime={contest.EndTime}
                            onClick={() => {
                                router.push(`/contests/${contest.id}`);
                            }}
                        />
                    ))}
                </div>
                {contests.length === 0 && (
                    <p className="text-center text-gray-600 mt-8">
                        No contests available at the moment.
                    </p>
                )}
            </div>
        </div>
    );
}