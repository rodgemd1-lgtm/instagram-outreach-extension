# 25X Launch Readiness Plan

## Date: 2026-03-17
## Status: Phase 2 — Panel Certification

---

## Phase 1: Engineering Fix Sprint (COMPLETE)

Four AI engineering workstreams ran in parallel. All merged to main.

### Workstream A — Full-Stack Engineer
- 88 API routes with `force-dynamic` (was 21)
- 15+ error handlers standardized to `{ error, details }` with `console.error`
- `src/lib/env-check.ts` created + wired into `/api/config/status`
- 5 broken imports repaired from bulk-insertion script

### Workstream B — Frontend Engineer
- Competitors page bug: `data.followers` (object) → `data.followers.count`
- Competitors page bug: `data.postsPerWeek` → `data.posts.thisWeek`
- Competitors page bug: `data.engagementRate` → `data.engagement.rate`
- Empty states improved: accomplishments, coaches, DMs
- Loading states added: agency, competitors, youtube-studio

### Workstream C — Backend Security Engineer
- Zod validation on 4 critical routes: posts, DMs, coaches, media/upload
- MIME type allowlist (7 types) on media upload
- Path traversal prevention on media upload
- CoachRow interface: added 3 missing columns (school_slug, dl_need_score, position_type)
- DMs route: fixed body mutation bug
- API key security scan: CLEAN (no leaks in git history)
- 11 missing unique constraints documented

### Workstream D — QA Engineer
- 105 new tests (685 → 790 total)
- 8 zero-fake-data regression guards
- 11 X API error handling tests
- 9 data integrity assertions on API routes
- 6 previously untested modules now covered

### Pre-Sprint Fixes (Earlier in Session)
- Analytics page: added `force-dynamic` to 7 API routes
- Outreach API: added Supabase REST fallback
- Dashboard: removed fake profileVisits, fake pipeline activity
- Posts Published: now only counts X-published posts (not DB drafts)
- All fake `?? <non-zero>` fallbacks eliminated

---

## Phase 2: Panel Certification — Severity Matrix

### Severity Definitions

| Level | Definition | Gate |
|-------|-----------|------|
| **P0 — Critical** | App broken, data loss, security vulnerability, fake data displayed | Must fix before ANY user touches it |
| **P1 — Major** | Feature doesn't work as expected, significant UX friction | Must fix before Jacob's 10-day test |
| **P2 — Minor** | Works but could be better, minor visual issues | Fix within 2 weeks |
| **P3 — Enhancement** | Nice to have, polish, optimization | Backlog |

---

### P0 — Critical Issues

| # | Issue | Source | Status | Fix |
|---|-------|--------|--------|-----|
| P0-1 | MOCK_PERFORMANCE arrays in content-manager.tsx and manage/page.tsx display fake engagement metrics | Workstream D audit | **OPEN** | Replace with empty arrays or real API data |
| P0-2 | `generateMockRankings()` creates 30+ fake prospect profiles with names | Fake data audit | **OPEN** | Return empty array when real data unavailable |
| P0-3 | `generateMockRosterData()` fabricates roster composition by division | Fake data audit | **OPEN** | Return empty array when real data unavailable |
| P0-4 | `generateMockCamps()` creates fake camp listings with estimated prices | Fake data audit | **OPEN** | Return empty array when real data unavailable |
| P0-5 | `generateMockNews()` generates 10 fabricated CFB articles with fake sources | Fake data audit | **OPEN** | Return empty array when real data unavailable |
| P0-6 | `generateMockSnapshot()` uses hardcoded base social metrics (142 followers, etc.) | Fake data audit | **OPEN** | Return zeros when real data unavailable |
| P0-7 | `generateMockAnalysis()` returns fabricated coach behavior patterns by tier | Fake data audit | **OPEN** | Return empty analysis when real data unavailable |
| P0-8 | 11 missing unique constraints cause seed endpoints to fail | Workstream C | **DOCUMENTED** | Add `uniqueIndex()` to Drizzle schema, run push |

### P1 — Major Issues

| # | Issue | Source | Status | Fix |
|---|-------|--------|--------|-----|
| P1-1 | OAuth 1.0a write operations untested on Vercel (followUser, sendDM, postTweet) | Original requirements | **OPEN** | Test with 5 real D2/D3 coach handles |
| P1-2 | `X_API_CLIENT_SECRET` env var is empty — unclear if needed for writes | Original requirements | **OPEN** | Determine if consumer secret is required |
| P1-3 | Outreach page shows "Total Coaches: 0" despite 424 in DB | Workstream B agent | **PARTIALLY FIXED** | Supabase REST fallback added but needs Vercel verification |
| P1-4 | Content Queue reads `posts` table correctly but no seeded content appears | Outreach agent | **OPEN** | Verify content seed pipeline end-to-end |
| P1-5 | No "What to Do Today" daily action plan on Command page | Original requirements | **OPEN** | Build daily action plan component |
| P1-6 | Connections page uses static `scraperTargets` — not connected to live follow data | Outreach agent | **OPEN** | Wire to coaches DB for follow status sync |
| P1-7 | Row Level Security (RLS) status unknown on Supabase tables | Research agent | **OPEN** | Audit RLS on all tables, especially those hit by anon key |
| P1-8 | No staleness indicators on dashboard metrics | Research agent | **OPEN** | Add "last updated: X ago" to all API-sourced metrics |

### P2 — Minor Issues

| # | Issue | Source | Status | Fix |
|---|-------|--------|--------|-----|
| P2-1 | 1 pre-existing test failure (quality-checks.test.ts console.log scan) | Test suite | **OPEN** | Fix console.log references or update test |
| P2-2 | Worktree directories committed as git submodules | Merge commit | **OPEN** | Remove from git tracking |
| P2-3 | Navigation: 49 pages may overwhelm a 14-year-old — no clarity audit done | Research agent | **OPEN** | Run 5-second test on key pages |
| P2-4 | No Content Security Policy (CSP) headers | Research agent | **OPEN** | Add CSP to next.config.js or middleware |
| P2-5 | No CORS restriction on API routes | Research agent | **OPEN** | Restrict to app domain |
| P2-6 | WCAG 2.1 AA audit needed across all pages (only 1 spec file exists) | Research agent | **OPEN** | Expand e2e WCAG tests |
| P2-7 | No Lighthouse CI integration | Research agent | **OPEN** | Add to CI pipeline |

### P3 — Enhancements

| # | Issue | Source | Status | Fix |
|---|-------|--------|--------|-----|
| P3-1 | Add `detect-secrets` or `gitleaks` pre-commit hook | Workstream C | Backlog | Add to dev workflow |
| P3-2 | Add visual regression tests (Playwright `toHaveScreenshot()`) for all pages | Research agent | Backlog | Build screenshot test suite |
| P3-3 | Dark mode support | Research agent | Backlog | Design system extension |
| P3-4 | Keyboard shortcuts for power users | Research agent | Backlog | Add to settings |
| P3-5 | Rate limit tracking UI showing X API quota usage | Research agent | Backlog | Dashboard widget |

---

### Panel Certification Gate

| Discipline | Verdict | Blocking Issues |
|-----------|---------|-----------------|
| Full-Stack | **CONDITIONAL PASS** | P0-8 (schema constraints) must be resolved |
| Frontend | **CONDITIONAL PASS** | P0-1 (MOCK_PERFORMANCE) must be removed |
| Backend | **CONDITIONAL PASS** | P1-1/P1-2 (OAuth writes) must be tested |
| QA | **CONDITIONAL PASS** | P0-1 through P0-7 (all mock generators) must be eliminated |

**Overall Verdict: CONDITIONAL PASS — 8 P0s and 8 P1s must be resolved before Phase 3 begins.**

---

## Phase 3: Field Testing Protocols

See companion documents:
- `.claude/plans/2026-03-17-jacob-10day-protocol.md`
- `.claude/plans/2026-03-17-outsider-test-protocol.md`
- `.claude/plans/2026-03-17-daily-log-template.md`

---

## Execution Order

### Pre-Test Sprint (3-5 days)
1. Fix all P0 issues (eliminate every mock generator)
2. Fix P1-1/P1-2 (OAuth write operations)
3. Fix P1-5 (Daily Action Plan for Jacob)
4. Verify P1-3 on Vercel (outreach page coach count)
5. Fix P1-7 (RLS audit)
6. Fix P1-8 (staleness indicators)
7. Run full test suite — must be 100% green (except acknowledged pre-existing)
8. Deploy to Vercel — verify via Chrome on production

### Test Launch
9. Jacob begins 10-day diary study
10. Outsider recruit test on Day 3 and Day 7
11. Day 5 and Day 10 checkpoint calls with Mike

### Post-Test
12. Compile all findings into severity matrix v2
13. Fix any new P0/P1 issues surfaced during testing
14. Final panel certification
15. Production launch
