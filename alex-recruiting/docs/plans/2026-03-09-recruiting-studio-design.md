# Recruiting Studio Design — Research-First Pipeline to 95% Coach Conversion

**Date**: 2026-03-09
**Approach**: Research-First (Approach A)
**Success Metric**: 95% of a 30-coach panel says "I would recruit this athlete"
**Timeline**: 8 weeks

---

## Overview

Transform Jacob's recruiting site and the broader recruiting application into a research-backed persuasion system where coaches feel it's a "no-brainer" to recruit him. The Recruiting Studio is built first in Alex's recruiting app, then pushed into Susan's team as a permanent capability.

**Two workstreams:**
1. **Jacob's recruit site** (`/recruit`): Rebuild the content and persuasion architecture based on deep research into coach decision-making psychology
2. **Recruiting Studio** (within Alex's app): Fill all capability gaps, then sync to Susan's team

The FNL cinematic visual design stays. We're rebuilding what the site *says* and how it *sequences the persuasion* — not how it looks.

---

## Phase 1: Research Acquisition Engine (Weeks 1-2)

### Five Research Streams

**Stream 1: Coach Decision Psychology**
- Academic papers on athletic recruiting decision-making (Google Scholar, ResearchGate)
- Coaching forums and communities (CoachTube, AFCA resources, coaching X threads)
- "How to get recruited" guides from NCSA, Hudl, BeRecruited — reverse-engineer for coach response patterns
- Interviews/podcasts where coaches describe their evaluation process
- NCAA recruiting rules and timelines (real urgency vs artificial urgency)

**Stream 2: Competitive Profile Analysis**
- Scrape top-performing recruit profile structures from Hudl, NCSA
- Analyze what sections, ordering, and data emphasis the best profiles use
- Study 247Sports, Rivals, On3 presentation patterns
- Identify the "gold standard" of recruit profile presentation

**Stream 3: Coach Contact Database Expansion**
- Pull coaching staff directories from target schools
- Cross-reference with existing Supabase coach data
- Build school-tier classification (FBS, FCS, D2, D3, NAIA, JUCO)

**Stream 4: Reddit/Forum Coach Insights**
- Deep scraping of r/footballcoach, r/CFB, coaching forums
- Target candid coach discussions about evaluation criteria
- Capture unfiltered truth about what coaches actually look for vs what they say

**Stream 5: Film Effectiveness Research**
- Optimal highlight film length research
- Clip selection and pacing patterns that coaches watch vs skip
- Thumbnail/preview strategies that drive film plays
- Full-game vs highlights vs position-specific cuts analysis

### Ingestion Architecture
- All research ingested into Susan's RAG under `company_id: alex-recruiting`
- Target: **2,000+ chunks** (from current 144)
- New data types:
  - `coach_psychology` — decision-making research
  - `competitive_profiles` — what works in recruit presentation
  - `coach_contacts` — expanded contact database
  - `recruiting_rules` — NCAA/NAIA timelines and constraints
  - `film_effectiveness` — what makes film get watched
  - `forum_insights` — unfiltered coach perspectives

### Acquisition Tools
- **Playwright-based scrapers**: Public recruiting profiles, coaching directories
- **Susan's `ingest_url`**: Articles, blog posts, research pages
- **Custom ingestion scripts**: Structured data (coach databases, school directories)
- **Research agents**: `researcher-web` and `researcher-reddit` for lived-experience insights

---

## Phase 2: Intelligence Synthesis — Coach Decision Playbook (Weeks 2-3)

### Three-Agent Analysis

**Freya (Behavioral Economics)**
- Identifies psychological mechanisms applicable to coach decision-making
- Maps loss aversion triggers, urgency frames, social proof patterns, endowment effects
- Recommends framing strategies for each section

**Flow (Sports Psychology)**
- Maps the coach's mindset during prospect evaluation
- Identifies emotional journey the site needs to create
- Defines what state of mind drives a "yes" vs "pass"

**Recruiting Strategy Studio**
- Synthesizes tactical specifics from research
- Identifies what data points coaches care about most
- Defines evaluation order and "kill criteria" (instant disqualifiers)

### Playbook Output

The Coach Decision Playbook answers:
1. What are the top 5 things a coach evaluates in the first 15 seconds?
2. What makes a coach stop scrolling and actually watch film?
3. What social proof actually matters to coaches?
4. What framing creates urgency without feeling desperate?
5. What are the "no-brainer" triggers?
6. What kills coach interest instantly? (anti-patterns)

### Coach Personas (3-4 archetypes)
- **The Skeptic**: Needs hard data, doesn't trust marketing. Wants measurables, verified stats.
- **The Data Nerd**: Loves analytics. Wants advanced metrics, comparison data, projections.
- **The Gut-Feel Coach**: Goes by film and narrative. Wants to see the athlete's character and work ethic.
- **The Time-Pressed Coordinator**: Has 200 profiles to review. Needs to evaluate in 30 seconds.

### A/B Variant Recommendations
For each key section, the Playbook recommends two variants to test:
- Hero: Stats-forward vs narrative-forward
- Social Proof: School ticker vs coach endorsements
- Film: Embedded autoplay vs thumbnail + play button
- CTA: Loss-frame ("Don't miss this window") vs gain-frame ("Get ahead of the competition")

---

## Phase 3: Site Content Architecture Rebuild (Weeks 3-4)

### Current Section Journey
`Hero → Film Reel → Social Proof → Origin Story → Athlete/Multi-Sport → Character → Academics → The Fit → Contact`

### Research-Informed Redesign Principles

**1. The 15-Second Gate**
Hero + first scroll must answer: "Is this kid worth my next 2 minutes?" Lead with the coach's #1 evaluation criterion (research will confirm what this is).

**2. Loss Aversion Architecture**
Loss framing threads throughout, not just in "The Window" block. Calibrated per research to find the line between urgency and desperation.

**3. Social Proof Calibration**
Validate whether the scrolling school ticker moves coaches or if coach endorsements / camp performance data is the real social proof.

**4. Film Presentation Science**
Restructure per Stream 5 findings: optimal length, embed vs link, thumbnail strategy.

**5. Persona-Adaptive Content**
Subtle content prioritization based on how the coach arrived (direct link vs X referral vs NCSA).

### What Changes (Content, Not Visuals)
- Hero copy rewritten per research
- Section ordering may change per coach evaluation sequence
- Data presentation emphasis adjusted
- Film section restructured per effectiveness research
- Social proof revalidated
- Contact/CTA framing calibrated
- Loss-aversion blocks expanded or repositioned
- Copy tone calibrated per coach persona research

---

## Phase 4: Recruiting Studio — App Gap Fill (Weeks 3-5)

### Current vs Needed

| Component | Status | Action |
|-----------|--------|--------|
| REC System (7 AI personas) | Exists | Update prompts with Playbook insights |
| Coach database (X data) | Exists | Expand with Stream 3 data |
| NCSA pipeline | Exists | Integrate analytics |
| Recruit page (/recruit) | Exists | Phase 3 content rebuild |
| Research Engine | Missing | Build scraping pipeline + Susan ingestion |
| Analytics & Tracking | Missing | Coach visits, scroll depth, film views, conversions |
| A/B Testing | Missing | Variant system for key sections |
| Coach Panel System | Missing | Panel management, feedback collection, metrics |
| Recruiting Operations Dashboard | Missing | Command center for entire pipeline |
| Playwright Test Suite | Missing | Full regression suite |

### Priority Build Order

**P1 — Research Engine**
- Playwright-based web scraper framework (reusable)
- Susan `ingest_url` integration
- Custom ingestion scripts for structured data
- Research indexing and tagging system

**P2 — Analytics & Tracking**
- Coach visit tracking (who, when, from where)
- Scroll depth and section engagement metrics
- Film view analytics (play, watch duration)
- Contact form conversion tracking
- "Coach Interest Score" model

**P3 — A/B Testing Infrastructure**
- Simple variant system for key sections
- Coach persona → variant assignment logic
- Metrics collection per variant

**P4 — Coach Panel System**
- Panel recruitment tracking
- Structured feedback collection (survey + open-ended)
- Funnel visualization (visited → scrolled → watched → contacted → "would recruit")

**P5 — Playwright Full Regression**
- Coach journey E2E tests
- REC system functionality tests
- Performance benchmarks (Core Web Vitals)
- Visual regression (screenshot comparison)
- Cross-browser/device testing

**P6 — Recruiting Operations Dashboard**
- Single screen showing: coach pipeline, outreach status, site analytics, panel feedback, research coverage
- The command center for the entire recruiting operation

### Push to Susan
Once complete, sync to Susan's team:
- Research engine → Susan's RAG pipeline
- Coach analytics → Susan's alex-recruiting knowledge base
- Playbook outputs → Susan's agent prompts
- Panel feedback → Susan's continuous improvement loop

---

## Phase 5: Playwright Full Regression Suite (Weeks 4-5)

### Test Categories

**Coach Journey E2E**
- Land on /recruit, verify all sections render
- Scroll through each section, verify GSAP animations trigger
- Play film, verify video loads and tracks
- Submit contact form, verify submission
- Verify mobile responsiveness
- Measure load time < 3 seconds

**REC System Tests**
- Coach CRM functionality
- DM campaign flows
- NCSA pipeline processing
- AI persona responses
- X content generation

**Performance**
- Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
- Animation smoothness (60fps during GSAP transitions)
- Image optimization verification

**Visual Regression**
- Screenshot comparison for each section
- Cross-browser consistency (Chrome, Safari, Firefox)
- Mobile vs desktop layout verification

---

## Phase 6: Coach Panel & Feedback Loop (Weeks 5-8)

### Panel Composition (30 coaches)
- 10 FBS coaches (Power 5 + Group of 5)
- 10 FCS coaches (sweet spot targets)
- 5 D2 coaches (fallback tier)
- 5 D3/NAIA coaches (baseline validation)

Mix of: head coaches, position coaches (OL/DL), recruiting coordinators.

### Feedback Protocol
1. Coach receives link (via email or DM, simulating real outreach)
2. Visits site — all behavior tracked
3. Completes 5-question survey:
   - "Would you recruit this athlete?" (Yes / Maybe / No) — **primary metric**
   - "What convinced you?" (open text)
   - "What almost made you leave?" (open text)
   - "How does this compare to other recruit profiles?" (1-10)
   - "Would you share this with your coaching staff?" (Yes / No)
4. Optional 5-minute follow-up call

### Iteration Cycle
- **Round 1** (Week 5-6): First 10 coaches → analyze → revise
- **Round 2** (Week 6-7): Next 10 coaches → analyze → revise
- **Round 3** (Week 7-8): Final 10 coaches → validate 95% target

### Data Storage
- Survey responses in Supabase
- Behavioral analytics in Supabase
- All feedback ingested into Susan's RAG
- Dashboard shows real-time panel progress

---

## Overall Timeline

| Week | Phase | Deliverables |
|------|-------|-------------|
| 1-2 | Research Acquisition | 5 streams active. 2,000+ chunks ingested. Coach DB expanded. |
| 2-3 | Intelligence Synthesis | Coach Decision Playbook v1. Personas. A/B variants. |
| 3-4 | Site Content Rebuild | /recruit content rewritten per Playbook. |
| 3-5 | App Gap Fill | Research engine, analytics, A/B, panel system, dashboard. |
| 4-5 | Playwright Suite | Full regression: journey + REC + performance + visual. |
| 5-6 | Panel Round 1 | First 10 coaches. Analyze. Revise. |
| 6-7 | Panel Round 2 | Next 10 coaches. Analyze. Revise. |
| 7-8 | Panel Round 3 + Susan Sync | Final 10. Hit 95%. Push to Susan. |

---

## Success Criteria

- **Primary**: 95% of 30-coach panel says "Yes, I would recruit him"
- **Secondary**: Average site comparison score > 8/10
- **Secondary**: > 80% would share with coaching staff
- **Technical**: Zero Playwright test failures, Core Web Vitals all green
- **Research**: 2,000+ recruiting-specific chunks in Susan's RAG
- **App**: All 6 priority components operational in Recruiting Studio
