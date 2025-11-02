import { NextResponse , NextRequest  } from "next/server";
import { Params } from "next/dist/server/request/params";
import prisma from "@repo/db/client";

export async function GET(req: NextRequest , {params} : {params: Params}) {

       const Judge0_URI = process.env.JUDGE0_URI;
      const submissionTokens = params.submissionTokens;

      return NextResponse.json({ status: "Fetching submission statuses..." , submissionTokens });
}