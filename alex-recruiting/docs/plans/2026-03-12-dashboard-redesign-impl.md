# Dashboard Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the Alex Recruiting dashboard as a Unified Command Center — 6 modules, cinematic black + red design matching Jacob's recruit site, all wired to real Supabase data.

**Architecture:** Single `/dashboard` route with sidebar nav (6 tabs). Each module is a page under `/dashboard/[section]`. Shared layout with dark theme tokens. All components use `dash-*` design tokens mapped to the recruit site's visual language (#000000 base, #ff000c accent, white opacity hierarchy).

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, shadcn/ui (Radix), Supabase (Drizzle ORM), Recharts, Lucide icons

**Design Skills:** Use `frontend-design` skill for all component work. Reference `ui-ux-pro-max-skill` (color theory, typography, dark mode), `designer-skills` (animations, components, visual hierarchy), and recruit site components as the visual benchmark.

---

### Task 1: Foundation — Dark Theme Tokens & Utility Functions

**Files:**
- Modify: `src/lib/utils.ts` — update color functions for dark mode
- Modify: `src/components/dashboard/mobile-nav.tsx` — match sidebar style, add Team tab
- Modify: `src/app/layout.tsx` — update themeColor meta tag
- Verify: `src/app/globals.css` — confirm dash tokens are correct
- Verify: `tailwind.config.ts` — confirm dash color values

**Step 1: Update utils.ts color functions for dark theme**

Replace all light-mode color classes in `getPillarColor`, `getTierColor`, `getStatusColor` with dark-mode equivalents using dash tokens:

```typescript
export function getPillarColor(pillar: string): string {
  switch (pillar) {
    case "performance": return "bg-[#ff000c]/20 text-[#ff000c]";
    case "work_ethic": return "bg-[#D4A853]/20 text-[#D4A853]";
    case "character": return "bg-white/10 text-white/80";
    default: return "bg-white/5 text-white/40";
  }
}

export function getTierColor(tier: string): string {
  switch (tier) {
    case "Tier 1": return "text-[#ff000c] bg-[#ff000c]/10 border-[#ff000c]/20";
    case "Tier 2": return "text-[#D4A853] bg-[#D4A853]/10 border-[#D4A853]/20";
    case "Tier 3": return "text-white/60 bg-white/5 border-white/10";
    default: return "text-white/40 bg-white/5 border-white/10";
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "draft": return "text-[#F59E0B] bg-[#F59E0B]/10";
    case "approved": return "text-[#ff000c] bg-[#ff000c]/10";
    case "scheduled": return "text-[#D4A853] bg-[#D4A853]/10";
    case "posted": return "text-[#22C55E] bg-[#22C55E]/10";
    case "rejected": return "text-[#EF4444] bg-[#EF4444]/10";
    case "sent": return "text-[#22C55E] bg-[#22C55E]/10";
    case "responded": return "text-[#22C55E] bg-[#22C55E]/10";
    case "no_response": return "text-[#F59E0B] bg-[#F59E0B]/10";
    default: return "text-white/40 bg-white/5";
  }
}
```

**Step 2: Update mobile-nav.tsx to match sidebar + add Team tab**

Add Team tab, use red accent, uppercase tracking:

```tsx
const MOBILE_TABS = [
  { href: "/dashboard", label: "Home", icon: Home, exact: true },
  { href: "/dashboard/coaches", label: "Coaches", icon: Users },
  { href: "/dashboard/outreach", label: "Outreach", icon: Mail },
  { href: "/dashboard/content", label: "Content", icon: Calendar },
  { href: "/dashboard/analytics", label: "Stats", icon: BarChart3 },
  { href: "/dashboard/team", label: "Team", icon: MessageSquare },
];
```

Style: `bg-black/95 backdrop-blur-xl border-t border-white/5`, active state `text-[#ff000c]`, inactive `text-white/40`. Text: `text-[9px] uppercase tracking-wider`.

**Step 3: Update layout.tsx themeColor**

Change `themeColor: "#0f172a"` to `themeColor: "#000000"`.

**Step 4: Verify tokens and restart dev server**

Run: `npm run dev`
Navigate to `/dashboard`
Verify: black background, red accents, sidebar shows correctly at 1440px

**Step 5: Commit**

```bash
git add src/lib/utils.ts src/components/dashboard/mobile-nav.tsx src/app/layout.tsx
git commit -m "feat(dashboard): dark theme foundation — tokens, utils, mobile nav"
```

---

### Task 2: Overview Page Redesign

**Files:**
- Modify: `src/app/dashboard/page.tsx` — full redesign
- Modify: `src/components/dashboard/stat-card.tsx` — cinematic style

**Step 1: Redesign stat-card.tsx**

Replace blue accent with red. Add monospace number rendering. Match recruit site visual weight:

```tsx
export function StatCard({ label, value, change, changeType = "neutral", icon: Icon }: StatCardProps) {
  return (
    <div className="rounded-xl border border-white/5 bg-[#0A0A0A] p-5 transition-colors hover:bg-[#111111]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">{label}</p>
          <p className="mt-2 font-jetbrains text-3xl font-bold tracking-tight text-white">
            {value}
          </p>
          {change && (
            <p className={cn(
              "mt-1 text-xs font-medium",
              changeType === "up" && "text-[#22C55E]",
              changeType === "down" && "text-[#EF4444]",
              changeType === "neutral" && "text-white/40"
            )}>
              {change}
            </p>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ff000c]/10">
          <Icon className="h-5 w-5 text-[#ff000c]" />
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Redesign overview page**

Update all classes to use recruit-site styling:
- Header: uppercase bold tracking-tight
- Cards: `border-white/5 bg-[#0A0A0A]`
- Action items: red left border for urgent, gold for medium
- Events: dark cards with badge pills
- Quick links: `hover:border-[#ff000c]/30`
- Replace "View calendar" link color from blue to red

**Step 3: Verify in browser**

Navigate to `/dashboard`, check:
- Stat cards render with red icons and monospace numbers
- Action items have correct border colors
- Quick link cards hover to red border
- No blue colors anywhere

**Step 4: Commit**

```bash
git add src/app/dashboard/page.tsx src/components/dashboard/stat-card.tsx
git commit -m "feat(dashboard): redesign overview with cinematic dark theme"
```

---

### Task 3: Coach CRM Redesign

**Files:**
- Modify: `src/app/dashboard/coaches/page.tsx` — header + layout
- Modify: `src/components/dashboard/coach-table.tsx` — dark theme table
- Modify: `src/components/dashboard/coach-detail.tsx` — slide-over redesign
- Modify: `src/components/dashboard/slide-over.tsx` — dark overlay
- Modify: `src/components/dashboard/badge.tsx` — dark badge variants
- Modify: `src/components/dashboard/empty-state.tsx` — dark empty state

**Step 1: Update badge.tsx for dark theme**

All variants should use transparent/dark backgrounds:
- default: `bg-white/5 text-white/60`
- success: `bg-[#22C55E]/10 text-[#22C55E]`
- warning: `bg-[#F59E0B]/10 text-[#F59E0B]`
- danger: `bg-[#EF4444]/10 text-[#EF4444]`
- accent: `bg-[#ff000c]/10 text-[#ff000c]`
- muted: `bg-white/5 text-white/40`

**Step 2: Update slide-over.tsx for dark theme**

Overlay: `bg-black/60 backdrop-blur-sm`
Panel: `bg-[#0A0A0A] border-l border-white/5`
Close button: `text-white/40 hover:text-white`

**Step 3: Update empty-state.tsx**

Icon container: `bg-white/5`
Title: `text-white`
Description: `text-white/40`
Button: `bg-[#ff000c] hover:bg-[#cc000a] text-white`

**Step 4: Update coach-table.tsx**

Table: dark backgrounds, white/5 borders, white text
Filters: dark inputs with `bg-[#111111] border-white/10 text-white`
Headers: `text-[10px] uppercase tracking-[0.2em] text-white/40`
Rows: `hover:bg-[#111111]`, borders `border-white/5`
Tier badges: use updated `getTierColor()`
Status pills: use updated `getStatusColor()`
Search input: `bg-[#0A0A0A] border-white/10 text-white placeholder:text-white/30`

**Step 5: Update coach-detail.tsx**

Use slide-over with dark theme
Coach name: bold white uppercase
Fields: label in `text-white/40`, value in `text-white`
Notes textarea: `bg-[#111111] border-white/10 text-white`
Action buttons: "Draft DM" in `bg-[#ff000c]`, secondary in `bg-white/5`

**Step 6: Update coaches/page.tsx header**

```tsx
<h1 className="text-2xl font-bold uppercase tracking-tight text-white">Coach CRM</h1>
<p className="mt-1 text-sm text-white/40">
  {coaches.length} coaches tracked
</p>
```

**Step 7: Verify in browser**

Navigate to `/dashboard/coaches`, check:
- Table renders with dark theme
- Filters have dark inputs
- Tier/status badges use new colors
- Empty state looks correct
- Click a coach row — detail slides in with dark styling

**Step 8: Commit**

```bash
git add src/app/dashboard/coaches/ src/components/dashboard/coach-table.tsx src/components/dashboard/coach-detail.tsx src/components/dashboard/slide-over.tsx src/components/dashboard/badge.tsx src/components/dashboard/empty-state.tsx
git commit -m "feat(dashboard): redesign coach CRM with cinematic dark theme"
```

---

### Task 4: DM Outreach Redesign

**Files:**
- Modify: `src/app/dashboard/outreach/page.tsx` — header + layout
- Modify: `src/components/dashboard/dm-kanban.tsx` — dark kanban
- Modify: `src/components/dashboard/dm-composer.tsx` — dark composer

**Step 1: Update dm-kanban.tsx**

Column headers: `text-[10px] uppercase tracking-[0.2em] text-white/40`
Column backgrounds: `bg-[#0A0A0A]`
Cards: `bg-[#111111] border-white/5 hover:border-[#ff000c]/30`
Status dots: Drafted=amber, Approved=red, Sent=green, Responded=emerald
Card text: coach name in white, school in white/60, preview in white/40

**Step 2: Update dm-composer.tsx**

Panel: dark slide-over
Inputs: `bg-[#111111] border-white/10 text-white`
Template selector: dark cards with red active border
Preview area: `bg-[#0A0A0A] border-white/5` with formatted message
Approve button: `bg-[#ff000c] text-white`
Cancel: `bg-white/5 text-white/60`

**Step 3: Update outreach page header**

Uppercase title, "New DM" button in `bg-[#ff000c]`

**Step 4: Verify in browser**

Navigate to `/dashboard/outreach`, check:
- Kanban columns render dark
- Cards have correct styling
- Composer opens with dark theme
- Template picker works

**Step 5: Commit**

```bash
git add src/app/dashboard/outreach/ src/components/dashboard/dm-kanban.tsx src/components/dashboard/dm-composer.tsx
git commit -m "feat(dashboard): redesign DM outreach with cinematic dark theme"
```

---

### Task 5: Content Engine Redesign

**Files:**
- Rename: `src/app/dashboard/calendar/` → `src/app/dashboard/content/`
- Modify: `src/app/dashboard/content/page.tsx` — dark calendar
- Modify: `src/components/dashboard/calendar-grid.tsx` — dark grid
- Modify: `src/components/dashboard/post-composer.tsx` — dark composer
- Modify: `src/components/dashboard/pillar-chart.tsx` — dark chart

**Step 1: Create content route**

Create `src/app/dashboard/content/page.tsx` — either rename or copy from calendar with updated styles.

**Step 2: Update calendar-grid.tsx**

Day cells: `bg-[#0A0A0A]` default, `bg-[#111111]` hover
Today: `border-[#ff000c]` ring
Post dots: use pillar colors (red=performance, gold=work ethic, white=character)
Month nav: `text-white`, arrows `text-white/40 hover:text-white`
Day numbers: `text-white/60`, weekend `text-white/30`
Empty cells: `bg-black`

**Step 3: Update post-composer.tsx**

Dark slide-over styling
Pillar selector: three cards with pillar colors
Hashtag suggestions: `bg-white/5 text-white/60` pills
Character counter: warn at 250+
Schedule picker: dark date/time inputs
Post button: `bg-[#ff000c]`

**Step 4: Update pillar-chart.tsx**

Bars: red for performance, gold for work ethic, white for character
Background: transparent
Labels: `text-white/40`
Values: `text-white font-jetbrains`

**Step 5: Verify in browser**

Navigate to `/dashboard/content`, check:
- Calendar grid dark
- Post composer works
- Pillar chart shows distribution

**Step 6: Commit**

```bash
git add src/app/dashboard/content/ src/components/dashboard/calendar-grid.tsx src/components/dashboard/post-composer.tsx src/components/dashboard/pillar-chart.tsx
git commit -m "feat(dashboard): redesign content engine with cinematic dark theme"
```

---

### Task 6: Analytics Redesign

**Files:**
- Modify: `src/app/dashboard/analytics/page.tsx` — full redesign
- Modify: `src/components/dashboard/pipeline-funnel.tsx` — dark funnel
- Modify: `src/components/dashboard/activity-feed.tsx` — dark feed
- Modify: `src/components/dashboard/bar-chart.tsx` — dark chart
- Modify: `src/components/dashboard/funnel-chart.tsx` — dark funnel chart

**Step 1: Update pipeline-funnel.tsx**

Bars: gradient from red to gold
Labels: `text-white/40`
Values: `text-white font-jetbrains`
Conversion rates: `text-[#22C55E]` for good, `text-[#F59E0B]` for needs improvement

**Step 2: Update activity-feed.tsx**

Items: `border-l-2 border-white/5` with icon dot
Type colors: post=red, dm=gold, follow=green, engagement=white
Timestamps: `text-white/30`
Text: `text-white/60`

**Step 3: Update analytics page layout**

- Top stat row: 4 cards (same StatCard component)
- Pipeline funnel: full-width
- Content distribution + activity feed: two columns
- Profile audit score: large number with gauge

**Step 4: Verify in browser**

Navigate to `/dashboard/analytics`, check:
- Stats render with red icons
- Funnel chart dark
- Activity feed dark
- No blue/light colors

**Step 5: Commit**

```bash
git add src/app/dashboard/analytics/ src/components/dashboard/pipeline-funnel.tsx src/components/dashboard/activity-feed.tsx src/components/dashboard/bar-chart.tsx src/components/dashboard/funnel-chart.tsx
git commit -m "feat(dashboard): redesign analytics with cinematic dark theme"
```

---

### Task 7: REC Team Redesign

**Files:**
- Modify: `src/app/dashboard/team/page.tsx` — dark team grid + inline chat

**Step 1: Redesign team page**

Move from linking to `/agency/[member]` to inline chat within dashboard.
Team member cards: `bg-[#0A0A0A] border-white/5`
Avatar circles: use `bg-[#ff000c]/20 text-[#ff000c]` instead of colored bg
Selected member: full-width chat panel below grid
Chat input: `bg-[#111111] border-white/10 text-white`
Messages: user in `bg-[#ff000c]/10`, team in `bg-white/5`

**Step 2: Add inline chat functionality**

Fetch from `POST /api/rec/team/chat` with SSE streaming
Display responses in chat bubble format
Show typing indicator during stream

**Step 3: Verify in browser**

Navigate to `/dashboard/team`, check:
- Team grid renders with dark cards
- Click member opens chat area
- Chat input is functional (may get API errors without keys — that's ok)

**Step 4: Commit**

```bash
git add src/app/dashboard/team/
git commit -m "feat(dashboard): redesign REC team with inline chat"
```

---

### Task 8: Database Seeding & API Wiring

**Files:**
- Create: `src/lib/db/seed.ts` — seed script
- Modify: `src/app/api/coaches/route.ts` — ensure real Supabase queries
- Modify: `src/app/api/posts/route.ts` — ensure real queries
- Modify: `src/app/api/dms/route.ts` — ensure real queries
- Modify: `src/app/api/analytics/route.ts` — ensure real queries

**Step 1: Create seed script**

Import target schools from `src/lib/data/target-schools.ts`
Insert into `schools` table
Generate coach records from school data
Insert sample posts, DMs, analytics snapshots

**Step 2: Wire API routes to Supabase**

Each API route should:
- Import `db` from `@/lib/db`
- Query with Drizzle ORM
- Return proper JSON responses
- Handle errors gracefully

**Step 3: Run seed**

```bash
npx tsx src/lib/db/seed.ts
```

**Step 4: Verify all modules show real data**

Navigate through each dashboard tab
Check: coaches load, posts show, DMs display, analytics calculate

**Step 5: Commit**

```bash
git add src/lib/db/seed.ts src/app/api/
git commit -m "feat(dashboard): wire API routes to Supabase, add seed script"
```

---

### Task 9: Polish Pass — Animations, Responsiveness, Film Grain

**Files:**
- Modify: Various dashboard components
- Modify: `src/app/globals.css` — add dashboard animations

**Step 1: Add page transition animations**

Each page gets `animate-fade-in` (already exists in CSS)
Add staggered card animations for grid layouts
Add subtle hover lifts on interactive cards

**Step 2: Add recruit-style motifs**

Red vertical bar accent on section headers (like scroll cue in hero)
Uppercase tracking-widest section labels
Film grain overlay option for dashboard header area (subtle)
Backdrop blur on mobile nav and overlays

**Step 3: Responsive verification**

Test at 375px (mobile), 768px (tablet), 1440px (desktop)
Verify: sidebar hidden on mobile, bottom nav shows
Verify: grids collapse to single column on mobile
Verify: slide-overs are full-width on mobile

**Step 4: Commit**

```bash
git add -A
git commit -m "feat(dashboard): polish pass — animations, responsive, visual motifs"
```

---

### Task 10: Final Verification & Cleanup

**Step 1: Run full build**

```bash
npm run build
```

Fix any TypeScript errors.

**Step 2: Run existing tests**

```bash
npm test
```

Fix any broken tests from refactored components.

**Step 3: Visual verification at all breakpoints**

Screenshot each module at mobile + desktop.
Verify no blue/light-theme colors remain.
Verify all modules are accessible via sidebar nav.

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat(dashboard): complete unified command center redesign"
```
