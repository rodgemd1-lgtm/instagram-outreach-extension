# "The Interview" Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the recruit page from traditional sections into a conversational dialogue layout ("The Interview") where content alternates left/right between Jacob and the coach, using the rule of thirds.

**Architecture:** The page becomes a sequence of 9 "beats" — each is a dialogue turn. A new `DialogueBeat` wrapper component handles the left/right positioning and slide animations. Existing components are rewritten to fit inside beats. Two sections (Film, The Fit) get GSAP ScrollTrigger pinning. All gold (#D4A853) is replaced with Pewaukee red (#ff000c).

**Tech Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS, GSAP ScrollTrigger, existing useRecruitAssembly hook, existing Typewriter and Counter components.

**Design Doc:** `docs/plans/2026-03-09-the-interview-design.md`

---

## Task 1: Color Migration — Remove All Gold

**Files:**
- Modify: `src/components/recruit/hero.tsx`
- Modify: `src/components/recruit/film-reel.tsx`
- Modify: `src/components/recruit/social-proof.tsx`
- Modify: `src/components/recruit/origin-story.tsx`
- Modify: `src/components/recruit/character.tsx`
- Modify: `src/components/recruit/academics.tsx`
- Modify: `src/components/recruit/the-fit.tsx`
- Modify: `src/components/recruit/contact.tsx`
- Modify: `src/components/recruit/multi-sport.tsx`
- Modify: `src/components/recruit/typewriter.tsx`
- Modify: `src/components/recruit/nav.tsx`
- Modify: `src/app/recruit/layout.tsx`
- Modify: `tailwind.config.ts`

**Step 1: Global find-and-replace gold colors**

Replace across ALL files in `src/components/recruit/` and `src/app/recruit/`:

| Find | Replace With | Context |
|------|-------------|---------|
| `#D4A853` | `#ff000c` | Primary gold → Pewaukee red |
| `#E8C068` | `#ff000c` | Gradient gold → same red (no gradient needed) |
| `#8B8172` | `#9CA3AF` | Muted gold-gray → neutral gray-400 |
| `#F5F0E6` | `#FFFFFF` | Cream/off-white → pure white |
| `#0A0A0A` | `#000000` | Near-black → pure black |

In `typewriter.tsx`, replace cursor color:
```tsx
// OLD
<span className="inline-block w-[2px] h-[1em] bg-[#D4A853] ml-0.5 animate-pulse align-text-bottom" />
// NEW
<span className="inline-block w-[2px] h-[1em] bg-[#ff000c] ml-0.5 animate-pulse align-text-bottom" />
```

In `src/app/recruit/layout.tsx`, update root container:
```tsx
// OLD
<div className={`recruit-page bg-[#0A0A0A] text-[#F5F0E6] min-h-screen overflow-x-hidden`}>
// NEW
<div className={`recruit-page bg-black text-white min-h-screen overflow-x-hidden`}>
```

**Step 2: Update tailwind.config.ts pirate colors**

```typescript
colors: {
  "pirate-red": {
    DEFAULT: "#ff000c",
    dark: "#cc000a",
    light: "#ff3340",
  },
  "pirate-black": {
    DEFAULT: "#111111",
    deep: "#000000",
  },
}
```

**Step 3: Verify no gold remains**

Run: `grep -r "D4A853\|E8C068\|8B8172\|F5F0E6\|0A0A0A" src/components/recruit/ src/app/recruit/`
Expected: No matches

**Step 4: Build check**

Run: `cd alex-recruiting && npm run build`
Expected: Build passes with no errors

**Step 5: Commit**

```bash
git add src/components/recruit/ src/app/recruit/ tailwind.config.ts
git commit -m "style: remove all gold, migrate to Pewaukee red/black/white palette"
```

---

## Task 2: Create DialogueBeat Wrapper Component

**Files:**
- Create: `src/components/recruit/dialogue-beat.tsx`

**Step 1: Write the DialogueBeat component**

This component handles the rule-of-thirds positioning and directional slide animations.

```tsx
"use client";

import { useMemo } from "react";
import {
  useRecruitAssembly,
  type AssemblyConfig,
} from "@/hooks/useRecruitAssembly";

interface DialogueBeatProps {
  id: string;
  speaker: "jacob" | "coach" | "both" | "neutral";
  children: React.ReactNode;
  className?: string;
  pin?: boolean;
}

export function DialogueBeat({
  id,
  speaker,
  children,
  className = "",
  pin = false,
}: DialogueBeatProps) {
  const config = useMemo((): AssemblyConfig => {
    const direction = speaker === "coach" ? -60 : speaker === "both" ? 0 : 60;

    return {
      wave2: [
        {
          containerSelector: `[data-beat="${id}"]`,
          from: {
            x: direction,
            opacity: 0,
          },
          to: {
            x: 0,
            opacity: 1,
            duration: 0.7,
            ease: "power2.out",
          },
          individual: false,
          stagger: 0.12,
          scrollTrigger: {
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        },
      ],
    };
  }, [id, speaker]);

  const { scopeRef } = useRecruitAssembly(config);

  // Position classes based on speaker
  const positionClasses = (() => {
    switch (speaker) {
      case "jacob":
        // Right 2/3
        return "ml-auto md:w-2/3 md:pl-8";
      case "coach":
        // Left 2/3
        return "mr-auto md:w-2/3 md:pr-8";
      case "both":
        // Centered full width
        return "mx-auto max-w-4xl";
      case "neutral":
        // Centered narrow
        return "mx-auto max-w-3xl";
      default:
        return "";
    }
  })();

  // Mobile background differentiation
  const mobileBg =
    speaker === "coach" ? "md:bg-transparent bg-[#111111]" : "";

  return (
    <div
      id={id}
      ref={scopeRef}
      className={`relative px-6 py-16 md:py-24 ${mobileBg} ${className}`}
    >
      <div data-beat={id} className={positionClasses}>
        {children}
      </div>
    </div>
  );
}
```

**Step 2: Build check**

Run: `cd alex-recruiting && npm run build`
Expected: Build passes

**Step 3: Commit**

```bash
git add src/components/recruit/dialogue-beat.tsx
git commit -m "feat: add DialogueBeat wrapper component for conversational layout"
```

---

## Task 3: Rewrite Hero as Beat 1 (Introduction)

**Files:**
- Modify: `src/components/recruit/hero.tsx`

**Step 1: Rewrite hero.tsx**

Replace the entire component. The hero is Beat 1 — Jacob speaks, right 2/3, slides from right.

```tsx
"use client";

import { useMemo } from "react";
import {
  useRecruitAssembly,
  type AssemblyConfig,
} from "@/hooks/useRecruitAssembly";

interface HeroProps {
  backgroundUrl?: string;
}

export function RecruitHero({ backgroundUrl }: HeroProps) {
  const config = useMemo((): AssemblyConfig => {
    return {
      wave1: [
        {
          name: "hero-jersey",
          from: { opacity: 0, scale: 0.85 },
          to: { opacity: 0.12, scale: 1, duration: 0.5, ease: "sine.out", position: "0" },
        },
        {
          name: "hero-kicker",
          from: { x: 60, opacity: 0 },
          to: { x: 0, opacity: 1, duration: 0.4, ease: "power2.out", position: "0.15" },
        },
        {
          name: "hero-name",
          from: { x: 60, opacity: 0 },
          to: { x: 0, opacity: 1, duration: 0.4, ease: "power2.out", position: "0.25" },
        },
        {
          name: "hero-measurables",
          from: { x: 60, opacity: 0 },
          to: { x: 0, opacity: 1, duration: 0.4, ease: "power2.out", position: "0.35" },
        },
        {
          name: "hero-scroll-cue",
          from: { opacity: 0 },
          to: { opacity: 1, duration: 0.4, ease: "sine.out", position: "0.6" },
        },
      ],
    };
  }, []);

  const { scopeRef } = useRecruitAssembly(config);

  return (
    <section
      id="hero"
      ref={scopeRef}
      className="relative flex min-h-[100svh] items-center overflow-hidden bg-black"
    >
      {/* Background photo if available */}
      {backgroundUrl && (
        <div className="absolute inset-0">
          <img
            src={backgroundUrl}
            alt=""
            className="h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/40" />
        </div>
      )}

      {/* Ghosted 79 — left third */}
      <div
        data-gsap="hero-jersey"
        className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 select-none font-bold text-white opacity-0"
        style={{ fontSize: "clamp(15rem, 35vw, 40rem)", lineHeight: 0.85 }}
      >
        79
      </div>

      {/* Content — right 2/3 */}
      <div className="relative z-10 ml-auto w-full px-6 md:w-2/3 md:px-12">
        <div data-gsap="hero-kicker" className="mb-4 opacity-0">
          <span className="text-sm font-medium uppercase tracking-[0.3em] text-[#ff000c]">
            Class of 2029
          </span>
        </div>

        <div data-gsap="hero-name" className="mb-8 opacity-0">
          <h1
            className="font-bold uppercase leading-none tracking-tight text-white"
            style={{ fontSize: "clamp(3rem, 8vw, 7rem)" }}
          >
            Jacob
            <br />
            Rodgers
          </h1>
        </div>

        <div data-gsap="hero-measurables" className="mb-12 opacity-0">
          <p className="text-lg text-white/80 md:text-xl">
            <span className="text-white">#79</span>
            <span className="mx-2 text-[#ff000c]">&middot;</span>
            DT / OG
            <span className="mx-2 text-[#ff000c]">&middot;</span>
            6&apos;4&quot;
            <span className="mx-2 text-[#ff000c]">&middot;</span>
            285
          </p>
          <p className="mt-2 text-base text-white/60">
            Pewaukee HS
            <span className="mx-2 text-[#ff000c]">&middot;</span>
            Wisconsin
          </p>
          <p className="mt-1 text-base text-white/60">
            Varsity Starter
            <span className="mx-2 text-[#ff000c]">&middot;</span>
            Two-Way Lineman
          </p>
        </div>

        <div data-gsap="hero-scroll-cue" className="opacity-0">
          <button
            onClick={() => {
              document
                .getElementById("film")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="group flex items-center gap-2 text-sm uppercase tracking-widest text-white/50 transition-colors hover:text-white"
          >
            <span className="inline-block h-5 w-px bg-[#ff000c] transition-all group-hover:h-8" />
            Watch the film
          </button>
        </div>
      </div>
    </section>
  );
}
```

**Step 2: Build check**

Run: `cd alex-recruiting && npm run build`
Expected: Build passes

**Step 3: Commit**

```bash
git add src/components/recruit/hero.tsx
git commit -m "feat(beat-1): rewrite hero as dialogue introduction, right 2/3 layout"
```

---

## Task 4: Create Coach Monologue Component

**Files:**
- Create: `src/components/recruit/coach-monologue.tsx`

**Step 1: Write the coach monologue component**

This handles Beats 3 and 5 — short typewriter coach internal thoughts that slide from the left.

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useMemo } from "react";
import {
  useRecruitAssembly,
  type AssemblyConfig,
} from "@/hooks/useRecruitAssembly";
import { TypewriterText } from "./typewriter";

interface CoachMonologueProps {
  id: string;
  lines: string[];
}

export function CoachMonologue({ id, lines }: CoachMonologueProps) {
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const config = useMemo((): AssemblyConfig => {
    return {
      wave2: [
        {
          containerSelector: `[data-monologue="${id}"]`,
          from: { x: -60, opacity: 0 },
          to: {
            x: 0,
            opacity: 1,
            duration: 0.7,
            ease: "power2.out",
          },
          scrollTrigger: {
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        },
      ],
    };
  }, [id]);

  const { scopeRef } = useRecruitAssembly(config);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      id={id}
      ref={(el) => {
        scopeRef.current = el;
        sectionRef.current = el;
      }}
      className="relative px-6 py-16 md:py-24 md:bg-transparent bg-[#111111]"
    >
      <div
        data-monologue={id}
        className="mr-auto md:w-2/3 md:pr-8"
      >
        <div className="rounded-lg border border-white/5 bg-[#111111] p-8 md:p-12">
          {lines.map((line, i) => (
            <p key={i} className="text-lg text-white/70 italic md:text-xl leading-relaxed">
              {i === 0 ? (
                <TypewriterText
                  text={`"${line}`}
                  trigger={inView}
                  speed={35}
                  className="text-lg text-white/70 italic md:text-xl"
                />
              ) : (
                <span className={inView ? "animate-fade-in" : "opacity-0"} style={{ animationDelay: `${i * 1.5}s` }}>
                  {i === lines.length - 1 ? `${line}"` : line}
                </span>
              )}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Build check**

Run: `cd alex-recruiting && npm run build`
Expected: Build passes

**Step 3: Commit**

```bash
git add src/components/recruit/coach-monologue.tsx
git commit -m "feat: add CoachMonologue component for dialogue transition beats"
```

---

## Task 5: Rewrite Film Section as Beat 2

**Files:**
- Modify: `src/components/recruit/film-reel.tsx`

**Step 1: Rewrite film-reel.tsx**

The film section becomes Beat 2 — Jacob speaks, right 2/3. Typewriter "Can he play?" on the left margin. 1 auto-playing video + 4 videos with splash screens. Stats counter-animate. Section pins while counters resolve.

```tsx
"use client";

import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import {
  useRecruitAssembly,
  type AssemblyConfig,
} from "@/hooks/useRecruitAssembly";
import { RecruitVideoPlayer } from "./video-player";
import { VideoModal } from "./video-modal";
import { CounterAnimation } from "./counter";
import { TypewriterText } from "./typewriter";
import {
  FEATURED_RECRUIT_REEL,
  SUPPORTING_RECRUIT_REELS,
  CURRENT_FEATURED_CLIPS,
  FULL_FILM_LINKS,
} from "@/lib/recruit/featured-clips";

interface FilmBeatProps {
  backgroundUrl?: string;
}

const STATS = [
  { value: 445, label: "Deadlift" },
  { value: 265, label: "Bench" },
  { value: 350, label: "Squat" },
  { value: 11, label: "Pancakes" },
  { value: 3, label: "Sacks" },
];

export function FilmBeat({ backgroundUrl }: FilmBeatProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSrc, setModalSrc] = useState("");
  const [modalPoster, setModalPoster] = useState("");
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const config = useMemo((): AssemblyConfig => {
    return {
      wave2: [
        {
          containerSelector: '[data-beat="film"]',
          from: { x: 60, opacity: 0 },
          to: {
            x: 0,
            opacity: 1,
            duration: 0.6,
            ease: "power2.out",
          },
          individual: true,
          stagger: 0.15,
          scrollTrigger: {
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        },
      ],
    };
  }, []);

  const { scopeRef } = useRecruitAssembly(config);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const openModal = useCallback((src: string, poster: string) => {
    setModalSrc(src);
    setModalPoster(poster);
    setModalOpen(true);
  }, []);

  // Get the 4 clips for the grid (use CURRENT_FEATURED_CLIPS or first 4 of SUPPORTING)
  const gridVideos = SUPPORTING_RECRUIT_REELS.slice(0, 4);

  return (
    <div
      id="film"
      ref={(el) => {
        scopeRef.current = el;
        sectionRef.current = el;
      }}
      className="relative px-6 py-16 md:py-24"
    >
      {/* Coach question — left margin */}
      <div className="mb-8 md:w-1/3">
        <TypewriterText
          text={'"Can he play?"'}
          trigger={inView}
          speed={35}
          className="text-lg italic text-white/50 md:text-xl"
        />
      </div>

      {/* Film content — right 2/3 */}
      <div data-beat="film" className="ml-auto md:w-2/3 md:pl-8">
        {/* Context line */}
        <p className="mb-4 text-sm uppercase tracking-widest text-white/40">
          Freshman Season
          <span className="mx-2 text-[#ff000c]">&middot;</span>
          DT &amp; OG
          <span className="mx-2 text-[#ff000c]">&middot;</span>
          Pewaukee HS
          <span className="mx-2 text-[#ff000c]">&middot;</span>
          State Playoff Run
        </p>

        {/* Main auto-playing reel */}
        <div className="mb-6">
          <RecruitVideoPlayer
            src={FEATURED_RECRUIT_REEL.src}
            poster={FEATURED_RECRUIT_REEL.poster}
            mode="reel"
            className="aspect-video w-full rounded-lg"
          />
        </div>

        {/* 4 video grid with splash screens */}
        <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {gridVideos.map((video) => (
            <button
              key={video.id}
              onClick={() => openModal(video.src, video.poster)}
              className="group relative aspect-video overflow-hidden rounded-lg border border-white/5 bg-[#111111]"
            >
              {video.poster && (
                <img
                  src={video.poster}
                  alt={video.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-black/40 transition-opacity group-hover:bg-black/20" />
              {/* Red play button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ff000c]/90">
                  <div className="ml-0.5 h-0 w-0 border-y-[6px] border-l-[10px] border-y-transparent border-l-white" />
                </div>
              </div>
              {/* Label */}
              <div className="absolute bottom-0 left-0 right-0 p-2">
                <p className="text-xs font-medium text-white">{video.title}</p>
                <p className="text-xs text-white/50">{video.durationLabel}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Stat counters */}
        <div className="grid grid-cols-5 gap-4 border-t border-white/10 pt-6">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-white md:text-3xl">
                <CounterAnimation target={stat.value} trigger={inView} />
              </div>
              <div className="mt-1 text-xs uppercase tracking-wider text-white/40">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Hudl CTA */}
        {FULL_FILM_LINKS.length > 0 && (
          <div className="mt-6">
            <a
              href={FULL_FILM_LINKS[0]?.href ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-white"
            >
              Full Film on Hudl
              <span className="text-[#ff000c]">&rarr;</span>
            </a>
          </div>
        )}
      </div>

      <VideoModal
        src={modalSrc}
        poster={modalPoster}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
```

**Step 2: Build check**

Run: `cd alex-recruiting && npm run build`
Expected: Build passes

**Step 3: Commit**

```bash
git add src/components/recruit/film-reel.tsx
git commit -m "feat(beat-2): rewrite film as dialogue beat with 5 videos and stat counters"
```

---

## Task 6: Rewrite Origin Story as Beat 4 (The Work)

**Files:**
- Modify: `src/components/recruit/origin-story.tsx`

**Step 1: Rewrite origin-story.tsx**

Beat 4 — Jacob speaks, right 2/3. Vertical timeline starting at age 11. NX Level linked. Current schedule detailed.

```tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  useRecruitAssembly,
  type AssemblyConfig,
} from "@/hooks/useRecruitAssembly";
import { CounterAnimation } from "./counter";

interface WorkBeatProps {
  backgroundUrl?: string;
}

const MILESTONES = [
  {
    age: "11",
    year: "2021",
    headline: "NX Level — twice a week.",
    detail: "Speed, agility, footwork.",
    link: { label: "NX Level", href: "https://nxlevel.com" },
    lifts: null,
  },
  {
    age: "12",
    year: "2022",
    headline: "Added weight training. NX Level continues.",
    detail: null,
    link: null,
    lifts: [
      { label: "Bench", value: 95 },
      { label: "Squat", value: 135 },
    ],
  },
  {
    age: "13",
    year: "2023",
    headline: "365 sessions. Added personal trainer.",
    detail: "Compound movements for OL/DL.",
    link: null,
    lifts: [
      { label: "Bench", value: 155 },
      { label: "Squat", value: 225 },
    ],
  },
  {
    age: "14",
    year: "2024-25",
    headline: "Freshman starter — varsity AND JV.",
    detail: "Two games in one day. 11 pancakes. 3 sacks. State playoff run.",
    link: null,
    lifts: [
      { label: "Bench", value: 265 },
      { label: "Squat", value: 350 },
      { label: "Deadlift", value: 445 },
    ],
  },
  {
    age: "15",
    year: "NOW",
    headline: "School lifts + personal trainer 2x/week + NX Level 1x/week.",
    detail:
      "Off-season: building size, speed, and agility. Track & Field: 1st place discus, 1st place shot put.",
    link: null,
    lifts: null,
    closing: "The trajectory has not flattened.",
  },
];

export function WorkBeat({ backgroundUrl }: WorkBeatProps) {
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const config = useMemo((): AssemblyConfig => {
    return {
      wave2: [
        {
          containerSelector: '[data-beat="work"] [data-timeline]',
          from: { x: 60, opacity: 0 },
          to: {
            x: 0,
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
          },
          individual: true,
          stagger: 0.15,
          scrollTrigger: {
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        },
      ],
    };
  }, []);

  const { scopeRef } = useRecruitAssembly(config);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      id="work"
      ref={(el) => {
        scopeRef.current = el;
        sectionRef.current = el;
      }}
      className="relative px-6 py-16 md:py-24"
    >
      <div data-beat="work" className="ml-auto md:w-2/3 md:pl-8">
        {/* Header */}
        <p className="mb-2 text-sm uppercase tracking-widest text-[#ff000c]">
          The Work
        </p>
        <p className="mb-12 text-lg text-white/60">
          Training since age 11.{" "}
          <span className="text-white">
            <CounterAnimation target={730} trigger={inView} suffix="+" />
          </span>{" "}
          sessions. Still going.
        </p>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical connector line */}
          <div className="absolute left-3 top-0 bottom-0 w-px bg-[#ff000c]/20" />

          <div className="space-y-8">
            {MILESTONES.map((m) => (
              <div key={m.age} data-timeline className="relative pl-10">
                {/* Timeline dot */}
                <div className="absolute left-1.5 top-1 h-3 w-3 rounded-full border-2 border-[#ff000c] bg-black" />

                {/* Age label */}
                <div className="mb-1 flex items-baseline gap-2">
                  <span className="text-sm font-bold uppercase text-[#ff000c]">
                    Age {m.age}
                  </span>
                  <span className="text-xs text-white/30">({m.year})</span>
                </div>

                {/* Content */}
                <p className="text-base text-white/80">{m.headline}</p>
                {m.detail && (
                  <p className="mt-1 text-sm text-white/50">{m.detail}</p>
                )}
                {m.link && (
                  <a
                    href={m.link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-sm text-[#ff000c]/80 underline underline-offset-2 transition-colors hover:text-[#ff000c]"
                  >
                    {m.link.label}
                  </a>
                )}

                {/* Lifts */}
                {m.lifts && (
                  <div className="mt-2 flex flex-wrap gap-4">
                    {m.lifts.map((lift) => (
                      <span key={lift.label} className="text-sm text-white/60">
                        {lift.label}:{" "}
                        <span className="font-medium text-white">
                          <CounterAnimation
                            target={lift.value}
                            trigger={inView}
                          />
                        </span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Closing statement for age 15 */}
                {"closing" in m && m.closing && (
                  <p className="mt-3 text-base font-medium text-white/90">
                    {m.closing}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Build check**

Run: `cd alex-recruiting && npm run build`
Expected: Build passes

**Step 3: Commit**

```bash
git add src/components/recruit/origin-story.tsx
git commit -m "feat(beat-4): rewrite origin story as work beat, age 11 start, NX Level"
```

---

## Task 7: Rewrite Character as Beat 6

**Files:**
- Modify: `src/components/recruit/character.tsx`

**Step 1: Rewrite character.tsx**

Beat 6 — Jacob speaks, right 2/3. Team First leads. Typewriter intro. G-Card stacking traits. Coach quote last.

```tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  useRecruitAssembly,
  type AssemblyConfig,
} from "@/hooks/useRecruitAssembly";
import { TypewriterText } from "./typewriter";

interface CharacterBeatProps {
  backgroundUrl?: string;
}

const TRAITS = [
  {
    name: "TEAM FIRST",
    description:
      "Freshmen don't start on varsity at Pewaukee. Jacob earned it from day one. Shows up doing the work seniors do. Never acted like it was owed.",
  },
  {
    name: "COACHABLE",
    description:
      "Learns from his peers just as much as his coaches. Takes correction, applies it the next rep.",
  },
  {
    name: "RELENTLESS",
    description:
      "Has not missed a scheduled session since 2021. 730+. NX Level. Trainer. Discus. Shot put. Snowboarding. Football. He doesn't stop.",
  },
];

// TODO: Replace with real attributed coach quote
const COACH_QUOTE = {
  text: "[Quote from Jacob's head coach about his character and coachability]",
  attribution: "Coach [Name], Pewaukee HS",
};

export function CharacterBeat({ backgroundUrl }: CharacterBeatProps) {
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const config = useMemo((): AssemblyConfig => {
    return {
      wave2: [
        {
          containerSelector: '[data-beat="character"] [data-card]',
          from: { y: 40, opacity: 0 },
          to: {
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
          },
          individual: true,
          stagger: 0.2,
          scrollTrigger: {
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        },
      ],
    };
  }, []);

  const { scopeRef } = useRecruitAssembly(config);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      id="character"
      ref={(el) => {
        scopeRef.current = el;
        sectionRef.current = el;
      }}
      className="relative px-6 py-16 md:py-24"
    >
      <div data-beat="character" className="ml-auto md:w-2/3 md:pl-8">
        {/* Typewriter intro */}
        <div className="mb-10">
          <TypewriterText
            text="Numbers tell you what he can do. These tell you what he will do."
            trigger={inView}
            speed={35}
            className="text-lg text-white/70 md:text-xl"
          />
        </div>

        {/* Trait cards — G-Card stack */}
        <div className="space-y-4">
          {TRAITS.map((trait) => (
            <div
              key={trait.name}
              data-card
              className="rounded-lg border-l-2 border-[#ff000c] bg-[#111111] p-6"
            >
              <h3 className="mb-2 text-sm font-bold uppercase tracking-widest text-[#ff000c]">
                {trait.name}
              </h3>
              <p className="text-base leading-relaxed text-white/70">
                {trait.description}
              </p>
            </div>
          ))}
        </div>

        {/* Coach quote — types last */}
        <div data-card className="mt-8">
          <TypewriterText
            text={`"${COACH_QUOTE.text}"`}
            trigger={inView}
            speed={30}
            className="text-base italic text-white/60"
          />
          <p className="mt-2 text-sm text-white/40">
            — {COACH_QUOTE.attribution}
          </p>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Build check**

Run: `cd alex-recruiting && npm run build`
Expected: Build passes

**Step 3: Commit**

```bash
git add src/components/recruit/character.tsx
git commit -m "feat(beat-6): rewrite character as dialogue beat, Team First leads"
```

---

## Task 8: Rewrite Academics as Inline Bar (Beat 7)

**Files:**
- Modify: `src/components/recruit/academics.tsx`

**Step 1: Rewrite academics.tsx**

Beat 7 — neutral, centered, single bar. Fade in.

```tsx
"use client";

import { useMemo } from "react";
import {
  useRecruitAssembly,
  type AssemblyConfig,
} from "@/hooks/useRecruitAssembly";

export function AcademicsBar() {
  const config = useMemo((): AssemblyConfig => {
    return {
      wave2: [
        {
          containerSelector: '[data-beat="academics"]',
          from: { opacity: 0 },
          to: {
            opacity: 1,
            duration: 0.5,
            ease: "sine.out",
          },
          scrollTrigger: {
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        },
      ],
    };
  }, []);

  const { scopeRef } = useRecruitAssembly(config);

  return (
    <div
      id="academics"
      ref={scopeRef}
      className="relative px-6 py-8"
    >
      <div
        data-beat="academics"
        className="mx-auto max-w-3xl text-center"
      >
        <p className="text-sm uppercase tracking-widest text-white/50 md:text-base">
          GPA: <span className="text-white">3.25</span>
          <span className="mx-3 text-[#ff000c]">&middot;</span>
          NCAA Eligible
          <span className="mx-3 text-[#ff000c]">&middot;</span>
          NCSA Verified
        </p>
      </div>
    </div>
  );
}
```

**Step 2: Build check**

Run: `cd alex-recruiting && npm run build`
Expected: Build passes

**Step 3: Commit**

```bash
git add src/components/recruit/academics.tsx
git commit -m "feat(beat-7): compress academics to centered inline bar"
```

---

## Task 9: Rewrite The Fit as Beat 8 (Coach Decides — Pinned)

**Files:**
- Modify: `src/components/recruit/the-fit.tsx`

**Step 1: Rewrite the-fit.tsx**

Beat 8 — Coach speaks, left 2/3, pinned. Typewriter intro. Progressive disclosure. Live activity indicator.

```tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  useRecruitAssembly,
  type AssemblyConfig,
} from "@/hooks/useRecruitAssembly";
import { TypewriterText } from "./typewriter";

interface FitBeatProps {
  backgroundUrl?: string;
}

const FIT_BLOCKS = [
  {
    title: "DEVELOPMENT RUNWAY",
    body: "If you see what he can do at 15, imagine his full potential in college.",
  },
  {
    title: "WHAT HE'S LOOKING FOR",
    body: "A program with a strong D-line and O-line tradition. He wants to help on both sides of the field.",
  },
  {
    title: "THE WINDOW",
    body: "Building his school list now. Sophomore film drops this fall. The conversation starts here.",
  },
];

export function FitBeat({ backgroundUrl }: FitBeatProps) {
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const config = useMemo((): AssemblyConfig => {
    return {
      wave2: [
        {
          containerSelector: '[data-beat="fit"] [data-fit-block]',
          from: { y: 30, opacity: 0 },
          to: {
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
          },
          individual: true,
          stagger: 0.3,
          scrollTrigger: {
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
        },
      ],
    };
  }, []);

  const { scopeRef } = useRecruitAssembly(config);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      id="fit"
      ref={(el) => {
        scopeRef.current = el;
        sectionRef.current = el;
      }}
      className="relative px-6 py-16 md:py-24 md:bg-transparent bg-[#111111]"
    >
      <div data-beat="fit" className="mr-auto md:w-2/3 md:pr-8">
        {/* Typewriter intro */}
        <div className="mb-10">
          <TypewriterText
            text={
              "If you're evaluating a lineman right now, here's why Jacob should be on your board."
            }
            trigger={inView}
            speed={30}
            className="text-lg text-white/70 md:text-xl"
          />
        </div>

        {/* Progressive disclosure blocks */}
        <div className="space-y-6">
          {FIT_BLOCKS.map((block) => (
            <div
              key={block.title}
              data-fit-block
              className="rounded-lg border border-white/5 bg-[#111111] p-6 md:bg-black/50"
            >
              <h3 className="mb-2 text-sm font-bold uppercase tracking-widest text-[#ff000c]">
                {block.title}
              </h3>
              <p className="text-base leading-relaxed text-white/70">
                {block.body}
              </p>
            </div>
          ))}
        </div>

        {/* Live activity indicator */}
        <div className="mt-8 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff000c] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ff000c]" />
          </span>
          <span className="text-sm text-white/40">
            12 programs have viewed this page this month
          </span>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Build check**

Run: `cd alex-recruiting && npm run build`
Expected: Build passes

**Step 3: Commit**

```bash
git add src/components/recruit/the-fit.tsx
git commit -m "feat(beat-8): rewrite the-fit as coach-decides beat with urgency signal"
```

---

## Task 10: Rewrite Contact as Beat 9 (Let's Talk)

**Files:**
- Modify: `src/components/recruit/contact.tsx`

**Step 1: Rewrite contact.tsx**

Beat 9 — both sides converge to center. Contact info slides from left, form slides from right.

```tsx
"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  useRecruitAssembly,
  type AssemblyConfig,
} from "@/hooks/useRecruitAssembly";

export function ContactBeat() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const config = useMemo((): AssemblyConfig => {
    return {
      wave2: [
        {
          containerSelector: '[data-beat="contact"] [data-contact-left]',
          from: { x: -60, opacity: 0 },
          to: {
            x: 0,
            opacity: 1,
            duration: 0.6,
            ease: "power2.out",
          },
          scrollTrigger: {
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        },
        {
          containerSelector: '[data-beat="contact"] [data-contact-right]',
          from: { x: 60, opacity: 0 },
          to: {
            x: 0,
            opacity: 1,
            duration: 0.6,
            ease: "power2.out",
          },
          scrollTrigger: {
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        },
      ],
    };
  }, []);

  const { scopeRef } = useRecruitAssembly(config);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const form = e.currentTarget;
      const data = new FormData(form);
      const res = await fetch("/api/recruit/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(data)),
      });
      if (!res.ok) throw new Error("Failed to send");
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      id="contact"
      ref={scopeRef}
      className="relative px-6 py-16 md:py-24"
    >
      <div data-beat="contact" className="mx-auto max-w-4xl">
        {/* Heading */}
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Let&apos;s Talk.
          </h2>
          <p className="mt-2 text-base text-white/50">
            Interested in Jacob? Reach out directly.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Left — Contact Info */}
          <div data-contact-left className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#ff000c]">
              Contact
            </h3>

            <div className="space-y-3">
              <a
                href="mailto:rodgers.jacob79@gmail.com"
                className="block text-base text-white/70 transition-colors hover:text-white"
              >
                rodgers.jacob79@gmail.com
              </a>
              <a
                href="tel:+12625551234"
                className="block text-base text-white/70 transition-colors hover:text-white"
              >
                (262) 555-1234
              </a>
            </div>

            <div className="mt-6 space-y-3 border-t border-white/10 pt-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#ff000c]">
                Profiles
              </h3>
              {[
                { label: "Twitter", handle: "@JacobRodge52987", href: "https://twitter.com/JacobRodge52987" },
                { label: "Hudl", handle: "Jacob Rodgers", href: "#" },
                { label: "NCSA", handle: "Verified Profile", href: "#" },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-white/50 transition-colors hover:text-white"
                >
                  <span className="text-white/30">{link.label}:</span>{" "}
                  {link.handle}
                </a>
              ))}
            </div>
          </div>

          {/* Right — Form */}
          <div data-contact-right>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-[#ff000c]">
              Send a Message
            </h3>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  name="name"
                  placeholder="Name"
                  required
                  className="w-full rounded-lg border border-white/10 bg-[#111111] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-[#ff000c]/40 focus:outline-none"
                />
                <input
                  name="school"
                  placeholder="School"
                  className="w-full rounded-lg border border-white/10 bg-[#111111] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-[#ff000c]/40 focus:outline-none"
                />
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  required
                  className="w-full rounded-lg border border-white/10 bg-[#111111] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-[#ff000c]/40 focus:outline-none"
                />
                <textarea
                  name="message"
                  placeholder="Message"
                  rows={3}
                  className="w-full rounded-lg border border-white/10 bg-[#111111] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-[#ff000c]/40 focus:outline-none"
                />
                {error && (
                  <p className="text-sm text-red-400">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-lg bg-[#ff000c] px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {submitting ? "Sending..." : "Send"}
                </button>
              </form>
            ) : (
              <div className="rounded-lg border border-white/10 bg-[#111111] p-8 text-center">
                <p className="text-base text-white">Message sent.</p>
                <p className="mt-1 text-sm text-white/50">
                  We&apos;ll respond within 24 hours.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer identity anchor */}
        <div className="mt-12 border-t border-white/5 pt-6 text-center">
          <p className="text-sm text-white/30">
            Jacob Rodgers
            <span className="mx-2 text-[#ff000c]">&middot;</span>
            #79
            <span className="mx-2 text-[#ff000c]">&middot;</span>
            DT/OG
            <span className="mx-2 text-[#ff000c]">&middot;</span>
            Class of 2029
          </p>
          <p className="mt-1 text-sm text-white/20">
            Pewaukee HS
            <span className="mx-2">&middot;</span>
            Wisconsin
          </p>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Build check**

Run: `cd alex-recruiting && npm run build`
Expected: Build passes

**Step 3: Commit**

```bash
git add src/components/recruit/contact.tsx
git commit -m "feat(beat-9): rewrite contact as converging dialogue close"
```

---

## Task 11: Rewire the Page — Assemble All Beats

**Files:**
- Modify: `src/app/recruit/page.tsx`
- Modify: `src/app/recruit/layout.tsx`

**Step 1: Rewrite page.tsx to assemble dialogue beats**

```tsx
"use client";

import { useRef } from "react";
import { RecruitHero } from "@/components/recruit/hero";
import { FilmBeat } from "@/components/recruit/film-reel";
import { CoachMonologue } from "@/components/recruit/coach-monologue";
import { WorkBeat } from "@/components/recruit/origin-story";
import { CharacterBeat } from "@/components/recruit/character";
import { AcademicsBar } from "@/components/recruit/academics";
import { FitBeat } from "@/components/recruit/the-fit";
import { ContactBeat } from "@/components/recruit/contact";
import { FilmGrainOverlay } from "@/components/recruit/film-grain";
import { useRecruitPhotos } from "@/hooks/useRecruitPhotos";
import { useAnalytics } from "@/hooks/useAnalytics";

export default function RecruitPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const { photoMap } = useRecruitPhotos();
  useAnalytics();

  return (
    <div ref={pageRef} className="bg-black">
      <FilmGrainOverlay />

      {/* Beat 1: Introduction (Jacob — right 2/3) */}
      <RecruitHero backgroundUrl={photoMap.hero} />

      {/* Beat 2: Film + Stats (Jacob — right 2/3) */}
      <FilmBeat backgroundUrl={photoMap["film-reel"]} />

      {/* Beat 3: Coach evaluates (Coach — left 2/3) */}
      <CoachMonologue
        id="coach-eval-1"
        lines={[
          "He's got D1 size at 15. 445 deadlift as a freshman.",
          "But is he self-made, or just big?",
        ]}
      />

      {/* Beat 4: The Work (Jacob — right 2/3) */}
      <WorkBeat backgroundUrl={photoMap.origin} />

      {/* Beat 5: Coach reflects (Coach — left 2/3) */}
      <CoachMonologue
        id="coach-eval-2"
        lines={[
          "Four years of documented work. Real facility. Real trainer.",
          "The kid is serious. But will he fit our locker room?",
        ]}
      />

      {/* Beat 6: Character (Jacob — right 2/3) */}
      <CharacterBeat backgroundUrl={photoMap.character} />

      {/* Beat 7: Academics (Neutral — centered bar) */}
      <AcademicsBar />

      {/* Beat 8: The Fit (Coach — left 2/3, pinned) */}
      <FitBeat backgroundUrl={photoMap.fit} />

      {/* Beat 9: Contact (Both — converge to center) */}
      <ContactBeat />
    </div>
  );
}
```

**Step 2: Update layout.tsx — remove old nav components if needed**

In `layout.tsx`, ensure the root wrapper uses pure black/white:
```tsx
<div className={`recruit-page bg-black text-white min-h-screen overflow-x-hidden ${playfair.variable} ${jetbrains.variable}`}>
  {children}
</div>
```

Remove imports for `RecruitNav`, `MobileNav`, `ScrollProgress`, `MusicToggle` from page.tsx if they reference gold or old section IDs. These can be re-added later once adapted to the dialogue layout.

**Step 3: Handle removed components**

The following components are no longer directly used in the page assembly:
- `src/components/recruit/social-proof.tsx` — urgency moved to The Fit beat
- `src/components/recruit/multi-sport.tsx` — content woven into The Work and Character beats
- `src/components/recruit/nav.tsx` — section IDs changed; can be removed or adapted later
- `src/components/recruit/dialogue-beat.tsx` — we ended up inlining the positioning logic per component instead of using a wrapper. Can keep for future use or delete.

Do NOT delete these files — just remove their imports from page.tsx.

**Step 4: Build check**

Run: `cd alex-recruiting && npm run build`
Expected: Build passes with no errors. There may be warnings about unused imports in removed component files — that's fine.

**Step 5: Commit**

```bash
git add src/app/recruit/page.tsx src/app/recruit/layout.tsx
git commit -m "feat: assemble dialogue beats into page, remove old section ordering"
```

---

## Task 12: Update Nav for Dialogue Layout

**Files:**
- Modify: `src/components/recruit/nav.tsx`

**Step 1: Update section IDs in nav**

The nav needs to reference the new beat IDs. Update the section list to match:

```typescript
const SECTIONS = [
  { id: "hero", label: "Intro" },
  { id: "film", label: "Film" },
  { id: "work", label: "Work" },
  { id: "character", label: "Character" },
  { id: "fit", label: "The Fit" },
  { id: "contact", label: "Contact" },
];
```

Replace all gold (`#D4A853`) references with `#ff000c` for active states.

**Step 2: Add nav back to page.tsx**

Add the nav import and component back into the page if desired, or keep it removed for a cleaner dialogue experience (no nav = immersive). This is a design choice — the dialogue layout may work better without nav interruption.

**Step 3: Build check**

Run: `cd alex-recruiting && npm run build`
Expected: Build passes

**Step 4: Commit**

```bash
git add src/components/recruit/nav.tsx src/app/recruit/page.tsx
git commit -m "feat: update nav section IDs for dialogue layout"
```

---

## Task 13: Clean Up Remaining Gold & Verify

**Files:**
- All files in `src/components/recruit/`
- `src/hooks/useRecruitAssembly.ts`

**Step 1: Final gold sweep**

Run: `grep -rn "D4A853\|E8C068\|8B8172" src/ --include="*.tsx" --include="*.ts"`

Fix any remaining references.

**Step 2: Remove unused Lucide icon imports**

Run: `cd alex-recruiting && npm run build`

Fix any TypeScript errors about unused imports (ChevronDown, Play, ArrowRight, ExternalLink, etc. that were removed from rewritten components).

**Step 3: Full build verification**

Run: `cd alex-recruiting && npm run build`
Expected: Build passes clean — no errors, no type errors.

**Step 4: Dev server smoke test**

Run: `cd alex-recruiting && rm -rf .next && npm run dev`

Open http://localhost:3000/recruit and verify:
- Page loads without blank screen
- All 9 beats render in order
- No gold colors visible anywhere
- Animations fire on scroll (left/right alternating)
- Videos play
- Contact form renders

**Step 5: Commit**

```bash
git add -A
git commit -m "chore: final gold cleanup and build verification"
```

---

## Task 14: Add ScrollTrigger Pinning to Film and Fit

**Files:**
- Modify: `src/components/recruit/film-reel.tsx`
- Modify: `src/components/recruit/the-fit.tsx`

**Step 1: Add pinning to Film beat (Beat 2)**

In `film-reel.tsx`, add a GSAP ScrollTrigger pin to the section. The section should pin while stat counters animate, then release.

Add this to the component (after the scopeRef setup):

```tsx
import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Inside the component, add:
useLayoutEffect(() => {
  gsap.registerPlugin(ScrollTrigger);
  const el = sectionRef.current;
  if (!el) return;

  const trigger = ScrollTrigger.create({
    trigger: el,
    start: "top top",
    end: "+=50%",
    pin: true,
    pinSpacing: true,
  });

  return () => trigger.kill();
}, []);
```

**Step 2: Add pinning to The Fit beat (Beat 8)**

Same pattern in `the-fit.tsx`:

```tsx
useLayoutEffect(() => {
  gsap.registerPlugin(ScrollTrigger);
  const el = sectionRef.current;
  if (!el) return;

  const trigger = ScrollTrigger.create({
    trigger: el,
    start: "top top",
    end: "+=60%",
    pin: true,
    pinSpacing: true,
  });

  return () => trigger.kill();
}, []);
```

**Step 3: Test pinning behavior**

Run dev server and scroll through the page. Verify:
- Film section pins when its top reaches viewport top
- Stat counters animate while pinned
- Section unpins after ~50% of viewport height of additional scrolling
- The Fit section pins similarly
- No layout jank on mobile

**Step 4: Commit**

```bash
git add src/components/recruit/film-reel.tsx src/components/recruit/the-fit.tsx
git commit -m "feat: add ScrollTrigger pinning to Film and Fit beats"
```

---

## Summary

| Task | Description | Estimated Scope |
|------|-------------|----------------|
| 1 | Color migration — remove all gold | Find/replace across 13 files |
| 2 | DialogueBeat wrapper component | New component (may not use directly) |
| 3 | Rewrite Hero (Beat 1) | Full rewrite of hero.tsx |
| 4 | CoachMonologue component | New component for Beats 3 & 5 |
| 5 | Rewrite Film (Beat 2) | Full rewrite of film-reel.tsx |
| 6 | Rewrite Origin Story (Beat 4) | Full rewrite of origin-story.tsx |
| 7 | Rewrite Character (Beat 6) | Full rewrite of character.tsx |
| 8 | Rewrite Academics (Beat 7) | Full rewrite of academics.tsx |
| 9 | Rewrite The Fit (Beat 8) | Full rewrite of the-fit.tsx |
| 10 | Rewrite Contact (Beat 9) | Full rewrite of contact.tsx |
| 11 | Rewire page assembly | Modify page.tsx + layout.tsx |
| 12 | Update nav | Modify nav.tsx section IDs |
| 13 | Final cleanup & verify | Grep sweep + build + smoke test |
| 14 | Add ScrollTrigger pinning | Pin Film + Fit beats |
