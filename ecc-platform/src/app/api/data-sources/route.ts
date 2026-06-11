import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { validate, dataSourceCreateSchema, dataSourceUpdateSchema } from "@/lib/validation";
import type { Category, SourceType } from "@prisma/client";

// GET /api/data-sources - Get all data sources (admin only)
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sources = await db.dataSource.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        scrapeLogs: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    return NextResponse.json({ sources });
  } catch (error) {
    console.error("Data sources fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/data-sources - Add a data source (admin only)
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = validate(dataSourceCreateSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { name, url, type, category, scrapeFreq, config } = validation.data;

    const source = await db.dataSource.create({
      data: {
        name,
        url,
        type: type as SourceType,
        category: category as Category,
        scrapeFreq: scrapeFreq || 60,
        config: config ?? undefined,
      },
    });

    return NextResponse.json(source, { status: 201 });
  } catch (error) {
    console.error("Data source create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/data-sources - Update a data source (admin only)
export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = validate(dataSourceUpdateSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { id, isActive, scrapeFreq, config } = validation.data;

    const updateData: Record<string, unknown> = {};
    if (isActive !== undefined) updateData.isActive = isActive;
    if (scrapeFreq !== undefined) updateData.scrapeFreq = scrapeFreq;
    if (config !== undefined) updateData.config = config;

    const source = await db.dataSource.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(source);
  } catch (error) {
    console.error("Data source update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
