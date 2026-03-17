import { NextRequest, NextResponse } from "next/server";
import { searchCoachHandles } from "@/lib/integrations/exa";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    const results = await searchCoachHandles(query);

    return NextResponse.json({
      results: results.map((r) => ({
        url: r.url,
        title: r.title,
        snippet: r.text?.slice(0, 300),
        date: r.publishedDate,
      })),
      total: results.length,
      source: "exa",
    });
  } catch (error) {
    const details = error instanceof Error ? error.message : "Unknown error";
    console.error("[coaches/scrape] Coach discovery failed:", error);
    return NextResponse.json(
      { error: "Coach discovery failed", details },
      { status: 500 }
    );
  }
}
