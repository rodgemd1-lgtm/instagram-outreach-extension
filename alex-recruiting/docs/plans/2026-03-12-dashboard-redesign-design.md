# Alex Recruiting Dashboard Redesign — Design Document

**Date**: 2026-03-12
**Approach**: Unified Command Center (Approach A)
**Primary User**: Mike (parent managing Jacob's recruiting)
**Scope**: All 6 modules — Overview, Coach CRM, Outreach, Content, Analytics, Team

---

## Design Philosophy

Match Jacob's recruiting website: cinematic, dark, professional — the dashboard is the back-office of the same product. Same visual DNA, same level of craft. Every screen should feel like it belongs in the same world as the `/recruit` page.

**Design resources to use:**
- `ui-ux-pro-max-skill` — 7 skills: color theory (161 palettes), typography (57 font pairings), layout, component design, visual hierarchy, responsive design, dark mode
- `designer-skills` — 63 skills across 8 categories: accessibility, animations, color, components, layout, responsive, typography, visual
- `21st.dev` — React/Tailwind component reference for shadcn/ui patterns
- `frontend-design` skill — anti-patterns (no Inter/Roboto, no purple gradients), distinctive typography, production-grade quality

## Visual Identity (Extracted from /recruit)

### Color System
| Token | Value | Usage |
|-------|-------|-------|
| `--dash-bg` | `#000000` | Page background |
| `--dash-surface` | `#0A0A0A` | Card backgrounds |
| `--dash-surface-raised` | `#111111` | Elevated panels, hovers |
| `--dash-border` | `#1A1A1A` | Card borders |
| `--dash-accent` | `#ff000c` | Primary actions, active states, CTAs |
| `--dash-accent-hover` | `#cc000a` | Hover on accent |
| `--dash-text` | `#FFFFFF` | Primary text |
| `--dash-text-secondary` | `#999999` | Secondary text |
| `--dash-muted` | `#666666` | Tertiary text, labels |
| `--dash-success` | `#22C55E` | Positive indicators |
| `--dash-warning` | `#F59E0B` | Warning states |
| `--dash-danger` | `#EF4444` | Error/urgent states |
| `--dash-gold` | `#D4A853` | Premium/achievement accents |

### Typography
- **Display/Headers**: Bold uppercase, tracking-tight, responsive `clamp()` sizing
- **Nav items**: `text-xs tracking-widest uppercase` (from recruit nav)
- **Body**: System sans-serif (Geist Sans)
- **Stats/Numbers**: `font-jetbrains` monospace for data precision
- **Kickers/Labels**: `text-[10px] uppercase tracking-[0.2em]` red accent

### Motion Language
- Fade-in on page load (`animate-fade-in`)
- Subtle hover transitions (`transition-all duration-300`)
- No gratuitous animation — every motion serves information hierarchy
- Backdrop blur on overlays (`backdrop-blur-xl`)

### Component Patterns (from recruit site)
- **Borders**: `border-white/5` subtle dividers
- **Cards**: `rounded-xl` with `border-dash-border bg-dash-surface`
- **Active states**: Red left border + red text + subtle red bg (`bg-[#ff000c]/10`)
- **Scroll cue motif**: Vertical red bar as visual accent
- **Film grain texture**: Reserved for hero/cinematic moments only

---

## Shell Architecture

### Layout
- Fixed sidebar (256px, hidden on mobile)
- Mobile: bottom nav bar with icons
- Main content: `md:ml-64`, max-width 7xl, responsive padding
- Top area: page title + date + contextual actions

### Sidebar
- Header: "79" badge (red), "JACOB RODGERS", class/position
- 6 nav items: Overview, Coaches, Outreach, Content, Analytics, Team
- Active: red left border + red text
- Footer: "View Recruit Site" link with red bar motif

### Routes (consolidated)
| Route | Module | Replaces |
|-------|--------|----------|
| `/dashboard` | Overview | scattered homepage |
| `/dashboard/coaches` | Coach CRM | `/coaches`, `/manage`, `/intelligence` |
| `/dashboard/outreach` | DM Pipeline | `/dashboard/outreach` (keep) |
| `/dashboard/content` | Content Engine | `/dashboard/calendar`, `/posts`, `/create` |
| `/dashboard/analytics` | Analytics | `/dashboard/analytics`, `/audit`, `/competitors` |
| `/dashboard/team` | REC Team | `/agency`, `/agency/[member]`, `/agency/leads` |

---

## Module Designs

### 1. Overview (`/dashboard`)
**Purpose**: Single-screen status — what needs attention right now

**Layout**:
- Date + "COMMAND CENTER" header
- 4 stat cards in a row: Profile Views, Coaches in DB, DMs Sent, Posts This Week
- Two-column: Action Items (priority-sorted) + Upcoming Events
- Quick links grid: Recruit Site, Post Queue, REC Team, Coach Pipeline

**Data**: Real Supabase queries via existing API routes. Fallback to zeros gracefully.

### 2. Coach CRM (`/dashboard/coaches`)
**Purpose**: Track every coach relationship from discovery to contact

**Layout**:
- Header with filter bar (tier, division, status, search)
- Sortable table: Name, School, Division, Tier, Follow Status, DM Status, Last Engaged
- Click row to open detail slide-over panel
- Detail panel: coach info, engagement history, DM shortcut, notes

**Key features**:
- Tier badges (T1/T2/T3) with color coding
- Status pills: follow status + DM status
- "Stale" indicator for coaches not engaged in 14+ days
- One-click "Draft DM" from coach detail
- Bulk actions: update tier, mark status

**Data**: `coaches` table, `engagementLog` table

### 3. DM Outreach (`/dashboard/outreach`)
**Purpose**: Draft, approve, send, and track coach DMs

**Layout**:
- Kanban board: Drafted → Approved → Sent → Responded
- Cards show coach name, school, message preview, timestamp
- Click card to expand full message
- DM composer modal: select coach, choose template, customize, preview

**Key features**:
- Wave strategy indicators (Wave 0/1/2/3)
- Template picker with live variable substitution
- Response tracking with coach reply content
- "No response" follow-up suggestions after 7 days

**Data**: `dmMessages` table, `coaches` table for lookups

### 4. Content Engine (`/dashboard/content`)
**Purpose**: Plan, create, schedule, and track X/Twitter content

**Layout**:
- Month calendar view (default) with day cells showing scheduled posts
- Post composer panel (slide-over or modal)
- Pillar distribution bar: Performance 40% / Work Ethic 40% / Character 20%
- Weekly view toggle for detailed scheduling

**Key features**:
- Drag posts between calendar days
- Color-coded by pillar (red = performance, gold = work ethic, white = character)
- Post composer: text, media URL, pillar, hashtag suggestions, schedule time
- Draft → Scheduled → Posted status flow
- Pillar balance warning if distribution is off

**Data**: `posts` table, weekly calendar data

### 5. Analytics (`/dashboard/analytics`)
**Purpose**: Track recruiting progress and identify what's working

**Layout**:
- Top row: key metrics with sparkline trends
- Pipeline funnel: Total Coaches → DM Sent → Replied → Mutual Follow
- Content performance chart: engagement by pillar
- Profile audit score (0-10) with breakdown
- Competitor tracking table (Class of 2029 OL)

**Key features**:
- Date range selector
- Funnel visualization with conversion rates
- Audit score breakdown: photo, bio, post cadence, pillar mix, engagement
- Competitor comparison cards

**Data**: `analyticsSnapshots`, `competitorRecruits`, `profileAudits`

### 6. REC Team (`/dashboard/team`)
**Purpose**: Chat with AI team members, manage tasks, track leads

**Layout**:
- Team member grid (7 cards) with role + status
- Chat interface when member is selected (SSE streaming)
- Task queue sidebar: assigned tasks by member
- NCSA leads tab: kanban pipeline

**Key features**:
- Click team member to open chat
- Real-time streaming responses
- Task creation with member assignment
- Lead pipeline: Sourced → Contacted → Responded → Interested → Offered
- Quick commands: "@nina who viewed Jacob's profile", "@trey draft 3 posts"

**Data**: REC team chat API (SSE), file-backed tasks/leads stores

---

## Data Layer

All modules read/write to Supabase via existing Drizzle schema. API routes already exist for all core operations. Key work needed:

1. **Seed database** with 200+ target schools from `target-schools.ts`
2. **Seed coaches** from school roster data
3. **Wire real queries** in each API route (some currently return mock data)
4. **Add missing API routes** for any gaps (e.g., analytics date ranges)

---

## Quality Standards

- Every component follows `frontend-design` skill anti-patterns
- Accessibility: WCAG 2.1 AA minimum, keyboard navigable, screen reader labels
- Responsive: works on mobile (375px) through desktop (1440px+)
- Performance: sub-2s FCP, no layout shift
- Dark mode only (matches recruit site)
- No unused dependencies, no over-engineering
