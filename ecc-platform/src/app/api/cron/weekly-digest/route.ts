import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { sendEmail, buildWeeklyDigestEmail } from "@/lib/notifications/email";
import { sendTelegramMessage, buildWeeklyDigest } from "@/lib/notifications/telegram";

// GET /api/cron/weekly-digest - Send weekly digest to all users
export async function GET(req: Request) {
  try {
    // Verify cron secret for security
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get opportunities from the last 7 days
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentOpps = await db.opportunity.findMany({
      where: {
        createdAt: { gte: oneWeekAgo },
        isActive: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    if (recentOpps.length === 0) {
      return NextResponse.json({ success: true, message: "No new opportunities this week", sentTo: 0 });
    }

    // Get users who want weekly digests
    const users = await db.user.findMany({
      where: {
        notificationFreq: "WEEKLY",
        emailNotifications: true,
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    let sentCount = 0;

    for (const user of users) {
      try {
        // Filter opportunities by user's skills and interests
        const matchedOpps = recentOpps
          .filter((opp) => {
            if (!user.skills || user.skills.length === 0) return true;
            return opp.skillsRequired.some((skill) =>
              user.skills.some((us) => us.toLowerCase() === skill.toLowerCase())
            );
          })
          .slice(0, 10);

        if (matchedOpps.length === 0) continue;

        const emailOpps = matchedOpps.map((opp) => ({
          title: opp.title,
          company: opp.company || "Unknown",
          category: opp.category,
          url: opp.sourceUrl || `${appUrl}/opportunities`,
        }));

        const html = buildWeeklyDigestEmail(emailOpps);
        await sendEmail({
          to: user.email,
          subject: `📊 Weekly Career Digest - ${matchedOpps.length} new opportunities`,
          html,
        });

        // Send Telegram digest
        if (user.telegramBotEnabled && user.telegramChatId) {
          const categories = [...new Set(matchedOpps.map((o) => o.category))];
          const text = buildWeeklyDigest(matchedOpps.length, categories);
          await sendTelegramMessage({ chatId: user.telegramChatId, text });
        }

        sentCount++;
      } catch (e) {
        console.error(`Failed to send digest to user ${user.id}:`, e);
      }
    }

    return NextResponse.json({
      success: true,
      totalOpportunities: recentOpps.length,
      sentTo: sentCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Weekly digest error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
