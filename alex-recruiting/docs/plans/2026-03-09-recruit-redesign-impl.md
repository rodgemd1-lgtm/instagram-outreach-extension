# Recruit Website FNL Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the recruit page from a tech-portfolio aesthetic to a Friday Night Lights cinematic documentary experience that converts coaches within the 47-second window.

**Architecture:** Modify existing recruit components in-place. Add 6 new utility components (FilmGrain, TypewriterText, CounterAnimation, KenBurnsImage, MusicToggle, SocialProofTicker). Update the color system and font stack. Fix the broken contact form. All animations use the existing `useRecruitAssembly` GSAP hook.

**Tech Stack:** Next.js 14, React 18, TypeScript, GSAP + ScrollTrigger, Tailwind CSS, Playfair Display + JetBrains Mono (Google Fonts), HTML5 Audio API

**Design doc:** `docs/plans/2026-03-09-recruit-redesign-design.md`

---

## Phase 1: Foundation (Tasks 1-4)

These tasks set up the color system, fonts, and global overlays. Everything else depends on these.

---

### Task 1: Add FNL Color System

**Files:**
- Modify: `src/lib/recruit/colors.ts`

**Step 1: Add FNL color tokens to the existing color file**

Add these exports below the existing `PIRATE_COLORS` and `PIRATE_GRADIENTS`:

```typescript
/** Friday Night Lights — warm cinematic palette */
export const FNL_COLORS = {
  black: "#0A0A0A",
  blackWarm: "#0D0B08",
  gold: "#D4A853",
  goldBright: "#E8C068",
  crimson: "#C0392B",
  crimsonDark: "#A33225",
  warmWhite: "#F5F0E6",
  warmGray: "#8B8172",
  warmGrayDark: "#5A5247",
} as const;

export const FNL_GRADIENTS = {
  /** Primary CTA button */
  button: "from-[#C0392B] to-[#A33225]",
  buttonHover: "from-[#D4432F] to-[#C0392B]",
  /** Text accent gradient */
  textAccent: "from-[#D4A853] to-[#E8C068]",
  /** Section divider */
  divider: "from-transparent via-[#D4A853]/20 to-transparent",
  /** Scroll progress */
  progress: "from-[#D4A853] via-[#E8C068] to-[#C0392B]",
  /** Light leak overlay */
  lightLeak: "from-[#D4A853]/12 via-transparent to-transparent",
  /** Vignette */
  vignette: "radial-gradient(ellipse at center, transparent 50%, rgba(10,10,10,0.6) 100%)",
} as const;
```

**Step 2: Verify file is valid TypeScript**

Run: `cd alex-recruiting && npx tsc --noEmit src/lib/recruit/colors.ts 2>&1 | head -5`
Expected: No errors

**Step 3: Commit**

```bash
git add src/lib/recruit/colors.ts
git commit -m "feat(recruit): add FNL cinematic color system"
```

---

### Task 2: Add Google Fonts (Playfair Display + JetBrains Mono)

**Files:**
- Modify: `src/app/recruit/layout.tsx`

**Step 1: Add font imports and apply to layout**

Replace the entire file with:

```tsx
import type { Metadata, Viewport } from "next";
import { Playfair_Display, JetBrains_Mono } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jacob Rodgers | #79 | OL/DL | Class of 2029 | Pewaukee Pirates",
  description:
    "6'4\" 285 | Class of 2029 lineman with defensive-line upside, offensive-line versatility, first-place track-and-field power, restored legacy film, and Jacob's CapCut highlight reel. Pewaukee HS, Wisconsin.",
  openGraph: {
    title: "Jacob Rodgers | #79 OL/DL | Class of 2029 | Pewaukee Pirates",
    description:
      "6'4\" 285 lineman with defensive-line upside, offensive-line versatility, restored film libraries, and multi-sport power transfer. Pewaukee HS, Wisconsin. Class of 2029.",
    type: "website",
    images: [
      {
        url: "/recruit/photos/promo-graphic.jpg",
        width: 1200,
        height: 630,
        alt: "Jacob Rodgers #79 — Pewaukee Pirates Football",
      },
    ],
    videos: [
      {
        url: "/recruit/featured-clips/jacob-capcut-highlight.mp4",
        width: 1280,
        height: 720,
        type: "video/mp4",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jacob Rodgers | #79 OL/DL | Pewaukee Pirates",
    description:
      "6'4\" 285 lineman. Defensive-line upside, offensive-line versatility, restored film, and track-and-field power.",
    images: ["/recruit/photos/promo-graphic.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0A0A0A",
};

export default function RecruitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`recruit-page bg-[#0A0A0A] text-[#F5F0E6] min-h-screen overflow-x-hidden ${playfair.variable} ${jetbrains.variable}`}
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        touchAction: "pan-y",
      }}
    >
      {children}
    </div>
  );
}
```

Key changes: `text-white` → `text-[#F5F0E6]` (warm white), added Playfair Display + JetBrains Mono font variables.

**Step 2: Add Tailwind font-family utilities**

Modify: `tailwind.config.ts` — add to `theme.extend.fontFamily`:

```typescript
fontFamily: {
  playfair: ['var(--font-playfair)', 'Georgia', 'serif'],
  jetbrains: ['var(--font-jetbrains)', 'monospace'],
},
```

**Step 3: Verify build compiles**

Run: `cd alex-recruiting && npm run build 2>&1 | tail -10`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/app/recruit/layout.tsx tailwind.config.ts
git commit -m "feat(recruit): add Playfair Display and JetBrains Mono fonts"
```

---

### Task 3: Create Film Grain Overlay Component

**Files:**
- Create: `src/components/recruit/film-grain.tsx`

**Step 1: Create the component**

```tsx
"use client";

export function FilmGrainOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9999] opacity-[0.035]"
      aria-hidden="true"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat",
        backgroundSize: "256px 256px",
        animation: "grain 80ms steps(4) infinite",
      }}
    />
  );
}
```

**Step 2: Add the grain keyframe animation to globals.css**

Add at the end of `src/app/globals.css`:

```css
/* Film grain animation for recruit page */
@keyframes grain {
  0%, 100% { background-position: 0 0; }
  25% { background-position: -5% -10%; }
  50% { background-position: 12% 9%; }
  75% { background-position: 9% -6%; }
}

@media (prefers-reduced-motion: reduce) {
  .recruit-page [aria-hidden="true"] {
    animation: none !important;
  }
}
```

**Step 3: Add FilmGrainOverlay to the recruit page**

Modify `src/app/recruit/page.tsx` — add import and render inside the `<div ref={pageRef}>`:

```tsx
import { FilmGrainOverlay } from "@/components/recruit/film-grain";

// Inside the return, after <ScrollProgress />:
<FilmGrainOverlay />
```

**Step 4: Verify it renders**

Run: `cd alex-recruiting && npm run build 2>&1 | tail -5`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add src/components/recruit/film-grain.tsx src/app/globals.css src/app/recruit/page.tsx
git commit -m "feat(recruit): add film grain overlay for FNL cinematic texture"
```

---

### Task 4: Create Utility Components (TypewriterText, CounterAnimation, KenBurnsImage)

**Files:**
- Create: `src/components/recruit/typewriter.tsx`
- Create: `src/components/recruit/counter.tsx`
- Create: `src/components/recruit/ken-burns.tsx`

**Step 1: Create TypewriterText component**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";

interface TypewriterTextProps {
  text: string;
  /** Milliseconds per character. Default 40. */
  speed?: number;
  className?: string;
  /** If true, starts immediately. Otherwise waits for `trigger`. */
  autoStart?: boolean;
  trigger?: boolean;
}

export function TypewriterText({
  text,
  speed = 40,
  className = "",
  autoStart = false,
  trigger = false,
}: TypewriterTextProps) {
  const [displayedCount, setDisplayedCount] = useState(0);
  const [started, setStarted] = useState(autoStart);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (trigger && !started) setStarted(true);
  }, [trigger, started]);

  useEffect(() => {
    if (!started || reducedMotion) {
      if (reducedMotion) setDisplayedCount(text.length);
      return;
    }

    setDisplayedCount(0);
    intervalRef.current = setInterval(() => {
      setDisplayedCount((prev) => {
        if (prev >= text.length) {
          clearInterval(intervalRef.current);
          return prev;
        }
        return prev + 1;
      });
    }, speed);

    return () => clearInterval(intervalRef.current);
  }, [started, text, speed, reducedMotion]);

  const done = displayedCount >= text.length;

  return (
    <span className={className}>
      {text.slice(0, displayedCount)}
      {started && !done && (
        <span className="inline-block w-[2px] h-[1em] bg-[#D4A853] ml-0.5 animate-pulse align-text-bottom" />
      )}
    </span>
  );
}
```

**Step 2: Create CounterAnimation component**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

interface CounterAnimationProps {
  target: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
  trigger?: boolean;
}

export function CounterAnimation({
  target,
  suffix = "",
  prefix = "",
  duration = 1.5,
  className = "",
  trigger = false,
}: CounterAnimationProps) {
  const [value, setValue] = useState(0);
  const animated = useRef(false);
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (reducedMotion) {
      setValue(target);
      return;
    }
    if (!trigger || animated.current) return;
    animated.current = true;

    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration,
      ease: "power3.out",
      onUpdate: () => setValue(Math.round(obj.val)),
    });
  }, [trigger, target, duration, reducedMotion]);

  return (
    <span className={className}>
      {prefix}{value.toLocaleString()}{suffix}
    </span>
  );
}
```

**Step 3: Create KenBurnsImage component**

```tsx
"use client";

import Image from "next/image";

interface KenBurnsImageProps {
  src: string;
  alt: string;
  className?: string;
  /** Zoom duration in seconds. Default 12. */
  duration?: number;
}

export function KenBurnsImage({
  src,
  alt,
  className = "",
  duration = 12,
}: KenBurnsImageProps) {
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
        style={
          reducedMotion
            ? undefined
            : {
                animation: `kenBurns ${duration}s ease-in-out infinite alternate`,
              }
        }
      />
    </div>
  );
}
```

**Step 4: Add Ken Burns keyframe to globals.css**

Append to the recruit CSS section in `src/app/globals.css`:

```css
@keyframes kenBurns {
  0% { transform: scale(1) translate(0, 0); }
  100% { transform: scale(1.08) translate(-1.5%, -1%); }
}
```

**Step 5: Verify build compiles**

Run: `cd alex-recruiting && npm run build 2>&1 | tail -10`
Expected: Build succeeds

**Step 6: Commit**

```bash
git add src/components/recruit/typewriter.tsx src/components/recruit/counter.tsx src/components/recruit/ken-burns.tsx src/app/globals.css
git commit -m "feat(recruit): add TypewriterText, CounterAnimation, KenBurnsImage components"
```

---

## Phase 2: Section Redesigns (Tasks 5-12)

Each task transforms one existing section. These can be done in parallel since they modify separate files.

---

### Task 5: Redesign Hero Section

**Files:**
- Modify: `src/components/recruit/hero.tsx`

**Goal:** Apply FNL palette, Playfair Display headings, warm light leaks, Ken Burns background, gold accents. Keep the existing GSAP assembly logic.

**Key changes:**
- Import `KenBurnsImage` — use instead of plain `Image` for background
- Change `h1` to use `font-playfair` class
- Change kicker text from `text-amber-300/85` to `text-[#D4A853]/85`
- Change measurable label color from `text-white/35` to `text-[#8B8172]`
- Change measurable value color from `text-white/92` to `text-[#F5F0E6]`
- Change body text from `text-white/72` to `text-[#F5F0E6]/72`
- Change primary CTA gradient from `from-red-600 via-red-500 to-amber-400` to `from-[#C0392B] to-[#A33225]`
- Change ghost CTA border hover from `hover:border-amber-300/35` to `hover:border-[#D4A853]/35`
- Change SnapshotCard label from `text-amber-300/60` to `text-[#D4A853]/60`
- Change scroll cue Play icon from `text-amber-300/80` to `text-[#D4A853]/80`
- Replace amber radial glow with warm gold: `bg-amber-400/10` → `bg-[#D4A853]/10`
- Replace red radial glow: `bg-red-500/12` → `bg-[#C0392B]/10`
- Change right-side gradient from `from-[#F59E0B]/18` → `from-[#D4A853]/12`
- Add vignette overlay: `<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(10,10,10,0.5)_100%)]" />`
- Add warm light leak: `<div className="absolute -top-20 -left-20 h-[500px] w-[500px] rounded-full bg-[#D4A853]/8 blur-[160px]" />`
- Replace font-mono on "COACH SNAPSHOT" label with `font-jetbrains`
- Replace font-mono on measurable labels with `font-jetbrains`
- Change kicker pill font from `font-mono` to `font-jetbrains`

**Step 1: Implement all changes to hero.tsx**

Full replacement of the component (preserving the GSAP config and Assembly hook):
- Replace `Image` import and background with `KenBurnsImage`
- Apply all color token changes listed above
- Apply all font changes listed above
- Add vignette and light leak divs to the background layer

**Step 2: Verify it builds**

Run: `cd alex-recruiting && npm run build 2>&1 | tail -10`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/recruit/hero.tsx
git commit -m "feat(recruit): redesign hero with FNL palette, Playfair Display, Ken Burns, warm light leaks"
```

---

### Task 6: Redesign Scroll Progress Bar

**Files:**
- Modify: `src/components/recruit/scroll-progress.tsx`

**Key changes:**
- Change gradient from `from-red-600 via-red-500 to-rose-500` to `from-[#D4A853] via-[#E8C068] to-[#C0392B]`

This is a one-line change in the className.

**Step 1: Make the change**

**Step 2: Commit**

```bash
git add src/components/recruit/scroll-progress.tsx
git commit -m "feat(recruit): update scroll progress bar to FNL gold-to-crimson gradient"
```

---

### Task 7: Redesign Nav

**Files:**
- Modify: `src/components/recruit/nav.tsx`

**Key changes:**
- Active section color: `text-red-500` → `text-[#D4A853]`
- Contact button border: `border-red-500/50 text-red-500 hover:bg-red-500/10` → `border-[#D4A853]/50 text-[#D4A853] hover:bg-[#D4A853]/10`
- Mobile dot active: `bg-red-500` → `bg-[#D4A853]`
- Mobile label active: `text-red-500` → `text-[#D4A853]`
- Name text: `text-white/60` → `text-[#F5F0E6]/60`
- Name font: add `font-playfair tracking-normal` (remove tracking-[0.3em])

**Step 1: Apply all color changes**

**Step 2: Commit**

```bash
git add src/components/recruit/nav.tsx
git commit -m "feat(recruit): update nav to FNL gold palette"
```

---

### Task 8: Redesign Film Reel Section

**Files:**
- Modify: `src/components/recruit/film-reel.tsx`

**Key changes:**
- Section kicker: `text-red-500/60` → `text-[#D4A853]/60`
- Amber accent labels: `text-amber-300/70` → `text-[#D4A853]/70`
- Red accent labels: `text-red-500/65` → `text-[#C0392B]/65`
- Fullscreen button hover: `hover:border-white/20` → `hover:border-[#D4A853]/30`
- Top divider: `via-red-500/20` → `via-[#D4A853]/20`
- Ambient glow: `bg-amber-400/8` → `bg-[#D4A853]/8`
- Clip rank pill: `text-white/80` → `text-[#F5F0E6]/80`
- Clip moment tags: `text-amber-300/75` → `text-[#D4A853]/75`
- Card hover border: `hover:border-red-500/25` → `hover:border-[#D4A853]/25`

**Step 1: Apply all color token replacements**

**Step 2: Commit**

```bash
git add src/components/recruit/film-reel.tsx
git commit -m "feat(recruit): update film reel to FNL warm gold palette"
```

---

### Task 9: Redesign Social Proof to Ticker with Live NCSA Data

**Files:**
- Modify: `src/components/recruit/social-proof.tsx`
- Modify: `src/app/api/recruit/social-proof/route.ts`
- Modify: `src/app/globals.css`

**Goal:** Replace the static proof cards with a horizontally scrolling ticker showing real school names from NCSA scraper data, plus counter animations for engagement metrics like "X new schools reached out this month."

**Step 1: Update the social-proof API to return recent school names**

The existing API at `/api/recruit/social-proof` returns counts. Enhance it to also return:
- `recentSchools: string[]` — list of unique school names from ncsa_leads
- `recentSchoolCount: number` — number of new schools in the last 30 days

Add this query to `fetchSocialProofData()` in `src/app/api/recruit/social-proof/route.ts`:

```typescript
// Inside fetchSocialProofData(), add new fields to the SocialProofData interface:
// recentSchools: string[];
// recentSchoolCount: number;

// After the existing schoolsEngaged query, add:
try {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: recentSchoolRows } = await supabase
    .from("ncsa_leads")
    .select("school_name, detected_at")
    .gte("detected_at", thirtyDaysAgo)
    .order("detected_at", { ascending: false });

  const recentUniqueSchools = [
    ...new Set(
      (recentSchoolRows ?? [])
        .map((s: { school_name: string | null }) => s.school_name?.trim())
        .filter(Boolean) as string[]
    ),
  ];
  data.recentSchools = recentUniqueSchools;
  data.recentSchoolCount = recentUniqueSchools.length;
} catch {
  data.recentSchools = [];
  data.recentSchoolCount = 0;
}

// Also fetch ALL school names for the ticker:
try {
  const { data: allSchoolRows } = await supabase
    .from("ncsa_leads")
    .select("school_name")
    .order("detected_at", { ascending: false });

  const allUniqueSchools = [
    ...new Set(
      (allSchoolRows ?? [])
        .map((s: { school_name: string | null }) => s.school_name?.trim())
        .filter(Boolean) as string[]
    ),
  ];
  data.schoolNames = allUniqueSchools;
} catch {
  data.schoolNames = [];
}
```

Update `SocialProofData` interface to include:
```typescript
recentSchools: string[];
recentSchoolCount: number;
schoolNames: string[];
```

**Step 2: Rewrite social-proof.tsx with scrolling ticker + live school names**

The ticker should:
- Show school names scrolling horizontally: "Ohio State · Michigan · Wisconsin · ..."
- Show a headline counter: "X new schools reached out in the last month"
- Use CounterAnimation for the number
- Use FNL gold palette
- If no NCSA data, show static proof: "NCSA Verified · 730+ Training Sessions · First Place Discus"

```tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  useRecruitAssembly,
  type AssemblyConfig,
} from "@/hooks/useRecruitAssembly";
import { CounterAnimation } from "./counter";

interface SocialProofMetrics {
  ncsaProfileViews: number;
  campInvites: number;
  coachFollowers: number;
  contactFormSubmissions?: number;
  competitorOffers: number;
  schoolsEngaged?: number;
  recentSchoolCount?: number;
  recentSchools?: string[];
  schoolNames?: string[];
}

const STATIC_PROOF = [
  "NCSA Verified",
  "730+ Training Sessions",
  "First Place Discus",
  "First Place Shot Put",
  "Varsity Starter as Freshman",
  "Deadlift PR: 405 lbs",
  "Two-Way Lineman",
  "Deep State Playoff Run",
];

export function SocialProofBanner() {
  const [metrics, setMetrics] = useState<SocialProofMetrics | null>(null);
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    fetch("/api/recruit/social-proof")
      .then((r) => r.json())
      .then((data) => setMetrics(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const tickerItems = metrics?.schoolNames?.length
    ? metrics.schoolNames
    : STATIC_PROOF;

  const recentCount = metrics?.recentSchoolCount ?? 0;

  const config = useMemo<AssemblyConfig>(
    () => ({
      wave2: [
        {
          containerSelector: '[data-gsap="social-proof-content"]',
          from: { y: 20, opacity: 0 },
          to: {
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
          },
          individual: false,
          stagger: 0,
          scrollTrigger: {
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        },
      ],
    }),
    []
  );

  const scopeRef = useRecruitAssembly(config);

  return (
    <section ref={(el) => {
      // Merge both refs
      (scopeRef as React.MutableRefObject<HTMLElement | null>).current = el;
      (sectionRef as React.MutableRefObject<HTMLElement | null>).current = el;
    }} className="relative overflow-hidden py-8 md:py-10">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4A853]/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4A853]/20 to-transparent" />

      <div data-gsap="social-proof-content" className="mx-auto max-w-7xl px-6">
        <div data-gsap-wave="2" style={{ opacity: 0 }}>
          {/* Counter headline */}
          {recentCount > 0 && (
            <p className="mb-4 text-center font-jetbrains text-sm tracking-wide text-[#D4A853]">
              <CounterAnimation target={recentCount} trigger={inView} className="font-bold text-lg" />
              {" "}new school{recentCount !== 1 ? "s" : ""} reached out in the last month
            </p>
          )}

          {/* Scrolling ticker */}
          <div className="relative overflow-hidden">
            <div className="animate-scroll-ticker flex whitespace-nowrap">
              {/* Duplicate items for infinite scroll */}
              {[...tickerItems, ...tickerItems].map((item, i) => (
                <span
                  key={`${item}-${i}`}
                  className="mx-4 inline-flex items-center gap-2 font-jetbrains text-xs uppercase tracking-[0.2em] text-[#8B8172]"
                >
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#D4A853]/40" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Metric pills */}
          {metrics && (metrics.ncsaProfileViews > 0 || metrics.campInvites > 0 || metrics.coachFollowers > 0) && (
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              {metrics.ncsaProfileViews > 0 && (
                <div className="flex items-center gap-2 rounded-full border border-[#D4A853]/10 bg-[#D4A853]/[0.04] px-4 py-2">
                  <CounterAnimation target={metrics.ncsaProfileViews} trigger={inView} className="font-jetbrains text-sm font-bold text-[#D4A853]" />
                  <span className="font-jetbrains text-[10px] uppercase tracking-[0.15em] text-[#8B8172]">
                    Profile Views
                  </span>
                </div>
              )}
              {metrics.campInvites > 0 && (
                <div className="flex items-center gap-2 rounded-full border border-[#D4A853]/10 bg-[#D4A853]/[0.04] px-4 py-2">
                  <CounterAnimation target={metrics.campInvites} trigger={inView} className="font-jetbrains text-sm font-bold text-[#D4A853]" />
                  <span className="font-jetbrains text-[10px] uppercase tracking-[0.15em] text-[#8B8172]">
                    Camp Invites
                  </span>
                </div>
              )}
              {metrics.coachFollowers > 0 && (
                <div className="flex items-center gap-2 rounded-full border border-[#D4A853]/10 bg-[#D4A853]/[0.04] px-4 py-2">
                  <CounterAnimation target={metrics.coachFollowers} trigger={inView} className="font-jetbrains text-sm font-bold text-[#D4A853]" />
                  <span className="font-jetbrains text-[10px] uppercase tracking-[0.15em] text-[#8B8172]">
                    Coaches Following
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
```

**Step 3: Add CSS ticker animation to globals.css**

```css
@keyframes scroll-ticker {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.animate-scroll-ticker {
  animation: scroll-ticker 30s linear infinite;
}
@media (prefers-reduced-motion: reduce) {
  .animate-scroll-ticker {
    animation: none;
  }
}
```

**Step 4: Verify build**

Run: `cd alex-recruiting && npm run build 2>&1 | tail -10`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add src/components/recruit/social-proof.tsx src/app/api/recruit/social-proof/route.ts src/app/globals.css
git commit -m "feat(recruit): redesign social proof with live NCSA school ticker and counter animations"
```

---

### Task 10: Redesign Origin Story (The Work)

**Files:**
- Modify: `src/components/recruit/origin-story.tsx`

**Goal:** Add typewriter narrative lead-in, counter animations for training stats, FNL colors.

**Key changes:**
- Import `TypewriterText` and `CounterAnimation`
- Add a typewriter section before the timeline: "Since age 12, five days a week. 730 sessions. Not because someone made him. Because he chose it."
- Use `useEffect` with IntersectionObserver to trigger typewriter on scroll-enter
- Add counters for: 730+ sessions, 405 deadlift, 265 bench, 350 squat
- Section kicker: `text-red-500/60` → `text-[#D4A853]/60`
- Heading gradient: `from-red-500 to-rose-400` → `from-[#D4A853] to-[#E8C068]`
- Timeline dot: `bg-red-500` → `bg-[#D4A853]`
- Timeline line: `bg-white/10` → `bg-[#D4A853]/15`
- Milestone label: `text-red-500/70` → `text-[#D4A853]/70`
- H2 font: add `font-playfair`
- Typewriter text: `font-playfair italic text-2xl md:text-3xl text-[#F5F0E6]/80`

**Step 1: Implement all changes**

**Step 2: Commit**

```bash
git add src/components/recruit/origin-story.tsx
git commit -m "feat(recruit): add typewriter narrative and counter animations to The Work"
```

---

### Task 11: Redesign Character Section

**Files:**
- Modify: `src/components/recruit/character.tsx`

**Key changes:**
- Section kicker: `text-red-500/60` → `text-[#D4A853]/60`
- Heading gradient word: `from-red-500 to-rose-400` → `from-[#D4A853] to-[#E8C068]`
- Trait number ghost text: `text-white/[0.03]` → `text-[#D4A853]/[0.04]`
- Evidence bar: `bg-red-500/30` → `bg-[#D4A853]/30`
- Evidence text: `text-red-500/70` → `text-[#D4A853]/70`
- Card hover: `hover:border-red-500/20` → `hover:border-[#D4A853]/20`
- Narrative box border: `border-red-500/10` → `border-[#D4A853]/10`
- Narrative box gradient: `from-red-500/5 to-rose-500/5` → `from-[#D4A853]/5 to-[#E8C068]/5`
- Narrative kicker: `text-red-500/60` → `text-[#D4A853]/60`
- H2 font: add `font-playfair`

**Step 1: Apply all color changes**

**Step 2: Commit**

```bash
git add src/components/recruit/character.tsx
git commit -m "feat(recruit): update character section to FNL warm palette"
```

---

### Task 12: Redesign The Fit Section

**Files:**
- Modify: `src/components/recruit/the-fit.tsx`

**Key changes:**
- Section kicker: `text-red-500/60` → `text-[#D4A853]/60`
- Heading gradient: `from-red-500 to-rose-400` → `from-[#D4A853] to-[#E8C068]`
- Block numbers: `text-red-500/20` → `text-[#D4A853]/20`, hover `text-red-500/40` → `text-[#D4A853]/40`
- Card hover: `hover:border-red-500/20` → `hover:border-[#D4A853]/20`
- Coach verdict box: `border-red-500/12` → `border-[#D4A853]/12`, gradient `from-red-500/8 to-amber-400/6` → `from-[#D4A853]/8 to-[#E8C068]/6`
- Verdict kicker: `text-red-500/70` → `text-[#D4A853]/70`
- Review card kicker: `text-white/35` → `text-[#8B8172]`
- Verdict badge: keep emerald green for "Yay" — it's a good contrasting signal
- Ambient glow: `bg-red-600/[0.03]` → `bg-[#D4A853]/[0.03]`
- H2 font: add `font-playfair`
- Add loss-aversion framing text after the blocks: "The coach who sees this early gets a three-year head start on developing him. The coach who waits will be competing against every other program that discovers him."

**Step 1: Apply all color changes + add loss-aversion block**

**Step 2: Commit**

```bash
git add src/components/recruit/the-fit.tsx
git commit -m "feat(recruit): update The Fit with FNL palette and loss-aversion framing"
```

---

### Task 13: Redesign Multi-Sport Section

**Files:**
- Modify: `src/components/recruit/multi-sport.tsx`

**Key changes:**
- Section kicker: `text-red-500/60` → `text-[#D4A853]/60`
- Amber accent labels: `text-amber-300/70` → `text-[#D4A853]/70`
- Red accent labels: `text-red-500/70` → `text-[#C0392B]/70`
- MetricCard value: `text-white` → `text-[#F5F0E6]`
- MetricCard label: `text-red-500/70` → `text-[#D4A853]/70`
- Ambient gradients: replace `rgba(245,158,11,...)` with `rgba(212,168,83,...)` and `rgba(239,68,68,...)` with `rgba(192,57,43,...)`
- H2 font: add `font-playfair`

**Step 1: Apply all color changes**

**Step 2: Commit**

```bash
git add src/components/recruit/multi-sport.tsx
git commit -m "feat(recruit): update multi-sport section to FNL palette"
```

---

## Phase 3: Contact Form Fix + Music (Tasks 14-15)

---

### Task 14: Fix Contact Form + Redesign

**Files:**
- Modify: `src/components/recruit/contact.tsx`
- Modify: `src/app/api/recruit/contact/route.ts`

**Goal:** Fix the broken contact form submission, add client-side validation, update to FNL palette.

**Step 1: Verify the API route**

Run: `cd alex-recruiting && curl -X POST http://localhost:3000/api/recruit/contact -H "Content-Type: application/json" -d '{"name":"Test Coach","school":"Test U","email":"test@test.com"}' 2>&1`

Check the response. The route code looks correct (writes to Supabase or falls back to `.coach-inquiries.json`). The issue is likely the Vercel serverless environment trying to write to the filesystem. For local dev it should work.

**Step 2: Add client-side validation to contact.tsx**

Add validation before the fetch call:

```typescript
if (!formData.get("name") || !formData.get("school") || !formData.get("email")) {
  setError("Name, school, and email are required.");
  setSubmitting(false);
  return;
}

const emailValue = formData.get("email") as string;
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
  setError("Please enter a valid email address.");
  setSubmitting(false);
  return;
}
```

**Step 3: Apply FNL color changes to contact.tsx**

- Section kicker: `text-red-500/60` → `text-[#D4A853]/60`
- Section heading font: add `font-playfair`
- Family contact email icon: `text-red-500/60` → `text-[#D4A853]/60`
- QuickLink hover: `hover:border-red-500/25` → `hover:border-[#D4A853]/25`
- QuickLink icon: `text-red-500/60` → `text-[#D4A853]/60`
- Card hover: `hover:border-red-500/20` → `hover:border-[#D4A853]/20`
- Input focus border: `focus:border-red-500/40` → `focus:border-[#D4A853]/40`
- Submit button gradient: `from-red-600 via-red-500 to-rose-500` → `from-[#C0392B] to-[#A33225]`
- Submit shadow: `shadow-red-500/25` → `shadow-[#C0392B]/25`
- Top divider: `via-red-500/20` → `via-[#D4A853]/20`
- Error text: keep `text-red-400` — red for errors is standard
- Font changes: section heading → `font-playfair`, labels → `font-jetbrains`

**Step 4: Verify the form submits successfully locally**

Run the dev server, navigate to /recruit, fill out the form, submit. Check for the `.coach-inquiries.json` file.

**Step 5: Commit**

```bash
git add src/components/recruit/contact.tsx src/app/api/recruit/contact/route.ts
git commit -m "fix(recruit): fix contact form validation and update to FNL palette"
```

---

### Task 15: Create Background Music Toggle

**Files:**
- Create: `src/components/recruit/music-toggle.tsx`
- Modify: `src/app/recruit/page.tsx`

**Step 1: Create the music toggle component**

```tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

interface MusicToggleProps {
  /** Path to audio file in /public */
  src: string;
  /** Volume 0-1. Default 0.15 */
  volume?: number;
}

export function MusicToggle({ src, volume = 0.15 }: MusicToggleProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = volume;
    audio.preload = "none";
    audioRef.current = audio;

    // Check localStorage for user preference
    const pref = localStorage.getItem("recruit-music-muted");
    if (pref === "false") {
      setMuted(false);
      audio.play().catch(() => {});
    }

    setLoaded(true);

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [src, volume]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (muted) {
      audio.play().catch(() => {});
      setMuted(false);
      localStorage.setItem("recruit-music-muted", "false");
    } else {
      audio.pause();
      setMuted(true);
      localStorage.setItem("recruit-music-muted", "true");
    }
  }, [muted]);

  if (!loaded) return null;

  return (
    <button
      onClick={toggle}
      className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-[#D4A853]/20 bg-[#0A0A0A]/80 backdrop-blur-xl transition-all duration-300 hover:border-[#D4A853]/40 hover:scale-105 md:bottom-auto md:top-6 md:right-20"
      aria-label={muted ? "Unmute background music" : "Mute background music"}
      title={muted ? "Play music" : "Mute music"}
    >
      {muted ? (
        <VolumeX className="h-5 w-5 text-[#8B8172]" />
      ) : (
        <Volume2 className="h-5 w-5 text-[#D4A853]" />
      )}
    </button>
  );
}
```

**Step 2: Add to recruit page**

Import in `src/app/recruit/page.tsx`:

```tsx
import { MusicToggle } from "@/components/recruit/music-toggle";

// Inside the return, after <FilmGrainOverlay />:
<MusicToggle src="/recruit/audio/ambient.mp3" />
```

Note: The user needs to provide an audio file at `public/recruit/audio/ambient.mp3`. For now, the component gracefully handles missing audio.

**Step 3: Commit**

```bash
git add src/components/recruit/music-toggle.tsx src/app/recruit/page.tsx
git commit -m "feat(recruit): add background music toggle with FNL ambient audio"
```

---

## Phase 4: Integration + Verification (Task 16)

---

### Task 16: Final Integration, Build, and Visual Verification

**Files:**
- Modify: `src/app/recruit/page.tsx` (ensure all imports are correct)

**Step 1: Verify all imports in page.tsx are correct**

The final page.tsx should import:
- `FilmGrainOverlay` from `@/components/recruit/film-grain`
- `MusicToggle` from `@/components/recruit/music-toggle`
- All existing section components (unchanged)

**Step 2: Run TypeScript check**

Run: `cd alex-recruiting && npx tsc --noEmit 2>&1 | tail -20`
Expected: No errors

**Step 3: Run build**

Run: `cd alex-recruiting && npm run build 2>&1 | tail -20`
Expected: Build succeeds

**Step 4: Run lint**

Run: `cd alex-recruiting && npm run lint 2>&1 | tail -20`
Expected: No errors (or only pre-existing warnings)

**Step 5: Visual verification**

Start dev server, navigate to /recruit, and verify:
1. Film grain overlay is visible (subtle noise texture)
2. Playfair Display renders on section headings
3. Gold/crimson color palette is consistent throughout
4. Scroll progress bar shows gold-to-crimson gradient
5. Nav active states use gold instead of red
6. Contact form submits successfully
7. Music toggle appears in bottom-right (mobile) / top-right (desktop)
8. Ken Burns effect animates on hero background
9. Typewriter text triggers on scroll in Origin Story
10. Counter animations trigger on scroll in Social Proof

**Step 6: Commit any final fixes**

```bash
git add -A
git commit -m "feat(recruit): complete FNL cinematic redesign — phase 1"
```

---

## Task Dependency Graph

```
Phase 1 (Foundation — sequential):
  Task 1 (colors) → Task 2 (fonts) → Task 3 (film grain) → Task 4 (utility components)

Phase 2 (Sections — parallel after Phase 1):
  Task 5 (hero) ─┐
  Task 6 (scroll) │
  Task 7 (nav)    │
  Task 8 (film)   ├─ all independent, can run in parallel
  Task 9 (social) │
  Task 10 (origin)│
  Task 11 (char)  │
  Task 12 (fit)   │
  Task 13 (multi) ┘

Phase 3 (Contact + Music — parallel after Phase 1):
  Task 14 (contact) ─┐
  Task 15 (music)    ─┘ independent

Phase 4 (Verification — after all):
  Task 16 (integration) — depends on everything above
```

## Summary

- **16 tasks** across 4 phases
- **6 new components** created
- **10 existing components** modified
- **0 new database tables**
- **1 bug fixed** (contact form)
- All animations use existing `useRecruitAssembly` GSAP hook
- All colors use the new FNL token system
- All section headings use Playfair Display
- All data labels use JetBrains Mono
- Film grain, Ken Burns, typewriter, and counters respect `prefers-reduced-motion`
