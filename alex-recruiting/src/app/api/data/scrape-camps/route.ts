/**
 * POST /api/data/scrape-camps
 *
 * Scrapes camp and prospect day listings for summer 2026 across target schools.
 *
 * Request body (optional):
 *   { schools?: string[] }  — school IDs to limit scope (defaults to all 17 targets)
 *
 * Response:
 *   { success: true, source: "live"|"mock", camps: Camp[], count: number }
 *
 * All external calls (Firecrawl, Brave, Exa) are wrapped in try/catch.
 * Falls back to realistic mock data when integrations are unavailable.
 */

import { NextRequest, NextResponse } from "next/server";
import { db, isDbConfigured } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { targetSchools, type TargetSchool } from "@/lib/data/target-schools";

export const dynamic = "force-dynamic";

interface CampListing {
  name: string;
  school: string;
  location: string;
  campType: "school_camp" | "prospect_day" | "combine" | "showcase" | "satellite";
  date: string;
  dateEnd: string | null;
  cost: number;
  registrationStatus: "not_registered" | "registered" | "waitlisted" | "confirmed";
  sourceUrl: string | null;
  source: "firecrawl" | "brave" | "exa" | "mock";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const schoolFilter: string[] | undefined = body.schools;

    // Determine which schools to process
    const schoolsToProcess = schoolFilter
      ? targetSchools.filter((s) => schoolFilter.includes(s.id))
      : targetSchools;

    if (schoolsToProcess.length === 0) {
      return NextResponse.json(
        { error: "No matching schools found for the provided IDs" },
        { status: 400 }
      );
    }

    let camps: CampListing[] = [];
    let source: "live" | "mock" = "mock";

    // Attempt live scraping for each school
    const liveResults = await attemptLiveScrape(schoolsToProcess);
    if (liveResults.length > 0) {
      camps = liveResults;
      source = "live";
    } else {
      // Fall back to realistic mock data
      camps = generateMockCamps(schoolsToProcess);
    }

    // Persist to database if available
    if (isDbConfigured() && camps.length > 0) {
      try {
        const dbRecords = camps.map((camp) => ({
          name: camp.name,
          school: camp.school,
          location: camp.location,
          campType: camp.campType,
          date: new Date(camp.date),
          dateEnd: camp.dateEnd ? new Date(camp.dateEnd) : null,
          cost: camp.cost,
          registrationStatus: camp.registrationStatus,
          notes: camp.sourceUrl ? `Source: ${camp.sourceUrl}` : `Source: ${camp.source}`,
        }));

        await db.insert(schema.camps).values(dbRecords);
      } catch (dbError) {
        console.error("[scrape-camps] DB insert failed:", dbError);
        // Non-fatal: still return the data
      }
    }

    return NextResponse.json({
      success: true,
      source,
      camps,
      count: camps.length,
    });
  } catch (error) {
    console.error("[POST /api/data/scrape-camps]", error);
    return NextResponse.json(
      {
        error: `Camp scrape failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 }
    );
  }
}

/**
 * Attempts to scrape live camp data using Firecrawl, Brave, and Exa.
 * Returns an empty array if all external calls fail.
 */
async function attemptLiveScrape(schools: TargetSchool[]): Promise<CampListing[]> {
  const allCamps: CampListing[] = [];

  for (const school of schools) {
    // Strategy 1: Firecrawl on common camp URL patterns
    const campUrl = school.rosterUrl.replace("/roster", "/camps");

    try {
      const { scrapeRoster } = await import("@/lib/integrations/firecrawl");
      const result = await scrapeRoster(campUrl);
      if (result.content && result.content.length > 200) {
        const parsed = parseCampContent(result.content, school.name, campUrl);
        if (parsed.length > 0) {
          allCamps.push(...parsed);
          continue; // Got data for this school, move to next
        }
      }
    } catch {
      // Firecrawl unavailable or page not found — try next strategy
    }

    // Strategy 2: Brave search
    try {
      const { searchSchoolRecruitingNews } = await import("@/lib/integrations/brave");
      const results = await searchSchoolRecruitingNews(`${school.name} football camp 2026`);
      if (results.length > 0) {
        for (const result of results.slice(0, 3)) {
          if (/camp|prospect\s*day|combine|clinic/i.test(result.title + result.description)) {
            allCamps.push({
              name: result.title.slice(0, 120),
              school: school.name,
              location: `${school.name} Campus`,
              campType: determineCampType(result.title + result.description),
              date: estimateCampDate(school.id, allCamps.length),
              dateEnd: null,
              cost: estimateCampCost(school.division),
              registrationStatus: "not_registered",
              sourceUrl: result.url,
              source: "brave",
            });
          }
        }
        if (allCamps.some((c) => c.school === school.name)) continue;
      }
    } catch {
      // Brave unavailable — try next strategy
    }

    // Strategy 3: Exa semantic search
    try {
      const { searchSchoolOLNeeds } = await import("@/lib/integrations/exa");
      const results = await searchSchoolOLNeeds(`${school.name} football camp prospect day 2026`);
      if (results.length > 0) {
        for (const result of results.slice(0, 2)) {
          if (/camp|prospect|clinic|combine/i.test(result.title + result.text)) {
            allCamps.push({
              name: result.title.slice(0, 120),
              school: school.name,
              location: `${school.name} Campus`,
              campType: determineCampType(result.title + result.text),
              date: estimateCampDate(school.id, allCamps.length),
              dateEnd: null,
              cost: estimateCampCost(school.division),
              registrationStatus: "not_registered",
              sourceUrl: result.url,
              source: "exa",
            });
          }
        }
      }
    } catch {
      // Exa unavailable — this school will get mock data if no results yet
    }
  }

  return allCamps;
}

/**
 * Parse scraped camp page content into structured camp listings.
 */
function parseCampContent(
  content: string,
  schoolName: string,
  sourceUrl: string
): CampListing[] {
  const camps: CampListing[] = [];
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (/camp|prospect\s*day|combine|clinic/i.test(line) && line.length > 10 && line.length < 200) {
      camps.push({
        name: line.replace(/^[#*\-\s]+/, "").slice(0, 120),
        school: schoolName,
        location: `${schoolName} Campus`,
        campType: determineCampType(line),
        date: estimateCampDate(schoolName, camps.length),
        dateEnd: null,
        cost: 100,
        registrationStatus: "not_registered",
        sourceUrl,
        source: "firecrawl",
      });

      if (camps.length >= 3) break;
    }
  }

  return camps;
}

/**
 * Determine camp type from text description.
 */
function determineCampType(
  text: string
): "school_camp" | "prospect_day" | "combine" | "showcase" | "satellite" {
  const lower = text.toLowerCase();
  if (lower.includes("prospect day") || lower.includes("junior day")) return "prospect_day";
  if (lower.includes("combine")) return "combine";
  if (lower.includes("showcase")) return "showcase";
  if (lower.includes("satellite")) return "satellite";
  return "school_camp";
}

/**
 * Generate a realistic camp date in summer 2026 (June-July).
 */
function estimateCampDate(schoolId: string, index: number): string {
  // Distribute camps across June-July 2026 using school ID as a seed
  const hashValue = schoolId.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const baseDay = 1 + ((hashValue + index * 7) % 28);
  const month = index % 2 === 0 ? 6 : 7; // Alternate between June and July
  return `2026-${String(month).padStart(2, "0")}-${String(baseDay).padStart(2, "0")}`;
}

/**
 * Estimate camp cost based on division level.
 */
function estimateCampCost(division: string): number {
  switch (division) {
    case "D1 FBS":
      return 150;
    case "D1 FCS":
      return 100;
    case "D2":
      return 75;
    default:
      return 60;
  }
}

/**
 * Generate realistic mock camp data when all live scraping fails.
 */
function generateMockCamps(schools: TargetSchool[]): CampListing[] {
  const camps: CampListing[] = [];

  const campTemplates: Array<{
    suffix: string;
    type: CampListing["campType"];
    monthOffset: number;
  }> = [
    { suffix: "Elite Prospect Camp", type: "school_camp", monthOffset: 0 },
    { suffix: "Prospect Day", type: "prospect_day", monthOffset: 0 },
    { suffix: "OL/DL Big Man Camp", type: "school_camp", monthOffset: 1 },
  ];

  for (const school of schools) {
    const hashValue = school.id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    // Each school gets 2-3 camps
    const campCount = 2 + (hashValue % 2);
    const templates = campTemplates.slice(0, campCount);

    for (let i = 0; i < templates.length; i++) {
      const template = templates[i];
      const month = 6 + template.monthOffset; // June or July
      const day = 5 + ((hashValue + i * 11) % 23); // Days 5-27

      camps.push({
        name: `${school.name} ${template.suffix}`,
        school: school.name,
        location: `${school.name} Football Complex`,
        campType: template.type,
        date: `2026-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
        dateEnd: template.type === "school_camp"
          ? `2026-${String(month).padStart(2, "0")}-${String(Math.min(day + 1, 28)).padStart(2, "0")}`
          : null,
        cost: estimateCampCost(school.division) + (i * 25),
        registrationStatus: "not_registered",
        sourceUrl: null,
        source: "mock",
      });
    }
  }

  return camps;
}
