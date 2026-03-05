import { NextRequest, NextResponse } from "next/server";
import { searchCompetitorRecruits } from "@/lib/integrations/exa";

export async function POST(req: NextRequest) {
  try {
    await req.json(); // consume body

    const results = await searchCompetitorRecruits();

    return NextResponse.json({
      results: results.map((r) => ({
        url: r.url,
        title: r.title,
        snippet: r.text?.slice(0, 300),
        date: r.publishedDate,
      })),
      total: results.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Competitor search failed: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}
