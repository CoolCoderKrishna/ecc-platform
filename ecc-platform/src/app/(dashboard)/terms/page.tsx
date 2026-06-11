import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 py-8">
      <Link href="/settings" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back to Settings
      </Link>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: June 2026</p>
      </div>
      <div className="prose prose-slate max-w-none dark:prose-invert space-y-4">
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing and using ECC Hub (&quot;the Platform&quot;), you agree to be bound by these Terms of Service.</p>
        <h2>2. Description of Service</h2>
        <p>ECC Hub aggregates career opportunities from publicly available sources and provides notifications to users. The Platform does not guarantee the accuracy, completeness, or timeliness of any listed opportunity.</p>
        <h2>3. User Responsibilities</h2>
        <p>You are responsible for maintaining the confidentiality of your account credentials. You agree not to use the Platform for any unlawful purpose or in violation of any applicable laws.</p>
        <h2>4. Intellectual Property</h2>
        <p>The Platform and its original content, features, and functionality are owned by ECC Hub and are protected by applicable intellectual property laws.</p>
        <h2>5. Limitation of Liability</h2>
        <p>ECC Hub shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform.</p>
        <h2>6. Changes to Terms</h2>
        <p>We reserve the right to modify these terms at any time. Users will be notified of material changes via email or platform notification.</p>
        <h2>7. Contact</h2>
        <p>For questions about these terms, please contact the platform administrator.</p>
      </div>
    </div>
  );
}
