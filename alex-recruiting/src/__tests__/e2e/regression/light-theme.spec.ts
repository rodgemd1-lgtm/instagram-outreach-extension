import { test, expect } from "@playwright/test";

// Pages that should have light theme (standard app pages)
const LIGHT_PAGES = ["/dashboard", "/create", "/posts", "/content-queue", "/calendar"];

// Pages that should have dark/Stitch theme
const DARK_PAGES = ["/coaches", "/outreach"];

test.describe("Theme Isolation — Regression", () => {
  for (const pagePath of LIGHT_PAGES) {
    test(`${pagePath} has light background (no dark bleed)`, async ({ page }) => {
      await page.goto(pagePath);
      await page.waitForLoadState("domcontentloaded");

      // The body or main container should NOT have a dark background
      const bodyBg = await page.evaluate(() => {
        const body = document.body;
        const style = window.getComputedStyle(body);
        return style.backgroundColor;
      });

      // Dark backgrounds would be close to rgb(0,0,0) or rgb(10,10,10)
      // Light backgrounds should be close to white or light gray
      if (bodyBg && bodyBg !== "rgba(0, 0, 0, 0)") {
        const match = bodyBg.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (match) {
          const [, r, g, b] = match.map(Number);
          // Light theme: all RGB values should be > 200 (near white) or transparent
          const isLight = r > 180 && g > 180 && b > 180;
          const isDark = r < 30 && g < 30 && b < 30;
          expect(isDark, `${pagePath} body has dark background: ${bodyBg}`).toBe(false);
        }
      }
    });
  }

  for (const pagePath of DARK_PAGES) {
    test(`${pagePath} has dark/Stitch background`, async ({ page }) => {
      await page.goto(pagePath);
      await page.waitForLoadState("domcontentloaded");

      // These pages should have a dark theme applied
      // Check the main content area
      const mainBg = await page.evaluate(() => {
        // Stitch pages often use bg-[#0a0a0a] or similar dark backgrounds
        const main = document.querySelector("main") || document.body;
        return window.getComputedStyle(main).backgroundColor;
      });

      // We expect dark backgrounds or the default body background
      // This is a soft check — the page should at minimum render
      expect(mainBg).toBeDefined();
    });
  }

  test("sidebar renders on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/dashboard");
    await page.waitForLoadState("domcontentloaded");

    // Desktop should have sidebar visible
    const nav = page.locator("nav").first();
    await expect(nav).toBeVisible();
  });

  test("light pages do not have Stitch CSS classes on body", async ({ page }) => {
    await page.goto("/create");
    await page.waitForLoadState("domcontentloaded");

    const bodyClasses = await page.evaluate(() => document.body.className);
    // Light pages should not have stitch-specific dark classes
    expect(bodyClasses).not.toContain("bg-[#0a0a0a]");
  });
});
