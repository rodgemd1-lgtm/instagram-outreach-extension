import { describe, it, expect } from "vitest";
import { expandedTargetSchools } from "@/lib/data/target-schools-expanded";

describe("Coach seed data includes X handles", () => {
  const wiacSchools = expandedTargetSchools.filter((s) => s.conference === "WIAC");
  const allWiacCoaches = wiacSchools.flatMap((s) => s.coaches);

  it("WIAC schools should all be present in expanded target schools", () => {
    expect(wiacSchools.length).toBe(8);
  });

  it("seed data should include xHandle field for all coaches", () => {
    for (const coach of allWiacCoaches) {
      expect(coach).toHaveProperty("xHandle");
    }
  });

  it("coaches with xHandle should have valid format", () => {
    const withHandles = allWiacCoaches.filter((c) => c.xHandle !== null);
    expect(withHandles.length).toBeGreaterThan(0);
    for (const coach of withHandles) {
      expect(coach.xHandle).toMatch(/^@[A-Za-z0-9_]+$/);
    }
  });

  it("should not have bare TBD coach names", () => {
    const tbdCoaches = allWiacCoaches.filter((c) => c.name === "TBD");
    expect(tbdCoaches).toHaveLength(0);
  });

  it("WIAC head coaches should mostly have X handles in seed data", () => {
    const headCoaches = allWiacCoaches.filter((c) => c.title.includes("Head Coach"));
    const withHandles = headCoaches.filter((c) => c.xHandle !== null);
    expect(withHandles.length / headCoaches.length).toBeGreaterThanOrEqual(0.6);
  });
});
