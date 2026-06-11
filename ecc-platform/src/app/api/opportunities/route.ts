import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { generateContentHash } from "@/lib/utils";
import { validate } from "@/lib/validation";
import { z } from "zod";

const opportunityCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  source: z.string().min(1).max(200),
  sourceUrl: z.string().url().optional(),
  category: z.enum(["INTERNSHIP", "CERTIFICATION", "HACKATHON", "COMPETITION", "RESEARCH", "OPEN_SOURCE", "SCHOLARSHIP", "COURSE", "WORKSHOP", "OTHER"]),
  domain: z.string().max(200).optional(),
  skillsRequired: z.array(z.string().max(50)).max(50).optional(),
  location: z.string().max(200).optional(),
  isRemote: z.boolean().optional(),
  eligibility: z.string().max(500).optional(),
  stipend: z.string().max(200).optional(),
  deadline: z.string().optional(),
  difficulty: z.enum(["BEGINNER", "EASY", "MEDIUM", "HARD", "EXPERT"]).optional(),
  company: z.string().max(200).optional(),
  imageUrl: z.string().url().optional(),
});

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const difficulty = searchParams.get("difficulty");
    const location = searchParams.get("location");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where: any = { isActive: true };

    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;
    if (location) where.location = { contains: location, mode: "insensitive" };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { skillsRequired: { hasSome: [search] } },
      ];
    }

    const [opportunities, total] = await Promise.all([
      db.opportunity.findMany({
        where,
        orderBy: [{ deadline: "asc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      db.opportunity.count({ where }),
    ]);

    return NextResponse.json({
      opportunities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Opportunities fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = validate(opportunityCreateSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const {
      title,
      description,
      source,
      sourceUrl,
      category,
      domain,
      skillsRequired,
      location,
      isRemote,
      eligibility,
      stipend,
      deadline,
      difficulty,
      company,
      imageUrl,
    } = validation.data;

    const contentHash = generateContentHash(`${title}-${company}-${source}`);

    // Check for duplicates
    const existing = await db.opportunity.findUnique({
      where: { contentHash },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Opportunity already exists" },
        { status: 409 }
      );
    }

    const opportunity = await db.opportunity.create({
      data: {
        title,
        description,
        source,
        sourceUrl,
        category,
        domain,
        skillsRequired: skillsRequired || [],
        location,
        isRemote: isRemote || false,
        eligibility,
        stipend,
        deadline: deadline ? new Date(deadline) : null,
        difficulty: difficulty || "MEDIUM",
        company,
        imageUrl,
        contentHash,
        publishedAt: new Date(),
      },
    });

    return NextResponse.json(opportunity, { status: 201 });
  } catch (error) {
    console.error("Opportunity create error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
