# Growth and Engagement Architecture Assessment
# Jacob Rodgers Recruiting Command Center

**Date**: 2026-03-12
**Assessor**: Aria (Growth Strategy)
**Subject**: Dashboard growth intelligence layer for Jacob Rodgers, Class of 2029 OL
**Status**: Assessment with prioritized recommendations

---

## Executive Assessment

The current system has strong bones: a real database schema with coaches, posts, DMs, engagement logs, analytics snapshots, competitor tracking, and Hudl profiles. The scoring engine already computes film, social, momentum, academic, and physical sub-scores. The coach behavior module predicts DM open probability, follow-back likelihood, and optimal contact windows.

What is missing is the connective tissue that turns these scattered signals into a growth engine. The dashboard shows data. It does not yet drive decisions.

The gap is not features. The gap is intelligence architecture — the layer that synthesizes signals across modules and tells Mike "do this next, because the data says so."

---

## 1. Content Strategy Intelligence

### Current State

The content engine has a calendar, pillar distribution chart (Performance 40% / Work Ethic 40% / Character 20%), and a post composer. Posts track impressions, engagements, and engagement rate. But the dashboard does not analyze what content actually drives coach attention versus what generates empty vanity impressions.

### What Is Missing

**Content-to-coach attribution.** The system tracks posts and tracks coaches, but does not connect them. When a coach follows Jacob, there is no mechanism to ask "what did Jacob post in the 48 hours before that follow?" When a DM gets a response, there is no way to correlate it with what content the coach saw first.

**Content type intelligence.** The pillar system (Performance / Work Ethic / Character) is a good editorial framework, but it does not capture the content formats that actually move coaches:

- Film clips with play breakdowns outperform generic training videos
- Camp recap posts with school tags generate 3-5x the coach engagement of standard training posts
- Measurables updates (height/weight/combine numbers) with visual formatting signal professionalism
- Teammate and community content humanizes the profile without appearing self-promotional

**Hashtag and discovery intelligence.** The post schema stores hashtags as a JSONB array, but the dashboard does not surface which hashtags drive discovery versus which are noise. For a Class of 2029 OL in Wisconsin, the relevant hashtag clusters are:

- Position-specific: #FutureOL, #OffensiveLine, #BigUgly, #TrenchMob
- Class-specific: #Classof2029, #C2029
- Region-specific: #WisconsinFootball, #BadgerState, #WIPreps
- Recruiting-specific: #RecruitMe, #Uncommitted2029
- School-tagged: @[school handle] in text, not just hashtags

### Recommendations

1. **Add a `content_attribution` table** linking post IDs to coach engagement events that occurred within a 72-hour window after the post went live. Schema: `post_id`, `coach_id`, `event_type` (follow, like, DM_open, profile_view), `event_timestamp`, `attributed_at`.

2. **Build a Content Performance Score** for each post that weights coach-relevant engagement (coach likes, coach follows within 72h) at 5x the value of peer/general engagement. Display this score on the content calendar so Mike can see which posts actually move the needle.

3. **Add "Post Like This Again" intelligence.** When a post scores in the top quartile for coach engagement, the dashboard should surface it as a template with an explanation of why it worked (film clip + school tag + camp context = high coach engagement).

4. **Content timing recommendations.** Cross-reference the coach behavior module's `peakActivityHours` data with post scheduling. The system already calculates peak hours per coach — aggregate these across all tracked coaches to recommend optimal posting windows. For Midwest football coaches, the data will likely cluster around 6-8am CT (pre-practice review), 11am-1pm CT (lunch), and 8-10pm CT (evening film review).

5. **Hashtag performance tracking.** Add `hashtag_performance` table: `hashtag`, `post_count`, `avg_engagement_rate`, `coach_engagement_count`, `last_used`, `recommended`. Score hashtags by coach engagement per use, not raw impressions.

---

## 2. Social Graph Growth

### Current State

The coach CRM tracks follow status (`not_followed`, `following`, `followed_back`) and has an X activity score. The system knows how many coaches are in the database and how many have mutual follows. But the social graph is flat — it does not visualize relationships, clusters, or paths.

### What Is Missing

**Network topology.** College coaching staffs are not independent actors. An OL coach at a D2 school may have coached with a coordinator at an FCS school. A head coach's tweet about a prospect gets seen by every assistant. The system does not map these relationships.

**Peer recruit network.** Jacob is not recruiting in isolation. Other Class of 2029 OL recruits who follow coaches at Jacob's target schools create a competitive signal. If a peer recruit gets a follow-back from a coach Jacob is targeting, that is both competitive intelligence and a potential warm introduction path.

**Engagement heat map.** The engagement log table already captures events, but the dashboard does not visualize engagement density over time per coach. A coach who liked three posts in a week is warmer than a coach who liked one post three months ago. The CRM treats both the same.

### Recommendations

1. **Coach Engagement Heat Score.** Create a rolling 30-day engagement score per coach using the `engagementLog` table. Weight events by recency (exponential decay) and type (profile view > like > generic follow). Display as a temperature indicator (cold/warm/hot) on the coach CRM table. This replaces the binary "stale" indicator with a gradient.

2. **Social Graph Visualization.** Build a network graph component showing:
   - Center: Jacob
   - Inner ring: coaches with mutual follows or DM responses
   - Middle ring: coaches with one-directional follows or engagement
   - Outer ring: coaches in the database with no engagement
   - Edge color: engagement heat (red = hot, blue = cold)
   - Cluster by conference/division so geographic and competitive patterns emerge

3. **Peer recruit tracking expansion.** The `competitorRecruits` table already exists with follower count, post cadence, and school interest signals. Add a field for `shared_coach_follows` — the coaches that both Jacob and this competitor follow. When a competitor gets a follow-back from a shared coach, surface it as an alert.

4. **"Who should Jacob follow next?" intelligence.** Using the target school list and coach database, generate a prioritized follow queue: coaches at target schools who Jacob does not yet follow, sorted by OL need score and DM open probability. This exists conceptually in the coach behavior module but is not surfaced as a dashboard action.

---

## 3. Viral Loop Opportunities

### Current State

The recruiting site at `/recruit` is a static showcase — a digital business card for coaches. The dashboard manages content and outreach but does not use the recruiting site as a growth instrument.

### What Is Missing

**The recruiting site generates no data back to the dashboard.** When a coach visits `jacobrodgers.com/recruit`, the dashboard has no visibility. There are no view counts, no session duration, no click-through data, no "which section did the coach spend time on" analytics.

**There is no share mechanic.** The most powerful recruiting growth loop is coach-to-coach referral. When one coach evaluates a recruit positively, they tell other coaches. But the current site has no mechanism to make sharing frictionless or trackable.

### Recommendations

1. **Add lightweight analytics to the recruiting site.** Implement privacy-respecting page view tracking with UTM parameter support. When a coach clicks a link from a DM, the UTM source ties the visit back to the specific outreach. Schema addition to `analyticsSnapshots` or a new `site_visits` table: `visitor_fingerprint` (hashed, no PII), `source`, `utm_campaign`, `pages_viewed`, `duration_seconds`, `timestamp`.

2. **One-click share links.** Add a "Share This Recruit" button on the recruiting site that generates a unique trackable URL. When Coach A shares Jacob's page with Coach B, the dashboard logs the referral chain. This is the closest thing to a viral loop in recruiting: trust transfer between coaches.

3. **QR code for camp use.** Generate a QR code (linked to a trackable URL) that Jacob can print on his recruit sheet for camps. After a camp, spikes in QR-originated traffic validate camp ROI.

4. **Dashboard-to-site content sync.** When the content engine produces a high-performing post, the dashboard should flag it for inclusion on the recruiting site. The site should dynamically pull recent high-engagement posts as social proof.

---

## 4. Engagement Scoring

### Current State

The scoring engine (`scoring-engine.ts`) computes a composite score with five weighted sub-scores: film (0.25), social (0.15), momentum (0.25), academic (0.15), physical (0.20). The coach behavior module assigns coaches an engagement style (highly_responsive, selective, broadcast_only, quiet_evaluator, unknown) and estimates DM open probability.

But these scores are about Jacob's overall readiness. There is no per-coach engagement score that tracks whether a specific coach is warming up, going cold, or steady.

### What Is Missing

**Coach-specific engagement trajectory.** The system needs to answer: "Is Coach Smith at UW-Whitewater becoming more interested or less interested over time?" This requires a time-series view of engagement events per coach, not just a snapshot.

**Engagement velocity.** A coach who went from zero engagement to three likes in a week is a different signal than a coach who has liked one post per month for six months. Velocity matters more than volume.

**Threshold alerts.** When a coach crosses from "cold" to "warm" (e.g., second engagement event in 14 days), the dashboard should surface an alert: "Coach Smith is showing increased interest. Recommended action: send a personalized DM within 48 hours."

### Recommendations

1. **Build a Coach Interest Score (CIS).** Per-coach, rolling 30-day score:

   | Event | Points | Decay |
   |-------|--------|-------|
   | Coach views recruiting site (via UTM) | 10 | 7-day half-life |
   | Coach likes a post | 5 | 14-day half-life |
   | Coach replies to a post | 15 | 14-day half-life |
   | Coach follows Jacob | 25 | 30-day half-life |
   | Coach opens/responds to DM | 40 | 30-day half-life |
   | Coach requests film | 50 | 60-day half-life |
   | Jacob attends coach's camp | 30 | 30-day half-life |

   Display as: Cold (0-10), Cool (11-25), Warm (26-50), Hot (51-80), On Fire (81+)

2. **Trajectory arrows on the coach table.** Next to each coach's CIS, show an arrow: trending up, stable, or trending down (comparing current 14-day CIS to prior 14-day CIS).

3. **Interest spike alerts.** When a coach's CIS increases by more than 20 points in a 7-day window, generate an action item on the Command Center: "Coach Smith's interest is spiking. Act now."

4. **Cold re-engagement queue.** When a coach who was previously Warm drops to Cold, add them to a re-engagement list with a suggested action: new film share, camp attendance tag, or fresh DM approach.

---

## 5. Channel Optimization

### Current State

The system is heavily weighted toward X/Twitter. The content engine, DM pipeline, and social presence scoring all center on X. Hudl integration exists for film. NCSA lead tracking exists in the REC team module. Camp tracking is manual.

### What Is Missing

**Channel attribution.** The system does not track which channel produces the highest-quality coach engagement. A Hudl profile view may be worth more than 50 X impressions, but the dashboard treats X metrics as the primary signal.

**Channel effort allocation guidance.** Mike is one person managing a high school freshman's recruiting. He cannot optimize five channels simultaneously. The dashboard should recommend where to spend the next hour.

### Channel Assessment

| Channel | Current System Support | Coach Impact | Effort Required | Recommendation |
|---------|----------------------|--------------|-----------------|----------------|
| X/Twitter | Full (content, DMs, follows) | Medium — awareness layer | Medium | Maintain 3-5 posts/week. Do not over-invest. |
| Hudl | Profile scraping, film tracking | High — evaluation asset | Low (update weekly during season) | Highest ROI per hour. Prioritize film updates. |
| Email | Not integrated | High — primary first-touch | Medium | Add email outreach module. Email > DM for first contact per NCSA data. |
| NCSA | Lead tracking only | Medium — database entry | Low | Fill questionnaires promptly. This is a trigger, not a channel. |
| Camps | Manual tracking | Highest — in-person evaluation | High (travel, cost, time) | Track ROI per camp. Only attend camps with verified coach attendance. |
| Recruiting site | Static page | Medium — reference asset | Low (update quarterly) | Add analytics. Make it the single link in every outreach. |

### Recommendations

1. **Add an email outreach module.** The 25x plan correctly identifies email as the primary first-touch channel. The dashboard needs an email template system parallel to the DM pipeline: compose, send, track open/response. This is the single highest-impact feature gap.

2. **Channel allocation dashboard widget.** Based on the current recruiting phase (the system already computes this via `calculateRecruitingTimeline`), recommend channel time allocation. In the pre-contact phase (now through June 2027):
   - 40% Hudl/film updates
   - 30% X content and engagement
   - 20% camp research and registration
   - 10% NCSA/questionnaire completion

3. **Camp ROI tracker.** Add a `camps` table: `camp_name`, `school`, `date`, `cost`, `coaches_present`, `measurables_recorded`, `follow_ups_sent`, `resulting_engagement_events`. After each camp, score it: did it produce new coach engagement within 14 days?

---

## 6. Timing Intelligence

### Current State

The coach behavior module calculates `peakActivityHours` and `bestMonths` per coach. The recruiting timeline module knows the NCAA calendar milestones. But this timing intelligence is not connected to the content calendar or the DM pipeline.

### What Is Missing

**Post scheduling optimization.** The content engine lets Mike pick a time, but does not suggest the optimal time based on when target coaches are most active on X.

**DM timing windows.** The coach behavior module calculates optimal contact windows (best months, best days, best hours), but the DM pipeline does not surface this. When Mike drafts a DM, the system should say "Coach Smith is most active Tuesday-Thursday, 8-10am CT. Schedule this DM for Tuesday at 8:30am."

**Recruiting calendar integration.** The system computes that June 15, 2027 is when D1 coach-initiated contact opens for Jacob's class. But the dashboard does not count down to this or build a pre-launch preparation timeline.

### Recommendations

1. **Suggested send times in the DM composer.** When a coach is selected for a DM, pull their `optimalContactWindow` from the behavior module and display recommended send windows. Allow Mike to "schedule for next optimal window" with one click.

2. **Content calendar time suggestions.** When a post is being scheduled, show a heat map of the week: green hours are when the most tracked coaches are active, red hours are low-activity windows. Aggregate peak hours across all coaches in the database, weighted by engagement tier.

3. **Milestone countdown widget.** Add to the Command Center overview:
   - Days until Wisconsin Spring Prospect Camp: X
   - Days until June 15, 2027 (D1 contact window opens): X
   - Days until next film update deadline: X
   - Current recruiting phase: PRE-CONTACT
   - Phase-appropriate actions (already computed by `getPhaseActions`)

4. **Weekly rhythm template.** Based on the operating cadence in the 25x plan, build a weekly task rhythm into the dashboard:
   - Monday: Review weekend engagement, plan content
   - Tuesday-Thursday: Post content, send DMs during peak hours
   - Friday: Upload and tag new film
   - Saturday-Sunday: Game day content, training content
   - Sunday evening: Week review, update coach CRM

---

## 7. Competitive Positioning

### Current State

The `competitorRecruits` table tracks name, position, class year, height, weight, follower count, post cadence, engagement rate, top content types, and school interest signals. But this data is not used to position Jacob relative to the market.

### What Is Missing

**Jacob vs. the field.** The dashboard does not show where Jacob stands compared to other Class of 2029 OL recruits in the Midwest. Is his follower count above or below the median? Is his posting cadence competitive? Are other recruits getting engagement from the same coaches?

**Offer market intelligence.** When peer recruits announce offers, that is signal about which programs are actively recruiting OL in the 2029 class. If three 2029 OL recruits get D2 offers from GLIAC schools in March, that tells Jacob where the buying market is.

### Recommendations

1. **Competitive comparison card.** On the Analytics page, add a comparison widget:
   - Jacob's follower count vs. median of tracked competitors
   - Jacob's posting frequency vs. median
   - Jacob's engagement rate vs. median
   - Jacob's measurables vs. positional averages
   - Jacob's coach follow count vs. competitors
   Color-code: green where Jacob is above median, yellow at median, red below.

2. **Offer board intelligence.** Track when competitor recruits announce offers. Map these to Jacob's target schools. If a competitor gets an offer from a school Jacob is targeting, that is both competitive intelligence (roster spot may be filling) and market intelligence (school is actively evaluating 2029 OL).

3. **"What are they doing that we're not?" analysis.** When a competitor has meaningfully higher engagement, surface their top content types and posting patterns. If competitor OL recruits are posting play breakdown threads and Jacob is not, that is an actionable content gap.

---

## 8. Campaign Performance

### Current State

The DM pipeline tracks waves (Wave 0/1/2/3) and status (drafted/approved/sent/responded). The content calendar tracks post status and pillar distribution. But there is no concept of a "campaign" that ties together a coordinated set of actions and measures their collective impact.

### What Is Missing

**Campaign definition.** A recruiting campaign is a coordinated push: "We're going to post three film clips, send DMs to eight D2 coaches, and register for two camps this month." The system tracks each action independently but cannot evaluate the campaign as a unit.

### Recommendations

1. **Add a `campaigns` table.** Schema: `campaign_id`, `name`, `start_date`, `end_date`, `goal` (text), `target_coaches` (JSONB array of coach IDs), `posts` (JSONB array of post IDs), `dms` (JSONB array of DM IDs), `camps` (JSONB array of camp IDs), `status`, `results_summary`.

2. **Campaign dashboard.** For each campaign, show:
   - Posts published / planned
   - DMs sent / responded
   - New coach follows gained
   - Coach Interest Score changes for target coaches
   - Camp attendance / follow-ups completed
   - Overall campaign grade (A/B/C/D based on response rate and engagement lift)

3. **Pre/post campaign comparison.** Snapshot key metrics (coach engagement rate, follower count, DM response rate) at campaign start and end. Show the delta.

---

## 9. Funnel Visualization

### Current State

The analytics page has a simple four-stage funnel: Total Coaches > DM Sent > Replied > Mutual Follow. This is a start but does not capture the full recruiting journey.

### What Is Missing

The actual recruiting funnel for a high school prospect is:

```
UNAWARE          Coach has never heard of Jacob
   |
AWARE            Coach has seen Jacob's content or profile
   |
ENGAGED          Coach has liked, followed, or viewed film
   |
EVALUATING       Coach has requested film, responded to DM, or invited to camp
   |
RECRUITING       Coach is in active communication, scheduling visits
   |
OFFERING         Coach has made or is preparing an offer
   |
COMMITTED        Jacob has committed to the program
```

The current system conflates the top of this funnel (Aware through Engaged) and misses the bottom entirely (Evaluating through Committed).

### Recommendations

1. **Extend the coach status taxonomy.** Update the `followStatus` and `dmStatus` fields to map to funnel stages, or add a new `recruitingStage` field on the coaches table:
   - `unaware` — in the database, no contact
   - `aware` — Jacob follows them, they may or may not know Jacob
   - `engaged` — coach has liked, viewed, or interacted
   - `evaluating` — coach has responded to DM, requested film, or invited to camp
   - `recruiting` — active dialogue, visit scheduled or completed
   - `offered` — formal or verbal offer extended
   - `committed` — Jacob has committed

2. **Full funnel visualization.** Replace the four-stage pipeline with this seven-stage funnel. Show counts at each stage and conversion rates between stages. Highlight bottlenecks: if 50 coaches are Aware but only 3 are Engaged, the problem is content, not outreach.

3. **Stage-appropriate actions.** For each funnel stage, the dashboard should recommend different actions:
   - Unaware to Aware: follow them, tag their school in content
   - Aware to Engaged: post film clips, engage with their content
   - Engaged to Evaluating: send personalized DM with film link
   - Evaluating to Recruiting: respond within 24 hours, share full-game film
   - Recruiting to Offered: schedule unofficial visits, have HS coach call
   - Offered to Committed: compare packages, visit, decide from evidence

---

## 10. Action Prioritization — "Do THIS Next"

### Current State

The Command Center has a simple action items list: review draft DMs, schedule draft posts, follow up with stale coaches. These are task-queue items, not intelligence-driven recommendations.

### What Is Missing

**Prioritized, contextualized, time-sensitive recommendations.** The system has all the data to generate smart recommendations:
- Coach behavior profiles with engagement probabilities
- Content performance data
- Recruiting timeline milestones
- Competitive intelligence
- Engagement heat scores

But none of this feeds into a single prioritized action queue.

### Recommendations

1. **Build a Priority Action Engine.** Each action is scored by urgency, impact, and effort:

   | Action Type | Urgency Signal | Impact Score | Effort |
   |------------|---------------|-------------|--------|
   | Respond to coach DM | Coach responded in last 24h | 100 | Low |
   | Send DM to spiking coach | CIS increased 20+ in 7 days | 90 | Low |
   | Follow up on camp | Camp was within last 48h | 85 | Low |
   | Post scheduled content | Post is due today | 80 | Low |
   | Update Hudl with new film | New game film available | 75 | Medium |
   | Re-engage cold coach | Was Warm, now Cold | 60 | Medium |
   | Fill school questionnaire | Questionnaire request received | 70 | Medium |
   | Research new target school | Gap in tier coverage | 40 | High |
   | Update measurables | Last update 60+ days ago | 50 | Low |
   | Review competitor activity | Weekly cadence | 30 | Medium |

2. **Morning briefing format.** When Mike opens the dashboard, the Command Center should show the top 3-5 actions for today, ranked by the Priority Action Engine. Not a long list of everything. A short, decisive "here is what matters today."

3. **Action completion tracking.** When Mike completes an action (sends a DM, posts content, logs a camp follow-up), the system should update the coach's CIS and funnel stage accordingly, then regenerate the priority queue.

4. **"One thing" mode.** For days when Mike has 15 minutes, the dashboard should have a single-action view: "If you can only do one thing today, do this: [highest-priority action with one-click execution]."

---

## Implementation Priority

Based on impact-to-effort ratio and the current recruiting phase (pre-contact, 15 months before the D1 communication window opens):

### Phase 1 — Foundation (Build this month)

1. **Coach Interest Score** — Per-coach engagement scoring with trajectory arrows. Highest information-to-effort ratio. Uses existing `engagementLog` data.
2. **Full recruiting funnel** — Replace the 4-stage pipeline with the 7-stage funnel. Add `recruitingStage` to coaches table.
3. **Priority Action Engine** — Morning briefing with top 3-5 actions. This is what makes the dashboard indispensable.
4. **Milestone countdown** — Phase indicator and key date countdowns on the Command Center.

### Phase 2 — Intelligence (Next 30 days)

5. **Content-to-coach attribution** — Connect posts to coach engagement events.
6. **DM timing intelligence** — Surface optimal send windows in the DM composer.
7. **Camp ROI tracker** — Structured camp tracking with follow-up automation.
8. **Competitive comparison card** — Jacob vs. the field on key metrics.

### Phase 3 — Growth Layer (Next 60 days)

9. **Recruiting site analytics** — UTM tracking, visit attribution.
10. **Email outreach module** — First-touch email system parallel to DM pipeline.
11. **Campaign framework** — Coordinate and measure multi-channel pushes.
12. **Content Performance Score** — Coach-weighted engagement scoring per post.

### Phase 4 — Advanced (Next 90 days)

13. **Social graph visualization** — Network map of coach relationships.
14. **Hashtag performance tracking** — Data-driven hashtag recommendations.
15. **Peer recruit offer intelligence** — Market signal from competitor offers.
16. **Weekly rhythm automation** — Recurring task templates tied to the operating cadence.

---

## What Should NOT Be Scaled Yet

- **Mass DM outreach.** Jacob is a freshman. The D1 contact window does not open until June 15, 2027. Mass outreach now will burn credibility with coaches who cannot legally respond. Focus on D2/NAIA/D3 coaches who can engage now, and build relationships with D1 coaches through content and camp attendance.

- **Paid promotion of content.** X advertising for a high school recruiting account is noise. The audience is too specific (college football coaches) to target efficiently. Organic content with strategic tagging is the right channel.

- **Complex AI automation.** The REC team AI agents are valuable for drafting content and DMs, but automating send actions without Mike's review creates compliance and authenticity risk. Keep Mike as the decision gate.

- **Feature sprawl.** The dashboard already has 30+ pages across old and new routes. Do not add more pages. Add intelligence to existing views. The Coach CRM should get smarter, not bigger.

---

## Growth Model: Two Audiences, One System

### Audience 1: College Coaches (Jacob's growth)

The "user" is the college coach. The "product" is Jacob's recruiting profile, film, and engagement. Growth in this context means more coaches moving down the funnel from Unaware to Evaluating.

**Growth engine:** Content creates awareness. Camps create evaluation. Film creates conviction. Follow-up creates relationship. The dashboard's job is to make every step faster, smarter, and more consistent.

**Retention equivalent:** A coach who stays engaged month over month is "retained." A coach who goes cold is "churned." The Coach Interest Score is the retention metric.

### Audience 2: Mike (Dashboard stickiness)

The "user" is Mike. The "product" is the dashboard. Growth in this context means Mike opening the dashboard daily because it gives him something he cannot get elsewhere.

**Growth engine:** The Priority Action Engine. If the dashboard tells Mike something important that he would not have known otherwise — a coach's interest is spiking, a competitor got an offer from a target school, a camp registration deadline is approaching — it becomes the nervous system of the recruiting process.

**Retention equivalent:** Daily active use. The metric is: does Mike open the dashboard today? The answer is yes only if there is a new, actionable insight waiting for him.

**The compound effect:** The more data Mike enters (logging engagement, updating coach status, posting content), the smarter the system gets. The smarter the system gets, the more valuable it is. This is the flywheel. It is not viral. It is compounding intelligence.

---

## Measurement Plan

| Metric | Definition | Target (90 days) |
|--------|-----------|-------------------|
| Coach funnel depth | Coaches past "Engaged" stage | 15+ coaches in Evaluating or deeper |
| DM response rate | Sent DMs that receive a response | 25%+ for D2/NAIA, 10%+ for FCS |
| Content coach engagement | Posts that generate coach likes/follows | 20%+ of posts |
| Camp ROI | Camps that produce coach engagement within 14 days | 75%+ |
| Dashboard daily use | Days per week Mike opens the dashboard | 5+ |
| Action completion rate | Priority actions completed same day | 80%+ |
| Funnel conversion | Unaware to Aware monthly | 10+ coaches/month |
| Funnel conversion | Aware to Engaged monthly | 5+ coaches/month |

---

## Bottom Line

The dashboard has the data infrastructure of a recruiting intelligence platform but the user experience of a task manager. The single highest-leverage change is building the Priority Action Engine that synthesizes signals from coach behavior, content performance, recruiting timeline, and competitive intelligence into a daily briefing.

The second-highest-leverage change is the Coach Interest Score — replacing the binary "stale or not" indicator with a gradient that shows which coaches are warming up, which are going cold, and which are ready for escalation.

Everything else is refinement. These two features make the dashboard indispensable.
