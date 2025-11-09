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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: submissionId } = await params;

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
    let points = 0;
    let newTestCasesPassed = 0;

    if (pendingCount === 0) {
      const isAccepted = failedCount === 0;
      overallStatus = isAccepted ? "completed" : "failed";

      const contestContext = submission.contestId ?? null;

      // Only calculate and award points if this submission hasn't been processed yet
      // (points are 0 in the database for unprocessed submissions)
      if (submission.points === 0) {
        // Get all test cases that passed in this submission
        const passedTestCaseNumbers = results
          .filter((r: any) => r.status === "passed")
          .map((r: any) => r.testCaseNumber);

        if (passedTestCaseNumbers.length > 0) {
          // Find which test cases were already passed before
          const alreadyPassedTestCases = await prisma.passedTestCase.findMany({
            where: {
              userId: submission.userId,
              problemId: submission.problemId,
              contestId: contestContext,
              testCaseNumber: {
                in: passedTestCaseNumbers,
              },
            },
            select: {
              testCaseNumber: true,
            },
          });

          const alreadyPassedNumbers = new Set(
            alreadyPassedTestCases.map((tc) => tc.testCaseNumber)
          );

          // Find newly passed test cases
          const newlyPassedTestCases = passedTestCaseNumbers.filter(
            (num: number) => !alreadyPassedNumbers.has(num)
          );

          newTestCasesPassed = newlyPassedTestCases.length;

          // Get problem to calculate points per test case
          const problem = await prisma.problem.findUnique({
            where: { id: submission.problemId },
            select: {
              totalPoints: true,
              _count: {
                select: {
                  testCases: true,
                },
              },
            },
          });

          // Calculate points per test case (totalPoints / number of test cases)
          const pointsPerTestCase = problem
            ? Math.floor(problem.totalPoints / problem._count.testCases)
            : 10; // fallback to 10 if problem not found

          // Award points only for newly passed test cases
          points = newTestCasesPassed * pointsPerTestCase;

          // Record the newly passed test cases
          if (newlyPassedTestCases.length > 0) {
            await prisma.passedTestCase.createMany({
              data: newlyPassedTestCases.map((testCaseNumber: number) => ({
                userId: submission.userId,
                problemId: submission.problemId,
                contestId: contestContext,
                testCaseNumber,
              })),
              skipDuplicates: true,
            });
          }
        }

        await prisma.submission.update({
          where: { id: submissionId },
          data: {
            status: overallStatus,
            passedTestCases: passedCount,
            points: points,
            verdict: isAccepted ? "Accepted" : "Failed",
          },
        });
      } else {
        // Submission already processed, just use stored values
        points = submission.points;
        // We don't have newTestCasesPassed stored, so we can't show it
        // But we know if points > 0, then new test cases were passed
        newTestCasesPassed = points > 0 ? passedCount : 0;
        
        await prisma.submission.update({
          where: { id: submissionId },
          data: {
            status: overallStatus,
            passedTestCases: passedCount,
            verdict: isAccepted ? "Accepted" : "Failed",
          },
        });
      }

      // Mark problem as solved if all test cases passed
      if (isAccepted) {
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
      points: points,
      pointsAwarded: points > 0,
      newTestCasesPassed: newTestCasesPassed,
      alreadySolved: pendingCount === 0 && passedCount > 0 && newTestCasesPassed === 0,
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
