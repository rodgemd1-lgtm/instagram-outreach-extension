# The Foundry: Jacob Rodgers Recruiting Intelligence System

**Date:** March 7, 2026
**Status:** Approved
**Owner:** Susan (Orchestrator) + Agent Team

## Overview

The Foundry transforms Jacob's recruiting app from a collection of features into a fully operational recruiting machine. Every component uses real data, real automation, and real integrations — no fake data, no stubs.

## Current State

- 85%+ of infrastructure is built (camp management, DM engine, content engine, X API, coaches DB, NCSA leads)
- 29 Supabase tables provisioned, all API keys configured (15 services)
- Key gaps: auth bugs, empty databases, no automation running, missing UI for camps/media

## Architecture: Wire-First, Data-Second, Automate-Third

---

## Phase 0: Fix the Pipes (Day 1)

### 0.1 Fix sendDM() Auth
- **File:** `src/lib/integrations/x-api.ts`
- **Problem:** sendDM() uses Bearer Token (app-only) — DMs require user context
- **Fix:** Switch to OAuth 1.0a headers (same as postTweet()). Access Token now has DM permission.

### 0.2 Implement OAuth Callback
- **File:** `src/app/api/auth/callback/twitter/route.ts`
- **Action:** Exchange authorization code for user access token via `POST https://api.x.com/2/oauth2/token`
- **Storage:** New `oauth_tokens` Supabase table for user tokens
- **Redirect:** Back to app with success/error state

### 0.3 Create Supabase Storage Buckets
- `media` bucket — photos and videos (public read, authenticated write)
- `documents` bucket — reports, exports (private)
- New helper: `src/lib/supabase/storage.ts` — upload, download, list, delete, getPublicUrl

### 0.4 Commit & Push
- 22 modified + 31 new files uncommitted
- Delete duplicate files (CLAUDE 2.md, package 2.json, etc.)
- Push to remote, redeploy to Vercel with new X API keys

---

## Phase 1: Data Flood (Day 1-2)

### 1.1 Mega Coach Scraper
- **New file:** `src/lib/data-pipeline/mega-scraper.ts`
- **Scope:** ALL NCAA football programs
  - D1 FBS: 133 programs
  - D1 FCS: 130 programs
  - D2: 170+ programs
  - D3: 250+ programs
  - NAIA: 200+ programs
- **Per school:** name, conference, division, city, state, staff URL, roster URL, X handle
- **Per coach:** name, title, email (if public), X handle, recruiting area
- **Focus:** OL coaches, recruiting coordinators, head coaches
- **Tools:** Firecrawl + Jina + Brave Search
- **Storage:** `schools` + `coaches` Supabase tables
- **Target:** 900+ schools, 2,500+ coaches, ~5MB structured data
- **API:** `POST /api/data-pipeline/scrape` with progress tracking

### 1.2 Media Import Page
- **New file:** `src/app/media-import/page.tsx`
- Drag-and-drop zone + folder picker
- Accepts: JPG, PNG, HEIC, MP4, MOV
- Auto-uploads to Supabase `media` bucket
- Auto-categorizes: training, game, camp, portrait, team
- Generates video thumbnails
- Upload progress with preview grid

### 1.3 YouTube Data Sync
- **New file:** `src/lib/integrations/youtube.ts`
- YouTube Data API v3 (key configured)
- Sync video metadata (titles, views, likes) into `video_assets`
- Auto-detect new uploads for recruit page embedding

---

## Phase 2: Automation Engine (Day 2-3)

### 2.1 Content Rhythm (3x/Week)
- **Enhance:** `src/lib/content-engine/`
- Schedule: Monday (training), Wednesday (game film/stats), Friday (character)
- Each post uses REAL media from Supabase library
- AI-generated captions via Claude
- Auto-posts to X via OAuth 1.0a with media upload
- Cron-driven (already wired in vercel.json)

### 2.2 DM Outreach Automation
- **Enhance:** `src/lib/outreach/dm-sequences.ts`
- Activate Wave 0: Auto-DM all Tier 3 D2 coaches
- Personalized: coach name, school, Jacob's stats + highlights link
- Rate-limited: max 5 DMs/day
- Auto-follow coaches before DM
- Response tracking in `dmMessages` table
- Auto-pipeline: coach responds → lead status = "responded"

### 2.3 NCSA Scraper
- **New file:** `src/lib/scraping/ncsa-scraper.ts`
- Authenticated scraper (credentials in env vars)
- **Pull:** profile views, camp invitations, messages, saved searches
- **Competitor mode:** Class of 2029 OL recruits in WI/MN/IA region
- New leads → `ncsa_leads` table
- Camp invites → `camps` table + auto-tweet thank-you to inviting coach
- Runs on 4-hour cron cycle

---

## Phase 3: Camp & Media Hub (Day 3-4)

### 3.1 Camp Management Dashboard
- **New file:** `src/app/camps/page.tsx`
- Calendar view: upcoming, registered, attended
- Per-camp detail: cost, location, coaches, registration status
- Measurables tracker: bench, squat, deadlift, 40, shuttle
- Progress charts (improvement over time)
- "Should I go?" recommendation based on coach attendance + tier
- One-click registration status updates

### 3.2 Media Library Enhancement
- **Enhance:** `src/app/media/page.tsx`
- Grid view of all Supabase photos + videos
- Filter by category, tag management
- "Use in next post" quick action → queues for content engine
- Bulk operations (delete, re-categorize)

### 3.3 Accomplishments Tracker
- **New file:** `src/app/accomplishments/page.tsx`
- Log new PRs (dumbbell bench, squat) with video/photo
- Auto-saves media to Supabase
- One-click "Post this" → generates X post with media + caption
- History timeline showing progression

---

## Phase 4: Intelligence Layer (Day 4-5)

### 4.1 Loss Aversion on Recruit Page
- **Enhance:** recruit page components
- Live counters: profile views, camp invites, coaches following Jacob
- Data sources: NCSA scraper + X API + coach_inquiries table
- Competitor signal: "X Class of 2029 OL recruits in your region received D1 offers"
- All numbers are REAL — pulled from Supabase

### 4.2 X Follower Growth Engine
- **New file:** `src/lib/growth/auto-engage.ts`
- Auto-follow coaches from scraped database (10/day rate limit)
- Auto-like/repost coach content
- Track follow-back rate per division/tier
- Weekly growth report

### 4.3 Real-time Social Proof API
- **New file:** `src/app/api/recruit/social-proof/route.ts`
- Aggregates: coach followers, NCSA views, camp invites, contact submissions
- Powers loss aversion widgets on recruit page
- 1-hour cache, refreshes from Supabase

---

## Agent Team Assignments

| Agent | Phase | Responsibility |
|-------|-------|---------------|
| atlas-engineering | 0, 1.2, 3 | Fix pipes, media import, camp dashboard |
| nova-ai | 1.1, 2.1 | Mega scraper, content rhythm AI |
| aria-growth | 2.2, 4.2 | DM outreach, X follower growth |
| pulse-data-science | 2.3, 4.1, 4.3 | NCSA scraper, loss aversion, social proof |
| marcus-ux | 3.1, 3.3 | Camp UI, accomplishments tracker |
| forge-qa | All | Testing after each phase |

## New Files (14)

| File | Purpose |
|------|---------|
| src/lib/supabase/storage.ts | Storage bucket helpers |
| src/lib/data-pipeline/mega-scraper.ts | 900+ school scraper |
| src/app/media-import/page.tsx | Drag-drop media upload |
| src/lib/integrations/youtube.ts | YouTube Data API sync |
| src/lib/scraping/ncsa-scraper.ts | NCSA profile scraper |
| src/app/camps/page.tsx | Camp management dashboard |
| src/app/accomplishments/page.tsx | PR tracker + auto-post |
| src/lib/growth/auto-engage.ts | X follower growth engine |
| src/app/api/recruit/social-proof/route.ts | Loss aversion API |
| src/app/api/data-pipeline/scrape/route.ts | Scraper trigger API |
| src/app/api/ncsa/scrape/route.ts | NCSA scraper API |
| src/app/api/youtube/sync/route.ts | YouTube sync API |
| src/app/api/auth/callback/twitter/route.ts | OAuth callback (rewrite) |
| src/lib/supabase/storage.ts | Bucket upload/download |

## Modified Files (8)

| File | Change |
|------|--------|
| src/lib/integrations/x-api.ts | Fix sendDM() to use OAuth 1.0a |
| src/lib/outreach/dm-sequences.ts | Enable live DM automation |
| src/lib/content-engine/post-pipeline.ts | Wire real media from Supabase |
| src/components/recruit/social-proof.tsx | Add loss aversion counters |
| src/app/media/page.tsx | Enhance with Supabase grid |
| vercel.json | Add NCSA + growth cron jobs |
| src/lib/config/api-keys.ts | Add NCSA + YouTube services |
| src/app/recruit/page.tsx | Wire social proof API |

## Env Vars Added

| Variable | Service | Status |
|----------|---------|--------|
| NCSA_EMAIL | NCSA login | Done |
| NCSA_PASSWORD | NCSA login | Done |
| YOUTUBE_API_KEY | YouTube Data API v3 | Done |

## Success Criteria

1. Coaches DB has 900+ schools with 2,500+ coach profiles
2. 3 posts/week publishing automatically to X with real media
3. DM outreach running to Tier 3 coaches with personalized messages
4. NCSA scraper pulling profile views and camp invites every 4 hours
5. Camp invites auto-generate thank-you tweets
6. Recruit page shows real loss aversion data (views, invites, followers)
7. Media library contains all of Jacob's photos/videos from Mac Photos
8. Camp dashboard tracks registration, measurables, and recommendations
9. Zero fake data anywhere in the system
