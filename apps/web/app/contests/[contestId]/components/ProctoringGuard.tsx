'use client';

import { useState, useRef, useCallback, useEffect, ReactNode } from "react";

type ViolationReason = "fullscreen" | "tab" | "devtools";

type ViolationCopy = Record<
    ViolationReason,
    {
        message: (seconds: number) => string;
        actionLabel?: string;
    }
>;

const VIOLATION_COPY: ViolationCopy = {
    fullscreen: {
        message: (seconds) =>
            `Full-screen mode is mandatory during the contest. Return to full screen within ${seconds} seconds to avoid disqualification.`,
        actionLabel: "Re-enter Full Screen",
    },
    tab: {
        message: (seconds) =>
            `Contest focus lost. Return to this tab and resume full-screen mode within ${seconds} seconds to avoid disqualification.`,
    },
    devtools: {
        message: (seconds) =>
            `Developer tools usage detected. Close any debugging panels within ${seconds} seconds to avoid disqualification.`,
    },
};

const BROWSER_FULLSCREEN_TOLERANCE = 8;
const FULLSCREEN_VIOLATION_THRESHOLD_MS = 10_000;
const TAB_VIOLATION_THRESHOLD_MS = 5_000;

const isBrowserFullscreen = () => {
    if (typeof window === "undefined") return false;

    const heightDelta = Math.abs(window.innerHeight - window.screen.height);
    const widthDelta = Math.abs(window.innerWidth - window.screen.width);

    return heightDelta <= BROWSER_FULLSCREEN_TOLERANCE && widthDelta <= BROWSER_FULLSCREEN_TOLERANCE;
};

const isDomFullscreen = () => {
    if (typeof document === "undefined") return false;
    return Boolean(document.fullscreenElement);
};

const isAnyFullscreenActive = () => isDomFullscreen() || isBrowserFullscreen();

const normalizeId = (value?: string | number | null): number | null => {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }
    if (typeof value === "string") {
        const parsed = Number.parseInt(value, 10);
        return Number.isNaN(parsed) ? null : parsed;
    }
    return null;
};

interface ProctoringGuardProps {
    children: ReactNode;
    contestId?: string | number | null;
    problemId?: string | number | null;
}

export function ProctoringGuard({ children, contestId, problemId }: ProctoringGuardProps) {
    const [violationCountdown, setViolationCountdown] = useState<number | null>(null);
    const [violationReason, setViolationReason] = useState<ViolationReason | null>(null);

    const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
    const devToolsIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const devToolsDetectedRef = useRef<boolean>(false);
    const violationReasonRef = useRef<ViolationReason | null>(null);
    const violationTimersRef = useRef<{ fullscreen: NodeJS.Timeout | null; tab: NodeJS.Timeout | null }>({
        fullscreen: null,
        tab: null,
    });
    const violationReportedRef = useRef<{ fullscreen: boolean; tab: boolean }>({ fullscreen: false, tab: false });
    const disqualificationSentRef = useRef(false);
    const tokenRef = useRef<string | null>(null);

    const contestIdValue = normalizeId(contestId);
    const problemIdValue = normalizeId(problemId);

    const ensureToken = useCallback(() => {
        if (tokenRef.current !== null) {
            return tokenRef.current;
        }

        if (typeof window === "undefined") {
            return null;
        }

        const storedToken = localStorage.getItem("token");
        tokenRef.current = storedToken ?? null;
        return tokenRef.current;
    }, []);

    const clearViolationTimers = useCallback(() => {
        (Object.keys(violationTimersRef.current) as Array<"fullscreen" | "tab">).forEach((key) => {
            const timer = violationTimersRef.current[key];
            if (timer) {
                clearTimeout(timer);
                violationTimersRef.current[key] = null;
            }
            violationReportedRef.current[key] = false;
        });
    }, []);

    const reportViolation = useCallback(
        async (reason: "fullscreen" | "tab") => {
            const token = ensureToken();
            if (!contestIdValue || !problemIdValue || !token) {
                return;
            }

            try {
                await fetch("/api/violation", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        contestId: contestIdValue,
                        problemId: problemIdValue,
                        reason,
                    }),
                });
            } catch (error) {
                console.error("Failed to report violation", error);
            }
        },
        [contestIdValue, problemIdValue, ensureToken]
    );

    const scheduleViolationTimer = useCallback(
        (reason: "fullscreen" | "tab", timeoutMs: number) => {
            const existing = violationTimersRef.current[reason];
            if (existing) {
                clearTimeout(existing);
            }
            violationReportedRef.current[reason] = false;

            violationTimersRef.current[reason] = setTimeout(() => {
                if (violationReasonRef.current === reason && !violationReportedRef.current[reason]) {
                    violationReportedRef.current[reason] = true;
                    void reportViolation(reason);
                }
            }, timeoutMs);
        },
        [reportViolation]
    );

    const reportDisqualification = useCallback(async () => {
        const token = ensureToken();
        if (!contestIdValue || !token) {
            return;
        }

        if (disqualificationSentRef.current) {
            return;
        }

        disqualificationSentRef.current = true;

        try {
            await fetch("/api/violation/disqualification", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
                },
                body: JSON.stringify({
                    contestId: contestIdValue,
                    disqualified: true,
                }),
            });
        } catch (error) {
            console.error("Failed to update disqualification", error);
            disqualificationSentRef.current = false;
        }
    }, [contestIdValue, ensureToken]);

    const clearViolation = useCallback(() => {
        if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
            countdownTimerRef.current = null;
        }
        clearViolationTimers();
        setViolationCountdown(null);
        setViolationReason(null);
        violationReasonRef.current = null;
        devToolsDetectedRef.current = false;
        disqualificationSentRef.current = false;
    }, [clearViolationTimers]);

    const triggerViolation = useCallback(
        (duration: number, reason: ViolationReason) => {
            violationReasonRef.current = reason;
            setViolationReason(reason);
            setViolationCountdown(duration);

            if (countdownTimerRef.current) {
                clearInterval(countdownTimerRef.current);
            }

            clearViolationTimers();

            if (reason === "fullscreen") {
                scheduleViolationTimer("fullscreen", FULLSCREEN_VIOLATION_THRESHOLD_MS);
            } else if (reason === "tab") {
                scheduleViolationTimer("tab", TAB_VIOLATION_THRESHOLD_MS);
            }

            countdownTimerRef.current = setInterval(() => {
                setViolationCountdown((prev) => {
                    if (prev === null) return null;
                    if (prev <= 1) {
                        if (countdownTimerRef.current) {
                            clearInterval(countdownTimerRef.current);
                            countdownTimerRef.current = null;
                        }
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        },
        [clearViolationTimers, scheduleViolationTimer]
    );

    const attemptEnterFullscreen = useCallback(async () => {
        if (typeof document === "undefined") return;

        if (isAnyFullscreenActive()) {
            if (violationReasonRef.current === "fullscreen") {
                clearViolation();
            }
            return;
        }

        try {
            if (document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen();
                if (isAnyFullscreenActive() && violationReasonRef.current === "fullscreen") {
                    clearViolation();
                }
            }
        } catch (error) {
            console.warn("Failed to enter full screen:", error);
        }
    }, [clearViolation]);

    useEffect(() => {
        void ensureToken();
    }, [ensureToken]);

    useEffect(() => {
        if (typeof document === "undefined" || typeof window === "undefined") return;

        const handleFullscreenChange = () => {
            if (!isAnyFullscreenActive()) {
                triggerViolation(30, "fullscreen");
                void attemptEnterFullscreen();
            } else if (violationReasonRef.current === "fullscreen") {
                clearViolation();
            }
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                triggerViolation(15, "tab");
            } else {
                clearViolation();
                void attemptEnterFullscreen();
            }
        };

        const handleWindowBlur = () => {
            triggerViolation(15, "tab");
        };

        const handleWindowFocus = () => {
            if (!document.hidden) {
                clearViolation();
                void attemptEnterFullscreen();
            }
        };

        const handleResize = () => {
            if (isAnyFullscreenActive()) {
                if (violationReasonRef.current === "fullscreen") {
                    clearViolation();
                }
            } else if (violationReasonRef.current !== "fullscreen") {
                triggerViolation(30, "fullscreen");
            }
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("blur", handleWindowBlur);
        window.addEventListener("focus", handleWindowFocus);
        window.addEventListener("resize", handleResize);

        if (!isAnyFullscreenActive()) {
            triggerViolation(30, "fullscreen");
            void attemptEnterFullscreen();
        }

        return () => {
            clearViolation();
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("blur", handleWindowBlur);
            window.removeEventListener("focus", handleWindowFocus);
            window.removeEventListener("resize", handleResize);
        };
    }, [triggerViolation, clearViolation, attemptEnterFullscreen]);

    useEffect(() => {
        if (violationReason !== "tab") return;
        if (typeof document === "undefined" || typeof window === "undefined") return;

        const resetIfFocused = () => {
            const hasFocus = typeof document.hasFocus === "function" ? document.hasFocus() : document.visibilityState === "visible";
            if (!document.hidden && hasFocus) {
                clearViolation();
            }
        };

        resetIfFocused();

        window.addEventListener("focus", resetIfFocused);
        document.addEventListener("visibilitychange", resetIfFocused);

        return () => {
            window.removeEventListener("focus", resetIfFocused);
            document.removeEventListener("visibilitychange", resetIfFocused);
        };
    }, [violationReason, clearViolation]);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const threshold = 160;
        const checkDevTools = () => {
            const widthDelta = Math.abs(window.outerWidth - window.innerWidth);
            const heightDelta = Math.abs(window.outerHeight - window.innerHeight);
            const devToolsOpened = widthDelta > threshold || heightDelta > threshold;

            if (devToolsOpened && !devToolsDetectedRef.current) {
                devToolsDetectedRef.current = true;
                triggerViolation(15, "devtools");
            } else if (!devToolsOpened && devToolsDetectedRef.current) {
                devToolsDetectedRef.current = false;
                if (violationReasonRef.current === "devtools") {
                    clearViolation();
                }
            }
        };

        checkDevTools();
        devToolsIntervalRef.current = setInterval(checkDevTools, 1000);

        return () => {
            if (devToolsIntervalRef.current) {
                clearInterval(devToolsIntervalRef.current);
                devToolsIntervalRef.current = null;
            }
            devToolsDetectedRef.current = false;
        };
    }, [triggerViolation, clearViolation]);

    useEffect(() => {
        if (violationReasonRef.current === "fullscreen" && isAnyFullscreenActive()) {
            clearViolation();
        }
    });

    useEffect(() => {
        if (violationCountdown === 0) {
            void reportDisqualification();
        }
    }, [violationCountdown, reportDisqualification]);

    return (
        <>
            {violationCountdown !== null && violationReason && (
                <div className="fixed inset-x-0 top-0 z-50 flex justify-center px-4">
                    <div className="mt-4 w-full max-w-2xl rounded-2xl border-2 border-red-500 bg-white px-6 py-5 text-center shadow-2xl">
                        <p className="text-xl font-semibold text-red-600">Proctoring Alert</p>
                        <p className="mt-2 text-sm text-neutral-700">
                            {VIOLATION_COPY[violationReason].message(violationCountdown)}
                        </p>
                        {VIOLATION_COPY[violationReason].actionLabel && (
                            <button
                                type="button"
                                onClick={() => void attemptEnterFullscreen()}
                                className="mt-4 inline-flex items-center justify-center rounded-lg border border-red-500 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-500 hover:text-white"
                            >
                                {VIOLATION_COPY[violationReason].actionLabel}
                            </button>
                        )}
                    </div>
                </div>
            )}
            {children}
        </>
    );
}

export default ProctoringGuard;
