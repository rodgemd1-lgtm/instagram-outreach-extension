import { NextRequest, NextResponse } from "next/server";
import { scrapeRoster } from "@/lib/integrations/firecrawl";

export async function POST(req: NextRequest) {
  try {
    const { rosterUrl, schoolName } = await req.json();

    if (!rosterUrl) {
      return NextResponse.json({ error: "rosterUrl is required" }, { status: 400 });
    }

    const result = await scrapeRoster(rosterUrl);

    // Filter OL players and analyze graduation gaps
    const olPlayers = result.players.filter((p) =>
      ["OL", "OT", "OG", "C"].includes(p.position)
    );

    const classCounts: Record<string, number> = {};
    for (const player of olPlayers) {
      classCounts[player.classYear] = (classCounts[player.classYear] || 0) + 1;
    }

    return NextResponse.json({
      school: schoolName,
      totalOLPlayers: olPlayers.length,
      classCounts,
      players: olPlayers,
      rawContentLength: result.content.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Roster scrape failed: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}
