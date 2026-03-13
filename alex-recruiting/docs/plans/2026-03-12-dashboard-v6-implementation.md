# Dashboard v6 — SportsCenter Command Center Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Transform the dark-themed v5 dashboard into a light-themed Apple HIG + ESPN/SI sports media command center with real school logos, zero fake data, and professional editorial aesthetics.

**Architecture:** Replace the `.dashboard-shell` dark token system with light tokens. Rewrite all dashboard components from dark → light, remove GSAP/film grain/typewriter, add school logos and colors data layer, strip all hardcoded fake data, and update CLAUDE.md with data integrity rules.

**Tech Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS, Inter + JetBrains Mono fonts, SVG school logos

---

## Task 1: School Data Layer — Logos + Colors

**Files:**
- Create: `src/lib/data/school-branding.ts`
- Create: `public/logos/` directory with 17 SVG placeholder files
- Modify: `src/lib/data/target-schools.ts` (add logo path + colors to TargetSchool interface)

**What:**
Create the school branding data layer that every coach-related component will consume.

**Step 1: Create school branding data file**

Create `src/lib/data/school-branding.ts` with:
- `schoolColors` map: Record<string, { primary: string; secondary: string; name: string }>
- Colors for all 17 target schools (research accurate brand colors)
- `getSchoolLogo(id: string): string` — returns `/logos/{id}.svg`
- `getSchoolColors(id: string)` — returns colors or default gray

School colors (accurate):
- wisconsin: `#C5050C` / `#FFFFFF`
- northwestern: `#4E2A84` / `#FFFFFF`
- iowa: `#FFCD00` / `#000000`
- iowa-state: `#C8102E` / `#F1BE48`
- northern-illinois: `#BA0C2F` / `#000000`
- western-michigan: `#6C4023` / `#B5A167`
- ball-state: `#BA0C2F` / `#FFFFFF`
- central-michigan: `#6A0032` / `#FFC82E`
- south-dakota-state: `#0033A0` / `#FFD100`
- north-dakota-state: `#006A31` / `#FFC82E`
- illinois-state: `#CE1126` / `#FFFFFF`
- youngstown-state: `#EE3224` / `#FFFFFF`
- saginaw-valley: `#003366` / `#CC0000`
- michigan-tech: `#000000` / `#FFCD00`
- ferris-state: `#BA0C2F` / `#FFD200`
- winona-state: `#4B2E84` / `#FFFFFF`
- minnesota-state-mankato: `#4F2D7F` / `#F7E24B`

**Step 2: Create SVG logo placeholders**

Create `public/logos/` directory. For each school, create a simple SVG placeholder showing the school's initials in their primary color on a white circle. These are temporary — Mike can replace with real logos later.

Format: 48x48 SVG circle with centered initials text.

**Step 3: Update TargetSchool interface**

Add optional fields to `TargetSchool` interface in `target-schools.ts`:
```ts
logoPath?: string;
primaryColor?: string;
secondaryColor?: string;
```

Do NOT populate these on each school entry — the branding file handles the mapping by ID.

**Step 4: Commit**
```
feat: add school branding data layer (colors + logo placeholders)
```

---

## Task 2: Design Token System — Dark → Light

**Files:**
- Modify: `src/app/globals.css` (rewrite `.dashboard-shell` block + remove dark animations)
- Modify: `tailwind.config.ts` (update `dash` color tokens to light values)

**What:**
Replace the entire dark token system with the approved light theme.

**Step 1: Rewrite `.dashboard-shell` CSS variables in globals.css**

Replace the `.dashboard-shell` block (lines ~195-226) with light theme tokens:
```css
.dashboard-shell {
  --dash-bg: #FAFAFA;
  --dash-card: #FFFFFF;
  --dash-sidebar: #FFFFFF;
  --dash-subtle: #F5F5F4;
  --dash-surface: #FFFFFF;
  --dash-surface-raised: #FAFAFA;

  --dash-text: #0F1720;
  --dash-text-secondary: #6B7280;
  --dash-muted: #9CA3AF;
  --dash-text-disabled: #D1D5DB;

  --dash-border: #E5E7EB;
  --dash-border-subtle: #F3F4F6;
  --dash-border-strong: #D1D5DB;

  --dash-accent: #0F1720;
  --dash-accent-hover: #1F2937;
  --dash-accent-subtle: #F3F4F6;

  --dash-success: #16A34A;
  --dash-warning: #F59E0B;
  --dash-danger: #DC2626;
  --dash-info: #2563EB;

  --dash-gold: #D4A853;
  --dash-gold-subtle: #FEF9EF;

  --dash-font-display: 'Inter', system-ui, sans-serif;
  --dash-font-mono: 'JetBrains Mono', monospace;

  background: var(--dash-bg);
  color: var(--dash-text);
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
}
```

Remove: dark scrollbar styling, red selection colors, film grain keyframe references from dashboard context.

**Step 2: Update Tailwind dash tokens**

Update `tailwind.config.ts` dash color entries to reference the new light values. Replace the nested dash object with light-appropriate values:
- `dash.bg` → `#FAFAFA`
- `dash.surface-1` → `#FFFFFF`
- `dash.surface-2` → `#FAFAFA`
- `dash.surface-3` → `#F5F5F4`
- `dash.text.primary` → `#0F1720`
- `dash.text.secondary` → `#6B7280`
- `dash.text.muted` → `#9CA3AF`
- `dash.border` → `#E5E7EB`
- `dash.accent` → `#0F1720`
- Remove `dash.accent` red references

**Step 3: Remove dark-only CSS utilities**

Remove or simplify: `.dash-pulse-ring` (red glow), `.dash-breathe` (opacity pulse), `.dash-section-header::before` (red accent bar). Replace `.dash-card` hover with light shadow instead of border-glow.

**Step 4: Commit**
```
feat: switch dashboard design tokens from dark to light theme
```

---

## Task 3: Layout + Sidebar + Mobile Nav — Light Shell

**Files:**
- Rewrite: `src/app/dashboard/layout.tsx`
- Rewrite: `src/components/dashboard/sidebar.tsx`
- Rewrite: `src/components/dashboard/mobile-nav.tsx`

**What:**
Complete rewrite of the dashboard shell. Remove film grain, GSAP, dark styling. Clean Apple HIG sidebar with proper nav.

**Step 1: Rewrite layout.tsx**

Remove: `DashboardFilmGrain` import and usage, `useDashboardAssembly` reference.
Keep: `DashboardSidebar`, `DashboardMobileNav`, `{children}` rendering.

New layout:
```tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard-shell min-h-screen">
      <DashboardSidebar />
      <main className="md:ml-[280px] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>
      <DashboardMobileNav />
    </div>
  );
}
```

**Step 2: Rewrite sidebar.tsx (~190 lines → ~120 lines)**

Remove: film grain SVG, pulse ring animation, RRS radial gauge, breathing animation, GSAP data attributes, glow effects, inline `<style>` block, `RRS_SCORE` hardcoded constant.

New sidebar structure:
- 280px fixed left, `bg-white border-r border-[#E5E7EB]`
- Header: "Jacob Rodgers" in Inter 600 navy, "Class of 2029 · OL · Pewaukee HS" in `text-[#9CA3AF] text-sm`
- Nav items: 6 items (Overview, Coaches, Outreach, Content, Analytics, Team). Each: 16px lucide icon + clean label. Active: `text-[#0F1720] font-semibold` with 3px left navy border. Inactive: `text-[#6B7280]`. Hover: `bg-[#F5F5F4]`.
- No status indicator dots (were based on fake/hardcoded data).
- Footer: "View Recruit Site →" in `text-[#9CA3AF]` with hover underline.

**Step 3: Rewrite mobile-nav.tsx (~92 lines → ~70 lines)**

Remove: RRS center indicator, `getRrsColor`, breathing animation.

New mobile nav:
- Fixed bottom, `bg-white border-t border-[#E5E7EB]`, `md:hidden`
- 5 tabs: Overview, Coaches, Outreach, Content, Team (drop Analytics on mobile — accessible from Overview)
- Active: navy icon + label. Inactive: gray icon only.
- Safe area padding for notch devices.
- Min touch target: 44px.

**Step 4: Commit**
```
feat: rewrite dashboard shell with light theme sidebar and mobile nav
```

---

## Task 4: Shared Components — StatCard + AnimatedNumber

**Files:**
- Rewrite: `src/components/dashboard/stat-card.tsx`
- Modify: `src/components/dashboard/animated-number.tsx` (keep logic, update styling)
- Delete: `src/components/dashboard/film-grain.tsx`
- Delete: `src/components/dashboard/typewriter.tsx`
- Delete: `src/hooks/useDashboardAssembly.ts`

**What:**
Update shared components for light theme. Remove dark-only components.

**Step 1: Delete dark-only components**

Delete:
- `src/components/dashboard/film-grain.tsx` (dark grain overlay)
- `src/components/dashboard/typewriter.tsx` (dark cinematic text reveal)
- `src/hooks/useDashboardAssembly.ts` (GSAP animation hook)

**Step 2: Rewrite stat-card.tsx**

New StatCard for light theme:
- White background, `border border-[#E5E7EB]`, `rounded-lg`
- Label: `text-[#6B7280] text-sm font-medium`
- Value: `font-mono text-2xl font-bold text-[#0F1720]`
- Change indicator: green up arrow / red down arrow, only if `change` prop is provided and non-null
- If value is `null` or `undefined`: show "—" in muted text
- Hover: `shadow-sm` (subtle lift)
- Remove: sparkline sub-component (was fake data), red icon styling, GSAP data attributes
- Keep: `AnimatedNumber` for numeric values

**Step 3: Update animated-number.tsx styling**

Keep: animation logic (requestAnimationFrame, reduced-motion respect).
Change: remove any red/accent color references. Use `font-mono` class. Remove GSAP references if any.

**Step 4: Commit**
```
feat: update shared dashboard components for light theme, remove dark-only components
```

---

## Task 5: Overview Page — Clean Redesign

**Files:**
- Rewrite: `src/app/dashboard/page.tsx`

**What:**
Complete rewrite of the dashboard home page. Remove all v5 cinematic components. Real data only.

**Step 1: Rewrite page.tsx (~245 lines → ~200 lines)**

Remove imports: `useDashboardAssembly`, `DailyBrief`, `ReadinessScoreGauge`, `RecruitingTimeline`, `SignalFeed`

Keep: API fetches to `/api/analytics`, `/api/coaches`, `/api/posts`, `/api/dms`

New layout:
```
Page title: "Overview" (Inter 700, 24px, navy)

Section A: Stat Cards Row (4 horizontal cards)
  - Coaches Tracked (from coaches API count)
  - DMs Sent (from dms API count)
  - Posts This Week (from posts API, filtered to current week)
  - Profile Views (from analytics API, or "—" if null)

Section B: Two-column layout (lg:grid-cols-3)
  Left (col-span-2): Recent Activity
    - Fetch real activity from API data (recent DMs, posts, coach follows)
    - Each row: relative timestamp, description text, school logo if coach-related
    - Empty state: "No recent activity. Start by following a coach or drafting a DM."
    - Max 10 items shown

  Right (col-span-1): Target Schools
    - List of 17 schools grouped by tier from targetSchools data
    - Each: school logo (32px), name, conference pill badge
    - This is configuration data (not fake) — the schools are real targets

Section C: NCAA Timeline (optional — keep if data from ncaa-rules.ts is real reference config)
  - Simplified horizontal bar showing upcoming key dates
  - Derived from ncaa-rules.ts (real NCAA calendar reference data, not fake)
```

**Step 2: Remove all hardcoded sparkline data**

The old page had `[3, 7, 5, 12, 9, 14, 18]` type arrays for sparklines. Remove these entirely — stat cards no longer have sparklines.

**Step 3: Handle loading + empty states**

- Loading: show skeleton cards (gray rounded rectangles matching card shape)
- No data: show "—" for numbers, empty state messages for activity feed

**Step 4: Commit**
```
feat: rewrite overview page with light theme and real data only
```

---

## Task 6: Coaches Page — School-Grouped Layout

**Files:**
- Rewrite: `src/app/dashboard/coaches/page.tsx`
- Rewrite: `src/components/dashboard/coach-table.tsx`
- Rewrite: `src/components/dashboard/coach-card.tsx`
- Modify: `src/components/dashboard/coach-detail.tsx`
- Delete: `src/components/dashboard/engagement-meter.tsx`

**What:**
Transform coaches from flat table to school-grouped editorial layout with real logos.

**Step 1: Rewrite coaches/page.tsx**

Keep: API fetch to `/api/coaches`, filter/sort state.
Remove: `useDashboardAssembly`, `AnimatedNumber` import, pipeline visualization bar with Cold/Warming/Hot (was styled for dark theme).

New layout:
- Page title: "Coaches" + count badge
- Filter bar: Tier dropdown, Conference dropdown, search input
- View toggle: List / Card (icon buttons)
- School-grouped list (default view): coaches grouped by school, sorted by tier

**Step 2: Rewrite coach-table.tsx as school-grouped list**

New structure — NOT a flat table. Group coaches by `schoolName`:
- School header row: logo (48px from `getSchoolLogo`) + school name (bold) + conference pill + division pill + coach count
- School header left border uses `getSchoolColors(id).primary`
- Coach rows below each school: name, title, X handle, engagement status text
- Engagement status derived from REAL data: check if coach has been followed (follow field), DM'd (dms API cross-reference), replied. Show text: "Followed", "DM Sent", "Replied", or "No Contact" with colored dot (green/amber/gray)

**Step 3: Rewrite coach-card.tsx for light theme**

Card: white bg, border, rounded-lg.
- School logo (40px) top-left
- School color left border stripe (4px)
- Coach name (bold), title (muted), school name
- Engagement status dot + label
- Hover: subtle shadow

**Step 4: Update coach-detail.tsx for light theme**

Remove: dark background colors, red accent colors, EngagementGauge SVG (was partially hardcoded), RelationshipTimeline (hardcoded 3-step)
Replace with: clean slide-over, school logo at top, coach info, real interaction history from API (if any), notes field. White/light styling throughout.

**Step 5: Delete engagement-meter.tsx**

This was a dark-themed horizontal bar from 0-100. Remove entirely — engagement is now shown as simple text labels from real data.

**Step 6: Commit**
```
feat: rewrite coaches page with school-grouped layout and real logos
```

---

## Task 7: Outreach Page — Clean Kanban

**Files:**
- Rewrite: `src/app/dashboard/outreach/page.tsx`
- Rewrite: `src/components/dashboard/dm-kanban.tsx`
- Modify: `src/components/dashboard/wave-progress.tsx`

**What:**
Remove all hardcoded stats. Light theme kanban.

**Step 1: Rewrite outreach/page.tsx**

Remove: hardcoded `183`, hardcoded stats (12 sent, 3 replied, 25%), hardcoded wave counts.
Keep: API fetches to `/api/dms` and `/api/coaches`.

Calculate from real data:
- Total coaches: `coaches.length`
- Sent: `dms.filter(d => d.status === 'sent').length`
- Replied: `dms.filter(d => d.status === 'replied').length`
- Rate: `replied / sent * 100` or "—" if sent is 0

New layout:
- Page title: "Outreach" + real coach count
- Stats row: computed from real DM data. If no DMs: "No messages sent yet. Draft your first DM to get started."
- Wave Progress: only render if there are DMs. Pass real computed counts.
- Kanban board: light theme

**Step 2: Rewrite dm-kanban.tsx for light theme**

- White column backgrounds, `border border-[#E5E7EB]`
- Column headers: clean labels with count badges
- Cards: white bg, border, school logo + coach name + message preview
- Remove: `ENGAGEMENT_PHRASES` (hardcoded), `SUGGESTED_ACTIONS` (hardcoded)
- Empty columns: "No messages" in muted text

**Step 3: Update wave-progress.tsx for light theme**

Keep: props-based interface (good — not hardcoded).
Change: colors from dark neon to light subtle. Progress bar on `#F5F5F4` track. Use school-neutral colors (navy, blue, amber, green for waves).

**Step 4: Commit**
```
feat: rewrite outreach page with real data calculations and light theme
```

---

## Task 8: Content Page — Light Calendar

**Files:**
- Modify: `src/app/dashboard/content/page.tsx`
- Delete: `src/components/dashboard/content-streak.tsx`

**What:**
Light theme content page. Remove hardcoded streak.

**Step 1: Update content/page.tsx**

Remove: `ContentStreak days={7}` (hardcoded), `useDashboardAssembly`.
Keep: API fetch to `/api/posts`, calendar grid, post composer, pillar chart.
Change: Calculate streak from real post dates. If no consecutive days, don't show streak UI.

Pillar targets (`PILLAR_TARGETS`) are configuration, not fake data — keep them.

Update all styling: dark bg → white bg, dark text → navy text, red accents → navy/neutral accents.

**Step 2: Delete content-streak.tsx**

The standalone streak component used hardcoded values. Remove it. If streak display is needed, compute inline from real post dates.

**Step 3: Commit**
```
feat: update content page to light theme, remove hardcoded streak
```

---

## Task 9: Analytics Page — Real Data Only

**Files:**
- Rewrite: `src/app/dashboard/analytics/page.tsx`
- Delete: `src/components/dashboard/radar-chart.tsx`
- Delete: `src/components/dashboard/heat-calendar.tsx`
- Delete: `src/components/dashboard/sparkline.tsx`
- Modify: `src/components/dashboard/pipeline-funnel.tsx`
- Modify: `src/components/dashboard/activity-feed.tsx`

**What:**
Strip all fake data. Remove components with no real data source.

**Step 1: Delete fake-data components**

Delete:
- `radar-chart.tsx` (100% hardcoded scores)
- `heat-calendar.tsx` (100% procedurally generated fake data)
- `sparkline.tsx` (only used with fake data arrays)

**Step 2: Rewrite analytics/page.tsx**

Remove: imports for RadarChart, HeatCalendar, Sparkline. Remove hardcoded fallback values (247, 4.8, 32, 156). Remove `sparkData()` seed function.

New layout:
- Page title: "Analytics"
- Pipeline Funnel (full width): real coach counts from API
  - Total → Followed → DM'd → Replied (from real data)
- Stat Cards (2x2 grid): same 4 metrics but show "—" for any without real data. No sparklines.
- Activity Feed (full width): from real API data

**Step 3: Update pipeline-funnel.tsx for light theme**

Keep: props interface (already prop-driven, good).
Change: dark colors → light. Funnel on white/light bg. Navy text. Colored fills for each stage.

**Step 4: Update activity-feed.tsx for light theme**

Keep: props interface (already prop-driven).
Change: dark backgrounds → white cards, dark text → navy, colored left borders kept but lighter.

**Step 5: Commit**
```
feat: rewrite analytics page with real data only, remove fake chart components
```

---

## Task 10: Team Page — Light Chat Interface

**Files:**
- Rewrite: `src/app/dashboard/team/page.tsx`

**What:**
Light theme team page. Remove hardcoded status strings.

**Step 1: Rewrite team/page.tsx**

Keep: `members` array (this is real agent config, not fake data), `MEMBER_COLORS`, `MEMBER_TAGS`, `MEMBER_PROMPTS` (configuration data). Keep: chat API call to `/api/rec/team/chat`.

Remove: `MEMBER_STATUS` hardcoded strings ("3 coaches need follow-up" etc — these are fake insights). Remove `useDashboardAssembly`.

New styling:
- White card backgrounds, border, rounded-lg
- Member cards: name (bold navy), role (secondary gray), specialty tags as pills
- No "status" or "latest insight" (was hardcoded)
- Chat area: white bg, light borders, navy text for user messages, gray bg for assistant messages
- Quick prompts as outlined pill buttons

**Step 2: Commit**
```
feat: rewrite team page with light theme, remove hardcoded status strings
```

---

## Task 11: Remove Dead Code + Unused Components

**Files:**
- Delete: `src/components/dashboard/readiness-score.tsx` (hardcoded score, removed from overview)
- Delete: `src/components/dashboard/signal-feed.tsx` (100% hardcoded fake signals)
- Delete: `src/components/dashboard/daily-brief.tsx` (hardcoded brief text)
- Delete: `src/components/dashboard/recruiting-timeline.tsx` (decide: keep if NCAA config data is useful, else remove)
- Delete: `src/components/dashboard/achievement-toast.tsx` (gamification, not in v6 design)
- Delete: `src/components/dashboard/streak-indicator.tsx` (gamification, not in v6 design)
- Delete: `src/components/dashboard/coach-level-badge.tsx` (gamification, not in v6 design)
- Clean: `src/lib/dashboard/gamification.ts` — keep if referenced elsewhere, else delete

**Step 1: Delete all listed files**

Verify no other files import them first. Search for imports of each component across the codebase.

**Step 2: Clean up any broken imports**

After deletion, run `npm run build` to catch any broken imports. Fix them.

**Step 3: Commit**
```
chore: remove unused dark-theme and gamification components
```

---

## Task 12: CLAUDE.md + Build Verification

**Files:**
- Modify: `CLAUDE.md`
- Run: `npm run build`

**Step 1: Add data integrity rule to CLAUDE.md**

Append to CLAUDE.md:
```markdown

## Data Integrity Rule

NO hardcoded fake data in any UI component. Every number, name, and stat displayed
must come from a real API response or database query. If no data exists, show an
empty state with a clear CTA. Never use placeholder values that could be mistaken
for real data. Configuration data (school targets, NCAA calendar, team roster,
pillar targets) is acceptable as these represent real strategic decisions, not fake metrics.
```

**Step 2: Run build**

```bash
npm run build
```

Must pass with zero errors. Fix any TypeScript or import errors.

**Step 3: Visual verification at key viewports**

Start dev server. Check at 1440px (desktop) and 375px (mobile):
- Overview: light bg, stat cards, activity feed, target schools
- Coaches: school-grouped list with logos
- Outreach: clean kanban with real data or empty states
- Content: light calendar
- Analytics: funnel + activity feed, no radar/heat
- Team: clean cards + chat

**Step 4: Commit + Push**
```
feat: add data integrity rule to CLAUDE.md, verify clean build
```

Then push all to GitHub for Vercel deployment.

---

## Verification Checklist

1. `npm run build` passes with zero errors
2. All pages render on light (#FAFAFA) background
3. School logos appear on coach cards and school headers
4. No hardcoded fake numbers visible anywhere
5. Empty states show for sections with no real data
6. Sidebar and mobile nav are white/light themed
7. No red accent colors (replaced with navy)
8. No film grain, no GSAP animations, no typewriter effects
9. Typography: Inter for text, JetBrains Mono for numbers
10. Mobile layout works at 375px with 44px+ touch targets
