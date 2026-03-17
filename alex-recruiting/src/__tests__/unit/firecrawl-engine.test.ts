import { describe, it, expect } from "vitest";

describe("Firecrawl engine", () => {
  it("exports scrapeUrl function", async () => {
    const mod = await import("@/lib/scraper-engines/firecrawl-engine");
    expect(mod.scrapeUrl).toBeTypeOf("function");
  }, 30_000);
  it("exports scrapeCoachingStaffPage function", async () => {
    const mod = await import("@/lib/scraper-engines/firecrawl-engine");
    expect(mod.scrapeCoachingStaffPage).toBeTypeOf("function");
  });
  it("exports scrapeRosterPage function", async () => {
    const mod = await import("@/lib/scraper-engines/firecrawl-engine");
    expect(mod.scrapeRosterPage).toBeTypeOf("function");
  });
  it("exports scrapeArticle function", async () => {
    const mod = await import("@/lib/scraper-engines/firecrawl-engine");
    expect(mod.scrapeArticle).toBeTypeOf("function");
  });
});
