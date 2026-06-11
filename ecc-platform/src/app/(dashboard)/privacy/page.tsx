import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 py-8">
      <Link href="/settings" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back to Settings
      </Link>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: June 2026</p>
      </div>
      <div className="prose prose-slate max-w-none dark:prose-invert space-y-4">
        <h2>1. Information We Collect</h2>
        <p>We collect information you provide during registration (name, email, academic year, skills, interests) and data you submit through the platform (certifications, achievements, portfolio items, goals).</p>
        <h2>2. How We Use Your Information</h2>
        <p>Your information is used to personalize opportunity recommendations, send notifications you have opted into, and improve the platform experience. We do not sell your personal data to third parties.</p>
        <h2>3. Data Storage and Security</h2>
        <p>Your data is stored securely using industry-standard encryption. We implement appropriate technical measures to protect your personal information.</p>
        <h2>4. Third-Party Services</h2>
        <p>We use Resend for email delivery, Twilio for SMS/WhatsApp, and Telegram Bot API for Telegram notifications. These services have their own privacy policies.</p>
        <h2>5. Your Rights</h2>
        <p>You may request access to, correction of, or deletion of your personal data at any time by contacting us. You can delete your account from the Settings page.</p>
        <h2>6. Cookies</h2>
        <p>We use essential cookies for authentication and session management. No tracking cookies are used.</p>
        <h2>7. Contact</h2>
        <p>For privacy-related inquiries, please contact the platform administrator.</p>
      </div>
    </div>
  );
}
