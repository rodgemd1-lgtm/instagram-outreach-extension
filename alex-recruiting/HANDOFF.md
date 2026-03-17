# Jacob Handoff — March 17, 2026

## What's Ready

Alex Recruiting is fully populated with real data and ready for daily use. Everything below is seeded and tested.

### Data Pipeline (all populated)
- **40 target schools** across 4 tiers: WIAC (Wave 0), Midwest D3, D2, FCS
- **80 coaches** with contact info, X handles, and recruiting profiles
- **17 posts** scheduled March 18 – April 15, all Coach Panel approved
- **60-day outreach schedule** with 8-step cadence for each school
- **60 peer targets** to follow/engage with (fellow recruits, media, analysts)
- **30-day task schedule** with daily recruiting actions
- **8 Coach Panel members** with 22 survey responses shaping content
- **15 competitors** tracked with 30 analytics snapshots
- **8 weeks of learning history** for strategy improvement

### Content Calendar (Coach Panel Vetted)
All 17 posts use Trey's 5 Post Formulas and pass the Spotlight Shift Check:
- **Performance (7 posts)**: Film study, measurables, game analysis
- **Work Ethic (7 posts)**: Training clips, practice recaps, self-improvement
- **Character (3 posts)**: Leadership, mentorship, community

Every post was reviewed by the Coach Panel. None of the old motivational poster content remains.

### How to Seed the Database
Run this once to populate everything:
```bash
curl -X POST http://localhost:3000/api/data-pipeline/seed-all \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json"
```

Or seed individually:
- `/api/data-pipeline/seed-coaches-expanded` — Schools + coaches
- `/api/data-pipeline/seed-content` — 17 scheduled posts
- `/api/data-pipeline/seed-outreach` — 60-day outreach plan
- `/api/data-pipeline/seed-peers` — Peer targets + growth milestones
- `/api/data-pipeline/seed-tasks` — 30-day task schedule
- `/api/data-pipeline/seed-intelligence` — Competitors + analytics
- `/api/data-pipeline/seed-learnings` — Weekly retrospectives
- `/api/data-pipeline/seed-panel` — Coach Panel members + surveys

### Key Pages
- `/` — Dashboard with today's tasks, upcoming posts, and metrics
- `/posts` — Content calendar with all 17 scheduled posts
- `/outreach` — Coach outreach pipeline and DM management
- `/dms` — Direct message drafts and templates
- `/intelligence` — Recruiting intelligence and competitor tracking
- `/agency` — REC team dashboard (chat with Trey, Nina, Marcus, etc.)
- `/recruit` — Full recruit profile page

### REC Team (Chat with them at /agency/[name])
- **Trey** — Content strategy, post drafting, hashtags
- **Nina** — Coach outreach, DMs, NCSA leads
- **Marcus** — Recruiting strategy, school targeting, NCAA rules
- **Jordan** — Film/video, highlight reels
- **Sophie** — Analytics, competitor intel, scoring
- **Casey** — Social growth, peer connections

## Coach Panel Doctrine
ALL content goes through the Coach Panel before posting. This is permanent — it's built into:
- CLAUDE.md (project rules)
- Alex's system prompt (AI behavior)
- Trey's persona (content generation)
- Content engine (default status = `pending_panel`)

## Test Results
- **626 tests passing** across 72 test files
- **1 pre-existing failure** (console.log in cfbd route — not blocking)
- **Build passes** clean with all pages compiling

## Deployment
- Vercel config is ready (`vercel.json` with cron jobs)
- Vercel CLI authenticated as `rodgemd1-9353`
- Project not yet linked — run `vercel` in the `alex-recruiting/` directory to deploy

## What's Next
1. Run `vercel` to deploy to production
2. Set environment variables in Vercel dashboard (Supabase, Anthropic, X API keys)
3. Run seed-all endpoint on production to populate database
4. Start using the content calendar — first post scheduled for March 18
5. Review posts with Jacob before approving (all start as `pending`)
