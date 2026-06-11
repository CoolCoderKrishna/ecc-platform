import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/notifications/email";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: "If the email exists, a reset link has been sent." });
    }

    const token = randomUUID();
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await db.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    await sendEmail({
      to: email,
      subject: "Reset your password - ECC Hub",
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
            <div class="header"><h1>Reset Your Password</h1></div>
            <div class="content">
              <p>Click the button below to reset your password.</p>
              <p style="text-align:center;margin:24px 0;"><a href="${resetUrl}" class="btn">Reset Password</a></p>
              <p style="color:#94a3b8;font-size:12px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return NextResponse.json({ message: "If the email exists, a reset link has been sent." });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
