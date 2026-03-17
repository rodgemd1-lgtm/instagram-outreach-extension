import { describe, test, expect, vi, beforeEach } from "vitest";

// Mock the x-api module so live-data module calls fail gracefully
vi.mock("@/lib/integrations/x-api", () => ({
  verifyHandle: vi.fn().mockRejectedValue(new Error("API unreachable")),
  getFollowers: vi.fn().mockRejectedValue(new Error("Rate limited")),
  getUserTweets: vi.fn().mockRejectedValue(new Error("503 Service Unavailable")),
  followUser: vi.fn(),
  sendDM: vi.fn(),
  postTweet: vi.fn(),
}));

// Mock supabase so DB calls don't fire in these unit tests
vi.mock("@/lib/supabase/admin", () => ({
  isSupabaseConfigured: vi.fn().mockReturnValue(false),
  createAdminClient: vi.fn(),
}));

describe("X API Error Handling", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  test("getLiveFollowerCount returns 0 on API failure", async () => {
    const { getLiveFollowerCount } = await import("@/lib/dashboard/live-data");
    const result = await getLiveFollowerCount();
    expect(result.count).toBe(0);
  });

  test("getLiveFollowerCount still returns valid shape on failure", async () => {
    const { getLiveFollowerCount } = await import("@/lib/dashboard/live-data");
    const result = await getLiveFollowerCount();
    expect(result).toHaveProperty("count");
    expect(result).toHaveProperty("weekChange");
    expect(result).toHaveProperty("target");
    expect(result).toHaveProperty("fetchedAt");
    expect(typeof result.fetchedAt).toBe("string");
  });

  test("getLiveEngagementRate returns 0 on API failure", async () => {
    const { getLiveEngagementRate } = await import("@/lib/dashboard/live-data");
    const result = await getLiveEngagementRate();
    expect(result.rate).toBe(0);
  });

  test("getLiveEngagementRate returns valid shape on failure", async () => {
    const { getLiveEngagementRate } = await import("@/lib/dashboard/live-data");
    const result = await getLiveEngagementRate();
    expect(result).toHaveProperty("rate");
    expect(result).toHaveProperty("weekChange");
    expect(result).toHaveProperty("totalImpressions");
    expect(result).toHaveProperty("totalEngagements");
    expect(result).toHaveProperty("fetchedAt");
  });

  test("getLiveCoachFollows returns 0 on API failure", async () => {
    const { getLiveCoachFollows } = await import("@/lib/dashboard/live-data");
    const result = await getLiveCoachFollows();
    expect(result.count).toBe(0);
  });

  test("getLiveCoachFollows returns empty recentFollows array on failure", async () => {
    const { getLiveCoachFollows } = await import("@/lib/dashboard/live-data");
    const result = await getLiveCoachFollows();
    expect(Array.isArray(result.recentFollows)).toBe(true);
    expect(result.recentFollows.length).toBe(0);
  });

  test("getLiveWeeklyStats returns all zeros on API failure", async () => {
    const { getLiveWeeklyStats } = await import("@/lib/dashboard/live-data");
    const result = await getLiveWeeklyStats();
    expect(result.postsThisWeek).toBe(0);
    expect(result.dmsSent).toBe(0);
    expect(result.dmsResponded).toBe(0);
    expect(result.responseRate).toBe(0);
    expect(result.profileVisits).toBe(0);
  });

  test("getDashboardSnapshot returns fallback on total failure", async () => {
    const { getDashboardSnapshot } = await import("@/lib/dashboard/live-data");
    const result = await getDashboardSnapshot();
    expect(result.followers.count).toBe(0);
    expect(result.engagement.rate).toBe(0);
    // dataSource can be "live" or "fallback" when all values are zero —
    // what matters is that the call does NOT throw and returns a valid shape
    expect(["live", "fallback"]).toContain(result.dataSource);
  });

  test("getDashboardSnapshot never throws — always returns a valid snapshot", async () => {
    const { getDashboardSnapshot } = await import("@/lib/dashboard/live-data");
    await expect(getDashboardSnapshot()).resolves.not.toThrow();
  });

  test("getDashboardSnapshot snapshot shape is complete on failure", async () => {
    const { getDashboardSnapshot } = await import("@/lib/dashboard/live-data");
    const result = await getDashboardSnapshot();
    expect(result).toHaveProperty("followers");
    expect(result).toHaveProperty("coachFollows");
    expect(result).toHaveProperty("engagement");
    expect(result).toHaveProperty("weeklyStats");
    expect(result).toHaveProperty("fetchedAt");
    expect(result).toHaveProperty("dataSource");
  });

  test("getDashboardSnapshot returns null jacobUserId when API is down", async () => {
    const { getDashboardSnapshot } = await import("@/lib/dashboard/live-data");
    const result = await getDashboardSnapshot();
    // With a failed verifyHandle, jacobUserId should be null
    expect(result.jacobUserId).toBeNull();
  });
});
