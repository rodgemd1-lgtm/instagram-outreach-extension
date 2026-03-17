import { describe, it, expect } from "vitest";

describe("Scraper orchestrator", () => {
  it("exports scrapeWithFallback function", async () => {
    const mod = await import("@/lib/scraper-engines/orchestrator");
    expect(mod.scrapeWithFallback).toBeTypeOf("function");
  });
  it("exports ENGINE_PRIORITY array", async () => {
    const mod = await import("@/lib/scraper-engines/orchestrator");
    expect(mod.ENGINE_PRIORITY).toEqual(["firecrawl", "jina", "playwright"]);
  });
  it("exports scrapeCoachesForSchool function", async () => {
    const mod = await import("@/lib/scraper-engines/orchestrator");
    expect(mod.scrapeCoachesForSchool).toBeTypeOf("function");
  });
  it("exports scrapeResearchArticle function", async () => {
    const mod = await import("@/lib/scraper-engines/orchestrator");
    expect(mod.scrapeResearchArticle).toBeTypeOf("function");
  });
});
