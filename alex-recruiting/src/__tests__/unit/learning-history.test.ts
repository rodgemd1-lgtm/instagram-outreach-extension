import { describe, it, expect } from "vitest";
import { learningHistoryMock } from "@/lib/data/learning-history-mock";

describe("learning history mock", () => {
  it("has 4 weeks of history", () => {
    expect(learningHistoryMock).toHaveLength(4);
  });

  it("weeks are sequential", () => {
    for (let i = 1; i < learningHistoryMock.length; i++) {
      expect(learningHistoryMock[i].week_number).toBeGreaterThan(
        learningHistoryMock[i - 1].week_number
      );
    }
  });

  it("metrics show progression", () => {
    for (let i = 1; i < learningHistoryMock.length; i++) {
      expect(
        learningHistoryMock[i].metrics.followers
      ).toBeGreaterThanOrEqual(learningHistoryMock[i - 1].metrics.followers);
    }
  });

  it("every week has all required fields", () => {
    learningHistoryMock.forEach((w) => {
      expect(w.what_worked.length).toBeGreaterThan(0);
      expect(w.what_didnt.length).toBeGreaterThan(0);
      expect(w.what_to_try.length).toBeGreaterThan(0);
      expect(w.metrics.followers).toBeGreaterThanOrEqual(0);
    });
  });
});
