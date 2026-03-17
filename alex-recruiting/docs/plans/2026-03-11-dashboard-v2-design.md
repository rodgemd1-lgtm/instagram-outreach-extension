# Dashboard v2.0 — Design Document

> **Date:** 2026-03-11 (updated)
> **Priority:** X Content + Calendar first, then Coach CRM, DM Outreach, Analytics
> **Status:** APPROVED — ready for implementation planning
> **Goal:** Build a usable daily-driver dashboard for managing Jacob's X account and college coach outreach. Replace placeholder pages with real, API-wired UI.

## Architecture

**Approach:** Build on existing dashboard shell (layout, sidebar, mobile nav, design tokens). Replace 4 placeholder pages with real UI wired to existing API routes. No backend changes needed — all APIs exist.

**Design system:** Existing `dash-*` Tailwind tokens (bg: `#0F1117`, surface: `#1A1D27`, accent: `#3B82F6`, etc.). Lucide icons. `rounded-xl border border-dash-border bg-dash-surface` card pattern.

**Component strategy:** Custom components for domain-specific UI (post composer, DM pipeline, calendar grid). TanStack React Table for Coach CRM data table. Hand-rolled SVG charts for analytics (data is simple, no charting library needed).

---

## Phase 2: Content Calendar + Post Composer (`/dashboard/calendar`)

### Calendar Grid
- **Desktop:** 7-column CSS grid month view. Header row with day names. Each cell shows the day number and up to 3 post pills. Overflow shows "+N more" badge.
- **Mobile:** Horizontal scrollable week strip (7 days). Tap a day to expand its posts below.
- **Navigation:** Prev/next month arrows + "Today" button in header.
- **Post pills:** Colored by content pillar:
  - Film = `dash-danger` (red)
  - Training = `dash-accent` (blue)
  - Academic = `dash-success` (green)
  - Camp = `dash-warning` (orange)
  - Lifestyle = `dash-gold` (gold)
- **Click day** → opens day detail panel showing all posts for that day with add button.
- **Click pill** → opens post composer slide-over pre-filled with that post.

### Post Composer (Slide-over Panel)
- **Text area:** 280 char limit with live counter (turns red at 260+).
- **Pillar selector:** 5 pill buttons (Film, Training, Academic, Camp, Lifestyle). Selection auto-suggests relevant hashtags.
- **Hashtag field:** Comma-separated. Pre-populated from pillar. Editable.
- **Media attachment:** "Add media" button. File upload (image/video) or URL input.
- **Schedule:** Date picker + time picker. Shows "Best time" suggestion (e.g., "Coaches most active 7-9am CT on Tuesdays").
- **Preview card:** Mock X post card showing profile pic, @handle, content, media placeholder, hashtags.
- **Actions:**
  - "Save Draft" → status=draft
  - "Approve" → status=approved
  - "Schedule" → status=scheduled (requires date/time)
  - "Post Now" → calls `POST /api/posts/[id]/send` immediately
- **Status badge** in header: Draft | Approved | Scheduled | Posted

### Data Flow
- `GET /api/posts?month=2026-03` → populate calendar
- `POST /api/posts` → create new post
- `PATCH /api/posts/[id]` → update draft/schedule
- `POST /api/posts/[id]/send` → publish to X
- `DELETE /api/posts/[id]` → cancel/delete

### Files
- `src/app/dashboard/calendar/page.tsx` — page component with month state
- `src/components/dashboard/calendar-grid.tsx` — month grid + week strip
- `src/components/dashboard/post-composer.tsx` — slide-over composer
- `src/components/dashboard/post-pill.tsx` — calendar day post indicator

---

## Phase 3: Coach CRM (`/dashboard/coaches`)

### Data Table
- **Library:** TanStack React Table (`@tanstack/react-table`)
- **Columns:**
  | Column | Width | Format |
  |--------|-------|--------|
  | Name | flex | Text, bold |
  | School | flex | Text |
  | Division | 80px | Badge (colored by division) |
  | Tier | 60px | "T1" / "T2" / "T3" badge |
  | OL Need | 80px | 1-5 dot indicator |
  | Follow | 80px | Badge: Not Followed / Followed / Mutual |
  | DM Status | 100px | Badge: None / Drafted / Sent / Replied |
  | Last Engaged | 100px | Relative date ("3d ago") |
- **Sorting:** Click column header to sort. Default: Tier ASC, then OL Need DESC.
- **Pagination:** 25 per page with page controls.

### Filter Bar
- Division dropdown (All, D1 FBS, D1 FCS, D2, D3, NAIA)
- Tier dropdown (All, Tier 1, Tier 2, Tier 3)
- DM Status dropdown (All, Not Sent, Drafted, Sent, Replied)
- Search input (filters by name or school, debounced 300ms)

### Coach Detail (Slide-over)
- **Header:** Coach name, school, division badge, X handle (clickable → opens X profile)
- **Quick actions row:** "Follow on X" button, "Draft DM" button, "View on X" link
- **Info grid:** Conference, OL Need score, X Activity score, Fit Score (computed)
- **Relationship timeline:** Vertical timeline showing: when followed, DMs sent/received, engagements. Newest first.
- **Notes:** Free-text textarea, auto-saves on blur.

### Data Flow
- `GET /api/coaches?division=D1+FBS&tier=1&dmStatus=sent&search=wisconsin` → filtered list
- `GET /api/coaches/[id]` → detail
- `PUT /api/coaches/[id]` → update notes, status

### Files
- `src/app/dashboard/coaches/page.tsx` — page with table + filters
- `src/components/dashboard/coach-table.tsx` — TanStack table
- `src/components/dashboard/coach-detail.tsx` — slide-over detail panel
- `src/components/dashboard/coach-filters.tsx` — filter bar

---

## Phase 4: DM Outreach Pipeline (`/dashboard/outreach`)

### Kanban Board
- **5 columns:** Queued → Sent → Viewed → Replied → Meeting
- **Cards:** Coach name, school, tier badge, message preview (first 60 chars), time since last action.
- **Drag-and-drop:** Optional stretch goal. For MVP, use "Move to" dropdown on each card.
- **Column counts:** Badge showing number of coaches in each stage.

### DM Composer (Slide-over)
- **Coach selector:** Search-ahead input. Shows name + school + tier.
- **Template picker:** 4 tabs for the sequence steps:
  1. **Intro** — First touch, introduces Jacob
  2. **Follow-up** — References recent school event or coach tweet
  3. **Value Add** — Shares new film or measurable
  4. **Soft Close** — Asks about camps or visit opportunities
- **Message area:** AI-generated personalized message. Editable. Shows char count.
- **Personalization tokens shown:** `{coachName}`, `{school}`, `{filmLink}`, `{olNeed}`
- **Family review checkbox:** "Mike has reviewed this message" — required before sending.
- **Actions:**
  - "Save Draft" → status=drafted
  - "Approve & Queue" → status=approved (human-in-the-loop gate)
  - "Send Now" → calls DM API immediately (only if approved + reviewed)

### Sequence View
- For each coach in pipeline, show 4-step sequence timeline.
- Visual: 4 circles connected by lines. Filled = completed, hollow = upcoming.
- Each step shows: template name, date sent (or "Pending"), response status.

### Data Flow
- `GET /api/dms?status=drafted` → populate columns
- `POST /api/dms` → create new DM
- `POST /api/dms/[id]/send` → send via X API
- Coach data joined from `/api/coaches`

### Files
- `src/app/dashboard/outreach/page.tsx` — page with kanban
- `src/components/dashboard/dm-kanban.tsx` — kanban board
- `src/components/dashboard/dm-card.tsx` — individual pipeline card
- `src/components/dashboard/dm-composer.tsx` — slide-over DM composer
- `src/components/dashboard/dm-sequence.tsx` — 4-step sequence timeline

---

## Phase 5: Analytics + Overview Wiring (`/dashboard/analytics` + `/dashboard`)

### Analytics Page
- **Stat row:** 4 StatCard components (reuse existing):
  - Total Followers (from X API)
  - Weekly Engagement Rate (computed)
  - Profile Views (from analytics API)
  - DMs Responded (count from DMs with status=responded)

- **Charts section (2-col grid):**
  - **Posts by Pillar** — Horizontal bar chart. 5 bars, one per pillar, colored to match calendar pills.
  - **Coach Pipeline Funnel** — Vertical funnel: Prospected (total) → Contacted (DM sent) → Engaged (replied) → Interested (meeting).
  - Both charts: Hand-rolled SVG. No external charting library. Simple data, simple rendering.

- **Recent Activity feed:** Last 10 actions (posts published, DMs sent, coaches added, follows).

### Overview Page Upgrades
- Wire stat cards to real API data (already partially done):
  - "Posts This Week" → `GET /api/posts?status=posted&since=7d` count
  - "DMs Sent" → `GET /api/dms?status=sent` count
- Make action items dynamic:
  - Pending DM drafts needing approval
  - Days without posting (if >2 days)
  - Coaches with no engagement in 30+ days
- Make upcoming events pull from a lightweight events store (or keep hardcoded for MVP).

### Files
- `src/app/dashboard/analytics/page.tsx` — analytics page
- `src/components/dashboard/bar-chart.tsx` — SVG bar chart
- `src/components/dashboard/funnel-chart.tsx` — SVG funnel
- `src/components/dashboard/activity-feed.tsx` — recent actions list
- Update: `src/app/dashboard/page.tsx` — wire real data

---

## Shared Components

These are reused across multiple pages:

- `src/components/dashboard/slide-over.tsx` — Generic slide-over panel (right side, overlay, close button). Used by post composer, coach detail, DM composer.
- `src/components/dashboard/badge.tsx` — Colored badge component for status/tier/division.
- `src/components/dashboard/search-input.tsx` — Debounced search input with icon.
- `src/components/dashboard/empty-state.tsx` — Consistent empty state (icon + message + CTA).

---

## Implementation Order (Optimized for Parallel Agents)

**Batch 1 — Shared foundations (sequential, fast):**
1. `slide-over.tsx`, `badge.tsx`, `search-input.tsx`, `empty-state.tsx`
2. Install `@tanstack/react-table`

**Batch 2 — Pages in parallel (4 agents):**
- Agent A: Content Calendar + Post Composer (Phase 2)
- Agent B: Coach CRM + Data Table (Phase 3)
- Agent C: DM Outreach Pipeline (Phase 4)
- Agent D: Analytics + Overview wiring (Phase 5)

**Batch 3 — Integration + verification:**
- Cross-page navigation testing
- Mobile responsive pass
- Build verification (`npm run build`)

---

## Non-Goals (v2.0)

- No real-time X API polling (manual refresh only)
- No drag-and-drop calendar rescheduling (click to edit)
- No AI-generated post content (manual drafting, AI comes in v3)
- No push notifications
- No multi-account support (Jacob only)
