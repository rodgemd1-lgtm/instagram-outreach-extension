# Sprint 2: UX Cleanup Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Consolidate 50 pages into 6 primary sidebar pages + 4 supporting routes. Delete 19 pages, add redirects for absorbed pages, update sidebar.

**Architecture:** Each primary page uses the existing SC design system (SCPageHeader, SCGlassCard, SCTabs, etc.). Tabs within pages absorb features from deleted/consolidated pages. All old routes get Next.js redirect stubs so external links don't break. The sidebar is simplified from 12 items to 6.

**Tech Stack:** Next.js 14 App Router, React 18, SCTabs component, Tailwind CSS, existing SC design system

**Design doc:** `.claude/plans/2026-03-19-sprint2-ux-cleanup-design.md`

---

## Task 1: Update Sidebar to Six-Pack Navigation

**Why:** The sidebar is the app's primary navigation. Changing it first gives us the target structure — then we build/consolidate each page to match.

**Files:**
- Modify: `src/components/sc/sc-sidebar.tsx`
- Test: manual — verify 6 items render in sidebar

**Step 1: Update the navSections config**

Replace the entire `navSections` array in `src/components/sc/sc-sidebar.tsx` with:

```typescript
const navSections: NavSection[] = [
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

This removes the "Operations" and "Tools" section headers and consolidates to a single flat list of 6.

**Step 2: Verify sidebar renders correctly**

Start dev server, navigate to /dashboard, confirm 6 sidebar items appear.

**Step 3: Commit**

```bash
git add src/components/sc/sc-sidebar.tsx
git commit -m "refactor(ux): simplify sidebar to 6-item Six-Pack navigation"
```

---

## Task 2: Delete Experimental Pages (12 pages)

**Why:** These are unreachable, unfinished pages adding dead code. Nuke them.

**Files to delete:**
- `src/app/brand-kit/page.tsx`
- `src/app/prompt-studio/page.tsx`
- `src/app/scrape/page.tsx`
- `src/app/x-growth/page.tsx`
- `src/app/create/page.tsx`
- `src/app/profile-studio/page.tsx`
- `src/app/agents/page.tsx`
- `src/app/capture/page.tsx`
- `src/app/manage/page.tsx`
- `src/app/accomplishments/page.tsx`
- `src/app/youtube-studio/page.tsx`
- `src/app/media-upload/page.tsx`

**Step 1: Delete all 12 directories**

```bash
rm -rf src/app/brand-kit src/app/prompt-studio src/app/scrape src/app/x-growth \
  src/app/create src/app/profile-studio src/app/agents src/app/capture \
  src/app/manage src/app/accomplishments src/app/youtube-studio src/app/media-upload
```

**Step 2: Run build to check for broken imports**

```bash
npm run build 2>&1 | grep -i "error"
```

If any imports reference deleted pages, fix them. Expected: none — these pages are orphaned.

**Step 3: Commit**

```bash
git add -A
git commit -m "refactor(ux): delete 12 experimental pages (brand-kit, prompt-studio, scrape, etc.)"
```

---

## Task 3: Delete Duplicate Pages + Add Redirects (7 pages)

**Why:** These duplicate sidebar pages. Replace them with redirect stubs.

**Files to delete (replace with redirects):**
- `src/app/cold-dms/page.tsx` → redirect to `/outreach`
- `src/app/posts/page.tsx` → redirect to `/content`
- `src/app/calendar/page.tsx` → redirect to `/content`
- `src/app/dashboard/calendar/page.tsx` → redirect to `/content`
- `src/app/dashboard/coaches/page.tsx` → redirect to `/coaches`
- `src/app/dashboard/team/page.tsx` → redirect to `/agency`
- `src/app/dashboard/analytics/page.tsx` → redirect to `/dashboard`
- `src/app/dashboard/content/page.tsx` → redirect to `/content`
- `src/app/dashboard/outreach/page.tsx` → redirect to `/outreach`

**Step 1: Replace each page with a redirect stub**

Each page becomes:

```typescript
import { redirect } from "next/navigation";
export default function Page() { redirect("/TARGET"); }
```

For example, `src/app/cold-dms/page.tsx`:
```typescript
import { redirect } from "next/navigation";
export default function ColdDmsRedirect() { redirect("/outreach"); }
```

Do this for all 9 files listed above. Use the exact redirect targets shown.

**Step 2: Run build to verify redirects compile**

```bash
npm run build 2>&1 | grep -i "error"
```

**Step 3: Commit**

```bash
git add -A
git commit -m "refactor(ux): replace 9 duplicate pages with redirects"
```

---

## Task 4: Add Redirects for Absorbed Pages

**Why:** Pages that aren't duplicates but are being consolidated into the 6 primary pages. Users/bookmarks hitting old URLs should land somewhere useful.

**Files to convert to redirect stubs:**

| Old Route | Redirect To | File |
|-----------|------------|------|
| `/analytics` | `/dashboard` | `src/app/analytics/page.tsx` |
| `/intelligence` | `/coaches` | `src/app/intelligence/page.tsx` |
| `/competitors` | `/coaches` | `src/app/competitors/page.tsx` |
| `/dms` | `/outreach` | `src/app/dms/page.tsx` |
| `/content-queue` | `/content` | `src/app/content-queue/page.tsx` |
| `/audit` | `/dashboard` | `src/app/audit/page.tsx` |
| `/connections` | `/outreach` | `src/app/connections/page.tsx` |
| `/hooks` | `/content` | `src/app/hooks/page.tsx` |
| `/viral` | `/content` | `src/app/viral/page.tsx` |
| `/captions` | `/content` | `src/app/captions/page.tsx` |
| `/comments` | `/content` | `src/app/comments/page.tsx` |
| `/media` | `/content` | `src/app/media/page.tsx` |
| `/media-lab` | `/content` | `src/app/media-lab/page.tsx` |
| `/media-import` | `/content` | `src/app/media-import/page.tsx` |
| `/videos` | `/content` | `src/app/videos/page.tsx` |
| `/map` | `/coaches` | `src/app/map/page.tsx` |

**IMPORTANT:** Before overwriting each file, check if the page has unique components or logic that should be extracted into a reusable component first. Specifically:
- `/content-queue/page.tsx` — the queue UI and approve/reject logic. Extract the main component to `src/components/content/content-queue.tsx` before replacing.
- `/dms/page.tsx` — the DM list UI. Extract to `src/components/outreach/dm-list.tsx`.
- `/analytics/page.tsx` — the stats cards. Extract to `src/components/dashboard/analytics-cards.tsx`.
- `/intelligence/page.tsx` — the coach intel view. Extract to `src/components/coaches/intelligence-view.tsx`.
- `/competitors/page.tsx` — the competitor table. Extract to `src/components/coaches/competitors-view.tsx`.
- `/map/page.tsx` — the map component. Extract to `src/components/coaches/school-map.tsx`.
- `/connections/page.tsx` — the follower list. Extract to `src/components/outreach/connections-list.tsx`.
- `/hooks/page.tsx` — the hooks library. Extract to `src/components/content/hooks-library.tsx`.
- `/media-lab/page.tsx` — the media browser. Extract to `src/components/content/media-browser.tsx`.

For the others (viral, captions, comments, media, media-import, videos, audit), check if they have any unique logic worth keeping. If they're simple displays, just redirect — we can rebuild within the tab if needed.

**Step 1: Extract key components from pages being absorbed**

Read each page listed above. If it has substantial UI logic (>50 lines of meaningful component code), extract the main component to the path listed. If it's a thin wrapper, skip extraction.

**Step 2: Replace all 16 pages with redirect stubs**

Same pattern as Task 3:
```typescript
import { redirect } from "next/navigation";
export default function Page() { redirect("/TARGET"); }
```

**Step 3: Run build**

```bash
npm run build 2>&1 | grep -i "error"
```

Fix any broken imports that referenced these pages.

**Step 4: Commit**

```bash
git add -A
git commit -m "refactor(ux): extract components + redirect 16 absorbed pages to Six-Pack homes"
```

---

## Task 5: Build `/content` Page (New — Consolidates Content Features)

**Why:** `/content-queue` is being redirected to `/content`. We need the new `/content` page with tabs for Queue, Create, and Library.

**Files:**
- Create: `src/app/content/page.tsx`
- Reference: extracted components from Task 4

**Step 1: Create the content page with 3 tabs**

```typescript
"use client";

import { useState } from "react";
import { SCPageHeader, SCTabs, SCPageTransition } from "@/components/sc";

// Import extracted components (adjust paths based on what Task 4 extracted)
// import { ContentQueue } from "@/components/content/content-queue";
// import { HooksLibrary } from "@/components/content/hooks-library";
// import { MediaBrowser } from "@/components/content/media-browser";

const TABS = [
  { label: "Queue", value: "queue" },
  { label: "Create", value: "create" },
  { label: "Library", value: "library" },
];

export default function ContentPage() {
  const [activeTab, setActiveTab] = useState("queue");

  return (
    <SCPageTransition>
      <div className="min-h-screen bg-sc-bg md:ml-64 p-6">
        <SCPageHeader
          title="Content Studio"
          subtitle="Create, schedule, and manage Jacob's X presence"
        />
        <SCTabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} className="mb-6" />

        {activeTab === "queue" && (
          <div>
            {/* Render the extracted ContentQueue component here */}
            {/* <ContentQueue /> */}
            <p className="text-slate-400">Queue tab — import ContentQueue component from Task 4</p>
          </div>
        )}

        {activeTab === "create" && (
          <div>
            {/* Media upload + AI post generation */}
            <p className="text-slate-400">Create tab — media upload + auto-generate posts</p>
          </div>
        )}

        {activeTab === "library" && (
          <div>
            {/* Hooks, captions, viral templates, media browser */}
            {/* <HooksLibrary /> */}
            {/* <MediaBrowser /> */}
            <p className="text-slate-400">Library tab — hooks, captions, media browser from Task 4</p>
          </div>
        )}
      </div>
    </SCPageTransition>
  );
}
```

**Note:** The actual implementation should import the extracted components from Task 4 and render them in each tab. The placeholders above show the structure. Adjust imports based on what was actually extracted.

**Step 2: Verify the page renders**

Navigate to `/content` in the dev server. Confirm 3 tabs render and switch correctly.

**Step 3: Commit**

```bash
git add src/app/content/page.tsx
git commit -m "feat(ux): create /content page with Queue, Create, Library tabs"
```

---

## Task 6: Add Tabs to `/coaches` Page

**Why:** Intelligence, Competitors, Map, and Coach Panel need to be accessible from the Coaches page.

**Files:**
- Modify: `src/app/coaches/page.tsx`
- Reference: extracted components from Task 4

**Step 1: Add SCTabs to the existing coaches page**

The existing `/coaches` page already has a filterable coach table. Add tabs above it:

```typescript
const TABS = [
  { label: "All Coaches", value: "coaches" },
  { label: "Profiles", value: "profiles" },
  { label: "Coach Panel", value: "panel" },
  { label: "Map", value: "map" },
  { label: "Competitors", value: "competitors" },
];
```

- "All Coaches" tab: render the existing coach table (current page content)
- "Profiles" tab: render intelligence/personality view (from extracted component)
- "Coach Panel" tab: render panel reviews (already exists — check for panel component)
- "Map" tab: render school map (from extracted component)
- "Competitors" tab: render competitor table (from extracted component)

Wrap the existing page content in a tab conditional:

```typescript
{activeTab === "coaches" && (
  // Existing coach table JSX goes here
)}
{activeTab === "profiles" && <IntelligenceView />}
{activeTab === "panel" && <CoachPanelView />}
{activeTab === "map" && <SchoolMap />}
{activeTab === "competitors" && <CompetitorsView />}
```

**Step 2: Verify tabs work**

Navigate to `/coaches`, switch between all 5 tabs.

**Step 3: Commit**

```bash
git add src/app/coaches/page.tsx
git commit -m "feat(ux): add Profiles, Panel, Map, Competitors tabs to /coaches"
```

---

## Task 7: Add Tabs to `/outreach` Page

**Why:** DMs, Follow Strategy, and NCSA Leads need to be in one place.

**Files:**
- Modify: `src/app/outreach/page.tsx`
- Reference: extracted components from Task 4

**Step 1: Add tabs to outreach page**

```typescript
const TABS = [
  { label: "DM Sequences", value: "sequences" },
  { label: "Follow Strategy", value: "follows" },
  { label: "NCSA Leads", value: "ncsa" },
];
```

- "DM Sequences" tab: existing outreach page content (coach pipeline, DM status)
- "Follow Strategy" tab: connections list + follow-back tracking (from extracted component)
- "NCSA Leads" tab: NCSA kanban pipeline (from existing `/agency/leads` component — DO NOT delete `/agency/leads`, just import its component)

**Step 2: Verify tabs work**

**Step 3: Commit**

```bash
git add src/app/outreach/page.tsx
git commit -m "feat(ux): add Follow Strategy and NCSA Leads tabs to /outreach"
```

---

## Task 8: Rebuild `/camps` Page

**Why:** Mike said camps are "very important." The experimental /camps page was deleted in Task 2. Build a proper one.

**Files:**
- Create: `src/app/camps/page.tsx`

**Step 1: Create camps page with two sections**

```typescript
"use client";

import { useState, useEffect } from "react";
import { SCPageHeader, SCGlassCard, SCBadge, SCButton, SCPageTransition } from "@/components/sc";

interface Camp {
  id: string;
  school: string;
  name: string;
  date: string;
  type: "prospect_day" | "camp" | "combine" | "showcase";
  status: "interested" | "registered" | "attended";
  coachId?: string;
  coachName?: string;
  notes?: string;
}

interface NCSAInvite {
  id: string;
  school: string;
  coachName: string;
  campName: string;
  inviteDate: string;
  status: "new" | "reviewed" | "responded" | "attending" | "declined";
}

export default function CampsPage() {
  // For now, use static data. Wire to API in a future sprint.
  const [camps] = useState<Camp[]>([]);
  const [invites] = useState<NCSAInvite[]>([]);

  return (
    <SCPageTransition>
      <div className="min-h-screen bg-sc-bg md:ml-64 p-6">
        <SCPageHeader
          title="Camp Central"
          subtitle="Track upcoming camps and NCSA invitations"
        />

        {/* Upcoming Camps */}
        <SCGlassCard className="mb-6">
          <h2 className="text-lg font-bold text-white mb-4">Upcoming Camps</h2>
          {camps.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <span className="material-symbols-outlined text-4xl mb-2 block">event</span>
              <p>No camps scheduled yet.</p>
              <p className="text-sm mt-1">Add camps from coach profiles or NCSA invites below.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {camps.map((camp) => (
                <div key={camp.id} className="flex items-center justify-between p-3 bg-sc-surface rounded-lg border border-sc-border">
                  <div>
                    <p className="text-white font-medium">{camp.name}</p>
                    <p className="text-sm text-slate-400">{camp.school} &middot; {new Date(camp.date).toLocaleDateString()}</p>
                  </div>
                  <SCBadge variant={camp.status === "registered" ? "success" : "default"}>
                    {camp.status}
                  </SCBadge>
                </div>
              ))}
            </div>
          )}
        </SCGlassCard>

        {/* NCSA Invites */}
        <SCGlassCard>
          <h2 className="text-lg font-bold text-white mb-4">NCSA Invitations</h2>
          {invites.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <span className="material-symbols-outlined text-4xl mb-2 block">mail</span>
              <p>No NCSA invitations yet.</p>
              <p className="text-sm mt-1">Invitations from coaches will appear here automatically.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {invites.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between p-3 bg-sc-surface rounded-lg border border-sc-border">
                  <div>
                    <p className="text-white font-medium">{invite.campName}</p>
                    <p className="text-sm text-slate-400">{invite.school} &middot; Coach {invite.coachName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <SCBadge variant={invite.status === "new" ? "warning" : "default"}>
                      {invite.status}
                    </SCBadge>
                    {invite.status === "new" && (
                      <SCButton size="sm">Send Thanks</SCButton>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SCGlassCard>
      </div>
    </SCPageTransition>
  );
}
```

**Step 2: Verify page renders**

Navigate to `/camps`. Confirm empty states display correctly.

**Step 3: Commit**

```bash
git add src/app/camps/page.tsx
git commit -m "feat(ux): create /camps page with upcoming camps and NCSA invites"
```

---

## Task 9: Consolidate `/dashboard` — Add Status Strip + Weekly Tasks + Activity Feed

**Why:** The dashboard should answer "how's Jacob doing?" and "what does he need to do?" in one glance.

**Files:**
- Modify: `src/app/dashboard/page.tsx`
- Reference: `/analytics` stats (extracted component), `/audit` data

**Step 1: Read the existing dashboard page**

Understand current layout. Keep what works, add missing sections.

**Step 2: Ensure dashboard has these 3 sections:**

1. **Status Strip** — horizontal stat cards at top (follower count, engagement rate, active sequences, next camp). If the existing dashboard already has stat cards, update them to show these 4 metrics.

2. **Weekly Tasks** — checklist section. Can be static for now (hardcoded tasks like "Upload 2 training clips", "Review drafted posts"). Wire to API later.

3. **Activity Feed** — recent engagement signals. If there's already a feed/activity section, keep it. If not, add a section that fetches from `/api/outreach/health` and `/api/coaches` to show recent DMs and coach interactions.

**Step 3: Verify dashboard renders with all 3 sections**

**Step 4: Commit**

```bash
git add src/app/dashboard/page.tsx
git commit -m "feat(ux): consolidate dashboard with status strip, weekly tasks, activity feed"
```

---

## Task 10: Clean Up Orphaned Files + Delete Duplicate SC Components

**Why:** There are duplicate SC component files (e.g., `sc-sidebar 2.tsx`, `sc-tabs 2.tsx`, `nav 2.tsx`). Clean them up.

**Files to check and delete:**
- `src/components/sc/sc-sidebar 2.tsx` — delete (duplicate of sc-sidebar.tsx)
- `src/components/sc/sc-shell 2.tsx` — delete (duplicate of sc-shell.tsx)
- `src/components/sc/sc-tabs 2.tsx` — delete (duplicate of sc-tabs.tsx)
- `src/components/recruit/nav 2.tsx` — delete (duplicate of nav.tsx)

**Step 1: Verify no imports reference the " 2" files**

```bash
grep -r "sc-sidebar 2\|sc-shell 2\|sc-tabs 2\|nav 2" src/ --include="*.tsx" --include="*.ts"
```

If any imports reference them, update to the non-duplicate version.

**Step 2: Delete the duplicate files**

**Step 3: Commit**

```bash
git add -A
git commit -m "chore(ux): delete duplicate SC component files"
```

---

## Task 11: Full Test Suite + Build Verification

**Why:** Confirm nothing is broken after the massive restructure.

**Step 1: Run unit tests**

```bash
cd alex-recruiting && npx vitest run
```

Expected: Tests pass (some may need updates if they reference deleted pages).

**Step 2: Fix any test failures**

Tests that import from deleted pages need to be updated or removed:
- Tests for deleted experimental pages → delete the test files
- Tests that reference absorbed pages → update imports

**Step 3: Run production build**

```bash
npm run build
```

Expected: Build succeeds with no TypeScript errors.

**Step 4: Manual verification**

Navigate through all 6 sidebar pages in dev server:
- `/dashboard` — status strip, tasks, feed all render
- `/coaches` — 5 tabs work, coach detail links work
- `/outreach` — 3 tabs work, DM sequences visible
- `/content` — 3 tabs work
- `/camps` — empty states render
- `/agency` — team roster + chat works

**Step 5: Commit**

```bash
git add -A
git commit -m "test: fix tests after Sprint 2 UX restructure"
```

---

## Task 12: Update HANDOFF.md

**Step 1: Write structured handoff with Sprint 2 results**

---

## Summary

| Task | What It Does | Risk | Estimated Size |
|------|-------------|------|----------------|
| 1. Sidebar | Update to 6 items | Low | Small |
| 2. Delete experimental | Remove 12 pages | Low | Small |
| 3. Delete duplicates | Replace 9 with redirects | Low | Small |
| 4. Redirect absorbed | Extract components + redirect 16 pages | Medium | Large |
| 5. Build /content | New tabbed content page | Medium | Medium |
| 6. Tabs on /coaches | Add 5 tabs | Medium | Medium |
| 7. Tabs on /outreach | Add 3 tabs | Medium | Medium |
| 8. Build /camps | New camps page | Low | Medium |
| 9. Consolidate /dashboard | Add 3 sections | Medium | Medium |
| 10. Clean orphans | Delete duplicate files | Low | Small |
| 11. Test + build | Verify everything | Low | Small |
| 12. Handoff | Session continuity | Low | Small |

**After Sprint 2:**
- 6 sidebar items (down from 12)
- 0 orphaned pages (down from 38)
- All old routes redirect to new homes
- Camps page exists
- Every feature accessible via tabs within the 6 primary pages
