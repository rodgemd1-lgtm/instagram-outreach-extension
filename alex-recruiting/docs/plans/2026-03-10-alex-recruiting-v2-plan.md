# Alex Recruiting v2.0 -- Comprehensive Plan

**Date:** March 10, 2026
**Status:** Draft for review
**Owner:** Mike Rodgers
**Orchestrated by:** Susan (Apex Ventures)
**Specialist inputs:** Compass (Product), Marcus (UX), Aria (Growth), Coach-Outreach-Studio, Recruiting-Dashboard-Studio

---

## Executive Summary

Alex Recruiting v2.0 transforms a backend-heavy prototype into a fully functional, two-panel recruiting platform. The core insight: Jacob's recruiting system already has 183 coaches in the database, an X API connection, a 7-person virtual team, and deep intelligence infrastructure. What it lacks is a functional frontend that coaches can use and Jacob's family can operate.

The v2.0 plan sequences five workstreams across 12 weeks, prioritizing the coaches panel first (it is the revenue-generating surface), then the user dashboard, then the X calendar and DM automation.

**Contrarian risk:** The biggest threat is not missing features -- it is building too many screens. The current app has 35+ page routes, most of which are disconnected tool screens. V2.0 should consolidate, not expand.

**Execution simplification:** Ship two panels with four screens each, not a 35-page application. Everything else is behind-the-scenes automation.

---

## Part 1: Architecture Assessment

### What Exists (Strong Foundation)

| Layer | Status | Detail |
|-------|--------|--------|
| Database schema | Mature | 30+ tables covering coaches, posts, DMs, camps, measurables, analytics, video assets, agent system, A/B testing, page visits, NCSA leads |
| Coach data | Populated | 183 coaches, school fit scores, behavior profiles, OL need scores |
| X API integration | Connected | Bearer token auth, post creation, media upload (chunked), DM sending |
| REC virtual team | Built | 7 Claude personas with knowledge bases, chat API, task management |
| Video assets | Managed | Video asset table with tags, thumbnails, optimization tracking |
| Intelligence engine | Built | Scoring engine, coach behavior analysis, tweet pattern analysis, Hudl profile scraping |
| Recruit page | Partially working | FNL aesthetic design, 8-section cinematic flow, video playback issues being resolved |
| Content pipeline | Built | Post drafting, pillar system, scheduling, hashtag generation |
| DM pipeline | Built but unused | DM sequences, templates, coach targeting -- 0 DMs sent in last 30 days |

### What Needs Rebuilding

| Area | Problem | V2.0 Solution |
|------|---------|---------------|
| Frontend navigation | 35+ disconnected tool pages with no coherent user journey | Two clean panels: Coaches Panel + User Dashboard |
| Content calendar | Exists as list view, no visual calendar | Full calendar UI with drag-to-schedule |
| DM management | Templates exist but no send workflow | Queue-based review-and-send with tracking |
| Analytics | Scattered across pages | Unified dashboard with recruiting funnel |
| Auth | No role-based access | Coach vs family auth with Supabase |

### Schema Changes Needed

The existing schema is comprehensive. Minimal additions:

```sql
-- Coach panel access tokens (no full auth needed for coaches)
CREATE TABLE coach_access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID REFERENCES coaches(id),
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP,
  last_used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User sessions for family dashboard
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'family', -- 'family' | 'admin'
  last_login TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Content calendar events (beyond just posts)
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- 'post' | 'camp' | 'visit' | 'deadline' | 'followup'
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMP NOT NULL,
  related_id TEXT, -- post_id, camp_id, etc.
  status TEXT DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### API Route Architecture (Consolidated)

Current state: 30+ API directories. V2.0 consolidates to clean domains:

```
src/app/api/
  auth/               # Supabase auth + role middleware
  coaches-panel/      # Public coach-facing endpoints
    profile/          # GET Jacob's profile data
    film/             # GET video assets by category
    contact/          # POST coach inquiry form
    analytics/        # POST page view / section engagement tracking
  dashboard/          # Family-facing endpoints (auth required)
    overview/         # GET dashboard summary stats
    calendar/         # GET/POST/PUT calendar events + scheduled posts
    outreach/         # GET/POST DM queue, sequences, coach pipeline
    analytics/        # GET engagement, growth, recruiting funnel
    coaches/          # GET/PUT coach CRM data
    content/          # GET/POST content drafts, templates
  rec/                # Existing REC team chat + task APIs (keep)
  x/                  # X API wrapper (post, DM, analytics)
  intelligence/       # Scoring, scraping, analysis (keep)
```

---

## Part 2: UX/UI Design Direction

### Design Philosophy

**"Sideline Confidence"** -- The interface should feel like a well-prepared coach's clipboard: organized, fast, decisive. Not a generic SaaS dashboard. Not a flashy sports app. A professional tool that respects the user's time and intelligence.

Two design modes for two audiences:

1. **Coaches Panel:** Documentary cinema. The existing FNL aesthetic (warm blacks, gold accents, Playfair Display headings, film grain) is the right answer for this surface. Coaches see a premium recruiting profile that answers their four questions in 47 seconds.

2. **User Dashboard:** Command center. Clean, information-dense, action-oriented. Dark theme with slate palette, Inter font for readability, data-forward layouts. Think Notion meets Linear -- not Hudl's cluttered interface.

### Color System

**Coaches Panel** (existing FNL palette -- keep):
| Token | Hex | Usage |
|-------|-----|-------|
| fnl-black | #0A0A0A | Background |
| fnl-gold | #D4A853 | Primary accent |
| fnl-crimson | #C0392B | CTAs |
| fnl-warm-white | #F5F0E6 | Body text |

**User Dashboard** (new command palette):
| Token | Hex | Usage |
|-------|-----|-------|
| dash-bg | #0F1117 | Background |
| dash-surface | #1A1D27 | Cards, panels |
| dash-border | #2A2D37 | Borders, dividers |
| dash-text | #E4E4E7 | Primary text |
| dash-muted | #71717A | Secondary text |
| dash-accent | #3B82F6 | Primary actions (blue) |
| dash-success | #22C55E | Positive signals |
| dash-warning | #F59E0B | Attention signals |
| dash-danger | #EF4444 | Urgent / errors |

### Typography

| Context | Font | Weights | Usage |
|---------|------|---------|-------|
| Coaches Panel headings | Playfair Display | 700, 900 | Section titles, name |
| Coaches Panel body | Inter | 400, 500 | Descriptions |
| Coaches Panel data | JetBrains Mono | 400 | Stats, measurables |
| Dashboard headings | Inter | 600, 700 | Page titles, section headers |
| Dashboard body | Inter | 400, 500 | All body text |
| Dashboard data | JetBrains Mono | 400, 500 | Numbers, metrics, dates |

### Component Library

Use **shadcn/ui** (already in the project via Radix UI). Key components needed:

- `Card` -- stat cards, coach cards, post preview cards
- `Calendar` -- full month view for content + events
- `DataTable` -- coach CRM list, DM queue, post history
- `Dialog` -- post composer, DM editor, coach detail view
- `Tabs` -- dashboard section switching
- `Badge` -- status indicators (sent, draft, replied, offer)
- `Progress` -- recruiting funnel, profile completeness
- `Chart` -- engagement trends (use Recharts or Tremor)
- `Avatar` -- coach avatars, school logos
- `Command` -- quick action palette (Cmd+K)

### Information Architecture

#### Coaches Panel (4 screens)

```
/recruit                    # Main profile page (existing, refined)
/recruit/film               # Full film library with filters
/recruit/stats              # Detailed measurables + academics
/recruit/contact            # Contact form + quick links
```

The recruit page is already well-designed with the FNL aesthetic. V2.0 refines it and adds optional deeper drill-down pages. Most coaches will never leave the main `/recruit` page -- and that is correct.

#### User Dashboard (6 screens)

```
/dashboard                  # Overview: key metrics, action items, alerts
/dashboard/calendar         # Content calendar + events + scheduling
/dashboard/outreach         # DM queue + coach pipeline + sequences
/dashboard/coaches          # Coach CRM with fit scores + status tracking
/dashboard/analytics        # Engagement, growth, recruiting funnel
/dashboard/team             # REC team chat (existing /agency, consolidated)
```

### Key Screen Layouts

#### Dashboard Overview
```
+--sidebar--+--main-content-area----------------------------+
| Logo       | Welcome, Jacob.              [Quick Actions] |
| Dashboard  +----------------------------------------------+
| Calendar   | [Stat Card]  [Stat Card]  [Stat Card]  [Stat]|
| Outreach   | Profile Views Coach Follows DMs Sent  Posts  |
| Coaches    +----------------------------------------------+
| Analytics  | [Action Items]         | [Upcoming Events]   |
| Team       | - Send 3 pending DMs   | Mar 15: Spring Camp |
|            | - Review 2 coach       | Mar 22: Film upload |
| --------   |   replies              | Apr 1: NCAA window  |
| Settings   | - Post scheduled for   |                     |
|            |   tomorrow             |                     |
+------------+----------------------------------------------+
```

#### Content Calendar
```
+--sidebar--+--calendar-header-------------------------------+
|            | < March 2026 >    [Week|Month]  [+ New Post]  |
|            +-----------------------------------------------+
|            | Sun | Mon | Tue | Wed | Thu | Fri | Sat       |
|            |     |     |     |  1  |  2  |  3  |  4        |
|            |     |     |     |[post|     |[post|           |
|            |     |     |     |icon]|     |icon]|           |
|            +-----------------------------------------------+
|            | [Post Composer Sidebar]                       |
|            | Content: [textarea]                           |
|            | Pillar: [select: Film/Training/Academic/...]   |
|            | Media: [upload zone]                          |
|            | Schedule: [date + time picker]                |
|            | Hashtags: [auto-generated + editable]         |
|            | [Preview] [Schedule] [Post Now]               |
+------------+-----------------------------------------------+
```

#### Outreach Pipeline
```
+--sidebar--+--pipeline-header-------------------------------+
|            | DM Outreach    [+ New Sequence]  [Filters]    |
|            +-----------------------------------------------+
|            | Kanban columns:                               |
|            | [Queued] [Sent] [Viewed] [Replied] [Meeting]  |
|            |  Coach A  Coach D Coach F  Coach H  Coach J   |
|            |  Coach B  Coach E Coach G  Coach I             |
|            |  Coach C                                       |
|            +-----------------------------------------------+
|            | [Selected Coach Detail]                        |
|            | Name: Coach Smith, OL Coach, Wisconsin         |
|            | DM History: [message thread view]              |
|            | Next Action: Follow-up in 3 days               |
|            | [Edit DM] [Send Now] [Skip] [Archive]          |
+------------+-----------------------------------------------+
```

### Navigation Pattern

**Desktop:** Fixed left sidebar (280px) with icon + label nav. Collapsible to icon-only (64px).

**Mobile:** Bottom tab bar with 5 tabs: Home, Calendar, Outreach, Coaches, Team. More items accessible via hamburger or swipe.

### Responsive Strategy

| Breakpoint | Layout | Priority |
|------------|--------|----------|
| < 640px (mobile) | Single column, bottom nav, simplified cards | P0 -- coaches browse on phones |
| 640-1024px (tablet) | Two-column where useful, collapsible sidebar | P1 |
| > 1024px (desktop) | Full sidebar + main content + optional detail panel | P1 |

### Accessibility

- WCAG AA minimum for all text contrast
- Focus rings on all interactive elements (visible on dark backgrounds)
- Keyboard navigation for all critical flows
- Screen reader labels on icon-only elements
- `prefers-reduced-motion` respected (disable animations, show content immediately)
- Large touch targets (44px minimum) for mobile coach browsing

---

## Part 3: X Posting Calendar Strategy

### Content Pillars (5 Themes)

| Pillar | % Mix | Purpose | Example |
|--------|-------|---------|---------|
| **Film & Game Clips** | 35% | Prove he can play | Pancake block clip, pass pro rep, game highlight |
| **Training & Work Ethic** | 25% | Show trajectory | Weight room PR, agility drill, 5am workout |
| **Academic & Character** | 15% | Remove disqualifiers | GPA update, team community service, classroom win |
| **Camp & Event Prep** | 15% | Signal seriousness | Camp registration, pre-camp training, post-camp measurables |
| **Lifestyle & Personality** | 10% | Make him human | Multi-sport (track), family, team bonding, coachable moments |

### Weekly Posting Cadence

| Day | Post Type | Pillar | Rationale |
|-----|-----------|--------|-----------|
| Monday | Training clip + weekly goals | Training | Coaches start their week reviewing film/social |
| Tuesday | Film breakdown or game clip | Film | Mid-week content peak for coach engagement |
| Wednesday | Academic/character post | Academic | Breaks up film content, shows well-roundedness |
| Thursday | Film clip (different angle) | Film | Second film touchpoint before weekend |
| Friday | Game day / hype post | Film/Lifestyle | Friday night energy, natural football moment |
| Saturday | Rest day or camp content | Camp/Lifestyle | Lower-pressure, authentic content |
| Sunday | Film study / week recap | Film/Training | Coaches plan their week on Sunday evening |

**Target: 5-7 posts per week** (aligned with operational assessment showing current cadence is below target)

### Optimal Posting Times

Based on coach behavior profile data already in the database (`coachBehaviorProfiles.peakActivityHours`):

| Time Window (CT) | Why | Post Type |
|-------------------|-----|-----------|
| 6:00-7:30 AM | Coaches check phones before morning meetings | Training clips, academic updates |
| 11:30 AM-1:00 PM | Lunch break scrolling | Film clips, engagement posts |
| 8:00-10:00 PM | Evening film review session | Game film, highlight reels |

**Saturday exception:** 10:00 AM-12:00 PM (coaches are less scheduled)
**Sunday exception:** 7:00-9:00 PM (coaches planning the week ahead)

### Hashtag Strategy

**Tier 1 -- Always include (2-3 per post):**
- #ClassOf2029
- #RecruitJacob79 (branded)
- Position-specific: #OLRecruit or #DTRecruit

**Tier 2 -- Rotate by content (1-2 per post):**
- Film posts: #HighSchoolFootball #WisconsinFootball #FridayNightLights
- Training: #OffseasonGrind #TrenchWork #LinemenTraining
- Academic: #StudentAthlete #AcademicExcellence
- Camp: #CampSeason #ProspectDay + [specific camp hashtag]

**Tier 3 -- Targeting (1 per post, strategic):**
- Conference tags: #B1GFootball #MACtion #MissouriValley
- State tags: #WisconsinRecruit #MidwestFootball
- Coach tags: @specific_coach (only when content is directly relevant to them)

**Do not use:** Generic tags like #Football or #Recruit (too broad, zero signal)

### 30-Day Calendar Framework

#### Week 1: Foundation (Establish Rhythm)

| Day | Content | Format | CTA |
|-----|---------|--------|-----|
| Mon | Training montage clip (weight room) | Video (30s) | "Day 1 of spring prep. Work doesn't stop." |
| Tue | Best pancake block from freshman film | Video (15s) | "Finish through the whistle. Every rep." |
| Wed | GPA update or classroom moment | Image + text | "3.25 and climbing. Football starts in the classroom." |
| Thu | Pass protection rep (1-on-1 drill) | Video (15s) | "Hands inside. Feet moving. Anchor." |
| Fri | Game day throwback or hype post | Video (20s) | "Friday nights under the lights." |
| Sat | Multi-sport content (discus/shot put) | Image/Video | "Explosive power translates." |
| Sun | Week 1 recap + goals for week 2 | Text + image | "7 days in. Here's what's coming." |

#### Week 2: Film Focus (Prove the Tape)

| Day | Content | Format | CTA |
|-----|---------|--------|-----|
| Mon | Morning workout + measurables update | Video (20s) | "405 deadlift. 285 bench. Still growing." |
| Tue | Drive block compilation (3-4 plays) | Video (30s) | "Create movement. Finish blocks. Win reps." |
| Wed | Character post (team leadership moment) | Text + image | "Football teaches you how to lead." |
| Thu | Pull/reach block technique clip | Video (15s) | "Pulling to the second level." |
| Fri | Friday night game highlight | Video (20s) | "When the lights come on." |
| Sun | Coach quote or teammate endorsement | Text | "What my coaches say matters more than what I say." |

#### Week 3: Engagement Push (Drive Interactions)

| Day | Content | Format | CTA |
|-----|---------|--------|-----|
| Mon | Training transformation (before/after) | Image carousel | "From 240 to 285. The work shows." |
| Tue | Full highlight reel drop | Video (2-3 min) | Pin this post. "Full freshman film. Link in bio." |
| Wed | Academic milestone or extracurricular | Image + text | "Student first. Athlete always." |
| Thu | Individual drill rep with coaching point | Video (15s) | "Working on hand placement with Coach [Name]." |
| Fri | Pre-game routine or hype content | Video (15s) | "Ready for battle." |
| Sat | Camp announcement or preparation | Text + image | "Registered for [Camp Name]. Time to compete." |
| Sun | Recruiting profile link + call to action | Text | "Updated profile. Coaches, the film speaks for itself." |

#### Week 4: Outreach Integration (Set Up DMs)

| Day | Content | Format | CTA |
|-----|---------|--------|-----|
| Mon | Training PR or milestone | Video (20s) | "New PR. The ceiling keeps moving." |
| Tue | Position-specific technique showcase | Video (20s) | "OL fundamentals. Every. Single. Day." |
| Wed | Gratitude post (coaches, trainers, family) | Text + image | "None of this happens alone." |
| Thu | Camp recap or measurables from event | Image + data | "Competed at [Camp]. Results speak." |
| Fri | Season/game preview or throwback | Video (20s) | "Can't wait to get back on the field." |
| Sat | Recruiting journey reflection | Text | "Class of 2029. Three more years to prove it." |
| Sun | Monthly recap + forward look | Text + image | "Month 1 down. Here's what's next." |

### DM-to-Post Integration

Posts should create natural DM opening lines:

1. **After a film post:** DM coaches at target schools: "Coach, just posted new sophomore film. Would love your feedback on my technique. [link]"
2. **After a camp post:** DM coaches attending that camp: "Coach, looking forward to competing at [camp]. I'll be the 6'4" OL in position group 3."
3. **After an academic post:** Include in DM sequences: "Academics are a priority -- 3.25 GPA and taking honors courses next year."
4. **After a milestone post:** DM as a touchpoint: "Just hit 405 on deadlift. Training 5 days a week. Here's my latest film: [link]"

### Metrics to Track

| Metric | Target | Tool |
|--------|--------|------|
| Posts per week | 5-7 | `scheduledPosts` table |
| Engagement rate | > 3% | X API analytics + `analyticsSnapshots` |
| Coach follows gained/week | 3-5 new | `growthSnapshots.coachFollowers` |
| Film play rate | > 50% of impressions | X API video metrics |
| Profile visits from posts | Track via UTM | `pageVisits` table |
| DM response rate | > 15% | `dmMessages` table |

---

## Part 4: DM Outreach Automation Plan

### NCAA Compliance Framework

**Critical constraint for Class of 2029:** Division I coaches cannot initiate calls, texts, DMs, or recruiting materials until **June 15, 2027** (after sophomore year). However:

- Jacob and his family CAN initiate contact at any time
- Coaches CAN respond to athlete-initiated contact
- Filling out questionnaires is allowed and encouraged now
- Social media interaction (likes, follows, public replies) is unrestricted

**V2.0 DM strategy:** All outreach is athlete-initiated, which is NCAA-compliant. The system drafts messages; Jacob's family reviews and approves each send.

### Coach Tiering Framework

| Tier | Schools | Approach | DM Frequency |
|------|---------|----------|--------------|
| **Tier 1: Dream** | Power 4 programs (Big Ten, SEC, Big 12, ACC) | Aspirational, emphasis on projection and trajectory | Monthly touchpoint max |
| **Tier 2: Strong Fit** | Group of 5, strong FCS (MVFC, CAA) | Direct fit messaging, roster need alignment | Bi-weekly touchpoints |
| **Tier 3: Likely** | FCS, D2 with strong programs | Confident interest, camp invitations | Weekly touchpoints |
| **Tier 4: Safety** | D2, D3, NAIA | Express genuine interest, ask questions | As needed |

Use existing `schoolFitScores.fitScore` and `coaches.priorityTier` to auto-assign tiers.

### DM Sequence Design

**Sequence 1: Initial Introduction (4 steps)**

| Step | Timing | Template |
|------|--------|----------|
| 1. Intro | Day 0 | "Coach [Name], I'm Jacob Rodgers, a Class of 2029 OL from Pewaukee HS (WI). 6'4", 285 lbs as a sophomore. I've been studying [School]'s offense and think my skill set fits your system. Here's my film: [link]. Would love to get on your radar. Thank you for your time." |
| 2. Film Follow-Up | Day 7 (if no reply) | "Coach, just wanted to follow up with my latest highlight clip from this spring. Working on [specific technique]. Film here: [link]. I'd appreciate any feedback." |
| 3. Value Add | Day 21 (if no reply) | "Coach, wanted to share a quick update -- [specific milestone: new PR, GPA update, camp result]. Still very interested in [School]. Updated profile: [link]." |
| 4. Soft Close | Day 45 (if no reply) | "Coach, hope spring practice is going well. I'll keep working and sending film updates. If there's a camp or prospect day I should attend at [School], I'd love to know. Thank you." |

**If coach replies at any step:** Exit sequence, move to conversation mode, flag for family review.

### Personalization Strategy

Each DM is personalized using data already in the database:

| Data Point | Source Table | Usage |
|------------|-------------|-------|
| Coach name + title | `coaches` | Formal address |
| School name + conference | `schools` | Context |
| OL need score | `schools.olNeedScore` | "I know you're graduating X OL seniors" |
| Coach engagement style | `coachBehaviorProfiles` | Adjust tone (formal vs casual) |
| Best approach method | `coachBehaviorProfiles.bestApproachMethod` | DM vs email routing |
| Optimal contact hours | `coachBehaviorProfiles.optimalContactHours` | Send timing |
| School fit score | `schoolFitScores` | Tailor why-this-school content |

### Automation Rules

| Rule | Implementation |
|------|---------------|
| **Never auto-send** | All DMs go to review queue; family approves each send |
| **Rate limiting** | Max 10 DMs per day across all coaches |
| **Sequence spacing** | Minimum 7 days between steps in a sequence |
| **Response detection** | Poll X API for DM replies; flag coach as "replied" |
| **Duplicate prevention** | Check `dmMessages` before queuing; never DM same coach twice in same week |
| **Dead period compliance** | Block sends during NCAA dead periods (check `ncaa-rules.ts`) |
| **Business hours only** | Send between 8 AM - 8 PM in coach's timezone |

### Response Handling Workflow

```
Coach replies to DM
  -> System flags in dmMessages (status: 'responded')
  -> Notification to family dashboard
  -> Auto-pause sequence for that coach
  -> Suggest response draft using Claude (review before send)
  -> If positive: move coach to "Active Interest" in CRM
  -> If questionnaire: flag as high-priority, link to questionnaire workflow
  -> If camp invite: create calendar event + camp record
```

### CRM Integration

The outreach system feeds the existing coach pipeline:

| Stage | Trigger | Dashboard Display |
|-------|---------|-------------------|
| **Prospected** | Coach added to target list | Gray badge |
| **Contacted** | First DM sent | Blue badge |
| **Engaged** | Coach replied or interacted | Green badge |
| **Interested** | Coach asks for more film / invites to camp | Gold badge |
| **Evaluating** | Official questionnaire or visit invitation | Orange badge |
| **Offered** | Offer extended | Red badge (with celebration) |

### Escalation Paths

| Channel | When to Use | Tool |
|---------|-------------|------|
| X DM | Initial contact, film sharing, quick updates | Automated queue |
| Email | Formal introduction, questionnaire follow-up, post-camp | `emailOutreach` table |
| Phone | After coach-initiated contact (post June 2027) | Manual, log in CRM |
| In-person | Camps, prospect days, unofficial visits | Log in `camps` table |

---

## Part 5: Prioritized Implementation Roadmap

### Phase 0: Consolidation & Cleanup (Week 1)
**Effort: 1 week | Priority: P0**

This is the phase most teams skip, and it is the most important.

| Task | Detail | Effort |
|------|--------|--------|
| Route audit | Map all 35 existing pages; mark keep/merge/delete | 2 hours |
| Delete dead routes | Remove unused pages (launch, x-profile, viral, hooks, captions, comments, connections, etc.) | 4 hours |
| Consolidate duplicates | Merge overlapping pages (cold-dms + dms, media + media-lab + media-import) | 1 day |
| Auth setup | Supabase auth with email magic link for family; token-based access for coach panel | 1 day |
| Dashboard layout shell | Sidebar nav + main content area + responsive breakpoints | 1 day |
| Design tokens | Implement dash-* color system alongside existing FNL tokens | 2 hours |

**Exit criteria:** Clean route structure, auth working, dashboard shell renders on all breakpoints.

### Phase 1: Coaches Panel Refinement (Weeks 2-3)
**Effort: 2 weeks | Priority: P0**

The coaches panel is the most important surface because it is the thing coaches actually see. The existing `/recruit` page with FNL aesthetic is 80% there.

| Task | Detail | Effort |
|------|--------|--------|
| Fix all video playback | Ensure every video URL resolves, add error fallbacks | 2 days |
| Contact form working | Debug POST endpoint, verify Supabase table, add validation | 1 day |
| Mobile optimization | Test and fix every section on mobile (coaches browse on phones) | 2 days |
| Analytics tracking | Wire up `pageVisits` + `sectionEngagement` + `filmViews` to capture coach behavior | 1 day |
| Performance optimization | Lazy-load below-fold sections, optimize video thumbnails | 1 day |
| Coach Packet PDF | One-page downloadable summary with measurables, film QR codes, contact info | 2 days |
| Film library sub-page | `/recruit/film` with categorized clips (OL, DL, pass pro, run block) | 1 day |

**Exit criteria:** A coach can visit `/recruit` on their phone, watch film, scroll the full story, and submit a contact form -- all working, fast, and beautiful.

### Phase 2: User Dashboard Core (Weeks 4-6)
**Effort: 3 weeks | Priority: P0**

| Task | Detail | Effort |
|------|--------|--------|
| Dashboard overview page | 4 stat cards + action items + upcoming events | 2 days |
| Coach CRM page | DataTable of all coaches with tier, status, last contact, fit score | 3 days |
| Coach detail view | Dialog/slide-over with full coach profile, DM history, notes | 2 days |
| Content calendar page | Month view calendar + post composer sidebar | 3 days |
| Post composer | Text + media upload + pillar select + hashtag auto-gen + schedule | 2 days |
| Calendar event integration | Camps, visits, deadlines on the same calendar as posts | 1 day |
| Basic analytics page | Follower growth chart + engagement trend + posting streak | 2 days |

**Exit criteria:** Family can log in, see their dashboard, browse coaches, create/schedule posts on a calendar, and view basic analytics.

### Phase 3: DM Outreach System (Weeks 7-9)
**Effort: 3 weeks | Priority: P1**

| Task | Detail | Effort |
|------|--------|--------|
| Outreach pipeline page | Kanban view: Queued > Sent > Viewed > Replied > Meeting | 2 days |
| DM composer | Template-based with personalization fields auto-filled from coach data | 2 days |
| Review queue | Family sees each DM with coach context, can edit/approve/skip | 2 days |
| Send integration | Approved DMs sent via X API with rate limiting and error handling | 2 days |
| Sequence engine | Multi-step sequences with configurable timing and auto-pause on reply | 3 days |
| Response detection | Poll X API for DM replies, update status, send notification | 2 days |
| Coach pipeline tracking | Update CRM status based on outreach events | 1 day |

**Exit criteria:** Family can create a DM sequence for a coach, review and approve each message, send via X, and see when coaches reply -- all from the dashboard.

### Phase 4: Content Automation (Weeks 10-11)
**Effort: 2 weeks | Priority: P1**

| Task | Detail | Effort |
|------|--------|--------|
| 30-day calendar pre-fill | Generate 30 days of draft posts from content pillars + templates | 2 days |
| AI post generation | Claude-powered post drafting from prompts ("training clip post for Tuesday") | 2 days |
| Batch scheduling | Select multiple drafts and schedule them across the calendar | 1 day |
| Auto-publish pipeline | Cron/Edge Function that publishes scheduled posts at the right time | 2 days |
| Post analytics pull | After publishing, fetch impressions/engagements from X API | 1 day |
| Pillar balance check | Dashboard widget showing content mix vs target ratios | 1 day |

**Exit criteria:** Family can generate a month of content, review it on the calendar, and have it auto-publish on schedule. Analytics feed back into the dashboard.

### Phase 5: Polish & Integration (Week 12)
**Effort: 1 week | Priority: P1**

| Task | Detail | Effort |
|------|--------|--------|
| REC team integration | Connect existing /agency team chat into dashboard as a tab | 1 day |
| Notification system | In-app alerts for coach replies, scheduled post reminders, camp deadlines | 1 day |
| Empty states | Every list, table, and chart has a helpful empty state with suggested action | 4 hours |
| Error handling | Global error boundaries, API error states, retry logic | 4 hours |
| Mobile QA pass | Full end-to-end test of both panels on iPhone and Android | 1 day |
| Performance audit | Lighthouse scores, bundle analysis, image optimization | 4 hours |

**Exit criteria:** Both panels work end-to-end on all devices. No broken states. Notifications working. REC team accessible from dashboard.

---

## Part 6: Effort Summary & Critical Path

### Total Effort

| Phase | Weeks | Priority | Dependencies |
|-------|-------|----------|--------------|
| 0. Consolidation | 1 | P0 | None |
| 1. Coaches Panel | 2-3 | P0 | Phase 0 |
| 2. User Dashboard | 4-6 | P0 | Phase 0 |
| 3. DM Outreach | 7-9 | P1 | Phase 2 |
| 4. Content Automation | 10-11 | P1 | Phase 2 |
| 5. Polish | 12 | P1 | Phases 3-4 |
| **Total** | **12 weeks** | | |

### Critical Path

```
[Phase 0: Consolidation + Auth] (1 week)
         |
    +----+----+
    |         |
[Phase 1]  [Phase 2]        <- Can run in parallel
Coaches    Dashboard         <- Both depend on Phase 0 auth
(2 weeks)  (3 weeks)
    |         |
    |    +----+----+
    |    |         |
    | [Phase 3] [Phase 4]   <- Can run in parallel
    | Outreach  Content      <- Both depend on Phase 2 dashboard
    | (3 weeks) (2 weeks)
    |    |         |
    +----+----+----+
         |
    [Phase 5: Polish] (1 week)
```

### Critical Path Blockers (Resolve Before Day 1)

| Blocker | Impact | Action |
|---------|--------|--------|
| X API tier | Free tier caps at 1,500 tweets/month. DM sending may require Basic ($100/mo) or Pro ($5,000/mo) | Verify current tier and DM permissions |
| Supabase auth config | Role-based access for coach vs family | Set up auth policies in Supabase dashboard |
| Video hosting | Where do film clips live? Supabase Storage, Cloudflare Stream, or external? | Decide and standardize |
| Domain/deployment | Is /recruit on a custom domain? coaches-panel.jacobrodgers.com? | Decide URL structure |

### Half-Time Plan (If You Have 6 Weeks Instead of 12)

Cut to the bone. Ship these three things:

1. **Coaches Panel working perfectly** (2 weeks) -- Fix videos, fix contact form, mobile optimization. This is the thing coaches see.
2. **Content Calendar + Auto-publish** (2 weeks) -- Calendar UI, post composer, scheduled publishing. This creates the X presence.
3. **DM Queue (manual, no automation)** (2 weeks) -- Simple list of draft DMs, edit, approve, send one at a time. No sequences, no auto-follow-up.

Cut: Full analytics dashboard, CRM pipeline view, REC team integration, batch scheduling, response detection. Add those in v2.1.

---

## Part 7: Key Product Decisions

### Decision 1: Two Panels vs One App

**Recommendation: Two distinct panels with shared backend.**

The coaches panel is a public marketing surface. The user dashboard is a private operations tool. These have different design languages, different auth models, and different success metrics. Trying to make them one app creates UX confusion.

### Decision 2: DM Automation Level

**Recommendation: Human-in-the-loop (review and approve every DM).**

Fully automated DM sending risks X account suspension, looks impersonal to coaches, and could violate X Terms of Service. The right model is AI-drafted, human-approved. Jacob's family should read and approve each DM before it sends. This also keeps the family engaged in the process.

### Decision 3: Content Generation Approach

**Recommendation: AI-assisted drafting with template library.**

Use Claude to generate post drafts from prompts and content pillars. Store templates in the existing `data/` directory. Family edits and approves before scheduling. Do not auto-generate and auto-publish without review.

### Decision 4: Analytics Depth

**Recommendation: Start simple, add depth later.**

v2.0 analytics: follower count over time, posts published, engagement rate, DMs sent/replied, coach profile views. That is enough. Do not build cohort analysis, funnel visualization, or A/B testing dashboards in v2.0. The schema supports all of this (tables already exist), but the UI can wait.

### Decision 5: REC Team Integration

**Recommendation: Keep the REC team as a chat tab in the dashboard.**

The 7-person virtual team is powerful but should not be the primary interface. Most daily operations (scheduling posts, reviewing DMs, checking coach status) should be through the dashboard UI, not through chat. The REC team is the power-user escalation path for complex questions.

---

## Part 8: Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| X API rate limits block DM sending | Medium | High | Implement strict rate limiting (10/day), batch sends across time windows |
| Video hosting costs escalate | Low | Medium | Use Supabase Storage with CDN; consider Cloudflare Stream for HLS |
| Scope creep from 35 existing pages | High | High | Phase 0 consolidation is mandatory; delete aggressively |
| Family does not adopt dashboard | Medium | High | Make the dashboard genuinely simpler than the current 35-page app |
| Coach panel performance on mobile | Medium | High | Performance budget: < 3s LCP on 4G; lazy-load all below-fold content |
| NCAA rule changes affect outreach | Low | Medium | Rules refresh workflow from 25x plan; source-backed claims only |

---

## Appendix: Files & References

### Existing Plans Referenced
- `/docs/plans/2026-03-09-recruit-redesign-design.md` -- FNL aesthetic system, section architecture
- `/docs/plans/2026-03-08-recruiting-intelligence-25x-plan.md` -- NCAA rules, timeline, 25-engine framework
- `/docs/plans/2026-03-08-operational-assessment.md` -- Current system state, verified working features

### Key Source Files
- `/src/lib/db/schema.ts` -- Full database schema (30+ tables)
- `/src/lib/rec/` -- REC virtual team system
- `/src/lib/alex/` -- AI agent logic (content engine, DM engine, coach ranker)
- `/src/lib/data/` -- Templates, schools, hooks, captions
- `/src/lib/intelligence/` -- Scoring engine, coach behavior, tweet patterns
- `/src/app/recruit/` -- Current coaches panel (FNL aesthetic)

### Susan Routing Intelligence
- **Recommended mode:** Design session
- **Recommended agents:** Atlas (operator), Marcus (UX), Nova (engineering), Coach-Outreach-Studio, Recruiting-Strategy-Studio
- **Evidence types used:** ux_research, business_strategy, emotional_design
