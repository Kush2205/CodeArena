import prisma from "@repo/db/client";
import { NextResponse, NextRequest  } from "next/server";


type Params = { params: { problemName: string } };
  type RouteContext = { params: Promise<{ problemName: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { problemName } = await context.params;
  const decodedProblemName = decodeURIComponent(problemName);
  const boilerplates = await prisma.problem.findUnique({
    where: { name: decodedProblemName },
    select: {
       boilerplateCodeCpp: true,
       boilerplateCodeJavaScript: true,
       boilerplateCodePython: true,
       boilerplateCodeJava: true,
    },
  });

  if (!boilerplates) {
    return NextResponse.json(
      { error: "Problem not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ boilerplates: boilerplates });
}