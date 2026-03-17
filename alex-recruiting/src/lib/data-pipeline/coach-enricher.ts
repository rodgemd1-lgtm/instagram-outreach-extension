/**
 * Coach Data Enricher
 *
 * Cross-references live CFBD coaching history with the static target-schools
 * knowledge base to produce a richer coach profile that includes:
 *   - Current and previous schools with tenure lengths
 *   - Win/loss records per season
 *   - Recruiting class rankings during their tenure
 *   - Derived signals useful for Jacob's outreach strategy
 */

import { targetSchools } from "@/lib/data/target-schools";
import {
  getCoaches,
  getRecruitingPlayers,
  type CFBDCoach,
  type CFBDCoachSeason,
} from "./cfbd-client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CoachSeasonSummary {
  school: string;
  year: number;
  wins: number;
  losses: number;
  ties: number;
  preseasonRank: number | null;
  postseasonRank: number | null;
  recruitingClassRank: number | null;
}

export interface EnrichedCoachProfile {
  // Identity
  firstName: string;
  lastName: string;
  fullName: string;
  currentSchool: string | null;
  currentSchoolSlug: string | null;

  // Tenure
  hireDate: string | null;
  tenureYears: number | null;       // years at current school
  totalCoachingYears: number | null; // career length

  // Previous schools
  previousSchools: string[];

  // Season history
  seasons: CoachSeasonSummary[];

  // Recruiting signals
  avgRecruitingClassRank: number | null;
  bestRecruitingClassRank: number | null;

  // Target-school context
  isTargetSchool: boolean;
  targetSchoolPriorityTier: string | null;
  targetSchoolWhyJacob: string | null;
  targetSchoolDmTimeline: string | null;

  // Metadata
  cfbdAvailable: boolean;
  enrichedAt: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeCoachName(name: string): string {
  return name.toLowerCase().trim();
}

/**
 * Rough name match — checks if a CFBDCoach's full name contains the search
 * terms. Handles "First Last", "Last", or "F. Last" formats.
 */
function coachMatchesSearch(coach: CFBDCoach, searchName: string): boolean {
  const fullName = `${coach.first_name} ${coach.last_name}`.toLowerCase();
  const query = normalizeCoachName(searchName);
  if (fullName === query) return true;
  if (fullName.includes(query)) return true;
  // Last name only
  if (coach.last_name.toLowerCase() === query) return true;
  return false;
}

/**
 * Determine the most recent season entry for a coach and treat that as their
 * current school.
 */
function currentSchoolFromSeasons(seasons: CFBDCoachSeason[]): string | null {
  if (seasons.length === 0) return null;
  const sorted = [...seasons].sort((a, b) => b.year - a.year);
  return sorted[0].school;
}

/**
 * School name → slug (matches the id format used in target-schools.ts).
 */
function schoolToSlug(schoolName: string): string {
  return schoolName
    .toLowerCase()
    .replace(/university|college|state|the/gi, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─── Core enrichment ─────────────────────────────────────────────────────────

async function buildEnrichedProfile(
  cfbdCoach: CFBDCoach,
  searchSchool: string | undefined
): Promise<EnrichedCoachProfile> {
  const fullName = `${cfbdCoach.first_name} ${cfbdCoach.last_name}`;

  // Sort seasons chronologically
  const sortedSeasons = [...cfbdCoach.seasons].sort((a, b) => a.year - b.year);

  const currentSchool =
    searchSchool ?? currentSchoolFromSeasons(sortedSeasons);

  const currentSchoolSlug = currentSchool ? schoolToSlug(currentSchool) : null;

  // Tenure at current school
  const currentSchoolSeasons = sortedSeasons.filter(
    (s) => s.school.toLowerCase() === (currentSchool ?? "").toLowerCase()
  );
  const tenureYears = currentSchoolSeasons.length > 0 ? currentSchoolSeasons.length : null;

  // Previous schools (exclude current)
  const previousSchools = [
    ...new Set(
      sortedSeasons
        .filter((s) => s.school.toLowerCase() !== (currentSchool ?? "").toLowerCase())
        .map((s) => s.school)
    ),
  ];

  // Recruiting class ranks — fetch concurrently per season year at this school
  const seasonSummaries: CoachSeasonSummary[] = [];
  for (const season of currentSchoolSeasons) {
    let recruitingClassRank: number | null = null;
    try {
      const recruits = await getRecruitingPlayers(season.year, undefined, season.school);
      const ranked = recruits.filter((r) => r.ranking !== null);
      if (ranked.length > 0) {
        recruitingClassRank = ranked[0].ranking;
      }
    } catch {
      // Non-fatal
    }

    seasonSummaries.push({
      school: season.school,
      year: season.year,
      wins: season.wins,
      losses: season.losses,
      ties: season.ties,
      preseasonRank: season.preseason_rank,
      postseasonRank: season.postseason_rank,
      recruitingClassRank,
    });
  }

  // Aggregate recruiting stats
  const validRanks = seasonSummaries
    .map((s) => s.recruitingClassRank)
    .filter((r): r is number => r !== null);

  const avgRecruitingClassRank =
    validRanks.length > 0
      ? Math.round(validRanks.reduce((a, b) => a + b, 0) / validRanks.length)
      : null;

  const bestRecruitingClassRank =
    validRanks.length > 0 ? Math.min(...validRanks) : null;

  // Target-school context
  const targetSchool = currentSchool
    ? targetSchools.find(
        (s) =>
          s.name.toLowerCase() === currentSchool.toLowerCase() ||
          s.id === schoolToSlug(currentSchool)
      )
    : null;

  return {
    firstName: cfbdCoach.first_name,
    lastName: cfbdCoach.last_name,
    fullName,
    currentSchool,
    currentSchoolSlug,
    hireDate: cfbdCoach.hire_date ?? null,
    tenureYears,
    totalCoachingYears: sortedSeasons.length > 0 ? sortedSeasons.length : null,
    previousSchools,
    seasons: seasonSummaries,
    avgRecruitingClassRank,
    bestRecruitingClassRank,
    isTargetSchool: targetSchool !== null,
    targetSchoolPriorityTier: targetSchool?.priorityTier ?? null,
    targetSchoolWhyJacob: targetSchool?.whyJacob ?? null,
    targetSchoolDmTimeline: targetSchool?.dmTimeline ?? null,
    cfbdAvailable: true,
    enrichedAt: new Date().toISOString(),
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Enrich a coach profile by name and optional school.
 *
 * - Searches CFBD coaches endpoint for matching records.
 * - Cross-references with the target-schools static database.
 * - Falls back to a minimal static-only profile when CFBD is unavailable.
 *
 * @param coachName  Full name, last name, or partial name.
 * @param school     Current school name (helps disambiguate common names).
 */
export async function enrichCoachProfile(
  coachName: string,
  school?: string
): Promise<EnrichedCoachProfile | null> {
  const fallbackProfile: EnrichedCoachProfile = {
    firstName: coachName.split(" ")[0] ?? coachName,
    lastName: coachName.split(" ").slice(1).join(" ") || "",
    fullName: coachName,
    currentSchool: school ?? null,
    currentSchoolSlug: school ? schoolToSlug(school) : null,
    hireDate: null,
    tenureYears: null,
    totalCoachingYears: null,
    previousSchools: [],
    seasons: [],
    avgRecruitingClassRank: null,
    bestRecruitingClassRank: null,
    isTargetSchool: school
      ? targetSchools.some(
          (s) =>
            s.name.toLowerCase() === school.toLowerCase() ||
            s.id === schoolToSlug(school)
        )
      : false,
    targetSchoolPriorityTier: null,
    targetSchoolWhyJacob: null,
    targetSchoolDmTimeline: null,
    cfbdAvailable: false,
    enrichedAt: null,
  };

  if (!process.env.CFBD_API_KEY) {
    return fallbackProfile;
  }

  try {
    // Fetch coaches filtered by school when provided
    const cfbdCoaches = await getCoaches(school);
    const match = cfbdCoaches.find((c) => coachMatchesSearch(c, coachName));

    if (!match) {
      // If school-filtered search found nothing, try without school filter
      if (school) {
        const allCoaches = await getCoaches();
        const globalMatch = allCoaches.find((c) => coachMatchesSearch(c, coachName));
        if (!globalMatch) return fallbackProfile;
        return buildEnrichedProfile(globalMatch, school);
      }
      return fallbackProfile;
    }

    return buildEnrichedProfile(match, school);
  } catch {
    return fallbackProfile;
  }
}

/**
 * Bulk-enrich all head coaches for every target school.
 * Useful for the sync pipeline — calls CFBD once per school.
 */
export async function enrichAllTargetSchoolCoaches(): Promise<EnrichedCoachProfile[]> {
  const results: EnrichedCoachProfile[] = [];

  for (const school of targetSchools) {
    try {
      const cfbdCoaches = await getCoaches(school.name);
      if (cfbdCoaches.length === 0) continue;

      // Take the first result (head coach is typically first)
      const profile = await buildEnrichedProfile(cfbdCoaches[0], school.name);
      results.push(profile);
    } catch {
      // Skip failed schools without aborting the whole batch
    }
  }

  return results;
}
