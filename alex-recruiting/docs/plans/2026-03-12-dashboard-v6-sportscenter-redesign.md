# Dashboard v6 — SportsCenter Command Center Redesign

> **Date**: 2026-03-12
> **Status**: Approved
> **Approach**: Light-themed, Apple HIG + ESPN/SI sports media aesthetic

## Context

The v5 dark-themed dashboard ("horrible" per user feedback) is being replaced with a professional light-themed design. The new design draws from Apple HIG's clean surfaces, ESPN/SportsCenter's sports media typography, and Sports Illustrated's editorial imagery. School logos and identity are prominent throughout. Zero fake data — every metric comes from a real API or shows an empty state.

## Design Language

### Color System (Light Theme)

| Token | Value | Usage |
|-------|-------|-------|
| `bg-page` | `#FAFAFA` | Page background |
| `bg-card` | `#FFFFFF` | Card surfaces |
| `bg-sidebar` | `#FFFFFF` | Sidebar background |
| `bg-subtle` | `#F5F5F4` | Subtle panels, hover states |
| `text-primary` | `#0F1720` | Headlines, primary text (navy) |
| `text-secondary` | `#6B7280` | Secondary labels |
| `text-muted` | `#9CA3AF` | Muted, timestamps |
| `border` | `#E5E7EB` | Standard borders |
| `border-strong` | `#D1D5DB` | Emphasized borders |
| `success` | `#16A34A` | Positive indicators |
| `danger` | `#DC2626` | Urgent/negative |
| `warning` | `#F59E0B` | Caution |
| `info` | `#2563EB` | Informational |

School-contextual accent colors derived from `schoolColors` map — each coach card/row uses its school's primary color as a left border stripe.

### Typography

- **Headlines**: Inter 700/800, navy (`#0F1720`)
- **Body**: Inter 400/500
- **Numbers/Data**: JetBrains Mono 500 (scoreboard feel)
- **Scale**: 11px labels → 14px body → 18px section → 24px page title → 36px hero stats

### Card Style

- White background, 1px `#E5E7EB` border, `border-radius: 8px`
- Hover: `box-shadow: 0 2px 8px rgba(0,0,0,0.06)`
- No gradients, no grain, no glow — clean Apple surfaces
- School logo + color stripe on left edge of coach cards

### Motion

- CSS transitions only: `transition: all 150ms ease-out`
- `AnimatedNumber` countup via CSS/requestAnimationFrame (no GSAP)
- No film grain, no typewriter, no scroll-triggered animations
- Simple opacity fade on route navigation

### Empty States

- Clean icon + gray text describing what's missing
- Primary CTA button below (e.g., "Draft your first DM")
- Never show fake placeholder numbers — use "—" or empty state

## Shell — Sidebar + Layout

### Sidebar (280px, fixed left)

- **Background**: White with right border `#E5E7EB`
- **Header**: "Jacob Rodgers" bold + "Class of 2029 · OL · Pewaukee HS" muted
- **Nav items**: 16px icon + clean label (no uppercase, no letter-spacing). Active: navy text, bold, 3px left navy border. Inactive: `#6B7280`
- **Status dots**: Only shown when real data drives them (API-sourced counts)
- **Footer**: "View Recruit Site →" muted link
- **Items**: Overview, Coaches, Outreach, Content, Analytics, Team

### Mobile Nav (Bottom)

- White background, top border `#E5E7EB`
- 5 icon tabs, 44px+ touch targets
- Active: navy icon + label. Inactive: gray icon only

### Layout

- Content area: `max-w-7xl`, `px-6 md:px-8`
- Sidebar offset: `md:ml-[280px]`
- Page titles: Inter 700, 24px, navy
- No film grain overlay

## Page Designs

### Overview (Dashboard Home)

**A. Stat Cards Row (4 cards, horizontal)**
Each: white card, gray label, big JetBrains Mono number, change indicator only if real data exists.
1. Coaches Tracked — from `/api/coaches` count
2. DMs Sent — from `/api/dms` count
3. Posts This Week — from `/api/posts` (current week filter)
4. Profile Views — from analytics API or "—"

**B. Two-Column Layout**
- Left (2/3): Recent Activity feed from real API data. Each row: timestamp, description, school logo if coach-related. Empty state if no activity.
- Right (1/3): Target Schools card — 17 schools grouped by tier, each with logo (32px) + name + conference pill + tier label.

**C. NCAA Timeline**
Horizontal bar from `ncaa-rules.ts` (reference config, not fake data). Current position marker, key upcoming dates with countdowns.

### Coaches Page

**School-grouped layout** (SI/ESPN editorial feel):
- School header: logo (48px) + name + conference pill + division pill + coach count
- Coach rows: name, title, X handle, engagement status from real API ("Followed", "DM Sent", "No Contact"), last action date
- Engagement: colored dot — green (replied), amber (sent), gray (no contact)

**Card View toggle**: Grid cards with school logo prominent, coach name, engagement dot, school color left border.

**Coach Detail slide-over (520px)**: School logo at top, coach info, real interaction history from API, quick actions, notes field. Empty state if no interactions.

### Outreach Page

**Header stats**: Calculated from real `/api/dms` data only. If no DMs: "No messages sent yet."

**Wave Progress**: Only shown if real DMs exist in pipeline.

**Kanban**: Queued → Sent → Replied → No Response. Cards show coach name, school logo, message preview, date. Empty columns show "No messages in this stage."

**DM Composer**: Clean modal, coach selector from real list, character count (280), template selector from `cold-dms.ts`.

### Content Page

- Calendar from real `/api/posts`. Click day to compose.
- Pillar balance from real post categorization.
- Streak calculated from real post dates only.

### Analytics Page

**Keep (real data):**
- Pipeline Funnel: Total coaches → Followed → DM'd → Replied (all from API, show 0 if 0)
- Activity Feed (prop-driven from API)
- Stat cards showing "—" for missing data

**Remove (fake data):**
- Radar chart (hardcoded scores)
- Heat calendar (procedurally generated)
- Sparklines with fake data
- Hardcoded fallback values (247 views, 4.8% engagement, etc.)

### Team Page

- 7 REC agents: real AI agent roster (configuration, not fake)
- Clean cards: name, role, specialty
- Chat interface (real Claude API calls)
- No hardcoded "latest insight" strings

## School Logos

Local SVGs in `/public/logos/`:
```
wisconsin.svg, northwestern.svg, iowa.svg, iowa-state.svg,
northern-illinois.svg, western-michigan.svg, ball-state.svg,
central-michigan.svg, south-dakota-state.svg, north-dakota-state.svg,
illinois-state.svg, youngstown-state.svg, saginaw-valley.svg,
michigan-tech.svg, ferris-state.svg, winona-state.svg,
minnesota-state-mankato.svg
```

School colors map in data layer:
```ts
export const schoolColors: Record<string, { primary: string; secondary: string }> = {
  wisconsin: { primary: "#C5050C", secondary: "#FFFFFF" },
  northwestern: { primary: "#4E2A84", secondary: "#FFFFFF" },
  iowa: { primary: "#FFCD00", secondary: "#000000" },
  // ... etc
};
```

Used for: left border stripe on coach cards, school header accent, conference badge backgrounds.

## Fake Data Removal

| File | Action |
|------|--------|
| `signal-feed.tsx` | Remove hardcoded signals. Fetch real activity or show empty state. |
| `radar-chart.tsx` | Remove component entirely (no real data source) |
| `heat-calendar.tsx` | Remove component entirely (no real data source) |
| `daily-brief.tsx` | Remove hardcoded text. Show real date only. |
| `outreach/page.tsx:80-105` | Calculate stats from real DM data |
| `analytics/page.tsx:130-165` | Show "—" instead of hardcoded fallbacks |

## CLAUDE.md Addition

```
## Data Integrity Rule
NO hardcoded fake data. Every number, name, and stat displayed must come from
a real API response or database query. If no data exists, show an empty state
with a CTA. Never use placeholder values that could be mistaken for real data.
```
