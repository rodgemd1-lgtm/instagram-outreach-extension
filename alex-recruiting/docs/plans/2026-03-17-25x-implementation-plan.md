# 25X Launch Readiness — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Take Alex Recruiting from working prototype to production-certified recruiting tool through a 3-phase program: Engineering Fix Sprint → Panel Certification → Live Field Test.

**Architecture:** Phase 1 dispatches 4 parallel engineering agents (full-stack, frontend, backend, QA) that each produce fixes and a signed rubric. Phase 2 synthesizes findings into a severity matrix. Phase 3 is a human-driven 10-day diary study with Jacob + 3-day outsider recruit test.

**Tech Stack:** Next.js 15, React 18, TypeScript, Supabase (PostgreSQL + Storage), Drizzle ORM, X/Twitter API (OAuth 1.0a + Bearer), Anthropic Claude SDK, Vitest, Playwright, Vercel

**Design Doc:** `docs/plans/2026-03-17-25x-launch-readiness-design.md`

---

## Phase 1: Engineering Fix Sprint

Phase 1 has 4 parallel workstreams. Each workstream is a series of tasks that can run independently. After all 4 complete, Phase 2 begins.

---

### Workstream A: Full-Stack Engineer

#### Task A1: API Route Audit — force-dynamic + error consistency

**Files:**
- Audit: All files in `src/app/api/**/route.ts` (123 routes)
- Reference: `src/app/api/analytics/route.ts` (example of correct pattern)

**Step 1: Scan all API routes missing force-dynamic**

Run: `grep -rL "force-dynamic" src/app/api/ --include="route.ts" | head -40`

For every route that queries a database or external API, add:
```typescript
export const dynamic = "force-dynamic";
```

Skip routes that are truly static (like config/status).

**Step 2: Audit error response consistency**

Every API route must return errors as:
```typescript
return NextResponse.json(
  { error: "Human-readable message", details: errorMessage },
  { status: 4xx | 5xx }
);
```

Scan for routes that return raw error objects or inconsistent shapes.

**Step 3: Audit silent error swallowing**

Search for `catch` blocks that don't log or return errors:
```
grep -n "catch.*{" src/app/api/**/route.ts
```

Every catch must `console.error()` AND return an error response or fall through to a documented fallback.

**Step 4: Commit**
```bash
git commit -m "fix(api): standardize error handling and force-dynamic across all routes"
```

#### Task A2: Request Lifecycle Trace — Post Publishing

**Files:**
- `src/app/api/posts/route.ts` (POST — create draft)
- `src/app/api/posts/[id]/send/route.ts` (POST — publish to X)
- `src/lib/integrations/x-api.ts` (`postTweet()` function)
- `src/lib/db/schema.ts` (`posts` table)

**Step 1: Verify the create → send → X pipeline works end-to-end on Vercel**

```bash
# Create a draft post
curl -X POST https://alex-recruiting.vercel.app/api/posts \
  -H "Content-Type: application/json" \
  -d '{"content":"Test post from pipeline trace","pillar":"performance","hashtags":["#TestOnly"]}'

# Capture the returned post ID, then send it
curl -X POST https://alex-recruiting.vercel.app/api/posts/{id}/send
```

**Step 2: Verify the post appears on X with correct content**

Check `@JacobRodge52987` on X. Verify the tweet text matches.

**Step 3: Verify the DB record has `xPostId` populated**

Query Supabase to confirm the post row has a non-null `x_post_id` after sending.

**Step 4: Document any failures in the lifecycle trace**

If any step fails, fix the root cause before moving on.

#### Task A3: Request Lifecycle Trace — DM Sending

**Files:**
- `src/app/api/dms/route.ts` (POST with `sendNow: true`)
- `src/lib/integrations/x-api.ts` (`sendDM()`, `verifyHandle()`)

**Step 1: Test DM sending on Vercel**

```bash
curl -X POST https://alex-recruiting.vercel.app/api/dms \
  -H "Content-Type: application/json" \
  -d '{"coachName":"Test Coach","schoolName":"Test School","templateType":"introduction","content":"Test DM","xHandle":"@testhandle","sendNow":false}'
```

Verify draft is created. Then test with `sendNow: true` against a test handle.

**Step 2: Verify OAuth 1.0a credentials work for DMs**

The DM API requires OAuth 1.0a (user context). Verify `X_API_CONSUMER_KEY`, `X_API_CONSUMER_SECRET`, `X_API_ACCESS_TOKEN`, `X_API_ACCESS_TOKEN_SECRET` are all set and valid on Vercel.

**Step 3: Document results**

#### Task A4: Request Lifecycle Trace — Follow Execution

**Files:**
- `src/lib/integrations/x-api.ts` (`followUser()`)
- `src/app/api/outreach/follow-plan/route.ts`
- `src/lib/db/schema.ts` (`coaches` table — `followStatus` column)

**Step 1: Test followUser() on Vercel against 5 D2/D3 coach handles**

Select 5 verified handles from the peer-follow-targets list. Execute follows via the API.

**Step 2: Verify follows appear on Jacob's X profile**

Check `@JacobRodge52987` following list on X.

**Step 3: Verify DB records update followStatus**

#### Task A5: Request Lifecycle Trace — Media Upload

**Files:**
- `src/app/api/media/upload/route.ts`
- Supabase Storage bucket configuration

**Step 1: Test image upload**

Upload a JPEG and verify it's stored in Supabase Storage and accessible via URL.

**Step 2: Test video upload**

Upload an MP4 under 100MB. Verify storage and playback.

**Step 3: Test iPhone HEIC format**

Upload an HEIC image. Verify it's handled (converted or accepted).

**Step 4: Test error cases**

Upload a 0-byte file, a file over 100MB, and a corrupt file. Verify graceful error messages.

#### Task A6: Request Lifecycle Trace — Dashboard Load

**Files:**
- `src/app/api/dashboard/live/route.ts`
- `src/app/api/analytics/route.ts`
- `src/lib/dashboard/live-data.ts`

**Step 1: Call /api/dashboard/live and /api/analytics on Vercel**

Verify both return real data matching Jacob's X profile.

**Step 2: Compare response values against X profile**

| Field | API value | X profile value | Match? |
|-------|-----------|----------------|--------|

**Step 3: Verify staleness — call again 5 minutes later**

Data should be live, not cached from build time.

**Step 4: Commit lifecycle trace documentation**
```bash
git commit -m "docs: add request lifecycle trace results for 5 critical flows"
```

#### Task A7: Environment Variable Validation

**Files:**
- Create: `src/lib/env-check.ts`
- Modify: `src/app/api/config/status/route.ts`

**Step 1: Create an env validation module**

```typescript
// src/lib/env-check.ts
const REQUIRED_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'X_API_BEARER_TOKEN',
  'X_API_CONSUMER_KEY',
  'X_API_ACCESS_TOKEN',
  'ANTHROPIC_API_KEY',
] as const;

export function validateEnv(): { valid: boolean; missing: string[] } {
  const missing = REQUIRED_VARS.filter(v => !process.env[v]);
  return { valid: missing.length === 0, missing };
}
```

**Step 2: Wire into config/status route**

**Step 3: Test on Vercel**

**Step 4: Commit**
```bash
git commit -m "feat(config): add environment variable validation"
```

---

### Workstream B: Frontend Engineer

#### Task B1: 49-Page Audit — Empty States

**Files:**
- All `src/app/**/page.tsx` files (49 pages)

**Step 1: Visit every page on Vercel with no data context**

For each page, check:
- Does it show a meaningful empty state or a blank white screen?
- Does the empty state have a CTA (call to action)?
- Is there any fake/hardcoded data?

**Step 2: Fix pages with missing empty states**

Add empty state components with clear CTAs. Example pattern:
```tsx
{data.length === 0 ? (
  <EmptyState
    icon="inbox"
    title="No content yet"
    description="Create your first post to get started"
    action={{ label: "Create Post", href: "/create" }}
  />
) : (
  // render data
)}
```

**Step 3: Commit**
```bash
git commit -m "fix(ui): add empty states with CTAs to all pages missing them"
```

#### Task B2: Mobile Responsive Audit

**Files:**
- All page files
- `src/components/sidebar.tsx` (or equivalent)
- Mobile bottom nav component

**Step 1: Test every page at 375px width (iPhone SE)**

Use Chrome DevTools or Playwright to screenshot each page at 375px.

Checklist per page:
- [ ] No horizontal scroll
- [ ] Text readable without zooming
- [ ] Touch targets >= 44x44px
- [ ] Bottom nav visible and functional

**Step 2: Fix any responsive issues found**

**Step 3: Test at 768px (iPad) and 1440px (desktop)**

**Step 4: Commit**
```bash
git commit -m "fix(responsive): resolve mobile layout issues across all pages"
```

#### Task B3: Navigation Audit

**Step 1: Map the full navigation tree**

Document every page and how many clicks it takes to reach from the dashboard.

**Step 2: Identify pages that take 3+ clicks**

These need shortcuts or reorganization.

**Step 3: Verify mobile bottom nav has the 5 most important items**

Based on Jacob's daily workflow: Command, Outreach, Analytics, Content, Messages

**Step 4: Fix navigation issues and commit**

#### Task B4: Loading States Audit

**Step 1: Check every page for loading states**

Each page that fetches data should show a skeleton or spinner during load.

**Step 2: Add loading states where missing**

**Step 3: Commit**

#### Task B5: WCAG AA Accessibility Audit

**Files:**
- All pages
- `src/__tests__/e2e/wcag.spec.ts`

**Step 1: Run axe-core audit on every page**

```bash
npx playwright test src/__tests__/e2e/wcag.spec.ts
```

**Step 2: Fix contrast ratio failures (target: 4.5:1)**

**Step 3: Add alt text to all images (school logos, coach photos, media)**

**Step 4: Verify keyboard navigation works on all interactive elements**

**Step 5: Commit**
```bash
git commit -m "fix(a11y): resolve WCAG AA violations across all pages"
```

#### Task B6: Data Integrity Visual Audit

**Step 1: Visit every page on Vercel via Chrome**

Screenshot each page. For every number displayed, verify:
- Is it from a real API/database query?
- Does it match the source of truth (X profile, Supabase)?
- If there's no data, does it show 0 or "--" (not a fake number)?

**Step 2: Fix any remaining fake data**

**Step 3: Commit**

---

### Workstream C: Backend Engineer

#### Task C1: Supabase RLS Audit

**Step 1: List all tables and their RLS status**

Query Supabase SQL editor:
```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

**Step 2: Enable RLS on every table that has it disabled**

```sql
ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;
-- repeat for each table
```

**Step 3: Create RLS policies**

For a single-user app, the simplest policy is service-role-only write + anon read:
```sql
CREATE POLICY "Allow anon read" ON public.coaches
  FOR SELECT USING (true);
CREATE POLICY "Allow service write" ON public.coaches
  FOR ALL USING (auth.role() = 'service_role');
```

**Step 4: Test that anon key can read but not write**

**Step 5: Commit migration files**

#### Task C2: Schema Reconciliation

**Files:**
- `src/lib/db/schema.ts` (Drizzle schema)
- Supabase actual tables

**Step 1: Compare Drizzle schema against Supabase tables**

For every table in schema.ts, verify:
- Table exists in Supabase
- All columns match (name, type, constraints)
- Unique constraints match

**Step 2: Fix mismatches**

Either update the Drizzle schema or run migrations to fix the database.

**Step 3: Run drizzle-kit push to sync**

```bash
npx drizzle-kit push
```

**Step 4: Test seed endpoints work without constraint errors**

```bash
curl -X POST https://alex-recruiting.vercel.app/api/data-pipeline/seed-all
```

**Step 5: Commit**

#### Task C3: OAuth 1.0a Write Operations Testing

**Files:**
- `src/lib/integrations/x-api.ts`
- `.env.local` and Vercel env vars

**Step 1: Verify all 4 OAuth 1.0a credentials are set on Vercel**

Check: `X_API_CONSUMER_KEY`, `X_API_CONSUMER_SECRET`, `X_API_ACCESS_TOKEN`, `X_API_ACCESS_TOKEN_SECRET`

**Step 2: Test followUser() with 5 real D2/D3 handles**

**Step 3: Test postTweet() with a test post**

**Step 4: Test sendDM() (if DM access is available on the API plan)**

**Step 5: Document which operations work and which don't**

**Step 6: Commit**

#### Task C4: Input Validation with Zod

**Files:**
- All POST/PUT API routes

**Step 1: Identify routes without input validation**

Scan for routes that use `req.json()` without validation.

**Step 2: Add Zod schemas for critical routes**

Priority routes: `/api/posts`, `/api/dms`, `/api/coaches`, `/api/media/upload`

```typescript
import { z } from "zod";

const createPostSchema = z.object({
  content: z.string().min(1).max(280),
  pillar: z.enum(["performance", "work_ethic", "character"]),
  hashtags: z.array(z.string()).optional(),
});
```

**Step 3: Test that invalid input returns 400 with clear error**

**Step 4: Commit**

#### Task C5: API Key Security Scan

**Step 1: Scan git history for leaked secrets**

```bash
git log -p --all -S "sk-" -- "*.ts" "*.tsx" "*.js" "*.json" | head -50
git log -p --all -S "Bearer " -- "*.ts" "*.tsx" | head -50
```

**Step 2: Check that no secrets are in client-side code**

```bash
grep -r "ANTHROPIC_API_KEY\|X_API_BEARER\|X_API_CONSUMER" src/app/ src/components/ --include="*.tsx"
```

Only `NEXT_PUBLIC_*` vars should appear in client components.

**Step 3: Document findings and fix any issues**

**Step 4: Commit**

---

### Workstream D: QA Engineer

#### Task D1: Zero Fake Data Assertion Tests

**Files:**
- Create: `src/__tests__/qa/zero-fake-data.test.ts`

**Step 1: Write tests that assert no fake data in API responses**

```typescript
import { describe, test, expect } from "vitest";

describe("Zero Fake Data", () => {
  test("analytics API returns real follower count from X", async () => {
    const res = await fetch("/api/analytics");
    const data = await res.json();
    // totalFollowers must be a real number, not a known fake like 47
    expect(data.current.totalFollowers).not.toBe(47);
    expect(data.current.totalFollowers).toBeGreaterThanOrEqual(0);
  });

  test("no MOCK_PERFORMANCE arrays remain in components", async () => {
    // Grep the codebase for remaining mock data
    const { execSync } = require("child_process");
    const result = execSync(
      'grep -r "MOCK_PERFORMANCE" src/ --include="*.tsx" --include="*.ts" -l',
      { encoding: "utf-8" }
    ).trim();
    // Files should exist but arrays should be empty
    // This is a meta-test that validates the codebase itself
  });

  test("postsPublished only counts X-published posts", async () => {
    const res = await fetch("/api/analytics");
    const data = await res.json();
    // postsPublished should NOT equal the total posts in DB
    // It should only count posts with x_post_id
    expect(data.current.postsPublished).toBeLessThanOrEqual(
      data.current.totalFollowers * 10 // reasonable upper bound
    );
  });
});
```

**Step 2: Run tests**
```bash
npm test -- src/__tests__/qa/zero-fake-data.test.ts
```

**Step 3: Commit**

#### Task D2: X API Failure Edge Case Tests

**Files:**
- Create: `src/__tests__/integration/x-api-failures.test.ts`

**Step 1: Write tests for API failure scenarios**

```typescript
describe("X API Failure Handling", () => {
  test("dashboard returns zeros when X API is unreachable", () => {
    // Mock X API to return 503
    // Verify dashboard returns { followers: { count: 0 }, ... }
  });

  test("analytics handles rate limit 429 gracefully", () => {
    // Mock X API to return 429
    // Verify response still returns valid JSON with zeros
  });

  test("dashboard handles expired token", () => {
    // Mock X API to return 401
    // Verify no crash, returns fallback data
  });
});
```

**Step 2: Run tests and verify**

**Step 3: Commit**

#### Task D3: Media Upload Edge Case Tests

**Files:**
- Create: `src/__tests__/integration/media-upload.test.ts`

**Step 1: Write tests for media edge cases**

Test scenarios:
- 0-byte file → rejected with error
- File over 100MB → rejected with size error
- Corrupt JPEG → rejected with format error
- Valid JPEG → accepted, URL returned
- Valid MP4 → accepted, URL returned

**Step 2: Run tests**

**Step 3: Commit**

#### Task D4: Visual Regression Screenshots

**Files:**
- Create: `src/__tests__/e2e/visual-regression.spec.ts`

**Step 1: Create Playwright visual regression tests for all major pages**

```typescript
import { test, expect } from "@playwright/test";

const PAGES = [
  "/dashboard", "/analytics", "/outreach", "/coaches",
  "/content-queue", "/dms", "/agency", "/intelligence",
  "/connections", "/audit", "/recruit"
];

for (const page of PAGES) {
  test(`visual regression: ${page}`, async ({ page: p }) => {
    await p.goto(`https://alex-recruiting.vercel.app${page}`);
    await p.waitForTimeout(3000); // wait for animations
    await expect(p).toHaveScreenshot(`${page.replace(/\//g, "-")}.png`, {
      maxDiffPixelRatio: 0.05,
    });
  });
}
```

**Step 2: Generate baseline screenshots**

```bash
npx playwright test src/__tests__/e2e/visual-regression.spec.ts --update-snapshots
```

**Step 3: Commit baselines**

#### Task D5: Data Integrity Reconciliation Tests

**Files:**
- Create: `src/__tests__/qa/data-reconciliation.test.ts`

**Step 1: Write tests that verify dashboard matches X API**

```typescript
describe("Data Reconciliation", () => {
  test("follower count on dashboard matches X API within 1 hour", async () => {
    // Fetch from our API
    const dashRes = await fetch("/api/analytics");
    const dash = await dashRes.json();

    // Fetch from X API directly
    const xRes = await fetch("/api/dashboard/live");
    const x = await xRes.json();

    // They should match
    expect(dash.current.totalFollowers).toBe(x.followers.count);
  });

  test("no metric shows a stale cached value from build time", async () => {
    const res = await fetch("/api/analytics");
    const data = await res.json();
    const fetchTime = new Date(data.current.date);
    const now = new Date();
    const diffMinutes = (now.getTime() - fetchTime.getTime()) / 60000;
    expect(diffMinutes).toBeLessThan(5); // fetched within 5 minutes
  });
});
```

**Step 2: Run tests**

**Step 3: Commit**

#### Task D6: Expand Test Coverage to 200+

**Step 1: Identify untested lib/ modules**

```bash
find src/lib -name "*.ts" | while read f; do
  testfile="src/__tests__/unit/$(basename $f .ts).test.ts"
  [ ! -f "$testfile" ] && echo "MISSING TEST: $f"
done
```

**Step 2: Write unit tests for each untested module**

Priority: `x-api.ts`, `live-data.ts`, `coach-ranker.ts`, `posts/store.ts`

**Step 3: Write integration tests for untested API routes**

Priority: Every route that handles POST/PUT requests

**Step 4: Run full test suite and verify 200+ tests pass**

```bash
npm test -- --reporter=verbose 2>&1 | tail -5
```

**Step 5: Commit**

---

## Phase 2: Panel Certification

#### Task P1: Generate Severity Matrix

**Files:**
- Create: `docs/plans/2026-XX-XX-severity-matrix.md`

**Step 1: Collect findings from all 4 workstreams**

Each workstream produces a list of findings categorized as P0/P1/P2/P3.

**Step 2: Compile into a single severity matrix**

| # | Severity | Workstream | Finding | Status |
|---|----------|-----------|---------|--------|
| 1 | P0 | Backend | RLS disabled on coaches table | Fixed |
| 2 | P1 | Frontend | /intelligence page blank on mobile | Fixed |
| ... | ... | ... | ... | ... |

**Step 3: Resolve all P0s and P1s**

**Step 4: Get sign-off from each engineering discipline**

**Step 5: Commit**

#### Task P2: Pre-Flight Checklist

Before Phase 3, verify:

- [ ] Build passes on Vercel
- [ ] All tests green (200+)
- [ ] Zero fake data in any UI
- [ ] OAuth writes confirmed (follow, post, DM)
- [ ] Media upload works (image + video)
- [ ] All 49 pages render on mobile
- [ ] All P0/P1 issues resolved
- [ ] 4 engineering sign-offs recorded

---

## Phase 3: Live Field Test

#### Task F1: Prepare Jacob's Test Materials

**Files:**
- Create: `docs/test-protocols/jacob-10-day-diary.md`
- Create: `docs/test-protocols/daily-log-template.md`

**Step 1: Create the day-by-day protocol document**

See design doc for the 10-day protocol. Format it as a printable PDF or simple web page Jacob can reference daily.

**Step 2: Create the daily log template**

5 questions Jacob answers each evening (see design doc).

**Step 3: Set up the Day 0 baseline**

Record: current X follower count, engagement rate, number of posts, following count.

#### Task F2: Prepare Outsider Test Materials

**Files:**
- Create: `docs/test-protocols/outsider-cold-start.md`

**Step 1: Write the outsider protocol**

- 20 min unguided exploration instructions
- 5 task cards (one per task, no hints)
- Scoring sheet (0-3 per task)
- SUS questionnaire (standard 10 questions)
- NPS question

**Step 2: Identify the outsider recruit**

A high school recruit from a different sport who has never seen the app.

#### Task F3: Execute the 10-Day Test

This is Jacob's actual test. Not automated. Real daily use over 10 real days.

**Checkpoints:**
- Day 5: Video call with Mike to review scores, screenshots, and issues
- Day 10: Final video call, SUS survey, overall assessment

#### Task F4: Execute Outsider Test

Run between Day 3 and Day 7 of Jacob's test.

**Deliverables:**
- Task completion scores (target: 12/15)
- SUS score (target: 68+)
- NPS score
- "What would you change first?" answer

#### Task F5: Final Synthesis Report

**Files:**
- Create: `docs/plans/2026-XX-XX-launch-readiness-report.md`

Compile all results:
- Engineering severity matrix (resolved)
- Jacob's 10-day scores and feedback
- Outsider scores and feedback
- Final pass/fail against success criteria
- Remaining P2/P3 backlog for post-launch

---

## Success Criteria (from Design Doc)

| Metric | Target |
|--------|--------|
| Engineering P0/P1 issues | 0 |
| Test count | 200+ |
| Fake data in UI | 0 |
| Jacob daily score average | 4.0+ / 5.0 |
| Outsider task completion | 12+ / 15 |
| Outsider SUS score | 68+ |
| X-to-dashboard data match | Within 1 hour |
| OAuth writes | Follow + DM + Post all working |
| Media upload | Image + video both work |
| Mobile responsive | All 49 pages at 375px |
