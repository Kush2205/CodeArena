import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TestCaseStatus = 'pending' | 'passed' | 'failed' | null;

export interface TestCase {
  id: number;
  input: string;
  output: string;
  status: TestCaseStatus;
  submissionResult?: string;
}

interface TestCaseState {
  testCases: TestCase[];
  setTestCases: (testCases: TestCase[]) => void;
  updateStatus: (id: number, status: TestCaseStatus, submissionResult?: string) => void;
  setAllStatus: (status: TestCaseStatus) => void;
}

export const useTestCaseStore = create<TestCaseState>()(
  persist(
    (set, get) => ({
      testCases: [],
      setTestCases: (testCases) => set({ testCases }),
      updateStatus: (id, status, submissionResult) => set({
        testCases: get().testCases.map(tc =>
          tc.id === id ? { ...tc, status, submissionResult } : tc
        )
      }),
      setAllStatus: (status) => set({
        testCases: get().testCases.map(tc => ({ ...tc, status }))
      })
    }),
    {
      name: 'test-cases-storage',
    }
  )
);


