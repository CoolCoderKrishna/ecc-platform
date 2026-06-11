import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();
    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
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

    const hashedPassword = await bcrypt.hash(password, 12);

    await db.user.update({
      where: { email: verification.identifier },
      data: { password: hashedPassword },
    });

    await db.verificationToken.delete({ where: { token } });

    return NextResponse.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
