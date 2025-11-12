import { NextRequest, NextResponse } from "next/server";
import prisma from "@repo/db/client";

export async function GET(req: NextRequest) {
  try {
    const userIdHeader = req.headers.get("x-user-id");
    
    if (!userIdHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(userIdHeader, 10);

    // Fetch user's total points from all submissions
    const result = await prisma.submission.aggregate({
      where: {
        userId: userId,
      },
      _sum: {
        points: true,
      },
    });

    const totalPoints = result._sum.points ?? 0;

    // Also fetch submission count and solved problems count
    const [totalSubmissions, solvedProblemsCount] = await Promise.all([
      prisma.submission.count({
        where: { userId },
      }),
      prisma.solvedProblem.count({
        where: { userId },
      }),
    ]);

    return NextResponse.json({
      totalPoints,
      totalSubmissions,
      solvedProblems: solvedProblemsCount,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json({ error: "Failed to fetch user stats" }, { status: 500 });
  }
}
