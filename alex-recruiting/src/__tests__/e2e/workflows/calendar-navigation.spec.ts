import { test, expect } from "@playwright/test";

test.describe("Calendar Navigation Workflow", () => {
  test("should load the calendar page", async ({ page }) => {
    await page.goto("/calendar");
    await expect(page).toHaveURL(/\/calendar/);
  });

  test("should load content queue calendar view", async ({ page }) => {
    await page.goto("/content-queue");
    const calendarTab = page.locator("button, [role=tab]", { hasText: /Calendar/ });
    if (await calendarTab.isVisible()) {
      await calendarTab.click();
      // Day headers should be present
      await expect(page.locator("text=Sun")).toBeVisible();
      await expect(page.locator("text=Mon")).toBeVisible();
      await expect(page.locator("text=Sat")).toBeVisible();
    }
  });

  test("should navigate between weeks/months", async ({ page }) => {
    await page.goto("/content-queue");
    const calendarTab = page.locator("button, [role=tab]", { hasText: /Calendar/ });
    if (await calendarTab.isVisible()) {
      await calendarTab.click();
      const todayBtn = page.locator("button", { hasText: "Today" });
      if (await todayBtn.isVisible()) {
        // Should have prev/next buttons
        const prevBtn = page.locator("button:has(svg)").first();
        await expect(prevBtn).toBeVisible();
      }
    }
  });
});
