# Outsider Recruit Test Protocol

## Purpose
Validate that a high school recruit who has NEVER seen this app can figure out what it does, navigate it, and complete key tasks — without help. If the app only works for Jacob because he knows the context, it's not good enough.

## Who Is the Outsider?
- A high school athlete (any sport, any position) who is thinking about college recruiting
- NOT a developer, NOT someone who knows Jacob personally
- Ideally a sophomore or junior (Class of 2027 or 2028) so they have recruiting context
- 2 outsiders minimum (research shows 3-5 evaluators find 75% of usability problems)

## Scheduling
- **Test 1:** During Jacob's Day 3 (before Jacob has deep familiarity)
- **Test 2:** During Jacob's Day 7 (after fixes from Test 1 findings)
- Each test takes ~60 minutes total

---

## Test Setup

### What the Outsider Receives
- The URL: https://alex-recruiting.vercel.app
- A phone or laptop to use
- Nothing else. No explanation. No walkthrough. No context.

### Recording
- Screen recording on (phone or laptop)
- Audio recording on (they should think out loud)
- Mike or the test administrator observes silently, takes notes

### Think-Aloud Instructions
Read this to the outsider before starting:

> "I'm going to show you a web app. I want you to explore it and try to figure out what it does. As you go, please say out loud what you're thinking — what you notice, what confuses you, what you'd click next. There are no wrong answers. If something doesn't make sense, that's useful information for us. I won't answer questions about the app — just use it like you found it on your own."

---

## Phase 1: Unguided Exploration (20 minutes)

### Task
"Open this URL and explore. Figure out what this app does and who it's for."

### What to Observe and Record

| Metric | How to measure |
|--------|---------------|
| Time to first understanding | Stopwatch: how long until they say "Oh, this is for..." |
| First words spoken | Write down verbatim — reveals mental model |
| First confusion point | What page/element caused the first "I don't get this" |
| Navigation pattern | Which pages did they click first? Which did they skip? |
| Dead ends | Did they click something that went nowhere or showed an error? |

### Key Questions (ask AFTER the 20 minutes, not during):
1. "What does this app do?"
2. "Who is it for?"
3. "If you were using this for your own recruiting, what would you do first?"

### Scoring

| Score | Criteria |
|-------|----------|
| 5 | Understood purpose in < 30 seconds, identified it as a recruiting tool |
| 4 | Understood purpose in < 2 minutes, mostly correct |
| 3 | Understood purpose in < 5 minutes, partially correct |
| 2 | Took > 5 minutes, got the general idea but missed key features |
| 1 | Could not identify the purpose after 20 minutes |

**Target: 4 or higher.**

---

## Phase 2: Task-Based Evaluation (30 minutes)

Give 5 tasks with NO instructions on HOW to complete them. Read each task aloud, one at a time. Wait for completion or surrender before moving to the next.

### Task 1: "Find coaches Jacob should contact"
**Expected path:** Navigate to `/coaches` or `/outreach`, find the coach list, filter or browse

| Outcome | Score |
|---------|-------|
| Completed without help | 3 |
| Completed with 1 hint | 2 |
| Completed with significant help | 1 |
| Could not complete | 0 |

**What to record:** Which page did they go to first? Did they find the filters? Did they understand tier/division labels?

---

### Task 2: "Schedule a post for Tuesday"
**Expected path:** Navigate to `/content-queue` or `/content/calendar`, find a draft, schedule it

| Outcome | Score |
|---------|-------|
| Completed without help | 3 |
| Completed with 1 hint | 2 |
| Completed with significant help | 1 |
| Could not complete | 0 |

**What to record:** Could they find the content section? Did they understand post status (draft/approved/scheduled)? Did the scheduling UI make sense?

---

### Task 3: "Upload a highlight video"
**Expected path:** Navigate to `/media` or `/videos`, find upload button, select a file

| Outcome | Score |
|---------|-------|
| Completed without help | 3 |
| Completed with 1 hint | 2 |
| Completed with significant help | 1 |
| Could not complete | 0 |

**What to record:** Did they find the upload button? Did they know where to go (media vs videos vs photos)? Did the upload complete successfully?

---

### Task 4: "Check how the X account is performing"
**Expected path:** Navigate to `/analytics` or `/dashboard`, find follower count and engagement rate

| Outcome | Score |
|---------|-------|
| Completed without help | 3 |
| Completed with 1 hint | 2 |
| Completed with significant help | 1 |
| Could not complete | 0 |

**What to record:** Did they go to analytics or dashboard? Did they understand the metrics? Did they question any numbers?

---

### Task 5: "Find upcoming football camps"
**Expected path:** Navigate to `/camps` or `/measurables`, find camp list

| Outcome | Score |
|---------|-------|
| Completed without help | 3 |
| Completed with 1 hint | 2 |
| Completed with significant help | 1 |
| Could not complete | 0 |

**What to record:** Could they find camps? Did they understand the camp data? Did they know what action to take?

---

### Task Score Summary

| Task | Score (0-3) | Notes |
|------|------------|-------|
| 1. Find coaches | ___ | |
| 2. Schedule a post | ___ | |
| 3. Upload a video | ___ | |
| 4. Check X performance | ___ | |
| 5. Find camps | ___ | |
| **Total** | **___/15** | |

**Target: 12/15 or higher (80%).**

---

## Phase 3: Overall Impressions (10 minutes)

### System Usability Scale (SUS)
The industry-standard 10-question usability survey. The outsider rates 1 (Strongly Disagree) to 5 (Strongly Agree).

1. I think that I would like to use this app frequently.
2. I found the app unnecessarily complex.
3. I thought the app was easy to use.
4. I think that I would need the support of a technical person to use this app.
5. I found the various functions in this app were well integrated.
6. I thought there was too much inconsistency in this app.
7. I would imagine that most people would learn to use this app very quickly.
8. I found the app very cumbersome to use.
9. I felt very confident using the app.
10. I needed to learn a lot of things before I could get going with this app.

**SUS Scoring:** ((Sum of odd-numbered scores - 5) + (25 - sum of even-numbered scores)) * 2.5

| SUS Score | Rating |
|-----------|--------|
| 80+ | Excellent — top 10% of apps |
| 68-79 | Good — above average |
| 51-67 | OK — needs improvement |
| Below 50 | Poor — significant usability problems |

**Target: 68+ (Good).**

### Net Promoter Score
"On a scale of 0-10, how likely would you be to recommend this app to another recruit's family?"

| Score | Category |
|-------|----------|
| 9-10 | Promoter |
| 7-8 | Passive |
| 0-6 | Detractor |

### Open-Ended Question
"If you could change one thing about this app, what would it be?"

Write their answer verbatim. This is often the most valuable insight.

---

## Post-Test Analysis

After both outsider tests, compile:

1. **Common confusion points** — anything BOTH outsiders struggled with is a design problem, not a user problem
2. **Task failure patterns** — which tasks had the lowest scores? Those features need redesign
3. **First-click analysis** — where did outsiders go first for each task? If it's not where the feature lives, the navigation needs work
4. **SUS comparison** — if Test 2 SUS is higher than Test 1, fixes are working. If lower, something regressed
5. **Verbatim quotes** — collect the most revealing think-aloud quotes for the severity matrix

### Severity Classification for Outsider Findings

| Pattern | Severity |
|---------|----------|
| Both outsiders couldn't complete a task | P0 |
| One outsider failed, one struggled | P1 |
| Both completed but took > 2 minutes | P2 |
| Minor confusion, quickly self-corrected | P3 |
