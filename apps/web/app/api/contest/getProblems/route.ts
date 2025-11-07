import { NextResponse , NextRequest } from "next/server";
import prisma from "@repo/db/client";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "secret");

const parseUserId = (raw: unknown): number | null => {
    if (typeof raw === "number" && Number.isFinite(raw)) {
        return raw;
    }
    if (typeof raw === "string") {
        const parsed = Number.parseInt(raw, 10);
        return Number.isNaN(parsed) ? null : parsed;
    }
    return null;
};

async function resolveUserId(req: NextRequest): Promise<number | null> {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
        return null;
    }

    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
    if (!token) {
        return null;
    }

    try {
        const { payload } = await jwtVerify(token, secret);
        return parseUserId(payload?.userId);
    } catch (error) {
        console.warn("Failed to verify token for contest problems request", error);
        return null;
    }
}

export async function GET(req: NextRequest) {
   try {
    const { searchParams } = new URL(req.url);
    const contestId = searchParams.get("contestId");

    if (!contestId) {
        return NextResponse.json({ error: 'contestId is required' }, { status: 400 });
    }

    const contestIdNumber = Number(contestId);

    if (Number.isNaN(contestIdNumber)) {
        return NextResponse.json({ error: 'contestId must be a number' }, { status: 400 });
    }

    const contest = await prisma.contest.findUnique({
        where: { id: contestIdNumber },
    });

    if (!contest) {
        return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
    }

    const problems = await prisma.problem.findMany({
        where: {
            contests: {
                some: {
                    contestId: contestIdNumber,
                },
            },
        },
        include: {
            testCases: true,
        },
    });
    const userId = await resolveUserId(req);
    let solvedProblemIds = new Set<number>();

    if (userId) {
        const problemIds = problems.map((problem) => problem.id);
        if (problemIds.length > 0) {
            const solvedRecords = await (prisma as unknown as {
                solvedProblem: {
                    findMany: (args: unknown) => Promise<Array<{ problemId: number; contestId: number | null }>>;
                };
            }).solvedProblem.findMany({
                where: {
                    userId,
                    problemId: { in: problemIds },
                    OR: [
                        { contestId: contestIdNumber },
                        { contestId: null },
                    ],
                },
                select: { problemId: true },
            });
            solvedProblemIds = new Set(solvedRecords.map((record) => record.problemId));
        }
    }
    const contestData = {
        id: contest.id,
        name: contest.name,
        proctoringEnabled: (contest as { proctoringEnabled?: boolean }).proctoringEnabled ?? false,
        endTime: contest.EndTime ? contest.EndTime.toISOString() : null,
    };

    const normalizedProblems = problems.map((problem) => ({
        ...problem,
        solved: solvedProblemIds.has(problem.id),
    }));

    return NextResponse.json({
        contest: contestData,
        problems: normalizedProblems,
    });
   } catch (error) {
       console.error('Error fetching problems for contest:', error);
       return NextResponse.json({ error: 'Failed to fetch problems for contest' }, { status: 500 });
   }
}