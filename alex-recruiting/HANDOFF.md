# Alex Recruiting — Session Handoff (March 17, 2026 — Evening)

## Start Here

Copy the prompt at the bottom of this file into a new Claude Code session to continue.

## What Was Accomplished This Session

1. **349 verified X/Twitter follow targets** built from 5 parallel research agents — real handles confirmed via web search across college coaches (D3/D2/FCS/FBS), recruiting media, WI HS community, strength training, and peer recruits
2. **26-week follow schedule** at 7-8 follows/week, phased by priority (D2/D3 first → FCS → FBS → media → community)
3. **Fake fallback data removed** from `src/lib/dashboard/live-data.ts` — no more fake 47 followers, 3 coach follows, 6.2% engagement
4. **Database connected** — `JIB_DATABASE_URL` added to `.env.local` and Vercel, missing tables created (`engagement_actions`, `growth_snapshots`, `rec_tasks`, `outreach_learnings`, `dm_sequences`, `camps`, etc.)
5. **Database seeded** — 424 coaches, 687 schools, 17 posts, 17 DMs, 110 tasks, 8 panel coaches, 15 competitors
6. **Deployed to Vercel** — https://alex-recruiting.vercel.app — build succeeds, env vars set (bearer token fixed from %3D encoding issue)
7. **X API confirmed working on Vercel** — `/api/analytics` returns real data: `totalFollowers: 3, coachFollows: 0, postsPublished: 17, avgEngagementRate: 4.51`

## What Is Broken — Must Fix

### Critical: Analytics page shows 0 despite API returning 3
- `/api/analytics` returns correct data (verified via curl on Vercel)
- But the analytics page component renders 0 — likely a client-side fetch issue or the page is reading from `getDashboardSnapshot()` server function which may be caching/erroring
- File: `src/app/analytics/page.tsx` fetches from `/api/analytics` on client side
- The dashboard snapshot in `src/lib/dashboard/live-data.ts` calls X API — verify it works on Vercel serverless

### Critical: OAuth 1.0a write operations not tested
- Bearer token (read) works on Vercel ✅
- OAuth 1.0a (write — follow, DM, post) needs testing on Vercel
- Keys set: `X_API_CONSUMER_KEY`, `X_API_CONSUMER_SECRET`, `X_API_ACCESS_TOKEN`, `X_API_ACCESS_TOKEN_SECRET`
- `X_API_CLIENT_SECRET` is EMPTY in `.env.local` — may need to be set for OAuth 2.0
- Write functions: `followUser()`, `sendDM()`, `postTweet()` in `src/lib/integrations/x-api.ts`

### Critical: Multiple pages show empty/zero data
- **Outreach page** — "Total Coaches: 0" even though 424 coaches in DB (queries different table/view)
- **Content Queue** — "No content queued yet" because it reads `scheduled_posts` table, not `posts` table
- **Analytics** — follower count shows 0 on page despite API returning 3
- **Connections page** — may not be pulling from peer-follow-targets correctly

### High: Database schema mismatches
- Seed endpoints use Supabase `.upsert()` with `onConflict` that requires unique constraints
- Many constraints missing — coaches, posts, competitor_recruits, dm_messages all fail on upsert
- Some tables have columns named differently than Drizzle schema expects (e.g., `school_name` vs `school`, `content` vs `title`)
- Tables created via Supabase dashboard don't match Drizzle schema in `src/lib/db/schema.ts`

### High: No "What to do today" section for Jacob
- Jacob needs a daily action plan: what to post, who to follow, who to DM
- Currently no onboarding flow or task list for the user
- The AI Recommendation Engine on Command page gives generic advice

### Medium: Remaining fake/fallback data in codebase
- `Scout Velocity: 73/wk` on Command page — likely hardcoded
- Various `?? <number>` fallbacks across API routes and components
- 4 audit agents were launched — check their output files for results

## Audit Agents Launched (check output files)
- Fake data hunter: completed or in-progress
- Database audit: completed or in-progress
- Backend API audit: completed or in-progress
- Frontend page audit: completed or in-progress

## Architecture Quick Reference

- **Framework**: Next.js 15.5 App Router + React 18 + TypeScript
- **Database**: Supabase PostgreSQL via Drizzle ORM (`JIB_DATABASE_URL`)
- **AI**: Anthropic Claude SDK
- **X/Twitter**: OAuth 1.0a + Bearer token, functions in `src/lib/integrations/x-api.ts`
- **Deployment**: Vercel (https://alex-recruiting.vercel.app)
- **Testing**: Vitest — 657 passing, 1 pre-existing failure
- **Git root**: `/Users/mikerodgers/Desktop/alex-recruiting-project/alex-recruiting`
- **Next.js root**: `alex-recruiting/` subdirectory (rootDirectory set in Vercel)

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/dashboard/live-data.ts` | X API calls for real-time metrics (followers, engagement, coach follows) |
| `src/lib/integrations/x-api.ts` | All X API functions: follow, DM, post, verify handle |
| `src/lib/data/peer-follow-targets.ts` | 349 follow targets with 26-week schedule |
| `src/lib/data/content-calendar-30d.ts` | 17 Coach Panel approved posts |
| `src/lib/data/cold-dms.ts` | DM templates by tier |
| `src/lib/db/schema.ts` | Drizzle database schema |
| `src/app/api/analytics/route.ts` | Analytics API endpoint |
| `src/app/api/outreach/follow-plan/route.ts` | Follow plan with weekly batches |
| `src/app/api/data-pipeline/seed-all/route.ts` | Seed orchestrator |
| `.env.local` | All API keys (21+ services) |

## Jacob's Real X Account

- Handle: `@JacobRodge52987`
- User ID: `2029703725091328001`
- Real followers: 3
- Real following: 9
- Real tweets: 8
- Bio: "OL/DL | 6'4\" 285 | Pewaukee HS '29"

## Vercel Environment

- Project: `alex-recruiting` on `michael-rodgers-projects-e4209a00`
- URL: https://alex-recruiting.vercel.app
- Node: 20.x
- 26 env vars configured for production

## Git Commits This Session
- `a9f9725` feat(outreach): expand follow targets to 349 verified handles with 26-week schedule
- `512a345` fix(data): remove all fake fallback values — show 0 when no real data
