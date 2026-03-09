import { describe, it, expect } from "vitest";

describe("Research tables schema", () => {
  it("exports researchArticles table", async () => {
    const { researchArticles } = await import("@/lib/db/schema");
    expect(researchArticles).toBeDefined();
  });

  it("exports researchFindings table", async () => {
    const { researchFindings } = await import("@/lib/db/schema");
    expect(researchFindings).toBeDefined();
  });

  it("researchArticles has AI enrichment columns", async () => {
    const { researchArticles } = await import("@/lib/db/schema");
    const table = researchArticles as Record<string, unknown>;
    expect(table).toHaveProperty("aiSummary");
    expect(table).toHaveProperty("aiInsights");
    expect(table).toHaveProperty("aiRelevanceScore");
  });
});
