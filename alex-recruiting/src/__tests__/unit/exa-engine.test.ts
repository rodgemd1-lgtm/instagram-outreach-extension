import { describe, it, expect } from "vitest";

describe("Exa engine", () => {
  it("exports discoverCoachHandles function", async () => {
    const mod = await import("@/lib/scraper-engines/exa-engine");
    expect(mod.discoverCoachHandles).toBeTypeOf("function");
  });
  it("exports discoverSchoolNeeds function", async () => {
    const mod = await import("@/lib/scraper-engines/exa-engine");
    expect(mod.discoverSchoolNeeds).toBeTypeOf("function");
  });
  it("exports discoverJacobMentions function", async () => {
    const mod = await import("@/lib/scraper-engines/exa-engine");
    expect(mod.discoverJacobMentions).toBeTypeOf("function");
  });
  it("exports runAllDiscovery function", async () => {
    const mod = await import("@/lib/scraper-engines/exa-engine");
    expect(mod.runAllDiscovery).toBeTypeOf("function");
  });
  it("exports DISCOVERY_QUERIES with 5 queries", async () => {
    const mod = await import("@/lib/scraper-engines/exa-engine");
    expect(mod.DISCOVERY_QUERIES).toHaveLength(5);
  });
});
