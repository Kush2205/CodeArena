"use client";
import {useEffect, useState} from 'react';
import axios from 'axios';

interface Props {
    problemName: string
}

function TestCases(props: Props) {
    const { problemName } = props
    const [selectedCase, setSelectedCase] = useState(0)

    const [testCases, setTestCases] = useState<{ input: string; output: string }[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchTestCases() {
            try {
                const response = await axios.get(`/api/problem/${problemName}/test-cases`);
                setTestCases(response.data.testCases);
            } catch (error) {
                console.error('Error fetching test cases:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchTestCases();
    }, [problemName]);

    useEffect(() => {
        if (testCases.length > 0) {
            setSelectedCase(0);
        }
    }, [testCases.length]);

    const displayedCases = testCases.slice(0, 3)

    return (
        <div className="flex flex-col max-h-[32vh] w-full bg-neutral-900 text-white border-t border-neutral-800 min-h-0">
            <div className="flex gap-2 p-3 border-b border-neutral-800 overflow-x-auto">
                {displayedCases.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setSelectedCase(index)}
                        className={`px-4 py-2 rounded-md transition-colors ${
                            selectedCase === index
                                ? 'bg-neutral-700 text-white'
                                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-750'
                        }`}
                    >
                        Case {index + 1}
                    </button>
                ))}
            </div>

            {/* Test Case Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                    <div className="text-sm text-neutral-400">Loading test cases...</div>
                ) : (
                    <>
                        <div>
                            <label className="block text-sm font-semibold text-neutral-300 mb-2">
                                Input:
                            </label>
                            <pre className="bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-sm text-neutral-200 overflow-x-auto">
                                {displayedCases[selectedCase]?.input || 'No input'}
                            </pre>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-neutral-300 mb-2">
                                Expected Output:
                            </label>
                            <pre className="bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-sm text-neutral-200 overflow-x-auto">
                                {displayedCases[selectedCase]?.output || 'No output'}
                            </pre>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default TestCases