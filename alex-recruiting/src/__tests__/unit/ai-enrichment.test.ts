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
  it("buildEnrichmentPrompt contains Jacob and offensive line", async () => {
    const { buildEnrichmentPrompt } = await import("@/lib/scraper-engines/ai-enrichment");
    const prompt = buildEnrichmentPrompt("Test article about coaching", "coach_psychology");
    expect(prompt).toContain("Jacob");
    expect(prompt).toContain("offensive line");
  });
  it("exports ENRICHMENT_SCHEMA with required keys", async () => {
    const { ENRICHMENT_SCHEMA } = await import("@/lib/scraper-engines/ai-enrichment");
    expect(ENRICHMENT_SCHEMA).toHaveProperty("summary");
    expect(ENRICHMENT_SCHEMA).toHaveProperty("keyInsights");
    expect(ENRICHMENT_SCHEMA).toHaveProperty("relevanceScore");
  });
});
