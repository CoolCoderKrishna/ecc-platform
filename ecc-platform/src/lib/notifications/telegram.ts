function getTelegramApi() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.warn("TELEGRAM_BOT_TOKEN not set, Telegram skipped");
    return null;
  }
  return `https://api.telegram.org/bot${token}`;
}

interface TelegramMessage {
  chatId: string;
  text: string;
  parseMode?: "HTML" | "Markdown";
}

export async function sendTelegramMessage({ chatId, text, parseMode = "HTML" }: TelegramMessage) {
  try {
    const api = getTelegramApi();
    if (!api) return { success: false, error: "Telegram not configured" };
    const response = await fetch(`${api}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: parseMode,
        disable_web_page_preview: false,
      }),
    });

    const data = await response.json();

    if (!data.ok) {
      console.error("Telegram send error:", data.description);
      return { success: false, error: data.description };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Telegram service error:", error);
    return { success: false, error };
  }
}

export function buildOpportunityAlert(title: string, company: string, category: string, url: string, deadline?: string) {
  const categoryEmoji: Record<string, string> = {
    INTERNSHIP: "💼",
    CERTIFICATION: "📜",
    HACKATHON: "🏆",
    COMPETITION: "🎯",
    RESEARCH: "🔬",
    OPEN_SOURCE: "🌐",
    SCHOLARSHIP: "🎓",
  };

  const emoji = categoryEmoji[category] || "📌";

  let message = `${emoji} <b>New Opportunity Found!</b>\n\n`;
  message += `<b>${title}</b>\n`;
  message += `🏢 ${company}\n`;
  message += `📂 ${category.replace("_", " ")}\n`;

  if (deadline) {
    message += `\n⏰ <b>Deadline:</b> ${deadline}\n`;
  }

  message += `\n🔗 <a href="${url}">View Details</a>`;

  return message;
}

export function buildDeadlineReminder(title: string, daysLeft: number, url: string) {
  let urgency = "⏰";
  if (daysLeft <= 3) urgency = "🚨";
  else if (daysLeft <= 7) urgency = "⚠️";

  return `${urgency} <b>Deadline Reminder!</b>\n\n` +
    `<b>${title}</b>\n` +
    `📅 Only <b>${daysLeft} day${daysLeft !== 1 ? "s" : ""}</b> left!\n\n` +
    `🔗 <a href="${url}">Apply Now</a>`;
}

export function buildWeeklyDigest(count: number, categories: string[]) {
  return `📊 <b>Weekly Career Digest</b>\n\n` +
    `Found <b>${count}</b> new opportunities this week!\n\n` +
    `📂 Categories: ${categories.join(", ")}\n\n` +
    `🔗 <a href="${process.env.NEXT_PUBLIC_APP_URL}/opportunities">Browse All</a>`;
}

export async function setupWebhook(webhookUrl: string) {
  try {
    const api = getTelegramApi();
    if (!api) return { success: false, error: "Telegram not configured" };
    const response = await fetch(`${api}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: webhookUrl }),
    });

    const data = await response.json();
    return { success: data.ok, data };
  } catch (error) {
    console.error("Webhook setup error:", error);
    return { success: false, error };
  }
}
