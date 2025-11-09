'use client';

import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import axios from "axios";
import { useSubmissionStore } from "../../../../../../store/submissionStore";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export const ProblemStatement = ({ 
    content, 
    contestId, 
    problemName,
    difficulty,
    totalPoints 
}: { 
    content: string; 
    contestId: string | undefined; 
    problemName: string;
    difficulty?: string;
    totalPoints?: number;
}) => {
    const [activeTab, setActiveTab] = useState<'problem' | 'submissions' | 'results'>('problem');
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);
    const [problemId, setProblemId] = useState<string | null>(null);

    useEffect(() => {
        const getProblemId = () => {
            try {
                const token = localStorage.getItem('token');
                const cacheKeyBase = `problems_contest_${contestId}`;
                const cacheKey = token ? `${cacheKeyBase}_${token}` : cacheKeyBase;
                let cachedProblems = localStorage.getItem(cacheKey);
                if (!cachedProblems && token) {
                    cachedProblems = localStorage.getItem(cacheKeyBase);
                }
                if (cachedProblems) {
                    const parsed = JSON.parse(cachedProblems) as {
                        problems?: Array<{ id: number; name: string }>;
                        data?: Array<{ id: number; name: string }>;
                    };
                    const cachedList = Array.isArray(parsed.problems)
                        ? parsed.problems
                        : Array.isArray(parsed.data)
                            ? parsed.data
                            : [];
                    const problem = cachedList.find((p) => p.name === problemName);
                    if (problem) {
                        setProblemId(problem.id.toString());
                        return;
                    }
                }

                const cachedProblemId = localStorage.getItem(`problemId_${problemName}`);
                if (cachedProblemId) {
                    setProblemId(cachedProblemId);
                    return;
                }

                const fetchProblemId = async () => {
                    try {
                        const response = await axios.get(`/api/problem/${encodeURIComponent(problemName)}/id`);
                        const id = response.data.id;
                        localStorage.setItem(`problemId_${problemName}`, id.toString());
                        setProblemId(id.toString());
                    } catch (error) {
                        console.error('Error fetching problem ID:', error);
                    }
                };
                fetchProblemId();
            } catch (error) {
                console.error('Error parsing cached problems:', error);
            }
        };

        getProblemId();
    }, [problemName, contestId]);

    const fetchSubmissions = async () => {
        try {
            setLoadingSubmissions(true);
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            
            if (problemId) {
                params.append('problemId', problemId);
            } else {
                params.append('problemName', problemName);
            }
            
            if (contestId) {
                params.append('contestId', contestId);
            }

            const response = await axios.get(`/api/fetchSubmissions?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setSubmissions(response.data);
        } catch (error) {
            console.error("Error fetching submissions:", error);
            setSubmissions([]);
        } finally {
            setLoadingSubmissions(false);
        }
    };

    const submissionResults = useSubmissionStore(state => state.results);
    const submissionStatus = useSubmissionStore(state => state.status);
    const totalTestCases = useSubmissionStore(state => state.totalTestCases);
    const passedTestCases = useSubmissionStore(state => state.passedTestCases);
    const failedTestCases = useSubmissionStore(state => state.failedTestCases);
    const points = useSubmissionStore(state => state.points);
    const pointsAwarded = useSubmissionStore(state => state.pointsAwarded);
    const newTestCasesPassed = useSubmissionStore(state => state.newTestCasesPassed);
    const alreadySolved = useSubmissionStore(state => state.alreadySolved);

    useEffect(() => {
        if (activeTab === 'submissions' && problemId !== null) {
            fetchSubmissions();
        }
    }, [activeTab, problemId]);

    // Auto-switch to results tab when submission starts
    useEffect(() => {
        if (submissionStatus === 'polling') {
            setActiveTab('results');
        }
    }, [submissionStatus]);

    return (
        <div className="w-[50vw] h-full flex flex-col bg-neutral-900 border-b border-neutral-800 lg:border-b-0 lg:border-r">
            <div className="flex border-b border-neutral-800">
                <button
                    onClick={() => setActiveTab('problem')}
                    className={`px-6 py-3 font-semibold transition-colors ${
                        activeTab === 'problem'
                            ? 'bg-neutral-800 text-white border-b-2 border-blue-500'
                            : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                >
                    Problem
                </button>
                <button
                    onClick={() => setActiveTab('results')}
                    className={`px-6 py-3 font-semibold transition-colors ${
                        activeTab === 'results'
                            ? 'bg-neutral-800 text-white border-b-2 border-blue-500'
                            : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                >
                    Results {submissionStatus === 'polling' && <span className="ml-2 text-xs">(Running...)</span>}
                </button>
                <button
                    onClick={() => setActiveTab('submissions')}
                    className={`px-6 py-3 font-semibold transition-colors ${
                        activeTab === 'submissions'
                            ? 'bg-neutral-800 text-white border-b-2 border-blue-500'
                            : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                >
                    Submissions
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'problem' ? (
                    <>
                        {/* Difficulty and Points Badge */}
                        {(difficulty || totalPoints) && (
                            <div className="flex gap-3 mb-6">
                                {difficulty && (
                                    <span
                                        className={`inline-block px-4 py-2 rounded-lg border-2 font-bold text-sm ${
                                            difficulty === 'easy'
                                                ? 'bg-green-500/10 text-green-400 border-green-500'
                                                : difficulty === 'medium'
                                                ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500'
                                                : 'bg-red-500/10 text-red-400 border-red-500'
                                        }`}
                                    >
                                        {difficulty.toUpperCase()}
                                    </span>
                                )}
                                {totalPoints && (
                                    <span className="inline-block px-4 py-2 rounded-lg border-2 border-blue-500 bg-blue-500/10 text-blue-400 font-bold text-sm">
                                        🎯 {totalPoints} Points
                                    </span>
                                )}
                            </div>
                        )}
                        <article className="prose prose-invert prose-neutral max-w-none
                        prose-headings:text-white prose-headings:font-bold
                        prose-h2:text-2xl prose-h2:mb-4
                        prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                        prose-h4:text-lg prose-h4:mt-4 prose-h4:mb-2
                        prose-h5:text-base prose-h5:mt-3 prose-h5:mb-2 prose-h5:text-neutral-400
                        prose-p:text-neutral-300 prose-p:leading-7
                        prose-code:bg-neutral-800 prose-code:text-neutral-200 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                        prose-pre:bg-neutral-800 prose-pre:border prose-pre:border-neutral-700 prose-pre:rounded-lg
                        prose-strong:text-white prose-strong:font-semibold
                        prose-ul:list-disc prose-ul:ml-6 prose-ul:text-neutral-300
                        prose-ol:list-decimal prose-ol:ml-6 prose-ol:text-neutral-300
                        prose-li:text-neutral-300
                        prose-blockquote:border-l-4 prose-blockquote:border-neutral-600 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-neutral-400
                    ">
                        <Markdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeHighlight]}
                        >
                            {content}
                        </Markdown>
                    </article>
                    </>
                ) : activeTab === 'results' ? (
                    <div className="text-neutral-300">
                        <h2 className="text-2xl font-bold text-white mb-4">Submission Results</h2>
                        
                        {submissionStatus === 'idle' && (
                            <p className="text-neutral-400">Submit your code to see results here.</p>
                        )}

                        {submissionStatus === 'submitting' && (
                            <div className="flex items-center gap-3 text-neutral-400">
                                <Loader2 className="animate-spin" size={20} />
                                <span>Submitting your code...</span>
                            </div>
                        )}

                        {(submissionStatus === 'polling' || submissionStatus === 'completed') && (
                            <div>
                                <div className="mb-6 p-4 bg-neutral-800 rounded-lg border border-neutral-700">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-lg font-semibold">
                                            Test Cases: {passedTestCases}/{totalTestCases} Passed
                                        </span>
                                        {submissionStatus === 'polling' && (
                                            <Loader2 className="animate-spin text-blue-400" size={20} />
                                        )}
                                    </div>
                                    
                                    {submissionStatus === 'completed' && (
                                        <div className="mt-3 pt-3 border-t border-neutral-700">
                                            {pointsAwarded && points > 0 ? (
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-green-400">
                                                        <CheckCircle size={20} />
                                                        <span className="font-bold text-xl">+{points} Points Earned! 🎉</span>
                                                    </div>
                                                    {newTestCasesPassed > 0 && newTestCasesPassed < passedTestCases && (
                                                        <div className="text-sm text-yellow-400 ml-7">
                                                            {newTestCasesPassed} new test case{newTestCasesPassed !== 1 ? 's' : ''} passed ({passedTestCases - newTestCasesPassed} already passed before)
                                                        </div>
                                                    )}
                                                </div>
                                            ) : alreadySolved && passedTestCases > 0 ? (
                                                <div className="flex items-center gap-2 text-yellow-400">
                                                    <span className="text-sm">
                                                        {passedTestCases === totalTestCases 
                                                            ? '✓ All test cases already passed before - No new points'
                                                            : `All ${passedTestCases} passed test case${passedTestCases !== 1 ? 's were' : ' was'} already solved before - No new points`
                                                        }
                                                    </span>
                                                </div>
                                            ) : failedTestCases > 0 ? (
                                                <div className="flex items-center gap-2 text-red-400">
                                                    <XCircle size={20} />
                                                    <span className="font-bold">No points - {failedTestCases} test case{failedTestCases !== 1 ? 's' : ''} failed</span>
                                                </div>
                                            ) : null}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    {submissionResults.map((result, index) => (
                                        <div key={index} className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <span className="font-semibold text-white">
                                                        Test Case {result.testCaseNumber}
                                                    </span>
                                                    {result.status === 'pending' && (
                                                        <Loader2 className="animate-spin text-orange-400" size={18} />
                                                    )}
                                                    {result.status === 'passed' && (
                                                        <CheckCircle className="text-green-400" size={18} />
                                                    )}
                                                    {result.status === 'failed' && (
                                                        <XCircle className="text-red-400" size={18} />
                                                    )}
                                                </div>
                                                <span className={`text-sm font-medium ${
                                                    result.status === 'passed' ? 'text-green-400' :
                                                    result.status === 'failed' ? 'text-red-400' :
                                                    'text-orange-400'
                                                }`}>
                                                    {result.statusDescription}
                                                </span>
                                            </div>

                                            {result.status === 'failed' && result.output && (
                                                <div className="mt-3 p-3 bg-neutral-900 rounded border border-neutral-700">
                                                    <h4 className="text-sm font-semibold text-red-400 mb-2">Error Details:</h4>
                                                    <pre className="text-xs text-neutral-300 whitespace-pre-wrap">{result.output}</pre>
                                                </div>
                                            )}

                                            {result.time !== null && (
                                                <div className="mt-2 text-xs text-neutral-400">
                                                    Time: {result.time}s {result.memory && `| Memory: ${result.memory} KB`}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {submissionStatus === 'failed' && (
                            <p className="text-red-400">Submission failed. Please try again.</p>
                        )}
                    </div>
                ) : (
                    <div className="text-neutral-300">
                        <h2 className="text-2xl font-bold text-white mb-4">Your Submissions</h2>
                        {loadingSubmissions ? (
                            <p className="text-neutral-400">Loading submissions...</p>
                        ) : submissions.length === 0 ? (
                            <p className="text-neutral-400">No submissions yet</p>
                        ) : (
                            <div className="space-y-4">
                                {submissions.map((sub: any , index: number) => (
                                    <div key={sub.id} className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
                                        <div className="text-2xl font-bold">{`${index + 1}. ${sub.id}`}</div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className={`font-medium ${
                                                sub.status === 'accepted' ? 'text-green-400' :
                                                sub.status === 'wrong_answer' ? 'text-red-400' :
                                                sub.status === 'time_limit_exceeded' ? 'text-yellow-400' :
                                                'text-blue-400'
                                            }`}>
                                                {sub.status || 'Processing'}
                                            </span>
                                            <span className="text-sm text-neutral-400">
                                                {new Date(sub.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span>
                                                {sub.passedTestCases || 0}/{sub.totalTestCases || 0} tests passed
                                            </span>
                                            <span className="text-neutral-400">{sub.language}</span>
                                        </div>
                                        {sub.verdict && (
                                            <div className="mt-2 text-sm text-neutral-400">
                                                {sub.verdict}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};