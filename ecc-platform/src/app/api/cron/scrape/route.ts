import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { scrapeAllSources } from "@/lib/scraping/engine";
import { checkDeadlines } from "@/lib/notifications/dispatch";

// GET /api/cron/scrape - Trigger scraping, deadline checks, archival, and source health monitoring
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Run scraping
    const scrapeResults = await scrapeAllSources();

    // 2. Check deadlines and send reminders (BEFORE archival)
    await checkDeadlines();

    // 3. Archive expired opportunities (after reminders so users get final alert)
    const now = new Date();
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const expiredCount = await db.opportunity.updateMany({
      where: {
        OR: [
          { deadline: { lt: now }, isActive: true },
          { publishedAt: { lt: ninetyDaysAgo }, deadline: null, isActive: true },
        ],
      },
      data: { isActive: false },
    });

    // 4. Source health monitoring — deactivate sources with 3+ consecutive failures
    const sourcesWithErrors = await db.dataSource.findMany({
      where: { isActive: true },
      include: {
        scrapeLogs: {
          orderBy: { createdAt: "desc" },
          take: 3,
        },
      },
    });

    const unhealthySources: string[] = [];
    for (const source of sourcesWithErrors) {
      if (source.scrapeLogs.length >= 3) {
        const allFailed = source.scrapeLogs.every((log) => log.status === "FAILED");
        if (allFailed) {
          await db.dataSource.update({
            where: { id: source.id },
            data: { isActive: false, lastError: "Auto-disabled: 3 consecutive failures" },
          });
          unhealthySources.push(source.name);
        }
      }
    }

    const totalNew = scrapeResults.reduce((acc, r) => acc + r.newItems, 0);
    const failed = scrapeResults.filter((r) => !r.success);

    return NextResponse.json({
      success: true,
      scrapeResults: {
        total: scrapeResults.length,
        successful: scrapeResults.filter((r) => r.success).length,
        failed: failed.length,
        newItems: totalNew,
      },
      archived: expiredCount.count,
      sourceHealth: {
        autoDisabled: unhealthySources.length,
        disabledSources: unhealthySources,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cron scrape error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
