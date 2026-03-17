import { describe, it, expect } from "vitest";

describe("Scraper storage", () => {
  it("exports storeCoach function", async () => {
    const mod = await import("@/lib/scraper-engines/storage");
    expect(mod.storeCoach).toBeTypeOf("function");
  });
  it("exports storeResearchArticle function", async () => {
    const mod = await import("@/lib/scraper-engines/storage");
    expect(mod.storeResearchArticle).toBeTypeOf("function");
  });
  it("exports storeDiscoveryResult function", async () => {
    const mod = await import("@/lib/scraper-engines/storage");
    expect(mod.storeDiscoveryResult).toBeTypeOf("function");
  });
  it("exports updateArticleEnrichment function", async () => {
    const mod = await import("@/lib/scraper-engines/storage");
    expect(mod.updateArticleEnrichment).toBeTypeOf("function");
  });
  it("exports getScrapingStats function", async () => {
    const mod = await import("@/lib/scraper-engines/storage");
    expect(mod.getScrapingStats).toBeTypeOf("function");
  });
});
