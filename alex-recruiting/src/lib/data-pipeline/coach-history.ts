/**
 * Coach Recruiting History Patterns
 *
 * Cross-references CFBD coaching data with recruiting class data to analyze
 * which coaches offered which OL prospects in past cycles, when offers were
 * extended, and what measurables triggered interest.
 *
 * Uses the existing CFBD client with 24h caching to stay within the
 * 1,000 requests/month free tier.
 */

import {
  getCoaches,
  getRecruitingPlayers,
  getOLRoster,
  type CFBDCoach,
  type CFBDRecruitingPlayer,
  type CFBDRosterPlayer,
} from "./cfbd-client";
import { targetSchools } from "@/lib/data/target-schools";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HistoricalOLRecruit {
  name: string;
  position: string | null;
  height: number | null;    // inches
  weight: number | null;    // lbs
  stars: number | null;
  rating: number | null;
  homeState: string | null;
  homeCity: string | null;
  signedYear: number;
  school: string;           // college they signed with
}

export interface OfferPattern {
  school: string;
  coachName: string;
  /** Average height (inches) of signed OL recruits */
  avgHeight: number | null;
  /** Average weight (lbs) of signed OL recruits */
  avgWeight: number | null;
  /** Average star rating of signed OL */
  avgStars: number | null;
  /** Average composite rating of signed OL */
  avgRating: number | null;
  /** Minimum height seen in signed OL */
  minHeight: number | null;
  /** Minimum weight seen in signed OL */
  minWeight: number | null;
  /** States most frequently recruited from */
  topStates: { state: string; count: number }[];
  /** Years analyzed */
  yearsAnalyzed: number[];
  /** Total OL signed across analyzed years */
  totalOLSigned: number;
  /** Derived pattern description */
  patternSummary: string;
}

export interface GeographicPattern {
  school: string;
  states: { state: string; count: number; percentage: number }[];
  recruitedFromWisconsin: boolean;
  recruitedFromMidwest: boolean;
  midwestPercentage: number;
  totalRecruitsAnalyzed: number;
}

export interface OfferLikelihood {
  school: string;
  coachName: string;
  likelihood: "high" | "medium" | "low" | "unknown";
  score: number; // 0-100
  factors: string[];
  recommendation: string;
}

export interface CoachRecruitingHistory {
  coachName: string;
  school: string;
  historicalOLRecruits: HistoricalOLRecruit[];
  offerPattern: OfferPattern;
  geographicPattern: GeographicPattern;
  offerLikelihood: OfferLikelihood;
  dataAvailable: boolean;
  analyzedAt: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const OL_POSITIONS = new Set(["OT", "OG", "OC", "C", "OL", "IOL"]);
const MIDWEST_STATES = new Set([
  "WI", "Wisconsin",
  "MN", "Minnesota",
  "IA", "Iowa",
  "IL", "Illinois",
  "MI", "Michigan",
  "IN", "Indiana",
  "OH", "Ohio",
  "ND", "North Dakota",
  "SD", "South Dakota",
  "NE", "Nebraska",
  "MO", "Missouri",
  "KS", "Kansas",
]);

// Jacob's current measurables for comparison
const JACOB_PROFILE = {
  height: 76, // 6'4" in inches
  weight: 285,
  state: "WI",
  classYear: 2029,
  position: "OG/DT",
};

const YEARS_TO_ANALYZE = 3;

// ─── In-memory cache ──────────────────────────────────────────────────────────

const historyCache = new Map<string, { data: CoachRecruitingHistory; cachedAt: number }>();
const CACHE_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isOLPosition(position: string | null): boolean {
  if (!position) return false;
  return OL_POSITIONS.has(position.toUpperCase());
}

function isMidwestState(state: string | null): boolean {
  if (!state) return false;
  return MIDWEST_STATES.has(state);
}

function heightInchesToString(inches: number): string {
  const feet = Math.floor(inches / 12);
  const remaining = inches % 12;
  return `${feet}'${remaining}"`;
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}

function stateFrequency(recruits: HistoricalOLRecruit[]): { state: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const r of recruits) {
    if (r.homeState) {
      const s = r.homeState.trim();
      counts.set(s, (counts.get(s) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([state, count]) => ({ state, count }))
    .sort((a, b) => b.count - a.count);
}

// ─── Core Analysis ────────────────────────────────────────────────────────────

/**
 * Get OL recruits signed by a school over the past N years from CFBD.
 */
async function getHistoricalOLRecruits(
  school: string,
  yearsBack: number = YEARS_TO_ANALYZE
): Promise<HistoricalOLRecruit[]> {
  const currentYear = new Date().getFullYear();
  const recruits: HistoricalOLRecruit[] = [];

  for (let year = currentYear; year > currentYear - yearsBack; year--) {
    try {
      const classRecruits = await getRecruitingPlayers(year, undefined, school);
      const olRecruits = classRecruits.filter(
        (r) => isOLPosition(r.position) && r.committed_to?.toLowerCase() === school.toLowerCase()
      );

      for (const r of olRecruits) {
        recruits.push({
          name: r.name,
          position: r.position,
          height: r.height,
          weight: r.weight,
          stars: r.stars,
          rating: r.rating,
          homeState: r.state_province,
          homeCity: r.city,
          signedYear: r.year,
          school,
        });
      }
    } catch {
      // Non-fatal — skip year
    }
  }

  return recruits;
}

/**
 * Build offer pattern analysis from historical OL recruit data.
 */
function buildOfferPattern(
  school: string,
  coachName: string,
  recruits: HistoricalOLRecruit[]
): OfferPattern {
  const heights = recruits.map((r) => r.height).filter((h): h is number => h !== null);
  const weights = recruits.map((r) => r.weight).filter((w): w is number => w !== null);
  const stars = recruits.map((r) => r.stars).filter((s): s is number => s !== null);
  const ratings = recruits.map((r) => r.rating).filter((r): r is number => r !== null);
  const yearsAnalyzed = [...new Set(recruits.map((r) => r.signedYear))].sort();
  const topStates = stateFrequency(recruits);

  const avgH = average(heights);
  const avgW = average(weights);
  const minH = heights.length > 0 ? Math.min(...heights) : null;
  const minW = weights.length > 0 ? Math.min(...weights) : null;

  // Build pattern summary
  const summaryParts: string[] = [];
  if (avgH && avgW) {
    summaryParts.push(
      `${school} OL coach typically signs OL prospects at ${heightInchesToString(avgH)}+ ${avgW}+ lbs`
    );
  }
  if (topStates.length > 0) {
    const topStateNames = topStates.slice(0, 3).map((s) => s.state);
    summaryParts.push(`primarily recruits from ${topStateNames.join(", ")}`);
  }
  if (minH && minW) {
    summaryParts.push(
      `minimum profile: ${heightInchesToString(minH)} / ${minW} lbs`
    );
  }
  const patternSummary =
    summaryParts.length > 0
      ? summaryParts.join(". ") + "."
      : `Insufficient data to determine offer pattern for ${school}.`;

  return {
    school,
    coachName,
    avgHeight: avgH,
    avgWeight: avgW,
    avgStars: average(stars),
    avgRating: ratings.length > 0 ? Math.round(average(ratings)! * 1000) / 1000 : null,
    minHeight: minH,
    minWeight: minW,
    topStates,
    yearsAnalyzed,
    totalOLSigned: recruits.length,
    patternSummary,
  };
}

/**
 * Build geographic recruiting pattern analysis.
 */
function buildGeographicPattern(
  school: string,
  recruits: HistoricalOLRecruit[]
): GeographicPattern {
  const stateCounts = stateFrequency(recruits);
  const total = recruits.length;

  const statesWithPct = stateCounts.map((s) => ({
    ...s,
    percentage: total > 0 ? Math.round((s.count / total) * 100) : 0,
  }));

  const midwestCount = recruits.filter((r) => isMidwestState(r.homeState)).length;
  const wiscoCount = recruits.filter(
    (r) => r.homeState === "WI" || r.homeState === "Wisconsin"
  ).length;

  return {
    school,
    states: statesWithPct,
    recruitedFromWisconsin: wiscoCount > 0,
    recruitedFromMidwest: midwestCount > 0,
    midwestPercentage: total > 0 ? Math.round((midwestCount / total) * 100) : 0,
    totalRecruitsAnalyzed: total,
  };
}

/**
 * Predict Jacob's offer likelihood based on historical patterns.
 */
function predictLikelihood(
  school: string,
  coachName: string,
  pattern: OfferPattern,
  geo: GeographicPattern
): OfferLikelihood {
  let score = 50; // Start at neutral
  const factors: string[] = [];

  // Height comparison
  if (pattern.minHeight !== null) {
    if (JACOB_PROFILE.height >= pattern.minHeight) {
      score += 10;
      factors.push(`Jacob's height (6'4") meets minimum threshold (${heightInchesToString(pattern.minHeight)})`);
    } else {
      score -= 15;
      factors.push(`Jacob's height (6'4") is below the minimum signed OL height (${heightInchesToString(pattern.minHeight)})`);
    }
  }

  if (pattern.avgHeight !== null) {
    if (JACOB_PROFILE.height >= pattern.avgHeight) {
      score += 5;
      factors.push(`Jacob's height meets or exceeds the average signed OL height`);
    }
  }

  // Weight comparison
  if (pattern.minWeight !== null) {
    if (JACOB_PROFILE.weight >= pattern.minWeight) {
      score += 10;
      factors.push(`Jacob's weight (285 lbs) meets minimum threshold (${pattern.minWeight} lbs)`);
    } else {
      score -= 10;
      factors.push(`Jacob's weight (285 lbs) is below minimum signed OL weight (${pattern.minWeight} lbs)`);
    }
  }

  if (pattern.avgWeight !== null) {
    if (JACOB_PROFILE.weight >= pattern.avgWeight - 10) {
      score += 5;
      factors.push(`Jacob's weight is within range of average signed OL weight (${pattern.avgWeight} lbs)`);
    }
  }

  // Geographic pattern
  if (geo.recruitedFromWisconsin) {
    score += 15;
    factors.push(`${school} has previously recruited from Wisconsin`);
  }

  if (geo.recruitedFromMidwest) {
    score += 5;
    factors.push(`${school} actively recruits the Midwest (${geo.midwestPercentage}% of recruits)`);
  } else {
    score -= 10;
    factors.push(`${school} does not typically recruit from the Midwest`);
  }

  // Volume — schools that sign more OL per year have more spots
  if (pattern.totalOLSigned > 0) {
    const avgPerYear = pattern.totalOLSigned / Math.max(pattern.yearsAnalyzed.length, 1);
    if (avgPerYear >= 3) {
      score += 5;
      factors.push(`${school} signs ${avgPerYear.toFixed(1)} OL per year — multiple spots available`);
    }
  }

  // Data quality adjustment
  if (pattern.totalOLSigned === 0) {
    score = 50;
    factors.push("Insufficient historical data for accurate prediction");
  }

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  // Determine likelihood tier
  let likelihood: OfferLikelihood["likelihood"];
  let recommendation: string;

  if (pattern.totalOLSigned === 0) {
    likelihood = "unknown";
    recommendation = `Need more data on ${school}'s OL recruiting patterns. Attend their camp to get evaluated in person.`;
  } else if (score >= 70) {
    likelihood = "high";
    recommendation = `Jacob fits ${school}'s historical OL recruiting profile well. Prioritize camp attendance and direct engagement with ${coachName}.`;
  } else if (score >= 45) {
    likelihood = "medium";
    recommendation = `Jacob is in the range for ${school}'s OL recruiting. Focus on improving measurables and building film quality to stand out.`;
  } else {
    likelihood = "low";
    recommendation = `${school} typically signs OL prospects with a different profile. Consider as a reach and focus energy on better-fit programs.`;
  }

  return {
    school,
    coachName,
    likelihood,
    score,
    factors,
    recommendation,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Get complete recruiting history analysis for a coach at a school.
 * Results are cached in-memory for 4 hours.
 */
export async function getCoachRecruitingHistory(
  coachName: string,
  school: string
): Promise<CoachRecruitingHistory> {
  const cacheKey = `${school.toLowerCase()}-${coachName.toLowerCase()}`;
  const cached = historyCache.get(cacheKey);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    return cached.data;
  }

  const fallback: CoachRecruitingHistory = {
    coachName,
    school,
    historicalOLRecruits: [],
    offerPattern: {
      school,
      coachName,
      avgHeight: null,
      avgWeight: null,
      avgStars: null,
      avgRating: null,
      minHeight: null,
      minWeight: null,
      topStates: [],
      yearsAnalyzed: [],
      totalOLSigned: 0,
      patternSummary: `No CFBD data available for ${school}. Set CFBD_API_KEY to enable historical analysis.`,
    },
    geographicPattern: {
      school,
      states: [],
      recruitedFromWisconsin: false,
      recruitedFromMidwest: false,
      midwestPercentage: 0,
      totalRecruitsAnalyzed: 0,
    },
    offerLikelihood: {
      school,
      coachName,
      likelihood: "unknown",
      score: 50,
      factors: ["CFBD API key not configured — cannot analyze historical data"],
      recommendation: "Configure CFBD_API_KEY to unlock historical recruiting pattern analysis.",
    },
    dataAvailable: false,
    analyzedAt: new Date().toISOString(),
  };

  if (!process.env.CFBD_API_KEY) {
    return fallback;
  }

  try {
    // Step 1: Get historical OL recruits for this school
    const historicalOLRecruits = await getHistoricalOLRecruits(school, YEARS_TO_ANALYZE);

    // Step 2: Build offer pattern
    const offerPattern = buildOfferPattern(school, coachName, historicalOLRecruits);

    // Step 3: Build geographic pattern
    const geographicPattern = buildGeographicPattern(school, historicalOLRecruits);

    // Step 4: Predict offer likelihood
    const offerLikelihood = predictLikelihood(school, coachName, offerPattern, geographicPattern);

    const result: CoachRecruitingHistory = {
      coachName,
      school,
      historicalOLRecruits,
      offerPattern,
      geographicPattern,
      offerLikelihood,
      dataAvailable: true,
      analyzedAt: new Date().toISOString(),
    };

    // Cache result
    historyCache.set(cacheKey, { data: result, cachedAt: Date.now() });

    return result;
  } catch {
    return fallback;
  }
}

/**
 * Get offer pattern analysis for a specific school.
 */
export async function getOfferPatterns(school: string): Promise<OfferPattern> {
  const history = await getCoachRecruitingHistory("HC", school);
  return history.offerPattern;
}

/**
 * Get geographic recruiting pattern for a specific school.
 */
export async function getGeographicPatterns(school: string): Promise<GeographicPattern> {
  const history = await getCoachRecruitingHistory("HC", school);
  return history.geographicPattern;
}

/**
 * Predict Jacob's offer likelihood at a specific school.
 */
export async function predictOfferLikelihood(
  school: string,
  coachName?: string
): Promise<OfferLikelihood> {
  const history = await getCoachRecruitingHistory(coachName ?? "HC", school);
  return history.offerLikelihood;
}

/**
 * Analyze all target schools and rank by offer likelihood.
 * Returns schools sorted by predicted offer likelihood score.
 */
export async function analyzeAllTargetSchools(): Promise<
  { school: string; tier: string; likelihood: OfferLikelihood }[]
> {
  const results: { school: string; tier: string; likelihood: OfferLikelihood }[] = [];

  for (const school of targetSchools) {
    try {
      const likelihood = await predictOfferLikelihood(school.name);
      results.push({
        school: school.name,
        tier: school.priorityTier,
        likelihood,
      });
    } catch {
      // Skip failed schools
    }
  }

  return results.sort((a, b) => b.likelihood.score - a.likelihood.score);
}
