# Backend API Audit — March 17, 2026

## 26 Issues Found (7 Critical, 6 High, 9 Medium, 4 Low)

### Already Fixed
- #1 `/api/dashboard/live` fake fallbacks → Fixed in e354d42
- #2 `/api/dashboard/competitors` fake fallbacks → Fixed in e354d42
- #3 `live-data.ts` 6.2 engagement fallback → Fixed in e354d42

### Critical — Still Open

**#4 File-based post store breaks on Vercel**
- File: `src/lib/posts/store.ts`
- Uses `fs.readFileSync/writeFileSync` — read-only on Vercel serverless
- Fix: Remove file store, use Supabase only, return 503 if DB not configured

**#5 `/api/coaches` GET returns fabricated coach data when DB unavailable**
- File: `src/app/api/coaches/route.ts` lines 13-32, 135-144
- `coachStore` is fabricated array from targetSchools
- Fix: Return `{ coaches: [], total: 0 }` when Supabase unavailable

**#6 `/api/coaches` POST uses in-memory store — data lost on Vercel**
- File: `src/app/api/coaches/route.ts` lines 202-227
- Fix: Return 503 if Supabase not configured

**#7 `/api/dms` POST uses in-memory store — data lost on Vercel**
- File: `src/app/api/dms/route.ts` lines 6, 159-174
- Fix: Return 503 if Supabase not configured

### High — Still Open

**#8 Weak cron secret validation on `/api/outreach/process`**
- If CRON_SECRET not set, endpoint is open to public
- Fix: Reject all requests when secret not configured

**#9 Same issue on `/api/content/schedule`**
- Can trigger post publishing without auth

**#10 `/api/coaches/research` returns fake counts on scrape failure**
- coachesFound: 3 (fake), articlesFound: 5 (fake)
- Fix: Return 0 when services fail

**#11 `/api/coaches/scrape-x` persists MOCK analysis to database**
- `generateMockAnalysis` → stored in `coachBehaviorProfiles` as real
- Fix: Skip DB write for mock data

**#12 `/api/content/queue` PATCH lies about success when DB not configured**
- Returns `{ success: true }` even though nothing was saved
- Fix: Return 503

**#13 No authentication on ANY data-mutation route**
- All POST/PUT/PATCH endpoints are public
- Anyone can create coaches, approve posts, send tweets, send DMs
- Fix: Add auth middleware (at minimum, bearer token check)

### Medium (9 issues) — see full audit for details
- Analytics history fake entry, inconsistent DB checks, no input validation on DMs/posts/coaches, no idempotency on DM sequences/follow plans, module-level cache, unprotected email queue

### Low (4 issues) — see full audit for details
- Empty fallback on coach-activity, Date.now() ID collisions, missing route-utils check, Anthropic API key consumption
