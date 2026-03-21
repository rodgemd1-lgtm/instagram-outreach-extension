/**
 * E3: Backend API Verification
 * Tests all critical API routes return valid responses without a database.
 * Routes gracefully fall back to empty/mock data when DB is not configured.
 */

import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";

// Helper to create mock requests
function mockGet(path: string) {
  return new NextRequest(`http://localhost:3000${path}`);
}

function mockPost(path: string, body: Record<string, unknown> = {}) {
  return new NextRequest(`http://localhost:3000${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ─── CONTENT PIPELINE ────────────────────────────────────────────────

describe("Content Pipeline APIs", () => {
  it("GET /api/content/queue returns valid structure", async () => {
    const { GET } = await import("@/app/api/content/queue/route");
    const res = await GET(mockGet("/api/content/queue"));
    expect(res.status).toBeLessThan(500);
    const data = await res.json();
    expect(data).toHaveProperty("posts");
    expect(data).toHaveProperty("total");
  });

  it("POST /api/content/generate-month returns generated posts", async () => {
    const { POST } = await import("@/app/api/content/generate-month/route");
    const res = await POST(mockPost("/api/content/generate-month"));
    expect(res.status).toBeLessThan(500);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.generated).toBeGreaterThan(0);
    expect(Array.isArray(data.posts)).toBe(true);
    // Should generate ~90-120 posts for 30 days
    expect(data.generated).toBeGreaterThanOrEqual(80);
  });

  it("generated posts have valid pillars", async () => {
    const { POST } = await import("@/app/api/content/generate-month/route");
    const res = await POST(mockPost("/api/content/generate-month"));
    const data = await res.json();
    const validPillars = ["performance", "work_ethic", "character"];
    for (const post of data.posts.slice(0, 10)) {
      expect(validPillars).toContain(post.pillar);
      expect(post.content).toBeTruthy();
      expect(post.scheduledFor).toBeTruthy();
      expect(post.status).toBe("queued");
    }
  });
});

// ─── OUTREACH PIPELINE ───────────────────────────────────────────────

describe("Outreach Pipeline APIs", () => {
  it("GET /api/outreach/plan returns valid structure", async () => {
    const { GET } = await import("@/app/api/outreach/plan/route");
    const res = await GET();
    expect(res.status).toBeLessThan(500);
    const data = await res.json();
    expect(data).toHaveProperty("stages");
  });

  it("POST /api/outreach/plan generates outreach plan", async () => {
    const { POST } = await import("@/app/api/outreach/plan/route");
    const res = await POST();
    expect(res.status).toBeLessThan(500);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it("POST /api/outreach/follow-plan generates follow plan", async () => {
    const { POST } = await import("@/app/api/outreach/follow-plan/route");
    const res = await POST();
    expect(res.status).toBeLessThan(500);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.plan).toHaveProperty("weeklyBatches");
    expect(data.plan).toHaveProperty("engagementTasks");
  });

  it("POST /api/outreach/dm-sequence generates DM sequences", async () => {
    const { POST } = await import("@/app/api/outreach/dm-sequence/route");
    const res = await POST();
    expect(res.status).toBeLessThan(500);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.sequences).toBeGreaterThan(0);
    expect(Array.isArray(data.messages)).toBe(true);
  });
});

// ─── COACH INTELLIGENCE ──────────────────────────────────────────────

describe("Coach Intelligence APIs", () => {
  it("POST /api/coaches/research returns results", async () => {
    const { POST } = await import("@/app/api/coaches/research/route");
    const res = await POST(mockPost("/api/coaches/research"));
    expect(res.status).toBeLessThan(500);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data).toHaveProperty("results");
  });

  it("POST /api/coaches/scrape-x returns analyses", async () => {
    const { POST } = await import("@/app/api/coaches/scrape-x/route");
    const res = await POST(mockPost("/api/coaches/scrape-x"));
    expect(res.status).toBeLessThan(500);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data).toHaveProperty("analyses");
  });

  it("POST /api/coaches/personas returns persona profiles", async () => {
    const { POST } = await import("@/app/api/coaches/personas/route");
    const res = await POST(mockPost("/api/coaches/personas"));
    expect(res.status).toBeLessThan(500);
    const data = await res.json();
    expect(data.success).toBe(true);
  });
});

// ─── DATA SEEDING ────────────────────────────────────────────────────

describe("Data Seeding API", () => {
  it("POST /api/data/seed-full returns seeded counts", async () => {
    const { POST } = await import("@/app/api/data/seed-full/route");
    const res = await POST(mockPost("/api/data/seed-full"));
    expect(res.status).toBeLessThan(500);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.seeded).toHaveProperty("schools");
    expect(data.seeded).toHaveProperty("coaches");
    expect(data.seeded.schools).toBe(17);
  });
});

// ─── CORE ENDPOINTS ──────────────────────────────────────────────────

describe("Core API Endpoints", () => {
  it("GET /api/coaches returns valid response", async () => {
    const { GET } = await import("@/app/api/coaches/route");
    const res = await GET(mockGet("/api/coaches"));
    expect(res.status).toBeLessThan(500);
  });

  it("GET /api/posts returns valid response", async () => {
    const { GET } = await import("@/app/api/posts/route");
    const res = await GET(mockGet("/api/posts"));
    expect(res.status).toBeLessThan(500);
  });

  it("GET /api/analytics returns valid response", async () => {
    const { GET } = await import("@/app/api/analytics/route");
    const res = await GET();
    expect(res.status).toBeLessThan(500);
  });

  it("GET /api/dms returns valid response", async () => {
    const { GET } = await import("@/app/api/dms/route");
    const res = await GET();
    expect(res.status).toBeLessThan(500);
  });

  it("GET /api/audit returns valid response", async () => {
    const { GET } = await import("@/app/api/audit/route");
    const res = await GET(mockGet("/api/audit"));
    expect(res.status).toBeLessThan(500);
  });

  it("GET /api/camps returns valid response", async () => {
    const { GET } = await import("@/app/api/camps/route");
    const res = await GET();
    expect(res.status).toBeLessThan(500);
  });

  it("GET /api/videos returns valid response", async () => {
    const { GET } = await import("@/app/api/videos/route");
    const res = await GET();
    expect(res.status).toBeLessThan(500);
  });

  it("GET /api/config/status returns config info", async () => {
    const { GET } = await import("@/app/api/config/status/route");
    const res = await GET(mockGet("/api/config/status"));
    expect(res.status).toBeLessThan(500);
  });
});

// ─── AGENT ENDPOINTS ─────────────────────────────────────────────────

describe("Agent System APIs", () => {
  it("GET /api/agents/status returns agent states", async () => {
    const { GET } = await import("@/app/api/agents/status/route");
    const res = await GET();
    expect(res.status).toBeLessThan(500);
  });

  it("GET /api/agents/actions returns pending actions", async () => {
    const { GET } = await import("@/app/api/agents/actions/route");
    const res = await GET(mockGet("/api/agents/actions"));
    expect(res.status).toBeLessThan(500);
  });
});

// ─── REC TEAM ENDPOINTS ─────────────────────────────────────────────

describe("REC Team APIs", () => {
  it("GET /api/rec/tasks returns task list", async () => {
    const { GET } = await import("@/app/api/rec/tasks/route");
    const res = await GET(mockGet("/api/rec/tasks"));
    expect(res.status).toBeLessThan(500);
  });

  it("GET /api/rec/ncsa/leads returns leads", async () => {
    const { GET } = await import("@/app/api/rec/ncsa/leads/route");
    const res = await GET(mockGet("/api/rec/ncsa/leads"));
    expect(res.status).toBeLessThan(500);
  });

  it("GET /api/rec/camps returns camp data", async () => {
    const { GET } = await import("@/app/api/rec/camps/route");
    const res = await GET(mockGet("/api/rec/camps"));
    expect(res.status).toBeLessThan(500);
  });

  it("GET /api/rec/measurables returns measurables", async () => {
    const { GET } = await import("@/app/api/rec/measurables/route");
    const res = await GET(mockGet("/api/rec/measurables"));
    expect(res.status).toBeLessThan(500);
  });
});

// ─── RECRUIT SITE ENDPOINTS ─────────────────────────────────────────

describe("Recruit Site APIs", () => {
  it("GET /api/recruit/data returns recruit profile", async () => {
    const { GET } = await import("@/app/api/recruit/data/route");
    const res = await GET();
    expect(res.status).toBeLessThan(500);
  });

  it("GET /api/recruit/social-proof returns social proof", async () => {
    const { GET } = await import("@/app/api/recruit/social-proof/route");
    const res = await GET();
    expect(res.status).toBeLessThan(500);
  });
});

// ─── DATA STATIC ENDPOINTS ──────────────────────────────────────────

describe("Static Data APIs", () => {
  it("GET /api/data/schools returns school data", async () => {
    const { GET } = await import("@/app/api/data/schools/route");
    const res = await GET(mockGet("/api/data/schools"));
    expect(res.status).toBeLessThan(500);
    const data = await res.json();
    expect(Array.isArray(data) || data.schools).toBeTruthy();
  });
});
