"use client";

import { useMemo } from "react";
import {
  useRecruitAssembly,
  type AssemblyConfig,
} from "@/hooks/useRecruitAssembly";

/* ──────────────────────────────────────────────────────────────
   The Work — Vertical timeline with lift progression
   LAAL Mechanism: Temporal Window
   Shows the training trajectory from age 12 to now. The year-over-year
   lift progression IS the story — coaches project forward from the data.

   Wave 1: none (section is below fold)
   Wave 2: timeline entries scroll-reveal individually
   ────────────────────────────────────────────────────────────── */

const milestones = [
  {
    age: "12",
    year: "2022",
    headline: "First training session. 185 lbs.",
    lifts: "Bench: 95  |  Squat: 135  |  Deadlift: 185",
    detail: null,
  },
  {
    age: "13",
    year: "2023",
    headline: "365 sessions logged. NX Level agility training begins.",
    lifts: "Bench: 155  |  Squat: 225  |  Deadlift: 275",
    detail: "Added personal trainer — compound movements for OL/DL.",
  },
  {
    age: "14",
    year: "2024-25",
    headline:
      "Freshman starter — varsity AND JV. Two games in one day.",
    lifts: "Bench: 265  |  Squat: 350  |  Deadlift: 405",
    detail: "11 pancakes. 3 sacks. State playoff run.",
  },
  {
    age: "15",
    year: "NOW",
    headline:
      "730+ total sessions. Track & field: 1st place discus, 1st place shot put.",
    lifts: null,
    detail: "The trajectory has not flattened.",
  },
];

export function OriginStory() {
  const config = useMemo<AssemblyConfig>(
    () => ({
      wave2: [
        {
          containerSelector: '[data-gsap="work-timeline"]',
          from: { y: 40, opacity: 0 },
          to: {
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
          },
          individual: true,
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
    <section
      id="origin"
      ref={scopeRef}
      className="relative py-32 md:py-48 px-6 md:px-12"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-16 md:mb-24">
          <span className="text-[10px] tracking-[0.5em] text-red-500/60 uppercase font-mono block mb-6">
            The Work
          </span>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95] mb-6">
            Training since age 12.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-400">
              Five days a week.
            </span>
            <br />
            730+ sessions.
          </h2>
        </div>

        {/* Vertical timeline */}
        <div
          data-gsap="work-timeline"
          className="relative"
        >
          {/* Timeline line */}
          <div className="absolute left-4 md:left-8 top-0 bottom-0 w-px bg-white/10" />

          {milestones.map((m) => (
            <div
              key={m.age}
              data-gsap-wave="2"
              style={{ opacity: 0 }}
              className="relative pl-12 md:pl-20 pb-16 last:pb-0"
            >
              {/* Timeline dot */}
              <div className="absolute left-[11px] md:left-[27px] top-1 w-3 h-3 rounded-full bg-red-500 border-2 border-[#0A0A0A]" />

              {/* Age label */}
              <div className="flex items-center gap-4 mb-4">
                <span className="text-xs tracking-[0.3em] text-red-500/70 font-mono">
                  AGE {m.age} &mdash; {m.year}
                </span>
              </div>

              {/* Headline */}
              <p className="text-white/80 text-base md:text-lg font-semibold leading-relaxed mb-3">
                {m.headline}
              </p>

              {/* Lift numbers */}
              {m.lifts && (
                <p className="text-white/40 text-sm font-mono tracking-wide mb-2">
                  {m.lifts}
                </p>
              )}

              {/* Additional detail */}
              {m.detail && (
                <p className="text-white/30 text-sm leading-relaxed">
                  {m.detail}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
