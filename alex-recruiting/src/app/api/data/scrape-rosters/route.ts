/**
 * POST /api/data/scrape-rosters
 *
 * Scrapes OL roster data from target school websites to identify graduation gaps
 * and scholarship availability.
 *
 * Request body (optional):
 *   { schools?: string[] }  — school IDs to limit scope (defaults to all 17 targets)
 *
 * Response:
 *   { success: true, source: "live"|"mock", schools: EnrichedSchool[], count: number }
 *
 * Falls back to realistic mock roster data by division when scraping is unavailable.
 */

import { NextRequest, NextResponse } from "next/server";
import { db, isDbConfigured } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { targetSchools, type TargetSchool } from "@/lib/data/target-schools";

export const dynamic = "force-dynamic";

interface EnrichedSchoolData {
  schoolId: string;
  name: string;
  slug: string;
  division: string;
  conference: string;
  olRosterCount: number;
  olGraduating: number;
  scholarshipsAvailable: number;
  talentScore: number;
  recruitingRank: number | null;
  coachTenure: number | null;
  source: "firecrawl" | "mock";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const schoolFilter: string[] | undefined = body.schools;

    const schoolsToProcess = schoolFilter
      ? targetSchools.filter((s) => schoolFilter.includes(s.id))
      : targetSchools;

    if (schoolsToProcess.length === 0) {
      return NextResponse.json(
        { error: "No matching schools found for the provided IDs" },
        { status: 400 }
      );
    }

    const enrichedSchools: EnrichedSchoolData[] = [];
    let liveCount = 0;

    for (const school of schoolsToProcess) {
      const result = await scrapeSchoolRoster(school);
      enrichedSchools.push(result);
      if (result.source === "firecrawl") liveCount++;
    }

    const source: "live" | "mock" = liveCount > 0 ? "live" : "mock";

    // Persist to database if available
    if (isDbConfigured() && enrichedSchools.length > 0) {
      try {
        const dbRecords = enrichedSchools.map((s) => ({
          name: s.name,
          slug: s.slug,
          conference: s.conference,
          division: s.division,
          olRosterCount: s.olRosterCount,
          olGraduating: s.olGraduating,
          recruitingRank: s.recruitingRank,
          talentScore: s.talentScore,
          coachTenure: s.coachTenure,
          scholarshipsAvailable: s.scholarshipsAvailable,
          lastSynced: new Date(),
          rawData: {
            source: s.source,
            scrapedAt: new Date().toISOString(),
            schoolId: s.schoolId,
          },
        }));

        for (const record of dbRecords) {
          await db.insert(schema.enrichedSchools).values(record);
        }
      } catch (dbError) {
        console.error("[scrape-rosters] DB insert failed:", dbError);
      }
    }

    return NextResponse.json({
      success: true,
      source,
      schools: enrichedSchools,
      count: enrichedSchools.length,
    });
  } catch (error) {
    console.error("[POST /api/data/scrape-rosters]", error);
    return NextResponse.json(
      {
        error: `Roster scrape failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 }
    );
  }
}

/**
 * Attempt to scrape a single school's roster via Firecrawl, falling back to mock data.
 */
async function scrapeSchoolRoster(school: TargetSchool): Promise<EnrichedSchoolData> {
  // Attempt Firecrawl live scraping
  try {
    const { scrapeRoster } = await import("@/lib/integrations/firecrawl");
    const result = await scrapeRoster(school.rosterUrl);

    if (result.players && result.players.length > 0) {
      const olPlayers = result.players.filter((p) =>
        ["OL", "OT", "OG", "C"].includes(p.position)
      );

      const seniors = olPlayers.filter((p) =>
        /^(Sr|RS Sr|RS-Sr|5th)/.test(p.classYear)
      );

      return {
        schoolId: school.id,
        name: school.name,
        slug: school.id,
        division: school.division,
        conference: school.conference,
        olRosterCount: olPlayers.length,
        olGraduating: seniors.length,
        scholarshipsAvailable: getScholarshipsByDivision(school.division),
        talentScore: computeTalentScore(olPlayers.length, seniors.length, school.division),
        recruitingRank: null,
        coachTenure: null,
        source: "firecrawl",
      };
    }
  } catch {
    // Firecrawl unavailable — fall back to mock
  }

  // Mock data fallback — generate realistic numbers by division
  return generateMockRosterData(school);
}

/**
 * Generate realistic mock OL roster data based on division level.
 */
function generateMockRosterData(school: TargetSchool): EnrichedSchoolData {
  const hashValue = school.id
    .split("")
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);

  let olRosterCount: number;
  let olGraduating: number;
  let scholarships: number;

  switch (school.division) {
    case "D1 FBS":
      // D1 FBS programs carry 15-22 OL on roster, 3-6 graduating, 85 scholarships
      olRosterCount = 15 + (hashValue % 8);
      olGraduating = 3 + (hashValue % 4);
      scholarships = 85;
      break;
    case "D1 FCS":
      // D1 FCS: 12-18 OL, 2-5 graduating, 63 scholarships
      olRosterCount = 12 + (hashValue % 7);
      olGraduating = 2 + (hashValue % 4);
      scholarships = 63;
      break;
    case "D2":
      // D2: 10-15 OL, 2-4 graduating, 36 scholarships
      olRosterCount = 10 + (hashValue % 6);
      olGraduating = 2 + (hashValue % 3);
      scholarships = 36;
      break;
    default:
      olRosterCount = 10 + (hashValue % 5);
      olGraduating = 2 + (hashValue % 3);
      scholarships = 36;
  }

  const talentScore = computeTalentScore(olRosterCount, olGraduating, school.division);

  // Recruiting rank varies by tier — top-tier programs rank higher
  let recruitingRank: number | null = null;
  if (school.priorityTier === "Tier 1") {
    recruitingRank = 10 + (hashValue % 30); // 10-39
  } else if (school.priorityTier === "Tier 2") {
    recruitingRank = 40 + (hashValue % 60); // 40-99
  }
  // Tier 3 (D2) typically unranked in national recruiting

  return {
    schoolId: school.id,
    name: school.name,
    slug: school.id,
    division: school.division,
    conference: school.conference,
    olRosterCount,
    olGraduating,
    scholarshipsAvailable: scholarships,
    talentScore,
    recruitingRank,
    coachTenure: 2 + (hashValue % 8), // 2-9 years
    source: "mock",
  };
}

/**
 * Compute a talent score (0-100) based on roster composition and division.
 */
function computeTalentScore(
  olCount: number,
  graduating: number,
  division: string
): number {
  // Higher need (more graduating) = higher opportunity score for a recruit
  const needFactor = Math.min((graduating / Math.max(olCount, 1)) * 100, 50);

  // Division prestige factor
  let divisionFactor: number;
  switch (division) {
    case "D1 FBS":
      divisionFactor = 35;
      break;
    case "D1 FCS":
      divisionFactor = 25;
      break;
    case "D2":
      divisionFactor = 15;
      break;
    default:
      divisionFactor = 10;
  }

  return Math.round(Math.min(needFactor + divisionFactor + (graduating * 3), 100));
}

/**
 * Get total scholarship count by division.
 */
function getScholarshipsByDivision(division: string): number {
  switch (division) {
    case "D1 FBS":
      return 85;
    case "D1 FCS":
      return 63;
    case "D2":
      return 36;
    default:
      return 36;
  }
}
