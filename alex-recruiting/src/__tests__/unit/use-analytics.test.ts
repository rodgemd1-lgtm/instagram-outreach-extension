import { describe, it, expect } from "vitest";
import { generateVisitorId, extractUtmParams, RECRUIT_SECTIONS } from "@/components/recruit/hooks/use-analytics";

describe("analytics utilities", () => {
  it("generates a consistent visitor ID format", () => {
    const id = generateVisitorId();
    expect(id).toMatch(/^v-[a-z0-9-]+$/);
    expect(id.length).toBeGreaterThan(5);
  });

  it("extracts UTM params from URL", () => {
    const params = extractUtmParams("https://example.com?utm_source=twitter&utm_medium=dm&utm_campaign=spring2026");
    expect(params.utmSource).toBe("twitter");
    expect(params.utmMedium).toBe("dm");
    expect(params.utmCampaign).toBe("spring2026");
  });

  it("returns empty strings for missing UTM params", () => {
    const params = extractUtmParams("https://example.com");
    expect(params.utmSource).toBe("");
    expect(params.utmMedium).toBe("");
    expect(params.utmCampaign).toBe("");
  });

  it("defines all recruit page sections", () => {
    expect(RECRUIT_SECTIONS).toContain("hero");
    expect(RECRUIT_SECTIONS).toContain("film-reel");
    expect(RECRUIT_SECTIONS).toContain("contact");
    expect(RECRUIT_SECTIONS.length).toBeGreaterThanOrEqual(8);
  });
});
