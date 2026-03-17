import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { visitId, sectionId, dwellTime, interacted } = body;

    if (!visitId || !sectionId) {
      return NextResponse.json(
        { error: "visitId and sectionId required" },
        { status: 400 }
      );
    }

    // Attempt DB insert, fallback to generated ID for dev/test
    let id: string;

    const dbUrl = process.env.JIB_DATABASE_URL;
    if (dbUrl && dbUrl !== "your_postgresql_connection_string_here") {
      try {
        const { db } = await import("@/lib/db");
        const { sectionEngagement } = await import("@/lib/db/schema");
        const [row] = await db
          .insert(sectionEngagement)
          .values({
            visitId,
            sectionId,
            dwellTime,
            interacted,
          })
          .returning();
        id = row.id;
      } catch (dbErr) {
        console.error("[analytics/section] DB insert failed, using generated ID:", dbErr);
        id = randomUUID();
      }
    } else {
      // DB not configured (test/dev without Supabase)
      id = randomUUID();
    }

    return NextResponse.json({ id });
  } catch (error) {
    const details = error instanceof Error ? error.message : String(error);
    console.error("[analytics/section] Unhandled error:", error);
    return NextResponse.json({ error: "Failed to record section engagement", details }, { status: 500 });
  }
}
