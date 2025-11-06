
import { ProblemStatementWrapper } from "./components/ProblemStatementWrapper";
import { CodeEditor } from "./components/CodeEditor";
import TestCases from "./components/TestCases";
import { ResizableLayout } from "./components/ResizableLayout";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function RTEPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  const rawProblem = params.problem;
  const problemName =
    typeof rawProblem === "string"
      ? rawProblem
      : Array.isArray(rawProblem)
        ? rawProblem[0] ?? ""
        : "";

  const contestIdParam = typeof params.contestId === "string" ? params.contestId : undefined;

  if (!problemName) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-900 text-neutral-200">
        Please provide a valid <code>?problem=…</code> query parameter.
      </div>
    );
  }

  return (
    <ResizableLayout
      leftPanel={<ProblemStatementWrapper problemName={problemName} contestId={contestIdParam} />}
      topRightPanel={<CodeEditor problemName={problemName} contestId={contestIdParam} />}
      bottomRightPanel={<TestCases problemName={problemName} />}
    />
  );
}