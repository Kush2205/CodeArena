
import Link from "next/link";
import prisma from "@repo/db/client";
import { ProblemStatementWrapper } from "./components/ProblemStatementWrapper";
import { CodeEditor } from "./components/CodeEditor";
import TestCases from "./components/TestCases";
import { ResizableLayout } from "./components/ResizableLayout";
import { ProctoringGuard } from "../components/ProctoringGuard";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

interface PageProps {
  params: Promise<{ contestId: string }>;
  searchParams: SearchParams;
}

export default async function RTEPage({ params, searchParams }: PageProps) {
  const { contestId } = await params;
  const searchParamsData = await searchParams;

  const rawProblem = searchParamsData.problem;
  const problemName =
    typeof rawProblem === "string"
      ? rawProblem
      : Array.isArray(rawProblem)
        ? rawProblem[0] ?? ""
        : "";

  if (!problemName) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-900 text-neutral-200">
        Please provide a valid <code>?problem=…</code> query parameter.
      </div>
    );
  }

  const problemRecord = await prisma.problem.findUnique({
    where: { name: problemName },
    select: { 
      id: true,
      difficulty: true,
      totalPoints: true,
    },
  });

  const problemId = problemRecord?.id;
  const contestRecord = await prisma.contest.findUnique({
    where: { id: Number(contestId) },
  });
  const proctoringEnabled = (contestRecord as { proctoringEnabled?: boolean } | null)?.proctoringEnabled ?? false;

  const rteLayout = (
    <div className="relative h-screen">
      <div className="absolute right-4 top-4 z-40">
        <Link
          href={`/contests/${contestId}/problemspage`}
          className="inline-flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-neutral-100 transition hover:border-neutral-500 hover:bg-neutral-800"
        >
          <span aria-hidden="true">←</span>
          <span>Back to Problems</span>
        </Link>
      </div>
      <ResizableLayout
        leftPanel={<ProblemStatementWrapper problemName={problemName} contestId={contestId} difficulty={problemRecord?.difficulty} totalPoints={problemRecord?.totalPoints} />}
        topRightPanel={<CodeEditor problemName={problemName} contestId={contestId} />}
        bottomRightPanel={<TestCases problemName={problemName} />}
      />
    </div>
  );

  if (!proctoringEnabled) {
    return rteLayout;
  }

  return (
    <ProctoringGuard contestId={contestId} problemId={problemId}>
      {rteLayout}
    </ProctoringGuard>
  );
}
