# Alex Recruiting — Backend Connectivity, PWA & Full System Design

**Date:** 2026-03-16
**Status:** Approved
**Scope:** Full backend wiring, PWA + splash screen, content pipeline, agent team, self-learning system

---

## Context

The Stitch Coach UI redesign is complete (PR #1 merged). The app has 109 real API routes, 7 integration clients, 10 database tables, and AI engines for content, DMs, and coach ranking. The UI reskin disconnected many pages from their API endpoints. This design reconnects everything and adds new capabilities.

**Starting point:** Fresh X account (no existing content), all 47 API keys available, direct X API v2 integration (no Zapier intermediary for posting/DMs).

---

## 1. Agent Team Architecture

12 agents across 4 squads operating in Hybrid Command Center mode: advisory first, then parallel execution.

### Strategy Squad
- **Scout** — X/Twitter Specialist: posting strategy, coach engagement tracking, hashtag research, content timing
- **Nina** — Coach Outreach Specialist: DM campaigns, coach prioritization, follow-up sequences
- **Coach Marcus** — Recruiting Consultant: insider perspective on what coaches look for
- **Sophie** — Research Agent: X data scraping, coach directory scraping, competitor tracking

### Engineering Squad
- **Devin** — Lead Architect / Full Stack: coordinates all agents, resolves conflicts, system integration
- **Backend** — Backend Engineer: API route wiring, Supabase, cron jobs
- **Frontend** — Frontend Engineer: UI wiring, button handlers, responsive design, animations
- **Auto** — Automation Expert: scheduled posting, DM queues, cron triggers

### Content Squad
- **Trey** — Content Strategist: 30-day calendar planning, pillar balance, content mix
- **Writer** — Content Writer: post copy, DM templates, captions, hooks

### Intelligence Squad
- **AI Lead** — AI/Algorithm Expert: Claude prompts, scoring algorithms, self-learning loops
- **QA** — Verification Agent: smoke tests, user flow testing, cross-device validation

---

## 2. System Architecture

### Three Layers

```
PRESENTATION — Stitch Coach UI, PWA + splash screen, mobile-first responsive
INTELLIGENCE — Claude AI content/DM/ranking engines, coaching panel, self-learning
DATA         — Supabase + X API + Firecrawl + Exa + CFBD + Brave + Apify + YouTube + Calendar
```

### Backend Reconnection Map

| Page | Endpoints | Status |
|------|-----------|--------|
| Dashboard | /api/analytics, /api/coaches, /api/posts, /api/dms | Reconnect |
| Coaches | /api/coaches | Reconnect + detail slide-over |
| Outreach | /api/dms, /api/coaches | Reconnect Kanban + status updates |
| DMs | /api/coaches, /api/dms, POST /api/dms | Reconnect send flow + multi-touch |
| Analytics | /api/analytics | Reconnect charts + engagement |
| Agency | POST /api/rec/team/chat (SSE) | Reconnect 7 personas |
| Content Queue | /api/posts, /api/content/generate-month | Wire content pipeline |
| Intelligence | POST /api/intelligence/* | Reconnect 3 analysis endpoints |
| Media | /api/photos | Reconnect grid + upload |
| X Growth | /api/growth/analytics | Reconnect charts |
| Captions/Hooks/Comments/Viral | Hardcoded libraries | Keep as-is (strategic reference) |

### Content Pipeline

Research Agent scrapes coach X → AI Lead analyzes performance → Trey plans 30-day calendar (17 posts/month, 4/week) → Writer generates copy → Jacob approves in Content Queue → Scheduled posting via X API (Tue-Fri 9-10 AM CT) → Sophie tracks engagement → feeds back to AI Lead.

**Content mix:** 40% film clips, 25% training, 20% accomplishments, 15% engagement.

### DM Outreach Pipeline

Sophie researches targets (Firecrawl + Exa + CFBD) → Coach Marcus ranks by fit → Nina generates 4-touch DM sequence → Jacob approves each DM → X API sends (max 5-10/day) → System tracks delivery/response.

**4-touch sequence:**
1. Introduction + Hudl link (Day 0)
2. Specific school reference + accomplishment (Day 7)
3. Camp/visit interest (Day 14)
4. Film update or new achievement (Day 30)

**NCAA compliance:** D2/D3/NAIA coaches → immediate two-way. DI coaches → one-way until June 15, 2027.

### Coaching Panel

AI-powered advisory panel on Agency page:
- Coach Marcus: recruiting strategy perspective
- Nina: outreach tactics with real engagement data
- Scout: X strategy with content performance analytics
- AI Lead: data-driven recommendations with engagement correlations

### Self-Learning Loop

Post content → track engagement → AI correlates content types/times/hashtags with coach engagement → adjusts recommendations → stored in `learning_signals` Supabase table → next cycle incorporates learnings.

---

## 3. PWA + Splash Screen

### Splash Screen
- Full-screen dark overlay with shield crest emblem
- "JACOB'S COMMAND" title with scanline animation
- System boot sequence aesthetic (2s on cold start, fade to dashboard)
- Doubles as PWA launch screen on mobile

### PWA Enhancements
- Enhanced service worker (stale-while-revalidate for API, cache-first for assets)
- Apple splash screen images for all iOS device sizes
- Push notification support for coach engagement alerts
- Offline mode with cached dashboard and "UPLINK OFFLINE" indicator

---

## 4. Imagery & Animation

### Hero Images (generated, saved to public/images/)

| Screen | Image | Usage |
|--------|-------|-------|
| Splash | Shield crest + scanline boot | Full-screen PWA launch |
| Command | Tactical stadium with red HUD | Hero banner, 10% opacity bg |
| Outreach | US network constellation map | Hero banner, pulsing nodes |
| Analytics | Holographic 3D data viz | Hero banner, parallax scroll |
| Agency | War room with holographic displays | Hero banner behind team roster |

### Animation System (Framer Motion + CSS)

- Splash: scale 0→1 crest with glow pulse, scanline sweep
- Hero images: Ken Burns slow zoom (1.0→1.05 over 20s)
- Stat cards: staggered fade-up (50ms delay per card)
- Glass cards: parallax tilt on hover (±2deg)
- Numbers: count-up animation from 0 to value
- Navigation: crossfade 200ms
- Scanline overlay: continuous vertical sweep (8s loop)
- LIVE dot: pulse scale 1→1.3 (1s loop)
- DM send: ripple + checkmark morph

---

## 5. Phased Implementation

### Phase 1: Foundation (Days 1-2)
- Configure all env vars, verify Supabase
- Build splash screen with boot animation
- PWA upgrade (Apple splash, service worker, offline)
- Integrate hero imagery with Ken Burns animation
- Animation system (Framer Motion transitions, staggered reveals, count-ups)
- Dashboard wiring (all 4 endpoints)
- **Verify:** PWA installs, splash plays, dashboard shows live data, 60fps animations

### Phase 2: Core Flows (Days 3-5)
- Coaches page wiring (search, filter, detail slide-over)
- Coach scraping (Firecrawl + Exa + CFBD → populate DB)
- Outreach Kanban (DM status board, drag-drop, compose)
- DM pipeline (4-touch sequence, personalization, human approval)
- DM sending via X API (rate limited 5-10/day)
- Agency chat (SSE streaming, 7 personas, live data context)
- Coaching panel (enhanced prompts + live data)
- Analytics wiring (charts, engagement tracking, funnel)
- **Verify:** Coach search → DM compose → approve → send → track. Agency chat returns live recommendations.

### Phase 3: Content Engine (Days 6-8)
- X account setup (handle, API creds, bio/banner)
- 30-day content calendar generation (17 posts)
- Content queue UI (calendar view, edit/approve workflow)
- Post to X (X API v2 tweet creation with media)
- Scheduled posting (cron Tue-Fri 9-10 AM CT)
- Media pipeline (upload, import, optimization)
- X engagement tracking (follower detection, like scanning every 15 min)
- Content analytics → self-learning loop
- **Verify:** Generate month → approve post → publishes to X → engagement tracked.

### Phase 4: Intelligence + Research (Days 9-11)
- Coach X scraping, school research
- Competitor tracking (Class of 2029 OL prospects)
- Intelligence dashboard (3 analysis endpoints, multi-tab)
- Coach behavior analysis (predict response likelihood)
- Media Lab competitors feature
- Self-learning table + feedback loop
- MCP server integration (Brave, Apify, Jina)
- **Verify:** Intelligence shows real analysis, competitors tracked, learning loop active.

### Phase 5: Polish + Testing (Days 12-14)
- Responsive audit (iPhone SE, 15 Pro, iPad, desktop)
- Button audit (every button verified functional)
- Animation polish (60fps all devices)
- Offline mode, error states
- CLAUDE.md update
- E2E Playwright test suite
- Lighthouse > 90, security review

### Verification Matrix

| Flow | Test |
|------|------|
| Coaches receive outreach | Scraped → ranked → DM composed → approved → sent → confirmed |
| Posting on X works | Generated → approved → scheduled → published → engagement tracked |
| DMs sent to followers | Follower analysis → identify targets → generate DM → approve → send |
| Competitors in Media Lab | Profiles scraped → displayed → film comparison available |
| PWA installation | Install iPhone + desktop → splash plays → offline works |
| Coaching panel accuracy | Ask Nina → response includes real data + NCAA context |
| Self-learning active | Post → engagement tracked → next month recommendations shift |

---

## 6. Key Research Findings (from deep research agents)

### X API v2
- Basic tier ($100/mo) minimum viable: 3K posts/month, 10K reads
- DM limit: 15/15-min, 1,440/day — sufficient for single athlete
- Post limit: 100/user/15-min — no concern at 4 posts/week
- Private likes (2024) make some coach engagement invisible
- Optimal posting: Tue-Fri 9-10 AM local time

### NCAA Compliance (Class of 2029)
- Jacob CAN DM coaches now (athlete-initiated is unrestricted)
- DI coaches cannot respond until June 15, 2027
- D2/D3/NAIA/JUCO coaches can respond anytime
- Coaches can like/repost but cannot publicly comment (tap-don't-type)
- Build compliance rules as configurable parameters, not hardcoded

### Content Strategy
- Film clips (15-30s technique) are highest coaching value
- 4 posts/week optimal cadence
- 2-3 hashtags max per post (#Recruiting, #Classof2029, #OLine)
- AI-generated content must be personalized — coaches recognize generic templates

### Recruiting Automation
- 4-email/DM sequence outperforms single send (2x reply rate)
- Human-in-the-loop before send is the safe compliance pattern
- Coaching staff data decays every 3-6 months — automated refresh required
- No film manipulation — coaches detect and disqualify AI-edited highlights
