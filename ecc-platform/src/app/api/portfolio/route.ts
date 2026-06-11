import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { validate, portfolioCreateSchema, idParamSchema } from "@/lib/validation";
import type { PortfolioType } from "@prisma/client";

// GET /api/portfolio - Get user's portfolio items
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const items = await db.portfolioItem.findMany({
      where: { userId: (session.user as { id: string }).id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Portfolio fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/portfolio - Add a portfolio item
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = validate(portfolioCreateSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { title, description, type, url, imageUrl, skills, featured } = validation.data;

    const item = await db.portfolioItem.create({
      data: {
        userId: (session.user as { id: string }).id,
        title,
        description: description || null,
        type: type as PortfolioType,
        url: url || null,
        imageUrl: imageUrl || null,
        skills: skills || [],
        featured: featured || false,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Portfolio create error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/portfolio - Update a portfolio item
export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...updateData } = body;

    const idValidation = validate(idParamSchema, { id });
    if (!idValidation.success) {
      return NextResponse.json({ error: idValidation.error }, { status: 400 });
    }

    // Only allow specific fields to be updated
    const allowedFields = ["title", "description", "type", "url", "imageUrl", "skills", "featured"];
    const safeUpdate: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        safeUpdate[field] = updateData[field];
      }
    }

    const item = await db.portfolioItem.updateMany({
      where: { id: idValidation.data.id, userId: (session.user as { id: string }).id },
      data: safeUpdate,
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("Portfolio update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/portfolio?id=xxx - Delete a portfolio item
export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const idValidation = validate(idParamSchema, { id: searchParams.get("id") });
    if (!idValidation.success) {
      return NextResponse.json({ error: idValidation.error }, { status: 400 });
    }

    await db.portfolioItem.deleteMany({
      where: { id: idValidation.data.id, userId: (session.user as { id: string }).id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Portfolio delete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
