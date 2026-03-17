# Full System Population + Comprehensive Test Suite

**Date:** 2026-03-17
**Status:** Approved
**Approach:** Progressive Population (seed each system independently, test in isolation)

## Goal

Populate every screen in Alex Recruiting with real, interconnected data. No empty states. 30+ days of content and scheduled tasks for Jacob. Comprehensive test suite validating all systems.

## Constraints

- All data must be real or realistic (no obvious fakes)
- Every page/widget must show data on first load
- Peer recruits should be real Class of 2029 players where possible
- Growth ecosystem includes recruiting media, WI HS community, strength coaches
- Learning system tracks what works/doesn't with weekly AI retrospectives
- Progressive seeding: each phase can be tested independently

## Phase 1: Schools & Coaches

**Scope:** 40 target schools, ~80 coaches (HC + OL/DL coordinator each)

**Tiers:**
- Tier 1 (8): WIAC — updated 2026 coaching staffs
- Tier 2 (12): Midwest D3 — CCIW, MWC, MIAC
- Tier 3 (12): Regional D2 — GLIAC, NSIC
- Tier 4 (8): FCS stretch — Pioneer, PFL

**Per coach:** name, title, email, phone, X handle (real where found), school_id, tier, position_coached, persona (communication style, recruiting priorities)

**Coach behavior scores:** baseline interest levels for all 80 coaches

**Pages filled:** /coaches, /coaches/[id], /dashboard/coaches, /intelligence, /map

## Phase 2: Outreach Schedule

**Scope:** 60-day outreach calendar (March 17 → May 16)

**Waves:**
- Week 1-2: WIAC coaches (5-7 actions/day)
- Week 3-4: Midwest D3 coaches (4-5 actions/day)
- Week 5-6: D2 + FCS coaches (3-4 actions/day)
- Week 7-8: Follow-up wave, re-engage non-responders (2-3 actions/day)

**Action sequence per coach (8-step cadence):**
1. Day 1: Follow personal account
2. Day 3: Like 2-3 recent posts
3. Day 5: Reply to recruiting tweet
4. Day 7: @mention in training/film post
5. Day 10: DM attempt (if followed back)
6. Day 14: Email outreach (if no X response)
7. Day 21: Follow-up DM or email
8. Day 30: Status check — escalate or archive

**Per action record:** coach_id, action_type, scheduled_date, status (pending/approved/executed/skipped), result (followed_back/replied/ignored/blocked), notes

**Follow-back tracking:** Automated check every 48 hours

**Pages filled:** /outreach, /cold-dms, /dms, /dashboard/outreach

## Phase 3: Content Calendar

**Scope:** 30 days of posts (March 17 → April 16), 17 total posts

**Schedule:** Mon/Wed/Fri at 6pm CT + Saturday recaps + Sunday motivation

**Pillar distribution:**
- Performance (40%): 7 posts — film clips, measurables, weight room PRs
- Work Ethic (40%): 7 posts — training footage, early workouts, film study
- Character (20%): 3 posts — team leadership, academics, community

**Per post:** draft_text, pillar, post_type, scheduled_time, suggested_media, hashtags, target_coaches_to_tag, approval_status

**Pages filled:** /posts, /create, /content-queue, /hooks, /captions, /comments, /dashboard/content

## Phase 4: Intelligence & Scouting

**Scope:** 15 real Class of 2029 OL/DT competitors, coach intelligence for all 80 coaches

**Competitor profiles:** name, school, position, height/weight, offers, X handle, Hudl link, composite score

**Scout leaderboard:** ranked by composite (measurables + film + academics + engagement)

**Coach intelligence:** behavior scores (0-100), tweet pattern analysis, recruiting signal results

**Pages filled:** /competitors, /intelligence, /analytics, scout leaderboard, /dashboard

## Phase 5: Peer Network & Growth Ecosystem

**Scope:** 60 follow targets across 4 categories

**Categories:**
- Peer recruits (20): Class of 2029 OL/DT from WI, MN, IL, IA, MI
- Recruiting media (15): @PrepRedzone, @WisSportsHeroic, @D3football, @Hudl, etc.
- WI HS football community (15): Pewaukee HS, conference rivals, WI coaches assoc
- Strength/training accounts (10): HS strength coaches, position trainers

**Per target:** name, handle, category, follow_priority, engagement_strategy, followed_date, follow_back_status

**Follower growth targets:** Baseline → +50 (W4) → +120 (W8) → +200 (W12)

**Pages filled:** /connections, /connections/[id], /x-growth, growth analytics

## Phase 6: Task Schedule

**Scope:** 30 days of daily tasks for Jacob

**Weekday template:**
- 7am: Check notifications, respond to coach engagement
- 3pm: Like 3 coach posts, reply to 1 peer recruit
- 6pm: Post scheduled content
- 9pm: Review day's engagement metrics

**Weekend template:**
- Saturday: Game recap post, film study
- Sunday: Weekly review, plan next week, update learning journal

**Weekly milestones:**
- W1: Complete WIAC follow wave, post intro content
- W2: First DM attempts to coaches who followed back
- W3: Expand to CCIW/MWC, review content performance
- W4: Monthly retrospective, adjust strategy

**Pages filled:** /agency, /calendar, /dashboard/team, REC tasks

## Phase 7: Learning System

**New table: `outreach_learnings`**
- Weekly AI-generated retrospectives from actual metrics
- What worked / What didn't / What to try next
- A/B test tracking for DM templates and post formats
- Strategy adjustment log with reasoning

**Seeded with 4 weeks of mock history** so dashboard isn't empty on day 1

**Pages filled:** /analytics, intelligence dashboard, agent status, weekly briefing

## Phase 8: Comprehensive Test Suite

**50+ new tests across 8 categories:**

| Category | Count | Validates |
|----------|-------|-----------|
| Page renders | 15 | Every page renders with data, no empty states |
| Data integrity | 8 | Relationships valid, no orphans, counts match |
| Outreach workflows | 6 | Schedule → approve → execute → track → learn |
| Content generation | 5 | AI posts valid, pillar distribution correct |
| Scrapers | 5 | Coach/roster/competitor scrapers return valid data |
| Scheduling | 4 | Tasks advance, cron timing, overdue detection |
| API integration | 5 | X API, Supabase CRUD, analytics aggregation |
| Learning system | 3 | Retrospective generation, metrics, adjustments |

## Data Flow

```
Schools → Coaches → Outreach Schedule → Actions → Results
                                                      ↓
Content Calendar → Posts → Engagement → Learning System
                                                      ↓
Peers → Follow Targets → Growth Tracking → Retrospective
                                                      ↓
Competitors → Leaderboard → Intelligence → Strategy Adjustments
```

## Implementation Order

Progressive — each phase seeds independently and is tested before moving to the next:

1. Schools & Coaches (foundation — everything references these)
2. Competitors & Intelligence (scouting data, leaderboard)
3. Content Calendar (30 days of posts)
4. Outreach Schedule (60 days of actions referencing coaches)
5. Peer Network & Growth (follow targets, engagement strategy)
6. Task Schedule (daily tasks referencing outreach + content)
7. Learning System (retrospectives referencing all metrics)
8. Test Suite (validates everything above)
