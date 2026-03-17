import { NextRequest, NextResponse } from "next/server";
import { db, isDbConfigured } from "@/lib/db";
import { coaches } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 }
    );
  }

  try {
    // Try to find by schoolId first, then by coach UUID
    let results = await db.select().from(coaches).where(eq(coaches.schoolId, id));

    if (results.length === 0) {
      // Try as UUID coach id
      try {
        results = await db.select().from(coaches).where(eq(coaches.id, id));
      } catch {
        // Invalid UUID format — not found
      }
    }

    if (results.length === 0) {
      return NextResponse.json(
        { error: "No coaches found", id },
        { status: 404 }
      );
    }

    return NextResponse.json({
      coaches: results,
      count: results.length,
    });
  } catch (err) {
    console.error(`[GET /api/coaches/${id}]`, err);
    return NextResponse.json(
      { error: "Failed to fetch coach data", details: String(err) },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const { name, title, xHandle, dmOpen, followStatus, dmStatus, notes } = body;

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (name !== undefined) updateData.name = name;
    if (title !== undefined) updateData.title = title;
    if (xHandle !== undefined) updateData.xHandle = xHandle;
    if (dmOpen !== undefined) updateData.dmOpen = dmOpen;
    if (followStatus !== undefined) updateData.followStatus = followStatus;
    if (dmStatus !== undefined) updateData.dmStatus = dmStatus;
    if (notes !== undefined) updateData.notes = notes;

    const result = await db.update(coaches).set(updateData).where(eq(coaches.id, id)).returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Coach not found", id },
        { status: 404 }
      );
    }

    return NextResponse.json({ coach: result[0] });
  } catch (err) {
    console.error(`[PUT /api/coaches/${id}]`, err);
    return NextResponse.json(
      { error: "Failed to update coach", details: String(err) },
      { status: 500 }
    );
  }
}
