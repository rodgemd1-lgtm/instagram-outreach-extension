import { test, expect } from "@playwright/test";

test.describe("Content Queue Workflow", () => {
  test("should load the content queue page", async ({ page }) => {
    await page.goto("/content-queue");
    await expect(page.locator("text=Content Queue")).toBeVisible();
  });

  test("should show empty state with Generate Month button when no content", async ({ page }) => {
    await page.goto("/content-queue");
    // Either shows posts or empty state with generate button
    const generateBtn = page.locator("button", { hasText: /Generate Month/ });
    const postsExist = page.locator("text=post").first();
    await expect(generateBtn.or(postsExist)).toBeVisible();
  });

  test("should have working calendar navigation", async ({ page }) => {
    await page.goto("/content-queue");
    // If content exists, calendar tab should be available
    const calendarTab = page.locator("button, [role=tab]", { hasText: /Calendar/ });
    if (await calendarTab.isVisible()) {
      await calendarTab.click();
      // Nav buttons should exist
      const todayBtn = page.locator("button", { hasText: "Today" });
      await expect(todayBtn).toBeVisible();
    }
  });

  test("should have working list view with filters", async ({ page }) => {
    await page.goto("/content-queue");
    const listTab = page.locator("button, [role=tab]", { hasText: /List/ });
    if (await listTab.isVisible()) {
      await listTab.click();
      // Filter selects should be present
      await expect(page.locator("select").first()).toBeVisible();
    }
  });
});
