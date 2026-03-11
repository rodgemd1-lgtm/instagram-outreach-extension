# Jacob Rodgers Recruit Website Redesign — Design Document

**Date:** March 9, 2026
**Status:** Approved for implementation
**Aesthetic:** Friday Night Lights — warm cinematic documentary
**Primary User:** College football coaches (position coaches, recruiting coordinators, head coaches)

---

## Problem

The current recruit page is functional but lacks the cinematic emotional impact needed to convert a skeptical, time-poor coach into one who reaches out. Videos are broken or hard to find, the contact form doesn't work, there's no background music, no typewriter narrative motion, no film grain texture, and the page reads more like a tech portfolio than a recruiting packet that moves a coach to act. The page needs to feel like a documentary about an athlete worth investing in.

## Goal

Transform the recruit page into a Hollywood-quality, coach-converting experience that answers the four recruiting questions in order (Who is Jacob? Can he play? Why stay interested? What's my next move?) within the 47-second window, using behavioral science, cinematic motion, and emotional storytelling to make the coach feel they've discovered someone worth pursuing.

---

## Research Foundation

### The Coach's Mental Model (from narrative-strategy-blueprint.md)

Coaches arrive through 4 paths: forwarded link, X/Twitter bio, NCSA/Hudl search, or cold outreach DM. Their default state is:
- **Skeptical** — hundreds of profiles seen, most overhyped by parents
- **Time-poor** — 10-15 seconds before deciding to keep scrolling
- **Pattern-matching** — scanning for disqualifiers first, qualifiers second
- **Emotionally guarded** — looking for evidence, not stories

### The 47-Second Rule

- **3 seconds:** Coach decides if recruit is in their physical/positional window
- **10 seconds:** Coach decides if the page is worth their time
- **47 seconds:** Average total time before deciding to watch film, reach out, or close the tab

### Athlete Profile (Corrected — from narrative-v2.md)

- **Jacob Rodgers** — #79, DT/OG, Class of 2029 (sophomore)
- **6'4", 285 lbs** — D1 measurables as a freshman
- **Pewaukee HS, Wisconsin** — competitive program, deep state playoff run
- **Stats:** 11 pancake blocks, 3 sacks, 1 fumble recovery (freshman)
- **Strength:** Bench 265, Squat 350, Deadlift 405 (PR)
- **Training:** 730+ sessions since age 12, NX Level agility, personal trainer
- **Multi-sport:** First place in discus and shot put
- **Academics:** 3.25 GPA, NCAA eligible, NCSA verified
- **One-sentence:** A 6'4" 285-lb freshman who deadlifts 405, starts both sides of the ball, plays two games in a day, and throws discus for first place — with three more years to grow.

### Competitive Patterns (from 10x plan)

Five-star and high-momentum recruits consistently:
- Make evaluation fast — strongest plays first, not a slow intro
- Keep profile information consistent across website, film, socials, NCSA
- Pair highlight film with deeper film and easy contact
- Make projection obvious: body type, movement traits, development habits, role fit
- Do not ask coaches to hunt for the story

---

## Aesthetic System: Friday Night Lights

### Visual Language

The FNL aesthetic creates documentary intimacy — the feeling of being on the sideline of a Friday night game in small-town America. Warm, golden, cinematic. Not polished corporate. Real.

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--fnl-black` | `#0A0A0A` | Page background |
| `--fnl-black-warm` | `#0D0B08` | Section alternate background |
| `--fnl-gold` | `#D4A853` | Primary accent, highlights, interactive |
| `--fnl-gold-bright` | `#E8C068` | Hover states, emphasis |
| `--fnl-crimson` | `#C0392B` | CTA buttons, urgency signals |
| `--fnl-crimson-dark` | `#A33225` | Button hover |
| `--fnl-warm-white` | `#F5F0E6` | Body text |
| `--fnl-warm-gray` | `#8B8172` | Secondary text |
| `--fnl-warm-gray-dark` | `#5A5247` | Tertiary text, captions |
| `--fnl-pewaukee-red` | `#CC0022` | School color (used sparingly) |

### Typography

| Role | Font | Weight | Usage |
|------|------|--------|-------|
| Display | Playfair Display | 700, 900 | Section headings, hero name, narrative titles |
| Display Italic | Playfair Display Italic | 700 | Narrative voice, pull quotes, typewriter text |
| Body | Inter | 400, 500, 600 | UI text, descriptions, form labels |
| Mono | JetBrains Mono | 400 | Measurables, stats, data, tracking labels |

### Texture & Atmosphere

- **Film grain overlay:** CSS noise texture at 3-5% opacity, animated with subtle keyframe shift
- **Light leaks:** Radial gradients in warm gold/amber positioned at top-left and bottom-right, 8-12% opacity
- **Vignette:** Radial gradient dark edges on each section, 15-20% intensity
- **Warm fog:** Soft radial blur spots in amber/gold at section transitions
- **Halftone dots:** Subtle dot pattern at 2% opacity in select backgrounds

### Motion Language

| Type | Duration | Easing | Usage |
|------|----------|--------|-------|
| Hero assembly | 300-600ms per element | `back.out(1.7)` | Initial page load reveals |
| Scroll reveal | 400-600ms | `power2.out` | Section elements entering viewport |
| Typewriter | 40ms per character | linear | Narrative text appearance |
| Ken Burns | 8-12s | `sine.inOut` | Background image slow zoom/pan |
| Counter tick | 1.5s total | `power3.out` | Stat numbers counting up |
| Film grain | 100ms loop | step | Texture animation |
| Parallax | scroll-driven | linear | Background depth layers at 0.3-0.5 rate |
| Mobile fallback | 300-400ms | `power2.out` | All animations simplified on mobile |

### Sound Design

- Background music: ambient instrumental track (FNL-style atmospheric, 15-20% volume)
- Autoplay with muted default, unmute toggle in corner
- Music fades in on scroll past hero, gentle volume curve
- Toggle persists via localStorage

---

## Section Architecture

### Section Flow with Time Budgets

```
[1] HERO                    3s    — "Is this kid in my window?"
[2] FILM                    15-30s — "Can he play?"
[3] SOCIAL PROOF TICKER     3s    — "Who else is looking?"
[4] THE WORK (Origin)       15s   — "What's his work ethic?"
[5] MULTI-SPORT             8s    — "What supports the projection?"
[6] CHARACTER               10s   — "Will he fit our locker room?"
[7] THE FIT                 10s   — "Why should we recruit him?"
[8] CONTACT                 5s    — "How do I reach out?"
```

Sections 1-3 carry 80% of persuasive weight. Everything after is confirmation — the coach has already decided to be interested or not, and remaining sections either confirm or derail that interest.

---

### Section 1: HERO (3 seconds)

**Coach question:** "Is this kid in my window?"
**Emotion target:** RECOGNITION — instant pattern match
**Behavioral mechanism:** Known-ness (LAAL) — establish identity in under 3 seconds

**Design:**

- Full-viewport cinematic hero with Ken Burns slow-zoom on action photo
- Film grain overlay across entire section
- Warm golden light leak from top-left corner
- Vignette darkening at edges

**Content hierarchy (assembly order):**

1. `CLASS OF 2029` — amber mono kicker, tracking-widest
2. `JACOB RODGERS` — Playfair Display 900, massive (7-9rem desktop)
3. Measurables rail: `#79 | DT/OG | 6'4" | 285 | Pewaukee HS, WI`
4. Coach Snapshot card — glass panel with "Why Select Jacob", "Why Stay Interested", "Moments of Truth"
5. Two CTAs: "Watch the Film" (crimson primary) + "Contact Family" (ghost)
6. Scroll cue with subtle bounce animation

**Motion:**
- Wave 1 staggered assembly: jersey number fades (0.4s) → kicker slides up (0.35s) → name + copy slides up (0.35s) → actions slide up (0.35s) → snapshot card slides up (0.35s) → scroll cue fades (0.35s)
- Ken Burns on background: continuous slow zoom from 1.0 to 1.08 over 12s
- Total assembly: ~2.5s

**Key changes from current:**
- Add Playfair Display for the name heading
- Add film grain + light leak overlays
- Add Ken Burns to background image
- Warm the color palette from cool red/amber to warm gold/crimson
- Make the scroll cue more cinematic (no bouncing chevron — use a thin golden line that extends downward)

---

### Section 2: FILM (15-30 seconds)

**Coach question:** "Can he play?"
**Emotion target:** IMPRESSED — this kid has real film
**Behavioral mechanism:** Known-ness (LAAL) — the film proves the measurables

**Design:**

- Lead with the CapCut highlight reel — large, autoplay-ready video player
- Video player with custom controls: play/pause, mute, fullscreen, progress bar in gold
- Below the main reel: grid of individual ranked clips with category tags (OL, DL, leverage, finish, pursuit)
- Coach reasons cards alongside: "Get-off", "Strike timing", "Leverage", "Finish", "Effort after first contact"
- Supporting reels row: training reel, snowboard reel, legacy trench reel

**Motion:**
- Video player fades in with slight scale (0.98 → 1.0)
- Clip grid staggers in as cards
- Coach reason cards slide in from right

**Key changes from current:**
- Fix video playback (ensure all video URLs resolve, add error fallbacks)
- Add clip category tags (OL, DL, hands, leverage, finish, pursuit)
- Custom video player skin matching FNL aesthetic
- Autoplay main reel when scrolled into view (muted by default)

---

### Section 3: SOCIAL PROOF TICKER (3 seconds)

**Coach question:** "Who else is looking at this kid?"
**Emotion target:** URGENCY — you're not the only one watching
**Behavioral mechanism:** Scarcity + social proof + loss aversion

**Design:**

- Horizontal scrolling ticker bar between Film and The Work
- Shows live NCSA feed data (schools that have viewed Jacob's profile)
- Counter: "X schools viewed this profile this month"
- Counter animation: numbers tick up from 0 to actual count
- If no live data, show verified static facts: "NCSA Verified", "Hudl Film Available", "730+ Training Sessions"

**Motion:**
- Infinite horizontal scroll animation (CSS translateX, 30s loop)
- Counter numbers animate on scroll-enter using GSAP
- Subtle gold border-top and border-bottom

**Key changes from current:**
- Add animated counter for training sessions, school views
- Connect to NCSA API if available, otherwise static proof points
- Redesign from static banner to moving ticker

---

### Section 4: THE WORK — Origin Story (15 seconds)

**Coach question:** "What's his work ethic?"
**Emotion target:** RESPECT — this kid earns it
**Behavioral mechanism:** Temporal Window (LAAL) — coach sees the development timeline and trajectory

**Design:**

- Typewriter narrative section — Playfair Display Italic, warm white on dark
- Text appears character by character as user scrolls into view
- Narrative content: "Since age 12, five days a week. 730 sessions. Not because someone made him. Because he chose it."
- Alongside: vertical timeline showing key milestones (age 12 start, NX Level, freshman varsity, double-duty games, track power)
- Training stats with counter animations: 730+ sessions, 405 deadlift PR, 5 days/week since age 12
- Background: subtle parallax training facility image

**Motion:**
- Typewriter effect: 40ms per character, triggered on scroll-enter
- Timeline nodes pulse in sequence as scroll progresses
- Stat counters tick up from 0
- Background parallax at 0.3 rate

**Key changes from current:**
- Add typewriter text reveal effect
- Add animated counters for training stats
- Replace static timeline with scroll-animated vertical timeline
- Add parallax background

---

### Section 5: MULTI-SPORT (8 seconds)

**Coach question:** "What else supports the projection?"
**Emotion target:** IMPRESSED — the power story extends beyond football
**Behavioral mechanism:** Ownership Accumulation (LAAL) — coach starts building a mental case

**Design:**

- Track and field proof block: structured data showing throw marks, placements, school-record proximity
- Connection narrative: "Explosive hip power from throws translates directly to blocking and pass rush. Coaches know this."
- Snowboard section: balance, body control, coordination evidence
- Counter animations for throw distances, placements

**Motion:**
- Cards stagger in on scroll
- Numbers count up
- Subtle gold accent on proof data

**Key changes from current:**
- Add structured throw-mark proof component (per 10x plan)
- Add counter animations for distances/placements
- Tighter connection to football transfer value

---

### Section 6: CHARACTER (10 seconds)

**Coach question:** "Will he fit in our locker room?"
**Emotion target:** TRUST — this is a real kid with real values
**Behavioral mechanism:** Ownership (LAAL) — coach takes psychological possession

**Design:**

- Cinematic portrait photo with Ken Burns effect
- Character traits as elegant cards: work ethic, coachability, team-first, two-game days
- Pull quote in Playfair Display Italic — something from a coach or teammate
- Warm, intimate tone — this section should feel like sitting across from Jacob's family

**Motion:**
- Ken Burns on portrait image
- Cards fade in with stagger
- Quote appears with typewriter effect

---

### Section 7: THE FIT (10 seconds)

**Coach question:** "Why should we recruit him?"
**Emotion target:** DESIRE — I want this kid on my roster
**Behavioral mechanism:** Ownership + Loss Aversion (LAAL) — make the coach feel what they'd miss

**Design:**

- Direct recruiting questions answered: "What does Jacob bring to your program?"
- Three projection cards: "Year 1", "Year 2", "Year 3-4" showing development trajectory
- Loss-aversion frame: "The coach who sees this early gets a three-year head start. The coach who waits will be competing against every other program that discovers him."
- Playfair Display heading, warm crimson accents

**Motion:**
- Cards slide in sequentially
- Loss-aversion text appears with slight delay for emphasis

---

### Section 8: CONTACT (5 seconds)

**Coach question:** "How do I reach out?"
**Emotion target:** ACTION — zero-friction path to connection
**Behavioral mechanism:** Forgiving Stakes (LAAL) — make the first step feel effortless

**Design:**

- Working contact form (fix the broken POST endpoint)
- Family email: rodgermd1@gmail.com
- Quick links: main highlight, coach reel, legacy reel, X/Twitter, YouTube
- Film links open in new tabs
- Success state: warm confirmation with green accent
- Background: subtle ghosted #79

**Form fields:** Name, School, Email, Phone (optional), Message
**API:** POST to `/api/recruit/contact` — already implemented with Supabase + JSON fallback

**Motion:**
- Content fades in on scroll
- Form inputs have subtle focus animations (gold border glow)
- Submit button has satisfying press/release animation

**Key changes from current:**
- Debug and fix the contact form submission
- Verify the API route works in production (Vercel)
- Add input focus animations
- Add form validation feedback
- Warm the color scheme to match FNL palette

---

## New Features (10)

### 1. Background Music System

- Ambient instrumental track (FNL-style atmospheric, ~15-20% volume)
- Starts muted, small toggle icon in top-right corner
- Toggle: speaker icon with gold accent
- Volume fades in smoothly on unmute
- State persisted in localStorage
- Implementation: HTML5 Audio API, no third-party player
- Track: royalty-free cinematic instrumental (user to provide)

### 2. Typewriter Narrative Motion

- Playfair Display Italic text that appears character by character
- Triggered on scroll-enter via ScrollTrigger
- Speed: 40ms per character
- Used in: The Work section (primary), Character section (pull quote)
- Cursor: blinking gold underline that advances with text
- Respects `prefers-reduced-motion`: shows text immediately if set

### 3. Live NCSA Feed / Social Proof Ticker

- Horizontal scrolling ticker showing school interest signals
- Data source: NCSA scrape endpoint (`/api/rec/ncsa/scrape`) or static verified facts
- Format: "University of [X] viewed profile" + timestamp
- Fallback: static proof points (NCSA Verified, training sessions, track results)
- CSS infinite scroll animation

### 4. Film Grain Overlay

- CSS-only animated noise texture
- Semi-transparent (3-5% opacity) overlaying entire page
- Animated via CSS keyframes (background-position shift every 100ms)
- Adds documentary/cinematic texture
- Zero performance impact (CSS-only, no canvas)

### 5. Counter Animations

- Numbers that count up from 0 to target value on scroll-enter
- Used for: training sessions (730+), deadlift PR (405), bench (265), squat (350)
- GSAP-powered with `power3.out` easing
- Duration: 1.5 seconds
- Format: number + unit suffix

### 6. Ken Burns Effect

- Slow continuous zoom/pan on hero and character background images
- CSS transform: `scale(1.0) → scale(1.08)` over 12 seconds
- Subtle position shift: `translate(0, 0) → translate(-2%, -1%)`
- Creates cinematic life in static images
- Implementation: CSS animation or GSAP timeline

### 7. Scroll Progress Bar

- Already exists (`scroll-progress.tsx`) — redesign to match FNL palette
- Thin gold bar at top of viewport
- Gradient: warm gold to crimson
- Smooth width transition tracking scroll percentage

### 8. Coach Packet Export

- Downloadable one-page PDF summary (per 10x plan)
- Contents: measurables, film links (QR codes), track evidence, contact info
- Generated client-side using html2canvas + jsPDF or similar
- CTA button in Contact section: "Download Coach Packet"
- Deferred to Phase 2 — not in initial redesign

### 9. Working Contact Form

- Debug and fix the existing POST endpoint
- Verify Supabase table `coach_inquiries` exists
- Test JSON fallback path
- Add client-side validation with error messages
- Add success animation (check mark, confirmation text)

### 10. Video Autoplay on Scroll

- Main highlight reel autoplays (muted) when scrolled into view
- Uses IntersectionObserver via useRecruitAssembly hook (already supports this)
- Pause when scrolled out of view
- Muted by default per browser autoplay policies
- Unmute via video controls

---

## Behavioral Science Integration

### LAAL Protocol Mapping

| Section | LAAL Mechanism | Implementation |
|---------|---------------|----------------|
| Hero | Known-ness | Identity established in 3 seconds flat |
| Film | Known-ness | Film proves the measurables claim |
| Social Proof | Temporal Window | "X schools looked this month" creates urgency |
| The Work | Temporal Window | 730 sessions = trajectory coach can project |
| Multi-Sport | Ownership Accumulation | Coach starts building a mental case for Jacob |
| Character | Ownership | Coach takes psychological possession |
| The Fit | Ownership + Loss Aversion | "The coach who sees this early gets a head start" |
| Contact | Forgiving Stakes | Zero-friction first step |

### Behavioral Economics Mechanisms

| Mechanism | Application |
|-----------|-------------|
| Loss aversion | "The Fit" frames what coaches miss by not acting |
| Endowment effect | Film watching creates psychological ownership |
| Scarcity | Social proof ticker shows competitive attention |
| Social proof | School view count, NCSA verification badges |
| Commitment escalation | Each scroll deeper = more invested |
| Anchoring | Lead with strongest measurables and clips |
| Sunk cost | Time watching film makes leaving feel wasteful |

### Emotional Arc

```
HERO:          Recognition  — "He's in my window"
FILM:          Impressed    — "He can play"
SOCIAL PROOF:  Urgency      — "Others are looking"
THE WORK:      Respect      — "He earns it"
MULTI-SPORT:   Impressed    — "The power story extends"
CHARACTER:     Trust        — "He's the right kid"
THE FIT:       Desire       — "I want him on my roster"
CONTACT:       Action       — "Let me reach out"
```

---

## Ethical Boundaries

- No fake stats or inflated numbers
- No altered film speed
- No invented offers or school interest
- No fake social proof (only verified NCSA data or honest static facts)
- No manipulative dark patterns in the contact form
- Music must not auto-play at high volume (respect user control)
- All behavioral science serves honest persuasion, not deception

---

## Technical Specification

### Fonts to Add

```css
/* Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=JetBrains+Mono:wght@400;500&display=swap');
```

### CSS Custom Properties

```css
:root {
  --fnl-black: #0A0A0A;
  --fnl-black-warm: #0D0B08;
  --fnl-gold: #D4A853;
  --fnl-gold-bright: #E8C068;
  --fnl-crimson: #C0392B;
  --fnl-crimson-dark: #A33225;
  --fnl-warm-white: #F5F0E6;
  --fnl-warm-gray: #8B8172;
  --fnl-warm-gray-dark: #5A5247;
  --fnl-pewaukee-red: #CC0022;
}
```

### Film Grain CSS

```css
@keyframes grain {
  0%, 100% { background-position: 0 0; }
  10% { background-position: -5% -10%; }
  30% { background-position: 3% -15%; }
  50% { background-position: 12% 9%; }
  70% { background-position: 9% 4%; }
  90% { background-position: -1% 7%; }
}

.film-grain::after {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  opacity: 0.04;
  background-image: url("data:image/svg+xml,..."); /* noise SVG */
  animation: grain 100ms steps(6) infinite;
}
```

### New Components

| Component | File | Purpose |
|-----------|------|---------|
| `FilmGrainOverlay` | `components/recruit/film-grain.tsx` | CSS noise texture overlay |
| `TypewriterText` | `components/recruit/typewriter.tsx` | Character-by-character text reveal |
| `CounterAnimation` | `components/recruit/counter.tsx` | Number counting animation |
| `KenBurnsImage` | `components/recruit/ken-burns.tsx` | Slow zoom/pan background image |
| `MusicToggle` | `components/recruit/music-toggle.tsx` | Background music player with toggle |
| `SocialProofTicker` | `components/recruit/social-proof-ticker.tsx` | Horizontal scrolling proof banner |

### Modified Components

| Component | Changes |
|-----------|---------|
| `hero.tsx` | FNL palette, Playfair Display, Ken Burns background, film grain, warm light leaks |
| `film-reel.tsx` | Fix video URLs, add clip tags, custom video controls, autoplay on scroll |
| `social-proof.tsx` | Replace with ticker + counter animations |
| `origin-story.tsx` | Add typewriter effect, animated timeline, counter stats, parallax |
| `multi-sport.tsx` | Add structured throw-mark proof, counter animations |
| `character.tsx` | Add Ken Burns portrait, typewriter pull quote |
| `the-fit.tsx` | Add loss-aversion framing, projection cards |
| `contact.tsx` | Fix form, add validation, warm palette, focus animations |
| `nav.tsx` | Warm palette, gold accents |
| `scroll-progress.tsx` | Gold-to-crimson gradient |
| `colors.ts` | Add FNL color tokens alongside Pewaukee colors |
| `recruit/layout.tsx` | Add Playfair Display + JetBrains Mono fonts, film grain global |

### Data Model

No new database tables needed. Contact form uses existing `coach_inquiries` table in Supabase with JSON fallback. NCSA feed data comes from existing scrape pipeline.

### Responsive Behavior

- **Mobile (< 768px):** Single column, simplified animations (`power2.out` only), typewriter speed 30ms, no Ken Burns, no parallax, music toggle smaller
- **Tablet (768-1024px):** Two column where appropriate, reduced Ken Burns
- **Desktop (> 1024px):** Full experience with all effects

### Accessibility

- `prefers-reduced-motion`: disable typewriter (show text immediately), disable Ken Burns, disable parallax, disable film grain animation
- All videos have controls visible
- Music starts muted
- Color contrast: warm white on dark exceeds WCAG AA (ratio > 7:1)
- Form labels properly associated with inputs
- Focus indicators visible (gold ring)

---

## Metrics

| Metric | Target | Rationale |
|--------|--------|-----------|
| North Star | Coach contact form submissions | Direct conversion |
| Time on page | > 60 seconds average | Exceeds 47-second rule |
| Film play rate | > 70% of visitors play main reel | Film is the key proof |
| Scroll depth | > 60% reach Contact section | Full story consumed |
| Form completion | > 5% of visitors who reach Contact | Reasonable conversion |
| Bounce rate | < 40% | Page passes 3-second filter |
| Disconfirming 1 | High bounce + low film play | Hero isn't compelling enough |
| Disconfirming 2 | Deep scroll + zero form submissions | Contact section has friction |

---

## Implementation Priority

### Phase 1: Core Redesign (this sprint)

1. FNL color system + fonts + CSS custom properties
2. Film grain overlay component
3. Hero redesign (Playfair Display, Ken Burns, warm palette)
4. Fix contact form (debug API, add validation)
5. Typewriter text component
6. Counter animation component
7. Origin story redesign (typewriter + counters + timeline)
8. Social proof ticker with counters
9. Film section video fixes + autoplay
10. Scroll progress bar redesign
11. Nav redesign (warm palette)
12. Multi-sport throw-mark proof
13. Character section (Ken Burns portrait)
14. The Fit section (loss-aversion framing)
15. Background music toggle
16. Ken Burns image component

### Phase 2: Enhancement (next sprint)

1. Coach packet PDF export
2. Clip taxonomy tags (OL/DL/hands/leverage/finish/pursuit)
3. Coach Mode toggle
4. Live NCSA feed integration
5. AI clip assistant
