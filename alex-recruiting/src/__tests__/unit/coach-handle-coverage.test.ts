import { describe, it, expect } from "vitest";
import { wiacCoaches } from "@/lib/rec/knowledge/coach-database";

describe("WIAC Coach Handle Coverage", () => {
  it("should have X handles for at least 60% of head coaches", () => {
    const headCoaches = wiacCoaches.filter((c) => c.tier === 1);
    const withHandles = headCoaches.filter((c) => c.xHandle !== null);
    const coverage = withHandles.length / headCoaches.length;
    expect(coverage).toBeGreaterThanOrEqual(0.6);
  });

  it("should have X handles for at least 40% of all coaches", () => {
    const withHandles = wiacCoaches.filter((c) => c.xHandle !== null);
    const coverage = withHandles.length / wiacCoaches.length;
    expect(coverage).toBeGreaterThanOrEqual(0.4);
  });

  it("should not have bare TBD coach names in production data", () => {
    const tbdCoaches = wiacCoaches.filter((c) => c.name === "TBD");
    expect(tbdCoaches).toHaveLength(0);
  });

  it("all X handles should start with @", () => {
    const withHandles = wiacCoaches.filter((c) => c.xHandle !== null);
    for (const coach of withHandles) {
      expect(coach.xHandle).toMatch(/^@\w+$/);
    }
  });
});
