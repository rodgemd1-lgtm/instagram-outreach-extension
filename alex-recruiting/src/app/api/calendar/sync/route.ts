import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { createEvent, listEvents } from "@/lib/integrations/google-calendar";

/**
 * POST /api/calendar/sync
 *
 * Syncs camp dates from the camps table to Google Calendar.
 * Requires: { accessToken: string } in the request body.
 */
export async function POST(req: NextRequest) {
  try {
    const { accessToken } = await req.json();

    if (!accessToken) {
      return NextResponse.json({ error: "accessToken is required" }, { status: 400 });
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
    }

    const supabase = createAdminClient();

    // Fetch upcoming camps
    const { data: camps, error: campError } = await supabase
      .from("camps")
      .select("*")
      .gte("date", new Date().toISOString())
      .order("date", { ascending: true })
      .limit(50);

    if (campError) {
      return NextResponse.json({ error: campError.message }, { status: 500 });
    }

    if (!camps || camps.length === 0) {
      return NextResponse.json({ synced: 0, message: "No upcoming camps to sync" });
    }

    // Get existing calendar events to avoid duplicates
    const existingEvents = await listEvents(accessToken, {
      timeMin: new Date().toISOString(),
      maxResults: 100,
    });

    const existingSummaries = new Set(
      existingEvents.map((e: any) => e.summary?.toLowerCase())
    );

    let synced = 0;
    const errors: string[] = [];

    for (const camp of camps) {
      const summary = `${camp.name}${camp.school ? ` — ${camp.school}` : ""}`;

      // Skip if already exists
      if (existingSummaries.has(summary.toLowerCase())) continue;

      try {
        const startDate = new Date(camp.date);
        const endDate = camp.date_end ? new Date(camp.date_end) : new Date(startDate.getTime() + 4 * 60 * 60 * 1000);

        await createEvent(accessToken, {
          summary,
          description: [
            camp.camp_type ? `Type: ${camp.camp_type}` : null,
            camp.registration_status ? `Registration: ${camp.registration_status}` : null,
            camp.notes || null,
          ]
            .filter(Boolean)
            .join("\n"),
          location: camp.location || undefined,
          start: { dateTime: startDate.toISOString(), timeZone: "America/Chicago" },
          end: { dateTime: endDate.toISOString(), timeZone: "America/Chicago" },
          colorId: "11", // red for camps
        });

        synced++;
      } catch (err) {
        errors.push(`Failed to sync "${camp.name}": ${String(err)}`);
      }
    }

    return NextResponse.json({
      synced,
      total: camps.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    console.error("[calendar/sync] Error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

/**
 * GET /api/calendar/sync
 *
 * Returns the Google OAuth2 authorization URL for connecting Google Calendar.
 */
export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json({
      configured: false,
      message: "Google Calendar is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_REDIRECT_URI.",
    });
  }

  const { getAuthUrl } = await import("@/lib/integrations/google-calendar");
  return NextResponse.json({
    configured: true,
    authUrl: getAuthUrl(),
  });
}
