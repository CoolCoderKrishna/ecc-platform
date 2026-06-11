"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = React.useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = React.useState("");

  React.useEffect(() => {
    if (!token) return;

    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus("success");
          setMessage(data.message || "Email verified successfully!");
        } else {
          setStatus("error");
          setMessage(data.error || "Verification failed.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      });
  }, [token]);

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 px-4 dark:from-slate-950 dark:via-blue-950/20 dark:to-purple-950/20">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Email Verification</CardTitle>
            <CardDescription>No verification token provided</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4 py-8">
            <XCircle className="h-12 w-12 text-red-600" />
            <p className="text-center text-lg font-medium">No verification token provided.</p>
            <Button asChild className="mt-4">
              <Link href="/settings">Go to Settings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 px-4 dark:from-slate-950 dark:via-blue-950/20 dark:to-purple-950/20">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Email Verification</CardTitle>
          <CardDescription>Verifying your email address</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4 py-8">
          {status === "loading" && <Loader2 className="h-12 w-12 animate-spin text-blue-600" />}
          {status === "success" && <CheckCircle2 className="h-12 w-12 text-green-600" />}
          {status === "error" && <XCircle className="h-12 w-12 text-red-600" />}
          <p className="text-center text-lg font-medium">
            {status === "loading" ? "Verifying..." : message}
          </p>
          {status === "success" && (
            <Button onClick={() => router.push("/dashboard")} className="mt-4">
              Go to Dashboard
            </Button>
          )}
          {status === "error" && (
            <Button variant="outline" onClick={() => router.push("/settings")} className="mt-4">
              Request new verification
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
