import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { validate, certificationCreateSchema, idParamSchema } from "@/lib/validation";

// GET /api/certifications - Get user's certifications
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const certifications = await db.certification.findMany({
      where: { userId: (session.user as { id: string }).id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ certifications });
  } catch (error) {
    console.error("Certifications fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/certifications - Add a certification
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = validate(certificationCreateSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { name, provider, url, completedAt, expiresAt, skills } = validation.data;

    const certification = await db.certification.create({
      data: {
        userId: (session.user as { id: string }).id,
        name,
        provider,
        url: url || null,
        completedAt: completedAt ? new Date(completedAt) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        skills: skills || [],
      },
    });

    return NextResponse.json(certification, { status: 201 });
  } catch (error) {
    console.error("Certification create error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/certifications?id=xxx - Delete a certification
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

    await db.certification.deleteMany({
      where: { id: idValidation.data.id, userId: (session.user as { id: string }).id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Certification delete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
