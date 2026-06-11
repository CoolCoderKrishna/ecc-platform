import * as cheerio from "cheerio";

export interface ScrapedItem {
  title: string;
  link: string;
  description?: string;
}

export class HTMLParser {
  static async parse(
    url: string,
    selectors: {
      title: string;
      link: string;
      description?: string;
      container?: string;
    }
  ): Promise<ScrapedItem[]> {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "ECC-Platform/1.0 (Career Opportunity Aggregator for CS Students)",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const items: ScrapedItem[] = [];

    const container = selectors.container
      ? $(selectors.container)
      : $("body");

    container.each((_, element) => {
      const titleEl = $(element).find(selectors.title).first();
      const linkEl = $(element).find(selectors.link).first();

      const title = titleEl.text().trim();
      const href = linkEl.attr("href") || titleEl.attr("href") || "";

      if (!title || !href) return;

      // Resolve relative URLs
      let fullLink = href;
      if (href.startsWith("/")) {
        const baseUrl = new URL(url);
        fullLink = `${baseUrl.origin}${href}`;
      } else if (!href.startsWith("http")) {
        const baseUrl = new URL(url);
        fullLink = `${baseUrl.origin}/${href}`;
      }

      let description = "";
      if (selectors.description) {
        description = $(element).find(selectors.description).first().text().trim();
      }

      items.push({
        title,
        link: fullLink,
        description: description.substring(0, 500),
      });
    });

    return items;
  }

  static async extractMetaInfo(url: string) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "ECC-Platform/1.0 (Career Opportunity Aggregator for CS Students)",
        },
        signal: AbortSignal.timeout(10000),
      });

      const html = await response.text();
      const $ = cheerio.load(html);

      return {
        title: $("title").text().trim(),
        description:
          $('meta[name="description"]').attr("content")?.trim() || "",
        ogImage: $('meta[property="og:image"]').attr("content")?.trim() || "",
        ogTitle:
          $('meta[property="og:title"]').attr("content")?.trim() || "",
        ogDescription:
          $('meta[property="og:description"]').attr("content")?.trim() || "",
      };
    } catch {
      return null;
    }
  }
}
