import { describe, it, expect } from "vitest";

/**
 * Integration tests for the dashboard live API route.
 *
 * These tests import the route handler directly. When the X API is
 * unavailable (no bearer token in test env), the endpoint returns
 * fallback data with dataSource: "fallback". The route is designed
 * to never throw — it always returns a 200 with valid data.
 */

// ---------------------------------------------------------------------------
// GET /api/dashboard/live
// ---------------------------------------------------------------------------
describe("GET /api/dashboard/live", () => {
  it("returns a 200 response", async () => {
    const { GET } = await import("@/app/api/dashboard/live/route");
    const response = await GET();

    expect(response.status).toBe(200);
  });

  it("returns the expected top-level structure", async () => {
    const { GET } = await import("@/app/api/dashboard/live/route");
    const response = await GET();
    const data = await response.json();

    expect(data).toHaveProperty("followers");
    expect(data).toHaveProperty("coachFollows");
    expect(data).toHaveProperty("engagement");
    expect(data).toHaveProperty("posts");
    expect(data).toHaveProperty("dms");
    expect(data).toHaveProperty("alerts");
    expect(data).toHaveProperty("competitorUpdates");
    expect(data).toHaveProperty("meta");
  });

  it("followers section has count, weekChange, and target", async () => {
    const { GET } = await import("@/app/api/dashboard/live/route");
    const response = await GET();
    const data = await response.json();

    expect(data.followers).toHaveProperty("count");
    expect(data.followers).toHaveProperty("weekChange");
    expect(data.followers).toHaveProperty("target");
    expect(typeof data.followers.count).toBe("number");
    expect(typeof data.followers.weekChange).toBe("number");
    expect(typeof data.followers.target).toBe("number");
  });

  it("coachFollows section has count, target, and recentFollows array", async () => {
    const { GET } = await import("@/app/api/dashboard/live/route");
    const response = await GET();
    const data = await response.json();

    expect(data.coachFollows).toHaveProperty("count");
    expect(data.coachFollows).toHaveProperty("target");
    expect(data.coachFollows).toHaveProperty("recentFollows");
    expect(typeof data.coachFollows.count).toBe("number");
    expect(typeof data.coachFollows.target).toBe("number");
    expect(Array.isArray(data.coachFollows.recentFollows)).toBe(true);
  });

  it("engagement section has rate and weekChange", async () => {
    const { GET } = await import("@/app/api/dashboard/live/route");
    const response = await GET();
    const data = await response.json();

    expect(data.engagement).toHaveProperty("rate");
    expect(data.engagement).toHaveProperty("weekChange");
    expect(typeof data.engagement.rate).toBe("number");
    expect(typeof data.engagement.weekChange).toBe("number");
  });

  it("posts section has thisWeek and target", async () => {
    const { GET } = await import("@/app/api/dashboard/live/route");
    const response = await GET();
    const data = await response.json();

    expect(data.posts).toHaveProperty("thisWeek");
    expect(data.posts).toHaveProperty("target");
    expect(typeof data.posts.thisWeek).toBe("number");
    expect(typeof data.posts.target).toBe("number");
  });

  it("dms section has sent, responses, and responseRate", async () => {
    const { GET } = await import("@/app/api/dashboard/live/route");
    const response = await GET();
    const data = await response.json();

    expect(data.dms).toHaveProperty("sent");
    expect(data.dms).toHaveProperty("responses");
    expect(data.dms).toHaveProperty("responseRate");
    expect(typeof data.dms.sent).toBe("number");
    expect(typeof data.dms.responses).toBe("number");
    expect(typeof data.dms.responseRate).toBe("number");
  });

  it("meta section includes fetchedAt, dataSource, and jacobUserId", async () => {
    const { GET } = await import("@/app/api/dashboard/live/route");
    const response = await GET();
    const data = await response.json();

    expect(data.meta).toHaveProperty("fetchedAt");
    expect(data.meta).toHaveProperty("dataSource");
    expect(data.meta).toHaveProperty("jacobUserId");
    expect(typeof data.meta.fetchedAt).toBe("string");
    expect(["live", "fallback"]).toContain(data.meta.dataSource);
  });

  it("returns fallback data when X API is not configured", async () => {
    const { GET } = await import("@/app/api/dashboard/live/route");
    const response = await GET();
    const data = await response.json();

    // Without an X API bearer token, dataSource should be "fallback"
    expect(data.meta.dataSource).toBe("fallback");
  });

  it("alerts and competitorUpdates are arrays", async () => {
    const { GET } = await import("@/app/api/dashboard/live/route");
    const response = await GET();
    const data = await response.json();

    expect(Array.isArray(data.alerts)).toBe(true);
    expect(Array.isArray(data.competitorUpdates)).toBe(true);
  });

  it("follower target is set to 20000", async () => {
    const { GET } = await import("@/app/api/dashboard/live/route");
    const response = await GET();
    const data = await response.json();

    // The route and its live-data module define the target as 20_000
    expect(data.followers.target).toBe(20000);
  });
});
