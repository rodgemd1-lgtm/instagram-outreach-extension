/**
 * POST /api/data/scrape-rankings
 *
 * Scrapes and aggregates recruiting rankings for Class of 2029 offensive linemen.
 * Searches 247Sports, Rivals, and On3 via Brave/Exa.
 *
 * Request body (optional):
 *   { limit?: number }  — max number of prospects to return (default: 20)
 *
 * Response:
 *   { success: true, source: "live"|"mock", prospects: Prospect[], count: number }
 *
 * Falls back to realistic mock ranking data when scraping is unavailable.
 */

import { NextRequest, NextResponse } from "next/server";
import { db, isDbConfigured } from "@/lib/db";
import * as schema from "@/lib/db/schema";

interface RankedProspect {
  name: string;
  position: string;
  school: string;
  state: string;
  classYear: number;
  rating: number;
  stars: number;
  committedTo: string | null;
  source: string;
  sourceUrl: string | null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const limit = Math.min(body.limit ?? 20, 50);

    let prospects: RankedProspect[] = [];
    let source: "live" | "mock" = "mock";

    // Attempt live scraping from ranking services
    const liveResults = await attemptLiveRankingScrape(limit);
    if (liveResults.length > 0) {
      prospects = liveResults;
      source = "live";
    } else {
      prospects = generateMockRankings(limit);
    }

    // Persist to database if available
    if (isDbConfigured() && prospects.length > 0) {
      try {
        const dbRecords = prospects.map((p) => ({
          name: p.name,
          position: p.position,
          school: p.school,
          state: p.state,
          classYear: p.classYear,
          rating: p.rating,
          stars: p.stars,
          committedTo: p.committedTo,
          source: p.source,
          sourceUrl: p.sourceUrl,
          lastSynced: new Date(),
        }));

        for (const record of dbRecords) {
          await db.insert(schema.recruitingProspects).values(record);
        }
      } catch (dbError) {
        console.error("[scrape-rankings] DB insert failed:", dbError);
      }
    }

    return NextResponse.json({
      success: true,
      source,
      prospects,
      count: prospects.length,
    });
  } catch (error) {
    console.error("[POST /api/data/scrape-rankings]", error);
    return NextResponse.json(
      {
        error: `Rankings scrape failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 }
    );
  }
}

/**
 * Attempt to find live ranking data via Brave and Exa searches.
 */
async function attemptLiveRankingScrape(limit: number): Promise<RankedProspect[]> {
  const prospects: RankedProspect[] = [];

  const searchQueries = [
    "Class of 2029 offensive line rankings 247Sports",
    "2029 OL recruiting rankings Rivals On3",
    "top 2029 offensive linemen high school football",
  ];

  // Strategy 1: Brave search for ranking pages
  for (const query of searchQueries) {
    try {
      const brave = await import("@/lib/integrations/brave");
      const results = await brave.searchSchoolRecruitingNews(query);

      for (const result of results) {
        if (
          /ranking|rating|top\s*\d+|prospect/i.test(result.title + result.description) &&
          /offensive\s*line|OL|OT|OG/i.test(result.title + result.description)
        ) {
          // Attempt to parse names/rankings from search result descriptions
          const parsed = parseRankingSnippet(result.description, result.url);
          prospects.push(...parsed);
        }
      }

      if (prospects.length >= limit) break;
    } catch {
      // Brave unavailable
    }
  }

  // Strategy 2: Exa semantic search
  if (prospects.length < limit) {
    try {
      const exa = await import("@/lib/integrations/exa");
      const results = await exa.searchCompetitorRecruits();

      for (const result of results) {
        if (/2029.*OL|offensive\s*line.*2029/i.test(result.title + result.text)) {
          const parsed = parseRankingSnippet(result.text, result.url);
          prospects.push(...parsed);
        }
      }
    } catch {
      // Exa unavailable
    }
  }

  // Deduplicate by name
  const seen = new Set<string>();
  return prospects.filter((p) => {
    const key = p.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, limit);
}

/**
 * Attempt to extract prospect names and ratings from text snippets.
 * Returns empty array if parsing fails (no fake data from ambiguous text).
 */
function parseRankingSnippet(text: string, sourceUrl: string): RankedProspect[] {
  const prospects: RankedProspect[] = [];

  // Look for patterns like "Name (School, ST) - 4-star" or "Name, OT, School"
  const namePattern = /([A-Z][a-z]+ [A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\s*[,\-|]\s*(OT|OG|OC|OL|C)\s*[,\-|]\s*([^,\-|]+)/g;
  let match: RegExpExecArray | null;

  while ((match = namePattern.exec(text)) !== null) {
    const starsMatch = text.slice(match.index, match.index + 200).match(/(\d)\s*-?\s*star/i);
    const ratingMatch = text.slice(match.index, match.index + 200).match(/(\d\.\d{2,4})/);

    prospects.push({
      name: match[1].trim(),
      position: match[2].trim(),
      school: match[3].trim().slice(0, 60),
      state: "",
      classYear: 2029,
      rating: ratingMatch ? parseFloat(ratingMatch[1]) : 0.85,
      stars: starsMatch ? parseInt(starsMatch[1]) : 3,
      committedTo: null,
      source: "live_scrape",
      sourceUrl,
    });
  }

  return prospects;
}

/**
 * Generate realistic mock ranking data for Class of 2029 offensive linemen.
 * Places Jacob Rodgers in the list at a realistic position.
 */
function generateMockRankings(limit: number): RankedProspect[] {
  const mockProspects: RankedProspect[] = [
    {
      name: "Kameron Washington",
      position: "OT",
      school: "St. Thomas Aquinas HS",
      state: "FL",
      classYear: 2029,
      rating: 0.98,
      stars: 5,
      committedTo: null,
      source: "mock",
      sourceUrl: null,
    },
    {
      name: "Devin Torres",
      position: "OT",
      school: "Mater Dei HS",
      state: "CA",
      classYear: 2029,
      rating: 0.97,
      stars: 5,
      committedTo: null,
      source: "mock",
      sourceUrl: null,
    },
    {
      name: "Marcus Thompson Jr.",
      position: "OG",
      school: "IMG Academy",
      state: "FL",
      classYear: 2029,
      rating: 0.96,
      stars: 5,
      committedTo: null,
      source: "mock",
      sourceUrl: null,
    },
    {
      name: "Elijah Brooks",
      position: "OT",
      school: "North Shore HS",
      state: "TX",
      classYear: 2029,
      rating: 0.95,
      stars: 4,
      committedTo: null,
      source: "mock",
      sourceUrl: null,
    },
    {
      name: "Jackson Miller",
      position: "C",
      school: "De La Salle HS",
      state: "CA",
      classYear: 2029,
      rating: 0.94,
      stars: 4,
      committedTo: null,
      source: "mock",
      sourceUrl: null,
    },
    {
      name: "Owen Fitzgerald",
      position: "OG",
      school: "Archbishop Moeller HS",
      state: "OH",
      classYear: 2029,
      rating: 0.93,
      stars: 4,
      committedTo: null,
      source: "mock",
      sourceUrl: null,
    },
    {
      name: "Tre Williams",
      position: "OT",
      school: "Allen HS",
      state: "TX",
      classYear: 2029,
      rating: 0.92,
      stars: 4,
      committedTo: null,
      source: "mock",
      sourceUrl: null,
    },
    {
      name: "Caleb Richardson",
      position: "OG",
      school: "Carmel HS",
      state: "IN",
      classYear: 2029,
      rating: 0.91,
      stars: 4,
      committedTo: null,
      source: "mock",
      sourceUrl: null,
    },
    {
      name: "Ryan O'Donnell",
      position: "C",
      school: "Naperville Central HS",
      state: "IL",
      classYear: 2029,
      rating: 0.90,
      stars: 4,
      committedTo: null,
      source: "mock",
      sourceUrl: null,
    },
    {
      name: "Brandon Schmidt",
      position: "OT",
      school: "Marquette University HS",
      state: "WI",
      classYear: 2029,
      rating: 0.89,
      stars: 4,
      committedTo: null,
      source: "mock",
      sourceUrl: null,
    },
    {
      name: "Tyler Bjornstad",
      position: "OT",
      school: "Sun Prairie HS",
      state: "WI",
      classYear: 2029,
      rating: 0.88,
      stars: 4,
      committedTo: null,
      source: "mock",
      sourceUrl: null,
    },
    {
      name: "Nolan Peters",
      position: "OG",
      school: "Lakeville South HS",
      state: "MN",
      classYear: 2029,
      rating: 0.87,
      stars: 3,
      committedTo: null,
      source: "mock",
      sourceUrl: null,
    },
    {
      name: "Ethan Mueller",
      position: "OT",
      school: "Kimberly HS",
      state: "WI",
      classYear: 2029,
      rating: 0.87,
      stars: 3,
      committedTo: null,
      source: "mock",
      sourceUrl: null,
    },
    {
      name: "Jacob Rodgers",
      position: "OG",
      school: "Pewaukee HS",
      state: "WI",
      classYear: 2029,
      rating: 0.86,
      stars: 3,
      committedTo: null,
      source: "mock",
      sourceUrl: null,
    },
    {
      name: "Jake Henderson",
      position: "OG",
      school: "Waunakee HS",
      state: "WI",
      classYear: 2029,
      rating: 0.85,
      stars: 3,
      committedTo: null,
      source: "mock",
      sourceUrl: null,
    },
    {
      name: "Aiden Kowalski",
      position: "OG",
      school: "Muskego HS",
      state: "WI",
      classYear: 2029,
      rating: 0.85,
      stars: 3,
      committedTo: null,
      source: "mock",
      sourceUrl: null,
    },
    {
      name: "Daniel Park",
      position: "OT",
      school: "Wauwatosa West HS",
      state: "WI",
      classYear: 2029,
      rating: 0.84,
      stars: 3,
      committedTo: null,
      source: "mock",
      sourceUrl: null,
    },
    {
      name: "Marcus Williams",
      position: "OG",
      school: "Brookfield Central HS",
      state: "WI",
      classYear: 2029,
      rating: 0.84,
      stars: 3,
      committedTo: null,
      source: "mock",
      sourceUrl: null,
    },
    {
      name: "Connor Sullivan",
      position: "C",
      school: "Edina HS",
      state: "MN",
      classYear: 2029,
      rating: 0.83,
      stars: 3,
      committedTo: null,
      source: "mock",
      sourceUrl: null,
    },
    {
      name: "Austin Brennan",
      position: "OT",
      school: "Mount Carmel HS",
      state: "IL",
      classYear: 2029,
      rating: 0.82,
      stars: 3,
      committedTo: null,
      source: "mock",
      sourceUrl: null,
    },
  ];

  return mockProspects.slice(0, limit);
}
