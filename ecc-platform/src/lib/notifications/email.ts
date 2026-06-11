import { Resend } from "resend";

let resend: Resend;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getResend() {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set, email skipped");
    return null;
  }
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

interface EmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailParams) {
  try {
    const client = getResend();
    if (!client) return { success: false, error: "Email service not configured" };
    const { data, error } = await client.emails.send({
      from: process.env.EMAIL_FROM || "ECC Platform <notifications@eccplatform.com>",
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Email send error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Email service error:", error);
    return { success: false, error };
  }
}

export function buildOpportunityEmail(title: string, company: string, description: string, url: string, deadline?: string) {
  const safeTitle = escapeHtml(title);
  const safeCompany = escapeHtml(company);
  const safeDescription = escapeHtml(description);
  const safeUrl = escapeHtml(url);
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 32px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; }
        .content { padding: 32px; }
        .title { font-size: 20px; font-weight: 700; color: #1e293b; margin-bottom: 8px; }
        .company { color: #64748b; margin-bottom: 16px; }
        .description { color: #475569; line-height: 1.6; margin-bottom: 24px; }
        .deadline { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 0 8px 8px 0; margin-bottom: 24px; }
        .btn { display: inline-block; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; }
        .footer { padding: 24px 32px; background: #f8fafc; text-align: center; color: #94a3b8; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚡ ECC Hub - New Opportunity</h1>
        </div>
        <div class="content">
          <div class="title">${safeTitle}</div>
          <div class="company">${safeCompany}</div>
          <div class="description">${safeDescription}</div>
          ${deadline ? `<div class="deadline">⏰ Deadline: ${escapeHtml(deadline)}</div>` : ''}
          <a href="${safeUrl}" class="btn">View Opportunity →</a>
        </div>
        <div class="footer">
          <p>You received this because you have notifications enabled on ECC Hub.</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/settings">Manage notification preferences</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function buildWeeklyDigestEmail(opportunities: Array<{ title: string; company: string; category: string; url: string }>) {
  const items = opportunities
    .map(
      (opp) => {
        const safeTitle = escapeHtml(opp.title);
        const safeCompany = escapeHtml(opp.company);
        const safeUrl = escapeHtml(opp.url);
        return `
      <tr>
        <td style="padding:12px 0; border-bottom:1px solid #e2e8f0;">
          <a href="${safeUrl}" style="color:#1e293b; text-decoration:none; font-weight:600;">${safeTitle}</a>
          <br><span style="color:#64748b; font-size:14px;">${safeCompany} · ${escapeHtml(opp.category)}</span>
        </td>
      </tr>
    `;
      }
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 32px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; }
        .content { padding: 32px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header"><h1>📊 Weekly Digest</h1></div>
        <div class="content">
          <p style="color:#475569;">Here are the top opportunities matching your profile this week:</p>
          <table style="width:100%; border-collapse:collapse;">${items}</table>
          <br>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/opportunities" style="display:inline-block; background:linear-gradient(135deg,#3b82f6,#8b5cf6); color:white; text-decoration:none; padding:12px 32px; border-radius:8px; font-weight:600;">View All Opportunities →</a>
        </div>
      </div>
    </body>
    </html>
  `;
}
