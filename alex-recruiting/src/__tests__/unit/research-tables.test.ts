import { describe, it, expect } from "vitest";

describe("Research tables schema", () => {
  it("exports researchArticles table with required columns", async () => {
    const { researchArticles } = await import("@/lib/db/schema");
    expect(researchArticles).toBeDefined();
    const cols = Object.keys(researchArticles);
    expect(cols.length).toBeGreaterThan(0);
  });

  it("exports researchFindings table with required columns", async () => {
    const { researchFindings } = await import("@/lib/db/schema");
    expect(researchFindings).toBeDefined();
    const cols = Object.keys(researchFindings);
    expect(cols.length).toBeGreaterThan(0);
  });

  it("researchArticles has AI enrichment columns", async () => {
    const { researchArticles } = await import("@/lib/db/schema");
    const tableConfig = researchArticles as Record<string, unknown>;
    expect(tableConfig).toHaveProperty("aiSummary");
    expect(tableConfig).toHaveProperty("aiInsights");
    expect(tableConfig).toHaveProperty("aiRelevanceScore");
  });
});
