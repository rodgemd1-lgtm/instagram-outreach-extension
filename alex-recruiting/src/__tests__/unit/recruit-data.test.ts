import { describe, it, expect } from "vitest";

describe("Recruit data fetcher", () => {
  it("exports getEnrichedSchools function", async () => {
    const mod = await import("@/lib/recruit/data-fetcher");
    expect(mod.getEnrichedSchools).toBeTypeOf("function");
  });
  it("exports getCoachSignals function", async () => {
    const mod = await import("@/lib/recruit/data-fetcher");
    expect(mod.getCoachSignals).toBeTypeOf("function");
  });
  it("exports getResearchInsights function", async () => {
    const mod = await import("@/lib/recruit/data-fetcher");
    expect(mod.getResearchInsights).toBeTypeOf("function");
  });
  it("getEnrichedSchools returns array even without DB", async () => {
    const { getEnrichedSchools } = await import("@/lib/recruit/data-fetcher");
    const result = await getEnrichedSchools();
    expect(Array.isArray(result)).toBe(true);
  });
  it("getCoachSignals returns array even without DB", async () => {
    const { getCoachSignals } = await import("@/lib/recruit/data-fetcher");
    const result = await getCoachSignals();
    expect(Array.isArray(result)).toBe(true);
  });
  it("getResearchInsights returns array even without DB", async () => {
    const { getResearchInsights } = await import("@/lib/recruit/data-fetcher");
    const result = await getResearchInsights();
    expect(Array.isArray(result)).toBe(true);
  });
});
