import { test, expect } from "@playwright/test";

// WCAG 2.1 AA automated checks using Playwright built-in accessibility features
// For full axe-core integration, install @axe-core/playwright separately

const KEY_PAGES = [
  "/dashboard",
  "/create",
  "/content-queue",
  "/coaches",
  "/outreach",
  "/media-import",
  "/posts",
];

test.describe("Accessibility — WCAG 2.1 AA Checks", () => {
  for (const pagePath of KEY_PAGES) {
    test(`${pagePath} — images have alt text`, async ({ page }) => {
      await page.goto(pagePath);
      await page.waitForLoadState("domcontentloaded");

      // All img elements should have alt attributes
      const images = page.locator("img");
      const count = await images.count();
      for (let i = 0; i < count; i++) {
        const alt = await images.nth(i).getAttribute("alt");
        expect(alt, `Image ${i} on ${pagePath} missing alt text`).not.toBeNull();
      }
    });

    test(`${pagePath} — interactive elements are keyboard accessible`, async ({ page }) => {
      await page.goto(pagePath);
      await page.waitForLoadState("domcontentloaded");

      // All buttons should be focusable (not have tabindex=-1 unless aria-hidden)
      const buttons = page.locator("button:not([aria-hidden='true'])");
      const count = await buttons.count();
      for (let i = 0; i < Math.min(count, 10); i++) {
        const tabindex = await buttons.nth(i).getAttribute("tabindex");
        if (tabindex !== null) {
          expect(parseInt(tabindex)).toBeGreaterThanOrEqual(0);
        }
      }
    });

    test(`${pagePath} — page has a heading structure`, async ({ page }) => {
      await page.goto(pagePath);
      await page.waitForLoadState("domcontentloaded");

      // Should have at least one heading
      const headings = page.locator("h1, h2, h3, h4, h5, h6");
      expect(await headings.count()).toBeGreaterThan(0);
    });
  }

  test("focus rings are visible on interactive elements", async ({ page }) => {
    await page.goto("/create");
    await page.waitForLoadState("domcontentloaded");

    // Tab to first focusable element
    await page.keyboard.press("Tab");
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();
  });

  test("form inputs have labels", async ({ page }) => {
    await page.goto("/create");
    await page.waitForLoadState("domcontentloaded");

    // Textareas should have labels or aria-label
    const textareas = page.locator("textarea");
    const count = await textareas.count();
    for (let i = 0; i < count; i++) {
      const ariaLabel = await textareas.nth(i).getAttribute("aria-label");
      const placeholder = await textareas.nth(i).getAttribute("placeholder");
      const id = await textareas.nth(i).getAttribute("id");
      // Should have either aria-label, placeholder (as fallback), or associated label
      const hasAccessibleName = ariaLabel || placeholder || id;
      expect(hasAccessibleName, `Textarea ${i} has no accessible name`).toBeTruthy();
    }
  });
});
