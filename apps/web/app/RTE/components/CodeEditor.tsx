"use client";
import { useEffect, useRef, useState } from "react";
import type * as monacoType from "monaco-editor";
import { Poppins } from "next/font/google";
import axios from "axios";
import { useTestCaseStore } from "../../../store/testCaseStore";
import { useSubmissionStore } from "../../../store/submissionStore";

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
        if (!editor) return;
        
        if(!localStorage.getItem('token')) {
            alert("Session expired. Please log in again.");
            return;
        }

        // Set all test cases to pending
        setAllStatus('pending');

        const code = editor.getValue();
        
        try {
            const res = await axios.post('/api/run', {
                source_code: code,
                language: language,
                problemName: problemName,
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
            alert("Failed to run code. Please try again.");
            setAllStatus(null);
        }
    };

    const setSubmissionId = useSubmissionStore(state => state.setSubmissionId);
    const setSubmissionStatus = useSubmissionStore(state => state.setStatus);
    const setSubmissionResults = useSubmissionStore(state => state.setResults);

    const submitCodeToJudge = async () => {
        const editor = monacoInstanceRef.current;
        if (!editor) return;
        
        if(!localStorage.getItem('token')) {
            alert("Session expired. Please log in again.");
            return;
        }

        const code = editor.getValue();
        
        try {
            setSubmissionStatus('submitting');
            
            const res = await axios.post('/api/submission', {
                source_code: code,
                language: language,
                problemName: problemName,
                contestId: contestId || null,
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
            alert("Failed to submit code. Please try again.");
            setSubmissionStatus('failed');
        }
    };

    const startPolling = async (submissionId: string) => {
        const pollInterval = 2000; // Poll every 2 seconds
        const maxPolls = 60; // Max 2 minutes of polling
        let pollCount = 0;

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

                // If all tests are complete, stop polling
                if (data.pendingTestCases === 0) {
                    setSubmissionStatus('completed');
                    console.log("All tests completed:", data);
                    return;
                }

                // Continue polling if tests are still pending
                pollCount++;
                if (pollCount < maxPolls) {
                    setTimeout(poll, pollInterval);
                } else {
                    console.log("Polling timeout reached");
                    setSubmissionStatus('failed');
                }
            } catch (error) {
                console.error("Error polling submission:", error);
                setSubmissionStatus('failed');
            }
        };

        poll();
    };

    return (
        <div className="flex flex-col flex-1 bg-[#1f1f20] overflow-hidden min-h-0">
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
                    <button onClick={handleRunCode}
                        className={`px-6 py-2 text-sm lg:text-base rounded-xl bg-green-600 cursor-pointer hover:bg-green-700 transition-all text-white ${poppins.className}`}
                    >
                        Run
                    </button>
                    <button onClick={submitCodeToJudge}
                        className={`px-6 py-2 text-sm lg:text-base rounded-xl bg-white cursor-pointer hover:bg-neutral-300 transition-all text-black ${poppins.className}`}
                    >
                        Submit
                    </button>
                </div>

                <div className="flex items-center gap-3 text-xs">
                    {loading && <span className="text-neutral-400">Fetching boilerplate…</span>}
                    {error && <span className="text-red-400">{error}</span>}
                </div>
            </div>

            <div ref={editorContainerRef} className="flex-1 w-full min-h-0" />
        </div>
    );
};