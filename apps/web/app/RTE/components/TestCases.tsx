"use client";
import {useEffect, useState} from 'react';
import axios from 'axios';
import { useTestCaseStore } from '../../../store/testCaseStore';

interface Props {
    problemName: string
}

interface TestCase {
    id?: number;
    input: string;
    output: string;
}

interface CachedTestCases {
    data: TestCase[];
    timestamp: number;
}

const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

function TestCases(props: Props) {
    const { problemName } = props
    const [selectedCase, setSelectedCase] = useState(0)
    const [testCases, setTestCases] = useState<TestCase[]>([])
    const [loading, setLoading] = useState(true)

    // Zustand store
    const zustandTestCases = useTestCaseStore(state => state.testCases);
    const setZustandTestCases = useTestCaseStore(state => state.setTestCases);
    const updateStatus = useTestCaseStore(state => state.updateStatus);

    useEffect(() => {
        async function fetchTestCases() {
            try {
                const cacheKey = `testcases_${problemName}`;
                const cachedData = localStorage.getItem(cacheKey);

                if (cachedData) {
                    const parsed: CachedTestCases = JSON.parse(cachedData);
                    const now = Date.now();
                    if (now - parsed.timestamp < CACHE_EXPIRY_MS) {
                        setTestCases(parsed.data);
                        
                        setZustandTestCases(parsed.data.map((tc: TestCase, idx: number) => ({ ...tc, id: tc.id ?? idx + 1, status: null })));
                        setLoading(false);
                        return;
                    }
                }

                const response = await axios.get(`/api/problem/${problemName}/test-cases`);
                const testCasesData = response.data.testCases;
                setTestCases(testCasesData);
                setZustandTestCases(testCasesData.map((tc: any, idx: number) => ({ ...tc, id: tc.id ?? idx + 1, status: null })));
                const cacheData: CachedTestCases = {
                    data: testCasesData,
                    timestamp: Date.now(),
                };
                localStorage.setItem(cacheKey, JSON.stringify(cacheData));
            } catch (error) {
                console.error('Error fetching test cases:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchTestCases();
    }, [problemName]);

    // Helper for status icon
    const StatusDot = ({ status }: { status: string | null }) => {
        if (status === null || status === 'idle') return null;
        if (status === 'pending') return <span className="inline-block w-3 h-3 rounded-full bg-orange-500" title="Pending" />;
        if (status === 'failed') return <span className="inline-block w-3 h-3 rounded-full bg-red-500" title="Failed" />;
        if (status === 'passed') return <span className="inline-block w-3 h-3 rounded-full bg-green-500" title="Passed" />;
        return null;
    };

    // Check if any test case has failed or passed
    const hasResult = zustandTestCases.some((tc: any) => tc.status === 'failed' || tc.status === 'passed');

    if (loading) {
        return (
            <div className="w-[50vw] h-full flex items-center justify-center bg-neutral-900 border-b border-neutral-800 lg:border-b-0 lg:border-r">
                <p className="text-neutral-400">Loading test cases...</p>
            </div>
        );
    }

    return (
        <div className="w-[50vw]  flex flex-col bg-neutral-900 border-b border-neutral-800 lg:border-b-0 lg:border-r">
            <div className="flex border-b border-neutral-800 overflow-x-auto">
                {zustandTestCases.map((tc: any, idx: number) => (
                    <button
                        key={tc.id}
                        onClick={() => setSelectedCase(idx)}
                        className={`px-4 py-3 font-medium whitespace-nowrap flex items-center gap-2 transition-colors ${
                            selectedCase === idx
                                ? 'bg-neutral-800 text-white border-b-2 border-blue-500'
                                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                        }`}
                    >
                        Case {idx + 1}
                        <StatusDot status={tc.status} />
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                    <div>
                        <h3 className="text-sm font-semibold text-neutral-400 mb-2">Input:</h3>
                        <pre className="bg-neutral-800 p-3 rounded-lg text-neutral-200 text-sm overflow-x-auto border border-neutral-700">
                            {zustandTestCases[selectedCase]?.input || ''}
                        </pre>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-neutral-400 mb-2">Expected Output:</h3>
                        <pre className="bg-neutral-800 p-3 rounded-lg text-neutral-200 text-sm overflow-x-auto border border-neutral-700">
                            {zustandTestCases[selectedCase]?.output || ''}
                        </pre>
                    </div>

                    {hasResult && (zustandTestCases[selectedCase]?.status === 'failed' || zustandTestCases[selectedCase]?.status === 'passed') && (
                        <div>
                            <h3 className="text-sm font-semibold text-neutral-400 mb-2">Your Output:</h3>
                            <pre className="bg-neutral-800 p-3 rounded-lg text-neutral-200 text-sm overflow-x-auto border border-neutral-700">
                                {zustandTestCases[selectedCase]?.submissionResult || 'N/A'}
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TestCases;