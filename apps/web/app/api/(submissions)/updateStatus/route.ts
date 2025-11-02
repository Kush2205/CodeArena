import { NextRequest } from "next/server";
import prisma  from "@repo/db/client";

export async function PUT(req: NextRequest) {
    const { submissionId, status } = await req.json();
    if (!submissionId || !status) {
        return new Response(JSON.stringify({ error: "submissionId and status are required" }), { status: 400 });
    }
}