import { describe, it, expect } from "vitest";

/**
 * Phase 1 Foundation Smoke Tests
 *
 * These tests verify the running app serves core assets and endpoints.
 * They require the dev server (or a deployed instance) to be running.
 */
describe("Phase 1 — Foundation Smoke Tests", () => {
  const BASE = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  it("app boots and returns 200 on dashboard", async () => {
    const res = await fetch(`${BASE}/dashboard`);
    expect(res.status).toBeLessThan(400);
  });

  it("manifest.json serves valid PWA config", async () => {
    const res = await fetch(`${BASE}/manifest.json`);
    const data = await res.json();
    expect(data.display).toBe("standalone");
    expect(data.theme_color).toBe("#0a0a0a");
    expect(data.name).toContain("Jacob");
  });

  it("service worker is accessible", async () => {
    const res = await fetch(`${BASE}/sw.js`);
    expect(res.status).toBe(200);
  });

  it("splash screen crest image exists", async () => {
    const res = await fetch(`${BASE}/images/image-1773714384388-1.png`);
    expect(res.status).toBe(200);
  });

  it("hero images exist for all screens", async () => {
    const images = [
      "image-1773714341416-1.png",
      "image-1773714351342-1.png",
      "image-1773714357630-1.png",
      "image-1773714364680-1.png",
    ];
    for (const img of images) {
      const res = await fetch(`${BASE}/images/${img}`);
      expect(res.status).toBe(200);
    }
  });

  it("coaches API endpoint responds", async () => {
    const res = await fetch(`${BASE}/api/coaches`);
    expect(res.status).toBeLessThan(500);
  });
});
