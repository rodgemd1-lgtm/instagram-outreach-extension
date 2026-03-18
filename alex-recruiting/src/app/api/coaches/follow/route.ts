import { NextRequest, NextResponse } from "next/server";
import { db, isDbConfigured } from "@/lib/db";
import { coaches } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifyHandle, followUser } from "@/lib/integrations/x-api";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// POST /api/coaches/follow
// Follow a coach on X/Twitter by their schoolId or coach UUID.
// Looks up the coach's xHandle, resolves the X user ID, and follows them.
// Body: { schoolId: string }
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 }
    );
  }

  let schoolId: string;
  try {
    const body = await req.json();
    schoolId = body.schoolId;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body. Expected { schoolId: string }" },
      { status: 400 }
    );
  }

  if (!schoolId) {
    return NextResponse.json(
      { error: "schoolId is required" },
      { status: 400 }
    );
  }

  try {
    // Find coaches for this school
    const results = await db
      .select()
      .from(coaches)
      .where(eq(coaches.schoolId, schoolId));

    if (results.length === 0) {
      return NextResponse.json(
        { error: "No coaches found for this school", schoolId },
        { status: 404 }
      );
    }

    // Find a coach with an xHandle
    const coachWithHandle = results.find((c) => c.xHandle);
    if (!coachWithHandle || !coachWithHandle.xHandle) {
      return NextResponse.json(
        {
          error: "No X/Twitter handle found for coaches at this school",
          schoolId,
        },
        { status: 404 }
      );
    }

    // Resolve the X user ID from the handle
    const xUser = await verifyHandle(coachWithHandle.xHandle);
    if (!xUser) {
      return NextResponse.json(
        {
          error: `Could not resolve X user for handle @${coachWithHandle.xHandle}`,
          handle: coachWithHandle.xHandle,
        },
        { status: 404 }
      );
    }

    // Follow the user on X
    const success = await followUser(xUser.id);

    if (success) {
      // Update follow status in DB
      await db
        .update(coaches)
        .set({
          followStatus: "followed",
          updatedAt: new Date(),
        })
        .where(eq(coaches.id, coachWithHandle.id));
    }

    return NextResponse.json({
      success,
      coachName: coachWithHandle.name,
      handle: coachWithHandle.xHandle,
      followStatus: success ? "followed" : "failed",
    });
  } catch (err) {
    console.error("[POST /api/coaches/follow]", err);
    return NextResponse.json(
      { error: "Failed to follow coach", details: String(err) },
      { status: 500 }
    );
  }
}
