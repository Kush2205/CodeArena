import { NextRequest, NextResponse } from "next/server";
import prisma from "@repo/db/client";

export async function GET(req: NextRequest) {
    const userIdHeader = req.headers.get('x-user-id');
    if (!userIdHeader) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = parseInt(userIdHeader, 10);

    const { searchParams } = new URL(req.url);
    const problemId = searchParams.get('problemId');
    const problemName = searchParams.get('problemName');
    const contestId = searchParams.get('contestId');

    if (!problemId && !problemName) {
        return NextResponse.json({ error: "Either problemId or problemName is required" }, { status: 400 });
    }

    const whereClause: any = { userId };

    if (problemId) {
        whereClause.problemId = parseInt(problemId, 10);
    } else if (problemName) {
        whereClause.problem = { name: problemName };
    }

    if (contestId) {
        whereClause.contestId = parseInt(contestId, 10);
    }

    const submissions = await prisma.submission.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
            id: true,
            status: true,
            verdict: true,
            passedTestCases: true,
            totalTestCases: true,
            language: true,
            code: true,
            createdAt: true,
            problem: { select: { name: true } },
            contest: { select: { name: true } },
            submissionTokens: {
                select: {
                    token: true,
                    passed: true,
                    status: true,
                }
            }
        },
    });

    return NextResponse.json(submissions);
}