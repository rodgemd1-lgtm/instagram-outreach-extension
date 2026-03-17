import { test, expect } from "@playwright/test";

test.describe("Outreach Pipeline Workflow", () => {
  test("should load the outreach page", async ({ page }) => {
    await page.goto("/outreach");
    await expect(page).toHaveURL(/\/outreach/);
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });

  test("should load the cold DMs page", async ({ page }) => {
    await page.goto("/cold-dms");
    await expect(page).toHaveURL(/\/cold-dms/);
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });

  test("should load connections page", async ({ page }) => {
    await page.goto("/connections");
    await expect(page).toHaveURL(/\/connections/);
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });
});
