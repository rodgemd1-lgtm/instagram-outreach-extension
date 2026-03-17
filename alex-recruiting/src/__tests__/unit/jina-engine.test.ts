import { describe, it, expect } from "vitest";

describe("Jina engine", () => {
  it("exports scrapeUrl function", async () => {
    const mod = await import("@/lib/scraper-engines/jina-engine");
    expect(mod.scrapeUrl).toBeTypeOf("function");
  });
  it("exports JINA_READER_PREFIX constant", async () => {
    const mod = await import("@/lib/scraper-engines/jina-engine");
    expect(mod.JINA_READER_PREFIX).toBe("https://r.jina.ai/");
  });
});
