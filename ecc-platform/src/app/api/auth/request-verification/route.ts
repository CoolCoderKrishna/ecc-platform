import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { sendEmail } from "@/lib/notifications/email";
import { randomUUID } from "crypto";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (user.emailVerified) {
      return NextResponse.json({ message: "Email already verified" });
    }

    const token = randomUUID();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db.verificationToken.create({
      data: {
        identifier: user.email,
        token,
        expires,
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const verifyUrl = `${appUrl}/verify-email?token=${token}`;

    await sendEmail({
      to: user.email,
      subject: "Verify your email address - ECC Hub",
      html: `
        <!DOCTYPE html>
        <html>
        <head><style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; background: #f8fafc; }
          .container { max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 32px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 20px; }
          .content { padding: 32px; }
          .btn { display: inline-block; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; }
        </style></head>
        <body>
          <div class="container">
            <div class="header"><h1>Verify Your Email</h1></div>
            <div class="content">
              <p>Click the button below to verify your email address.</p>
              <p style="text-align:center;margin:24px 0;"><a href="${verifyUrl}" class="btn">Verify Email</a></p>
              <p style="color:#94a3b8;font-size:12px;">This link expires in 24 hours.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return NextResponse.json({ message: "Verification email sent" });
  } catch (error) {
    console.error("Verification request error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
