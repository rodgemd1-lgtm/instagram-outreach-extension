/**
 * GET /api/data/schools/[slug]
 *
 * Returns a single enriched school profile identified by slug or school name.
 *
 * Examples:
 *   /api/data/schools/wisconsin
 *   /api/data/schools/iowa-state
 *   /api/data/schools/northern-illinois
 */

import { NextRequest, NextResponse } from "next/server";
import { getEnrichedSchoolProfile } from "@/lib/data-pipeline/school-data";

interface RouteParams {
  params: { slug: string };
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { slug } = params;

  if (!slug) {
    return NextResponse.json({ error: "Missing school slug" }, { status: 400 });
  }

  try {
    const profile = await getEnrichedSchoolProfile(decodeURIComponent(slug));

    if (!profile) {
      return NextResponse.json(
        { error: `No school found matching "${slug}"` },
        { status: 404 }
      );
    }

    return NextResponse.json({ school: profile });
  } catch (err) {
    console.error(`[GET /api/data/schools/${slug}]`, err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch school profile" },
      { status: 500 }
    );
  }
}
