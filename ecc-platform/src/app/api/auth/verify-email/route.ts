import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();
    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const verification = await db.verificationToken.findUnique({
      where: { token },
    });

    if (!verification) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    if (verification.expires < new Date()) {
      await db.verificationToken.delete({ where: { token } });
      return NextResponse.json({ error: "Token has expired" }, { status: 400 });
    }

    await db.user.update({
      where: { email: verification.identifier },
      data: { emailVerified: new Date() },
    });

    await db.verificationToken.delete({ where: { token } });

    return NextResponse.json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
