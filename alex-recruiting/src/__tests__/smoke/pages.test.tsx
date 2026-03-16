import { describe, it, expect } from "vitest";

/**
 * Smoke tests: verify every page module can be dynamically imported
 * without throwing. This catches broken imports, missing dependencies,
 * and syntax errors at the module level.
 */

// ---------------------------------------------------------------------------
// Command section
// ---------------------------------------------------------------------------
describe("Page smoke tests - Command", () => {
  it("should import / (home) page", async () => {
    const mod = await import("@/app/page");
    expect(mod.default).toBeDefined();
  });

  it("should import /dashboard page", async () => {
    const mod = await import("@/app/dashboard/page");
    expect(mod.default).toBeDefined();
  });

  it("should import /profile-studio page", async () => {
    const mod = await import("@/app/profile-studio/page");
    expect(mod.default).toBeDefined();
  });

  it("should import /recruit page", async () => {
    const mod = await import("@/app/recruit/page");
    expect(mod.default).toBeDefined();
  });

  it("should import /audit page", async () => {
    const mod = await import("@/app/audit/page");
    expect(mod.default).toBeDefined();
  });

  it("should import /agency page", async () => {
    const mod = await import("@/app/agency/page");
    expect(mod.default).toBeDefined();
  });

  it("should import /analytics page", async () => {
    const mod = await import("@/app/analytics/page");
    expect(mod.default).toBeDefined();
  });

  it("should import /agents page", async () => {
    const mod = await import("@/app/agents/page");
    expect(mod.default).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Publishing section
// ---------------------------------------------------------------------------
describe("Page smoke tests - Publishing", () => {
  it("should import /posts page", async () => {
    const mod = await import("@/app/posts/page");
    expect(mod.default).toBeDefined();
  });

  it("should import /calendar page", async () => {
    const mod = await import("@/app/calendar/page");
    expect(mod.default).toBeDefined();
  });

  it("should import /create page", async () => {
    const mod = await import("@/app/create/page");
    expect(mod.default).toBeDefined();
  });

  it("should import /manage page", async () => {
    const mod = await import("@/app/manage/page");
    expect(mod.default).toBeDefined();
  });

  it("should import /hooks page", async () => {
    const mod = await import("@/app/hooks/page");
    expect(mod.default).toBeDefined();
  });

  it("should import /captions page", async () => {
    const mod = await import("@/app/captions/page");
    expect(mod.default).toBeDefined();
  });

  it("should import /comments page", async () => {
    const mod = await import("@/app/comments/page");
    expect(mod.default).toBeDefined();
  });

  it("should import /viral page", async () => {
    const mod = await import("@/app/viral/page");
    expect(mod.default).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Outreach section
// ---------------------------------------------------------------------------
describe("Page smoke tests - Outreach", () => {
  it("should import /coaches page", async () => {
    const mod = await import("@/app/coaches/page");
    expect(mod.default).toBeDefined();
  });

  it("should import /dms page", async () => {
    const mod = await import("@/app/dms/page");
    expect(mod.default).toBeDefined();
  });

  it("should import /connections page", async () => {
    const mod = await import("@/app/connections/page");
    expect(mod.default).toBeDefined();
  });

  it("should import /connections/[id] page", async () => {
    const mod = await import("@/app/connections/[id]/page");
    expect(mod.default).toBeDefined();
  });

  it("should import /cold-dms page", async () => {
    const mod = await import("@/app/cold-dms/page");
    expect(mod.default).toBeDefined();
  });

  it("should import /competitors page", async () => {
    const mod = await import("@/app/competitors/page");
    expect(mod.default).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Media section
// ---------------------------------------------------------------------------
describe("Page smoke tests - Media", () => {
  it("should import /media-lab page", async () => {
    const mod = await import("@/app/media-lab/page");
    expect(mod.default).toBeDefined();
  });

  it("should import /videos page", async () => {
    const mod = await import("@/app/videos/page");
    expect(mod.default).toBeDefined();
  });

  it("should import /media page", async () => {
    const mod = await import("@/app/media/page");
    expect(mod.default).toBeDefined();
  });

  it("should import /youtube-studio page", async () => {
    const mod = await import("@/app/youtube-studio/page");
    expect(mod.default).toBeDefined();
  });

  it("should import /media-upload page", async () => {
    const mod = await import("@/app/media-upload/page");
    expect(mod.default).toBeDefined();
  });

  it("should import /media-import page", async () => {
    const mod = await import("@/app/media-import/page");
    expect(mod.default).toBeDefined();
  });

  it("should import /camps page", async () => {
    const mod = await import("@/app/camps/page");
    expect(mod.default).toBeDefined();
  });

  it("should import /accomplishments page", async () => {
    const mod = await import("@/app/accomplishments/page");
    expect(mod.default).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Research section
// ---------------------------------------------------------------------------
describe("Page smoke tests - Research", () => {
  it("should import /intelligence page", async () => {
    const mod = await import("@/app/intelligence/page");
    expect(mod.default).toBeDefined();
  });

  it("should import /scrape page", async () => {
    const mod = await import("@/app/scrape/page");
    expect(mod.default).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Dashboard sub-pages
// ---------------------------------------------------------------------------
describe("Page smoke tests - Dashboard sub-pages", () => {
  it("should import /dashboard/coaches page", async () => {
    const mod = await import("@/app/dashboard/coaches/page");
    expect(mod.default).toBeDefined();
  });

  it("should import /dashboard/content page", async () => {
    const mod = await import("@/app/dashboard/content/page");
    expect(mod.default).toBeDefined();
  });

  it("should import /dashboard/outreach page", async () => {
    const mod = await import("@/app/dashboard/outreach/page");
    expect(mod.default).toBeDefined();
  });

  it("should import /dashboard/analytics page", async () => {
    const mod = await import("@/app/dashboard/analytics/page");
    expect(mod.default).toBeDefined();
  });

  it("should import /dashboard/calendar page", async () => {
    const mod = await import("@/app/dashboard/calendar/page");
    expect(mod.default).toBeDefined();
  });

  it("should import /dashboard/team page", async () => {
    const mod = await import("@/app/dashboard/team/page");
    expect(mod.default).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Agency sub-pages
// ---------------------------------------------------------------------------
describe("Page smoke tests - Agency sub-pages", () => {
  it("should import /agency/leads page", async () => {
    const mod = await import("@/app/agency/leads/page");
    expect(mod.default).toBeDefined();
  });

  it("should import /agency/[member] page", async () => {
    const mod = await import("@/app/agency/[member]/page");
    expect(mod.default).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Legal / static pages
// ---------------------------------------------------------------------------
describe("Page smoke tests - Static pages", () => {
  it("should import /privacy page", async () => {
    const mod = await import("@/app/privacy/page");
    expect(mod.default).toBeDefined();
  });

  it("should import /terms page", async () => {
    const mod = await import("@/app/terms/page");
    expect(mod.default).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// NEW pages (Track F required)
// ---------------------------------------------------------------------------
describe("Page smoke tests - New pages", () => {
  it("should import /content-queue page", async () => {
    const mod = await import("@/app/content-queue/page");
    expect(mod.default).toBeDefined();
  });

  it("should import /outreach page", async () => {
    const mod = await import("@/app/outreach/page");
    expect(mod.default).toBeDefined();
  });

  it("should import /coaches/[id] page", async () => {
    const mod = await import("@/app/coaches/[id]/page");
    expect(mod.default).toBeDefined();
  });

  it("should import /brand-kit page", async () => {
    const mod = await import("@/app/brand-kit/page");
    expect(mod.default).toBeDefined();
  });

  it("should import /prompt-studio page", async () => {
    const mod = await import("@/app/prompt-studio/page");
    expect(mod.default).toBeDefined();
  });

  it("should import /x-growth page", async () => {
    const mod = await import("@/app/x-growth/page");
    expect(mod.default).toBeDefined();
  });

  it("should import /capture page", async () => {
    const mod = await import("@/app/capture/page");
    expect(mod.default).toBeDefined();
  });

  it("should import /map page", async () => {
    const mod = await import("@/app/map/page");
    expect(mod.default).toBeDefined();
  });
});
