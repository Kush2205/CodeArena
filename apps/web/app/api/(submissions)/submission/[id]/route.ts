import { NextRequest, NextResponse } from "next/server";
import prisma from "@repo/db/client";

async function getSubmissionResult(token: string) {
  const response = await fetch(
    `${process.env.JUDGE0_URI}/submissions/${token}?base64_encoded=true`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }
  );

  const data = await response.json();
  return data;
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

    // Fetch results for all tokens from Judge0
    const results = await Promise.all(
      submission.submissionTokens.map(async (tokenRecord, index) => {
        try {
          const result = await getSubmissionResult(tokenRecord.token);

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
          console.error(`Error fetching result for token ${tokenRecord.token}:`, error);
          return {
            testCaseNumber: index + 1,
            status: "pending" as const,
            statusDescription: "Processing",
            output: "",
            time: null,
            memory: null,
          };
        }
      })
    );

    // Calculate overall statistics
    const passedCount = results.filter((r) => r.status === "passed").length;
    const failedCount = results.filter((r) => r.status === "failed").length;
    const pendingCount = results.filter((r) => r.status === "pending").length;

    // Update submission status if all tests are complete
    let overallStatus = submission.status;
    if (pendingCount === 0) {
      overallStatus = failedCount === 0 ? "completed" : "failed";
      
      await prisma.submission.update({
        where: { id: submissionId },
        data: {
          status: overallStatus,
          passedTestCases: passedCount,
          verdict: failedCount === 0 ? "Accepted" : "Failed",
        },
      });
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
