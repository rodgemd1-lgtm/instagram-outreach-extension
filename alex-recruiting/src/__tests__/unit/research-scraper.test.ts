import { describe, it, expect } from "vitest";
import { buildResearchSources, categorizeUrl } from "@/lib/research/scraper";

describe("research scraper", () => {
  it("categorizes recruiting guide URLs as coach_psychology", () => {
    expect(categorizeUrl("https://www.ncsasports.org/how-to-get-recruited"))
      .toBe("coach_psychology");
  });

  it("categorizes hudl profile URLs as competitive_profiles", () => {
    expect(categorizeUrl("https://www.hudl.com/profile/12345"))
      .toBe("competitive_profiles");
  });

  it("categorizes reddit URLs as forum_insights", () => {
    expect(categorizeUrl("https://reddit.com/r/footballcoach/comments/abc"))
      .toBe("forum_insights");
  });

  it("builds research sources with correct data types", () => {
    const sources = buildResearchSources();
    expect(sources.length).toBeGreaterThan(0);
    expect(sources.every(s => s.urls.length > 0)).toBe(true);
    expect(sources.every(s => s.dataType)).toBe(true);
  });
});
