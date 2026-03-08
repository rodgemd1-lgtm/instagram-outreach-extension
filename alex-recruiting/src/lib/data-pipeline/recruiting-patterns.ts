/**
 * Recruiting Patterns Analyzer
 *
 * Analyzes historical recruiting data to identify patterns relevant to
 * Jacob Rodgers' recruiting campaign:
 *   - Which D1 schools have recruited from Pewaukee/Waukesha County
 *   - Average timeline from first contact to offer for OL prospects
 *   - Measurable thresholds that trigger offers at each division level
 *   - Optimal camp-to-offer pipeline analysis
 *
 * Uses CFBD data with graceful fallback to static analysis when the
 * API is unavailable.
 */

import {
  getRecruitingPlayers,
  getOLRoster,
} from "./cfbd-client";
import { targetSchools } from "@/lib/data/target-schools";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AreaRecruitingRecord {
  playerName: string;
  highSchool: string | null;
  city: string | null;
  state: string | null;
  position: string | null;
  committedTo: string | null;
  division: string | null;
  classYear: number;
  stars: number | null;
  rating: number | null;
}

export interface MeasurableThreshold {
  division: string;
  position: string;
  metric: string;
  minimumValue: number;
  averageValue: number;
  eliteValue: number;
  unit: string;
  sampleSize: number;
  source: string;
}

export interface RecruitingTimeline {
  division: string;
  avgMonthsFromContactToOffer: number;
  typicalOfferMonths: string[];
  earlySignalMonths: string[];
  notes: string;
}

export interface CampToOfferData {
  campType: string;
  avgConversionRate: number; // % of campers who get offers
  bestMonths: string[];
  description: string;
  jacobRecommendation: string;
}

export interface HistoricalRecruitingPatterns {
  areaHistory: AreaRecruitingRecord[];
  measurableThresholds: MeasurableThreshold[];
  timelines: RecruitingTimeline[];
  campPipeline: CampToOfferData[];
  insights: string[];
  dataSource: "cfbd" | "static" | "mixed";
  analyzedAt: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const WISCONSIN_AREA_CITIES = [
  "Pewaukee", "Waukesha", "Brookfield", "Delafield", "Oconomowoc",
  "Hartland", "Menomonee Falls", "Sussex", "Mukwonago", "New Berlin",
  "Muskego", "Elm Grove", "Wauwatosa", "Milwaukee", "West Allis",
  "Germantown", "West Bend", "Hartford",
];

const OL_POSITIONS = new Set(["OT", "OG", "OC", "C", "OL", "IOL"]);

const YEARS_TO_SCAN = 4;

// ─── In-memory cache ──────────────────────────────────────────────────────────

let cachedPatterns: { data: HistoricalRecruitingPatterns; cachedAt: number } | null = null;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

// ─── Static Knowledge Base ───────────────────────────────────────────────────
// Based on publicly available recruiting data and recruiting industry knowledge.
// These represent typical thresholds observed across recruiting cycles.

const staticMeasurableThresholds: MeasurableThreshold[] = [
  // FBS Power Conference OL thresholds
  {
    division: "D1 FBS Power",
    position: "OL",
    metric: "height",
    minimumValue: 75, // 6'3"
    averageValue: 77, // 6'5"
    eliteValue: 79,   // 6'7"
    unit: "inches",
    sampleSize: 0,
    source: "industry standard",
  },
  {
    division: "D1 FBS Power",
    position: "OL",
    metric: "weight",
    minimumValue: 280,
    averageValue: 300,
    eliteValue: 320,
    unit: "lbs",
    sampleSize: 0,
    source: "industry standard",
  },
  // FBS Group of 5 (MAC, etc.) OL thresholds
  {
    division: "D1 FBS Group of 5",
    position: "OL",
    metric: "height",
    minimumValue: 73, // 6'1"
    averageValue: 75, // 6'3"
    eliteValue: 77,   // 6'5"
    unit: "inches",
    sampleSize: 0,
    source: "industry standard",
  },
  {
    division: "D1 FBS Group of 5",
    position: "OL",
    metric: "weight",
    minimumValue: 270,
    averageValue: 290,
    eliteValue: 310,
    unit: "lbs",
    sampleSize: 0,
    source: "industry standard",
  },
  // FCS OL thresholds
  {
    division: "D1 FCS",
    position: "OL",
    metric: "height",
    minimumValue: 72, // 6'0"
    averageValue: 74, // 6'2"
    eliteValue: 76,   // 6'4"
    unit: "inches",
    sampleSize: 0,
    source: "industry standard",
  },
  {
    division: "D1 FCS",
    position: "OL",
    metric: "weight",
    minimumValue: 260,
    averageValue: 280,
    eliteValue: 300,
    unit: "lbs",
    sampleSize: 0,
    source: "industry standard",
  },
  // D2 OL thresholds
  {
    division: "D2",
    position: "OL",
    metric: "height",
    minimumValue: 71, // 5'11"
    averageValue: 73, // 6'1"
    eliteValue: 75,   // 6'3"
    unit: "inches",
    sampleSize: 0,
    source: "industry standard",
  },
  {
    division: "D2",
    position: "OL",
    metric: "weight",
    minimumValue: 250,
    averageValue: 275,
    eliteValue: 295,
    unit: "lbs",
    sampleSize: 0,
    source: "industry standard",
  },
  // 40-yard dash thresholds (OL specific — slower is fine)
  {
    division: "D1 FBS Power",
    position: "OL",
    metric: "40yd",
    minimumValue: 5.6,
    averageValue: 5.3,
    eliteValue: 5.0,
    unit: "seconds",
    sampleSize: 0,
    source: "industry standard",
  },
  {
    division: "D1 FBS Group of 5",
    position: "OL",
    metric: "40yd",
    minimumValue: 5.7,
    averageValue: 5.4,
    eliteValue: 5.1,
    unit: "seconds",
    sampleSize: 0,
    source: "industry standard",
  },
  {
    division: "D1 FCS",
    position: "OL",
    metric: "40yd",
    minimumValue: 5.8,
    averageValue: 5.5,
    eliteValue: 5.2,
    unit: "seconds",
    sampleSize: 0,
    source: "industry standard",
  },
  // Bench press thresholds
  {
    division: "D1 FBS Power",
    position: "OL",
    metric: "bench",
    minimumValue: 275,
    averageValue: 315,
    eliteValue: 365,
    unit: "lbs",
    sampleSize: 0,
    source: "industry standard",
  },
  {
    division: "D1 FBS Group of 5",
    position: "OL",
    metric: "bench",
    minimumValue: 255,
    averageValue: 300,
    eliteValue: 345,
    unit: "lbs",
    sampleSize: 0,
    source: "industry standard",
  },
  // Squat thresholds
  {
    division: "D1 FBS Power",
    position: "OL",
    metric: "squat",
    minimumValue: 365,
    averageValue: 425,
    eliteValue: 500,
    unit: "lbs",
    sampleSize: 0,
    source: "industry standard",
  },
  {
    division: "D1 FBS Group of 5",
    position: "OL",
    metric: "squat",
    minimumValue: 345,
    averageValue: 400,
    eliteValue: 475,
    unit: "lbs",
    sampleSize: 0,
    source: "industry standard",
  },
];

const staticTimelines: RecruitingTimeline[] = [
  {
    division: "D1 FBS Power Conference",
    avgMonthsFromContactToOffer: 12,
    typicalOfferMonths: ["June (after camps)", "September (after evaluation)", "January (official visits)"],
    earlySignalMonths: ["April (spring eval)", "June (camp season)"],
    notes: "Big Ten/Big 12 programs typically evaluate at junior day events and summer camps before extending offers. Most FBS OL offers come between junior camp season and senior fall.",
  },
  {
    division: "D1 FBS Group of 5 (MAC)",
    avgMonthsFromContactToOffer: 8,
    typicalOfferMonths: ["June (camps)", "August (fall camp)", "November (senior year)"],
    earlySignalMonths: ["March (spring practice)", "June (camp)"],
    notes: "MAC programs often extend offers earlier in the cycle as they compete with larger programs for prospects. Camp performance is the primary evaluation tool.",
  },
  {
    division: "D1 FCS (MVFC, etc.)",
    avgMonthsFromContactToOffer: 6,
    typicalOfferMonths: ["June (camps)", "September (early season)", "December (early signing)"],
    earlySignalMonths: ["May (spring eval)", "June (camp)"],
    notes: "FCS programs move quickly on prospects they identify. Social media engagement and film review often precede camp invites. NDSU, SDSU scout Wisconsin proactively.",
  },
  {
    division: "D2 (GLIAC, NSIC)",
    avgMonthsFromContactToOffer: 4,
    typicalOfferMonths: ["Any month — D2 programs offer year-round"],
    earlySignalMonths: ["Profile view on NCSA", "DM or follow on X"],
    notes: "D2 programs have fewer restrictions and offer earlier. NCSA profile views and social media follows are strong interest signals. Jacob should expect D2 interest first.",
  },
];

const staticCampPipeline: CampToOfferData[] = [
  {
    campType: "University Summer Camp",
    avgConversionRate: 8,
    bestMonths: ["June", "July"],
    description: "School-hosted camps where coaches directly evaluate and instruct prospects. Primary pipeline for offers at all levels.",
    jacobRecommendation: "Attend camps at 3-5 target schools each summer. Prioritize Iowa, Wisconsin, and MAC schools where OL is a need. Arrive with verified measurables.",
  },
  {
    campType: "Prospect Day / Junior Day",
    avgConversionRate: 12,
    bestMonths: ["March", "April"],
    description: "Invite-only events for targeted prospects. Being invited is already a strong interest signal. Often precedes an offer by 1-3 months.",
    jacobRecommendation: "Accept every Junior Day invite. These are pre-offer evaluation events. Build relationships with position coaches during the visit.",
  },
  {
    campType: "Regional Combine / Showcase",
    avgConversionRate: 5,
    bestMonths: ["May", "June", "January"],
    description: "Third-party events (Rivals, 247Sports camps) where multiple schools' coaches evaluate prospects. Good for exposure to programs not on the camp schedule.",
    jacobRecommendation: "Attend 1-2 regional showcases per year for exposure. Verified measurables from these events carry weight with all programs.",
  },
  {
    campType: "Satellite Camp",
    avgConversionRate: 6,
    bestMonths: ["June"],
    description: "Camps hosted by one school on another school's campus, allowing broader geographic reach. Common in the Midwest.",
    jacobRecommendation: "Watch for FBS satellite camps held in Wisconsin. These are opportunities to get evaluated without travel costs. Iowa and Minnesota frequently host nearby.",
  },
  {
    campType: "Position-Specific Camp (OL/DL)",
    avgConversionRate: 15,
    bestMonths: ["June", "July"],
    description: "Intensive camps focused on OL/DL techniques. Coaches evaluate technique, feet, and coachability. Highest conversion rate because coaches spend individual time with each prospect.",
    jacobRecommendation: "Top priority. OL-specific camps show coaches exactly what they need to see: footwork, hand placement, and coachability. These have the highest offer conversion rate.",
  },
];

// ─── CFBD Data Enrichment ─────────────────────────────────────────────────────

/**
 * Search CFBD recruiting data for players from the Pewaukee/Waukesha County area.
 */
async function searchAreaRecruits(yearsBack: number = YEARS_TO_SCAN): Promise<AreaRecruitingRecord[]> {
  if (!process.env.CFBD_API_KEY) return [];

  const currentYear = new Date().getFullYear();
  const areaRecruits: AreaRecruitingRecord[] = [];

  for (let year = currentYear; year > currentYear - yearsBack; year--) {
    try {
      // Search for all recruits — we'll filter by location
      const recruits = await getRecruitingPlayers(year);

      for (const r of recruits) {
        // Check if the recruit is from the Pewaukee/Waukesha County area
        if (
          r.state_province === "WI" &&
          r.city &&
          WISCONSIN_AREA_CITIES.some(
            (city) => r.city?.toLowerCase().includes(city.toLowerCase())
          )
        ) {
          areaRecruits.push({
            playerName: r.name,
            highSchool: r.school,
            city: r.city,
            state: r.state_province,
            position: r.position,
            committedTo: r.committed_to,
            division: null, // Would need additional lookup
            classYear: r.year,
            stars: r.stars,
            rating: r.rating,
          });
        }
      }
    } catch {
      // Non-fatal — skip year
    }
  }

  return areaRecruits;
}

/**
 * Enrich measurable thresholds with actual CFBD roster data.
 * Samples current OL rosters from target schools to validate
 * and update the static thresholds.
 */
async function enrichMeasurableThresholds(
  staticThresholds: MeasurableThreshold[]
): Promise<MeasurableThreshold[]> {
  if (!process.env.CFBD_API_KEY) return staticThresholds;

  const enriched = [...staticThresholds];

  // Sample a few target schools per division to get actual roster sizes
  const divisionSamples: Record<string, { heights: number[]; weights: number[] }> = {};

  const sampleSchools = targetSchools.slice(0, 8); // Limit API calls
  for (const school of sampleSchools) {
    try {
      const roster = await getOLRoster(school.name);

      const divKey = school.division.includes("FBS")
        ? school.conference === "Big Ten" || school.conference === "Big 12"
          ? "D1 FBS Power"
          : "D1 FBS Group of 5"
        : school.division.includes("FCS")
          ? "D1 FCS"
          : "D2";

      if (!divisionSamples[divKey]) {
        divisionSamples[divKey] = { heights: [], weights: [] };
      }

      for (const player of roster) {
        if (player.height) divisionSamples[divKey].heights.push(player.height);
        if (player.weight) divisionSamples[divKey].weights.push(player.weight);
      }
    } catch {
      // Non-fatal
    }
  }

  // Update thresholds with actual data where available
  for (const threshold of enriched) {
    const sample = divisionSamples[threshold.division];
    if (!sample) continue;

    if (threshold.metric === "height" && sample.heights.length > 0) {
      const sorted = [...sample.heights].sort((a, b) => a - b);
      threshold.minimumValue = sorted[0];
      threshold.averageValue = Math.round(
        sorted.reduce((s, v) => s + v, 0) / sorted.length
      );
      threshold.eliteValue = sorted[sorted.length - 1];
      threshold.sampleSize = sorted.length;
      threshold.source = "cfbd_roster";
    }

    if (threshold.metric === "weight" && sample.weights.length > 0) {
      const sorted = [...sample.weights].sort((a, b) => a - b);
      threshold.minimumValue = sorted[0];
      threshold.averageValue = Math.round(
        sorted.reduce((s, v) => s + v, 0) / sorted.length
      );
      threshold.eliteValue = sorted[sorted.length - 1];
      threshold.sampleSize = sorted.length;
      threshold.source = "cfbd_roster";
    }
  }

  return enriched;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Get comprehensive historical recruiting patterns analysis.
 * Combines CFBD live data with static industry knowledge.
 * Cached for 6 hours.
 */
export async function getHistoricalRecruitingPatterns(): Promise<HistoricalRecruitingPatterns> {
  // Check cache
  if (cachedPatterns && Date.now() - cachedPatterns.cachedAt < CACHE_TTL_MS) {
    return cachedPatterns.data;
  }

  let dataSource: "cfbd" | "static" | "mixed" = "static";
  let areaHistory: AreaRecruitingRecord[] = [];
  let measurableThresholds = [...staticMeasurableThresholds];

  if (process.env.CFBD_API_KEY) {
    try {
      // Search for area recruits
      areaHistory = await searchAreaRecruits();

      // Enrich thresholds with live roster data
      measurableThresholds = await enrichMeasurableThresholds(staticMeasurableThresholds);

      dataSource = areaHistory.length > 0 ? "mixed" : "static";
      if (measurableThresholds.some((t) => t.source === "cfbd_roster")) {
        dataSource = "mixed";
      }
    } catch {
      // Fall back to static data
    }
  }

  // Generate insights
  const insights = generateInsights(areaHistory, measurableThresholds);

  const result: HistoricalRecruitingPatterns = {
    areaHistory,
    measurableThresholds,
    timelines: staticTimelines,
    campPipeline: staticCampPipeline,
    insights,
    dataSource,
    analyzedAt: new Date().toISOString(),
  };

  cachedPatterns = { data: result, cachedAt: Date.now() };
  return result;
}

/**
 * Get area recruiting history specifically — which schools have recruited
 * from the Pewaukee/Waukesha County area.
 */
export async function getAreaRecruitingHistory(): Promise<AreaRecruitingRecord[]> {
  const patterns = await getHistoricalRecruitingPatterns();
  return patterns.areaHistory;
}

/**
 * Get measurable thresholds for OL prospects at each division level.
 * Useful for setting training targets and benchmarking Jacob's progress.
 */
export async function getMeasurableThresholds(): Promise<MeasurableThreshold[]> {
  const patterns = await getHistoricalRecruitingPatterns();
  return patterns.measurableThresholds;
}

/**
 * Get recruiting timelines by division.
 */
export function getRecruitingTimelines(): RecruitingTimeline[] {
  return [...staticTimelines];
}

/**
 * Get camp-to-offer pipeline analysis.
 */
export function getCampPipelineAnalysis(): CampToOfferData[] {
  return [...staticCampPipeline];
}

// ─── Insight Generation ───────────────────────────────────────────────────────

function generateInsights(
  areaHistory: AreaRecruitingRecord[],
  thresholds: MeasurableThreshold[]
): string[] {
  const insights: string[] = [];

  // Jacob's profile vs thresholds
  const jacobHeight = 76; // 6'4" = 76 inches
  const jacobWeight = 285;

  // Check each division
  for (const division of ["D1 FBS Power", "D1 FBS Group of 5", "D1 FCS", "D2"]) {
    const heightThreshold = thresholds.find(
      (t) => t.division === division && t.metric === "height"
    );
    const weightThreshold = thresholds.find(
      (t) => t.division === division && t.metric === "weight"
    );

    if (heightThreshold && weightThreshold) {
      const meetsHeight = jacobHeight >= heightThreshold.minimumValue;
      const meetsWeight = jacobWeight >= weightThreshold.minimumValue;
      const exceedsAvgHeight = jacobHeight >= heightThreshold.averageValue;
      const exceedsAvgWeight = jacobWeight >= weightThreshold.averageValue;

      if (meetsHeight && meetsWeight) {
        if (exceedsAvgHeight && exceedsAvgWeight) {
          insights.push(
            `Jacob EXCEEDS average ${division} OL measurables (height: ${jacobHeight}" vs avg ${heightThreshold.averageValue}", weight: ${jacobWeight} vs avg ${weightThreshold.averageValue} lbs). Strong physical profile for this division.`
          );
        } else {
          insights.push(
            `Jacob MEETS minimum ${division} OL thresholds but is below average in some areas. Continued development before junior year camps is important.`
          );
        }
      } else {
        const gaps: string[] = [];
        if (!meetsHeight) gaps.push(`height (needs ${heightThreshold.minimumValue}", currently ${jacobHeight}")`);
        if (!meetsWeight) gaps.push(`weight (needs ${weightThreshold.minimumValue} lbs, currently ${jacobWeight})`);
        insights.push(
          `Jacob has gaps for ${division} OL minimums: ${gaps.join(", ")}. Focus on ${!meetsWeight ? "strength/weight gain" : "vertical growth"}.`
        );
      }
    }
  }

  // Area recruiting insights
  if (areaHistory.length > 0) {
    const schools = [...new Set(areaHistory.map((r) => r.committedTo).filter(Boolean))];
    insights.push(
      `${areaHistory.length} recruits from the Pewaukee/Waukesha County area in the past ${YEARS_TO_SCAN} years. Schools that recruited from this area: ${schools.join(", ")}.`
    );

    const olRecruits = areaHistory.filter((r) => r.position && OL_POSITIONS.has(r.position.toUpperCase()));
    if (olRecruits.length > 0) {
      insights.push(
        `${olRecruits.length} OL prospects from the area were recruited in the past ${YEARS_TO_SCAN} years — there is a pipeline here that Jacob can leverage.`
      );
    }
  } else {
    insights.push(
      "No CFBD data available for area recruiting history. Configure CFBD_API_KEY for live historical analysis, or check 247Sports/Rivals manually."
    );
  }

  // Camp strategy insight
  insights.push(
    "Position-specific OL camps have the highest offer conversion rate (15%). Jacob should prioritize OL-specific camps at target schools over general combines."
  );

  // Timeline insight
  insights.push(
    "D2 programs offer year-round. FCS offers typically come 6 months after first contact. FBS Group of 5 (MAC) takes about 8 months. Expect Jacob's first offers from D2/FCS programs."
  );

  return insights;
}

/**
 * Knowledge context injection for the REC team personas.
 */
export async function getKnowledgeContext(): Promise<string> {
  const patterns = await getHistoricalRecruitingPatterns();
  const lines: string[] = [];

  lines.push("=== RECRUITING PATTERNS ANALYSIS ===\n");
  lines.push(`Data source: ${patterns.dataSource}`);
  lines.push(`Analyzed at: ${patterns.analyzedAt}\n`);

  // Measurable thresholds summary
  lines.push("JACOB vs DIVISION MEASURABLE THRESHOLDS:");
  for (const insight of patterns.insights.slice(0, 4)) {
    lines.push(`  - ${insight}`);
  }

  // Timelines
  lines.push("\nRECRUITING TIMELINES BY DIVISION:");
  for (const t of patterns.timelines) {
    lines.push(`  ${t.division}: ~${t.avgMonthsFromContactToOffer} months from contact to offer`);
    lines.push(`    Typical offer months: ${t.typicalOfferMonths.join(", ")}`);
  }

  // Camp pipeline
  lines.push("\nCAMP-TO-OFFER PIPELINE:");
  for (const camp of patterns.campPipeline) {
    lines.push(`  ${camp.campType}: ${camp.avgConversionRate}% conversion rate`);
    lines.push(`    Recommendation: ${camp.jacobRecommendation}`);
  }

  // Area history
  if (patterns.areaHistory.length > 0) {
    lines.push(`\nAREA RECRUITING HISTORY (Pewaukee/Waukesha County):`);
    lines.push(`  ${patterns.areaHistory.length} recruits found in past ${YEARS_TO_SCAN} years`);
    for (const r of patterns.areaHistory.slice(0, 5)) {
      lines.push(`  - ${r.playerName} (${r.position}, ${r.highSchool}) -> ${r.committedTo ?? "uncommitted"} (Class of ${r.classYear})`);
    }
  }

  return lines.join("\n");
}
