import type { Coach, PriorityTier } from "../types";
import { targetSchools } from "../data/target-schools";

interface CoachScoreFactors {
  divisionWeight: number;
  olNeedScore: number;
  xActivityScore: number;
  geographyBonus: number;
  dmOpenBonus: number;
}

// Weight factors for coach priority scoring
const WEIGHTS = {
  division: 0.25,
  olNeed: 0.25,
  xActivity: 0.20,
  geography: 0.15,
  dmOpen: 0.15,
};

// Division tier scoring (higher = more likely to engage)
const DIVISION_SCORES: Record<string, number> = {
  "D2": 5,        // Most likely to DM, follow back, engage early
  "D1 FCS": 4,    // Active on X, recruit early
  "D1 FBS": 2,    // Lower early response but high brand value
  "D3": 4,
  "NAIA": 5,
};

// Wisconsin proximity scoring
const GEOGRAPHY_SCORES: Record<string, number> = {
  "Big Ten": 5,
  "MAC": 4,
  "Missouri Valley": 4,
  "GLIAC": 3,
  "NSIC": 4,
  "Big 12": 3,
};

export function scoreCoach(coach: Partial<Coach>): number {
  const factors: CoachScoreFactors = {
    divisionWeight: DIVISION_SCORES[coach.division || ""] || 1,
    olNeedScore: coach.olNeedScore || 0,
    xActivityScore: coach.xActivityScore || 0,
    geographyBonus: GEOGRAPHY_SCORES[coach.conference || ""] || 1,
    dmOpenBonus: coach.dmOpen ? 5 : 0,
  };

  const score =
    factors.divisionWeight * WEIGHTS.division +
    factors.olNeedScore * WEIGHTS.olNeed +
    factors.xActivityScore * WEIGHTS.xActivity +
    factors.geographyBonus * WEIGHTS.geography +
    factors.dmOpenBonus * WEIGHTS.dmOpen;

  return Math.round(score * 100) / 100;
}

export function rankCoaches(coaches: Partial<Coach>[]): Partial<Coach>[] {
  return [...coaches].sort((a, b) => scoreCoach(b) - scoreCoach(a));
}

export function getCoachDMPriority(coach: Partial<Coach>): {
  priority: "immediate" | "30_days" | "60_days" | "90_days" | "year_2";
  reason: string;
} {
  if (coach.priorityTier === "Tier 3") {
    return { priority: "immediate", reason: "D2/NAIA coaches actively recruit on X, open DMs, fast movers" };
  }

  const school = targetSchools.find((s) => s.name === coach.schoolName);
  if (school) {
    if (school.dmTimeline.includes("Day 1")) return { priority: "immediate", reason: school.olNeedSignal };
    if (school.dmTimeline.includes("30 days")) return { priority: "30_days", reason: school.olNeedSignal };
    if (school.dmTimeline.includes("60 days")) return { priority: "60_days", reason: school.olNeedSignal };
    if (school.dmTimeline.includes("90 days")) return { priority: "90_days", reason: school.olNeedSignal };
    if (school.dmTimeline.includes("Yr 2")) return { priority: "year_2", reason: school.olNeedSignal };
  }

  return { priority: "90_days", reason: "Default timeline" };
}

export function getTierForDivision(division: string, conference: string): PriorityTier {
  if (division === "D1 FBS" && (conference === "Big Ten" || conference === "Big 12")) return "Tier 1";
  if (division === "D1 FBS" && conference === "MAC") return "Tier 2";
  if (division === "D1 FCS") return "Tier 2";
  if (division === "D2" || division === "D3" || division === "NAIA") return "Tier 3";
  return "Tier 2";
}
