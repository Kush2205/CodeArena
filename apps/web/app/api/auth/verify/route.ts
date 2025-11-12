import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "secret");

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    
    if (!authHeader) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

    try {
      const { payload } = await jwtVerify(token, secret);
      
      return NextResponse.json({
        valid: true,
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        exp: payload.exp,
        expiresAt: payload.exp ? new Date(payload.exp * 1000).toISOString() : null,
      });
    } catch (error) {
      return NextResponse.json({ 
        valid: false,
        error: "Invalid or expired token",
        details: error instanceof Error ? error.message : "Unknown error"
      }, { status: 401 });
    }
  } catch (error) {
    console.error("Error verifying token:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
