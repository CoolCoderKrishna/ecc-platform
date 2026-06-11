"use client";

import * as React from "react";
import Link from "next/link";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch {
      // Always show success to prevent email enumeration
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 px-4 dark:from-slate-950 dark:via-blue-950/20 dark:to-purple-950/20">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardContent className="flex flex-col items-center space-y-4 py-12">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
            <p className="text-center text-lg font-medium">Check your email</p>
            <p className="text-center text-sm text-slate-500">If an account exists, we&apos;ve sent a password reset link.</p>
            <Button asChild variant="outline"><Link href="/login">Back to sign in</Link></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 px-4 dark:from-slate-950 dark:via-blue-950/20 dark:to-purple-950/20">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg shadow-blue-500/25">
              <Mail className="h-7 w-7 text-white" />
            </div>
            <span className="text-3xl font-bold">
              <span className="text-blue-600">ECC</span>
              <span className="text-slate-400">Hub</span>
            </span>
          </Link>
        </div>
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Forgot password?</CardTitle>
            <CardDescription>Enter your email and we&apos;ll send you a reset link.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input type="email" placeholder="you@example.com" className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full h-12" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Send reset link
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-slate-500">
              Remember your password?{" "}
              <Link href="/login" className="font-medium text-blue-600 hover:underline">Sign in</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
