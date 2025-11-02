import { NextResponse , NextRequest } from "next/server";
import prisma from "@repo/db/client";

export async function GET(req: NextRequest) {
   try {
    const { searchParams } = new URL(req.url);
    const contestId = searchParams.get("contestId");

    if (!contestId) {
        return NextResponse.json({ error: 'contestId is required' }, { status: 400 });
    }

    const problems = await prisma.problem.findMany({
        where: {
            contests: {
                some: {
                    contestId: Number(contestId),
                },
            },
        },
        include: {
            testCases: true,
        },
    });
    return NextResponse.json(problems);
   } catch (error) {
       console.error('Error fetching problems for contest:', error);
       return NextResponse.json({ error: 'Failed to fetch problems for contest' }, { status: 500 });
   }
}