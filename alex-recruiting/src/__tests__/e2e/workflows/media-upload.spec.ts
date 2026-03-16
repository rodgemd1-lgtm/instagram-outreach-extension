import { test, expect } from "@playwright/test";

test.describe("Media Upload Workflow", () => {
  test("should load the media import page", async ({ page }) => {
    await page.goto("/media-import");
    await expect(page.locator("h1")).toContainText("Media Import");
  });

  test("should show drag-and-drop zone", async ({ page }) => {
    await page.goto("/media-import");
    await expect(page.locator("text=Drag & drop files here")).toBeVisible();
  });

  test("should have a category selector", async ({ page }) => {
    await page.goto("/media-import");
    const categorySelect = page.locator("select#category");
    await expect(categorySelect).toBeVisible();
    // Should have training as default
    await expect(categorySelect).toHaveValue("training");
  });

  test("should not show hardcoded 50% progress on initial load", async ({ page }) => {
    await page.goto("/media-import");
    // No progress bars should be visible on initial load (no files)
    const progressBars = page.locator('[style*="width: 50%"]');
    expect(await progressBars.count()).toBe(0);
  });
});
