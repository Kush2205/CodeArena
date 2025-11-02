import { NextRequest , NextResponse } from "next/server";
import bcrypt from "bcrypt"
import prisma from "@repo/db/client";
import { SignJWT } from "jose";
export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
        }
        
        const secret = new TextEncoder().encode(process.env.JWT_SECRET as string || "secret");
        const token = await new SignJWT({ userId: user.id, email: user.email })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('24h')
            .sign(secret);

        return NextResponse.json({ message: "Sign in successful", userId: user.id, token }, { status: 200 });
    } catch (error) {
        console.error("Error during sign in:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
