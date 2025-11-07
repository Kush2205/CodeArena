"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type * as monacoType from "monaco-editor";
import { Poppins } from "next/font/google";
import axios from "axios";
import { useTestCaseStore } from "../../../../../../store/testCaseStore";
import { useSubmissionStore } from "../../../../../../store/submissionStore";

interface Props {
    problemName: string;
    contestId?: string;
}

type LanguageKey = "cpp" | "python" | "java" | "javascript";

type BoilerplateResponse = {
    boilerplateCodeCpp: string | null;
    boilerplateCodePython: string | null;
    boilerplateCodeJava: string | null;
    boilerplateCodeJavaScript: string | null;
};

interface CachedBoilerplate {
    data: BoilerplateResponse;
    timestamp: number;
}

type ContestProblemsCache = {
    problems?: Array<{ id: number; name: string; solved?: boolean }>;
    data?: Array<{ id: number; name: string; solved?: boolean }>;
    contest?: unknown;
    timestamp: number;
};

const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "700"] });

const languageOptions: Array<{ value: LanguageKey; label: string }> = [
    { value: "cpp", label: "C++" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "javascript", label: "JavaScript" },
];

const monacoLanguageMap: Record<LanguageKey, string> = {
    cpp: "cpp",
    python: "python",
    java: "java",
    javascript: "javascript",
};

const boilerplateKeyMap: Record<LanguageKey, keyof BoilerplateResponse> = {
    cpp: "boilerplateCodeCpp",
    python: "boilerplateCodePython",
    java: "boilerplateCodeJava",
    javascript: "boilerplateCodeJavaScript",
};

export const CodeEditor = ({ problemName , contestId }: Props) => {
    const editorContainerRef = useRef<HTMLDivElement | null>(null);
    const monacoInstanceRef = useRef<monacoType.editor.IStandaloneCodeEditor | null>(null);
    const monacoModuleRef = useRef<typeof import("monaco-editor") | null>(null);

    const [language, setLanguage] = useState<LanguageKey>("javascript");
    const [boilerplates, setBoilerplates] = useState<BoilerplateResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [disqualificationMessage, setDisqualificationMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!editorContainerRef.current) return;

        let disposed = false;

        import("monaco-editor").then((monaco) => {
            if (disposed || !editorContainerRef.current) return;
            monacoModuleRef.current = monaco;

            if (!(window as any).MonacoEnvironment) {
                (window as any).MonacoEnvironment = {
                    getWorker(_: string, label: string) {
                        if (label === "json") {
                            return new Worker(
                                new URL(
                                    "monaco-editor/esm/vs/language/json/json.worker?worker",
                                    import.meta.url
                                ),
                                { type: "module" }
                            );
                        }
                        if (label === "css" || label === "scss" || label === "less") {
                            return new Worker(
                                new URL(
                                    "monaco-editor/esm/vs/language/css/css.worker?worker",
                                    import.meta.url
                                ),
                                { type: "module" }
                            );
                        }
                        if (label === "html" || label === "handlebars" || label === "razor") {
                            return new Worker(
                                new URL(
                                    "monaco-editor/esm/vs/language/html/html.worker?worker",
                                    import.meta.url
                                ),
                                { type: "module" }
                            );
                        }
                        if (label === "typescript" || label === "javascript") {
                            return new Worker(
                                new URL(
                                    "monaco-editor/esm/vs/language/typescript/ts.worker?worker",
                                    import.meta.url
                                ),
                                { type: "module" }
                            );
                        }
                        return new Worker(
                            new URL(
                                "monaco-editor/esm/vs/editor/editor.worker?worker",
                                import.meta.url
                            ),
                            { type: "module" }
                        );
                    },
                };
            }

            if (!monacoInstanceRef.current) {
                monacoInstanceRef.current = monaco.editor.create(editorContainerRef.current, {
                    value: "// Loading boilerplate...",
                    language: monacoLanguageMap[language],
                    theme: "vs-dark",
                    automaticLayout: true,
                    minimap: { enabled: false },
                    fontSize: 14,
                    scrollBeyondLastLine: false,
                    padding: { top: 10, bottom: 10 },
                });
            }
        });

        return () => {
            disposed = true;
            monacoInstanceRef.current?.dispose();
            monacoInstanceRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (!problemName) return;

        let isMounted = true;
        setLoading(true);
        setError(null);

        const fetchBoilerplates = async () => {
            try {
                const cacheKey = `boilerplate_${problemName}`;
                const cachedData = localStorage.getItem(cacheKey);

                if (cachedData) {
                    const parsed: CachedBoilerplate = JSON.parse(cachedData);
                    const now = Date.now();

                    if (now - parsed.timestamp < CACHE_EXPIRY_MS) {
                        if (isMounted) {
                            setBoilerplates(parsed.data);
                            setLoading(false);
                        }
                        return;
                    }
                }

                const res = await axios.get<{ boilerplates: BoilerplateResponse }>(
                    `/api/problem/${encodeURIComponent(problemName)}/boilerplates`
                );

                if (isMounted) {
                    setBoilerplates(res.data.boilerplates);

                    const cacheData: CachedBoilerplate = {
                        data: res.data.boilerplates,
                        timestamp: Date.now(),
                    };
                    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
                }
            } catch (err) {
                console.error("Error fetching boilerplates:", err);
                if (isMounted) {
                    setError(err instanceof Error ? err.message : "Request failed");
                    setBoilerplates(null);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchBoilerplates();

        return () => {
            isMounted = false;
        };
    }, [problemName]);

    useEffect(() => {
        const monaco = monacoModuleRef.current;
        const editor = monacoInstanceRef.current;
        if (!monaco || !editor) return;

        const currentBoilerplate = boilerplates
            ? boilerplates[boilerplateKeyMap[language]] ?? "// Boilerplate not available"
            : loading
                ? "// Loading boilerplate..."
                : error
                    ? `// ${error}`
                    : "// Boilerplate not loaded";

        const model = editor.getModel();
        if (model) {
            monaco.editor.setModelLanguage(model, monacoLanguageMap[language]);
        }

        if (editor.getValue() !== currentBoilerplate) {
            editor.setValue(currentBoilerplate);
        }
    }, [language, boilerplates, loading, error]);

    const setAllStatus = useTestCaseStore(state => state.setAllStatus);
    const updateStatus = useTestCaseStore(state => state.updateStatus);
    const testCases = useTestCaseStore(state => state.testCases);

    const handleRunCode = async () => {
        const editor = monacoInstanceRef.current;
        if (!editor || isRunning) return;
        
        if(!localStorage.getItem('token')) {
            alert("Session expired. Please log in again.");
            return;
        }

        setDisqualificationMessage(null);
        setIsRunning(true);
        // Set all test cases to pending
        setAllStatus('pending');

        const code = editor.getValue();
        
        try {
            const res = await axios.post('/api/run', {
                source_code: code,
                language: language,
                problemName: problemName,
                contestId: contestId ?? null,
            }, {
                headers: {
                    'Authorization': localStorage.getItem('token') || '',
                },
            });

            console.log("Run Results:", res.data);

            
            if (res.data.results) {
                console.log(res.data)
                res.data.results.forEach((result: any) => {
                    const testCaseId = result.testCaseId;
                    const status = result.status; 
                    const statusDescription = result.statusDescription || '';
                    
                    // Handle different error cases
                    let displayOutput = result.output || '';
                    
                    if (statusDescription === "Time Limit Exceeded") {
                        displayOutput = `Time Limit Exceeded\n\nYour code took too long to execute. Please optimize your solution.`;
                    } else if (statusDescription === "Memory Limit Exceeded") {
                        displayOutput = `Memory Limit Exceeded\n\nYour code used too much memory. Please optimize your solution.`;
                    } else if (statusDescription === "Runtime Error") {
                        displayOutput = `Runtime Error\n\n${displayOutput}`;
                    } else if (statusDescription === "Compilation Error") {
                        displayOutput = `Compilation Error\n\n${displayOutput}`;
                    } else if (status === "passed") {
                        displayOutput = displayOutput || "Test passed successfully!";
                    }
                
                   
                    updateStatus(testCaseId, status, displayOutput);
                });
            }
        } catch (error) {
            console.error("Error running code:", error);
            if (axios.isAxiosError(error)) {
                const responseMessage = error.response?.data?.error;
                if (error.response?.status === 403 && responseMessage) {
                    setDisqualificationMessage(responseMessage);
                } else {
                    alert("Failed to run code. Please try again.");
                }
            } else {
                alert("Failed to run code. Please try again.");
            }
            setAllStatus(null);
        } finally {
            setIsRunning(false);
        }
    };

    const setSubmissionId = useSubmissionStore(state => state.setSubmissionId);
    const setSubmissionStatus = useSubmissionStore(state => state.setStatus);
    const setSubmissionResults = useSubmissionStore(state => state.setResults);

    const markProblemSolvedInCache = useCallback(() => {
        if (!contestId) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const cacheKeyBase = `problems_contest_${contestId}`;
            const cacheKey = token ? `${cacheKeyBase}_${token}` : cacheKeyBase;
            const rawCache = localStorage.getItem(cacheKey) ?? (token ? localStorage.getItem(cacheKeyBase) : null);

            if (!rawCache) {
                return;
            }

            const parsed = JSON.parse(rawCache) as ContestProblemsCache;
            const problemsList = Array.isArray(parsed.problems)
                ? parsed.problems
                : Array.isArray(parsed.data)
                    ? parsed.data
                    : [];

            if (problemsList.length === 0) {
                return;
            }

            let updated = false;
            const updatedList = problemsList.map((problem) => {
                if (problem.name === problemName) {
                    updated = problem.solved === true ? updated : true;
                    return { ...problem, solved: true };
                }
                return problem;
            });

            if (!updated) {
                return;
            }

            parsed.timestamp = Date.now();
            if (Array.isArray(parsed.problems)) {
                parsed.problems = updatedList;
            } else if (Array.isArray(parsed.data)) {
                parsed.data = updatedList;
            } else {
                parsed.problems = updatedList;
            }

            localStorage.setItem(cacheKey, JSON.stringify(parsed));
            if (token && cacheKey !== cacheKeyBase) {
                localStorage.removeItem(cacheKeyBase);
            }
        } catch (error) {
            console.warn('Failed to update contest problems cache after accepted submission', error);
        }
    }, [contestId, problemName]);

    const submitCodeToJudge = async () => {
        const editor = monacoInstanceRef.current;
        if (!editor || isSubmitting) return;
        
        if(!localStorage.getItem('token')) {
            alert("Session expired. Please log in again.");
            return;
        }

        setDisqualificationMessage(null);
        setIsSubmitting(true);
        const code = editor.getValue();
        
        try {
            setSubmissionStatus('submitting');
            
            const res = await axios.post('/api/submission', {
                source_code: code,
                language: language,
                problemName: problemName,
                contestId: contestId ?? null,
            }, {
                headers: {
                    'Authorization': localStorage.getItem('token') || '',
                },
            });

            console.log("Submission Response:", res.data);
            
            if (res.data.submissionId) {
                setSubmissionId(res.data.submissionId);
                setSubmissionStatus('polling');
                
                // Start polling for results
                startPolling(res.data.submissionId);
            }
        } catch (error) {
            console.error("Error submitting code:", error);
            if (axios.isAxiosError(error)) {
                const responseMessage = error.response?.data?.error;
                if (error.response?.status === 403 && responseMessage) {
                    setDisqualificationMessage(responseMessage);
                } else {
                    alert("Failed to submit code. Please try again.");
                }
            } else {
                alert("Failed to submit code. Please try again.");
            }
            setSubmissionStatus('failed');
            setIsSubmitting(false);
        }
    };

    const startPolling = async (submissionId: string) => {
        let pollInterval = 1000; // Start with 1 second
        const maxPolls = 90; // Max 3 minutes of polling
        let pollCount = 0;
        let consecutiveCompletedPolls = 0;
        let solvedMarked = false;

        const poll = async () => {
            try {
                const res = await axios.get(`/api/submission/${submissionId}`, {
                    headers: {
                        'Authorization': localStorage.getItem('token') || '',
                    },
                });

                const data = res.data;
                setSubmissionResults(
                    data.results,
                    data.totalTestCases,
                    data.passedTestCases,
                    data.failedTestCases,
                    data.pendingTestCases
                );

                pollCount++;
                console.log(`Poll ${pollCount}: ${data.pendingTestCases} pending, ${data.passedTestCases} passed, ${data.failedTestCases} failed`);

                // If all tests are complete, stop polling
                if (data.pendingTestCases === 0) {
                    consecutiveCompletedPolls++;
                    // Wait for 2 consecutive polls showing completion to ensure stability
                    if (consecutiveCompletedPolls >= 2) {
                        const isAccepted = data.failedTestCases === 0;
                        if (isAccepted && !solvedMarked) {
                            markProblemSolvedInCache();
                            solvedMarked = true;
                        }
                        setSubmissionStatus('completed');
                        setIsSubmitting(false);
                        console.log("All tests completed:", data);
                        return;
                    }
                } else {
                    consecutiveCompletedPolls = 0;
                }

                // Adaptive polling: slow down after 20 polls
                if (pollCount > 20 && pollInterval < 3000) {
                    pollInterval = 3000; // Increase to 3 seconds after 20 polls
                }

                // Continue polling if tests are still pending
                if (pollCount < maxPolls) {
                    setTimeout(poll, pollInterval);
                } else {
                    console.log("Polling timeout reached");
                    setSubmissionStatus('failed');
                    setIsSubmitting(false);
                }
            } catch (error) {
                console.error("Error polling submission:", error);
                // Retry once on error before failing
                if (pollCount < 3) {
                    setTimeout(poll, pollInterval * 2);
                } else {
                    setSubmissionStatus('failed');
                    setIsSubmitting(false);
                }
            }
        };

        // Start polling immediately
        poll();
    };

    return (
        <div className="flex flex-col h-full bg-[#1f1f20] overflow-hidden">
            <div className="flex items-center px-3 py-2 border-b border-neutral-800">
                <div className="flex gap-2 items-center">
                    <label className="text-neutral-300 text-sm">Language:</label>
                    <select
                        value={language}
                        onChange={(event) => setLanguage(event.target.value as LanguageKey)}
                        className="bg-neutral-800 text-neutral-100 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500"
                    >
                        {languageOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-1 justify-center gap-3">
                    <button 
                        onClick={handleRunCode}
                        disabled={isRunning || isSubmitting}
                        className={`px-6 py-2 text-sm lg:text-base rounded-xl bg-green-600 transition-all text-white ${poppins.className} ${
                            isRunning || isSubmitting 
                                ? 'opacity-50 cursor-not-allowed' 
                                : 'cursor-pointer hover:bg-green-700'
                        } flex items-center gap-2 justify-center min-w-[100px]`}
                    >
                        {isRunning ? (
                            <>
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Running...
                            </>
                        ) : (
                            'Run'
                        )}
                    </button>
                    <button 
                        onClick={submitCodeToJudge}
                        disabled={isRunning || isSubmitting}
                        className={`px-6 py-2 text-sm lg:text-base rounded-xl bg-white transition-all text-black ${poppins.className} ${
                            isRunning || isSubmitting 
                                ? 'opacity-50 cursor-not-allowed' 
                                : 'cursor-pointer hover:bg-neutral-300'
                        } flex items-center gap-2 justify-center min-w-[100px]`}
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Submitting...
                            </>
                        ) : (
                            'Submit'
                        )}
                    </button>
                </div>

                <div className="flex items-center gap-3 text-xs">
                    {loading && <span className="text-neutral-400">Fetching boilerplate…</span>}
                    {error && <span className="text-red-400">{error}</span>}
                </div>
            </div>

            <div ref={editorContainerRef} className="flex-1 w-full" style={{ minHeight: 0 }} />

            {disqualificationMessage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
                    <div className={`w-full max-w-sm rounded-2xl border border-neutral-700 bg-neutral-900 p-6 text-center shadow-xl ${poppins.className}`}>
                        <h2 className="text-lg font-semibold text-white">Disqualified</h2>
                        <p className="mt-3 text-sm text-neutral-300">{disqualificationMessage}</p>
                        <button
                            onClick={() => setDisqualificationMessage(null)}
                            className="mt-6 w-full rounded-xl bg-white px-4 py-2 text-sm font-medium text-black hover:bg-neutral-300"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};