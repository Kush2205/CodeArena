import { NextResponse , NextRequest } from "next/server";
import prisma from "@repo/db/client";

export async function POST(req: NextRequest) {
    try {
        const { problemId , contestId, reason } = await req.json();
        const userId = req.headers.get('x-user-id');

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized - No user ID provided" }, { status: 401 });
        }

        if (contestId === undefined || contestId === null || !reason || !problemId) {
            return NextResponse.json({ error: "Contest ID, reason, and problem ID are required" }, { status: 400 });
        }

        const contestIdValue = typeof contestId === "string" ? parseInt(contestId, 10) : contestId;
        const problemIdValue = typeof problemId === "string" ? parseInt(problemId, 10) : problemId;

        if (!Number.isFinite(contestIdValue) || !Number.isFinite(problemIdValue)) {
            return NextResponse.json({ error: "Contest ID and problem ID must be valid numbers" }, { status: 400 });
        }

        const violation = await prisma.violation.create({
            data: {
                userId: parseInt(userId, 10),
                contestId: contestIdValue,
                problemId: problemIdValue,
                violationType: reason,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });

        return NextResponse.json({ message: "Violation reported successfully", violation }, { status: 201 });
    } catch (error) {
        console.error("Error reporting violation:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
