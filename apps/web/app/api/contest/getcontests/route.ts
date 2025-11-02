import { NextResponse , NextRequest } from "next/server";
import prisma from "@repo/db/client"

export async function GET(req: NextRequest) {
    try {
        const contests = await prisma.contest.findMany();
        return NextResponse.json(contests);
    } catch (error) {
        console.error('Error fetching contests:', error);
        return NextResponse.json({ error: 'Failed to fetch contests' }, { status: 500 });
    }
}