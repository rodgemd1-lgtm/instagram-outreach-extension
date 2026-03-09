import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { visitorId, page, referrer, utmSource, utmMedium, utmCampaign, userAgent } = body;

    if (!visitorId || !page) {
      return NextResponse.json(
        { error: "visitorId and page required" },
        { status: 400 }
      );
    }

    // Attempt DB insert, fallback to generated ID for dev/test
    let visitId: string;

    const dbUrl = process.env.JIB_DATABASE_URL;
    if (dbUrl && dbUrl !== "your_postgresql_connection_string_here") {
      try {
        const { db } = await import("@/lib/db");
        const { pageVisits } = await import("@/lib/db/schema");
        const [visit] = await db
          .insert(pageVisits)
          .values({
            visitorId,
            page,
            referrer,
            utmSource,
            utmMedium,
            utmCampaign,
            userAgent,
          })
          .returning();
        visitId = visit.id;
      } catch {
        // DB insert failed
        visitId = randomUUID();
      }
    } else {
      // DB not configured (test/dev without Supabase)
      visitId = randomUUID();
    }

    return NextResponse.json({ visitId });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
