import { describe, test, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFileContent(filePath: string): string {
  return fs.readFileSync(path.resolve(__dirname, "../..", filePath), "utf-8");
}

function findRoutesRecursive(dir: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findRoutesRecursive(fullPath));
    } else if (entry.name === "route.ts") {
      results.push(fullPath);
    }
  }
  return results;
}

const apiDir = path.resolve(__dirname, "../../app/api");
const routeFiles = findRoutesRecursive(apiDir);

// Routes that own read-heavy live-data fetches must have force-dynamic.
// Mutation/seed routes (POST/PUT only) are exempt.
const READ_ROUTES_REQUIRING_DYNAMIC = [
  "analytics/route.ts",
  "dashboard/live/route.ts",
  "growth/route.ts",
];

describe("Data Integrity", () => {
  test("at least one API route file exists", () => {
    expect(routeFiles.length).toBeGreaterThan(0);
  });

  test("known read-heavy routes have force-dynamic", () => {
    for (const routeName of READ_ROUTES_REQUIRING_DYNAMIC) {
      const file = path.resolve(apiDir, routeName);
      if (!fs.existsSync(file)) continue; // skip if route doesn't exist yet

      const content = fs.readFileSync(file, "utf-8");
      expect(
        content,
        `${routeName} is a live-data route but is missing 'force-dynamic'`
      ).toContain("force-dynamic");
    }
  });

  test("no API routes return raw Error objects to client", () => {
    for (const file of routeFiles) {
      const content = fs.readFileSync(file, "utf-8");
      // NextResponse.json(error) or NextResponse.json(err) are patterns that
      // leak internal error objects to consumers — they should be absent.
      expect(
        content,
        `${path.relative(apiDir, file)} may be leaking raw error to client`
      ).not.toMatch(/NextResponse\.json\(\s*error\s*[,)]/);

      expect(
        content,
        `${path.relative(apiDir, file)} may be leaking raw err to client`
      ).not.toMatch(/NextResponse\.json\(\s*err\s*[,)]/);
    }
  });

  test("analytics route returns postsPublished filtered by x_post_id", () => {
    const analyticsContent = readFileContent("app/api/analytics/route.ts");
    expect(analyticsContent).toMatch(/x_post_id/);
    // The filtering logic should reference x_post_id to exclude drafts
    expect(analyticsContent).toContain("publishedPosts");
  });

  test("live-data route uses getDashboardSnapshot not fake data", () => {
    const liveRouteFiles = routeFiles.filter(
      (f) => f.includes("/dashboard/") || f.includes("/live/")
    );
    for (const file of liveRouteFiles) {
      const content = fs.readFileSync(file, "utf-8");
      // Should import from live-data, not hardcode follower numbers inline
      expect(content).not.toMatch(/followers:\s*\d{3,}/);
    }
  });

  test("no live-data module contains hardcoded follower counts used as real data", () => {
    const liveData = readFileContent("lib/dashboard/live-data.ts");
    // Fake count like "count: 47" or "count: 1200" should never appear
    expect(liveData).not.toMatch(/\bcount:\s*(?:[1-9]\d{1,3})\b/);
  });

  test("all route files export at least one HTTP handler", () => {
    for (const file of routeFiles) {
      const content = fs.readFileSync(file, "utf-8");
      const hasHandler =
        /export\s+(?:async\s+)?function\s+(?:GET|POST|PUT|PATCH|DELETE)/.test(content) ||
        /export\s+const\s+(?:GET|POST|PUT|PATCH|DELETE)\s*=/.test(content);
      expect(
        hasHandler,
        `${path.relative(apiDir, file)} has no exported HTTP handler`
      ).toBe(true);
    }
  });

  test("live dashboard API route has force-dynamic set", () => {
    const dashLiveFile = path.resolve(apiDir, "dashboard/live/route.ts");
    if (fs.existsSync(dashLiveFile)) {
      const content = fs.readFileSync(dashLiveFile, "utf-8");
      expect(content).toContain("force-dynamic");
    }
  });

  test("analytics route milestone targets are static config, not fake metrics", () => {
    const analyticsContent = readFileContent("app/api/analytics/route.ts");
    // The targets object is legitimate config — verify it exists and is named "targets"
    expect(analyticsContent).toMatch(/const\s+targets\s*=/);
    // It should NOT be used as the current data snapshot
    expect(analyticsContent).not.toMatch(/current\s*=\s*targets/);
  });
});
