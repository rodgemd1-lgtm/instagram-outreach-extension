# Sprint 3: DM Pipeline + Content Creator

**Date**: 2026-03-19
**Status**: READY FOR APPROVAL
**Confidence**: 8/10 (well-understood codebase, clear patterns, existing infrastructure)
**Estimated Files**: 8-10 new/modified
**Estimated Context**: Medium-High (~60K tokens)

## Context

Sprint 2 consolidated the app from 50 pages down to 6 (the "Six-Pack") and is fully merged to main. The API key is live. Now we build the two features that make this app actually useful for Jacob's recruiting:

1. **DM Pipeline Enhancement** — Currently DMs can be drafted/sent one at a time. We need AI-personalized batch generation with a "Log Now, Send Later" workflow.
2. **Content Creator** — The Create tab currently says "AI-powered post generation coming in Sprint 3." Time to deliver.

### What Already Exists

| Area | Infrastructure | Location |
|------|---------------|----------|
| Anthropic client | Full SDK setup, `generateDMDraft()`, `generatePostDrafts()`, `checkConstitution()` | `src/lib/integrations/anthropic.ts` |
| DM API | CRUD with X API send, Zod validation, Supabase + in-memory fallback | `src/app/api/dms/route.ts` |
| DM Sequences | 4-step automated sequence engine with scheduling | `src/lib/outreach/dm-sequences.ts` |
| DM UI | Coach queue, draft editing, send via X, outreach log | `src/components/outreach/dm-list.tsx` |
| Content Generation | Template-based 30-day generation with hooks/formulas | `src/app/api/content/generate-month/route.ts` |
| Content Queue | Calendar, list, analytics views with approve/reject | `src/components/content/content-queue.tsx` |
| Queue API | GET (filtered) + PATCH (bulk approve/reject/reschedule) | `src/app/api/content/queue/route.ts` |
| Posts Schema | `posts` table with content, pillar, mediaUrl, scheduledFor, status | `src/lib/db/schema.ts` |
| DM Schema | `dm_messages` table with coach ref, template type, status | `src/lib/db/schema.ts` |
| DM Sequences Schema | `dm_sequences` table with step tracking | `src/lib/db/schema.ts` |
| Media Upload | File upload to Supabase storage, MIME validation | `src/app/api/media/upload/route.ts` |
| Hooks Library | 200+ hooks, 5 formulas, pillar distribution | `src/lib/data/hooks-library.ts` |
| Media Browser | Existing component for browsing uploaded media | `src/components/content/media-browser.tsx` |

## Approach

### Feature A: DM Pipeline — "Log Now, Send Later" with AI Personalization

**Core Idea**: Jacob reviews a prioritized list of coaches. For each coach, Claude generates a personalized DM based on coach intel, school data, and Jacob's profile. Jacob can edit, approve for later, or send immediately.

**Architecture**: Enhance existing `/api/dms` + `dm-list.tsx` rather than building new endpoints.

### Feature B: Content Creator — "Weekly AI Generation with Approval Flow"

**Core Idea**: Jacob picks a week, Claude generates 5-7 posts with pillar balance and activity context. Jacob reviews them all at once, approves/edits/deletes, adds his own posts, then the approved batch gets scheduled with specific timestamps.

**Architecture**: New component for the Create tab + new API route for AI-powered weekly generation. Posts save to existing `posts` table with `status: "draft"` → Jacob approves → `status: "scheduled"`.

---

## Implementation Steps

### Phase 1: DM Pipeline Enhancement (Steps 1-4)

#### Step 1: AI DM Generation API
**Files**: `src/app/api/dms/generate/route.ts` (NEW)

Create a new endpoint that takes a coach ID and generates a personalized DM using Claude:
- Input: `{ coachId: string, templateType?: string, context?: string }`
- Looks up coach details (name, school, position, tier, notes, recent engagement)
- Calls `generateDMDraft()` from existing anthropic.ts
- Returns 3 DM variations with different tones (professional, casual, follow-up)
- Constitution check on each draft before returning

**Validation gate**: Call endpoint with a test coach ID, verify 3 variations returned.

#### Step 2: Batch DM Generation
**Files**: `src/app/api/dms/generate-batch/route.ts` (NEW)

Generate personalized DMs for multiple coaches at once:
- Input: `{ coachIds: string[], templateType: string }`
- Generates 1 DM per coach (the "best" variation, not 3)
- Returns array of `{ coachId, coachName, schoolName, content, tone }`
- All drafts saved to `dm_messages` table with `status: "drafted"`

**Validation gate**: Generate batch for 3 coaches, verify all saved as drafts.

#### Step 3: Enhanced DM List UI
**Files**: `src/components/outreach/dm-list.tsx` (MODIFY)

Add to existing DM list:
- "Generate AI DM" button per coach card (calls Step 1 endpoint)
- "Generate All" button in header (calls Step 2 endpoint)
- Inline variation selector when AI generates 3 options
- "Schedule for Later" option alongside "Send via X" (saves with `status: "scheduled"`)
- Visual indicator for AI-generated vs manually written DMs

**Validation gate**: UI renders, generate button works, variations display.

#### Step 4: DM Approval Flow
**Files**: `src/components/outreach/dm-list.tsx` (MODIFY)

Add batch approval UX:
- "Review All Drafts" view showing all pending DMs
- Approve/Edit/Delete per DM
- "Approve All" button for batch approval
- Approved DMs get `status: "approved"` → ready to send
- Show approval counts in wave summary metrics

**Validation gate**: Approve 3 DMs, verify status updates in DB.

---

### Phase 2: Content Creator (Steps 5-8)

#### Step 5: AI Weekly Generation API
**Files**: `src/app/api/content/generate-week/route.ts` (NEW)

New endpoint for AI-powered weekly content:
- Input: `{ weekStartDate: string, activityContext?: string, tone?: string, count?: number }`
- Uses Claude (not templates) to generate 5-7 unique posts for the week
- System prompt includes: Jacob's profile, posting constitution, pillar distribution targets, hook library samples as inspiration
- Each post gets: content, pillar, suggested time, media suggestion, hashtags
- Posts saved to DB as `status: "draft"` with `scheduledFor` timestamps
- Returns the generated posts for immediate UI display

**Validation gate**: Generate a week, verify 5-7 posts with correct pillar distribution.

#### Step 6: Weekly Review Component
**Files**: `src/components/content/weekly-review.tsx` (NEW)

The main Create tab UI:
- Week picker (defaults to upcoming week)
- "Generate Week" button → calls Step 5 API
- Day-by-day layout showing generated posts
- Per-post actions: ✅ Approve / ✏️ Edit (inline) / 🗑️ Delete
- "Add Post" button per day → opens a manual compose form
- "Approve All" button at bottom
- Shows pillar distribution bar (live updates as posts are approved/deleted)
- Approved posts get `status: "scheduled"` with their `scheduledFor` timestamp

**Validation gate**: Generate week, approve 3 posts, add 1 manual post, verify all in queue.

#### Step 7: Media Attachment in Creator
**Files**:
- `src/components/content/weekly-review.tsx` (MODIFY — add media UI)
- `src/components/content/media-picker.tsx` (NEW)

Add media support to post creation:
- Each post card has "Attach Media" button
- Opens a media picker modal with two options:
  - **Upload**: File input for photos/videos from phone (uses existing `/api/media/upload`)
  - **Library**: Browse previously uploaded media (uses existing `MediaBrowser` component pattern)
- Selected media URL saved to post's `mediaUrl` field
- Post preview shows attached image thumbnail
- AI image generation via Gemini MCP as a third tab in picker (stretch goal — implement if time allows)

**Validation gate**: Attach an image to a draft post, verify mediaUrl persists after approval.

#### Step 8: Wire Create Tab
**Files**: `src/app/content/page.tsx` (MODIFY)

Replace the placeholder in the Create tab with the WeeklyReview component:
- Import and render `WeeklyReview` in the `create` tab
- Pass any necessary context (activity, tone preferences)

**Validation gate**: Navigate to /content → Create tab → see the weekly generator UI.

---

### Phase 3: Integration (Step 9)

#### Step 9: Auto-Scheduling Support
**Files**:
- `src/app/api/content/schedule/route.ts` (MODIFY — exists but may need updates)
- `src/app/api/content/queue/route.ts` (MODIFY — add "scheduled" status handling)

Ensure scheduled posts flow correctly:
- Posts with `status: "scheduled"` and a `scheduledFor` timestamp are ready for auto-posting
- Queue API recognizes "scheduled" as a valid status alongside queued/draft/approved
- Add a "Scheduled This Week" counter to the Queue status bar
- Note: Actual auto-posting via Twitter API cron is Sprint 4 scope (we're building the pipeline, not the cron)

**Validation gate**: Approve posts from weekly review, verify they appear in Queue with "scheduled" status.

---

## Files Summary

| # | File | Action | Step |
|---|------|--------|------|
| 1 | `src/app/api/dms/generate/route.ts` | CREATE | 1 |
| 2 | `src/app/api/dms/generate-batch/route.ts` | CREATE | 2 |
| 3 | `src/components/outreach/dm-list.tsx` | MODIFY | 3, 4 |
| 4 | `src/app/api/content/generate-week/route.ts` | CREATE | 5 |
| 5 | `src/components/content/weekly-review.tsx` | CREATE | 6, 7 |
| 6 | `src/components/content/media-picker.tsx` | CREATE | 7 |
| 7 | `src/app/content/page.tsx` | MODIFY | 8 |
| 8 | `src/app/api/content/queue/route.ts` | MODIFY | 9 |
| 9 | `src/app/api/content/schedule/route.ts` | MODIFY | 9 |

## Risks

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Claude API rate limits on batch DM generation | Low | Generate sequentially, not parallel. 3-coach batches max. |
| AI-generated content violates posting constitution | Medium | Every generated post runs through `checkConstitution()` before saving |
| Media upload fails (Supabase storage not configured) | Low | Graceful fallback — post saves without media, shows warning |
| Weekly generation produces duplicate/similar content | Medium | Include recent posts in context so Claude avoids repetition |
| Context budget exceeded (large sprint) | Medium | Split into 2 sessions: Phase 1 (DM) in session 1, Phase 2 (Content) in session 2 |

## Verification Plan

After all steps:
1. `npm run build` — clean build, no TS errors
2. `npm test` — 773+ tests passing (maintain or improve)
3. Manual verification:
   - /outreach → DM Sequences → Generate AI DM for a coach → see 3 variations
   - /outreach → DM Sequences → "Generate All" → batch drafts appear
   - /outreach → Approve draft DMs → status updates
   - /content → Create → Generate Week → see 5-7 posts
   - /content → Create → Approve/Edit/Delete posts → status changes
   - /content → Create → Add manual post → appears in lineup
   - /content → Create → Attach media → thumbnail shows
   - /content → Queue → scheduled posts visible with correct dates

## Session Strategy

**Recommended split**:
- **Session 1**: Steps 1-4 (DM Pipeline) — ~8 files touched, medium complexity
- **Session 2**: Steps 5-9 (Content Creator) — ~6 files touched, medium-high complexity

This keeps each session under 10 file modifications and within healthy context budgets.
