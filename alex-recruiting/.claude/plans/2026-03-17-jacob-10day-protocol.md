# Jacob's 10-Day Diary Study Protocol

## Purpose
Validate that every feature of Alex Recruiting works for a real 14-year-old high school freshman football player over 10 consecutive days of actual use.

## Pre-Test Setup
- Record baseline: X follower count, engagement rate, coaches in pipeline
- Install screen recording capability on Jacob's phone (optional — screenshots work too)
- Bookmark https://alex-recruiting.vercel.app on Jacob's phone and laptop
- Mike reviews this protocol with Jacob so he knows what's coming each day

## Ground Rules
1. Jacob does everything himself — Mike can answer questions but doesn't click for him
2. If something breaks, Jacob screenshots it and writes what happened
3. Jacob fills out the Daily Log every evening (5 minutes max)
4. No one fixes bugs during the test — document everything, fix after
5. Jacob should use his real phone (likely iPhone) for most tasks

---

## Day-by-Day Protocol

### Day 1: First Impressions
**Theme:** Can Jacob figure out what this app does?

| Time | Task | What to observe |
|------|------|-----------------|
| Morning | Open the app for the first time. Browse every page in the sidebar. Don't try to do anything yet — just look | Does Jacob understand what each page is for? Which pages confuse him? |
| Evening | Fill out Daily Log | First impressions score |

**Success criteria:** Jacob can name 3 things the app does without being told.

---

### Day 2: Profile Check
**Theme:** Is Jacob's data correct?

| Time | Task | What to observe |
|------|------|-----------------|
| Morning | Go to `/recruit` (recruit page). Check: Is your name right? Position? School? Class year? Height/weight? GPA? | Any wrong data = P0 |
| After practice | Upload 1 practice photo using your phone. Go to `/media` or `/photos` and upload it | Does the upload work on mobile? Does it appear in the library? |
| Evening | Go to `/photos` — is your uploaded photo there? Fill out Daily Log | Upload success/failure, format handling (iPhone HEIC) |

**Success criteria:** Profile data is 100% accurate. Photo upload works from iPhone.

---

### Day 3: Coach Discovery
**Theme:** Can Jacob find and understand the coach database?

| Time | Task | What to observe |
|------|------|-----------------|
| Morning | Go to `/coaches`. Use the filters to find D3 coaches. Pick 5 coaches who have X handles | Are filters intuitive? Do coaches have real data? |
| After practice | Open one coach's detail page. Read through it | Is the info useful? Does Jacob understand need scores, activity scores? |
| Evening | Open X (Twitter) on your phone. Search for those 5 coaches. Do they match what the app says? Fill out Daily Log | Data accuracy: do the X handles, names, and schools match reality? |

**Success criteria:** 5/5 coaches match real X profiles. Filters work intuitively.

---

### Day 4: Follow Execution
**Theme:** Does the follow plan work?

| Time | Task | What to observe |
|------|------|-----------------|
| Morning | Go to `/outreach`. Check the follow plan. Who does it say to follow today? | Does the outreach page load with real data (not "0 coaches")? |
| After practice | On your phone, go to X and manually follow the 5 coaches from yesterday | Jacob follows real coaches on X |
| Evening | Come back to the app. Go to `/outreach`. Did the app detect that you followed those coaches? Fill out Daily Log | Does follow status sync? (If not, this is a P1 — the app should detect X follows) |

**Success criteria:** Outreach page shows real coach data. Follow status tracking works or its absence is documented.

---

### Day 5: Content Review + CHECKPOINT
**Theme:** Content pipeline end-to-end

| Time | Task | What to observe |
|------|------|-----------------|
| Morning | Go to `/content-queue`. Are there any draft posts waiting for review? If yes, read the top one. Would you actually post this? | Content quality, tone (does it sound like Jacob or like a robot?) |
| After practice | Upload a highlight video clip (30-60 seconds) from your phone | Video upload: file size handling, progress bar, format support |
| Evening | **CHECKPOINT CALL WITH MIKE (15 min):** Screen share. Walk through most-used pages. Review scores from Days 1-5. Discuss what's working and what's not | Trend: are scores going up or flat? What patterns emerge? |

**Success criteria:** Content exists in queue. Video upload works. Jacob's average score is 3+ out of 5.

---

### Day 6: Post to X
**Theme:** Can Jacob publish from the app to X?

| Time | Task | What to observe |
|------|------|-----------------|
| Morning | Find an approved post in `/content-queue`. Hit "Send" to publish it to X | Does the post actually appear on X? Correct content? Correct hashtags? |
| After practice | — | — |
| Evening | Check your X profile. Is the post there? Go to `/analytics`. Does the app show it was published? Fill out Daily Log | End-to-end: app → X → app analytics. All three must match |

**Success criteria:** Post appears on X with correct content. Analytics page reflects the published post.

**NOTE:** If OAuth write operations aren't working yet, skip this day's tasks and document "OAuth not functional" as a P0 blocker.

---

### Day 7: Analytics Cross-Check
**Theme:** Do the numbers add up?

| Time | Task | What to observe |
|------|------|-----------------|
| Morning | Open `/analytics`. Screenshot it. Open your X profile. Screenshot it | Side-by-side comparison |
| After practice | — | — |
| Evening | Compare the two screenshots. Do followers match? Do post counts match? Is engagement rate believable? Fill out Daily Log | Any number that doesn't match = P1. Any fake-looking number = P0 |

**Math verification tasks:**
- Followers on app vs. X profile — must match within 1 hour of check
- Posts Published on app vs. actual X posts from app — must match exactly
- Engagement rate: does the percentage make sense given likes/impressions?

**Success criteria:** All metrics match X profile within acceptable tolerance.

---

### Day 8: DM Drafting
**Theme:** Outreach communication

| Time | Task | What to observe |
|------|------|-----------------|
| Morning | Go to `/dms`. Draft a DM to a D3 coach you followed on Day 4 | Is the DM drafting interface intuitive? |
| After practice | — | — |
| Evening | Read your draft. Does it sound like you (Jacob) or does it sound like a robot? Would you actually send this to a coach? Fill out Daily Log | Tone, authenticity, personalization |

**Success criteria:** DM drafting works. Content feels personal enough that Jacob would send it.

---

### Day 9: Agency Team Chat
**Theme:** AI personas

| Time | Task | What to observe |
|------|------|-----------------|
| Morning | Go to `/agency/nina`. Ask Nina: "Which coaches should I DM next and why?" | Does Nina give useful, specific advice based on Jacob's actual data? |
| After practice | Upload a game film clip. Go to `/agency/trey`. Ask Trey: "Can you draft a post about this clip?" | Can Trey generate content based on actual uploaded media? |
| Evening | Go to `/agency/sophie`. Ask Sophie: "How am I doing this week?" Fill out Daily Log | Does Sophie reference real analytics, not generic advice? |

**Success criteria:** AI personas give specific, data-informed answers — not generic recruiting tips.

---

### Day 10: Full Review + FINAL CHECKPOINT
**Theme:** Everything works together

| Time | Task | What to observe |
|------|------|-----------------|
| Morning | Go to the dashboard. Check every number. Does anything look fake? Go to every page you visited over the past 10 days | Final data integrity sweep |
| After practice | — | — |
| Evening | **FINAL CHECKPOINT CALL WITH MIKE (30 min):** Complete SUS questionnaire (10 questions). Review all Daily Log scores. Identify top 3 things that worked and top 3 things that didn't | Overall verdict: is this app helping Jacob with recruiting? |

**Final assessment questions for Jacob:**
1. Would you use this app every day without being asked?
2. Would you recommend it to a teammate who's also trying to get recruited?
3. What's the one thing you'd change first?
4. Do you trust the numbers the app shows you?
5. Does the app make you feel more or less confident about recruiting?

**Success criteria:** Jacob's average Daily Log score is 4+ out of 5. He says he'd use it without being asked. He trusts the numbers.

---

## Escalation Protocol

During the 10-day test, issues are logged but NOT fixed. Exceptions:

| Severity | Action |
|----------|--------|
| **App is completely broken** (white screen, can't load) | Fix immediately, note the downtime |
| **Data is wildly wrong** (shows 10,000 followers when Jacob has 4) | Log as P0, tell Jacob to ignore that number |
| **Feature is confusing but functional** | Log as P1/P2, let Jacob work through it |
| **Missing feature** | Log as P1, skip that day's task |

---

## What Mike Should Track

During each checkpoint call, Mike observes:
- Is Jacob engaged or checked out?
- Does he navigate confidently or hesitate?
- Does he ask "what does this mean?" on any page?
- Does he try to do things the app doesn't support?
- Does he mention wanting features that don't exist?

These observations go into the post-test severity matrix v2.
