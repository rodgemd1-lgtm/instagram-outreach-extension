# v5 Command Center Product Vision
# The Bloomberg Terminal for Recruiting

**Date:** 2026-03-12
**Author:** Compass (Product Manager)
**Subject:** Jacob Rodgers, Class of 2029 OL, Pewaukee HS, Wisconsin
**Primary User:** Mike Rodgers (parent-operator)
**Secondary Beneficiary:** Jacob Rodgers (athlete)
**Status:** North Star Vision Document

---

## 1. v5 Vision (North Star)

### The Picture

Open the v5 Command Center on a Monday morning in September 2029. Jacob is a senior. The dashboard knows this is Week 4 of his final season, that he has 11 active scholarship offers, that two coaching staffs watched his film over the weekend, and that his relationship with the Wisconsin offensive line coach has warmed significantly based on three signals detected in the last 72 hours.

The screen does not look like a dashboard. It looks like a mission control center for the most important decision of a young man's athletic life.

The top of the screen shows a single sentence: **"Wisconsin's interest level spiked this weekend. Your official visit is in 9 days. Here is what to prepare."**

Below that, every module is alive. The Coach CRM shows relationship health scores pulsing in real time -- some warming, some cooling. The Film Intelligence panel has auto-tagged 47 plays from Friday's game and surfaced the 6 plays that match Wisconsin's zone-blocking scheme. The Content Engine has drafted three posts calibrated to the recruiting moment -- one training clip, one game highlight, one character-signal post -- all waiting for Mike's one-tap approval. The Outreach module shows that a follow-up message to the Wisconsin OL coach is pre-drafted based on the specific film the coach watched, and it recommends sending at 7:14 AM CT on Tuesday because that is when this particular coach has historically been most responsive.

The Analytics panel does not show vanity metrics. It shows a Commitment Decision Matrix where 11 schools are scored against weighted criteria that Jacob and Mike defined together 18 months ago. It shows that three schools are within 5 points of each other on the composite score and flags the specific dimension where they diverge: coaching staff stability.

In the bottom corner, the REC Team is not a chatbot. It is a situation room. Each of the 7 AI team members has a status indicator showing what they are actively working on. Nina has just finished enriching the latest coach interaction data. Trey has queued content for the week. Marcus has updated the NCAA calendar with this week's contact period rules. Sophie has run the weekly competitive intelligence sweep and flagged that a competing OL recruit just decommitted from Michigan State.

The entire experience is dark, cinematic, and precise -- the same visual DNA as Jacob's recruit website, but optimized for operational velocity. Every pixel serves a decision. Every interaction reduces time-to-action. Every screen answers the question: **What is the single most important thing to do right now, and why?**

This is not a dashboard. It is a recruiting operating system with the visual authority of a Bloomberg Terminal and the emotional intelligence of a trusted advisor.

### The One-Line Vision

**The v5 Command Center is where a 4-year recruiting story converges into one clear decision, supported by compounded intelligence that no other family on earth has access to.**

---

## 2. Core Experience Pillars

Five pillars define every design decision, every feature priority, and every quality gate in v5. If a feature does not serve at least two of these pillars, it does not belong.

### Pillar 1: Intelligence Over Information

The dashboard never presents raw data without interpretation. Every number has a "so what." Every trend has a recommended action. Every status change has context explaining why it matters right now.

- v0.1 shows "Coaches in DB: 183." v5 shows "4 coaches showed new interest this week. 2 match your top-tier criteria. Recommended: send film to Coach Torres (Wisconsin) and Coach Adams (Iowa) before Friday."
- v0.1 shows a bar chart of engagement. v5 shows "Your film content drives 3.2x more coach views than training content. Your next post should be the zone-blocking cutup from Week 3."
- v0.1 shows a CRM table. v5 shows a relationship health map where each coach is a node whose size represents fit score and whose color represents relationship warmth, pulsing when new signals arrive.

The intelligence layer is not a separate module. It is the connective tissue between every module.

### Pillar 2: Temporal Awareness

The dashboard understands where Jacob is on the recruiting timeline and adapts every surface accordingly. The same dashboard looks and behaves differently during sophomore evaluation season, junior camp circuit, senior commitment period, and post-commitment transition.

- Navigation labels change: "Prospecting" becomes "Active Pursuit" becomes "Decision Mode"
- Module emphasis shifts: Content Engine is primary in sophomore year, Coach CRM in junior year, Decision Matrix in senior year
- The recruiting calendar is not a static widget -- it is the structural spine of the entire experience, with NCAA contact periods, dead periods, camp dates, official visit windows, and signing day countdowns woven into every module

### Pillar 3: Supervised Autonomy

The system operates on a spectrum from "suggest" to "prepare" to "execute with approval." Mike and Jacob define the guardrails. The AI team works within them.

- Low-stakes actions (drafting a social post, enriching a coach profile, tagging film) happen automatically with a notification
- Medium-stakes actions (scheduling outreach, updating the school list ranking, recommending a visit) are prepared and presented for one-tap approval
- High-stakes actions (commitment communications, official visit requests, responding to an offer) require explicit multi-step confirmation with a family review gate

The goal: Mike spends 15 minutes per day on recruiting operations, not 2 hours. The system does the other 1 hour 45 minutes.

### Pillar 4: Cinematic Precision

The dashboard shares visual DNA with the recruit website -- the same dark palette, the same typographic hierarchy, the same motion language, the same emotional temperature. A coach who visits Jacob's recruit website and then somehow sees the dashboard should feel the same brand. A family that uses the dashboard daily should feel the same level of craft as a film studio's internal production tools.

- Every component follows the established design system: `#000000` backgrounds, `#0A0A0A` surfaces, `#ff000c` accent, warm gold for achievements, JetBrains Mono for data, condensed sans for headings
- Animation is purposeful: data arriving, states changing, attention directing -- never decorative
- Information density is high but never cluttered. The model is a Bloomberg terminal, not a social media feed. Dense data with clear hierarchy.

### Pillar 5: Compounded Memory

The dashboard gets smarter every week because it remembers everything. Every coach interaction, every film performance, every post engagement, every measurable improvement, every camp result, every visit note -- it all accumulates into a longitudinal intelligence asset that cannot be replicated by any platform that starts later.

- The "4-Year Story" is not a feature. It is the product's fundamental architecture.
- Any module can reference historical data: "Coach Torres has opened 7 of your last 9 messages. His average response time is 4.2 hours. He has viewed your full-game film 3 times."
- The system detects trajectory patterns that no human would spot: "Your pass protection grade has improved 22% over the last 3 seasons. Programs that value development over raw talent are 40% more likely to offer based on historical patterns."

---

## 3. Module Redesign

### Module 1: Command Center (Overview) -- "Mission Control"

**v0.1 state:** 4 stat cards, static action items, hardcoded events, quick links.

**v5 state:** An adaptive briefing screen that changes daily and contextually.

**Layout redesign:**
- **Top: Daily Intelligence Brief** -- A single paragraph written by the AI summarizing what happened, what matters, and what to do today. Updated every morning. Example: "2 coaches viewed your profile over the weekend. Your relationship with Wisconsin is warming. Today: approve the DM draft to Coach Torres and review the 3 posts Trey queued for this week."
- **Row 1: Live Pulse Metrics** -- 4-6 metric tiles showing real-time status. Not static numbers but animated pulse indicators. Each tile shows current value, trailing trend (sparkline), and a one-word status signal (Rising, Stable, Cooling, Urgent). Metrics adapt to the recruiting phase:
  - Sophomore: Profile Completeness, Content Cadence, Schools Researched, Film Clips Tagged
  - Junior: Active Coach Relationships, Outreach Response Rate, Camp Registrations, Offer Probability Index
  - Senior: Offers Received, Decision Matrix Score Spread, Visit Calendar Fill, Commitment Readiness
- **Row 2: Action Stream** -- A prioritized list of the 3-5 most important actions, each with a one-tap execution path. Not "Review drafts" but "Approve this specific DM to Coach Torres [Preview] [Send] [Edit]." Actions are ranked by a priority algorithm weighing urgency, impact, and decay.
- **Row 3: Timeline Rail** -- A horizontal timeline showing the next 90 days of recruiting events, NCAA calendar markers, and platform milestones. Scrollable. Zoomable. Clickable to drill into any date.
- **Row 4: Intelligence Feed** -- A reverse-chronological feed of system-detected signals: coach profile views, competitor movements, content performance spikes, relationship status changes. Each item is tagged with source, confidence level, and recommended response.

**New capabilities:**
- Morning brief auto-generated by Devin (orchestrator agent)
- Action items with inline execution (approve, send, schedule without navigating away)
- Adaptive metric tiles that change based on recruiting phase
- 90-day forward-looking timeline with event clustering

### Module 2: Coach Intelligence Center (Coach CRM) -- "The War Room"

**v0.1 state:** Sortable table with filters. Slide-over detail panel. Static data.

**v5 state:** A living relationship intelligence system.

**Layout redesign:**
- **Primary View: Relationship Map** -- A force-directed graph visualization where each coach is a node. Node size = fit score. Node color = relationship warmth (cold blue to hot red gradient). Distance from center = likelihood of offer. Nodes pulse when new signals arrive. Click a node to open the coach dossier. This is the view Mike looks at to understand the full landscape at a glance.
- **Secondary View: Table** -- The current table view, upgraded with inline editing, bulk actions, and a "Stale Alert" column showing days since last meaningful interaction.
- **Tertiary View: Pipeline** -- A horizontal pipeline showing coaches segmented by stage: Research > First Contact > Building > Active > Warm > Hot > Offered. Drag coaches between stages. Each stage shows conversion rate from the previous stage.

**Coach Dossier (expanded from slide-over):**
- Full-page takeover with 4 tabs:
  - **Profile**: School, conference, division, scheme, roster needs, coaching tenure, staff stability score, program culture signals
  - **Relationship**: Complete interaction timeline, communication preference model (when they respond, how they communicate, what topics engage them), relationship health score with trend
  - **Fit Analysis**: Scheme fit score (does Jacob's skill set match their blocking system?), roster need score (how badly do they need an OL in 2029?), academic fit (does Jacob meet their admission standards?), geographic/cultural fit
  - **Intelligence**: Recent Twitter/X activity from the coach, recent program news, offer board (who else have they offered at OL?), commitment/decommitment signals

**New capabilities:**
- Coach personality modeling (NLP on past interactions to detect communication preferences)
- Automated relationship decay alerts with recommended re-engagement actions
- Scheme-aware fit scoring (zone vs. gap/power match percentage)
- Roster need tracking with graduation timeline projections
- Coach-specific outreach timing optimization

### Module 3: Outreach Operations -- "Signal Ops"

**v0.1 state:** Kanban board (Drafted, Approved, Sent, Responded). DM composer with templates.

**v5 state:** A multi-channel orchestration engine with sequence intelligence.

**Layout redesign:**
- **Primary View: Active Sequences** -- Each coach in the outreach pipeline is shown as a sequence card displaying the full 4-step outreach plan: Intro > Follow-up > Value Add > Soft Close. Each step shows status (completed, scheduled, pending), the message preview, and the result (opened, responded, no response). The visual is a horizontal timeline per coach, stacked vertically, sorted by priority.
- **Secondary View: Message Queue** -- All pending messages across all coaches, sorted by recommended send time. One-tap approve/edit/defer.
- **Composer Upgrade:**
  - AI drafts are personalized using the coach personality model, recent coach activity, and Jacob's latest film/performance data
  - Each draft shows a "Personalization Score" (0-100) measuring how customized the message is to this specific coach
  - Multi-channel support: X DM, email, recruiting questionnaire form submission, phone call prep notes
  - Response prediction: "Based on this coach's patterns, estimated response probability: 62%. Best send time: Tuesday 7:14 AM CT"

**New capabilities:**
- Multi-channel outreach (not just X DMs -- email, form fills, phone call guides)
- Coach-specific send-time optimization based on historical response patterns
- Sequence intelligence (auto-adjust follow-up timing and tone based on coach behavior)
- Response prediction scoring
- A/B testing of message approaches with performance tracking
- Family review gate with approval workflow

### Module 4: Content Studio -- "The Newsroom"

**v0.1 state:** Month calendar with post pills. Post composer with pillar selector.

**v5 state:** A multi-platform content production and distribution system.

**Layout redesign:**
- **Primary View: Content Calendar** -- Same month grid but now shows posts across all platforms (X, Instagram, TikTok, Threads) with platform icons. Each day cell shows a content density indicator. Click to expand day view showing all scheduled content with platform, pillar, and status.
- **Secondary View: Content Studio** -- A production workspace where posts are created. Split-screen: left side is the composer, right side is a live preview showing how the post will render on each platform. AI suggests optimal posting times, hashtags, and content format per platform.
- **Tertiary View: Performance Board** -- A content analytics surface showing which posts drove coach engagement (not just likes -- actual coach profile views, DM opens, or website visits within 24 hours of posting).

**Content Intelligence:**
- The system learns which content types drive recruiting outcomes (not just engagement). "Film clips posted on Tuesdays generate 2.7x more coach profile views than training clips posted on Fridays."
- AI-generated content calendar suggestions: "This week you should post: 1 zone-blocking cutup from Week 3 (optimized for Wisconsin/Iowa coaches), 1 training progression showing squat improvement, 1 character post about team leadership. Here are drafts."
- Pillar balance monitoring with automatic rebalancing suggestions
- Competitor content analysis: "3 competing Class of 2029 OL prospects posted combine results this week. Recommended response: post your updated measurables with trend data showing improvement trajectory."

**New capabilities:**
- Multi-platform publishing (X, Instagram, TikTok, Threads)
- Platform-native format adaptation (text for X, carousel for Instagram, short-form video for TikTok)
- Coach-engagement-attributed content analytics (which posts drive real recruiting outcomes)
- AI content drafting with recruiting-context awareness
- Competitor content monitoring and response strategy

### Module 5: Analytics and Intelligence -- "The Situation Room"

**v0.1 state:** Stat row, bar chart by pillar, pipeline funnel, recent activity feed.

**v5 state:** A multi-layered intelligence system combining recruiting analytics, athletic development tracking, competitive intelligence, and decision support.

**Layout redesign -- 4 sub-tabs:**

**Tab 1: Recruiting Dashboard**
- **Offer Probability Index**: A proprietary composite score (0-100) showing Jacob's overall recruiting trajectory. Components: coach relationship quality, film quality rating, measurable competitiveness, outreach effectiveness, content reach. Trend line showing weekly progression.
- **Pipeline Health**: Funnel visualization with conversion rates between stages and comparison to benchmarks. "Your outreach-to-response rate (18%) is above the Class of 2029 OL average (12%)."
- **Signal Detection Feed**: Real-time feed of detected recruiting signals: coach profile views, social media interactions, roster changes at target schools, competing recruit movements.

**Tab 2: Athletic Development**
- **Measurables Dashboard**: Longitudinal charts showing every tracked measurable over time. Height, weight, body composition, squat, bench, clean, 40, shuttle, broad jump, vertical. Each chart shows Jacob's trajectory, the target range for P4 OL recruits, and the pace required to hit targets by senior year.
- **Film Performance**: Season-by-season and game-by-game performance metrics. Pass protection grade, run blocking grade, technique scores by play type.
- **Camp Results**: Performance data from every camp attended, compared to other attendees where available.
- **Development Narrative**: AI-generated summary of Jacob's athletic development story optimized for coach consumption. "Jacob has gained 45 lbs of muscle while improving his shuttle time by 0.3 seconds over 3 years, demonstrating that his weight gain is functional, not passive."

**Tab 3: Competitive Intelligence**
- **Class of 2029 OL Landscape**: Every Class of 2029 OL prospect at schools Jacob is targeting, with their offer status, measurables, and commitment timeline. Matrix showing where Jacob stands relative to competitors at each target school.
- **Offer Board Tracker**: Which schools have offered which OL prospects. Patterns: "Iowa has offered 3 OL prospects this cycle. All three run zone schemes. Two are from the Midwest."
- **Decommitment Monitor**: Real-time tracking of commitments and decommitments at target schools. When a committed OL decommits from a target school, the system immediately flags the opportunity.

**Tab 4: Commitment Decision Matrix** (activates junior/senior year)
- **Criteria Builder**: Family-defined decision criteria with adjustable weights: coaching stability, scheme fit, academic program, playing time opportunity, geographic preference, NIL potential, campus culture, depth chart position.
- **School Comparison**: Side-by-side comparison of all schools with active offers, scored against the weighted criteria. Heat map showing where each school excels and where it falls short.
- **Decision Confidence Indicator**: AI assessment of how well-informed the family is about each option. "You have strong data on Wisconsin and Iowa but limited information about Michigan State's coaching stability. Recommended: ask these 3 questions on your official visit."
- **Bias Detection**: Alerts when the family's behavior suggests cognitive bias. "You have spent 3x more time researching Wisconsin than other schools with similar fit scores. This may indicate anchoring bias. Consider scheduling equal-length visits to your top 3."

### Module 6: REC Team -- "The War Cabinet"

**v0.1 state:** Team member grid, chat interface, task queue, NCSA leads kanban.

**v5 state:** A mission coordination center where the 7-person AI team operates as a visible, accountable staff.

**Layout redesign:**
- **Primary View: Team Status Board** -- A horizontal strip showing each team member with their current status (Active, Working, Idle), their current task, and their last completed action. One-click to enter chat with any member.
- **Briefing Mode**: A weekly team briefing where each member presents their summary. "Nina: 4 new coach interactions logged, 2 relationship scores improved. Trey: 5 posts published, engagement up 12%. Marcus: NCAA dead period starts Friday, shift outreach to email. Sophie: Competing OL prospect decommitted from Michigan State, recommend outreach to their OL coach." This replaces scrolling through 7 individual chats.
- **Task Board**: A unified task view showing all assigned and completed tasks across all team members. Filterable by member, status, priority, and date.
- **Direct Chat**: Same SSE streaming chat, but upgraded with contextual awareness. When you chat with Nina about Coach Torres, she already has the full coach dossier loaded and can reference specific interactions, fit scores, and recommended actions.

**New capabilities:**
- Automated weekly team briefing (AI-generated summary of all team activity)
- Cross-member task dependencies (Trey waits for Jordan's film clip before drafting the post)
- Proactive team member engagement (Nina messages you: "Coach Torres just viewed your profile. Want me to draft a follow-up?")
- Performance accountability (which team members are producing the highest-value actions?)

### New Module 7: Film Vault -- "The Archive"

A dedicated module for film management that does not exist in v0.1.

- **Full Game Film Library**: Every game, tagged by season, opponent, and outcome
- **Auto-Tagged Play Index**: Every snap Jacob plays, auto-tagged with play type, technique grade, and outcome
- **Scheme-Tagged Cutups**: AI-generated cutup reels optimized for specific coaching schemes (zone reel, gap/power reel, pass pro reel)
- **Coach-Specific Film Packages**: Pre-built film presentations customized to what each coach cares about, ready to send with one click
- **Film Comparison**: Side-by-side view of the same play type across seasons showing technique improvement
- **90-Second Coach View**: AI-generated highlight formatted for the way coaches actually evaluate -- key metrics, 8-10 tagged plays, technique assessment, zero filler

### New Module 8: Recruiting Calendar -- "The Timeline"

An upgraded, standalone calendar module that is the structural spine of the recruiting experience.

- **4-Year Timeline View**: The full Class of 2029 recruiting journey from freshman year to signing day, showing NCAA-mandated periods, key dates, and platform milestones
- **90-Day Operational View**: The next 90 days with all scheduled outreach, content, visits, camps, and deadlines
- **Weekly Execution View**: This week's action plan with morning-brief integration
- **NCAA Rule Engine**: Automatically overlays contact periods, dead periods, evaluation periods, and quiet periods based on current NCAA rules for Division I, II, III, and NAIA. Alerts when an action would violate a contact period.
- **Event Intelligence**: For each camp, visit, or showcase, the system provides a pre-event briefing (who will be there, what to prepare, what to wear) and a post-event debrief template

### New Module 9: Development Lab -- "The Proving Ground"

Athletic development tracking that bridges the weight room to the recruiting profile.

- **Measurables Dashboard**: Real-time tracking of every OL-specific measurable with trend lines and target ranges
- **Strength Progression Curves**: Squat, bench, clean, deadlift tracked over time with trajectory projections
- **Combine Prep**: Countdown to scheduled combines and camps with training recommendations based on current numbers vs. targets
- **Body Composition Tracking**: Weight, estimated lean mass, and power-to-weight ratio over time
- **Injury and Recovery Log**: Confidential tracking of any injuries, recovery timelines, and return-to-play status
- **Verified Data Badges**: When measurables are confirmed by a certified strength coach or at a sanctioned event, they receive a "Verified" badge that appears on the public recruit profile

---

## 4. Intelligence Layer

AI should not be confined to a chat window. It should be embedded in every surface, every interaction, every decision point.

### 4.1 Predictive Intelligence

**Offer Probability Engine**
- ML model scoring the probability (0-100%) of receiving an offer from each target school
- Inputs: roster needs, graduation timelines, historical offer patterns, coach engagement signals, scheme fit, academic eligibility, geographic recruiting patterns
- Updated weekly with new signals
- Displayed as a confidence-banded range, not a false-precision single number: "Wisconsin: 45-65% offer probability (moderate confidence). Key variable: whether they sign a portal OL this spring."

**Relationship Trajectory Modeling**
- For each coach relationship, predict where the relationship will be in 30/60/90 days based on current engagement velocity
- Alert when a relationship is projected to cool below a threshold: "At current pace, your relationship with Coach Adams will be inactive by April. Recommended action: send updated film before March 20."

**Content Performance Prediction**
- Before a post is published, estimate its performance based on historical data, posting time, content type, and current recruiting context
- "This film clip posted at 7:30 AM Tuesday is projected to generate 2-4 coach profile views based on similar past posts."

### 4.2 Contextual Intelligence

**Smart Context Panels**
- Every data point in the dashboard has a hover/click context layer explaining what it means, why it matters, and what to do about it
- Coach CRM example: hovering over a coach's "Scheme Fit: 78%" shows "This coach runs a wide-zone scheme. Jacob's lateral agility (4.65 shuttle) is in the 72nd percentile for this scheme type. His pull mechanics grade (B+) matches their system. Gap: his reach-block technique needs improvement for their outside zone concepts."

**Cross-Module Intelligence**
- When viewing a coach in the CRM, the system automatically surfaces: relevant content to share with this coach, optimal contact timing, competing recruits this coach is evaluating, and the most effective message approach based on the coach's personality model
- When drafting content, the system knows which coaches are most active right now and suggests content optimized to catch their attention

**Anomaly Detection**
- The system monitors all data streams for unusual patterns and alerts proactively
- "Coach Torres viewed your profile 5 times in the last 48 hours. This is 3x his normal frequency. High probability of pending outreach."
- "Your engagement rate dropped 40% this week. Analysis: you posted 0 film clips. Film content drives 73% of your coach engagement."

### 4.3 Decision Intelligence

**Bias Detection Engine**
- Monitors the family's behavior for known cognitive biases that damage recruiting decisions
- Anchoring: "You have spent disproportionate time researching the first school that showed interest. Consider equal evaluation of your top 5."
- Status Quo Bias: "New data suggests your #3 school may be a better fit than your #1, but you have not updated your rankings in 45 days."
- Hyperbolic Discounting: "This school's 'decide by Friday' deadline is not typical of their historical offer patterns. 87% of similar deadlines in our data were extended."

**Decision Readiness Assessment**
- Before commitment conversations, the system evaluates whether the family has sufficient information to make a confident decision
- "You are missing key data on 2 of your top 5 schools: Michigan State coaching staff stability (no data) and Iowa depth chart projection (outdated). Recommended: gather this before narrowing your list."

### 4.4 Communication Intelligence

**Message Optimization**
- Every outreach message is scored on personalization, tone, timing, and relevance
- "This message scored 72/100. Improvement suggestions: reference Coach Torres's recent tweet about spring practice (adds recency), mention your Week 3 film performance (adds specificity), shorten the message by 40% (matches this coach's preference for brief communication)."

**Response Pattern Analysis**
- Track how each coach communicates: message length preference, response latency, preferred topics, formality level
- Auto-adapt message drafts to match each coach's communication style
- "Coach Adams prefers short, direct messages (avg response to messages under 100 words: 67%. Over 200 words: 23%)."

---

## 5. Real-Time Operations

The dashboard must feel like a live operations center, not a static report that you refresh.

### 5.1 Live Data Streams

**Activity Pulse**
- A persistent, subtle status bar at the top of every screen showing real-time platform activity
- "Last signal: Coach Torres viewed your profile 12 minutes ago"
- "System status: All 7 team members active. 3 tasks in progress."
- The pulse indicator uses a heartbeat animation when activity is detected, fading to a steady glow during quiet periods

**Real-Time Signal Detection**
- WebSocket connection to the intelligence engine detecting:
  - Coach profile views on the recruit website (from analytics)
  - Social media mentions and interactions
  - Roster changes at target schools (from scraping)
  - Competitor recruit movements (from public sources)
  - Content performance spikes (from platform APIs)
- Each signal appears in the Intelligence Feed with a confidence level and recommended action

### 5.2 Operational Rhythm

**Morning Brief (Auto-Generated)**
- Every day at 6:00 AM, the system generates a personalized morning brief
- "Today: Tuesday, September 16, 2029. Week 4 of senior season. 3 actions queued. Wisconsin OV in 9 days. 1 new signal overnight: Michigan State OL recruit decommitted. Priority: review and approve DM draft to MSU OL coach."
- Delivered in-app and optionally via email/push notification

**Weekly Recruiting Report**
- Every Monday, a comprehensive weekly summary
- Content published, coach interactions, profile views, pipeline changes, competitive landscape shifts
- Week-over-week trend comparisons
- Recommended focus areas for the coming week

**Monthly Strategy Review**
- Monthly summary aligned to the 4-year recruiting plan
- Are we on track? What changed? What should we adjust?
- Comparison to the plan established at the beginning of the year

### 5.3 Notification Intelligence

Not all notifications are equal. The system uses a 3-tier notification model:

- **Tier 1 (Interrupt):** Time-sensitive, high-impact signals. "Coach Torres just called and left a voicemail" or "Offer received from Wisconsin." Push notification + in-app alert + morning brief. Maximum 1-2 per week.
- **Tier 2 (Inform):** Important but not urgent. "Your post got 3x normal engagement" or "A competing recruit decommitted." In-app intelligence feed + morning brief. Multiple per week.
- **Tier 3 (Log):** Low-urgency operational data. "Content published as scheduled" or "Coach database enrichment completed." In-app activity log only. Daily.

---

## 6. Recruiting Journey Map

The dashboard adapts to the full Class of 2029 recruiting timeline. This is not a feature toggle -- it is structural architecture.

### Phase 1: Foundation Building (Freshman Year, 2025-2026)

**Dashboard emphasis:** Content Engine + Development Lab
**Primary job:** Establish digital presence, begin longitudinal data collection, build initial school list
**Dashboard mode:** "Builder Mode" -- focused on creation, documentation, and early exploration
**Metric focus:** Profile completeness, content cadence, measurables baseline

The dashboard at this phase is gentle. Low information density. Emphasis on building habits: weekly film review, monthly measurables update, consistent content posting. The system celebrates consistency, not volume.

### Phase 2: Proof Accumulation (Sophomore Year, 2026-2027)

**Dashboard emphasis:** Content Studio + Film Vault + Coach CRM (early)
**Primary job:** Build film library, establish measurable trajectories, begin coach research
**Dashboard mode:** "Proof Mode" -- focused on accumulating evidence that will matter later
**Metric focus:** Film clips tagged, measurable improvement rate, school list refinement
**Key date:** June 15, 2027 -- NCAA Division I coach-initiated contact opens

The dashboard becomes more data-rich. Development Lab charts start showing meaningful trends. Film Vault begins building a library. Coach CRM is populated with research targets. The system starts surfacing fit scores as data accumulates.

### Phase 3: Active Recruiting (Junior Year, 2027-2028)

**Dashboard emphasis:** Coach CRM + Outreach Ops + Analytics
**Primary job:** Build coach relationships, attend camps, secure evaluations, earn offers
**Dashboard mode:** "Operations Mode" -- focused on execution velocity and relationship management
**Metric focus:** Outreach response rate, coach relationship scores, camp performance, offer probability
**Key date:** April 1, 2028 -- Division I official visits open

The dashboard reaches peak operational intensity. Every module is active. The intelligence engine is processing multiple signals daily. Outreach sequences are running. Content is calibrated to the recruiting moment. The system is working as a full recruiting staff.

### Phase 4: Decision Making (Senior Year, 2028-2029)

**Dashboard emphasis:** Decision Matrix + Coach Intelligence + REC Team
**Primary job:** Evaluate offers, complete visits, make the commitment decision
**Dashboard mode:** "Decision Mode" -- focused on clarity, confidence, and commitment readiness
**Metric focus:** Decision matrix convergence, information completeness, relationship health at finalist schools
**Key dates:** Early Signing Period (December 2028), National Signing Day (February 2029)

The dashboard shifts from operational velocity to decision quality. The Commitment Decision Matrix becomes the primary view. The system actively guards against cognitive biases. The 4-year data story is synthesized into a narrative that supports confident decision-making. The emotional tone shifts from "execute" to "reflect and choose."

### Phase 5: Commitment and Transition (Post-Commitment, 2029)

**Dashboard emphasis:** Transition planning, legacy documentation
**Primary job:** Manage announcement, prepare for college transition, preserve the 4-year story
**Dashboard mode:** "Legacy Mode"
**Key deliverables:**
- Commitment announcement package (branded graphics, statistics, 4-year journey summary)
- College transition checklist (academic, athletic, social preparation)
- Recruiting Journey Timeline (printable, frameable artifact)
- Platform handoff (if the family wants to continue tracking through college)

---

## 7. Coach Experience

If a college football coach somehow gained access to this dashboard -- through a screen share, an over-the-shoulder view, or a deliberate demo -- it should leave a specific impression.

### The Impression: "This family is operating at a level I have never seen."

The coach should see:
- **Professionalism** -- The dashboard looks like it was built by a professional sports organization, not a high school family. The design quality signals that this operation is serious.
- **Intelligence** -- The data is more structured, more current, and more relevant than what the coach receives from recruiting services. The scheme-specific film tags, the measurable trajectories, the communication optimization -- this is the kind of analysis the coach's own staff does, but applied to one athlete's recruiting process.
- **Organization** -- Every interaction is logged, every relationship is tracked, every decision has a data foundation. This signals low risk to the coaching staff: a family this organized will keep the recruit academically eligible, emotionally grounded, and operationally on track.
- **Maturity** -- The bias detection, the decision framework, the long-term thinking -- this signals that the family will not panic-commit, will not disappear after a bad game, and will approach the commitment decision with the seriousness it deserves.

### What the coach should NOT see:
- Any indication that the system is gaming coach metrics or manipulating engagement
- Any sense that the athlete is not the one doing the work (the system supports, it does not replace)
- Any desperation signals. The dashboard should exude calm confidence, not anxious monitoring.

### Design implication:
Every screen should pass the "coach over the shoulder" test. If a coach saw this screen, would it increase or decrease their interest in Jacob? If decrease, the design is wrong.

---

## 8. Integration Architecture

The v5 Command Center is a data aggregation platform that pulls intelligence from multiple external sources.

### Tier 1: Core Integrations (Required for v5)

| Source | Data Type | Integration Method | Update Frequency |
|--------|-----------|-------------------|-----------------|
| **Hudl** | Game film, highlight reels, play tags | Hudl public profile scraping + manual upload | Per game |
| **X/Twitter API** | Post performance, DM status, coach activity monitoring | OAuth API | Real-time |
| **NCSA** | Profile views, school interest signals, lead pipeline | HTML scraping (existing) | Daily |
| **Supabase** | All platform data (coaches, posts, DMs, analytics, tasks) | Direct DB (Drizzle ORM) | Real-time |
| **Recruit Website** | Profile view analytics, page engagement, film view counts | Next.js analytics + custom events | Real-time |

### Tier 2: Enrichment Integrations (High Value)

| Source | Data Type | Integration Method | Update Frequency |
|--------|-----------|-------------------|-----------------|
| **247Sports / Rivals / On3** | Star ratings, recruiting rankings, offer boards, commitment data | Web scraping (Firecrawl/Exa) | Weekly |
| **MaxPreps** | Game stats, team records, schedule | Web scraping | Weekly during season |
| **School Athletic Websites** | Roster data, coaching staff, depth charts, graduation data | Web scraping | Monthly |
| **Instagram API** | Multi-platform content publishing + performance | API | Daily |
| **Camp/Showcase Databases** | Camp registrations, results, rankings | Manual entry + scraping where available | Per event |

### Tier 3: Intelligence Integrations (Competitive Advantage)

| Source | Data Type | Integration Method | Update Frequency |
|--------|-----------|-------------------|-----------------|
| **Transfer Portal Databases** | Portal entries/exits, roster impact on target schools | Web scraping | Daily during portal windows |
| **NIL Collectives/Marketplaces** | NIL valuation estimates by school, position, conference | API partnerships or scraping | Monthly |
| **NCAA Eligibility Center** | Rules engine updates, contact period changes | Manual rules engine updates | Per rule change |
| **Weather/Travel APIs** | Camp logistics, visit travel planning | API | Per event |
| **Academic Databases** | School academic rankings, program-specific data | Scraping | Semester |

### Data Flow Architecture

```
External Sources
    |
    v
[Scraping Engine] --> [Data Normalization] --> [Supabase]
    |                                              |
    v                                              v
[Signal Detection] <------ [Intelligence Engine] ----> [Module Views]
    |                                              |
    v                                              v
[Alert System]        [AI Team Context]      [Coach Dossiers]
```

Every external data point flows through a normalization layer before entering the database. The Intelligence Engine processes raw data into actionable signals. The Alert System determines which signals warrant user attention. AI team members have read access to all normalized data for context-aware conversations.

---

## 9. Personalization

The dashboard is not a fixed product. It adapts over time across four dimensions.

### 9.1 Temporal Personalization (Recruiting Phase)

As described in Section 6, the dashboard structurally changes based on where Jacob is in the 4-year recruiting timeline. This is the most important personalization axis because it determines which modules are primary, which metrics matter, and what the system's operational posture should be.

### 9.2 Behavioral Personalization (Usage Patterns)

The dashboard learns how Mike uses it and adapts:
- If Mike always checks the Coach CRM first, the Command Center surfaces coach-related signals at the top of the intelligence feed
- If Mike consistently ignores a certain metric tile, the system suggests removing it or replacing it with something more relevant
- If Mike approves DM drafts without editing 90% of the time, the system suggests increasing the autonomy level for outreach
- Keyboard shortcuts and quick actions adapt to the most common interaction patterns

### 9.3 Contextual Personalization (Current Situation)

The dashboard responds to the current recruiting context:
- During football season: Film Vault and game performance analytics are prominent
- During camp season: Camp preparation and results tracking move to the foreground
- During visit season: Visit preparation suite and decision matrix are primary
- During dead periods: Development Lab and content creation become the focus
- After an offer: Decision Matrix immediately incorporates the new school and prompts criteria evaluation

### 9.4 Preference Personalization (Family Settings)

Mike and Jacob control:
- Notification frequency and channel preferences
- AI autonomy level (how much the system does without approval)
- Information density preference (minimal vs. detailed vs. expert)
- Module visibility (hide modules that are not relevant to the current phase)
- Dashboard layout customization (reorder, resize, pin favorite views)

---

## 10. Differentiation

### What makes this unlike any other recruiting tool available

**1. No recruiting tool operates as an intelligence system.**
NCSA, Hudl, and 247Sports are profile platforms. They store information. Alex Recruiting Command Center processes information into decisions. The difference is the same as between a filing cabinet and an analyst.

**2. No recruiting tool has a multi-agent AI team with specialized domain knowledge.**
Every AI feature in competing products is a single chatbot with a generic prompt. The 7-member REC team has specialized knowledge bases (NCAA rules, coach databases, content strategy, film analysis, analytics, community engagement) and they cross-reference each other's work. When Nina drafts a DM, she checks Marcus's NCAA calendar to ensure the contact period allows it and references Sophie's data on the coach's communication patterns.

**3. No recruiting tool compounds intelligence over 4 years.**
Every other platform provides a snapshot. Alex Recruiting compounds data from freshman year through signing day. By senior year, the system has 4 years of coach interaction history, 4 years of athletic development data, 4 years of content performance data, and 4 years of recruiting signal detection. This longitudinal intelligence asset is unreplicable by any platform that starts later.

**4. No recruiting tool fights for the family's decision quality.**
Every other platform wants the family to use the platform more. Alex Recruiting actively guards against cognitive biases, warns when decisions are being made with incomplete information, and shifts from "more activity" to "better decisions" as commitment approaches. The bias detection engine has no analog in any recruiting product.

**5. No recruiting tool matches the visual quality bar of a professional production.**
The cinematic dark theme, the JetBrains Mono data typography, the warm gold achievement accents, the film-grain textures reserved for hero moments -- this is the same design language used on Jacob's recruit website. When a coach sees the public-facing recruit page and the family sees the private command center, they are experiencing the same brand. No other recruiting family has this.

**6. No recruiting tool bridges the weight room to the recruiting profile.**
The Development Lab creates a verified, longitudinal record of athletic development that feeds directly into the recruit profile and outreach materials. When a coach sees "Jacob improved his squat by 115 lbs over 3 years while dropping his shuttle time by 0.4 seconds," that data came from the same system that manages his recruiting outreach. The training data and the recruiting data live in one graph.

**7. No recruiting tool operates with supervised autonomy.**
The Command Center does not just track -- it acts. It drafts messages, schedules content, detects signals, and prepares decisions. But it never acts without family approval on anything that matters. This supervised-autonomy model is the operational innovation: the family gets the output of a full-time recruiting staff with the time commitment of 15 minutes per day.

**8. No recruiting tool was built by the family using it.**
Mike is both the developer and the operator. Every feature exists because a real recruiting family needed it. There is no product committee, no enterprise sales team, no generic feature roadmap designed for the average user. This is a bespoke recruiting intelligence system built for one athlete's journey. When it works for Jacob, it will work for every family -- because it was forged in the reality of an actual recruiting process, not abstracted from market research.

---

## Appendix A: Priority Sequencing from v0.1 to v5

This is the product manager's recommended build sequence, not a timeline. Each version should be releasable and valuable on its own.

| Version | Theme | Key Capability Additions | Recruiting Phase |
|---------|-------|-------------------------|-----------------|
| v0.1 | Static Foundation | 6 basic modules, dark theme, API wiring | Freshman/Sophomore |
| v1.0 | Operational Dashboard | Real data, functional CRM, working content calendar, DM pipeline | Sophomore |
| v2.0 | Intelligence Layer | Fit scoring, coach enrichment, content analytics, recruiting readiness score | Sophomore/Junior |
| v3.0 | Autonomous Operations | AI content drafting, multi-platform publishing, film tagging, outreach sequences | Junior |
| v4.0 | Predictive Engine | Offer probability, relationship modeling, coach personality profiles, NIL intelligence | Junior/Senior |
| v5.0 | Decision OS | Commitment decision matrix, bias detection, alumni modeling, verified development data | Senior |

### Sequencing Logic

The sequence is not arbitrary. Each version builds capabilities that the next version depends on:

- v1.0 must wire real data before v2.0 can run intelligence on it
- v2.0 must establish fit scoring before v3.0 can use it to target outreach
- v3.0 must accumulate coach interaction data before v4.0 can model relationships
- v4.0 must establish the decision framework before v5.0 can apply bias detection to it

The most common mistake in roadmap planning is treating these versions as independent feature sets. They are not. They are a dependency chain where each version creates the data foundation and user trust required for the next.

---

## Appendix B: Success Metrics by Version

| Version | Primary Metric | Target | Measurement |
|---------|---------------|--------|-------------|
| v1.0 | Daily active use by Mike | 5+ days/week | Login + action tracking |
| v2.0 | Time to first action | Under 30 seconds from login | Session analytics |
| v3.0 | Autonomous task completion rate | 60%+ of routine tasks handled by AI | Task audit log |
| v4.0 | Prediction accuracy | Offer probability within 20% of actual at 90-day horizon | Retrospective scoring |
| v5.0 | Decision confidence score | Family self-reports high confidence in commitment decision | Post-commitment survey |

---

## Appendix C: What This Document Does Not Cover

- Technical architecture and infrastructure decisions (Atlas's domain)
- Detailed UI/UX specifications and component design (Marcus's domain)
- AI model training strategies and ML pipeline architecture (Nova's domain)
- Behavioral intervention design and habit formation mechanics (Freya's domain)
- NCAA compliance review for specific features (legal review required)
- Cost modeling for external API integrations and compute resources (Steve's domain)

These gaps are intentional. This document defines the product vision and feature architecture. Implementation details belong in separate specs owned by the relevant team member.

---

*This vision document was produced by Compass (Product Manager) using future-back analysis grounded in the Strategos Innovation Studio output, the current v0.1 codebase, the dashboard v2 design document, the emotional architecture brief, and the recruiting intelligence plan. It is designed to be the north star that every subsequent design, engineering, and strategy decision ladders up to.*

*The central product thesis: The family that operates recruiting like an intelligence operation -- with compounded data, embedded AI, and decision-quality focus -- will achieve better outcomes than the family that relies on recruiting services, star ratings, and guesswork. The v5 Command Center is the product that makes that thesis real.*
