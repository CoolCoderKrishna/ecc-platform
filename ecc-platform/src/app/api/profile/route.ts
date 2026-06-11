import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { validate, profileUpdateSchema } from "@/lib/validation";

// GET /api/profile - Get user profile
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: (session.user as { id: string }).id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        academicYear: true,
        skills: true,
        interests: true,
        careerGoals: true,
        preferredTechs: true,
        location: true,
        bio: true,
        emailNotifications: true,
        pushNotifications: true,
        telegramBotEnabled: true,
        telegramChatId: true,
        smsEnabled: true,
        phoneNumber: true,
        whatsappEnabled: true,
        whatsappNumber: true,
        notificationFreq: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/profile - Update user profile
export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = validate(profileUpdateSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const allowedFields = [
      "name", "academicYear", "skills", "interests", "careerGoals",
      "preferredTechs", "location", "bio", "emailNotifications",
      "pushNotifications", "telegramBotEnabled", "telegramChatId",
      "smsEnabled", "phoneNumber", "whatsappEnabled", "whatsappNumber",
      "notificationFreq",
    ];

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (validation.data[field as keyof typeof validation.data] !== undefined) {
        updateData[field] = validation.data[field as keyof typeof validation.data];
      }
    }

    const user = await db.user.update({
      where: { id: (session.user as { id: string }).id },
      data: updateData,
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
