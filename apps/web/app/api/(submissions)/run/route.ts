import { NextRequest, NextResponse } from "next/server";
import { generateFullCode } from "../../../../../utils/generateFullCode";
import { generateTestCases } from "../../../../../utils/generateTestCases";
import prisma from "@repo/db/client";

const languageIdMap: Record<string, number> = {
  cpp: 54,
  python: 71,
  java: 62,
  javascript: 63,
};

async function submitToJudge(payload: Record<string, unknown>, wait: boolean = false) {
  const response = await fetch(
    `${process.env.JUDGE0_URI}/submissions?base64_encoded=true&wait=${wait}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null ? JSON.stringify(data) : text;
    throw new Error(`Judge0 submission failed: ${message || "Unknown error"}`);
  }

  return data;
}

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

export async function POST(req: NextRequest) {
  try {
    const userIdHeader = req.headers.get("x-user-id");
   
    if (!userIdHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(userIdHeader, 10);
    if (Number.isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user" }, { status: 400 });
    }

    const { source_code, language, problemName, contestId } = await req.json();

    const contestIdNumber =
      contestId !== undefined && contestId !== null && contestId !== ""
        ? Number(contestId)
        : null;

    if (contestIdNumber !== null && Number.isNaN(contestIdNumber)) {
      return NextResponse.json({ error: "Invalid contest" }, { status: 400 });
    }

    if (contestIdNumber !== null) {
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
            error: "You have been disqualified from this contest and cannot run code.",
            code: "DISQUALIFIED",
          },
          { status: 403 }
        );
      }
    }

    if (!languageIdMap[language]) {
      return NextResponse.json({ error: "Unsupported language" }, { status: 400 });
    }

    const judgeCode = generateFullCode(source_code, language, problemName);
    const testCases = generateTestCases(problemName);

    // Take only first 3 test cases for "Run"
    const visibleTestCases = testCases.slice(0, 3);

    // Submit test cases sequentially and halt on compilation error or TLE
    const judgeSubmissions = [];
    let shouldHalt = false;

    for (let index = 0; index < visibleTestCases.length; index++) {
      if (shouldHalt) break;

      const testCase = visibleTestCases[index];
      if (!testCase) continue;

      const payload = {
        source_code: Buffer.from(judgeCode, 'utf8').toString('base64'),
        language_id: languageIdMap[language],
        stdin: Buffer.from(testCase.input, 'utf8').toString('base64'),
        expected_output: Buffer.from(testCase.output, 'utf8').toString('base64'),
        cpu_time_limit: 2,
      };

      console.log(`Judge0 run payload #${index + 1}:`, payload);
      
      // Submit with wait=true for immediate results
      const submission = await submitToJudge(payload, true);
      
      // If wait=true, the response includes the result immediately
      // Otherwise, we need to poll for the result
      let result = submission;
      
      // If status is still in queue or processing, poll for result
      if (submission.status?.id <= 2) {
        // Wait a bit and fetch the result
        await new Promise(resolve => setTimeout(resolve, 1000));
        result = await getSubmissionResult(submission.token);
      }

      const submissionResult = {
        testCaseId: index + 1,
        input: testCase.input,
        expectedOutput: testCase.output,
        status: result.status?.description || 'Unknown',
        statusId: result.status?.id,
        stdout: result.stdout ? Buffer.from(result.stdout, 'base64').toString('utf8') : null,
        stderr: result.stderr ? Buffer.from(result.stderr, 'base64').toString('utf8') : null,
        compileOutput: result.compile_output ? Buffer.from(result.compile_output, 'base64').toString('utf8') : null,
        time: result.time,
        memory: result.memory,
      };

      judgeSubmissions.push(submissionResult);

      // Check if we should halt execution
      // Status ID 6 = Compilation Error, 5 = Time Limit Exceeded
      if (result.status?.id === 6 || result.status?.id === 5) {
        shouldHalt = true;
        console.log(`Halting execution due to ${result.status.description} on test case ${index + 1}`);
      }
    }

    // Process results to determine overall status
    const results = judgeSubmissions.map(result => {
      let status: 'passed' | 'failed' | 'pending' = 'pending';
      
      // Status ID 3 = Accepted
      if (result.statusId === 3) {
        status = 'passed';
      } else if (result.statusId && result.statusId > 3) {
        status = 'failed';
      }

      return {
        testCaseId: result.testCaseId,
        status,
        statusDescription: result.status,
        output: result.stdout || result.stderr || result.compileOutput || '',
        expectedOutput: result.expectedOutput,
        input: result.input,
        time: result.time,
        memory: result.memory,
      };
    });

    return NextResponse.json({ 
      results,
      message: "Code executed successfully"
    }, { status: 200 });
  
  } catch (error) {
    console.error("Error running code:", error);
    const message =
      error instanceof Error ? error.message : "Failed to run code";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
