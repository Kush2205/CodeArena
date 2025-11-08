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
  points: number;
  pointsAwarded: boolean;
  newTestCasesPassed: number;
  alreadySolved: boolean;
  results: TestCaseResult[];
  
  setSubmissionId: (id: string) => void;
  setStatus: (status: SubmissionStatus) => void;
  setResults: (
    results: TestCaseResult[], 
    totalTestCases: number, 
    passedTestCases: number, 
    failedTestCases: number, 
    pendingTestCases: number,
    points?: number,
    pointsAwarded?: boolean,
    newTestCasesPassed?: number,
    alreadySolved?: boolean
  ) => void;
  reset: () => void;
}

export const useSubmissionStore = create<SubmissionState>((set) => ({
  submissionId: null,
  status: 'idle',
  totalTestCases: 0,
  passedTestCases: 0,
  failedTestCases: 0,
  pendingTestCases: 0,
  points: 0,
  pointsAwarded: false,
  newTestCasesPassed: 0,
  alreadySolved: false,
  results: [],
  
  setSubmissionId: (id) => set({ submissionId: id }),
  setStatus: (status) => set({ status }),
  setResults: (results, totalTestCases, passedTestCases, failedTestCases, pendingTestCases, points = 0, pointsAwarded = false, newTestCasesPassed = 0, alreadySolved = false) => 
    set({ results, totalTestCases, passedTestCases, failedTestCases, pendingTestCases, points, pointsAwarded, newTestCasesPassed, alreadySolved }),
  reset: () => set({
    submissionId: null,
    status: 'idle',
    totalTestCases: 0,
    passedTestCases: 0,
    failedTestCases: 0,
    pendingTestCases: 0,
    points: 0,
    pointsAwarded: false,
    newTestCasesPassed: 0,
    alreadySolved: false,
    results: [],
  }),
}));
