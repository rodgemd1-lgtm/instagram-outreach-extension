# 25X Launch Readiness Plan — Alex Recruiting

**Date:** 2026-03-17
**Status:** Approved
**Author:** Mike Rodgers + Claude Engineering Team

## Executive Summary

A three-phase launch readiness program that takes Alex Recruiting from "working prototype" to "production-grade recruiting tool a high school freshman uses daily." The "25X" standard means this is not a beta test — it is a certification process with hard gates between phases.

**Timeline:** No rush. Fix everything first, then test.

---

## Phase 1: Engineering Fix Sprint (3-5 days)

Four AI engineering agents work in parallel. Each has a specific discipline, checklist, and deliverables. No human touches the app until all four complete their work.

### Agent Assignments

| Agent | Discipline | Focus Areas |
|-------|-----------|-------------|
| Full-stack | Architecture + integration | Request lifecycle traces, API consistency, env var validation, rate limit handling |
| Frontend | UI/UX + accessibility | Nielsen's 10 heuristics across 49 pages, empty states, mobile nav, responsive breakpoints |
| Backend | Database + security | Supabase RLS audit, schema reconciliation, OAuth 1.0a write testing, Zod input validation |
| QA | Testing + edge cases | Edge case test suite, visual regression screenshots, zero-fake-data assertions |

### Full-Stack Engineer Deliverables

**5 Request Lifecycle Traces** — trace every hop from click to database and back:

1. **Create + publish a post:** Button → `/api/posts` POST → DB insert → `/api/posts/[id]/send` → X API `postTweet()` → DB update `xPostId`
2. **Send a DM:** Compose → `/api/dms` POST → `verifyHandle()` → `sendDM()` → DB update `sentAt`
3. **Upload media:** File picker → `/api/media/upload` → Supabase Storage → DB record
4. **Follow a coach:** Follow plan → `followUser()` → DB update `followStatus`
5. **Dashboard load:** Page mount → `/api/dashboard/live` → X API calls → response rendering

**Architecture checklist:**
- [ ] All data-serving API routes have `force-dynamic`
- [ ] Error responses follow consistent `{ error: string, details?: string }` shape
- [ ] No API route silently swallows errors (every catch logs + returns error)
- [ ] Environment variables validated at startup, not at first use
- [ ] X API rate limits tracked — app knows when quota is exhausted

### Frontend Engineer Deliverables

**Every page audit (49 pages):**
- [ ] Has a clear purpose visible in 5 seconds
- [ ] Has a loading state (skeleton or spinner)
- [ ] Has an empty state with CTA when no data
- [ ] Works at 375px (iPhone SE), 768px (iPad), 1440px (desktop)
- [ ] No horizontal scroll on mobile
- [ ] Touch targets >= 44x44px on mobile
- [ ] Text contrast ratio >= 4.5:1 (WCAG AA)
- [ ] No fake/hardcoded data anywhere

**Navigation audit:**
- [ ] Every page reachable in <= 2 clicks from sidebar
- [ ] Mobile bottom nav has the right 5 items
- [ ] Back button works correctly on every page
- [ ] Active page highlighted in sidebar/nav

### Backend Engineer Deliverables

**Database security:**
- [ ] RLS enabled on every Supabase table
- [ ] Anon key cannot read sensitive tables (dm_messages, credentials)
- [ ] No API keys in git history
- [ ] Connection pooling configured for Vercel serverless
- [ ] Drizzle schema matches actual Supabase tables (zero drift)

**API contracts:**
- [ ] Every POST/PUT validates input (Zod or manual)
- [ ] Every endpoint returns proper HTTP status codes
- [ ] No endpoint exposes internal error messages to client
- [ ] OAuth 1.0a writes (follow, DM, post) work on Vercel production

### QA Engineer Deliverables

**Test coverage targets:**

| Layer | Current | Target |
|-------|---------|--------|
| Unit | ~63 | 120+ |
| Integration | ~13 | 40+ |
| E2E | ~10 | 25+ |
| Data integrity | 2 | 10+ |

**Edge case test matrix:**

| Category | Tests |
|----------|-------|
| X API failures | Token expired, rate limit 429, malformed response, 503 downtime |
| Media upload | 0-byte file, 100MB+, corrupt JPEG, iPhone HEIC, video > 2:20 |
| AI generation | Anthropic timeout, empty response, response exceeds limit |
| Offline/slow | No network, 3G throttle, Vercel cold start |

### Phase 1 Gate

Build passes, all tests green, zero fake data in any UI, OAuth writes confirmed on Vercel. Every P0 and P1 from engineering checklists resolved.

---

## Phase 2: Panel Certification (1-2 days)

Each engineering discipline produces a scored rubric. Findings go into a severity matrix.

### Severity Matrix

| Level | Definition | Resolution |
|-------|-----------|------------|
| P0 Critical | App broken, data loss, security hole | Must fix before Phase 3 |
| P1 Major | Feature doesn't work, significant UX friction | Must fix before Phase 3 |
| P2 Minor | Works but rough, visual inconsistencies | Fix during Phase 3 |
| P3 Enhancement | Nice-to-have, polish, optimization | Backlog |

### Phase 2 Gate

Zero P0s. Zero P1s. All 4 engineering disciplines sign off.

---

## Phase 3: Live Field Test (10 days + 3 days)

### Jacob's 10-Day Diary Study

Each day builds on the previous. By Day 10, Jacob has used every major feature.

| Day | Theme | Morning (5 min) | After Practice (10 min) | Evening (10 min) |
|-----|-------|-----------------|------------------------|-------------------|
| 1 | First Launch | Open app cold. Navigate every sidebar link. Note what makes sense, what doesn't | — | Fill out daily log |
| 2 | Profile Setup | Check recruit page. Is bio/measurables/GPA correct? | Upload 1 practice photo | Verify photo appears in media library |
| 3 | Coach Discovery | Browse coaches. Filter by division. Find 5 D3 coaches with X handles | — | Check if the 5 coaches match real coaches on X |
| 4 | Follow Execution | Check outreach follow plan. Manually follow 5 coaches on X | — | Come back to app — did it detect the follows? |
| 5 | Content Review | Go to content queue. Review AI-drafted posts. Approve 1, reject 1 | Upload a highlight video clip | CHECKPOINT CALL with Mike — screen share, review scores |
| 6 | Post to X | Find approved post. Hit "Send" to publish to X | — | Verify post appears on X with correct content/hashtags |
| 7 | Analytics Check | Open analytics. Do followers/engagement match X profile? | — | Screenshot X profile + analytics page side by side |
| 8 | DM Drafting | Go to DMs. Draft a DM to a D3 coach | — | Review the draft. Does it sound like Jacob, not a robot? |
| 9 | Agency Chat | Open agency/nina. Ask about coach engagement | Upload a game film clip | Ask agency/trey to draft a post about the clip |
| 10 | Full Review | Check every metric on dashboard. Does anything look fake? | — | FINAL CHECKPOINT CALL — complete SUS survey, final score |

**Daily Log (Jacob fills out each evening):**
1. What did you do in the app today? (1-2 sentences)
2. Did anything break or confuse you? (yes/no + what)
3. Did anything feel good or surprise you? (yes/no + what)
4. Rate today: 1 (frustrating) to 5 (awesome)
5. One thing you wish it could do

**Key validation moments:**
- Day 3: Coach data verified against real X profiles
- Day 4: Follow detection tested
- Day 6: End-to-end post publishing (app content → X)
- Day 7: Analytics cross-check (app numbers vs X numbers)
- Day 9: AI personas tested (useful advice vs generic)

### Outsider Recruit Test (3 days)

A different high school recruit gets the URL cold — no explanation, no walkthrough.

**Day 1: Cold Start (1 hour)**

| Phase | Duration | What happens | Measurement |
|-------|----------|-------------|-------------|
| Unguided exploration | 20 min | Hand them the URL. Say nothing | Time to understand, first confusion |
| 5 tasks, no instructions | 30 min | See task list below | Score 0-3 per task |
| Debrief | 10 min | SUS questionnaire | SUS score (target: 68+) |

**The 5 tasks:**
1. Find out which coaches this athlete should contact this week
2. Look at the content calendar and find what's scheduled next
3. Upload a photo from your camera roll
4. Check how the athlete's X account is performing
5. Find a camp happening this summer

**Scoring:** 3 = completed alone, 2 = one hint, 1 = heavy help, 0 = couldn't complete. Pass: 12/15.

**Day 2: Explore as "their own" (30 min)**
"If this app existed for your sport, what would you want it to do?" Free exploration. Note which pages they use and which they ignore.

**Day 3: Final impressions (15 min)**
NPS: "How likely would you recommend this to another recruit's family? 0-10."
Open-ended: "What's the one feature that would make you use this every day?"

### Phase 3 Gate

Jacob's daily score averages 4+ out of 5. Outsider completes 4/5 tasks without help. Zero data integrity issues over 10 days.

---

## Success Criteria Summary

| Metric | Target |
|--------|--------|
| Engineering P0/P1 issues | 0 |
| Test count | 200+ across all layers |
| Fake data in UI | 0 instances |
| Jacob daily score average | 4.0+ / 5.0 |
| Outsider task completion | 12+ / 15 |
| Outsider SUS score | 68+ (above average) |
| X-to-dashboard data match | Within 1 hour on every metric |
| OAuth write operations | Follow, DM, Post all working on Vercel |
| Media upload | iPhone HEIC + 4K video both work |
| Mobile responsive | All 49 pages work at 375px |
| WCAG AA compliance | Contrast, touch targets, alt text on all pages |

---

## What This Is NOT

- Not a "ship it and see" beta test
- Not a demo for investors
- Not a checklist someone skims and marks done
- This is a certification process. If a gate fails, you go back and fix it. No exceptions.
