import { RSSParser } from "@/lib/scraping/rss";
import { HTMLParser } from "@/lib/scraping/html";
import { db } from "@/lib/db";
import { generateContentHash } from "@/lib/utils";
import type { Category } from "@prisma/client";

export interface ScrapeResult {
  success: boolean;
  itemsFound: number;
  newItems: number;
  error?: string;
  duration: number;
}

interface ScrapedItem {
  title: string;
  link: string;
  description?: string;
  pubDate?: string;
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '\"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 500);
}

async function withRetry<T>(fn: () => Promise<T>, retries = 2, delayMs = 3000): Promise<T> {
  let lastError: Error | undefined;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (i < retries) await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
    }
  }
  throw lastError;
}

async function processScrapedItems(
  sourceId: string,
  sourceUrl: string,
  category: string,
  items: ScrapedItem[]
): Promise<{ newItems: number }> {
  let newItems = 0;

  for (const item of items) {
    const contentHash = generateContentHash(
      `${item.title}-${item.link}-${category}`
    );

    const existing = await db.opportunity.findUnique({
      where: { contentHash },
    });

    if (!existing) {
      await db.opportunity.create({
        data: {
          title: item.title,
          description: stripHtml(item.description || ""),
          source: sourceUrl,
          sourceUrl: item.link,
          category: category as Category,
          contentHash,
          publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
        },
      });
      newItems++;
    }
  }

  return { newItems };
}

async function logScrapeResult(
  sourceId: string,
  success: boolean,
  itemsFound: number,
  newItems: number,
  duration: number,
  errorMessage?: string
) {
  await db.scrapeLog.create({
    data: {
      sourceId,
      status: success ? "SUCCESS" : "FAILED",
      itemsFound,
      newItems,
      errorMessage,
      duration,
    },
  });

  await db.dataSource.update({
    where: { id: sourceId },
    data: { 
      lastScraped: new Date(), 
      lastError: success ? null : errorMessage 
    },
  });
}

export async function scrapeRSSSource(
  sourceId: string,
  url: string,
  category: string
): Promise<ScrapeResult> {
  const start = Date.now();

  try {
    const items = await withRetry(() => RSSParser.parse(url));
    const { newItems } = await processScrapedItems(sourceId, url, category, items);
    const duration = Date.now() - start;

    await logScrapeResult(sourceId, true, items.length, newItems, duration);

    return { success: true, itemsFound: items.length, newItems, duration };
  } catch (error) {
    const duration = Date.now() - start;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    await logScrapeResult(sourceId, false, 0, 0, duration, errorMessage);

    return {
      success: false,
      itemsFound: 0,
      newItems: 0,
      error: errorMessage,
      duration,
    };
  }
}

export async function scrapeHTMLSource(
  sourceId: string,
  url: string,
  category: string,
  selectors: { title: string; link: string; description?: string }
): Promise<ScrapeResult> {
  const start = Date.now();

  try {
    const items = await withRetry(() => HTMLParser.parse(url, selectors));
    const { newItems } = await processScrapedItems(sourceId, url, category, items);
    const duration = Date.now() - start;

    await logScrapeResult(sourceId, true, items.length, newItems, duration);

    return { success: true, itemsFound: items.length, newItems, duration };
  } catch (error) {
    const duration = Date.now() - start;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    await logScrapeResult(sourceId, false, 0, 0, duration, errorMessage);

    return {
      success: false,
      itemsFound: 0,
      newItems: 0,
      error: errorMessage,
      duration,
    };
  }
}

export async function scrapeAllSources() {
  const sources = await db.dataSource.findMany({
    where: { isActive: true },
  });

  const results = [];

  for (const source of sources) {
    let result: ScrapeResult;

    switch (source.type) {
      case "RSS":
        result = await scrapeRSSSource(source.id, source.url, source.category);
        break;
      case "SCRAPER":
        const config = source.config as { selectors?: { title: string; link: string; description?: string } } | null;
        result = await scrapeHTMLSource(
          source.id,
          source.url,
          source.category,
          config?.selectors || {
            title: "h2 a",
            link: "h2 a",
            description: "p",
          }
        );
        break;
      default:
        result = {
          success: false,
          itemsFound: 0,
          newItems: 0,
          error: `Unsupported source type: ${source.type}`,
          duration: 0,
        };
    }

    results.push({ sourceId: source.id, sourceName: source.name, ...result });

    // Rate limiting: wait between sources
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  return results;
}
