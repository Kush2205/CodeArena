import { NextRequest, NextResponse } from "next/server";
import { generateFullCode } from "../../../../../utils/generateFullCode";
import { generateAllTestCases } from "../../../../../utils/generateTestCases";
import prisma from "@repo/db/client";

const languageIdMap: Record<string, number> = {
  cpp: 54,
  python: 71,
  java: 62,
  javascript: 63,
  c: 50,
};

const secret = process.env.JWT_SECRET || "secret";

async function submitBatchToJudge(submissions: Record<string, unknown>[]) {
  const response = await fetch(
    `${process.env.JUDGE0_URI}/submissions/batch?base64_encoded=true`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Accept: "application/json",
      },
      body: JSON.stringify({ submissions }),
    }
  );

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null ? JSON.stringify(data) : text;
    throw new Error(`Judge0 batch submission failed: ${message || "Unknown error"}`);
  }

  return data;
}

async function getBatchResults(tokens: string[]) {
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
  return data;
}

export async function POST(req: NextRequest) {
  try {
    const userIdHeader = req.headers.get("x-user-id");
   
    if (!userIdHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
     const userId = parseInt(userIdHeader, 10);

    const { source_code, language, problemName, contestId } = await req.json();

    const contestIdNumber =
      contestId !== undefined && contestId !== null && contestId !== ""
        ? Number(contestId)
        : null;

    if (contestIdNumber !== null && Number.isNaN(contestIdNumber)) {
      return NextResponse.json({ error: "Invalid contest" }, { status: 400 });
    }

    if (contestIdNumber !== null) {
      const contest = await prisma.contest.findUnique({
        where: { id: contestIdNumber },
        select: {
          EndTime: true,
        },
      });

      if (!contest) {
        return NextResponse.json({ error: "Contest not found" }, { status: 404 });
      }

      const disqualification = await prisma.disqualified.findFirst({
        where: {
          userId,
          contestId: contestIdNumber,
          disqualified: true,
        },
      });

      if (disqualification) {
        return NextResponse.json(
          {
            error: "You have been disqualified from this contest and cannot submit code.",
            code: "DISQUALIFIED",
          },
          { status: 403 }
        );
      }

      if (contest.EndTime && new Date(contest.EndTime).getTime() <= Date.now()) {
        return NextResponse.json(
          {
            error: "Contest has ended. Submissions are closed.",
            code: "CONTEST_ENDED",
          },
          { status: 403 }
        );
      }
    }

    if (!languageIdMap[language]) {
      return NextResponse.json({ error: "Unsupported language" }, { status: 400 });
    }

    const problem = await prisma.problem.findUnique({
      where: { name: problemName },
      select: { id: true }
    });

    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    const judgeCode = generateFullCode(source_code, language, problemName);
    // Use generateAllTestCases to get ALL test cases (including hidden ones) for judge submission
    const testCases = generateAllTestCases(problemName);

    // Create batch submission payload
    const batchSubmissions = testCases.map((testCase, index) => ({
      source_code: Buffer.from(judgeCode, 'utf8').toString('base64'),
      language_id: languageIdMap[language],
      stdin: Buffer.from(testCase.input, 'utf8').toString('base64'),
      expected_output: Buffer.from(testCase.output, 'utf8').toString('base64'),
      cpu_time_limit: 2,
      memory_limit: 512000,
    }));

    console.log(`Submitting batch of ${batchSubmissions.length} test cases to Judge0`);

    // Submit all test cases as a batch
    const batchResponse = await submitBatchToJudge(batchSubmissions);
    
    // Extract tokens from batch response
    const tokens = batchResponse.map((sub: any) => sub.token);
    
    console.log(`Batch submission created with ${tokens.length} tokens`);

    // Wait a bit for Judge0 to process, then check for early failures (compilation errors)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check first test case for compilation errors
    const firstTestResults = await getBatchResults([tokens[0]]);
    const firstTestStatus = firstTestResults.submissions?.[0];
    
    let shouldHalt = false;
    let haltReason = '';
    
    // Status ID 6 = Compilation Error
    if (firstTestStatus?.status?.id === 6) {
      shouldHalt = true;
      haltReason = 'Compilation Error';
      console.log(`Halting submission due to Compilation Error on first test case`);
    }

    const submissionTokens = tokens.map((token: string) => ({
      token,
      passed: false,
      status: "pending",
    }));

    const submission = await prisma.submission.create({
      data: {
        userId: userId,
        problemId: problem.id,
        contestId: contestIdNumber,
        submissionTokens: {
          create: submissionTokens,
        },
        status: shouldHalt ? "failed" : "pending",
        totalTestCases: testCases.length,
        language,
        code: source_code,
      },
    });

    return NextResponse.json({ 
      submissionId: submission.id,
      message: shouldHalt 
        ? `Submission halted due to ${haltReason}`
        : "Submission created successfully",
      halted: shouldHalt,
      haltReason: shouldHalt ? haltReason : null,
      testCasesSubmitted: tokens.length,
      totalTestCases: testCases.length
    }, { status: 201 });
  
  } catch (error) {
    console.error("Error creating submission:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create submission";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
