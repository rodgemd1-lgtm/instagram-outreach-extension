import { describe, it, expect } from "vitest";

// Test the API route handler logic directly by importing and calling the handlers
// Since these are Next.js App Router routes, we test the validation logic

describe("analytics API validation", () => {
  describe("visit tracking", () => {
    it("rejects missing visitorId", async () => {
      const { POST } = await import("@/app/api/analytics/visit/route");
      const req = new Request("http://localhost/api/analytics/visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page: "/recruit" }),
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("rejects missing page", async () => {
      const { POST } = await import("@/app/api/analytics/visit/route");
      const req = new Request("http://localhost/api/analytics/visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId: "v-123" }),
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("accepts valid visit payload", async () => {
      const { POST } = await import("@/app/api/analytics/visit/route");
      const req = new Request("http://localhost/api/analytics/visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorId: "v-123",
          page: "/recruit",
          referrer: "https://twitter.com",
          utmSource: "twitter",
        }),
      });
      const res = await POST(req);
      // Should return 200 with visitId (or mock DB response)
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toHaveProperty("visitId");
    });
  });

  describe("section tracking", () => {
    it("rejects missing visitId", async () => {
      const { POST } = await import("@/app/api/analytics/section/route");
      const req = new Request("http://localhost/api/analytics/section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionId: "hero" }),
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("accepts valid section payload", async () => {
      const { POST } = await import("@/app/api/analytics/section/route");
      const req = new Request("http://localhost/api/analytics/section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitId: "fake-uuid",
          sectionId: "hero",
          dwellTime: 5000,
          interacted: true,
        }),
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
    });
  });

  describe("film tracking", () => {
    it("rejects missing filmId", async () => {
      const { POST } = await import("@/app/api/analytics/film/route");
      const req = new Request("http://localhost/api/analytics/film", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitId: "fake-uuid" }),
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("accepts valid film view payload", async () => {
      const { POST } = await import("@/app/api/analytics/film/route");
      const req = new Request("http://localhost/api/analytics/film", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitId: "fake-uuid",
          filmId: "highlight-1",
          watchDuration: 45,
          completed: false,
        }),
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
    });
  });
});
