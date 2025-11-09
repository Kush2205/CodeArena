import { NextRequest , NextResponse } from "next/server";
import prisma from "@repo/db/client";

export async function GET(req: NextRequest, { params }: { params: Promise<{ contestid: string , dateTime: string }> }) {
    try {
        const { contestid, dateTime } = await params;
        const contestId = parseInt(contestid, 10);
        const contest = await prisma.contest.findUnique({
            where: { id: contestId },
        });

        const startTime = contest?.StartTime;
        const endTime = contest?.EndTime;
        const currentTime = new Date();
        
        if (!startTime || !endTime) {
            return NextResponse.json({ error: "Contest time information is incomplete" }, { status: 500 });
        }

        const clientDateTime = new Date(dateTime);
        
        if (!contest) {
            return NextResponse.json({ error: "Contest not found" }, { status: 404 });
        }

        if (startTime && currentTime < new Date(startTime)) {
            return NextResponse.json({ status: "upcoming", message: "Contest has not started yet" }, { status: 200 });
        }

        if (endTime && currentTime > new Date(endTime)) {
            return NextResponse.json({ status: "ended", message: "Contest has ended" }, { status: 200 });
        }

        if (clientDateTime < startTime || clientDateTime > endTime) {
            return NextResponse.json({ status: "invalid", message: "The provided dateTime is outside the contest duration" }, { status: 400 });
        }

        return NextResponse.json({ status: "ongoing", message: "Contest is ongoing" }, { status: 200 });
        
    } catch (error) {
        console.error("Error fetching contest:", error);
        return NextResponse.json({ error: "Failed to fetch contest" }, { status: 500 });
    }
}