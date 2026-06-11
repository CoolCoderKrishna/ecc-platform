import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { validate, achievementCreateSchema, idParamSchema } from "@/lib/validation";

// GET /api/achievements - Get user's achievements
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const achievements = await db.achievement.findMany({
      where: { userId: (session.user as { id: string }).id },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ achievements });
  } catch (error) {
    console.error("Achievements fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/achievements - Add an achievement
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = validate(achievementCreateSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { title, description, date, category, url } = validation.data;

    const achievement = await db.achievement.create({
      data: {
        userId: (session.user as { id: string }).id,
        title,
        description: description || null,
        date: new Date(date),
        category,
        url: url || null,
      },
    });

    return NextResponse.json(achievement, { status: 201 });
  } catch (error) {
    console.error("Achievement create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/achievements?id=xxx - Delete an achievement
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

    await db.achievement.deleteMany({
      where: { id: idValidation.data.id, userId: (session.user as { id: string }).id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Achievement delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
