import { describe, it, expect } from "vitest";

/**
 * Phase 2 Core Flows Smoke Tests
 *
 * Verify that all Phase 2 pages and API endpoints respond correctly.
 * Requires the dev server (or deployed instance) to be running.
 */
describe("Phase 2 — Core Flows Smoke Tests", () => {
  const BASE = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // --- Pages load without 500 ---

  it("coaches page responds", async () => {
    const res = await fetch(`${BASE}/coaches`);
    expect(res.status).toBeLessThan(500);
  });

  it("outreach page responds", async () => {
    const res = await fetch(`${BASE}/outreach`);
    expect(res.status).toBeLessThan(500);
  });

  it("DMs page responds", async () => {
    const res = await fetch(`${BASE}/dms`);
    expect(res.status).toBeLessThan(500);
  });

  it("analytics page responds", async () => {
    const res = await fetch(`${BASE}/analytics`);
    expect(res.status).toBeLessThan(500);
  });

  it("agency page responds", async () => {
    const res = await fetch(`${BASE}/agency`);
    expect(res.status).toBeLessThan(500);
  });

  it("intelligence page responds", async () => {
    const res = await fetch(`${BASE}/intelligence`);
    expect(res.status).toBeLessThan(500);
  });

  it("content-queue page responds", async () => {
    const res = await fetch(`${BASE}/content-queue`);
    expect(res.status).toBeLessThan(500);
  });

  // --- API endpoints respond ---

  it("coaches API returns coach array", async () => {
    const res = await fetch(`${BASE}/api/coaches`);
    const data = await res.json();
    expect(data).toHaveProperty("coaches");
    expect(Array.isArray(data.coaches)).toBe(true);
  });

  it("analytics API returns metrics", async () => {
    const res = await fetch(`${BASE}/api/analytics`);
    expect(res.status).toBeLessThan(500);
    const data = await res.json();
    expect(data).toHaveProperty("current");
  });

  it("outreach plan API responds", async () => {
    const res = await fetch(`${BASE}/api/outreach/plan`);
    expect(res.status).toBeLessThan(500);
  });

  it("DMs API responds", async () => {
    const res = await fetch(`${BASE}/api/dms`);
    expect(res.status).toBeLessThan(500);
  });

  it("agency tasks API responds", async () => {
    const res = await fetch(`${BASE}/api/rec/tasks`);
    expect(res.status).toBeLessThan(500);
  });

  it("reminders preview API responds", async () => {
    const res = await fetch(`${BASE}/api/reminders/tasks?preview=true`);
    expect(res.status).toBeLessThan(500);
  });

  // --- Jacob's photos exist ---

  it("Jacob's photos are accessible", async () => {
    const photos = [
      "jacob/gameday-sideline.jpg",
      "jacob/training-weights.jpg",
      "jacob/headshot.jpg",
    ];
    for (const photo of photos) {
      const res = await fetch(`${BASE}/images/${photo}`);
      expect(res.status).toBe(200);
    }
  });

  // --- Vonage replaced Twilio ---

  it("reminders API no longer references Twilio", async () => {
    const res = await fetch(`${BASE}/api/reminders/tasks?preview=true`);
    const data = await res.json();
    // Should mention Vonage if not configured, not Twilio
    if (data.error) {
      expect(data.error).not.toContain("Twilio");
    }
    expect(res.status).toBeLessThan(500);
  });
});
