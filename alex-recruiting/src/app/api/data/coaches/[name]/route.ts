/**
 * GET /api/data/coaches/[name]
 *
 * Returns an enriched coach profile by name.
 *
 * Query params:
 *   school — current school name (helps disambiguate common last names)
 *
 * Examples:
 *   /api/data/coaches/Kirk%20Ferentz?school=Iowa
 *   /api/data/coaches/Luke%20Fickell?school=Wisconsin
 *   /api/data/coaches/Fickell                    (last-name search)
 */

import { NextRequest, NextResponse } from "next/server";
import { enrichCoachProfile } from "@/lib/data-pipeline/coach-enricher";

interface RouteParams {
  params: { name: string };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { name } = params;
  const { searchParams } = new URL(req.url);
  const school = searchParams.get("school") ?? undefined;

  if (!name) {
    return NextResponse.json({ error: "Missing coach name" }, { status: 400 });
  }

  try {
    const profile = await enrichCoachProfile(decodeURIComponent(name), school);

    if (!profile) {
      return NextResponse.json(
        { error: `No coach found matching "${name}"` },
        { status: 404 }
      );
    }

    return NextResponse.json({ coach: profile });
  } catch (err) {
    console.error(`[GET /api/data/coaches/${name}]`, err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch coach profile" },
      { status: 500 }
    );
  }
}
