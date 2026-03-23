# Outreach Recipe — D3 Coach Campaign Pipeline

**Version**: 1.0 | **Last updated**: 2026-03-23
**Author**: Jake / Alex Recruiting system

This recipe documents the end-to-end pipeline for researching, personalizing, and sending outreach to D3 football coaches. Follow these steps in order for each new state or conference wave.

---

## Overview

```
SCRAPE → CURATE → PERSONALIZE → SEED → REVIEW → SEND
```

Each step has a clear owner, artifact, and gate before proceeding.

---

## Step 1: SCRAPE — Research Coach Data

**What**: Identify D3 programs in the target state/conference and find OL coaches.

**How**:
1. Run the Explore agent with this prompt template:
   ```
   Research D3 football OL coaches for [STATE] programs. For each coach return:
   - Coach name + title
   - School name + conference
   - Email (verify or infer from school domain pattern)
   - X/Twitter handle if public
   - One specific program detail for personalization (recent record, championship, coach background, notable players)

   Schools to cover: [list from NAIA/NCAA D3 directory]
   ```

2. Target sources the agent should check:
   - School athletic website (`.edu/athletics/football/coaches`)
   - School official press releases
   - Conference websites (MIAC.net, MIAA, A-R-C, etc.)
   - D3Football.com coaching directories

**Output**: Structured JSON/list with all coach data.

**Gate**: Have name + school + at least one contact method (email OR X) for each coach before proceeding.

---

## Step 2: CURATE — Filter and Prioritize

**What**: Review the scraped list and decide which coaches to include in Wave.

**Filter criteria**:
- Is this school geographically reasonable? (within 6-hour drive of Pewaukee preferred)
- Is this school academically aligned with Jacob's goals?
- Does the program have OL development history (All-Conference linemen, recent winning records)?
- Is there a specific detail strong enough for personalization?

**Priority tiers**:
- **Tier 1** (send in Wave): Verified email + specific personalization detail
- **Tier 2** (send next wave): Inferred email + some personalization
- **Tier 3** (hold): Head coach only, no OL coach, or no personalization angle

**Output**: Filtered list of 8-12 coaches per wave, tiered.

---

## Step 3: PERSONALIZE — Write Email, DM, X Callout

**What**: Write all three outreach formats for each coach.

**Format for each coach** (see `src/lib/data/iowa-d3-outreach.ts` as template):

```typescript
{
  coachName: string,
  schoolName: string,
  state: "XX",
  conference: "MIAC" | "MIAA" | ...,
  position: string,
  email: string | null,
  emailVerified: boolean,
  xHandle: string | null,
  programDetail: string,          // the specific hook
  emailDraft: { subject, body },
  dmDraft: string,                // 280-char Twitter DM
  xCallout: string,               // public X post tagging school
  wave: number,
}
```

**Email structure**:
```
1. Opening: First name, school, Jacob's name + class year + position + HS
2. Hook: Reference the SPECIFIC program detail (not generic)
3. Stats line: "6'4" / 285 lbs | Bench: 265 | Squat: 350"
4. Value prop: Why Jacob + why this program specifically
5. Ask: Camps, prospect days, or visit opportunity
6. Sign-off: Jacob's name + school + class + NCSA link
```

**DM structure** (280 chars max):
```
Coach [Last] — I'm Jacob Rodgers, Class of 2029 OL/DL from Pewaukee HS (WI). 6'4" 285. [ONE specific detail]. Any camps or prospect days [this summer]? Thank you!
```

**X Callout structure**:
```
[Specific program achievement/detail]. As a Class of 2029 OL/DL from Wisconsin (6'4" 285), [why this program resonates]. #[Conference] #D3Football #RecruitJacob
```

**Hard rules** (from `feedback_outreach_guardrails.md`):
- NO religious, political, or financial references
- All data must be scraped/verified — no training data assumptions
- Stats must be Jacob's current verified numbers
- NCSA link must be included in every email
- DMs stay under 280 characters

**Output**: TypeScript file at `src/lib/data/[state]-d3-outreach.ts`

---

## Step 4: SEED — Load into Database

**What**: Run the seed route to create email drafts, DM drafts, and X callout posts in the system.

**How**:
1. Create seed route at `src/app/api/outreach/seed-[state]-d3/route.ts`
   (copy pattern from `seed-iowa-d3/route.ts`)
2. Update import to use the new state's outreach data file
3. Update `template_type` string to match new state (e.g., `"mn_mi_d3_outreach"`)
4. Build and deploy
5. POST to the route with CRON_SECRET header:
   ```bash
   curl -X POST https://[your-vercel-url]/api/outreach/seed-[state]-d3 \
     -H "Authorization: Bearer $CRON_SECRET"
   ```

**Optional state filter** (for MI vs MN separately):
```bash
curl -X POST "https://[url]/api/outreach/seed-mn-mi-d3?state=MN" \
  -H "Authorization: Bearer $CRON_SECRET"
```

**Output**: Created records in `email_outreach`, `dm_messages`, and posts tables.

**Gate**: Verify record counts match expected coaches before proceeding to send.

---

## Step 5: REVIEW — Human Approval Gate

**What**: Mike reviews all drafts before sending. No emails or DMs go out without approval.

**Where to review**:
- Emails: `/outreach` tab → Email Drafts
- DMs: `/outreach` tab → DM Queue
- X posts: `/content` tab → Draft posts

**What to check**:
- Personalization detail is accurate and school-specific (not generic)
- Stats are current (6'4" / 285 / Bench 265 / Squat 350 as of 2026-03)
- No policy violations (religious, political, financial, fake data)
- NCSA link is present
- DM is under 280 chars

**Gate**: Mike approves each draft. Status moves from `draft` → `approved`.

---

## Step 6: SEND — Execute Outreach

**What**: Send approved emails via Resend, DMs via X API.

**Email send**:
```bash
# Dry run first (no actual send)
curl -X POST https://[url]/api/outreach/send-emails?dryRun=true \
  -H "Authorization: Bearer $CRON_SECRET"

# Real send
curl -X POST https://[url]/api/outreach/send-emails \
  -H "Authorization: Bearer $CRON_SECRET"
```

**DM send**:
- DMs are sent via `/api/dms/send` route (mock mode until X API configured)
- To send: go to `/outreach` → DM Queue → click Send on each approved DM
- X API token required for real sends (set `X_API_BEARER_TOKEN` in Vercel env)

**Wave timing** (from existing schedule):
```
Wave 1: Friday  — 5 coaches
Wave 2: Saturday — 5 coaches
Wave 3: Monday  — 4-5 coaches (wait until wave 1 has had 2+ days)
Hold:   Next week — coaches needing verification
```

**Output**: `email_outreach.status` → `sent`, `dm_messages.status` → `sent`

---

## File Naming Convention

```
src/lib/data/[state-abbr]-d3-outreach.ts        # coach data
src/app/api/outreach/seed-[state]-d3/route.ts   # seed route
```

**Examples**:
- `iowa-d3-outreach.ts` → `seed-iowa-d3/route.ts`
- `illinois-d3-outreach.ts` → `seed-illinois-d3/route.ts`
- `mn-mi-d3-outreach.ts` → `seed-mn-mi-d3/route.ts`

---

## Current Campaign Status

| State/Region | Coaches | File | Seed Route | Wave |
|-------------|---------|------|------------|------|
| Iowa D3 | 8 coaches | `iowa-d3-outreach.ts` | ✅ `seed-iowa-d3` | 1-2 |
| Illinois D3 | 11 coaches | `illinois-d3-outreach.ts` | ✅ `seed-illinois-d3` | 3 (hold) |
| MN + MI D3 | 12 coaches | `mn-mi-d3-outreach.ts` | ✅ `seed-mn-mi-d3` | 3 |

**Next states to add**: Ohio D3 (OAC), Wisconsin D3 (WIAC), Indiana D3 (HCAC)

---

## Scaling Notes

- Each wave targets 5-6 coaches max to maintain personal feel
- Follow-up sequence: 1 week after no reply, send follow-up DM
- Track open rates via Resend webhook (`/api/outreach/webhooks/resend`)
- Response rate target: 20%+ opens, 5%+ replies at D3 level
- If coach responds, move them to `/agency/leads` as NCSA lead and assign to Nina
