import { describe, test, expect } from "vitest";
import {
  scoreCoach,
  rankCoaches,
  getCoachDMPriority,
  getTierForDivision,
} from "@/lib/alex/coach-ranker";
import type { Coach } from "@/lib/types";

// ─── scoreCoach ───────────────────────────────────────────────────────────────

describe("scoreCoach", () => {
  test("returns a number between 0 and some positive value", () => {
    const score = scoreCoach({ division: "D2", conference: "GLIAC" });
    expect(score).toBeGreaterThanOrEqual(0);
  });

  test("D2 coach scores higher than D1 FBS coach when all else equal", () => {
    const d2Score = scoreCoach({ division: "D2" });
    const fbsScore = scoreCoach({ division: "D1 FBS" });
    expect(d2Score).toBeGreaterThan(fbsScore);
  });

  test("NAIA coach scores higher than D1 FBS coach", () => {
    const naiaScore = scoreCoach({ division: "NAIA" });
    const fbsScore = scoreCoach({ division: "D1 FBS" });
    expect(naiaScore).toBeGreaterThan(fbsScore);
  });

  test("Big Ten conference gives geography bonus", () => {
    const bigTen = scoreCoach({ division: "D1 FBS", conference: "Big Ten" });
    const unknown = scoreCoach({ division: "D1 FBS", conference: "Unknown" });
    expect(bigTen).toBeGreaterThan(unknown);
  });

  test("dmOpen: true boosts score by 15% weight factor", () => {
    const withDMOpen = scoreCoach({ division: "D2", dmOpen: true });
    const withoutDMOpen = scoreCoach({ division: "D2", dmOpen: false });
    expect(withDMOpen).toBeGreaterThan(withoutDMOpen);
  });

  test("high olNeedScore increases total score", () => {
    const highNeed = scoreCoach({ division: "D2", olNeedScore: 10 });
    const lowNeed = scoreCoach({ division: "D2", olNeedScore: 1 });
    expect(highNeed).toBeGreaterThan(lowNeed);
  });

  test("high xActivityScore increases total score", () => {
    const active = scoreCoach({ division: "D2", xActivityScore: 10 });
    const inactive = scoreCoach({ division: "D2", xActivityScore: 0 });
    expect(active).toBeGreaterThan(inactive);
  });

  test("unknown division defaults to low base score without crashing", () => {
    expect(() => scoreCoach({ division: "Unknown" })).not.toThrow();
    const score = scoreCoach({ division: "Unknown" });
    expect(score).toBeGreaterThanOrEqual(0);
  });

  test("empty object coach does not crash", () => {
    expect(() => scoreCoach({})).not.toThrow();
  });

  test("score is rounded to 2 decimal places", () => {
    const score = scoreCoach({ division: "D2", olNeedScore: 7 });
    expect(score).toBe(Math.round(score * 100) / 100);
  });
});

// ─── rankCoaches ─────────────────────────────────────────────────────────────

describe("rankCoaches", () => {
  test("returns coaches sorted highest score first", () => {
    const coaches: Partial<Coach>[] = [
      { division: "D1 FBS", conference: "Big Ten" },
      { division: "D2", conference: "GLIAC", dmOpen: true },
      { division: "NAIA", dmOpen: true },
    ];
    const ranked = rankCoaches(coaches);
    const scores = ranked.map((c) => scoreCoach(c));
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i - 1]).toBeGreaterThanOrEqual(scores[i]);
    }
  });

  test("does not mutate the original array", () => {
    const coaches: Partial<Coach>[] = [
      { division: "D1 FBS" },
      { division: "D2" },
    ];
    const original = [...coaches];
    rankCoaches(coaches);
    expect(coaches[0]).toEqual(original[0]);
    expect(coaches[1]).toEqual(original[1]);
  });

  test("returns empty array for empty input", () => {
    expect(rankCoaches([])).toEqual([]);
  });

  test("single coach returns array with that coach", () => {
    const coach: Partial<Coach> = { division: "D2" };
    expect(rankCoaches([coach])).toHaveLength(1);
  });
});

// ─── getCoachDMPriority ───────────────────────────────────────────────────────

describe("getCoachDMPriority", () => {
  test("Tier 3 coach gets immediate priority", () => {
    const result = getCoachDMPriority({ priorityTier: "Tier 3" });
    expect(result.priority).toBe("immediate");
    expect(result.reason.length).toBeGreaterThan(0);
  });

  test("returns default 90_days priority for unknown school", () => {
    const result = getCoachDMPriority({
      priorityTier: "Tier 1",
      schoolName: "School That Does Not Exist",
    });
    expect(result.priority).toBe("90_days");
    expect(result.reason).toBe("Default timeline");
  });

  test("result always has priority and reason fields", () => {
    const result = getCoachDMPriority({});
    expect(result).toHaveProperty("priority");
    expect(result).toHaveProperty("reason");
  });
});

// ─── getTierForDivision ───────────────────────────────────────────────────────

describe("getTierForDivision", () => {
  test("D1 FBS Big Ten is Tier 1", () => {
    expect(getTierForDivision("D1 FBS", "Big Ten")).toBe("Tier 1");
  });

  test("D1 FBS Big 12 is Tier 1", () => {
    expect(getTierForDivision("D1 FBS", "Big 12")).toBe("Tier 1");
  });

  test("D1 FBS MAC is Tier 2", () => {
    expect(getTierForDivision("D1 FBS", "MAC")).toBe("Tier 2");
  });

  test("D1 FCS is Tier 2", () => {
    expect(getTierForDivision("D1 FCS", "Missouri Valley")).toBe("Tier 2");
  });

  test("D2 is Tier 3", () => {
    expect(getTierForDivision("D2", "GLIAC")).toBe("Tier 3");
  });

  test("D3 is Tier 3", () => {
    expect(getTierForDivision("D3", "MIAC")).toBe("Tier 3");
  });

  test("NAIA is Tier 3", () => {
    expect(getTierForDivision("NAIA", "NAIA")).toBe("Tier 3");
  });

  test("unknown division defaults to Tier 2", () => {
    expect(getTierForDivision("Unknown", "Unknown")).toBe("Tier 2");
  });
});
