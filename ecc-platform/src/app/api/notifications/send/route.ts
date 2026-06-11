import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { sendEmail, buildOpportunityEmail } from "@/lib/notifications/email";
import { sendTelegramMessage, buildOpportunityAlert } from "@/lib/notifications/telegram";
import { sendSMS, buildOpportunitySMS } from "@/lib/notifications/sms";

// POST /api/notifications/send - Send notifications to matching users
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { opportunityId, title, company, category, url, deadline } = body;

    // Find users who want notifications for this category
    const prefs = await db.notificationPreference.findMany({
      where: {
        categories: { has: category },
      },
      include: { user: true },
    });

    let sentCount = 0;

    for (const pref of prefs) {
      const user = pref.user;
      const channels: string[] = [];

      // Create in-app notification
      await db.notification.create({
        data: {
          userId: user.id,
          title: `New ${category.replace("_", " ")}: ${title}`,
          message: `${company} has posted a new opportunity. ${deadline ? `Deadline: ${deadline}` : ""}`,
          type: "NEW_OPPORTUNITY",
          category: category as any,
          opportunityId,
          sentVia: [],
        },
      });

      // Send email
      if (user.emailNotifications && user.email) {
        const html = buildOpportunityEmail(
          title,
          company,
          `New opportunity from ${company}`,
          url,
          deadline
        );
        await sendEmail({ to: user.email, subject: `New ${category}: ${title}`, html });
        channels.push("EMAIL");
      }

      // Send Telegram
      if (user.telegramBotEnabled && user.telegramChatId) {
        const message = buildOpportunityAlert(title, company, category, url, deadline);
        await sendTelegramMessage({ chatId: user.telegramChatId, text: message });
        channels.push("TELEGRAM");
      }

      // Send SMS
      if (user.smsEnabled && user.phoneNumber) {
        const message = buildOpportunitySMS(title, company, url);
        await sendSMS({ to: user.phoneNumber, message });
        channels.push("SMS");
      }

      sentCount++;
    }

    return NextResponse.json({
      success: true,
      sentTo: sentCount,
      channels: ["IN_APP", "EMAIL", "TELEGRAM", "SMS"],
    });
  } catch (error) {
    console.error("Notification send error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
