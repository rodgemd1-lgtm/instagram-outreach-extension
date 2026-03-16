import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";

/**
 * Integration tests for coach intelligence API routes.
 *
 * These tests import route handlers directly.
 * All endpoints fall back to deterministic/mock data when external APIs
 * (Firecrawl, Exa, X API, Claude) are unavailable, so these tests
 * validate the fallback response shapes without requiring API keys.
 */

// ---------------------------------------------------------------------------
// POST /api/coaches/research
// ---------------------------------------------------------------------------
describe("POST /api/coaches/research", () => {
  it("returns success with results array", async () => {
    const { POST } = await import("@/app/api/coaches/research/route");
    const req = new NextRequest("http://localhost:3000/api/coaches/research", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(Array.isArray(data.results)).toBe(true);
  });

  it("research covers all 17 target schools when no schoolId filter", async () => {
    const { POST } = await import("@/app/api/coaches/research/route");
    const req = new NextRequest("http://localhost:3000/api/coaches/research", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(data.results.length).toBe(17);
  });

  it("each result has required fields", async () => {
    const { POST } = await import("@/app/api/coaches/research/route");
    const req = new NextRequest("http://localhost:3000/api/coaches/research", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const response = await POST(req);
    const data = await response.json();

    for (const result of data.results) {
      expect(result).toHaveProperty("schoolId");
      expect(result).toHaveProperty("schoolName");
      expect(result).toHaveProperty("coachesFound");
      expect(result).toHaveProperty("articlesFound");
      expect(result).toHaveProperty("staffUrl");
      expect(result).toHaveProperty("scrapeStatus");
      expect(result).toHaveProperty("searchStatus");

      expect(typeof result.schoolId).toBe("string");
      expect(typeof result.schoolName).toBe("string");
      expect(typeof result.coachesFound).toBe("number");
      expect(typeof result.articlesFound).toBe("number");
    }
  });

  it("includes a summary with aggregate counts", async () => {
    const { POST } = await import("@/app/api/coaches/research/route");
    const req = new NextRequest("http://localhost:3000/api/coaches/research", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(data).toHaveProperty("summary");
    expect(data.summary).toHaveProperty("schoolsResearched");
    expect(data.summary).toHaveProperty("totalCoachesFound");
    expect(data.summary).toHaveProperty("totalArticlesFound");
    expect(data.summary.schoolsResearched).toBe(17);
  });

  it("can filter by a specific schoolId", async () => {
    const { POST } = await import("@/app/api/coaches/research/route");
    const req = new NextRequest("http://localhost:3000/api/coaches/research", {
      method: "POST",
      body: JSON.stringify({ schoolId: "wisconsin" }),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.results.length).toBe(1);
    expect(data.results[0].schoolId).toBe("wisconsin");
  });

  it("returns 404 for unknown schoolId", async () => {
    const { POST } = await import("@/app/api/coaches/research/route");
    const req = new NextRequest("http://localhost:3000/api/coaches/research", {
      method: "POST",
      body: JSON.stringify({ schoolId: "nonexistent-school" }),
    });
    const response = await POST(req);
    expect(response.status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// POST /api/coaches/scrape-x
// ---------------------------------------------------------------------------
describe("POST /api/coaches/scrape-x", () => {
  it("returns success with analyses array", async () => {
    const { POST } = await import("@/app/api/coaches/scrape-x/route");
    const req = new NextRequest("http://localhost:3000/api/coaches/scrape-x", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(Array.isArray(data.analyses)).toBe(true);
  });

  it("analyzes all 17 target school X accounts", async () => {
    const { POST } = await import("@/app/api/coaches/scrape-x/route");
    const req = new NextRequest("http://localhost:3000/api/coaches/scrape-x", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(data.analyses.length).toBe(17);
  });

  it("each analysis has the expected fields", async () => {
    const { POST } = await import("@/app/api/coaches/scrape-x/route");
    const req = new NextRequest("http://localhost:3000/api/coaches/scrape-x", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const response = await POST(req);
    const data = await response.json();

    for (const analysis of data.analyses) {
      expect(analysis).toHaveProperty("schoolId");
      expect(analysis).toHaveProperty("schoolName");
      expect(analysis).toHaveProperty("xHandle");
      expect(analysis).toHaveProperty("tweetFrequency");
      expect(analysis).toHaveProperty("contentThemes");
      expect(analysis).toHaveProperty("engagementRate");
      expect(analysis).toHaveProperty("interactsWithRecruits");
      expect(analysis).toHaveProperty("peakActivityHours");
      expect(analysis).toHaveProperty("commonHashtags");
      expect(analysis).toHaveProperty("analysisStatus");

      expect(typeof analysis.tweetFrequency).toBe("number");
      expect(typeof analysis.engagementRate).toBe("number");
      expect(typeof analysis.interactsWithRecruits).toBe("boolean");
      expect(Array.isArray(analysis.contentThemes)).toBe(true);
      expect(Array.isArray(analysis.peakActivityHours)).toBe(true);
      expect(Array.isArray(analysis.commonHashtags)).toBe(true);
    }
  });

  it("includes summary with analysis counts", async () => {
    const { POST } = await import("@/app/api/coaches/scrape-x/route");
    const req = new NextRequest("http://localhost:3000/api/coaches/scrape-x", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(data).toHaveProperty("summary");
    expect(data.summary).toHaveProperty("accountsAnalyzed");
    expect(data.summary.accountsAnalyzed).toBe(17);
  });
});

// ---------------------------------------------------------------------------
// POST /api/coaches/personas
// ---------------------------------------------------------------------------
describe("POST /api/coaches/personas", () => {
  it("returns success with personas array", async () => {
    const { POST } = await import("@/app/api/coaches/personas/route");
    const req = new NextRequest("http://localhost:3000/api/coaches/personas", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(Array.isArray(data.personas)).toBe(true);
  });

  it("generates personas for all 17 target schools", async () => {
    const { POST } = await import("@/app/api/coaches/personas/route");
    const req = new NextRequest("http://localhost:3000/api/coaches/personas", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(data.personas.length).toBe(17);
  });

  it("personas have required fields: schoolName, communicationStyle, bestApproach", async () => {
    const { POST } = await import("@/app/api/coaches/personas/route");
    const req = new NextRequest("http://localhost:3000/api/coaches/personas", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const response = await POST(req);
    const data = await response.json();

    for (const persona of data.personas) {
      expect(persona).toHaveProperty("schoolName");
      expect(persona).toHaveProperty("communicationStyle");
      expect(persona).toHaveProperty("bestApproachMethod");
      expect(persona).toHaveProperty("bestApproachSteps");
      expect(persona).toHaveProperty("engagementStrategy");
      expect(persona).toHaveProperty("dmOpenProbability");
      expect(persona).toHaveProperty("followBackProbability");
      expect(persona).toHaveProperty("estimatedResponseRate");

      expect(typeof persona.schoolName).toBe("string");
      expect(typeof persona.communicationStyle).toBe("string");
      expect(typeof persona.bestApproachMethod).toBe("string");
      expect(Array.isArray(persona.bestApproachSteps)).toBe(true);
      expect(typeof persona.engagementStrategy).toBe("string");
    }
  });

  it("personas have valid probability values between 0 and 1", async () => {
    const { POST } = await import("@/app/api/coaches/personas/route");
    const req = new NextRequest("http://localhost:3000/api/coaches/personas", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const response = await POST(req);
    const data = await response.json();

    for (const persona of data.personas) {
      expect(persona.dmOpenProbability).toBeGreaterThanOrEqual(0);
      expect(persona.dmOpenProbability).toBeLessThanOrEqual(1);
      expect(persona.followBackProbability).toBeGreaterThanOrEqual(0);
      expect(persona.followBackProbability).toBeLessThanOrEqual(1);
      expect(persona.estimatedResponseRate).toBeGreaterThanOrEqual(0);
      expect(persona.estimatedResponseRate).toBeLessThanOrEqual(1);
    }
  });

  it("personas include school metadata (division, conference, tier)", async () => {
    const { POST } = await import("@/app/api/coaches/personas/route");
    const req = new NextRequest("http://localhost:3000/api/coaches/personas", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const response = await POST(req);
    const data = await response.json();

    for (const persona of data.personas) {
      expect(persona).toHaveProperty("schoolId");
      expect(persona).toHaveProperty("division");
      expect(persona).toHaveProperty("conference");
      expect(persona).toHaveProperty("priorityTier");
      expect(["Tier 1", "Tier 2", "Tier 3"]).toContain(persona.priorityTier);
    }
  });

  it("personas use deterministic source when AI is unavailable", async () => {
    const { POST } = await import("@/app/api/coaches/personas/route");
    const req = new NextRequest("http://localhost:3000/api/coaches/personas", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const response = await POST(req);
    const data = await response.json();

    // Without ANTHROPIC_API_KEY, all personas should be deterministic
    for (const persona of data.personas) {
      expect(persona).toHaveProperty("personaSource");
      expect(persona.personaSource).toBe("deterministic");
    }
  });

  it("can filter by a specific schoolId", async () => {
    const { POST } = await import("@/app/api/coaches/personas/route");
    const req = new NextRequest("http://localhost:3000/api/coaches/personas", {
      method: "POST",
      body: JSON.stringify({ schoolId: "iowa" }),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.personas.length).toBe(1);
    expect(data.personas[0].schoolId).toBe("iowa");
  });
});
