# Gamification & Engagement Mechanics — Recruiting Command Center

**Date**: 2026-03-12
**Author**: Quest (Gamification & Engagement Lead)
**Subject**: Jacob Rodgers — Class of 2029 OL, Pewaukee HS
**Primary User**: Mike (parent managing recruiting process)
**Design Principle**: Progression that reinforces agency, not dependency

---

## Design Philosophy

This is not a fitness app or a language-learning game. This is a parent managing a multi-year, high-stakes process for his son. The gamification must serve three functions:

1. **Legibility** — Make the opaque recruiting process feel structured and navigable
2. **Momentum** — Surface the right next action so effort compounds instead of scattering
3. **Confidence** — Show Mike that what he is doing is working, or flag when it is not

What this system must avoid:
- Shame mechanics that punish missed days instead of reinforcing completed ones
- Vanity badges that feel decorative rather than meaningful
- Pressure inflation that makes the dashboard feel like a second job
- Comparison systems that create anxiety rather than strategic awareness

The recruiting journey has a natural progression arc (freshman discovery through senior commitment) that is inherently game-like. The design should make that arc visible, not bolt a game on top of a spreadsheet.

---

## 1. Recruiting Readiness Score (0-100)

### What It Is

A single composite number that answers: "How recruiting-ready is Jacob right now?" This is the equivalent of an RPG character's power level — a legible summary that makes the complex simple.

### Score Components

| Category | Weight | Inputs | Why It Matters |
|----------|--------|--------|----------------|
| **Profile Completeness** | 15% | Bio quality, header image, pinned post, Hudl link, NCSA verified, recruit site live | Coaches check profiles before responding. Incomplete = invisible. |
| **Content Engine** | 20% | Posts per week (target 5-7), pillar balance (film/training/academic/camp/lifestyle), engagement rate, media quality | Consistent posting is the #1 signal that a recruit is serious. |
| **Coach Pipeline** | 25% | Coaches in DB, follow/follow-back ratio, DMs sent, response rate, pipeline stage distribution | The core work. More coaches at higher stages = higher readiness. |
| **Film & Measurables** | 20% | Hudl profile completeness, highlight reel recency, verified stats (height/weight/lifts), combine data | Film is what coaches evaluate. No film = no recruiting. |
| **Academic Standing** | 10% | GPA (3.25 current), NCAA eligibility, test scores (when available) | Academics gate eligibility. Below threshold = everything else is moot. |
| **Calendar & Timing** | 10% | Upcoming events registered, dead period awareness, camp registrations, NCAA timeline alignment | Doing the right things at the right time in the recruiting calendar. |

### Score Display

```
┌─────────────────────────────────────────┐
│  RECRUITING READINESS          72/100   │
│  ████████████████████░░░░░░░░  ▲ +4     │
│                                         │
│  Profile ████████░░  80                 │
│  Content ██████░░░░  62                 │
│  Pipeline ████████░░  78                │
│  Film     ███████░░░  68                │
│  Academic ████████░░  82                │
│  Timing   █████░░░░░  55                │
│                                         │
│  "Strong foundation. Content cadence    │
│   and camp registration are your        │
│   biggest unlock right now."            │
│                                         │
│  NEXT UNLOCK: Post 3 more times this    │
│  week to cross 75. (+3 projected)       │
└─────────────────────────────────────────┘
```

### Behavioral Design Notes

- The score always shows the **next unlock** — the single action that would move the number most. This prevents the feeling of "I don't know what to do next."
- The delta arrow (+4) shows weekly change. Seeing the number move reinforces that effort is working.
- The summary sentence below uses **coaching language**, not game language. "Strong foundation" not "Level up!"
- When the score drops, the language is diagnostic, not punitive: "Content cadence slowed this week — 2 posts vs. target 5" not "You're falling behind!"

### Ethical Boundary

The score must never create a false sense of urgency. A sophomore with a 55 readiness score is not "behind" — they are on a natural trajectory. The score contextualizes by class year: "55 is above average for a sophomore in March. Most recruits don't reach 70 until junior spring."

### Recovery Mechanic

If the score drops for 2+ consecutive weeks, the dashboard surfaces a "Reset Momentum" mission — a curated set of 3 quick wins that can move the needle within 48 hours. This prevents the dropout spiral where a parent sees a declining score and disengages from guilt.

---

## 2. Journey Progression: The Recruiting Timeline

### The Four Seasons

The recruiting process maps naturally to four phases. Each phase has its own identity, objectives, and unlock conditions.

```
SEASON 1              SEASON 2              SEASON 3              SEASON 4
FOUNDATION            VISIBILITY            ACCELERATION          COMMITMENT
Freshman              Sophomore             Junior                Senior
(2024-2025)           (2025-2026)           (2026-2027)           (2027-2028)
                          ▲
                      YOU ARE HERE
                      Mar 2026
```

### Phase Definitions

#### Season 1: Foundation (Freshman Year)
**Identity**: "Building the Base"
**Core Objectives**:
- Establish training documentation habit (730+ sessions)
- Create recruiting profile (NCSA, Hudl)
- Build initial film library
- Set academic baseline

**Milestone Markers**:
- [ ] First varsity snap
- [x] 500+ documented training sessions
- [x] Hudl profile created
- [x] NCSA profile verified
- [x] GPA above 3.0 NCAA threshold
- [x] First game film uploaded

**Status**: COMPLETED — All milestones achieved

#### Season 2: Visibility (Sophomore Year) -- CURRENT
**Identity**: "Getting on the Radar"
**Core Objectives**:
- Launch recruiting social presence (X account)
- Begin coach outreach pipeline
- Attend first camps
- Publish recruiting website
- Build content engine cadence

**Milestone Markers**:
- [x] X/Twitter recruiting account active
- [x] Recruiting website live (jacobrodgers.com/recruit)
- [x] First 50 coaches in database
- [x] First coach follow-back received
- [ ] First DM response from a coach
- [ ] First camp attended
- [ ] 100 coaches in database
- [ ] 25+ coaches at "Aware" stage or higher
- [ ] Content cadence: 5+ posts/week for 4 consecutive weeks
- [ ] Profile audit score reaches 8/10

**Completion**: 4/10 milestones (40%)

#### Season 3: Acceleration (Junior Year)
**Identity**: "Building Relationships"
**Core Objectives**:
- Convert awareness into conversations
- Attend multiple camps and combines
- Generate offers or preferred walk-on conversations
- Build film portfolio across full season
- Navigate NCAA contact periods

**Milestone Markers** (locked, visible as silhouettes):
- First official camp invite
- First coach phone call / Zoom
- First unofficial visit
- First official visit
- First offer (verbal)
- 10+ coaches at "Engaged" or "Recruiting" stage
- Junior highlight reel published
- SAT/ACT scores recorded

#### Season 4: Commitment (Senior Year)
**Identity**: "Making the Decision"
**Core Objectives**:
- Narrow school list
- Official visits
- Commitment decision
- Signing day

**Milestone Markers** (locked, shown as final destination):
- Official visit completed
- Commitment made
- National Letter of Intent signed
- Signing Day celebration

### Visual Design

The timeline appears as a horizontal progression bar on the Overview page, styled to match the dashboard's cinematic dark theme:

```
Foundation ──●── Visibility ──◐── Acceleration ──○── Commitment
 COMPLETE       40% COMPLETE       LOCKED            LOCKED
```

- Completed phases glow with the `--dash-gold` color (#D4A853)
- Current phase pulses subtly with `--dash-accent` (#ff000c)
- Future phases are shown in `--dash-muted` (#666666) with padlock icons
- Clicking any phase expands its milestone checklist

### Behavioral Design Notes

- Future milestones are **visible but locked** — this creates anticipation without pressure. The player can see where they are going without feeling overwhelmed by what they haven't done.
- Completed milestones are **permanent and celebrated** — they never un-complete. This protects the sense of accumulated progress.
- The phase names use identity language ("Building the Base," "Getting on the Radar") rather than task language ("Complete Profile," "Send DMs"). This connects the work to who Jacob is becoming, not just what needs checking off.

---

## 3. Weekly/Daily Missions

### Mission Architecture

Missions are the "what should I do today" system. They convert the recruiting process from an overwhelming ocean of possibilities into a focused set of 3-5 daily actions.

### Mission Types

#### Daily Missions (3 per day, auto-generated)

| Category | Example Missions | Points | Frequency |
|----------|------------------|--------|-----------|
| **Content** | "Post a training clip with #JacobRodgers79" | 10 | 1/day |
| **Outreach** | "Follow 3 new coaches from your Tier 2 list" | 15 | 1/day |
| **Pipeline** | "Review and approve 1 drafted DM" | 20 | 1/day |
| **Intel** | "Check which coaches viewed Jacob's profile today" | 5 | 1/day |
| **Maintenance** | "Update Jacob's latest lift numbers" | 10 | 1/week |

#### Weekly Missions (2-3 per week, curated)

| Category | Example Missions | Points | Unlock |
|----------|------------------|--------|--------|
| **Content Sprint** | "Publish 5 posts this week across 3+ pillars" | 50 | Unlocks "Consistent Creator" badge |
| **Coach Blitz** | "Send DMs to 5 new coaches this week" | 75 | Unlocks "Active Outreach" badge |
| **Film Drop** | "Upload new game film or highlight clip" | 40 | Advances Film readiness score |
| **Research** | "Add 10 new coaches to database with notes" | 30 | Grows pipeline breadth |

#### Bonus Missions (rare, high-value)

| Trigger | Mission | Points |
|---------|---------|--------|
| Camp approaching | "Register for [Camp Name] before deadline" | 100 |
| NCAA period change | "Review contact rules for new period" | 25 |
| Coach engagement spike | "A coach liked 3 of Jacob's posts — send a DM within 24h" | 50 |
| Milestone proximity | "You're 1 post away from 4-week content streak" | 30 |

### Mission Display

```
┌─────────────────────────────────────────┐
│  TODAY'S MISSIONS           2/3 done    │
│  ████████████████░░░░░░░░░              │
│                                         │
│  ✓ Post training clip         +10 pts   │
│  ✓ Review 2 DM drafts         +20 pts   │
│  ○ Follow 3 Tier 2 coaches    +15 pts   │
│                                         │
│  WEEKLY MISSION         3/5 posts done  │
│  "Content Sprint" ██████░░░░  60%       │
│                                         │
│  ⚡ BONUS: Coach Dan Murphy liked 3     │
│     posts. Send a DM within 24h. +50    │
└─────────────────────────────────────────┘
```

### Mission Generation Logic

Missions are not random. They are generated based on:

1. **Current readiness score gaps** — If Content is the lowest sub-score, content missions appear more frequently
2. **Pipeline state** — If there are 5 drafted DMs awaiting approval, "Review DMs" becomes the top mission
3. **Calendar proximity** — If a camp is 2 weeks away, registration and preparation missions surface
4. **Streak state** — If a content streak is at risk of breaking, the daily content mission gets elevated priority
5. **Staleness detection** — If 10 coaches haven't been engaged in 14+ days, re-engagement missions appear

### Behavioral Design Notes

- Missions are **completable within 10-15 minutes each**. Mike is a parent with a life. The system must never feel like a second job.
- The daily target is **3 missions, not 10**. Completion rate matters more than volume. Consistently completing 3/3 feels better than completing 5/10.
- Missions that go uncompleted for 3 days **rotate out without penalty**. No guilt accumulation.
- The "Bonus Mission" slot creates positive surprise without obligation. It fires only when real opportunity data (coach engagement spike) triggers it.

### Ethical Boundary

Mission frequency must never exceed what a parent can reasonably do in 20-30 minutes per day. If the system detects that missions are going uncompleted for a full week, it should reduce to 2 daily missions and surface a message: "Busy week? Here's what matters most."

---

## 4. Streak Mechanics

### Streak Design Philosophy

Streaks are the most powerful and most dangerous mechanic in gamification. They create consistency but also create guilt when broken. The design must follow one rule: **streaks protect identity, they do not create debt.**

This means:
- A 30-day streak should make Mike feel like "I'm the kind of parent who stays on top of this"
- A broken streak should NOT make Mike feel like "I failed and now I've lost everything"

### Streak Types

#### 1. Content Cadence Streak
**Trigger**: Publishing 1+ post per day (minimum 5 per week)
**Display**: Flame icon with day count
**Recovery**: 1 "rest day" per week does not break the streak (5/7 = maintained)

```
🔥 Content Streak: 12 days  (1 rest day remaining this week)
```

**Why this works**: Content consistency is the single most important behavior for recruiting visibility. This streak directly reinforces the highest-value action.

**Why rest days exist**: Real life intervenes. A parent who posts 5/7 days is doing exceptional work. Punishing the 2 missed days would be absurd.

#### 2. Pipeline Activity Streak
**Trigger**: Any coach pipeline action per day (follow, DM, note update, research)
**Display**: Handshake icon with day count
**Recovery**: Weekends do not count (Monday-Friday streak)

```
🤝 Pipeline Streak: 8 weekdays  (weekends don't count)
```

**Why weekday-only**: Coach outreach is professional work. Setting the expectation of 7-day-a-week pipeline management is unreasonable and would create burnout.

#### 3. Weekly Consistency Streak
**Trigger**: Completing all 3 daily missions on 5+ days in a week
**Display**: Shield icon with week count
**Recovery**: This is the "meta-streak" — it measures sustained commitment, not daily perfection

```
🛡 Consistency: 4 weeks running  (next: "Month of Momentum" badge)
```

### Streak Recovery System

When a streak breaks, the system does NOT reset to zero. Instead:

**Freeze Mechanic**: Every 7-day streak earns 1 "freeze day" that can retroactively protect a missed day. Maximum 3 freeze days banked.

**Graceful Degradation**: A broken streak shows the **best streak** alongside the current one:

```
Content Streak: 3 days  (personal best: 23 days)
```

**Recovery Mission**: After a streak break, the dashboard surfaces a "Rebuild Momentum" mission — a single high-impact action that restarts the streak and gives bonus points:

```
"Streak paused — no worries. Post one training clip today to restart. +25 bonus points."
```

### Streaks That Are Deliberately NOT Included

- **Login streak**: Logging in is not valuable behavior. Opening the app without doing anything is not progress.
- **Daily check-in streak**: This is a dark pattern that creates compulsive app opening without productive action.
- **Perfect week streak**: "Perfect" is the enemy of sustainable. The system rewards consistency, not perfection.

### Ethical Boundary

If a streak breaks and Mike does not return for 7+ days, the streak counter **disappears from the main view** and is replaced with: "Welcome back. Here's what happened while you were away." The system meets the user where they are, not where they left off.

---

## 5. Achievement System

### Achievement Design Philosophy

Achievements mark **real recruiting milestones**, not arbitrary engagement targets. Every achievement should correspond to something a recruiting coach or advisor would recognize as meaningful progress.

The taxonomy follows three tiers:
- **Bronze**: Process milestones (you did the work)
- **Silver**: Outcome milestones (the work produced results)
- **Gold**: Breakthrough milestones (something changed in Jacob's recruiting trajectory)

### Achievement Catalog

#### Profile & Foundation (Bronze)

| Achievement | Trigger | Description |
|-------------|---------|-------------|
| **Profile Complete** | All profile audit fields pass | "Every detail in place. Coaches see a pro." |
| **Film Room Open** | First Hudl highlight uploaded | "Lights, camera, film. The tape speaks." |
| **Digital Home** | Recruiting website goes live | "jacobrodgers.com/recruit is live. Coaches have a destination." |
| **NCSA Verified** | NCSA profile verified and complete | "On the official radar." |
| **The Database** | First 50 coaches entered in CRM | "50 coaches tracked. The pipeline has begun." |
| **Stat Sheet** | All measurables updated (height, weight, lifts, 40) | "The numbers don't lie." |

#### Content & Visibility (Bronze/Silver)

| Achievement | Trigger | Description |
|-------------|---------|-------------|
| **First Post** | First X/Twitter post published | "You're in the conversation now." |
| **Content Machine** | 25 total posts published | "25 posts. Consistency is recruiting currency." |
| **Pillar Balance** | Posts across all 5 content pillars | "Film, training, academic, camp, lifestyle — the full picture." |
| **Engagement Magnet** (Silver) | Post exceeds 5% engagement rate | "That post resonated. Coaches noticed." |
| **Viral Moment** (Silver) | Post exceeds 10K impressions | "Ten thousand eyes. The right ones are in there." |

#### Coach Outreach (Bronze/Silver/Gold)

| Achievement | Trigger | Description |
|-------------|---------|-------------|
| **First Follow** | First coach followed on X | "The outreach begins." |
| **Follow Back** (Silver) | First coach follows Jacob back | "A coach followed back. They're watching now." |
| **First Contact** | First DM sent to a coach | "Message sent. That took courage." |
| **The Reply** (Gold) | First DM response from a coach | "A coach responded. The conversation has started." |
| **Pipeline Builder** | 100 coaches in database | "100 programs, all tracked. This is how it's done." |
| **Relationship Builder** (Silver) | 10 coaches at "Engaged" stage or higher | "10 coaches are actively interested. Real momentum." |
| **The Conversation** (Gold) | First phone call or Zoom with a coach | "Voice to voice. This is where recruiting gets real." |

#### Camp & Exposure (Silver/Gold)

| Achievement | Trigger | Description |
|-------------|---------|-------------|
| **Camp Ready** | First camp registration completed | "Registered and ready to compete." |
| **Camp Veteran** (Silver) | 3+ camps attended | "Three camps, three chances to prove it live." |
| **Measured** (Silver) | First verified combine results recorded | "Official numbers on the board." |
| **The Invite** (Gold) | First coach-initiated camp invite | "A coach invited Jacob specifically. They want to see him." |

#### Recruiting Breakthroughs (Gold)

| Achievement | Trigger | Description |
|-------------|---------|-------------|
| **On the Board** | First school adds Jacob to recruiting board | "A program has Jacob on their board. This is real." |
| **The Visit** | First unofficial visit completed | "Walked the campus. Saw the facilities. Felt the fit." |
| **The Offer** | First offer received (verbal or written) | "An offer. All the work led here." |
| **Decision Made** | Commitment announced | "Committed. The journey has a destination." |

### Achievement Display

Achievements appear in a trophy case on the Overview page:

```
┌─────────────────────────────────────────┐
│  TROPHY CASE                 12/32      │
│                                         │
│  Recent:                                │
│  🥇 "The Reply" — Mar 8, 2026          │
│  🥈 "Follow Back" x 4 — Feb 22        │
│  🥉 "Content Machine" — Feb 15        │
│                                         │
│  Next unlock:                           │
│  ○ "Camp Ready" — Register for a camp   │
│  ○ "Pipeline Builder" — 83/100 coaches  │
└─────────────────────────────────────────┘
```

### Behavioral Design Notes

- Achievement descriptions use **identity-reinforcing language** — "This is how it's done" not "You earned 50 points."
- Gold achievements are **rare and emotionally significant**. A coach reply is a genuine breakthrough moment. The system should treat it with the gravity it deserves.
- The "next unlock" section creates **clear aspiration** without pressure. It answers "what am I working toward?"
- Achievements are never revoked. A coach who unfollows does not un-earn the "Follow Back" badge.

---

## 6. Coach Relationship Levels

### The Relationship Ladder

Every coach in the database has a relationship level that maps to real recruiting dynamics:

```
Level 0: UNKNOWN        Coach has not been contacted
Level 1: IDENTIFIED     Coach added to database with research notes
Level 2: AWARE          Jacob has followed the coach, or coach has seen content
Level 3: INTERESTED     Coach followed back, liked posts, or opened a DM
Level 4: ENGAGED        Active communication (DM thread, comments, replies)
Level 5: RECRUITING     Coach has initiated contact, invited to camp, or scheduled call
Level 6: OFFERED        Formal or verbal offer extended
```

### Level-Up Triggers

| Transition | Triggers | Auto/Manual |
|------------|----------|-------------|
| Unknown → Identified | Coach added to DB with school, title, handle | Auto |
| Identified → Aware | Jacob follows coach OR coach views profile | Auto |
| Aware → Interested | Coach follows back OR likes 2+ posts OR opens DM | Auto |
| Interested → Engaged | DM reply received OR sustained interaction (3+ touchpoints in 30 days) | Auto |
| Engaged → Recruiting | Coach initiates contact, camp invite, or phone call request | Manual (Mike confirms) |
| Recruiting → Offered | Offer extended | Manual (Mike confirms) |

### Visual in Coach CRM

Each coach row shows their level as a segmented progress bar:

```
Coach Dan Murphy — Wisconsin
[████████████░░░░░░░░]  Level 3: INTERESTED
  Followed back Mar 5 · Liked 2 posts · DM drafted

Coach John Smith — Iowa
[████████░░░░░░░░░░░░]  Level 2: AWARE
  Followed Mar 1 · No engagement yet
  ⚡ Suggestion: Like his recent post about spring practice
```

### Pipeline Summary

The Overview page shows a funnel aggregation of all coach levels:

```
COACH PIPELINE LEVELS

Unknown     ████████████████████████  127
Identified  ████████████████         38
Aware       ████████████             24
Interested  ████████                 11
Engaged     ████                      4
Recruiting  ██                        2
Offered     ░                         0

Conversion: Aware → Interested: 46%
            Interested → Engaged: 36%
```

### Level-Specific Actions

Each level surfaces contextual next actions:

| Level | Suggested Actions |
|-------|-------------------|
| Identified | "Follow this coach on X" |
| Aware | "Like their recent post" / "Send introductory DM" |
| Interested | "Send follow-up DM" / "Comment on their content" |
| Engaged | "Propose a phone call" / "Ask about camp dates" |
| Recruiting | "Schedule unofficial visit" / "Send updated film" |

### Behavioral Design Notes

- The levels map to **real recruiting dynamics**, not arbitrary engagement scores. A parent instantly understands what "Interested" means vs. "Engaged."
- Levels 5 and 6 require **manual confirmation** because these are high-stakes moments that Mike should verify. Auto-promoting a coach to "Recruiting" based on a misread signal would erode trust.
- The conversion percentages between levels create **strategic awareness** — if Aware-to-Interested is low, the system can surface a recommendation: "Your follow-to-follow-back rate is 22%. Industry average is 35%. Consider personalizing your profile bio."

---

## 7. Competitive Intelligence Display

### Design Philosophy

Competitive intel should create **strategic awareness**, not anxiety. The goal is: "Here's what the competitive landscape looks like and where Jacob stands" — not "You're losing to this kid."

### What to Show

#### Recruiting Activity Comparison (Anonymous Aggregate)

Show Jacob's activity level against the **average Class of 2029 OL recruit**, not named individuals:

```
RECRUITING ACTIVITY — CLASS OF 2029 OL

                    Jacob    Avg 2029 OL    Top 10%
Posts/Week          4.2      2.1            7.5
Coaches Tracked     183      ~40            300+
DMs Sent            12       ~5             50+
Film Clips          8        3              15+
Camps Planned       1        0.5            3+

Jacob is more active than 78% of Class of 2029 OL recruits.
```

#### Named Competitor Profiles (Opt-in, Research View)

Available in the Analytics section, not the main dashboard. Shows public data only:

```
COMPETITOR INTEL — Class of 2029 OL (Wisconsin Region)

Tyler Chen — 6'5" 290 — Brookfield Central
  X: @tylerchen_oline · 1.2K followers · 6 posts/week
  Signals: Wisconsin, Iowa, Minnesota interest
  Last activity: 2 days ago

[View 4 more competitors]
```

### What NOT to Show

- **Rankings or leaderboards against named competitors.** This creates comparison anxiety and has no actionable value for a parent. Mike cannot control what other recruits do.
- **"You're behind" messaging.** The system shows where Jacob stands in absolute terms, not relative loss framing.
- **Real-time competitor tracking.** Obsessive competitor monitoring is not a productive behavior to reinforce.

### Ethical Boundary

Competitor data is presented as market research, not as a scoreboard. The framing is always: "Here's what the landscape looks like so you can make informed decisions" — never "Here's who's beating you."

---

## 8. Progress Bars and Completion Indicators

### Where Progress Bars Appear

Progress bars should appear wherever there is a measurable journey from incomplete to complete. They must answer: "How far along am I and what's left?"

#### 1. Overview Page — Recruiting Readiness Score
- Main readiness score bar (0-100) with sub-category breakdowns
- Journey phase completion (e.g., "Visibility: 40% complete")

#### 2. Coach CRM — Individual Coach Cards
- Relationship level progress (6 segments)
- DM pipeline stage indicator

#### 3. Content Page — Weekly Content Target
```
THIS WEEK: 3/5 posts published
███████████████░░░░░░░░░░░  60%
Pillar coverage: Film ✓ Training ✓ Academic ○ Camp ○ Lifestyle ○
```

#### 4. Outreach Page — DM Campaign Progress
```
Spring Outreach Campaign: 12/30 coaches contacted
████████████░░░░░░░░░░░░░  40%
Responses: 3/12 (25% response rate)
```

#### 5. Profile Audit — Completeness Checklist
```
PROFILE AUDIT SCORE: 7/10
████████████████████░░░░░  70%
Missing: Pinned post ○  Header image update ○  Bio link ○
```

#### 6. Achievement Progress — Near-Complete Badges
```
ALMOST THERE:
Pipeline Builder    ████████████████████░  83/100 coaches
Content Machine     ████████████████░░░░░  19/25 posts
Camp Ready          ░░░░░░░░░░░░░░░░░░░░  Not started
```

#### 7. Mission Completion — Daily/Weekly
```
TODAY: 2/3 missions    ████████████████░░░░░░░░  67%
THIS WEEK: 12/15       ████████████████████░░░░  80%
```

### Progress Bar Visual Standards

All progress bars follow the dashboard's visual language:
- Background: `bg-white/[0.03]` (nearly invisible track)
- Fill color: Contextual (`--dash-accent` for primary, `--dash-success` for complete, `--dash-warning` for at-risk)
- Numbers: `font-jetbrains` monospace for precise data
- Completion: When a bar reaches 100%, it briefly pulses gold (`--dash-gold`) then settles

### Behavioral Design Notes

- Progress bars that are below 30% show the **next milestone** instead of the final goal. "3/10 toward your first 10" feels closer than "3/100 toward your century."
- Bars at 80%+ get a subtle **urgency accent** — not panic red, but a warm glow that signals "you're close."
- Every progress bar has a **text fallback** for accessibility: "3 of 5 posts published this week."

---

## 9. Momentum Indicators

### What Momentum Means in Recruiting

Momentum is the derivative, not the position. A readiness score of 60 that was 50 last week is high momentum. A readiness score of 75 that was 80 last week is stalling. The dashboard must distinguish between these states clearly.

### Momentum States

| State | Condition | Visual | Dashboard Behavior |
|-------|-----------|--------|-------------------|
| **Surging** | Readiness score increased 5+ points in 7 days | Green upward arrow, pulse animation | Celebrate: "Strong week. Momentum is building." |
| **Building** | Readiness score increased 1-4 points in 7 days | Green subtle arrow | Encourage: "Steady progress. Keep the cadence." |
| **Steady** | Readiness score unchanged (+/- 1 point) in 7 days | Neutral dash | Inform: "Holding steady. Here's what could move the needle." |
| **Cooling** | Readiness score decreased 1-4 points in 7 days | Yellow down arrow | Nudge: "Activity slowed this week. One post today restarts momentum." |
| **Stalling** | Readiness score decreased 5+ points OR no activity for 7+ days | Orange warning icon | Recover: "Let's get back on track. Here are 3 quick wins." |

### Momentum Display

A small momentum indicator sits next to the readiness score on the Overview page:

```
RECRUITING READINESS    72    ▲ BUILDING
                              +4 this week
```

### Momentum Drivers Panel

Below the score, a "What's Driving Momentum" panel shows the top 3 factors:

```
MOMENTUM DRIVERS

▲ +6  Content: 5 posts this week (vs. 2 last week)
▲ +3  Pipeline: 4 new coach follows, 1 follow-back
▼ -2  Film: No new clips uploaded in 14 days
━  0  Academic: GPA stable at 3.25
```

This makes momentum **legible and actionable**. Mike can see exactly what is working and what needs attention.

### Weekly Momentum Email/Notification

A weekly summary (opt-in) delivers:
- Readiness score change
- Top 3 momentum drivers
- One recommended action for next week
- Any coach engagement events worth noting

### Behavioral Design Notes

- Momentum language never uses the word "behind." The vocabulary is: building, cooling, steady, surging, stalling. These are descriptive, not judgmental.
- The "Stalling" state triggers a **recovery mission**, not a scolding. The system acts as a coach, not a critic.
- Momentum is calculated on a **rolling 7-day window**, not calendar week. This prevents the "Monday guilt" pattern where a user feels like they wasted the previous week.

---

## 10. Celebration Animations

### Celebration Design Philosophy

Celebrations should be **proportional to the achievement**. A first post gets a subtle confirmation. A coach reply gets a genuine moment. An offer gets something memorable. Disproportionate celebration (confetti for logging in) cheapens real milestones.

### Celebration Tiers

#### Tier 1: Micro-Confirmation (routine actions)
**Triggers**: Mission completed, post published, DM sent, coach followed
**Animation**: Subtle check mark animation + brief green flash on the action item
**Duration**: 0.5 seconds
**Sound**: None (optional subtle haptic on mobile)
**Frequency**: Multiple times per session

```css
/* Micro-confirmation: check mark draws itself */
.mission-complete {
  animation: checkDraw 0.4s ease-out, greenFlash 0.3s ease-out 0.2s;
}
```

#### Tier 2: Progress Milestone (achievement unlocked)
**Triggers**: Badge earned, streak milestone (7, 14, 30 days), weekly mission completed
**Animation**: Achievement card slides in from right with gold border, stays for 3 seconds, auto-dismisses
**Duration**: 3 seconds (dismissible)
**Sound**: None
**Frequency**: 2-5 times per week

```
┌───────────────────────────────────────┐
│  ★ ACHIEVEMENT UNLOCKED              │
│                                       │
│  "Content Machine"                    │
│  25 posts published.                  │
│  Consistency is recruiting currency.  │
│                                       │
│                          [Dismiss]    │
└───────────────────────────────────────┘
```

The card uses the `--dash-gold` (#D4A853) border and a subtle shine animation that sweeps across the card once.

#### Tier 3: Major Breakthrough (rare, significant)
**Triggers**: First coach reply, first camp invite, readiness score crosses 75/90
**Animation**: Full-width banner drops from top of dashboard with the achievement, pulsing red accent border. The readiness score counter animates upward to its new value.
**Duration**: 5 seconds (dismissible)
**Sound**: Optional (user preference)
**Frequency**: A few times per month at most

```
╔═══════════════════════════════════════════════════════════╗
║  ★★ BREAKTHROUGH                                        ║
║                                                           ║
║  "The Reply" — Coach Dan Murphy (Wisconsin) responded     ║
║  to Jacob's DM. The conversation has started.             ║
║                                                           ║
║  [View Conversation]              [Dismiss]               ║
╚═══════════════════════════════════════════════════════════╝
```

#### Tier 4: Defining Moment (once-in-a-journey)
**Triggers**: First offer received, commitment made, signing day
**Animation**: Cinematic full-screen moment. The dashboard background dims, a centered card appears with the school logo (if available), achievement name, and a brief message. The `--dash-gold` color saturates the card edges. A "Share" button allows exporting to X.
**Duration**: Persistent until dismissed
**Sound**: Optional
**Frequency**: 1-3 times in entire recruiting journey

This is the equivalent of a "credits roll" moment. It should feel like the end of a chapter, because it is.

### Celebration Anti-Patterns to Avoid

- **Confetti particles**: Feels juvenile for a parent managing a serious process. The dashboard's cinematic, dark aesthetic does not support cartoon celebrations.
- **Sound effects by default**: A parent checking the dashboard in a meeting does not want a chime.
- **Pop-up blockers**: Celebrations should never block workflow. Always dismissible, always non-modal.
- **Celebration for non-action**: Never celebrate logging in, opening a page, or viewing data. Celebrate doing.

### Behavioral Design Notes

- The celebration **tier maps to emotional weight**, not point value. A coach reply is emotionally bigger than posting 25 times, even if it has fewer "points."
- Tier 3 and 4 celebrations include a **narrative sentence** that connects the achievement to the bigger story. "The conversation has started" is more powerful than "Achievement unlocked."
- All celebrations are **stored in a timeline** accessible from the Trophy Case. Mike can scroll back through the journey's highlights — this creates a narrative of progress that reinforces identity.

---

## Implementation Priorities

### Phase 1: Foundation (Week 1-2)
1. Recruiting Readiness Score with sub-category breakdown
2. Journey progression timeline on Overview page
3. Coach relationship levels in CRM
4. Basic progress bars (content target, profile audit, pipeline)

### Phase 2: Engagement Loop (Week 3-4)
5. Daily/weekly mission system with auto-generation logic
6. Achievement system (Bronze tier)
7. Tier 1 and Tier 2 celebration animations
8. Momentum indicator on Overview page

### Phase 3: Depth (Week 5-6)
9. Streak mechanics with freeze days and recovery
10. Achievement system (Silver and Gold tiers)
11. Competitive intelligence panel (aggregate view)
12. Tier 3 celebration animations

### Phase 4: Polish (Week 7-8)
13. Weekly momentum email/notification
14. Bonus mission triggers
15. Tier 4 cinematic celebrations
16. Trophy case timeline view

---

## Measurement Plan

### Success Metrics

| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|
| Weekly active days | Unknown | 5/7 days | Dashboard login + action taken |
| Mission completion rate | N/A | 70%+ daily missions completed | Mission tracking |
| Content cadence | ~3 posts/week | 5+ posts/week sustained | Post publication data |
| Coach pipeline velocity | Flat | 5+ new coaches advanced per week | CRM level changes |
| Streak retention | N/A | 60%+ maintain 7+ day streaks | Streak tracking |
| Readiness score trend | Starting point | Consistent upward over 90 days | Weekly score snapshots |

### Disconfirming Signals (When to Pull Back)

| Signal | What It Means | Response |
|--------|---------------|----------|
| Opens increase but actions stay flat | Gamification drives checking, not doing | Reduce notification frequency, simplify missions |
| Streak breaks followed by 7+ day absence | Streak guilt is causing disengagement | Add more freeze days, remove streak from main view |
| Mission completion at 95%+ but readiness flat | Missions are too easy or misaligned with real progress | Increase mission difficulty, recalibrate readiness inputs |
| Readiness score fixation (checking 5x/day) | Score anxiety, not productive engagement | Add "score updates weekly" option, reduce real-time recalculation |
| Competitor panel viewed 3x+ more than own pipeline | Comparison anxiety dominating behavior | Move competitor intel to separate page, add friction |

---

## Technical Integration Points

### Existing Data Sources

| Gamification Component | Data Source | API/Table |
|------------------------|------------|-----------|
| Readiness Score — Content | Posts table | `GET /api/posts` |
| Readiness Score — Pipeline | Coaches table | `GET /api/coaches` |
| Readiness Score — Profile | Profile audit | `ProfileAudit` type |
| Readiness Score — Film | Hudl integration | `HudlProfile` type |
| Readiness Score — Academic | Static config (GPA, NCAA status) | Athlete profile |
| Coach Levels | Coach follow/DM status | `Coach.followStatus`, `Coach.dmStatus` |
| Content Streaks | Post timestamps | `Post.updatedAt` where `status === "posted"` |
| Achievements | Composite triggers across tables | New `achievements` table needed |
| Missions | Generated from readiness gaps + pipeline state | New `missions` table needed |
| Momentum | Readiness score snapshots over time | New `readiness_snapshots` table needed |

### New Database Tables Required

```sql
-- Achievement tracking
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  achievement_key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold')),
  unlocked_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'
);

-- Mission tracking
CREATE TABLE missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 10,
  mission_type TEXT NOT NULL CHECK (mission_type IN ('daily', 'weekly', 'bonus')),
  status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'expired')),
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);

-- Readiness score snapshots for momentum calculation
CREATE TABLE readiness_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  overall_score INTEGER NOT NULL,
  profile_score INTEGER NOT NULL,
  content_score INTEGER NOT NULL,
  pipeline_score INTEGER NOT NULL,
  film_score INTEGER NOT NULL,
  academic_score INTEGER NOT NULL,
  timing_score INTEGER NOT NULL,
  snapshot_date DATE NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Streak tracking
CREATE TABLE streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  streak_type TEXT NOT NULL CHECK (streak_type IN ('content', 'pipeline', 'consistency')),
  current_count INTEGER NOT NULL DEFAULT 0,
  best_count INTEGER NOT NULL DEFAULT 0,
  freeze_days_available INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  started_at TIMESTAMPTZ,
  broken_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Component Architecture

```
src/components/dashboard/
  gamification/
    readiness-score.tsx        # Composite score display with sub-categories
    journey-timeline.tsx       # Four-season progression bar
    mission-panel.tsx          # Daily/weekly mission list
    streak-display.tsx         # Streak counters with recovery UI
    achievement-card.tsx       # Individual achievement with animation
    trophy-case.tsx            # Achievement collection view
    momentum-indicator.tsx     # Momentum state badge
    momentum-drivers.tsx       # What's driving momentum panel
    coach-level-bar.tsx        # 6-segment relationship progress
    progress-bar.tsx           # Reusable progress bar component
    celebration-banner.tsx     # Tier 2-4 celebration overlays
    competitor-comparison.tsx  # Aggregate activity comparison

src/lib/gamification/
    readiness-calculator.ts    # Score computation logic
    mission-generator.ts       # Mission auto-generation from state
    streak-engine.ts           # Streak tracking with freeze logic
    achievement-engine.ts      # Achievement trigger evaluation
    momentum-calculator.ts     # Momentum state from snapshots
    celebration-triggers.ts    # When to fire which celebration tier
```

---

## Final Notes

This system is designed for a parent who loves his son and wants to give him the best possible chance. The mechanics should make Mike feel competent, informed, and in control — never anxious, behind, or addicted. Every decision in this document was tested against a simple question: **Would this mechanic still feel ethical and useful after a year of daily use?**

The recruiting journey is inherently motivating. Jacob is talented, the family is committed, and the trajectory is real. The gamification system's job is to make that trajectory visible and the process manageable — not to manufacture artificial urgency where none exists.
