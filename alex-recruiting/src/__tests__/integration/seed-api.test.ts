import { describe, it, expect } from "vitest";

/**
 * Integration tests for the data seeding endpoint.
 *
 * POST /api/data/seed-full generates comprehensive seed data for all
 * core tables. When JIB_DATABASE_URL is not set, it returns the generated
 * data as JSON in "preview" mode without database writes -- which is
 * exactly the path exercised here.
 */

describe("POST /api/data/seed-full", () => {
  it("returns a successful response", async () => {
    const { POST } = await import("@/app/api/data/seed-full/route");
    const response = await POST(new Request("http://localhost:3000/api/data/seed-full", { method: "POST" }));
    const data = await response.json();

    expect(data.success).toBe(true);
  });

  it("runs in preview mode without a database", async () => {
    const { POST } = await import("@/app/api/data/seed-full/route");
    const response = await POST(new Request("http://localhost:3000/api/data/seed-full", { method: "POST" }));
    const data = await response.json();

    expect(data.mode).toBe("preview");
    expect(typeof data.message).toBe("string");
  });

  it("returns seeded counts matching expectations", async () => {
    const { POST } = await import("@/app/api/data/seed-full/route");
    const response = await POST(new Request("http://localhost:3000/api/data/seed-full", { method: "POST" }));
    const data = await response.json();

    expect(data).toHaveProperty("seeded");
    const { seeded } = data;

    // 17 target schools
    expect(seeded.schools).toBe(17);

    // 3 coaches per school = 51
    expect(seeded.coaches).toBe(51);

    // 1 fit score per school = 17
    expect(seeded.fitScores).toBe(17);

    // 21 posting windows (5 weekdays * 3 windows + 3 Saturday + 3 Sunday)
    expect(seeded.windows).toBe(21);

    // 30 daily growth snapshots
    expect(seeded.snapshots).toBe(30);

    // 8 competitor recruits
    expect(seeded.competitors).toBe(8);

    // 8 camps
    expect(seeded.camps).toBe(8);
  });

  it("returns generated data arrays in the response", async () => {
    const { POST } = await import("@/app/api/data/seed-full/route");
    const response = await POST(new Request("http://localhost:3000/api/data/seed-full", { method: "POST" }));
    const data = await response.json();

    expect(data).toHaveProperty("data");
    expect(Array.isArray(data.data.schools)).toBe(true);
    expect(Array.isArray(data.data.coaches)).toBe(true);
    expect(Array.isArray(data.data.fitScores)).toBe(true);
    expect(Array.isArray(data.data.windows)).toBe(true);
    expect(Array.isArray(data.data.snapshots)).toBe(true);
    expect(Array.isArray(data.data.competitors)).toBe(true);
    expect(Array.isArray(data.data.camps)).toBe(true);
  });

  it("school rows have required fields", async () => {
    const { POST } = await import("@/app/api/data/seed-full/route");
    const response = await POST(new Request("http://localhost:3000/api/data/seed-full", { method: "POST" }));
    const data = await response.json();

    for (const school of data.data.schools) {
      expect(school).toHaveProperty("id");
      expect(school).toHaveProperty("name");
      expect(school).toHaveProperty("division");
      expect(school).toHaveProperty("conference");
      expect(school).toHaveProperty("priorityTier");
      expect(school).toHaveProperty("olNeedScore");
      expect(school).toHaveProperty("officialXHandle");
      expect(["Tier 1", "Tier 2", "Tier 3"]).toContain(school.priorityTier);
    }
  });

  it("coach rows have required fields and valid data", async () => {
    const { POST } = await import("@/app/api/data/seed-full/route");
    const response = await POST(new Request("http://localhost:3000/api/data/seed-full", { method: "POST" }));
    const data = await response.json();

    const coachTitles = ["Head Coach", "Offensive Line Coach", "Recruiting Coordinator"];

    for (const coach of data.data.coaches) {
      expect(coach).toHaveProperty("name");
      expect(coach).toHaveProperty("title");
      expect(coach).toHaveProperty("schoolId");
      expect(coach).toHaveProperty("schoolName");
      expect(coach).toHaveProperty("division");
      expect(coach).toHaveProperty("conference");
      expect(coach).toHaveProperty("xHandle");
      expect(coach).toHaveProperty("dmOpen");
      expect(coach).toHaveProperty("followStatus");
      expect(coach).toHaveProperty("dmStatus");
      expect(coach).toHaveProperty("priorityTier");
      expect(coach).toHaveProperty("olNeedScore");

      expect(coachTitles).toContain(coach.title);
      expect(typeof coach.name).toBe("string");
      expect(coach.name.length).toBeGreaterThan(0);
      expect(typeof coach.dmOpen).toBe("boolean");
    }
  });

  it("fit score rows have valid numeric scores", async () => {
    const { POST } = await import("@/app/api/data/seed-full/route");
    const response = await POST(new Request("http://localhost:3000/api/data/seed-full", { method: "POST" }));
    const data = await response.json();

    for (const score of data.data.fitScores) {
      expect(score).toHaveProperty("schoolId");
      expect(score).toHaveProperty("schoolName");
      expect(score).toHaveProperty("fitScore");
      expect(score).toHaveProperty("rosterNeed");
      expect(score).toHaveProperty("geography");
      expect(score).toHaveProperty("academics");
      expect(score).toHaveProperty("coachEngagement");
      expect(score).toHaveProperty("offerLikelihood");

      // All numeric fields should be reasonable percentages
      expect(score.fitScore).toBeGreaterThan(0);
      expect(score.fitScore).toBeLessThanOrEqual(100);
      expect(score.offerLikelihood).toBeGreaterThan(0);
      expect(score.offerLikelihood).toBeLessThanOrEqual(100);
    }
  });

  it("posting windows cover all 7 days of the week", async () => {
    const { POST } = await import("@/app/api/data/seed-full/route");
    const response = await POST(new Request("http://localhost:3000/api/data/seed-full", { method: "POST" }));
    const data = await response.json();

    const daysInWindows = new Set(
      data.data.windows.map((w: { dayOfWeek: number }) => w.dayOfWeek)
    );

    // Days 0-6 (Sunday through Saturday)
    expect(daysInWindows.size).toBe(7);

    for (const window of data.data.windows) {
      expect(window).toHaveProperty("dayOfWeek");
      expect(window).toHaveProperty("hourStart");
      expect(window).toHaveProperty("hourEnd");
      expect(window).toHaveProperty("score");
      expect(window).toHaveProperty("coachOverlap");
      expect(window).toHaveProperty("avgEngagement");
      expect(window.hourStart).toBeLessThan(window.hourEnd);
    }
  });

  it("growth snapshots cover 30 days with increasing followers", async () => {
    const { POST } = await import("@/app/api/data/seed-full/route");
    const response = await POST(new Request("http://localhost:3000/api/data/seed-full", { method: "POST" }));
    const data = await response.json();

    expect(data.data.snapshots.length).toBe(30);

    // Followers should generally increase over time
    const first = data.data.snapshots[0];
    const last = data.data.snapshots[data.data.snapshots.length - 1];
    expect(last.followerCount).toBeGreaterThan(first.followerCount);

    for (const snapshot of data.data.snapshots) {
      expect(snapshot).toHaveProperty("followerCount");
      expect(snapshot).toHaveProperty("coachFollowers");
      expect(snapshot).toHaveProperty("engagementRate");
      expect(snapshot).toHaveProperty("postsThisWeek");
      expect(snapshot).toHaveProperty("snapshotDate");
    }
  });

  it("competitor rows have valid recruit data", async () => {
    const { POST } = await import("@/app/api/data/seed-full/route");
    const response = await POST(new Request("http://localhost:3000/api/data/seed-full", { method: "POST" }));
    const data = await response.json();

    expect(data.data.competitors.length).toBe(8);

    for (const comp of data.data.competitors) {
      expect(comp).toHaveProperty("name");
      expect(comp).toHaveProperty("position");
      expect(comp).toHaveProperty("classYear");
      expect(comp).toHaveProperty("school");
      expect(comp).toHaveProperty("height");
      expect(comp).toHaveProperty("weight");

      expect(typeof comp.name).toBe("string");
      expect(comp.name.length).toBeGreaterThan(0);
    }
  });

  it("camp rows have valid event data", async () => {
    const { POST } = await import("@/app/api/data/seed-full/route");
    const response = await POST(new Request("http://localhost:3000/api/data/seed-full", { method: "POST" }));
    const data = await response.json();

    expect(data.data.camps.length).toBe(8);

    for (const camp of data.data.camps) {
      expect(camp).toHaveProperty("name");
      expect(camp).toHaveProperty("school");
      expect(camp).toHaveProperty("location");
      expect(camp).toHaveProperty("campType");
      expect(camp).toHaveProperty("registrationStatus");

      expect(typeof camp.name).toBe("string");
      expect(typeof camp.location).toBe("string");
      expect(["school_camp", "showcase", "prospect_day"]).toContain(camp.campType);
    }
  });
});
