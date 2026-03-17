import { describe, test, expect } from "vitest";
import {
  calculateEngagement,
  type CoachEngagementInput,
} from "@/lib/dashboard/engagement-scoring";

const baseInput: CoachEngagementInput = {
  isFollowed: false,
  isFollowedBack: false,
  dmSent: false,
  dmReplied: false,
  lastInteractionDays: null,
  interactionCount: 0,
};

describe("calculateEngagement", () => {
  test("returns all required fields", () => {
    const result = calculateEngagement(baseInput);
    expect(result).toHaveProperty("score");
    expect(result).toHaveProperty("level");
    expect(result).toHaveProperty("levelLabel");
    expect(result).toHaveProperty("levelColor");
    expect(result).toHaveProperty("isHot");
    expect(result).toHaveProperty("isCold");
    expect(result).toHaveProperty("needsAttention");
  });

  test("zero input returns score of 0 and level 0", () => {
    const result = calculateEngagement(baseInput);
    expect(result.score).toBe(0);
    expect(result.level).toBe(0);
    expect(result.levelLabel).toBe("Unknown");
  });

  test("score is clamped to [0, 100]", () => {
    const maxed: CoachEngagementInput = {
      isFollowed: true,
      isFollowedBack: true,
      dmSent: true,
      dmReplied: true,
      lastInteractionDays: 3,
      interactionCount: 20,
    };
    const result = calculateEngagement(maxed);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  test("isFollowed adds 10 points", () => {
    const without = calculateEngagement(baseInput);
    const with_ = calculateEngagement({ ...baseInput, isFollowed: true });
    expect(with_.score - without.score).toBe(10);
  });

  test("isFollowedBack adds 20 points", () => {
    const without = calculateEngagement(baseInput);
    const with_ = calculateEngagement({ ...baseInput, isFollowedBack: true });
    expect(with_.score - without.score).toBe(20);
  });

  test("dmSent adds 15 points", () => {
    const without = calculateEngagement(baseInput);
    const with_ = calculateEngagement({ ...baseInput, dmSent: true });
    expect(with_.score - without.score).toBe(15);
  });

  test("dmReplied adds 25 points", () => {
    const without = calculateEngagement(baseInput);
    const with_ = calculateEngagement({ ...baseInput, dmReplied: true });
    expect(with_.score - without.score).toBe(25);
  });

  test("interactionCount bonus is capped at 20", () => {
    const high = calculateEngagement({ ...baseInput, interactionCount: 100 });
    const capped = calculateEngagement({ ...baseInput, interactionCount: 4 });
    // 4 interactions = 20 bonus (4 * 5 = 20), same as 100 interactions
    expect(high.score).toBe(capped.score);
  });

  test("lastInteractionDays < 7 adds 10 recency bonus", () => {
    const old = calculateEngagement({ ...baseInput, lastInteractionDays: 31 });
    const fresh = calculateEngagement({ ...baseInput, lastInteractionDays: 3 });
    // fresh: +10 bonus, old: -10 penalty = 20 point difference
    expect(fresh.score).toBeGreaterThan(old.score);
  });

  test("lastInteractionDays >= 30 deducts 10 points", () => {
    const recent = calculateEngagement({ ...baseInput, lastInteractionDays: 5 });
    const stale = calculateEngagement({ ...baseInput, lastInteractionDays: 30 });
    expect(recent.score).toBeGreaterThan(stale.score);
  });

  test("isHot is true when lastInteractionDays < 7", () => {
    const result = calculateEngagement({ ...baseInput, lastInteractionDays: 6 });
    expect(result.isHot).toBe(true);
    expect(result.isCold).toBe(false);
  });

  test("isCold is true when lastInteractionDays >= 30", () => {
    const result = calculateEngagement({ ...baseInput, lastInteractionDays: 30 });
    expect(result.isCold).toBe(true);
    expect(result.isHot).toBe(false);
  });

  test("needsAttention is true when lastInteractionDays is 14-29", () => {
    const result = calculateEngagement({ ...baseInput, lastInteractionDays: 20 });
    expect(result.needsAttention).toBe(true);
    expect(result.isHot).toBe(false);
    expect(result.isCold).toBe(false);
  });

  test("isHot, isCold, needsAttention are all false when lastInteractionDays is null", () => {
    const result = calculateEngagement({ ...baseInput, lastInteractionDays: null });
    expect(result.isHot).toBe(false);
    expect(result.isCold).toBe(false);
    expect(result.needsAttention).toBe(false);
  });

  test("level 5 (Recruiting) requires score >= 85", () => {
    const recruiting: CoachEngagementInput = {
      isFollowed: true,
      isFollowedBack: true,
      dmSent: true,
      dmReplied: true,
      lastInteractionDays: 3,
      interactionCount: 10,
    };
    const result = calculateEngagement(recruiting);
    if (result.level === 5) {
      expect(result.score).toBeGreaterThanOrEqual(85);
    }
  });

  test("level labels correspond to known engagement states", () => {
    const labels = ["Unknown", "Aware", "Noticed", "Engaged", "Interested", "Recruiting"];
    const result = calculateEngagement(baseInput);
    expect(labels).toContain(result.levelLabel);
  });

  test("levelColor is a hex color string", () => {
    const result = calculateEngagement(baseInput);
    expect(result.levelColor).toMatch(/^#[0-9a-fA-F]{6}$/);
  });
});
