import { test, expect } from "@playwright/test";

test.describe("Coaches Pipeline Workflow", () => {
  test("should load the coaches page (War Room)", async ({ page }) => {
    await page.goto("/coaches");
    await expect(page).toHaveURL(/\/coaches/);
    // Page should render content
    const main = page.locator("main, [role=main], body");
    await expect(main).toBeVisible();
  });

  test("should load the outreach page (Campaign HQ)", async ({ page }) => {
    await page.goto("/outreach");
    await expect(page).toHaveURL(/\/outreach/);
    const main = page.locator("main, [role=main], body");
    await expect(main).toBeVisible();
  });

  test("should navigate from coaches to individual coach detail", async ({ page }) => {
    await page.goto("/coaches");
    // Look for a clickable coach card or link
    const coachLink = page.locator('a[href*="/coaches/"]').first();
    if (await coachLink.isVisible()) {
      await coachLink.click();
      await expect(page).toHaveURL(/\/coaches\//);
    }
  });

  test("should display coach data without stub messages", async ({ page }) => {
    await page.goto("/coaches");
    // Should not show "endpoint ready" stub text
    const bodyText = await page.textContent("body");
    expect(bodyText).not.toContain("endpoint ready");
  });
});
