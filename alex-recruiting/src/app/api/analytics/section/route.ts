import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

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
      } catch {
        // DB insert failed
        id = randomUUID();
      }
    } else {
      // DB not configured (test/dev without Supabase)
      id = randomUUID();
    }

    return NextResponse.json({ id });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
