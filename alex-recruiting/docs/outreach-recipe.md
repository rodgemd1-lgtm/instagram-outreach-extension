# Alex Recruiting: Outreach Recipe
## `alex-recruiting-outreach` — Reusable State Campaign Pattern

**Purpose**: Systematically identify, research, personalize, and stage D3 coach outreach for Jacob Rodgers (Class of 2029, OL/DL, Pewaukee HS WI).

---

## Recipe: Scrape → Curate → Personalize → Stage → Send

### Phase 1: Scrape

**Target**: NCAA D3 football programs in a given state.

**What to collect per school:**
| Field | How to Get | Priority |
|-------|-----------|----------|
| School name + location | Conference website | Required |
| Conference | DIII.info or school site | Required |
| Head coach + email | School athletics staff directory | High |
| OL coach + email | Same — this is Jacob's primary contact | **Critical** |
| Offensive Coordinator + email | Same | High |
| 2024 season record | cfbdreference.com or school site | Medium |
| Notable program facts | Wikipedia, school athletics page | Medium |
| X/Twitter handles | Twitter search or staff directory | Low |

**Search patterns that work:**
```
"[school name] football coaching staff 2024"
"[school name] football OL coach email site:edu"
"[school name] athletics staff directory"
site:[school.edu] football coaching
```

**Key D3 state sources:**
- Conference websites: MIAC (MN), MIAA (MI), ARC (IA/IL), MWC (WI)
- DIII.info — lists all programs by state
- d3football.com — rankings and staff coverage
- Each school's athletics.edu site — most accurate for emails

---

### Phase 2: Curate

**Criteria for including a coach in outreach:**
- [ ] School is NCAA D3 (not NAIA or D2)
- [ ] Football program is active (not suspended)
- [ ] OL/DL coach identified (or head coach handles OL)
- [ ] School fits Jacob's academic + fit profile (strong academics, competitive program, Wisconsin-accessible)
- [ ] No prior outreach sent (check existing outreach data files)

**Jacob's profile for personalization:**
- Name: Jacob Rodgers
- Class: 2029
- School: Pewaukee High School, Pewaukee, Wisconsin
- Positions: OL (Center/Guard) and DL (Defensive Tackle) — two-way starter
- Stats: 6'4" / 285 lbs | Bench Press: 265 lbs | Squat: 350 lbs
- GPA: Strong academics (mention academic fit)
- Camp: Elite Prospects Camp (attended)
- Film: NCSA profile (link available on request)
- Personality: Physical, coachable, loves competing in the trenches

---

### Phase 3: Personalize

**Each coach entry needs 3 pieces of content:**

#### 1. DM (X/Twitter Direct Message)
- Max 280 chars (Twitter limit)
- Opener: "Coach [LastName] —"
- Mention a specific school/program detail (record, coach tenure, conference)
- Jacob's key stats in one line: "6'4" 285, two-way OL/DL"
- Clear ask: camps, visit, or "stay on your radar"
- Sign off: "Thank you, Coach!"

**Template:**
```
Coach [LastName] — I'm Jacob Rodgers, Class of 2029 OL/DL from Pewaukee HS (WI).
6'4" 285, two-way starter. [Specific school detail]. Would love to learn about
camps or visit opportunities this summer. Thank you, Coach!
```

#### 2. Email
- Subject: `Jacob Rodgers — Class of 2029 OL/DL, Pewaukee HS (WI)`
- Para 1: Intro + specific hook (research, compliment, connection)
- Para 2: Stats + brief program fit explanation
- Para 3: Specific ask (camp dates, visit, next steps)
- Sign: Jacob Rodgers (no parent signature — Jacob is reaching out)
- Length: 150-250 words max. Coaches are busy.

**Template body:**
```
Coach [LastName],

[Opening hook — specific to their program. Examples: recent season success,
coach tenure milestone, conference rep, academic reputation. Be specific
enough that they know you actually researched them.]

Stats: 6'4" / 285 lbs | Bench: 265 | Squat: 350

[Why this school fits Jacob — 2-3 sentences. Reference conference, academics,
geography, program culture. Be genuine, not generic.]

[Specific ask — upcoming camps, prospect days, or visit opportunities.]

Thank you for your time, Coach.

Jacob Rodgers
```

#### 3. X Callout Post (Public)
- 200-260 chars
- Positive tone — excited to learn about the program
- Tag school Twitter if known
- End with hashtags: `#D3Football #RecruitJacob #[StateName]D3`

**Template:**
```
[Excited opener about school/program]. As a Class of 2029 OL/DL from Wisconsin
(6'4" 285), [specific connection to program]. [Camp/visit aspiration]!
#D3Football #RecruitJacob #[State]D3
```

---

### Phase 4: Stage

**File structure (follow Iowa D3 pattern):**
```typescript
// src/lib/data/[state]-d3-outreach.ts

export interface CoachOutreach {
  coachName: string;
  schoolName: string;
  position: string;        // "Offensive Line Coach" | "Head Coach / OL" | etc.
  email: string | null;    // null if not found
  xHandle: string | null;  // null if not found
  emailDraft: { subject: string; body: string };
  dmDraft: string;
  xCallout: string;
  wave: number;            // 1, 2, or 3 — for send scheduling
  priority: "high" | "medium" | "low"; // based on program quality/fit
}

export const [STATE]_D3_OUTREACH: CoachOutreach[] = [
  // ... coaches
];
```

**API seed route (follow Iowa D3 pattern):**
```
src/app/api/outreach/seed-[state]-d3/route.ts
```

The seed route:
1. Iterates `[STATE]_D3_OUTREACH`
2. Creates email draft in `email_outreach` table (or in-memory)
3. Creates DM draft via `insertDM()`
4. Creates X callout post draft via `insertPost()`
5. Returns summary JSON with created/skipped/error counts

**To stage:** `POST /api/outreach/seed-[state]-d3` with `Authorization: Bearer [CRON_SECRET]`

---

### Phase 5: Send

**Wave schedule:**
- Wave 1 (Week 1): Top 5 programs by priority — send DMs first
- Wave 2 (Week 2): Next 5 programs
- Wave 3 (Week 3): Remaining

**Send via:**
- DMs: `POST /api/dms/send` — requires `X_API_BEARER_TOKEN`
- Emails: `POST /api/outreach/send-emails` — requires `RESEND_API_KEY` + custom domain
- X posts: Manual (until X OAuth write is fully configured)

**Don't send without:**
- [ ] Vercel env vars set: `RESEND_API_KEY`, `X_API_BEARER_TOKEN`
- [ ] Custom Resend domain (avoid spam filter)
- [ ] Wave 1 IOF Iowa coaches already responded (or 2+ weeks elapsed)

---

## State Campaign Files (Current Status)

| State | Outreach File | Seed Route | Status |
|-------|-------------|-----------|--------|
| Iowa (D3) | `iowa-d3-outreach.ts` | `seed-iowa-d3/route.ts` | ✅ Complete |
| Illinois (D3) | `illinois-d3-outreach.ts` | `seed-illinois-d3/route.ts` | ✅ Complete (main branch) |
| Minnesota (D3) | `mn-d3-outreach.ts` | `seed-mn-d3/route.ts` | 🔄 In progress (see session notes) |
| Michigan (D3) | `mi-d3-outreach.ts` | `seed-mi-d3/route.ts` | 🔄 In progress (see session notes) |
| Wisconsin (D3) | — | — | 📋 Planned |
| Indiana (D3) | — | — | 📋 Planned |
| Ohio (D3) | — | — | 📋 Planned |

---

## Conferences to Target (Midwest D3 Football)

| Conference | States | Top Programs |
|-----------|--------|-------------|
| MIAC | MN | St. John's, Bethel, Gustavus |
| MIAA | MI + IN | Hope, Trine, Albion, Adrian |
| ARC | IA + IL + WI | Wartburg, Central, UW-Whitewater |
| CCIW | IL + WI | North Central, Wheaton |
| MWC | WI | UW-Oshkosh, UW-Stevens Point, UW-Whitewater |
| OAC | OH | Mount Union, Ohio Northern |
| PAC | IN + OH | Manchester, Defiance |

---

## Quality Checklist (Before Sending Any Campaign)

- [ ] Coach name verified against current staff directory (coaches change!)
- [ ] Email format verified (most follow firstname.lastname@school.edu)
- [ ] School is actively D3 (check DIII.info — some schools leave division)
- [ ] No duplicate — check existing outreach files
- [ ] Jacob's stats current (update if measurables change)
- [ ] DMs under 280 chars (Twitter limit)
- [ ] Emails 150-250 words
- [ ] No religious, political, or financial references in any message
- [ ] Wave assignment logical (best programs in Wave 1)
- [ ] Seed route uses CRON_SECRET auth guard

---

## Outreach Guardrails (From Memory)

Per Mike's hard rules (see `feedback_outreach_guardrails.md`):
- NO religious, political, or financial references
- All data verified via scraping — no hallucinated coach names
- Personalization must be specific and researched, not generic
- Always check current coaching staff (coaches move frequently)
