# Sprint 2: UX Cleanup — "The Six-Pack" Design

**Date:** 2026-03-19
**Status:** APPROVED
**Goal:** Reduce 50 pages to 6 primary pages + 4 supporting routes. Every page has one clear job. Zero confusion.

---

## Core Principle

Jacob opens the app → sees 6 sidebar items → knows exactly where to go.
Weekly flow: Command → Tasks → Content (create posts) → Outreach (send DMs) → Coaches (review responses).

## Page Architecture

### Primary Pages (sidebar)

| # | Route | Name | Job |
|---|-------|------|-----|
| 1 | `/dashboard` | Command Center | "How's Jacob doing?" + "What does he need to do this week?" |
| 2 | `/coaches` | Coach CRM | "Who are the coaches?" + personality profiles + coach panel |
| 3 | `/outreach` | Outreach Hub | "Who should he reach out to?" + DMs + follows + NCSA follow-ups |
| 4 | `/content` | Content Studio | "What does he need to post?" + media upload + post queue |
| 5 | `/camps` | Camp Central | "What camps are coming?" + NCSA invites |
| 6 | `/agency` | AI Agency | Chat with the REC team personas |

### Supporting Routes (no sidebar)

- `/coaches/[id]` — Coach detail page
- `/agency/[member]` — Team member chat
- `/recruit` — Public landing page (no sidebar, no auth)
- `/privacy`, `/terms` — Legal pages

### Sidebar Config

```typescript
const navSections = [
  {
    items: [
      { label: "Command", href: "/dashboard", icon: "dashboard" },
      { label: "Coaches", href: "/coaches", icon: "groups" },
      { label: "Outreach", href: "/outreach", icon: "campaign" },
      { label: "Content", href: "/content", icon: "edit_note" },
      { label: "Camps", href: "/camps", icon: "event" },
      { label: "Agency", href: "/agency", icon: "smart_toy" },
    ],
  },
];
```

---

## Page Designs

### 1. Command Center (`/dashboard`)

**Layout: 3 vertical sections**

**Status Strip** (top — horizontal cards)
- X follower count + weekly delta
- Post engagement rate (7-day)
- Active DM sequences (count + response rate)
- Next camp (name + date)

**Weekly Tasks** (middle)
- System-generated checklist: "Upload 2 training clips", "Review 3 drafted posts", "Follow 5 coaches"
- Each task links to the relevant page
- Progress bar (completed/total)

**Activity Feed** (bottom)
- Coach engagement signals (likes, follows, DM replies)
- NCSA alerts (new invites, coach profile views)
- Coach panel feedback on recent posts

**Absorbs:** /analytics, /audit, /calendar, /dashboard/*

### 2. Coaches (`/coaches`)

**Layout: Tabbed interface**

| Tab | Content |
|-----|---------|
| All Coaches | Filterable table: name, school, tier, follow/DM status, handle |
| Profiles | Per-coach personality cards: style, interests, what they respond to |
| Coach Panel | Panel reviews on posts and DMs, feedback scores |
| Map | School map visualization |
| Competitors | Class of 2029 OL competitor profiles |

**Detail:** `/coaches/[id]` — full profile, engagement timeline, personality analysis, DM history

**Absorbs:** /intelligence, /competitors, /map

### 3. Outreach (`/outreach`)

**Layout: Tabbed interface**

| Tab | Content |
|-----|---------|
| DM Sequences | Active/paused/completed sequences, next sends, dry run |
| Follow Strategy | Coaches and peers to follow, follow-back tracking, follower goals |
| NCSA Leads | Camp invites from coaches, kanban (new → contacted → attending) |

**Personalization flow:** DM about to send → pull coach personality profile → generate in Jacob's voice → optional panel review → send

**Absorbs:** /dms, /cold-dms, /connections, /agency/leads

### 4. Content (`/content`)

**Layout: Tabbed interface**

| Tab | Content |
|-----|---------|
| Queue | Drafted/scheduled/posted content, approve/reject, calendar toggle |
| Create | Upload media → system generates post options using hooks/pillars |
| Library | Browse hooks, captions, viral templates, comments |

**Key workflow:** Upload clip → 3 auto-generated post options → pick one → Queue → optional panel review → schedule

**Absorbs:** /content-queue, /posts, /hooks, /viral, /captions, /comments, /media, /media-lab, /media-import, /videos

### 5. Camps (`/camps`)

**Layout: Two sections**

**Upcoming Camps** (top)
- Calendar/list of camps: date, school, type, registration status
- Links to coach(es) running each camp

**NCSA Invites** (bottom)
- Feed of invitations from NCSA scraping
- Status pipeline: new → reviewed → responded → attending/declined
- One-click "Send thank you" → personalized auto-draft

**Absorbs:** nothing currently exists — new page built from /camps experimental + NCSA data

### 6. Agency (`/agency`)

**No major changes.** Team roster + `/agency/[member]` chat interface stays as-is.

---

## Pages to Delete (19)

### Experimental (12) — delete entirely
- `/brand-kit`
- `/prompt-studio`
- `/scrape`
- `/x-growth`
- `/create`
- `/profile-studio`
- `/agents`
- `/capture`
- `/manage`
- `/accomplishments`
- `/youtube-studio`
- `/media-upload`

### Duplicates (7) — delete + add redirects
- `/cold-dms` → redirect to `/outreach`
- `/posts` → redirect to `/content`
- `/calendar` → redirect to `/content`
- `/dashboard/calendar` → redirect to `/content`
- `/dashboard/coaches` → redirect to `/coaches`
- `/dashboard/team` → redirect to `/agency`
- `/dashboard/analytics` → redirect to `/dashboard`
- `/dashboard/content` → redirect to `/content`
- `/dashboard/outreach` → redirect to `/outreach`

### Pages absorbed (redirect to new home)
- `/analytics` → redirect to `/dashboard`
- `/intelligence` → redirect to `/coaches`
- `/competitors` → redirect to `/coaches`
- `/dms` → redirect to `/outreach`
- `/content-queue` → redirect to `/content`
- `/audit` → redirect to `/dashboard`
- `/connections` → redirect to `/outreach`
- `/hooks` → redirect to `/content`
- `/viral` → redirect to `/content`
- `/captions` → redirect to `/content`
- `/comments` → redirect to `/content`
- `/media` → redirect to `/content`
- `/media-lab` → redirect to `/content`
- `/media-import` → redirect to `/content`
- `/videos` → redirect to `/content`
- `/map` → redirect to `/coaches`

---

## Personalization System (Cross-Cutting)

Every DM and follow-up in the app uses this pipeline:

1. **Coach personality profile** — auto-generated from their X activity, bio, school context
2. **Jacob's voice** — system prompt ensures messages sound like a confident, respectful HS athlete
3. **Coach panel review** — optional gate before sending (configurable per tier)
4. **NCSA auto-follow-up** — camp invites trigger personalized "thank you" drafts

This is NOT a new feature — it's wiring together existing pieces:
- `generateDMDraft()` in dm-sequences.ts already uses Anthropic
- Coach data already exists in the CRM
- Coach panel already exists in panel_coaches/panel_surveys tables

The new piece: a `getCoachPersonality(coachId)` function that aggregates X activity + bio + school context into a personality brief, cached per coach.

---

## Success Criteria

- [ ] 6 sidebar items (down from 12)
- [ ] 0 orphaned pages (down from 38)
- [ ] Every Mike requirement covered (status, tasks, outreach, personalization, panel, camps, NCSA)
- [ ] All old routes redirect to new homes (no broken links)
- [ ] Tests pass, build succeeds
