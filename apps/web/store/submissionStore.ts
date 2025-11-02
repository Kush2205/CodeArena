import { create } from 'zustand';

export type SubmissionStatus = 'idle' | 'submitting' | 'polling' | 'completed' | 'failed';

export interface TestCaseResult {
  testCaseNumber: number;
  status: 'pending' | 'passed' | 'failed';
  statusDescription: string;
  output: string;
  time: number | null;
  memory: number | null;
}

interface SubmissionState {
  submissionId: string | null;
  status: SubmissionStatus;
  totalTestCases: number;
  passedTestCases: number;
  failedTestCases: number;
  pendingTestCases: number;
  results: TestCaseResult[];
  
  setSubmissionId: (id: string) => void;
  setStatus: (status: SubmissionStatus) => void;
  setResults: (results: TestCaseResult[], totalTestCases: number, passedTestCases: number, failedTestCases: number, pendingTestCases: number) => void;
  reset: () => void;
}

export const useSubmissionStore = create<SubmissionState>((set) => ({
  submissionId: null,
  status: 'idle',
  totalTestCases: 0,
  passedTestCases: 0,
  failedTestCases: 0,
  pendingTestCases: 0,
  results: [],
  
  setSubmissionId: (id) => set({ submissionId: id }),
  setStatus: (status) => set({ status }),
  setResults: (results, totalTestCases, passedTestCases, failedTestCases, pendingTestCases) => 
    set({ results, totalTestCases, passedTestCases, failedTestCases, pendingTestCases }),
  reset: () => set({
    submissionId: null,
    status: 'idle',
    totalTestCases: 0,
    passedTestCases: 0,
    failedTestCases: 0,
    pendingTestCases: 0,
    results: [],
  }),
}));
