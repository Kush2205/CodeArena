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

const secret = process.env.JWT_SECRET || "secret";

async function submitToJudge(payload: Record<string, unknown>) {
  const response = await fetch(
    `${process.env.JUDGE0_URI}/submissions?base64_encoded=true&wait=false`,
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

export async function POST(req: NextRequest) {
  try {
    const userIdHeader = req.headers.get("x-user-id");
   
    if (!userIdHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
     const userId = parseInt(userIdHeader, 10);

    const { source_code, language, problemName, contestId } = await req.json();

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
    const testCases = generateTestCases(problemName);

    const judgeSubmissions = await Promise.all(
      testCases.map((testCase, index) => {
        const payload = {
          source_code: Buffer.from(judgeCode, 'utf8').toString('base64'),
          language_id: languageIdMap[language],
          stdin: Buffer.from(testCase.input, 'utf8').toString('base64'),
          expected_output: Buffer.from(testCase.output, 'utf8').toString('base64'),
          
        };

        console.log(`Judge0 payload #${index + 1}:`, payload);
        return submitToJudge(payload);
      })
    );

    const tokens = judgeSubmissions.map(sub => sub.token);

    const submissionTokens = tokens.map(token => ({
      token,
      passed: false,
      status: "pending",
    }));

    const submission = await prisma.submission.create({
      data: {
        userId: userId,
        problemId: problem.id,
        contestId: contestId ? parseInt(contestId) : null,
        submissionTokens: {
          create: submissionTokens,
        },
        status: "pending",
        totalTestCases: testCases.length,
        language,
        code: source_code,
      },
    });

    return NextResponse.json({ 
      submissionId: submission.id,
      message: "Submission created successfully"
    }, { status: 201 });
  
  } catch (error) {
    console.error("Error creating submission:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create submission";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
