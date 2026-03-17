/**
 * /api/camps — Camp data API
 * GET — Returns all camps (from DB or static data)
 * Falls back to SUMMER_2026_CAMPS when the database is empty or unavailable.
 */

import { NextResponse } from "next/server";
import { getCamps, SUMMER_2026_CAMPS } from "@/lib/rec/knowledge/camp-database";

export async function GET() {
  try {
    const camps = await getCamps();

    // If DB returned data, use it
    if (camps.length > 0) {
      return NextResponse.json({ camps });
    }

    // Otherwise, return static SUMMER_2026_CAMPS with generated IDs
    const fallback = SUMMER_2026_CAMPS.map((c, i) => ({
      ...c,
      id: `camp-summer-${i}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    return NextResponse.json({ camps: fallback });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[camps] Error:", err);

    // Even on error, return the static data so the page still works
    const fallback = SUMMER_2026_CAMPS.map((c, i) => ({
      ...c,
      id: `camp-summer-${i}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    return NextResponse.json({ error: message, camps: fallback }, { status: 200 });
  }
}
