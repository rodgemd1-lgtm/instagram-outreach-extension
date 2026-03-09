import { describe, it, expect } from "vitest";

describe("Playwright engine", () => {
  it("exports scrapeDynamicPage function", async () => {
    const mod = await import("@/lib/scraper-engines/playwright-engine");
    expect(mod.scrapeDynamicPage).toBeTypeOf("function");
  }, 30_000);
  it("exports scrapeForumPage function", async () => {
    const mod = await import("@/lib/scraper-engines/playwright-engine");
    expect(mod.scrapeForumPage).toBeTypeOf("function");
  });
  it("exports scrapeWithAuth function", async () => {
    const mod = await import("@/lib/scraper-engines/playwright-engine");
    expect(mod.scrapeWithAuth).toBeTypeOf("function");
  });
  it("exports closeBrowser function", async () => {
    const mod = await import("@/lib/scraper-engines/playwright-engine");
    expect(mod.closeBrowser).toBeTypeOf("function");
  });
});
