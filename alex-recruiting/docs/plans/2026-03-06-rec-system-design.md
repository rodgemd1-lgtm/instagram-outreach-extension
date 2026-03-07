# REC System Design — Recruiting Excellence Center

**Date:** 2026-03-06
**Status:** Approved
**Author:** Devin (Technical Director)

---

## Overview

Transform Alex Recruiting from a single-tool X/Twitter posting app into a full-service virtual recruiting agency for Jacob Rodgers (Class of 2029, OL, Pewaukee HS). The REC system provides a 7-person virtual team, each a specialized Claude persona with dedicated knowledge bases, operating through both chat interaction and a task dashboard.

## Critical Success Factors

| Priority | Factor | Description |
|----------|--------|-------------|
| 1 | Film Visibility | 74 videos exist but none posted. Coaches evaluate film first. |
| 2 | Coach Targeting & Outreach | Personalized outreach converts 2x. 23 schools defined, 0 messages sent. |
| 3 | X/Twitter Presence | Primary coach channel. No posts, no header, no activity. |
| 4 | NCSA Lead Pipeline | Paid tier active, coaches viewing, but no lead capture. |
| 5 | Content Cadence | 1-2 training clips/week min. Tue-Thu mornings. |
| 6 | Network Effects | Strategic follows create visibility loops. |
| 7 | Response Discipline | Camp invites and coach signals need fast follow-up. |

## The Virtual Team

### DEVIN — Technical Director & Orchestrator
- **Role**: Coordinates the entire operation. Builds features, manages data pipelines, assigns work, reviews outputs.
- **Personality**: Direct, efficient, technical.
- **Owns**: Architecture, code, integrations, data enrichment, team coordination.

### MARCUS COLE — Head of Recruiting Strategy
- **Background**: Former D1 recruiting coordinator, 15 years placing OL at Power 5 and FCS programs.
- **Owns**: School targeting, tier assignments, recruiting calendar, milestone tracking, NCAA rule compliance.
- **Knowledge base**: NCAA recruiting calendars, contact rules, dead periods, school roster needs, conference landscapes, recruiting timeline for Class of 2029.

### NINA BANKS — Coach Intelligence & Outreach Director
- **Background**: Former college admissions counselor turned recruiting consultant.
- **Owns**: Coach database enrichment, DM campaigns, follow strategy, camp invite responses, NCSA lead pipeline, profile view follow-up.
- **Knowledge base**: Coach behavior profiles, X handle database, DM templates, outreach sequences, response tracking, NCSA data.

### TREY JACKSON — Content Strategist & X Manager
- **Background**: Social media director for a top-25 college football program.
- **Owns**: Content calendar, post drafting, hashtag strategy, profile optimization (bio, header, pinned post), engagement tracking.
- **Knowledge base**: Recruiting content best practices, pillar system, constitution rules, posting windows, hashtag stack.

### JORDAN REEVES — Film & Media Producer
- **Background**: Hudl certified film analyst, produces recruiting highlight packages for D1 prospects.
- **Owns**: Video library curation, clip optimization for X, highlight reel assembly, training clip selection, AI-enhanced graphics.
- **Knowledge base**: OL film evaluation criteria (combo blocks, trap blocks, pull blocks, pass protection), Hudl standards, X video specs (720p, 2:20 max, 15MB).

### SOPHIE CHEN — Analytics & Intelligence Lead
- **Background**: Data scientist who built recruiting analytics tools for a major scouting service.
- **Owns**: Intelligence dashboard, scoring engine, competitor analysis, engagement metrics, follower growth tracking.
- **Knowledge base**: Scoring algorithms, coach behavior models, tweet pattern detection, school fit calculations, NCSA analytics.

### CASEY WARD — Network Growth & Community Manager
- **Background**: Growth marketing specialist who managed social presence for 50+ college athletes.
- **Owns**: Follow/unfollow strategy, recruit peer connections, coach follow campaigns, engagement strategy, comment templates.
- **Knowledge base**: Network effect patterns, similar recruit databases, conference-specific engagement tactics.

## System Architecture

### File Structure

```
src/lib/rec/
  team/
    devin.ts          -- Orchestrator config, team registry, persona loader
    marcus.ts         -- Marcus persona + recruiting strategy KB
    nina.ts           -- Nina persona + outreach/NCSA KB
    trey.ts           -- Trey persona + content strategy KB
    jordan.ts         -- Jordan persona + film/media KB
    sophie.ts         -- Sophie persona + analytics KB
    casey.ts          -- Casey persona + network growth KB
  knowledge/
    ncaa-rules.ts     -- Recruiting calendar, contact rules, dead periods
    coach-database.ts -- Enriched coach profiles (scraped + manual)
    ncsa-leads.ts     -- Profile viewers, camp invites, interest signals
    school-needs.ts   -- Roster gaps, graduating seniors, position needs
    competitor-intel.ts -- Similar recruits, activity, offers
    content-library.ts -- Video inventory categorized by type
    x-playbook.ts     -- Best practices, posting rules, engagement tactics
```

### Interaction Model

**Chat Mode**: Address team members by name or use `/team`. Their persona loads with full knowledge context.
- "Nina, who viewed Jacob's NCSA profile this week?"
- "Trey, draft 3 posts for Tuesday using training clips"
- "Marcus, are we in a dead period right now?"
- "Jordan, pick the best 5 clips for a highlight reel"

**Dashboard Mode** (`/agency` page): Team member cards showing active tasks, pending approvals, recent outputs. Assign tasks from the UI that get queued for execution.

### Data Enrichment Pipelines

| Pipeline | Frequency | Source | Destination |
|----------|-----------|--------|-------------|
| NCSA Scrape | Weekly (manual login) | NCSA dashboard | Nina's lead pipeline (ncsa-leads.ts) |
| Coach Enrichment | Daily (agent) | X API + web scrape | Coach database (coach-database.ts) |
| School Roster Scrape | Weekly (Firecrawl) | School roster pages | School needs (school-needs.ts) |
| Competitor Tracking | Daily (agent) | X API tweet patterns | Competitor intel (competitor-intel.ts) |
| Content Inventory | On-demand | Local video scan | Content library (content-library.ts) |

### NCSA Integration (Manual + Scraping Hybrid)

1. User logs into NCSA in Chrome browser
2. App provides a scrape endpoint that reads the NCSA dashboard
3. Captured data: profile viewers (coach name, school, conference, view date), camp invites (school, date, details), coach messages
4. Data flows into `ncsa-leads.ts` knowledge base
5. Nina automatically drafts outreach for each lead: find coach X handle → follow → draft DM → queue for approval

### Content Strategy

- AI-enhanced real content only (no fabricated imagery)
- Use Jacob's 74 videos: select, clip, optimize, caption
- Generate graphics/overlays for stats, measurables, milestones
- AI writes captions, bios, DMs — human approves everything
- Pillar mix: 40% performance, 40% work ethic, 20% character

### Execution Flow

```
Lead enters (NCSA view, camp invite, or manual) →
  Nina identifies coach, finds X handle, drafts outreach →
  Trey creates supporting post with relevant content →
  Jordan selects/optimizes video clip →
  Casey identifies follow targets in that program's network →
  Marcus validates timing against NCAA rules →
  Sophie tracks metrics and adjusts strategy →
  Devin coordinates, you approve
```

## Database Changes

### New Tables

- `rec_team_tasks`: Task assignments per team member with status, priority, due date
- `ncsa_leads`: Profile viewers, camp invites, coach interest signals from NCSA
- `ncsa_scrape_sessions`: Track when scrapes happened and what was captured
- `network_targets`: Strategic follow targets (coaches, recruits, programs)
- `content_calendar_entries`: Planned posts with assigned team member, media, and status

### Modified Tables

- `coaches`: Add fields for NCSA source, last NCSA activity, outreach sequence stage
- `videoAssets`: Already extended (Phase 1 video pipeline)

## API Routes

- `POST /api/rec/team/chat` — Chat with a team member persona
- `GET /api/rec/team/status` — Get all team members and their current workload
- `POST /api/rec/ncsa/scrape` — Trigger NCSA dashboard scrape
- `GET /api/rec/ncsa/leads` — Get NCSA lead pipeline
- `POST /api/rec/tasks` — Create/assign tasks to team members
- `GET /api/rec/tasks` — List tasks by team member or status
- `PUT /api/rec/tasks/[id]` — Update task status (approve, complete, reject)

## UI Pages

- `/agency` — Team dashboard with member cards, task queue, recent activity
- `/agency/[member]` — Individual member chat + their task history
- `/agency/leads` — NCSA lead pipeline with outreach status

## CLAUDE.md Update

Update CLAUDE.md to establish Devin as the system identity and reference the full team. This lets every Claude session know the team structure and how to activate personas.

## Success Metrics

- **Week 1**: Team personas active, NCSA first scrape, 5 posts drafted
- **Week 2**: 10+ coaches followed, first DMs sent to Tier 3, daily posting cadence started
- **Week 4**: NCSA leads processed, all 23 target schools' coaches in database, header image live, 20+ posts published
- **Week 8**: Coach follow-backs tracked, engagement rate measured, competitor analysis complete, content calendar running autonomously
