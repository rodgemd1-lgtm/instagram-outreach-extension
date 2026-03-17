# Alex Recruiting

AI-powered college recruiting intelligence platform for Jacob Rodgers — Class of 2029 Offensive Lineman, Pewaukee HS, Wisconsin.

## Tech Stack

- **Framework**: Next.js 14 (App Router) + React 18 + TypeScript
- **Database**: Supabase (PostgreSQL) via Drizzle ORM
- **AI**: Anthropic Claude SDK (`@anthropic-ai/sdk`)
- **UI**: Tailwind CSS + Radix UI (shadcn/ui components)
- **Testing**: Vitest + Testing Library + Playwright
- **Scraping**: Firecrawl, Exa, Brave Search, Jina
- **Integrations**: X/Twitter API, Airtable, Zapier, Hudl

## Project Structure

```
src/
  app/              # Next.js App Router pages + API routes
    api/            # API endpoints (alex, coaches, posts, dms, intelligence, scrape)
  components/       # React components (shadcn/ui in components/ui/)
  lib/
    alex/           # AI agent logic (system prompt, content engine, DM engine, coach ranker)
    data/           # Static data (templates, schools, hooks, captions, etc.)
    db/             # Drizzle schema + connection (schema.ts, index.ts)
    integrations/   # External API clients (anthropic, firecrawl, exa, x-api, airtable, zapier)
    intelligence/   # Recruiting intelligence (scoring engine, coach behavior, tweet patterns, hudl)
    supabase/       # Supabase client/server helpers
    types.ts        # Shared TypeScript types
  __tests__/        # Test suites (smoke, unit, integration, qa, e2e)
supabase/           # Supabase migrations
```

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
npm test             # Run all tests
npm run test:smoke   # Smoke tests only
npm run test:unit    # Unit tests only
npm run test:integration  # Integration tests
npm run test:e2e     # End-to-end tests
```

## Key Conventions

- **Path alias**: `@/` maps to `./src/` (configured in tsconfig.json)
- **Database**: Drizzle ORM with PostgreSQL. Schema in `src/lib/db/schema.ts`. Config in `drizzle.config.ts`.
- **UI components**: Use shadcn/ui patterns from `src/components/ui/`. Radix primitives for dialogs, selects, tabs.
- **API routes**: Next.js route handlers in `src/app/api/`. Return JSON responses.
- **Styling**: Tailwind CSS utility classes. Light theme with Apple HIG aesthetic. Dashboard uses `dash-*` design tokens.
- **Layout**: Desktop sidebar (280px) + mobile bottom nav. Main content offset `md:ml-[280px]`.

## Environment Variables

See `.env.example`. Key vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ANTHROPIC_API_KEY`, `X_API_BEARER_TOKEN`, `EXA_API_KEY`, `FIRECRAWL_API_KEY`, `BRAVE_API_KEY`.

**Never commit `.env` files or hardcode API keys.**

## Domain Context

This app helps a high school athlete (Jacob Rodgers, OL, Class of 2029) with the college recruiting process:
- **Coach CRM**: Track and manage college coach contacts, follow/DM status
- **Content Engine**: Generate X/Twitter posts, captions, hooks, comments for recruiting visibility
- **Intelligence**: Analyze coach behavior patterns, scrape Hudl profiles, track competitor recruits
- **DM Campaigns**: Draft and manage direct messages to coaches
- **Analytics**: Track engagement, follower growth, profile audit scores

## REC System — Virtual Recruiting Agency

The app includes a 7-person virtual recruiting team, each a specialized Claude persona with dedicated knowledge bases.

### System Identity

The AI system identity is **Devin** — Technical Director & Orchestrator. When users interact with the system, Devin coordinates the team and routes tasks to specialists.

### Team Roster

| ID | Name | Role | Owns |
|----|------|------|------|
| `devin` | Devin | Technical Director & Orchestrator | Architecture, code, integrations, team coordination |
| `marcus` | Marcus Cole | Head of Recruiting Strategy | School targeting, NCAA compliance, recruiting calendar |
| `nina` | Nina Banks | Coach Intelligence & Outreach Director | Coach database, DM campaigns, NCSA leads |
| `trey` | Trey Jackson | Content Strategist & X Manager | Content calendar, post drafting, hashtag strategy |
| `jordan` | Jordan Reeves | Film & Media Producer | Video library, clip optimization, highlight reels |
| `sophie` | Sophie Chen | Analytics & Intelligence Lead | Scoring engine, competitor analysis, engagement metrics |
| `casey` | Casey Ward | Network Growth & Community Manager | Follow strategy, recruit peer connections, engagement |

### How to Activate Personas

Address team members by name in chat at `/agency/[member]`:
- "Nina, who viewed Jacob's NCSA profile this week?"
- "Trey, draft 3 posts for Tuesday using training clips"
- "Marcus, are we in a dead period right now?"

The chat API (`POST /api/rec/team/chat`) auto-detects the addressed member or defaults to Devin.

### REC Routes

- `/agency` — Team dashboard with member cards, task queue, lead pipeline
- `/agency/[member]` — Chat with individual team member (e.g., `/agency/nina`)
- `/agency/leads` — NCSA lead pipeline (kanban view)

### REC API Routes

- `POST /api/rec/team/chat` — Chat with a team member persona (SSE streaming)
- `GET /api/rec/ncsa/leads` — Get NCSA lead pipeline
- `POST /api/rec/ncsa/leads` — Add a manual lead
- `PUT /api/rec/ncsa/leads` — Update lead status
- `POST /api/rec/ncsa/scrape` — Parse NCSA HTML for leads
- `GET /api/rec/tasks` — List team tasks
- `POST /api/rec/tasks` — Create/assign tasks
- `PUT /api/rec/tasks/[id]` — Update task status

### REC File Structure

```
src/lib/rec/
  types.ts              # TeamMemberId, TeamMember, NCSALead, RecTask types
  tasks.ts              # File-backed task store (.rec-tasks.json)
  team/
    personas.ts         # Persona prompts, member detection, knowledge injection
  knowledge/
    ncaa-rules.ts       # NCAA recruiting calendar, contact rules, Class of 2029 timeline
    x-playbook.ts       # X/Twitter best practices, posting cadence, DM strategy
    coach-database.ts   # Target schools by tier with coach data
    ncsa-leads.ts       # File-backed NCSA lead store (.ncsa-leads.json)
    school-needs.ts     # OL roster needs per school
    competitor-intel.ts # Class of 2029 OL competitor profiles
    content-library.ts  # Video inventory summary from video store
```

## Data Integrity Rule

NO hardcoded fake data in any UI component. Every number, name, and stat displayed
must come from a real API response or database query. If no data exists, show an
empty state with a clear CTA. Never use placeholder values that could be mistaken
for real data. Configuration data (school targets, NCAA calendar, team roster,
pillar targets) is acceptable as these represent real strategic decisions, not fake metrics.

## Coach Panel Doctrine

ALL content published on Jacob's behalf MUST be vetted by the Coach Panel before posting.
The Coach Panel is a group of college coaches (stored in `panel_coaches` table) who review
and help shape content to ensure it resonates with the coaching community.

**Content Pipeline:**
1. Trey (Content Strategist) drafts content using post formulas and psychology mechanisms
2. Draft is submitted to Coach Panel for review via `panel_surveys` table
3. Panel coaches provide feedback: would they recruit based on this content? What convinced them? What almost made them leave?
4. Content is revised based on panel feedback
5. Only panel-approved content moves to `approved` status and gets scheduled

**Coach Panel Rules:**
- No content reaches `approved` status without panel review
- Panel feedback informs future content strategy (what coaches actually want to see)
- Minimum 2 panel coach reviews required before approval
- Panel coaches are real college coaches from target schools across divisions
- Survey responses feed back into Trey's content formulas and Sophie's analytics

**Database Tables:**
- `panel_coaches` — Panel member profiles (name, school, division, position coached, status)
- `panel_surveys` — Individual reviews with recruiting signals and feedback

## School Branding

School logos stored in `public/logos/{school-id}.svg`. School colors and branding
data in `src/lib/data/school-branding.ts`. Use `getSchoolLogo(id)` and
`getSchoolColors(id)` when displaying school identity in coach-related components.
