import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user || (session.user as Record<string, unknown>)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      return NextResponse.json({ error: "Cron secret not configured" }, { status: 500 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${appUrl}/api/cron/scrape`, {
      headers: { Authorization: `Bearer ${cronSecret}` },
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Admin scrape proxy error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
