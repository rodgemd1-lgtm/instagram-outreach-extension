import { describe, test, expect } from "vitest";
import {
  calculateReadinessScore,
  type ReadinessInput,
} from "@/lib/dashboard/readiness-score";

const baseInput: ReadinessInput = {
  totalCoaches: 20,
  coachesContacted: 6,
  coachesReplied: 2,
  postsThisWeek: 3,
  postsTarget: 5,
  profileViews: 25,
  filmViewCount: 100,
  daysOnPlatform: 30,
};

describe("calculateReadinessScore", () => {
  test("returns all required fields", () => {
    const result = calculateReadinessScore(baseInput);
    expect(result).toHaveProperty("overall");
    expect(result).toHaveProperty("outreach");
    expect(result).toHaveProperty("content");
    expect(result).toHaveProperty("visibility");
    expect(result).toHaveProperty("network");
    expect(result).toHaveProperty("grade");
  });

  test("overall score is between 0 and 100", () => {
    const result = calculateReadinessScore(baseInput);
    expect(result.overall).toBeGreaterThanOrEqual(0);
    expect(result.overall).toBeLessThanOrEqual(100);
  });

  test("all sub-scores are between 0 and 100", () => {
    const result = calculateReadinessScore(baseInput);
    expect(result.outreach).toBeGreaterThanOrEqual(0);
    expect(result.outreach).toBeLessThanOrEqual(100);
    expect(result.content).toBeGreaterThanOrEqual(0);
    expect(result.content).toBeLessThanOrEqual(100);
    expect(result.visibility).toBeGreaterThanOrEqual(0);
    expect(result.visibility).toBeLessThanOrEqual(100);
    expect(result.network).toBeGreaterThanOrEqual(0);
    expect(result.network).toBeLessThanOrEqual(100);
  });

  test("all-zero input returns F grade", () => {
    const zeroes: ReadinessInput = {
      totalCoaches: 0,
      coachesContacted: 0,
      coachesReplied: 0,
      postsThisWeek: 0,
      postsTarget: 5,
      profileViews: 0,
      filmViewCount: 0,
      daysOnPlatform: 0,
    };
    const result = calculateReadinessScore(zeroes);
    expect(result.grade).toBe("F");
    expect(result.overall).toBe(0);
  });

  test("maxed-out input returns S grade", () => {
    const maxed: ReadinessInput = {
      totalCoaches: 10,
      coachesContacted: 10,
      coachesReplied: 10,
      postsThisWeek: 10,
      postsTarget: 5,
      profileViews: 100,
      filmViewCount: 500,
      daysOnPlatform: 365,
    };
    const result = calculateReadinessScore(maxed);
    expect(result.grade).toBe("S");
  });

  test("grade S requires overall >= 90", () => {
    const highInput: ReadinessInput = {
      totalCoaches: 5,
      coachesContacted: 5,
      coachesReplied: 5,
      postsThisWeek: 10,
      postsTarget: 5,
      profileViews: 100,
      filmViewCount: 500,
      daysOnPlatform: 100,
    };
    const result = calculateReadinessScore(highInput);
    if (result.grade === "S") {
      expect(result.overall).toBeGreaterThanOrEqual(90);
    }
  });

  test("more posts this week means higher content score", () => {
    const few = calculateReadinessScore({ ...baseInput, postsThisWeek: 1 });
    const many = calculateReadinessScore({ ...baseInput, postsThisWeek: 5 });
    expect(many.content).toBeGreaterThan(few.content);
  });

  test("more coach replies means higher network score", () => {
    const low = calculateReadinessScore({ ...baseInput, coachesReplied: 0 });
    const high = calculateReadinessScore({ ...baseInput, coachesReplied: 5 });
    expect(high.network).toBeGreaterThan(low.network);
  });

  test("more profile views increases visibility score", () => {
    const low = calculateReadinessScore({ ...baseInput, profileViews: 0, filmViewCount: 0 });
    const high = calculateReadinessScore({ ...baseInput, profileViews: 50, filmViewCount: 200 });
    expect(high.visibility).toBeGreaterThan(low.visibility);
  });

  test("score is rounded to 2 decimal places", () => {
    const result = calculateReadinessScore(baseInput);
    expect(result.overall).toBe(Math.round(result.overall * 100) / 100);
  });

  test("postsTarget of 0 does not throw (guarded division)", () => {
    expect(() =>
      calculateReadinessScore({ ...baseInput, postsTarget: 0 })
    ).not.toThrow();
  });

  test("totalCoaches of 0 does not produce NaN", () => {
    const result = calculateReadinessScore({ ...baseInput, totalCoaches: 0 });
    expect(isNaN(result.outreach)).toBe(false);
  });

  test("grade is one of the valid letter values", () => {
    const result = calculateReadinessScore(baseInput);
    expect(["S", "A", "B", "C", "D", "F"]).toContain(result.grade);
  });
});
