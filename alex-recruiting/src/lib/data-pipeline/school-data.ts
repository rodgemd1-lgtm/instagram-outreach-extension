/**
 * School Data Aggregator
 *
 * Combines CFBD live data with the static target-schools list to produce an
 * enriched school profile that surfaces:
 *   - OL roster depth and graduation gap analysis
 *   - CFBD composite talent score
 *   - Most recent recruiting class rank
 *   - Estimated scholarship availability
 *
 * Falls back gracefully when CFBD is unavailable or unconfigured.
 */

import { targetSchools, type TargetSchool } from "@/lib/data/target-schools";
import {
  getTeams,
  getOLRoster,
  getTeamTalent,
  getRecruitingPlayers,
  filterByEligibilityYear,
  type CFBDTeam,
  type CFBDTeamTalent,
} from "./cfbd-client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EnrichedSchoolProfile {
  // Core identity
  id: string;
  name: string;
  slug: string;
  conference: string;
  division: string;
  priorityTier: string;

  // From target-schools static data
  whyJacob: string;
  olNeedSignal: string;
  dmTimeline: string;
  officialXHandle: string;
  rosterUrl: string;
  staffUrl: string;

  // Enriched from CFBD
  olRosterCount: number | null;
  olGraduating: number | null;        // seniors + grad students on OL
  scholarshipsAvailable: number | null;
  recruitingRank: number | null;      // composite class rank for current year
  talentScore: number | null;         // CFBD composite talent rating
  cfbdTeamId: number | null;

  // Metadata
  enrichedAt: string | null;
  cfbdAvailable: boolean;
}

// ─── In-memory profile cache ─────────────────────────────────────────────────
// Keyed by school slug so successive calls within the same process are free.

const profileCache = new Map<string, { profile: EnrichedSchoolProfile; cachedAt: number }>();
const PROFILE_CACHE_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours

// ─── Slug helpers ─────────────────────────────────────────────────────────────

export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Fuzzy match a target-school name against a CFBD team's `school` field.
 * Returns the best matching CFBDTeam or null.
 */
function matchCFBDTeam(targetName: string, cfbdTeams: CFBDTeam[]): CFBDTeam | null {
  const normalize = (s: string) =>
    s.toLowerCase().replace(/university|college|state|the/gi, "").replace(/\s+/g, " ").trim();

  const normalizedTarget = normalize(targetName);

  // Exact match first
  const exact = cfbdTeams.find(
    (t) => t.school.toLowerCase() === targetName.toLowerCase()
  );
  if (exact) return exact;

  // Contains match
  const contains = cfbdTeams.find(
    (t) =>
      normalize(t.school).includes(normalizedTarget) ||
      normalizedTarget.includes(normalize(t.school))
  );
  return contains ?? null;
}

// ─── Core enrichment logic ────────────────────────────────────────────────────

async function enrichSingleSchool(
  school: TargetSchool,
  cfbdTeams: CFBDTeam[],
  talentMap: Map<string, number>
): Promise<EnrichedSchoolProfile> {
  const slug = school.id; // existing id is already slug-compatible

  const base: EnrichedSchoolProfile = {
    id: school.id,
    name: school.name,
    slug,
    conference: school.conference,
    division: school.division,
    priorityTier: school.priorityTier,
    whyJacob: school.whyJacob,
    olNeedSignal: school.olNeedSignal,
    dmTimeline: school.dmTimeline,
    officialXHandle: school.officialXHandle,
    rosterUrl: school.rosterUrl,
    staffUrl: school.staffUrl,
    olRosterCount: null,
    olGraduating: null,
    scholarshipsAvailable: null,
    recruitingRank: null,
    talentScore: null,
    cfbdTeamId: null,
    enrichedAt: null,
    cfbdAvailable: false,
  };

  // Check whether CFBD is configured at all
  if (!process.env.CFBD_API_KEY) {
    return base;
  }

  const cfbdTeam = matchCFBDTeam(school.name, cfbdTeams);
  if (!cfbdTeam) {
    return base;
  }

  base.cfbdTeamId = cfbdTeam.id;
  base.cfbdAvailable = true;

  // Talent score from pre-fetched map
  const talent = talentMap.get(cfbdTeam.school);
  if (talent !== undefined) {
    base.talentScore = talent;
  }

  // OL roster analysis
  try {
    const currentYear = new Date().getFullYear();
    const olRoster = await getOLRoster(cfbdTeam.school, currentYear);
    base.olRosterCount = olRoster.length;

    // Graduating = seniors (year 4) + grad students (year 5)
    const graduating = [
      ...filterByEligibilityYear(olRoster, 4),
      ...filterByEligibilityYear(olRoster, 5),
    ];
    base.olGraduating = graduating.length;

    // Conservative scholarship estimate: open spots = graduating count
    // (assumes program targets a full OL room of ~10 scholarship players)
    const OL_SCHOLARSHIP_ROOM = 10;
    const returning = olRoster.length - graduating.length;
    base.scholarshipsAvailable = Math.max(0, OL_SCHOLARSHIP_ROOM - returning);
  } catch {
    // Non-fatal — leave as null
  }

  // Recruiting class rank (most recent year available)
  try {
    const currentYear = new Date().getFullYear();
    const recruits = await getRecruitingPlayers(currentYear, undefined, cfbdTeam.school);
    if (recruits.length > 0) {
      // Rank by total player count in recruiting class as a proxy;
      // use the first player's ranking field if present
      const ranked = recruits.filter((r) => r.ranking !== null);
      if (ranked.length > 0) {
        base.recruitingRank = ranked[0].ranking;
      }
    }
  } catch {
    // Non-fatal — leave as null
  }

  base.enrichedAt = new Date().toISOString();
  return base;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetch enriched profiles for ALL target schools.
 * CFBD team list and talent scores are fetched once and reused.
 */
export async function getAllEnrichedSchoolProfiles(): Promise<EnrichedSchoolProfile[]> {
  let cfbdTeams: CFBDTeam[] = [];
  const talentMap = new Map<string, number>();

  if (process.env.CFBD_API_KEY) {
    try {
      cfbdTeams = await getTeams();
      const currentYear = new Date().getFullYear();
      const talentList: CFBDTeamTalent[] = await getTeamTalent(currentYear);
      for (const t of talentList) {
        talentMap.set(t.school, t.talent);
      }
    } catch {
      // CFBD unavailable — proceed with static data only
    }
  }

  const profiles = await Promise.all(
    targetSchools.map((school) => enrichSingleSchool(school, cfbdTeams, talentMap))
  );

  return profiles;
}

/**
 * Fetch and return the enriched profile for a single school by name or slug.
 * Results are cached in-memory for 4 hours.
 */
export async function getEnrichedSchoolProfile(
  schoolNameOrSlug: string
): Promise<EnrichedSchoolProfile | null> {
  const normalizedInput = schoolNameOrSlug.toLowerCase().trim();

  // Check in-memory cache first
  const cached = profileCache.get(normalizedInput);
  if (cached && Date.now() - cached.cachedAt < PROFILE_CACHE_TTL_MS) {
    return cached.profile;
  }

  // Find the target school by id (slug) or name
  const school = targetSchools.find(
    (s) =>
      s.id === normalizedInput ||
      s.name.toLowerCase() === normalizedInput ||
      toSlug(s.name) === normalizedInput
  );

  if (!school) {
    return null;
  }

  let cfbdTeams: CFBDTeam[] = [];
  const talentMap = new Map<string, number>();

  if (process.env.CFBD_API_KEY) {
    try {
      cfbdTeams = await getTeams();
      const currentYear = new Date().getFullYear();
      const talentList: CFBDTeamTalent[] = await getTeamTalent(currentYear);
      for (const t of talentList) {
        talentMap.set(t.school, t.talent);
      }
    } catch {
      // Non-fatal
    }
  }

  const profile = await enrichSingleSchool(school, cfbdTeams, talentMap);

  profileCache.set(normalizedInput, { profile, cachedAt: Date.now() });
  // Also store under the resolved id for future look-ups
  if (normalizedInput !== school.id) {
    profileCache.set(school.id, { profile, cachedAt: Date.now() });
  }

  return profile;
}

/**
 * Return all target schools as minimal profiles without hitting CFBD.
 * Useful as a fast fallback listing.
 */
export function getStaticSchoolProfiles(): EnrichedSchoolProfile[] {
  return targetSchools.map((school) => ({
    id: school.id,
    name: school.name,
    slug: school.id,
    conference: school.conference,
    division: school.division,
    priorityTier: school.priorityTier,
    whyJacob: school.whyJacob,
    olNeedSignal: school.olNeedSignal,
    dmTimeline: school.dmTimeline,
    officialXHandle: school.officialXHandle,
    rosterUrl: school.rosterUrl,
    staffUrl: school.staffUrl,
    olRosterCount: null,
    olGraduating: null,
    scholarshipsAvailable: null,
    recruitingRank: null,
    talentScore: null,
    cfbdTeamId: null,
    enrichedAt: null,
    cfbdAvailable: false,
  }));
}
