import { NextRequest , NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { SignJWT } from "jose";
import prisma from "@repo/db/client";

export async function POST(req: NextRequest) {
    try {
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: "Email already in use" }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        const secret = new TextEncoder().encode(process.env.JWT_SECRET as string || "secret");
        const token = await new SignJWT({ userId: newUser.id, email: newUser.email })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('7d')
            .sign(secret);

        return NextResponse.json({ message: "User created successfully", userId: newUser.id, token }, { status: 201 });
    } catch (error) {
        console.error("Error during sign up:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}