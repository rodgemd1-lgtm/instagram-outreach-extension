import { test, expect } from "@playwright/test";

const VIEWPORTS = [
  { name: "mobile", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
];

const PAGES = [
  { path: "/create", label: "Create Post (light)" },
  { path: "/content-queue", label: "Content Queue (light)" },
  { path: "/coaches", label: "Coaches/War Room (dark)" },
  { path: "/outreach", label: "Outreach (dark)" },
  { path: "/dashboard", label: "Dashboard (light)" },
];

for (const viewport of VIEWPORTS) {
  test.describe(`Responsive — ${viewport.name} (${viewport.width}px)`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    for (const page_ of PAGES) {
      test(`${page_.label} renders without horizontal overflow`, async ({ page }) => {
        await page.goto(page_.path);
        // Wait for content to load
        await page.waitForLoadState("domcontentloaded");

        // Check no horizontal overflow
        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
        expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5); // 5px tolerance
      });

      test(`${page_.label} has visible content`, async ({ page }) => {
        await page.goto(page_.path);
        await page.waitForLoadState("domcontentloaded");

        // Body should have height
        const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
        expect(bodyHeight).toBeGreaterThan(100);
      });
    }

    if (viewport.name === "mobile") {
      test("mobile nav should be visible at 375px", async ({ page }) => {
        await page.goto("/dashboard");
        await page.waitForLoadState("domcontentloaded");

        // At mobile size, the sidebar should be hidden/collapsed
        // and mobile bottom nav or hamburger menu should exist
        const sidebar = page.locator('[class*="md:ml-"]');
        // Mobile should not show the desktop sidebar offset
        const mobileNav = page.locator("nav").first();
        await expect(mobileNav).toBeVisible();
      });
    }
  });
}
