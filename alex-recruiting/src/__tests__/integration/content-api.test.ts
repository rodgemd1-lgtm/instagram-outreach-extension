import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";

/**
 * Integration tests for the content pipeline API routes.
 *
 * These tests import route handlers directly (no HTTP server needed)
 * and exercise the fallback paths that work without a database connection.
 */

// ---------------------------------------------------------------------------
// GET /api/content/queue
// ---------------------------------------------------------------------------
describe("GET /api/content/queue", () => {
  it("returns a valid response structure", async () => {
    const { GET } = await import("@/app/api/content/queue/route");
    const req = new NextRequest("http://localhost:3000/api/content/queue");
    const response = await GET(req);
    const data = await response.json();

    expect(data).toHaveProperty("posts");
    expect(data).toHaveProperty("total");
    expect(data).toHaveProperty("counts");
    expect(Array.isArray(data.posts)).toBe(true);
    expect(typeof data.total).toBe("number");
  });

  it("returns valid counts object with all status keys", async () => {
    const { GET } = await import("@/app/api/content/queue/route");
    const req = new NextRequest("http://localhost:3000/api/content/queue");
    const response = await GET(req);
    const data = await response.json();

    expect(data.counts).toHaveProperty("queued");
    expect(data.counts).toHaveProperty("draft");
    expect(data.counts).toHaveProperty("approved");
    expect(data.counts).toHaveProperty("rejected");
    expect(data.counts).toHaveProperty("posted");

    // All counts should be numbers
    for (const key of Object.keys(data.counts)) {
      expect(typeof data.counts[key]).toBe("number");
    }
  });

  it("returns empty posts when no database is configured", async () => {
    const { GET } = await import("@/app/api/content/queue/route");
    const req = new NextRequest("http://localhost:3000/api/content/queue");
    const response = await GET(req);
    const data = await response.json();

    // Without a database, should return empty arrays and zeroed counts
    expect(data.posts).toEqual([]);
    expect(data.total).toBe(0);
  });

  it("accepts pillar query parameter", async () => {
    const { GET } = await import("@/app/api/content/queue/route");
    const req = new NextRequest(
      "http://localhost:3000/api/content/queue?pillar=performance"
    );
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("posts");
  });

  it("accepts status query parameter", async () => {
    const { GET } = await import("@/app/api/content/queue/route");
    const req = new NextRequest(
      "http://localhost:3000/api/content/queue?status=approved"
    );
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("posts");
  });
});

// ---------------------------------------------------------------------------
// POST /api/content/generate-month
// ---------------------------------------------------------------------------
describe("POST /api/content/generate-month", () => {
  it("returns success with generated posts", async () => {
    const { POST } = await import("@/app/api/content/generate-month/route");
    const response = await POST();
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(typeof data.generated).toBe("number");
    expect(Array.isArray(data.posts)).toBe(true);
  });

  it("generates a substantial number of posts (90-120 for 30 days)", async () => {
    const { POST } = await import("@/app/api/content/generate-month/route");
    const response = await POST();
    const data = await response.json();

    // 30 days * 3-4 posts per day = 90-120 posts
    expect(data.generated).toBeGreaterThanOrEqual(90);
    expect(data.generated).toBeLessThanOrEqual(120);
    expect(data.posts.length).toBe(data.generated);
  });

  it("generated posts have all required fields", async () => {
    const { POST } = await import("@/app/api/content/generate-month/route");
    const response = await POST();
    const data = await response.json();

    for (const post of data.posts) {
      expect(post).toHaveProperty("content");
      expect(post).toHaveProperty("pillar");
      expect(post).toHaveProperty("hashtags");
      expect(post).toHaveProperty("scheduledFor");
      expect(post).toHaveProperty("status");

      expect(typeof post.content).toBe("string");
      expect(post.content.length).toBeGreaterThan(0);
      expect(typeof post.pillar).toBe("string");
      expect(Array.isArray(post.hashtags)).toBe(true);
      expect(typeof post.scheduledFor).toBe("string");
      expect(typeof post.status).toBe("string");
    }
  });

  it("generated posts have valid pillars", async () => {
    const { POST } = await import("@/app/api/content/generate-month/route");
    const response = await POST();
    const data = await response.json();

    const validPillars = ["performance", "work_ethic", "character"];

    for (const post of data.posts) {
      expect(validPillars).toContain(post.pillar);
    }
  });

  it("generated posts span approximately 30 days", async () => {
    const { POST } = await import("@/app/api/content/generate-month/route");
    const response = await POST();
    const data = await response.json();

    // Verify posts span a 30-day range by checking first and last scheduled dates
    const scheduledDates = data.posts
      .map((p: { scheduledFor: string }) => new Date(p.scheduledFor).getTime())
      .sort((a: number, b: number) => a - b);

    const firstDate = scheduledDates[0];
    const lastDate = scheduledDates[scheduledDates.length - 1];
    const spanDays = (lastDate - firstDate) / (1000 * 60 * 60 * 24);

    // The span should be approximately 29 days (day 0 to day 29)
    expect(spanDays).toBeGreaterThanOrEqual(28);
    expect(spanDays).toBeLessThanOrEqual(31);

    // Group by local date to verify distribution
    const postsByDate = new Map<string, number>();
    for (const post of data.posts) {
      const date = post.scheduledFor.split("T")[0];
      postsByDate.set(date, (postsByDate.get(date) || 0) + 1);
    }

    // Should have posts distributed across many distinct dates
    expect(postsByDate.size).toBeGreaterThanOrEqual(20);
  });

  it("all generated posts have queued status", async () => {
    const { POST } = await import("@/app/api/content/generate-month/route");
    const response = await POST();
    const data = await response.json();

    for (const post of data.posts) {
      expect(post.status).toBe("queued");
    }
  });

  it("generated posts include additional metadata fields", async () => {
    const { POST } = await import("@/app/api/content/generate-month/route");
    const response = await POST();
    const data = await response.json();

    // Spot-check a few posts for extra fields
    const sample = data.posts[0];
    expect(sample).toHaveProperty("id");
    expect(sample).toHaveProperty("bestTime");
    expect(sample).toHaveProperty("mediaSuggestion");
    expect(sample).toHaveProperty("formulaType");
    expect(sample).toHaveProperty("hookId");
    expect(sample).toHaveProperty("createdAt");
  });
});
