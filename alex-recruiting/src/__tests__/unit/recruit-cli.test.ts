import { describe, it, expect } from "vitest";

describe("Recruit CLI commands", () => {
  it("scrape-coaches exports run function", async () => {
    const mod = await import("@/lib/scraper-engines/commands/scrape-coaches");
    expect(mod.run).toBeTypeOf("function");
  });
  it("scrape-rosters exports run function", async () => {
    const mod = await import("@/lib/scraper-engines/commands/scrape-rosters");
    expect(mod.run).toBeTypeOf("function");
  });
  it("discover exports run function", async () => {
    const mod = await import("@/lib/scraper-engines/commands/discover");
    expect(mod.run).toBeTypeOf("function");
  });
  it("scrape-research exports run function", async () => {
    const mod = await import("@/lib/scraper-engines/commands/scrape-research");
    expect(mod.run).toBeTypeOf("function");
  });
  it("enrich-articles exports run function", async () => {
    const mod = await import("@/lib/scraper-engines/commands/enrich-articles");
    expect(mod.run).toBeTypeOf("function");
  });
  it("status exports run function", async () => {
    const mod = await import("@/lib/scraper-engines/commands/status");
    expect(mod.run).toBeTypeOf("function");
  });
});
