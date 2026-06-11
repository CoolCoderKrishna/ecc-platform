import { db } from "@/lib/db";
import { sendEmail, buildOpportunityEmail } from "@/lib/notifications/email";
import { sendTelegramMessage, buildOpportunityAlert, buildDeadlineReminder } from "@/lib/notifications/telegram";
import { sendSMS, sendWhatsApp, buildOpportunitySMS } from "@/lib/notifications/sms";
import { daysUntil } from "@/lib/utils";

interface NotifyUser {
  id: string;
  email?: string | null;
  emailNotifications: boolean;
  telegramBotEnabled: boolean;
  telegramChatId?: string | null;
  smsEnabled: boolean;
  phoneNumber?: string | null;
  whatsappEnabled?: boolean;
  whatsappNumber?: string | null;
}

interface OpportunityData {
  id: string;
  title: string;
  company?: string | null;
  category: string;
  sourceUrl?: string | null;
  deadline?: Date | null;
}

// Dispatch notification to all channels a user has enabled
export async function dispatchNotification(
  user: NotifyUser,
  opportunity: OpportunityData,
  type: "NEW_OPPORTUNITY" | "DEADLINE_REMINDER" = "NEW_OPPORTUNITY"
) {
  const channels: string[] = [];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const url = opportunity.sourceUrl || `${appUrl}/opportunities`;
  const company = opportunity.company || "Unknown Company";
  const deadlineStr = opportunity.deadline
    ? new Date(opportunity.deadline).toLocaleDateString()
    : undefined;

  // 1. Create in-app notification
  const title =
    type === "NEW_OPPORTUNITY"
      ? `New ${opportunity.category.replace("_", " ")}: ${opportunity.title}`
      : `⏰ Deadline: ${opportunity.title}`;

  const message =
    type === "NEW_OPPORTUNITY"
      ? `${company} has posted a new opportunity.`
      : `Deadline is approaching for ${opportunity.title}!`;

  await db.notification.create({
    data: {
      userId: user.id,
      title,
      message,
      type,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      category: opportunity.category as any,
      opportunityId: opportunity.id,
      sentVia: [],
    },
  });
  channels.push("IN_APP");

  // 2. Email
  if (user.emailNotifications && user.email) {
    try {
      const html = buildOpportunityEmail(
        opportunity.title,
        company,
        message,
        url,
        deadlineStr
      );
      await sendEmail({
        to: user.email,
        subject: title,
        html,
      });
      channels.push("EMAIL");
    } catch (e) {
      console.error("Email send failed:", e);
    }
  }

  // 3. Telegram
  if (user.telegramBotEnabled && user.telegramChatId) {
    try {
      const text =
        type === "DEADLINE_REMINDER" && opportunity.deadline
          ? buildDeadlineReminder(
              opportunity.title,
              daysUntil(opportunity.deadline),
              url
            )
          : buildOpportunityAlert(
              opportunity.title,
              company,
              opportunity.category,
              url,
              deadlineStr
            );
      await sendTelegramMessage({ chatId: user.telegramChatId, text });
      channels.push("TELEGRAM");
    } catch (e) {
      console.error("Telegram send failed:", e);
    }
  }

  // 4. SMS
  if (user.smsEnabled && user.phoneNumber) {
    try {
      const smsText = buildOpportunitySMS(
        opportunity.title,
        company,
        url
      );
      await sendSMS({ to: user.phoneNumber, message: smsText });
      channels.push("SMS");
    } catch (e) {
      console.error("SMS send failed:", e);
    }
  }

  // 5. WhatsApp
  if (user.whatsappEnabled && user.whatsappNumber) {
    try {
      const whatsappText = buildOpportunitySMS(
        opportunity.title,
        company,
        url
      );
      await sendWhatsApp({ to: user.whatsappNumber, message: whatsappText });
      channels.push("WHATSAPP");
    } catch (e) {
      console.error("WhatsApp send failed:", e);
    }
  }

  return channels;
}

// Find matching users and notify them about a new opportunity
export async function notifyMatchingUsers(opportunity: OpportunityData) {
  const users = await db.user.findMany({
    where: {
      OR: [
        { emailNotifications: true },
        { telegramBotEnabled: true },
        { smsEnabled: true },
      ],
    },
  });

  let notifiedCount = 0;

  for (const user of users) {
    try {
      await dispatchNotification(user, opportunity, "NEW_OPPORTUNITY");
      notifiedCount++;
    } catch (e) {
      console.error(`Failed to notify user ${user.id}:`, e);
    }
  }

  return notifiedCount;
}

// Check for approaching deadlines and send reminders
export async function checkDeadlines() {
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const upcomingOpps = await db.opportunity.findMany({
    where: {
      deadline: {
        gte: now,
        lte: sevenDaysFromNow,
      },
      isActive: true,
    },
  });

  for (const opp of upcomingOpps) {
    if (!opp.deadline) continue;

    const days = daysUntil(opp.deadline);
    if (days <= 3 || days === 7) {
      const users = await db.user.findMany({
        where: {
          OR: [
            { emailNotifications: true },
            { telegramBotEnabled: true },
            { smsEnabled: true },
          ],
        },
      });

      for (const user of users) {
        await dispatchNotification(user, opp, "DEADLINE_REMINDER");
      }
    }
  }
}
