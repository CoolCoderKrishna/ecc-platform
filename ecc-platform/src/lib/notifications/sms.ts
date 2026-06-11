interface SMSParams {
  to: string;
  message: string;
}

export async function sendSMS({ to, message }: SMSParams) {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      console.error("Twilio credentials not configured");
      return { success: false, error: "Twilio not configured" };
    }

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: to,
        From: fromNumber,
        Body: message,
      }).toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("SMS send error:", data.message);
      return { success: false, error: data.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("SMS service error:", error);
    return { success: false, error };
  }
}

export async function sendWhatsApp({ to, message }: SMSParams) {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

    if (!accountSid || !authToken || !whatsappNumber) {
      console.error("Twilio WhatsApp not configured");
      return { success: false, error: "WhatsApp not configured" };
    }

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: `whatsapp:${to}`,
        From: `whatsapp:${whatsappNumber}`,
        Body: message,
      }).toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("WhatsApp send error:", data.message);
      return { success: false, error: data.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("WhatsApp service error:", error);
    return { success: false, error };
  }
}

export function buildOpportunitySMS(title: string, company: string, url: string) {
  return `🚀 New Opportunity!\n\n${title}\n${company}\n\nView: ${url}`;
}

export function buildDeadlineSMS(title: string, daysLeft: number, url: string) {
  return `⏰ ${title} - ${daysLeft} day${daysLeft !== 1 ? "s" : ""} left!\nApply: ${url}`;
}
