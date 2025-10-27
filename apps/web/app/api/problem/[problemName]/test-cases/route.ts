import prisma from "@repo/db/client";
import { NextResponse, NextRequest } from "next/server";

type RouteContext = { params: Promise<{ problemName: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { problemName } = await context.params;
    const decodedProblemName = decodeURIComponent(problemName);
    console.log("Fetching test cases for problem:", decodedProblemName);
    const problem = await prisma.problem.findUnique({
      where: { name: decodedProblemName },
      select: {
        testCases: {
          select: {
            input: true,
            output: true,
          },
        },
      },
    });

    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    return NextResponse.json({ testCases: problem.testCases });
  } catch (error) {
    console.error("Failed to fetch test cases", error);
    return NextResponse.json(
      { error: "Failed to fetch test cases" },
      { status: 500 }
    );
  }
}