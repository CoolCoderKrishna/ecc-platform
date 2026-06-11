import Parser from "rss-parser";

export interface RSSItem {
  title: string;
  link: string;
  description?: string;
  contentSnippet?: string;
  pubDate?: string;
  creator?: string;
  categories?: string[];
  enclosure?: {
    url: string;
    type?: string;
  };
}

const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent":
      "ECC-Platform/1.0 (Career Opportunity Aggregator for CS Students)",
  },
});

export class RSSParser {
  static async parse(url: string): Promise<RSSItem[]> {
    try {
      const feed = await parser.parseURL(url);

      const items: RSSItem[] = feed.items.map((item) => ({
        title: item.title || "Untitled",
        link: item.link || "",
        description:
          item.contentSnippet?.substring(0, 500) ||
          item.content?.substring(0, 500) ||
          "",
        contentSnippet: item.contentSnippet,
        pubDate: item.pubDate || item.isoDate,
        creator: item.creator,
        categories: item.categories,
        enclosure: item.enclosure
          ? {
              url: item.enclosure.url,
              type: item.enclosure.type,
            }
          : undefined,
      }));

      return items;
    } catch (error) {
      console.error(`Failed to parse RSS feed ${url}:`, error);
      throw error;
    }
  }

  static async test(url: string): Promise<boolean> {
    try {
      await parser.parseURL(url);
      return true;
    } catch {
      return false;
    }
  }
}
