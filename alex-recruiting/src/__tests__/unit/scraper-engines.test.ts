import { describe, it, expect } from "vitest";

describe("Firecrawl engine", () => {
  it("exports scrapeUrl", async () => {
    const mod = await import("@/lib/scraper-engines/firecrawl-engine");
    expect(mod.scrapeUrl).toBeTypeOf("function");
  });
  it("exports scrapeCoachingStaffPage", async () => {
    const mod = await import("@/lib/scraper-engines/firecrawl-engine");
    expect(mod.scrapeCoachingStaffPage).toBeTypeOf("function");
  });
  it("exports scrapeRosterPage", async () => {
    const mod = await import("@/lib/scraper-engines/firecrawl-engine");
    expect(mod.scrapeRosterPage).toBeTypeOf("function");
  });
});

describe("Jina engine", () => {
  it("exports scrapeUrl and JINA_READER_PREFIX", async () => {
    const mod = await import("@/lib/scraper-engines/jina-engine");
    expect(mod.scrapeUrl).toBeTypeOf("function");
    expect(mod.JINA_READER_PREFIX).toBe("https://r.jina.ai/");
  });
});

describe("Exa engine", () => {
  it("exports DISCOVERY_QUERIES with 5 entries", async () => {
    const mod = await import("@/lib/scraper-engines/exa-engine");
    expect(mod.DISCOVERY_QUERIES).toHaveLength(5);
  });
  it("exports runAllDiscovery", async () => {
    const mod = await import("@/lib/scraper-engines/exa-engine");
    expect(mod.runAllDiscovery).toBeTypeOf("function");
  });
  it("exports all 5 discovery functions", async () => {
    const mod = await import("@/lib/scraper-engines/exa-engine");
    expect(mod.discoverCoachHandles).toBeTypeOf("function");
    expect(mod.discoverSchoolNeeds).toBeTypeOf("function");
    expect(mod.discoverJacobMentions).toBeTypeOf("function");
    expect(mod.discoverCompetitors).toBeTypeOf("function");
    expect(mod.discoverAnalysts).toBeTypeOf("function");
  });
});

describe("Playwright engine", () => {
  it("exports scrapeDynamicPage", async () => {
    const mod = await import("@/lib/scraper-engines/playwright-engine");
    expect(mod.scrapeDynamicPage).toBeTypeOf("function");
  });
  it("exports scrapeForumPage", async () => {
    const mod = await import("@/lib/scraper-engines/playwright-engine");
    expect(mod.scrapeForumPage).toBeTypeOf("function");
  });
  it("exports closeBrowser", async () => {
    const mod = await import("@/lib/scraper-engines/playwright-engine");
    expect(mod.closeBrowser).toBeTypeOf("function");
  });
});
