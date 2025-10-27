"use client";
import { useEffect, useRef, useState } from "react";
import type * as monacoType from "monaco-editor";
import { Poppins } from "next/font/google";
import axios from "axios";

interface Props {
    problemName: string;
}

type LanguageKey = "cpp" | "python" | "java" | "javascript";

type BoilerplateResponse = {
    boilerplateCodeCpp: string | null;
    boilerplateCodePython: string | null;
    boilerplateCodeJava: string | null;
    boilerplateCodeJavaScript: string | null;
};

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

export const CodeEditor = ({ problemName }: Props) => {
    const editorContainerRef = useRef<HTMLDivElement | null>(null);
    const monacoInstanceRef = useRef<monacoType.editor.IStandaloneCodeEditor | null>(null);
    const monacoModuleRef = useRef<typeof import("monaco-editor") | null>(null);

    const [language, setLanguage] = useState<LanguageKey>("javascript");
    const [boilerplates, setBoilerplates] = useState<BoilerplateResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Initialize Monaco editor once
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

        axios
            .get<{ boilerplates: BoilerplateResponse }>(
                `/api/problem/${encodeURIComponent(problemName)}/boilerplates`
            )
            .then((res) => {
                if (!isMounted) return;
                setBoilerplates(res.data.boilerplates);
            })
            .catch((err) => {
                console.error("Error fetching boilerplates:", err);
                if (isMounted) {
                    setError(err instanceof Error ? err.message : "Request failed");
                    setBoilerplates(null);
                }
            })
            .finally(() => {
                if (isMounted) {
                    setLoading(false);
                }
            });

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

                <div className="flex flex-1 justify-center">
                    <button
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