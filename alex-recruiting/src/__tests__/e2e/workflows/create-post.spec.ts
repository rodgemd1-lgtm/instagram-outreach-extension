import { test, expect } from "@playwright/test";

test.describe("Create Post Workflow", () => {
  test("should load the create page", async ({ page }) => {
    await page.goto("/create");
    await expect(page.locator("h1")).toContainText("Smart Post Creator");
  });

  test("should show empty content area on load (no hardcoded draft)", async ({ page }) => {
    await page.goto("/create");
    const textarea = page.locator("textarea");
    await expect(textarea).toHaveValue("");
  });

  test("should show preview placeholders instead of fake engagement", async ({ page }) => {
    await page.goto("/create");
    // Engagement metrics should show "--" not hardcoded numbers
    const previewSection = page.locator('[class*="bg-black"]').first();
    await expect(previewSection).toBeVisible();
    const dashMetrics = previewSection.locator("text=--");
    expect(await dashMetrics.count()).toBeGreaterThanOrEqual(4);
  });

  test("should type post and add to queue", async ({ page }) => {
    await page.goto("/create");
    const textarea = page.locator("textarea");
    await textarea.fill(
      "Spring training update. Working on footwork drills every day.\n\n#2029Recruit #OL #PutInTheWork"
    );
    // Post should be within character limit
    await expect(page.locator("text=/ 280")).toBeVisible();
    // Click add to queue
    const addButton = page.locator("button", { hasText: /Add to Queue|Post Now/ });
    await addButton.click();
    // After adding, textarea should be cleared
    await expect(textarea).toHaveValue("");
  });

  test("should show constitution checker results", async ({ page }) => {
    await page.goto("/create");
    const textarea = page.locator("textarea");
    await textarea.fill("Training session done. Film review tomorrow. #FootballRecruiting #OL #2029Recruit");
    await expect(page.locator("text=Constitution Checker")).toBeVisible();
    await expect(page.locator("text=PASS").or(page.locator("text=NEEDS REVIEW"))).toBeVisible();
  });
});
