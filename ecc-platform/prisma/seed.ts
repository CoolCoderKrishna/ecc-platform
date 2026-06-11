import { PrismaClient, SourceType, Category } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// All URLs verified working as of June 2026
const defaultDataSources: Array<{
  name: string;
  url: string;
  type: SourceType;
  category: Category;
  isActive: boolean;
  scrapeFreq: number;
}> = [
  // ── Internships & Jobs ──────────────────────────────────────
  {
    name: "Hacker News - Who's Hiring",
    url: "https://hnrss.org/whoishiring",
    type: SourceType.RSS,
    category: Category.INTERNSHIP,
    isActive: true,
    scrapeFreq: 60,
  },
  {
    name: "SWE College Jobs (GitHub)",
    url: "https://github.com/speedyapply/2026-SWE-College-Jobs/commits/main.atom",
    type: SourceType.RSS,
    category: Category.INTERNSHIP,
    isActive: true,
    scrapeFreq: 60,
  },

  // ── Certifications & Courses ─────────────────────────────────
  {
    name: "Coursera Blog",
    url: "https://blog.coursera.org/feed/",
    type: SourceType.RSS,
    category: Category.CERTIFICATION,
    isActive: true,
    scrapeFreq: 240,
  },

  // ── Research ─────────────────────────────────────────────────
  {
    name: "arXiv Computer Science",
    url: "https://rss.arxiv.org/rss/cs",
    type: SourceType.RSS,
    category: Category.RESEARCH,
    isActive: true,
    scrapeFreq: 120,
  },

  // ── Open Source & Tech ───────────────────────────────────────
  {
    name: "GitHub Trending",
    url: "https://mshibanami.github.io/GitHubTrendingRSS/daily/all.xml",
    type: SourceType.RSS,
    category: Category.OPEN_SOURCE,
    isActive: true,
    scrapeFreq: 120,
  },
  {
    name: "Hacker News - Best",
    url: "https://hnrss.org/best",
    type: SourceType.RSS,
    category: Category.COMPETITION,
    isActive: true,
    scrapeFreq: 120,
  },
  {
    name: "Hacker News - Show HN",
    url: "https://hnrss.org/show",
    type: SourceType.RSS,
    category: Category.OPEN_SOURCE,
    isActive: true,
    scrapeFreq: 60,
  },

  // ── Tech News & Workshops ────────────────────────────────────
  {
    name: "TechCrunch",
    url: "https://techcrunch.com/feed/",
    type: SourceType.RSS,
    category: Category.WORKSHOP,
    isActive: true,
    scrapeFreq: 120,
  },
];

async function main() {
  console.log("🌱 Seeding verified data sources...\n");

  let created = 0;
  let skipped = 0;

  for (const source of defaultDataSources) {
    const existing = await prisma.dataSource.findFirst({
      where: { name: source.name },
    });
    if (!existing) {
      await prisma.dataSource.create({ data: source });
      console.log(`  ✅ Created: ${source.name} (${source.category})`);
      created++;
    } else {
      // Reactivate if it was auto-disabled by health monitoring
      if (!existing.isActive) {
        await prisma.dataSource.update({
          where: { id: existing.id },
          data: { isActive: source.isActive, lastError: null },
        });
        console.log(`  🔄 Reactivated: ${source.name}`);
        created++;
      } else {
        console.log(`  ⏭️  Skipped: ${source.name}`);
        skipped++;
      }
    }
  }

  const count = await prisma.dataSource.count();
  const active = await prisma.dataSource.count({ where: { isActive: true } });
  console.log(`\n📊 Done! Total: ${count} sources (${active} active, ${created} new/reactivated, ${skipped} skipped)`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
