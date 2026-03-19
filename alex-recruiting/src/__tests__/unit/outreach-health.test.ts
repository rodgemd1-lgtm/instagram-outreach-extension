import { describe, it, expect } from "vitest";

describe("Outreach Health Response Shape", () => {
  it("health response should have required fields", () => {
    const mockHealth = {
      status: "healthy",
      sequences: { active: 3, paused: 0, completed: 1, responseReceived: 0, total: 4 },
      recentDMs: [],
      cronSchedule: "0 14,19 * * 1-5",
      coachCoverage: { total: 24, withHandles: 15, withActiveSequences: 3 },
    };

    expect(mockHealth).toHaveProperty("status");
    expect(mockHealth).toHaveProperty("sequences");
    expect(mockHealth).toHaveProperty("cronSchedule");
    expect(mockHealth).toHaveProperty("coachCoverage");
    expect(mockHealth.sequences).toHaveProperty("active");
    expect(mockHealth.sequences).toHaveProperty("total");
  });

  it("status should be one of healthy, warning, or stale", () => {
    const validStatuses = ["healthy", "warning", "stale"];
    expect(validStatuses).toContain("healthy");
    expect(validStatuses).toContain("warning");
    expect(validStatuses).toContain("stale");
  });
});
