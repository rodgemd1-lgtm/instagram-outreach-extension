import { describe, test, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFileContent(filePath: string): string {
  return fs.readFileSync(path.resolve(__dirname, "../..", filePath), "utf-8");
}

describe("Zero Fake Data Policy", () => {
  test("no non-empty MOCK_PERFORMANCE arrays in components", () => {
    const contentManager = readFileContent("components/content-manager.tsx");
    const managePage = readFileContent("app/manage/page.tsx");

    // Arrays should be empty (type-only declarations are OK)
    expect(contentManager).not.toMatch(/MOCK_PERFORMANCE\s*=\s*\[\s*\{/);
    expect(managePage).not.toMatch(/MOCK_PERFORMANCE\s*=\s*\[\s*\{/);
  });

  test("no hardcoded follower counts in dashboard live-data", () => {
    const liveData = readFileContent("lib/dashboard/live-data.ts");
    // Should not contain fake follower counts like 47
    expect(liveData).not.toMatch(/count:\s*47/);
    // Engagement rate fallback should be 0, not 6.2
    expect(liveData).not.toMatch(/rate:\s*6\.2/);
  });

  test("no fake engagement rate fallback", () => {
    const liveData = readFileContent("lib/dashboard/live-data.ts");
    // All error catch blocks should return rate: 0, not a fake number
    const catchBlocks = liveData.match(/catch[\s\S]*?return\s*\{[\s\S]*?\}/g) ?? [];
    for (const block of catchBlocks) {
      if (block.includes("rate:")) {
        expect(block).toMatch(/rate:\s*0/);
      }
    }
  });

  test("profileVisits returns 0 not a fake estimate", () => {
    const liveData = readFileContent("lib/dashboard/live-data.ts");
    // Should NOT multiply follower count to estimate visits
    expect(liveData).not.toMatch(/followerCount\s*\*\s*3\.5/);
  });

  test("analytics postsPublished only counts X-published posts", () => {
    const analyticsRoute = readFileContent("app/api/analytics/route.ts");
    // Should filter by x_post_id, not count all posts
    expect(analyticsRoute).toMatch(/x_post_id/);
  });

  test("no fake profile visit multiplier in live-data", () => {
    const liveData = readFileContent("lib/dashboard/live-data.ts");
    // profile visits must be explicitly set to 0, not computed from engagement
    expect(liveData).toMatch(/estimatedProfileVisits\s*=\s*0/);
  });

  test("analytics route uses force-dynamic", () => {
    const analyticsRoute = readFileContent("app/api/analytics/route.ts");
    expect(analyticsRoute).toContain("force-dynamic");
  });

  test("analytics route does not return raw Error to client", () => {
    const analyticsRoute = readFileContent("app/api/analytics/route.ts");
    // Should not return raw error object as response body
    expect(analyticsRoute).not.toMatch(/NextResponse\.json\(\s*err\s*[,)]/);
    expect(analyticsRoute).not.toMatch(/NextResponse\.json\(\s*error\s*[,)]/);
  });
});
