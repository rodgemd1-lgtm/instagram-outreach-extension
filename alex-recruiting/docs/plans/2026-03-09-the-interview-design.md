# "The Interview" — Recruit Page Redesign Design Doc

**Date:** March 9, 2026
**Status:** Approved
**Concept:** The page IS a conversation between Jacob and a coach. Not sections — dialogue beats. The camera shifts between them using the rule of thirds.

---

## Core Philosophy

The page reads like a coach sat down with Jacob and asked him questions. Content alternates left and right across the screen. When Jacob speaks, his content occupies the right 2/3. When the coach's perspective matters, that content occupies the left 2/3. The alternation creates the back-and-forth rhythm of a real conversation.

No traditional sections. No section headers. No icons. No emojis. Just dialogue.

---

## Color System

| Role | Color | Usage |
|------|-------|-------|
| Primary BG | `#000000` black | 60% — page background |
| Text | `#FFFFFF` white | 30% — all body text |
| Accent | `#ff000c` Pewaukee red | 10% — dividers, borders, play buttons, CTA highlights |
| Muted | `#9CA3AF` gray-400 | Labels, context lines, timestamps |
| Card BG | `#111111` near-black | Coach beat backgrounds (differentiation on mobile) |

**Zero gold anywhere.** All `#D4A853` references must be removed from the codebase entirely.

---

## Animation System

| Element | Animation | Direction | Trigger |
|---------|-----------|-----------|---------|
| Jacob beats | `translateX(60px→0), opacity(0→1)` | From right | ScrollTrigger |
| Coach beats | `translateX(-60px→0), opacity(0→1)` | From left | ScrollTrigger |
| Stat counters | GSAP counter `0→N`, power3.out, 1.5s | — | ScrollTrigger (Film pinned) |
| Typewriter text | 40ms/char, setInterval | — | ScrollTrigger enters viewport |
| Character cards | `translateY(40px→0)` staggered | Up (G-Card stack) | ScrollTrigger, 0.2s stagger |
| The Fit blocks | `translateY(30px→0)` progressive | Up | ScrollTrigger while pinned |
| Contact | Both halves `translateX` toward center | Left+Right converge | ScrollTrigger |
| Timeline panels | `translateX(60px→0), opacity(0→1)` staggered | From right | ScrollTrigger per panel |
| Activity indicator | `opacity` pulse | CSS animation | Always |

**Rules:**
- All animations use `transform` and `opacity` only (GPU-accelerated)
- `prefers-reduced-motion` disables all animations, shows content statically
- Duration: 0.6-0.8s for slides, 1.5s for counters, 40ms/char for typewriter
- Easing: `power3.out` for GSAP, `ease-out` for CSS

---

## Dialogue Beats

### BEAT 1: THE INTRODUCTION
**Speaker:** Jacob | **Position:** Right 2/3 | **Slides from:** Right

Full viewport, black canvas. Name and measurables occupy right 2/3.

Content:
```
CLASS OF 2029

JACOB
RODGERS

#79 · DT / OG · 6'4" · 285
Pewaukee HS · Wisconsin
Varsity Starter · Two-Way Lineman

▼ Watch the film
```

- Ghosted "79" at 15% opacity bleeds across the left third
- Background: dark, with optional Luma/Kling atmospheric B-roll (slow motion cinematic)
- No animation delay — instant recognition (3-second rule)
- Red (#ff000c) accent on the dot dividers in the measurables bar
- Scroll cue "Watch the film" pulses subtly

---

### BEAT 2: THE FILM
**Speaker:** Jacob | **Position:** Right 2/3 | **Slides from:** Right

Coach's question appears as typewriter on the left margin: *"Can he play?"*

Main content (right 2/3):
- **1 auto-playing highlight reel** (30-45s, 5-6 plays)
  - Context line above: `Freshman Season · DT & OG · Pewaukee HS · State Playoff Run`
- **4 additional videos below** with professional splash screens:
  1. Pass Protection highlights (custom cinematic thumbnail, red play button)
  2. Run Blocking / Drive Blocks (custom thumbnail)
  3. DT Technique — swim move, pursuit (custom thumbnail)
  4. NCSA Evaluation Video (custom thumbnail)
- Each splash screen: cinematic still frame, red `#ff000c` play button overlay, label text
- Below video grid, stat counters animate in on scroll:
  - `445 Deadlift · 265 Bench · 350 Squat · 11 Pancakes · 3 Sacks`
- Hudl CTA: `Full Film on Hudl →`

**Pinning behavior:** Section pins while stat counters animate. Unpins after all counters resolve.

---

### BEAT 3: THE COACH EVALUATES
**Speaker:** Coach | **Position:** Left 2/3 | **Slides from:** Left

Typewriter types the coach's internal monologue:

```
"He's got D1 size at 15. 445 deadlift as a freshman.
But is he self-made, or just big?"
```

- Smaller beat — breathing moment / transition
- Dark background with slightly lighter (#111) card
- This question sets up the next beat

---

### BEAT 4: THE WORK
**Speaker:** Jacob | **Position:** Right 2/3 | **Slides from:** Right

Vertical timeline, each panel fades in from right on scroll:

```
Training since age 11. 730+ sessions. Still going.

AGE 11 (2021)
NX Level — twice a week. Speed, agility, footwork.
[NX Level link for credibility]

AGE 12 (2022)
Added weight training. NX Level continues.
Bench: 95 | Squat: 135

AGE 13 (2023)
365 sessions. Added personal trainer.
Compound movements for OL/DL.
Bench: 155 | Squat: 225

AGE 14 (2024-25)
Freshman starter — varsity AND JV. Two games in one day.
11 pancakes. 3 sacks. State playoff run.
Bench: 265 | Squat: 350 | Deadlift: 445

AGE 15 (NOW)
School lifts + personal trainer 2x/week + NX Level 1x/week.
Off-season: building size, speed, and agility.
Track & Field: 1st place discus, 1st place shot put.
The trajectory has not flattened.
```

- NX Level linked with credibility context
- Started at age **11** (corrected from previous versions)
- Current schedule shows full commitment breakdown
- Lift numbers counter-animate within each panel
- Red timeline connector line between panels
- Track & field and snowboarding woven in as multi-sport/well-rounded signals at age 15

---

### BEAT 5: THE COACH REFLECTS
**Speaker:** Coach | **Position:** Left 2/3 | **Slides from:** Left

Typewriter:

```
"Four years of documented work. Real facility. Real trainer.
The kid is serious. But will he fit our locker room?"
```

- Another coaching monologue beat
- Slides from left, typewriter creates suspense

---

### BEAT 6: WHO JACOB IS
**Speaker:** Jacob | **Position:** Right 2/3 | **Slides from:** Right

Opens with typewriter:
```
"Numbers tell you what he can do.
These tell you what he will do."
```

Three traits as G-Card stack (slide up with 0.2s stagger):

**TEAM FIRST** (leads)
Freshmen don't start on varsity at Pewaukee. Jacob earned it from day one. Shows up doing the work seniors do. Never acted like it was owed.

**COACHABLE**
Learns from his peers just as much as his coaches. Takes correction, applies it the next rep.

**RELENTLESS**
Has not missed a scheduled session since 2021. 730+. NX Level. Trainer. Discus. Shot put. Snowboarding. Football. He doesn't stop.

Then typewriter types the coach quote:
```
"[Real quote from head coach]"
— Coach [Name], Pewaukee HS
```

- Red left-border accent on each trait card
- Team First emphasized per requirements

---

### BEAT 7: ACADEMICS (Inline)
**Speaker:** — | **Position:** Centered | **Animation:** Fade in

```
GPA: 3.25  ·  NCAA Eligible  ·  NCSA Verified
```

- Single horizontal bar, centered
- Red dot dividers
- Binary check. No drama.

---

### BEAT 8: THE COACH DECIDES
**Speaker:** Coach | **Position:** Left 2/3 | **Slides from:** Left | **PINNED**

This is the moment of truth. The section pins.

Opens with typewriter:
```
"If you're evaluating a lineman right now,
here's why Jacob should be on your board."
```

Progressive disclosure while pinned:

**DEVELOPMENT RUNWAY**
If you see what he can do at 15, imagine his full potential in college.

**WHAT HE'S LOOKING FOR**
A program with a strong D-line and O-line tradition. He wants to help on both sides of the field.

**THE WINDOW**
Building his school list now. Sophomore film drops this fall. The conversation starts here.

● 12 programs have viewed this page this month

- Three blocks reveal one by one on scroll while pinned
- "Both sides of the field" — D-line AND O-line
- Live activity indicator pulses to trigger loss aversion
- After all blocks reveal, section unpins

---

### BEAT 9: LET'S TALK
**Speaker:** Both | **Position:** Centered | **Slides from:** Both converge to center

The dialogue concludes. Both sides meet in the middle.

```
Let's Talk.
Interested in Jacob? Reach out directly.

[LEFT: Contact Info]     [RIGHT: Send a Message]
Email                    Name: [          ]
Phone                    School: [        ]
Twitter                  Email: [         ]
Hudl                     Message: [       ]
NCSA                     [Send]

Jacob Rodgers · #79 · DT/OG · Class of 2029
Pewaukee HS · Wisconsin
```

- Contact info (left) slides from left, form (right) slides from right — they meet in the center
- Direct contact first (email, phone) — primary action
- Form secondary
- No giant background text. Clean, professional.
- Footer anchors identity one final time

---

## Dialogue Rhythm Summary

| Beat | Speaker | Position | Slides From | Content |
|------|---------|----------|-------------|---------|
| 1 | Jacob | Right 2/3 | Right | Introduction — name, measurables |
| 2 | Jacob | Right 2/3 | Right | Film — 5 videos + stats (PINNED for counters) |
| 3 | Coach | Left 2/3 | Left | "Is he self-made?" |
| 4 | Jacob | Right 2/3 | Right | The Work — age 11 to now, NX Level |
| 5 | Coach | Left 2/3 | Left | "Will he fit?" |
| 6 | Jacob | Right 2/3 | Right | Character — Team First, Coachable, Relentless |
| 7 | — | Centered | Fade | Academics bar |
| 8 | Coach | Left 2/3 | Left | The Fit — why your board (PINNED) |
| 9 | Both | Centered | Converge | Contact — let's talk |

---

## Mobile Responsive Strategy

On mobile (< 768px), the left/right dialogue collapses to full-width:
- Jacob beats: pure black (#000000) background
- Coach beats: near-black (#111111) background — subtle differentiation maintains dialogue rhythm
- All content full-width, stacked vertically
- Animations change from translateX to translateY (slide up instead of left/right)
- Pinned sections still pin but with reduced scroll distance
- Video grid: 2x2 on tablet, 1-column stack on mobile

---

## Content Assets Needed

| Asset | Source | Status |
|-------|--------|--------|
| Action photo for hero background | Family/team media | Needed |
| 5 video splash screens (cinematic thumbnails) | Create from film stills | Needed |
| Highlight reel (30-45s, 5-6 plays) | Existing Hudl film | Available |
| 4 individual clip videos | Cut from highlight reel | Needed |
| NCSA evaluation video | NCSA profile | Available |
| NX Level logo/link | NX Level website | Available |
| Coach quote (attributed) | Request from Pewaukee coaching staff | Needed |
| Track & field footage/stills | Family media | Needed |
| Snowboarding footage/stills | Family media | Needed |
| Luma Dream Machine Pro atmospheric B-roll | Generate via Luma | Planned |
| Kling 3.0 background videos | Generate via Kling | Planned |

---

## Technical Notes

- **Framework:** Next.js 14 App Router, React 18, TypeScript, Tailwind CSS
- **Animation:** GSAP ScrollTrigger for pin/scrub, existing useRecruitAssembly hook
- **Typewriter:** Existing typewriter component (40ms/char, trigger-based)
- **Counters:** Existing counter component (GSAP, power3.out, 1.5s)
- **Video:** HTML5 video with auto-play on desktop, play button on mobile
- **AI-generated content:** Luma Dream Machine Pro for cinematic animations, Kling 3.0 for B-roll
- **Performance:** All animations transform/opacity only. prefers-reduced-motion support.
- **Page view counter:** For "12 programs have viewed this page" — can be a simple API route with database counter, or static placeholder until analytics are wired

---

## What Gets Removed

- All gold (#D4A853) color references across all components
- All emojis and icons
- Traditional section headers/labels
- "RECRUIT ME" background text
- "Coach Lens" panels
- "Review Board" verdicts
- Research-speak ("Research shows...")
- Marketing meta-commentary ("15-SECOND COACH READ")
- Horizontal scroll in Origin Story
- Separate Stats section (merged into Film beat)
- Separate Academics section (compressed to inline bar)
- Social proof banner (urgency now lives in The Fit beat)
