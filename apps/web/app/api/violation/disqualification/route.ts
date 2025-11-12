import { NextRequest , NextResponse } from "next/server";
import prisma from "@repo/db/client";

export async function POST(req: NextRequest) {
    try {
        const {contestId, disqualified } = await req.json();
        const userId = req.headers.get('x-user-id');
        if (!userId || !contestId || disqualified === undefined) {
            return NextResponse.json({ error: "User ID, contest ID, and disqualified status are required" }, { status: 400 });
        }

    const uid = parseInt(userId);
    const cid = parseInt(contestId);

    let disqualification = await prisma.disqualified.findFirst({
        where: { userId: uid, contestId: cid },
    });

    if (disqualification) {
        disqualification = await prisma.disqualified.update({
            where: { id: disqualification.id },
            data: {
                disqualified,
                disqualifiedAt: disqualified ? new Date() : null,
            },
        });
    } else {
        disqualification = await prisma.disqualified.create({
            data: {
                userId: uid,
                contestId: cid,
                disqualified,
                disqualifiedAt: disqualified ? new Date() : null,
            },
        });
    }

        return NextResponse.json({ message: "Disqualification status updated successfully", disqualification }, { status: 201 });
    } catch (error) {
        console.error("Error updating disqualification status:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}