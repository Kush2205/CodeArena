import { NextRequest, NextResponse } from "next/server";
import prisma from "@repo/db/client";

async function getBatchSubmissionResults(tokens: string[]) {
  const tokenString = tokens.join(',');
  const response = await fetch(
    `${process.env.JUDGE0_URI}/submissions/batch?tokens=${tokenString}&base64_encoded=true`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }
  );

  const data = await response.json();
  return data.submissions || [];
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const submissionId = params.id;

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        submissionTokens: true,
      },
    });

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    // Fetch results for all tokens from Judge0 using batch API
    const tokens = submission.submissionTokens.map(t => t.token);
    const batchResults = await getBatchSubmissionResults(tokens);
    
    const results = batchResults.map((result: any, index: number) => {
      try {
        const statusId = result.status?.id;
        let status: "pending" | "passed" | "failed" = "pending";
        let statusDescription = result.status?.description || "Unknown";
        let output = "";

        // Status ID mapping:
        // 1-2: In Queue/Processing
        // 3: Accepted
        // 4+: Various errors (Wrong Answer, TLE, Runtime Error, etc.)
        if (statusId === 3) {
          status = "passed";
          output = result.stdout
            ? Buffer.from(result.stdout, "base64").toString("utf8")
            : "";
        } else if (statusId && statusId > 3) {
          status = "failed";

          // Handle different error types
          if (statusId === 4) {
            statusDescription = "Wrong Answer";
            output = result.stdout
              ? Buffer.from(result.stdout, "base64").toString("utf8")
              : "";
          } else if (statusId === 5) {
            statusDescription = "Time Limit Exceeded";
            output = "Your code took too long to execute. Please optimize your solution.";
          } else if (statusId === 6) {
            statusDescription = "Compilation Error";
            output = result.compile_output
              ? Buffer.from(result.compile_output, "base64").toString("utf8")
              : "Compilation failed";
          } else if (statusId === 7 || statusId === 8 || statusId === 9 || statusId === 10 || statusId === 11 || statusId === 12) {
            statusDescription = "Runtime Error";
            output = result.stderr
              ? Buffer.from(result.stderr, "base64").toString("utf8")
              : "Runtime error occurred";
          } else {
            output = result.stderr
              ? Buffer.from(result.stderr, "base64").toString("utf8")
              : statusDescription;
          }
        }

        return {
          testCaseNumber: index + 1,
          status,
          statusDescription,
          output,
          time: result.time,
          memory: result.memory,
        };
      } catch (error) {
        console.error(`Error processing result for test case ${index + 1}:`, error);
        return {
          testCaseNumber: index + 1,
          status: "pending" as const,
          statusDescription: "Processing",
          output: "",
          time: null,
          memory: null,
        };
      }
    });

    // Calculate overall statistics
    const passedCount = results.filter((r: any) => r.status === "passed").length;
    const failedCount = results.filter((r: any) => r.status === "failed").length;
    const pendingCount = results.filter((r: any) => r.status === "pending").length;

    // Update submission status if all tests are complete
    let overallStatus = submission.status;
    if (pendingCount === 0) {
      const isAccepted = failedCount === 0;
      overallStatus = isAccepted ? "completed" : "failed";

      await prisma.submission.update({
        where: { id: submissionId },
        data: {
          status: overallStatus,
          passedTestCases: passedCount,
          verdict: isAccepted ? "Accepted" : "Failed",
        },
      });

      if (isAccepted) {
        const contestContext = submission.contestId ?? null;
        await (prisma as unknown as {
          solvedProblem: {
            upsert: (args: unknown) => Promise<void>;
          };
        }).solvedProblem.upsert({
          where: {
            userId_problemId_contestId: {
              userId: submission.userId,
              problemId: submission.problemId,
              contestId: contestContext,
            },
          },
          create: {
            userId: submission.userId,
            problemId: submission.problemId,
            contestId: contestContext,
          },
          update: {
            solvedAt: new Date(),
          },
        });
      }
    }

    return NextResponse.json({
      submissionId: submission.id,
      status: overallStatus,
      totalTestCases: submission.totalTestCases,
      passedTestCases: passedCount,
      failedTestCases: failedCount,
      pendingTestCases: pendingCount,
      results,
    });
  } catch (error) {
    console.error("Error fetching submission status:", error);
    return NextResponse.json(
      { error: "Failed to fetch submission status" },
      { status: 500 }
    );
  }
}
