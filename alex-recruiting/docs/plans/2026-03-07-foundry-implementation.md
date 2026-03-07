# The Foundry Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform Jacob's recruiting app into a fully operational system with real data, live automation, and zero stubs.

**Architecture:** 5-phase build — fix auth/storage pipes, flood with real data (900+ schools), wire automation (3x/week posting, DM outreach, NCSA scraper), build camp/media UI, add intelligence layer (loss aversion, follower growth).

**Tech Stack:** Next.js 14, Supabase (PostgreSQL + Storage), X API (OAuth 1.0a + v2), Firecrawl, Jina, YouTube Data API v3, Claude AI

---

## Phase 0: Fix the Pipes

### Task 1: Fix sendDM() to use OAuth 1.0a

**Files:**
- Modify: `src/lib/integrations/x-api.ts` (sendDM function)

**Step 1: Read x-api.ts and find the sendDM() function**

Locate the sendDM function. It currently tries Bearer Token first for DMs, which always fails. The fix: use `getOAuth1Headers()` as the primary method (same pattern as postTweet).

**Step 2: Update sendDM() to use OAuth 1.0a as primary**

The DM endpoint is `POST https://api.twitter.com/2/dm_conversations/with/:participant_id/messages`. Change the function to:
1. Build the URL with recipientId
2. Call `getOAuth1Headers("POST", apiUrl, {})` (empty params for v2 JSON body)
3. POST with `{ text }` body and the OAuth header
4. Fall back to Bearer Token only if OAuth1 fails

Pattern to follow — identical to postTweet():
```typescript
const apiUrl = `https://api.twitter.com/2/dm_conversations/with/${recipientId}/messages`;
const authHeader = getOAuth1Headers("POST", apiUrl, {});
const response = await axios.post(apiUrl, { text }, {
  headers: { Authorization: authHeader, "Content-Type": "application/json" },
});
```

**Step 3: Verify locally with a test DM**

Test by calling the function with a known X user ID. Check the response for a valid DM ID.

**Step 4: Commit**
```
feat: fix sendDM to use OAuth 1.0a (DM permission now enabled)
```

---

### Task 2: Create Supabase Storage Buckets + Helpers

**Files:**
- Create: `src/lib/supabase/storage.ts`

**Step 1: Create storage helper module**

```typescript
import { createAdminClient, isSupabaseConfigured } from "./admin";

const MEDIA_BUCKET = "media";
const DOCUMENTS_BUCKET = "documents";

export async function ensureBuckets() {
  if (!isSupabaseConfigured()) return;
  const supabase = createAdminClient();

  // Create media bucket (public read)
  await supabase.storage.createBucket(MEDIA_BUCKET, {
    public: true,
    fileSizeLimit: 104857600, // 100MB
    allowedMimeTypes: ["image/*", "video/*"],
  });

  // Create documents bucket (private)
  await supabase.storage.createBucket(DOCUMENTS_BUCKET, {
    public: false,
    fileSizeLimit: 52428800, // 50MB
  });
}

export async function uploadMedia(
  file: Buffer | Uint8Array,
  fileName: string,
  contentType: string,
  folder: string = "uploads"
): Promise<{ url: string; path: string } | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createAdminClient();
  const path = `${folder}/${Date.now()}-${fileName}`;

  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, file, { contentType, upsert: false });

  if (error) { console.error("Upload error:", error); return null; }

  const { data: { publicUrl } } = supabase.storage
    .from(MEDIA_BUCKET)
    .getPublicUrl(path);

  return { url: publicUrl, path };
}

export async function deleteMedia(path: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = createAdminClient();
  const { error } = await supabase.storage.from(MEDIA_BUCKET).remove([path]);
  return !error;
}

export async function listMedia(folder: string = "uploads"): Promise<Array<{name: string; url: string; size: number; createdAt: string}>> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage.from(MEDIA_BUCKET).list(folder, {
    sortBy: { column: "created_at", order: "desc" },
  });
  if (error || !data) return [];
  return data.map(f => ({
    name: f.name,
    url: supabase.storage.from(MEDIA_BUCKET).getPublicUrl(`${folder}/${f.name}`).data.publicUrl,
    size: f.metadata?.size || 0,
    createdAt: f.created_at || "",
  }));
}

export function getPublicUrl(path: string): string {
  const supabase = createAdminClient();
  return supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
}
```

**Step 2: Create bucket initialization API route**

Create `src/app/api/storage/init/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { ensureBuckets } from "@/lib/supabase/storage";

export async function POST() {
  try {
    await ensureBuckets();
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
```

**Step 3: Commit**
```
feat: add Supabase storage helpers + bucket initialization
```

---

### Task 3: Add NCSA + YouTube to API Key Registry

**Files:**
- Modify: `src/lib/config/api-keys.ts`

**Step 1: Add NCSA and YouTube entries to the getAPIKeyStatus() array**

Add after the Cron Secret entry:
```typescript
{
  service: "NCSA",
  configured: !!(process.env.NCSA_EMAIL && process.env.NCSA_PASSWORD),
  envVar: "NCSA_EMAIL + NCSA_PASSWORD",
  description: "NCSA recruiting platform login",
},
{
  service: "YouTube Data API",
  configured: !!process.env.YOUTUBE_API_KEY,
  envVar: "YOUTUBE_API_KEY",
  description: "YouTube channel stats and video metadata",
},
```

**Step 2: Commit**
```
feat: add NCSA + YouTube to API key registry
```

---

### Task 4: Clean Up Duplicates + Commit All Changes + Push

**Files:**
- Delete: All `* 2.*` duplicate files
- Stage: All 22 modified + new files

**Step 1: Delete duplicate files**
```bash
rm -f "CLAUDE 2.md" "README 2.md" "drizzle.config 2.ts" "next.config 2.mjs" \
  "package 2.json" "package-lock 2.json" "package-lock 3.json" \
  "postcss.config 2.mjs" ".env 2.example" ".eslintrc 2.json" ".gitignore 2"
```

**Step 2: Stage all changes**
```bash
git add -A
git reset -- .env .env.local .ncsa-leads.json  # Don't commit secrets or local data
```

**Step 3: Commit**
```
feat: foundry phase 0 — Supabase backend, design upgrades, YouTube Studio, all API keys configured
```

**Step 4: Push to remote**
```bash
git push origin main
```

**Step 5: Redeploy to Vercel**
```bash
npx vercel --prod --yes
```

---

## Phase 1: Data Flood

### Task 5: Build Mega Coach Scraper

**Files:**
- Create: `src/lib/data-pipeline/mega-scraper.ts`
- Create: `src/app/api/data-pipeline/scrape/route.ts`

**Step 1: Create the scraper module**

The scraper should:
1. Accept a division filter (D1_FBS, D1_FCS, D2, D3, NAIA, or ALL)
2. Use a hardcoded master list of NCAA programs by division (sourced from NCAA.org)
3. For each school, use Firecrawl to scrape the football staff directory page
4. Extract: coach names, titles, emails, X handles
5. Store results in `schools` + `coaches` Supabase tables
6. Return progress updates via a streaming response

Key implementation details:
- Use `FIRECRAWL_API_KEY` env var with Firecrawl's `/v1/scrape` endpoint
- Fallback to Jina reader (`https://r.jina.ai/{url}`) if Firecrawl fails
- Rate limit: 1 request per 2 seconds to avoid bans
- Parse staff pages with regex/heuristics for coach name patterns
- Store all data with `source: "scraper"` tag for auditing

The master school list should be a large const array with ~900 entries structured as:
```typescript
interface SchoolEntry {
  name: string;
  division: "D1_FBS" | "D1_FCS" | "D2" | "D3" | "NAIA";
  conference: string;
  state: string;
  city: string;
  staffUrl: string;    // Athletic staff directory page
  rosterUrl: string;   // Football roster page
  xHandle: string;     // School football X handle
}
```

Build this list by scraping NCAA member institution directories or use a pre-compiled dataset from web research.

**Step 2: Create the API route**

`POST /api/data-pipeline/scrape` — Triggers scrape job
- Body: `{ division?: string, limit?: number }`
- Returns: `{ jobId, status, schoolsQueued }`

`GET /api/data-pipeline/scrape?jobId=xxx` — Check progress
- Returns: `{ status, processed, total, errors }`

**Step 3: Run initial scrape for D1 FBS + FCS (263 schools)**
```bash
curl -X POST http://localhost:3000/api/data-pipeline/scrape \
  -H "Content-Type: application/json" \
  -d '{"division": "D1_FBS"}'
```

**Step 4: Commit**
```
feat: mega coach scraper — 900+ NCAA programs, Firecrawl + Jina
```

---

### Task 6: Build Media Import Page

**Files:**
- Create: `src/app/media-import/page.tsx`
- Create: `src/app/api/media/upload/route.ts`

**Step 1: Create the upload API route**

`POST /api/media/upload` — Accepts multipart form data
- Uses `src/lib/supabase/storage.ts` `uploadMedia()` function
- Auto-categorizes by file type (image vs video) and optional `category` form field
- Generates thumbnails for videos using ffprobe metadata
- Returns: `{ url, path, category, metadata }`

**Step 2: Create the media import page**

Full-page drag-and-drop interface:
- Large drop zone with file picker fallback
- Accepts images (JPG, PNG, HEIC) and videos (MP4, MOV)
- Shows upload progress per file with preview thumbnails
- Auto-categorizes: training, game, camp, portrait, team (user can override)
- Batch upload support (select entire folder)
- After upload, shows grid of uploaded media with Supabase URLs
- Uses the app's existing sidebar layout (`md:ml-64`)

**Step 3: Add to sidebar navigation**

Add `{ href: "/media-import", label: "Import Media", icon: Upload }` to sidebar.tsx and mobile-nav.tsx.

**Step 4: Commit**
```
feat: media import page — drag-drop upload to Supabase storage
```

---

### Task 7: YouTube Data Sync

**Files:**
- Create: `src/lib/integrations/youtube.ts`
- Create: `src/app/api/youtube/sync/route.ts`

**Step 1: Create YouTube API client**

Uses `YOUTUBE_API_KEY` env var with YouTube Data API v3:
- `getChannelStats(channelId)` — subscriber count, video count, view count
- `getVideoList(channelId)` — all videos with titles, views, likes, duration
- `getVideoDetails(videoId)` — full metadata for a single video
- `searchVideos(query)` — search for Jacob's videos by name

**Step 2: Create sync API route**

`POST /api/youtube/sync` — Syncs YouTube data into `video_assets` table
- Pulls all videos from Jacob's channel
- Upserts into Supabase with `source: "youtube"`
- Returns: `{ synced, new, updated }`

**Step 3: Commit**
```
feat: YouTube Data API sync — channel stats + video metadata
```

---

## Phase 2: Automation Engine

### Task 8: Content Rhythm — 3x/Week Auto-Posting

**Files:**
- Modify: `src/lib/content-engine/post-pipeline.ts`
- Create: `src/lib/content-engine/auto-scheduler.ts`
- Modify: `src/app/api/content/schedule/route.ts`

**Step 1: Create auto-scheduler module**

```typescript
// Determines what to post on Mon/Wed/Fri
// Monday: training content (pull from Supabase media tagged "training")
// Wednesday: game film / stats (pull from media tagged "game" or "highlight")
// Friday: character / personal (pull from media tagged "personal" or "team")

export async function generateWeeklyPosts(): Promise<ScheduledPost[]>
// 1. Check what day it is
// 2. Query Supabase media library for appropriate category
// 3. Generate caption with Claude AI
// 4. Create scheduled post for optimal posting time (7-9 PM CT)
// 5. Return created posts

export async function getNextPostSlot(): Promise<Date>
// Returns next Mon/Wed/Fri at 7:30 PM CT
```

**Step 2: Wire into cron**

The existing `/api/content/schedule` cron runs every 5 minutes. Enhance its GET handler to:
1. Check if today is Mon/Wed/Fri
2. Check if a post is already scheduled for today
3. If not, call `generateWeeklyPosts()` to auto-create one
4. Process any due posts via `processPostQueue()`

**Step 3: Commit**
```
feat: 3x/week auto-posting — Mon/Wed/Fri with real media from Supabase
```

---

### Task 9: DM Outreach Automation

**Files:**
- Modify: `src/lib/outreach/dm-sequences.ts`
- Create: `src/app/api/outreach/process/route.ts`
- Modify: `vercel.json` (add cron)

**Step 1: Create outreach processing API**

`GET /api/outreach/process` — Cron-triggered DM processor
- Validates CRON_SECRET
- Calls `processSequences()` from dm-sequences.ts
- Processes up to 5 DMs per run (rate limit)
- Logs results

**Step 2: Add to vercel.json crons**

```json
{
  "path": "/api/outreach/process",
  "schedule": "0 14,19 * * 1-5"
}
```
This runs at 8 AM and 1 PM CT (14:00 and 19:00 UTC), Tuesday-Friday — peak coach DM open times.

**Step 3: Create Wave 0 activation script**

Create `src/lib/outreach/activate-wave0.ts`:
- Query all Tier 3 coaches from `coaches` table
- Create a DM sequence for each (if not already exists)
- Uses "initial" template type
- Rate: creates sequences but doesn't send — the cron handles delivery

**Step 4: Commit**
```
feat: DM outreach automation — Wave 0 activation + cron processing
```

---

### Task 10: NCSA Scraper

**Files:**
- Create: `src/lib/scraping/ncsa-scraper.ts`
- Create: `src/app/api/ncsa/scrape/route.ts`
- Modify: `vercel.json` (add cron)

**Step 1: Build NCSA scraper**

Uses Puppeteer or Firecrawl with NCSA credentials:
1. Login to NCSA at `https://www.ncsasports.org/` with `NCSA_EMAIL` + `NCSA_PASSWORD`
2. Navigate to Jacob's athlete dashboard
3. Scrape: profile views (coach name, school, date), camp invitations, messages
4. Competitor mode: search Class of 2029 OL in Wisconsin/Minnesota/Iowa
5. Parse results and return structured data

Key functions:
```typescript
export async function scrapeProfileViews(): Promise<NCSAProfileView[]>
export async function scrapeCampInvites(): Promise<NCSACampInvite[]>
export async function scrapeMessages(): Promise<NCSAMessage[]>
export async function scrapeCompetitors(): Promise<NCSACompetitor[]>
export async function processNCSAData(): Promise<ProcessResult>
// processNCSAData orchestrates everything:
// - New profile views → create ncsa_leads
// - New camp invites → create camps + auto-tweet thank-you
// - New competitors → store for loss aversion display
```

**Step 2: Auto-thank-you tweet on camp invite**

When a camp invite is detected:
```typescript
const tweet = `Grateful for the camp invite from ${coachName} at ${schoolName}! Looking forward to competing this summer. #Pewaukee #ClassOf2029 @${coachXHandle}`;
await postTweet(tweet);
```

**Step 3: Add cron**

```json
{
  "path": "/api/ncsa/scrape",
  "schedule": "0 */4 * * *"
}
```
Every 4 hours.

**Step 4: Commit**
```
feat: NCSA scraper — profile views, camp invites, competitor intel + auto-thank tweets
```

---

## Phase 3: Camp & Media Hub

### Task 11: Camp Management Dashboard

**Files:**
- Create: `src/app/camps/page.tsx`

**Step 1: Build camp dashboard page**

Tabs: Calendar | Upcoming | History | Measurables

**Calendar tab:**
- Monthly calendar view showing camp dates
- Color-coded by registration status (green=confirmed, yellow=registered, gray=not registered)
- Click to view camp detail modal

**Upcoming tab:**
- Cards for each upcoming camp
- Shows: name, date, location, cost, coaches attending, registration status
- "Register" / "Update Status" buttons
- "Should I go?" recommendation badge (based on coach tier alignment)

**History tab:**
- Past camps with results
- Measurables recorded, drill scores, feedback received
- Coach contacts made

**Measurables tab:**
- Log new measurables (bench, squat, deadlift, 40, shuttle, vertical)
- Chart showing progression over time
- Compare to average D1/D2/D3 OL measurables

Use existing camp-database.ts functions for all data operations. Follows the app's existing layout pattern with sidebar.

**Step 2: Add to sidebar**

Add `{ href: "/camps", label: "Camp Tracker", icon: CalendarDays }` to sidebar + mobile-nav.

**Step 3: Commit**
```
feat: camp management dashboard — calendar, upcoming, history, measurables
```

---

### Task 12: Accomplishments Tracker

**Files:**
- Create: `src/app/accomplishments/page.tsx`
- Create: `src/app/api/accomplishments/route.ts`
- Create: `src/lib/accomplishments/store.ts`

**Step 1: Create accomplishments store**

Supabase table `accomplishments` (create via migration or API):
- id, type (pr, award, milestone), title, value, unit, media_url, media_path, posted_to_x, tweet_id, created_at

Functions:
```typescript
export async function addAccomplishment(data: {...}): Promise<Accomplishment>
export async function getAccomplishments(): Promise<Accomplishment[]>
export async function markPosted(id: string, tweetId: string): Promise<void>
```

**Step 2: Create the page**

- Form: type dropdown (PR, Award, Milestone), title, value, media upload
- Example: type=PR, title="Dumbbell Bench Press", value="85lb DBs", attach video
- "Save" stores to Supabase + uploads media
- "Save & Post to X" generates caption with Claude + posts immediately
- Timeline view showing all accomplishments with dates and media

**Step 3: Commit**
```
feat: accomplishments tracker — log PRs, awards, milestones with auto-post
```

---

## Phase 4: Intelligence Layer

### Task 13: Loss Aversion on Recruit Page

**Files:**
- Create: `src/app/api/recruit/social-proof/route.ts`
- Modify: `src/components/recruit/social-proof.tsx`
- Modify: `src/app/recruit/page.tsx`

**Step 1: Create social proof API**

`GET /api/recruit/social-proof` — Aggregates real metrics:
```typescript
{
  coachFollowers: number,      // from X API
  ncsaProfileViews: number,    // from ncsa_leads count
  campInvites: number,         // from camps table where source = "ncsa_invite"
  contactFormSubmissions: number, // from coach_inquiries count
  competitorOffers: number,    // from ncsa competitor data
  lastUpdated: string,
}
```

Cache response for 1 hour. Pull from Supabase tables.

**Step 2: Enhance social-proof.tsx**

Add a stats bar above the scrolling schools:
```tsx
<div className="flex justify-center gap-8 mb-6">
  <Stat label="Coach Profile Views" value={data.ncsaProfileViews} />
  <Stat label="Camp Invites" value={data.campInvites} />
  <Stat label="Coaches Following" value={data.coachFollowers} />
</div>
```

Add competitor signal below:
```tsx
<p className="text-center text-[10px] text-red-500/40 font-mono mt-4">
  {data.competitorOffers} Class of 2029 OL recruits in your region received offers this month
</p>
```

All numbers are fetched from the API — real data only.

**Step 3: Commit**
```
feat: loss aversion — real metrics on recruit page (views, invites, followers)
```

---

### Task 14: X Follower Growth Engine

**Files:**
- Create: `src/lib/growth/auto-engage.ts`
- Create: `src/app/api/growth/auto-engage/route.ts`
- Modify: `vercel.json`

**Step 1: Create auto-engage module**

```typescript
export async function autoFollowCoaches(limit: number = 10): Promise<{followed: number, errors: string[]}>
// 1. Query coaches table for coaches NOT followed yet (followStatus != "following")
// 2. Sort by priority tier (Tier 3 first)
// 3. Follow up to `limit` coaches via X API
// 4. Update followStatus in coaches table
// 5. Rate limit: 10/day max

export async function autoEngageCoachContent(limit: number = 5): Promise<{liked: number, reposted: number}>
// 1. Get followed coaches' X handles
// 2. Fetch their recent tweets via X API
// 3. Like recruiting-related tweets
// 4. Repost significant announcements (camp dates, etc.)
// 5. Log in engagementActions table

export async function getGrowthReport(): Promise<GrowthReport>
// Weekly summary: new followers, coach follows, engagement rate, follow-back rate
```

**Step 2: Create API route + cron**

`GET /api/growth/auto-engage` — Cron-triggered
- Validates CRON_SECRET
- Runs autoFollowCoaches(10) + autoEngageCoachContent(5)
- Returns results

Add to vercel.json:
```json
{
  "path": "/api/growth/auto-engage",
  "schedule": "0 15 * * *"
}
```
Runs daily at 9 AM CT.

**Step 3: Commit**
```
feat: X follower growth engine — auto-follow coaches + engage content
```

---

## Parallel Execution Strategy

These tasks can be parallelized across agents:

| Parallel Group | Tasks | Agent |
|---------------|-------|-------|
| **Group A** | 1, 2, 3 (pipes) | atlas-engineering |
| **Group B** | 5 (mega scraper) | nova-ai |
| **Group C** | 6, 7 (media + YouTube) | atlas-engineering |
| **Group D** | 8, 9 (content + DM automation) | aria-growth |
| **Group E** | 10 (NCSA scraper) | pulse-data-science |
| **Group F** | 11, 12 (camp + accomplishments UI) | marcus-ux |
| **Group G** | 13, 14 (loss aversion + growth) | pulse-data-science |

Groups A-B-C can run simultaneously (no dependencies).
Groups D-E depend on A (fixed sendDM).
Groups F-G depend on B (coach data) and C (media).

Task 4 (commit + push + deploy) is a checkpoint between Phase 0 and Phase 1.
