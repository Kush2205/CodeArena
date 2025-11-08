import { NextRequest, NextResponse } from "next/server";
import prisma from "@repo/db/client";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "secret");

export async function GET(req: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.get("Authorization");
    
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized - No token provided" }, { status: 401 });
    }

    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

    // Verify token and extract user info
    let userId: number;
    let userRole: string;

    try {
      const { payload } = await jwtVerify(token, secret);
      userId = payload.userId as number;

      // Fetch user to check role
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      userRole = user.role;
    } catch (error) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    // Check if user is admin
    if (userRole !== "admin") {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    // Fetch all users with their total points
    const usersWithPoints = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        submissions: {
          select: {
            points: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    // Calculate total points for each user and build leaderboard
    const leaderboard = usersWithPoints
      .map((user) => {
        const totalPoints = user.submissions.reduce((sum, submission) => sum + submission.points, 0);
        const completedSubmissions = user.submissions.filter(s => s.status === "completed").length;
        const totalSubmissions = user.submissions.length;

        return {
          userId: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          totalPoints,
          completedSubmissions,
          totalSubmissions,
        };
      })
      .sort((a, b) => b.totalPoints - a.totalPoints) // Sort by total points descending
      .map((user, index) => ({
        rank: index + 1,
        ...user,
      }));

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}
