import { describe, it, expect } from "vitest";

describe("AI enrichment", () => {
  it("exports enrichArticle function", async () => {
    const mod = await import("@/lib/scraper-engines/ai-enrichment");
    expect(mod.enrichArticle).toBeTypeOf("function");
  });
  it("exports buildEnrichmentPrompt function", async () => {
    const mod = await import("@/lib/scraper-engines/ai-enrichment");
    expect(mod.buildEnrichmentPrompt).toBeTypeOf("function");
  });
  it("buildEnrichmentPrompt returns a string containing Jacob", async () => {
    const { buildEnrichmentPrompt } = await import("@/lib/scraper-engines/ai-enrichment");
    const prompt = buildEnrichmentPrompt("Test article about coaching", "coach_psychology");
    expect(prompt).toContain("Jacob");
    expect(prompt).toContain("offensive line");
  });
  it("exports ENRICHMENT_SCHEMA", async () => {
    const mod = await import("@/lib/scraper-engines/ai-enrichment");
    expect(mod.ENRICHMENT_SCHEMA).toBeDefined();
    expect(mod.ENRICHMENT_SCHEMA).toHaveProperty("summary");
    expect(mod.ENRICHMENT_SCHEMA).toHaveProperty("keyInsights");
    expect(mod.ENRICHMENT_SCHEMA).toHaveProperty("relevanceScore");
  });
});
