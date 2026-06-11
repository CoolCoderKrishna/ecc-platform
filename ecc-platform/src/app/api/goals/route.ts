import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { validate, goalCreateSchema, goalUpdateSchema, idParamSchema } from "@/lib/validation";

// GET /api/goals - Get user's goals with milestones
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const goals = await db.goal.findMany({
      where: { userId: (session.user as { id: string }).id },
      include: { milestones: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ goals });
  } catch (error) {
    console.error("Goals fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/goals - Create a new goal
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = validate(goalCreateSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { title, description, category, deadline, milestones } = validation.data;

    const goal = await db.goal.create({
      data: {
        userId: (session.user as { id: string }).id,
        title,
        description: description || null,
        category: category || null,
        deadline: deadline ? new Date(deadline) : null,
        milestones: {
          create: (milestones || []).map((m: string) => ({ title: m })),
        },
      },
      include: { milestones: true },
    });

    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    console.error("Goal create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/goals - Update a goal or its milestones
export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = validate(goalUpdateSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { id, completed, progress, milestoneId, milestoneCompleted } = validation.data;

    if (milestoneId && milestoneCompleted !== undefined) {
      const milestone = await db.milestone.findUnique({
        where: { id: milestoneId },
        include: { goal: { select: { userId: true } } },
      });

      if (!milestone || milestone.goal.userId !== (session.user as any).id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      await db.milestone.update({
        where: { id: milestoneId },
        data: { completed: milestoneCompleted },
      });

      const goalMilestones = await db.milestone.findMany({
        where: { goalId: milestone.goalId },
      });
      const completedCount = goalMilestones.filter(
        (m) => m.completed || (m.id === milestoneId && milestoneCompleted)
      ).length;
      const newProgress =
        goalMilestones.length > 0
          ? Math.round((completedCount / goalMilestones.length) * 100)
          : 0;
      const allDone =
        goalMilestones.length > 0 &&
        goalMilestones.every(
          (m) => m.completed || (m.id === milestoneId && milestoneCompleted)
        );

      await db.goal.update({
        where: { id: milestone.goalId },
        data: { progress: newProgress, completed: allDone },
      });

      return NextResponse.json({ success: true, progress: newProgress, completed: allDone });
    }

    if (id) {
      const existingGoal = await db.goal.findUnique({
        where: { id },
        select: { userId: true },
      });
      if (!existingGoal || existingGoal.userId !== (session.user as any).id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const updateData: Record<string, unknown> = {};
      if (completed !== undefined) updateData.completed = completed;
      if (progress !== undefined) updateData.progress = progress;

      const goal = await db.goal.update({
        where: { id },
        data: updateData,
        include: { milestones: true },
      });

      return NextResponse.json(goal);
    }

    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  } catch (error) {
    console.error("Goal update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/goals?id=xxx - Delete a goal
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

    await db.goal.deleteMany({
      where: { id: idValidation.data.id, userId: (session.user as { id: string }).id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Goal delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
