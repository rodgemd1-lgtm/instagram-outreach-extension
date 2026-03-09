"use client";

import { useMemo } from "react";
import {
  useRecruitAssembly,
  type AssemblyConfig,
} from "@/hooks/useRecruitAssembly";

const milestones = [
  {
    age: "11",
    year: "2021",
    headline: "NX Level sports-performance work begins.",
    lifts: null,
    detail:
      "Movement quality, speed work, and body control start before the high-school football grind.",
  },
  {
    age: "12",
    year: "2022",
    headline: "Strength work gets structured and consistent.",
    lifts: "Bench: 95  |  Squat: 135  |  Deadlift: 185",
    detail:
      "The emphasis is consistency and long-term development, not chasing one-off maxes.",
  },
  {
    age: "13",
    year: "2023",
    headline: "Volume climbs with private line work and older training groups.",
    lifts: "Bench: 155  |  Squat: 225  |  Deadlift: 275",
    detail:
      "Works with coaches and older players while learning both offensive and defensive line technique.",
  },
  {
    age: "14",
    year: "2024-25",
    headline: "Freshman film year: JV reps, varsity exposure, two-way development.",
    lifts: "Bench: 265  |  Squat: 350  |  Deadlift: 405",
    detail:
      "11 pancakes, 3 sacks, one fumble recovery, and a state-playoff run without overstating the role.",
  },
  {
    age: "15",
    year: "NOW",
    headline: "IMG camps, trench training, and one-on-one work keep the curve moving.",
    lifts: null,
    detail:
      "730+ training sessions logged with Joel and Justin in the mix. The offseason lift numbers still trend up.",
  },
];

export function OriginStory({ backgroundUrl }: { backgroundUrl?: string }) {
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
      className="relative px-6 py-32 md:px-12 md:py-48"
    >
      {backgroundUrl && (
        <div className="absolute inset-0">
          <img
            src={backgroundUrl}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[#0A0A0A]/95" />
        </div>
      )}

      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative z-10 mx-auto max-w-4xl">
        <div className="mb-16 md:mb-24">
          <span className="mb-6 block font-mono text-[10px] uppercase tracking-[0.5em] text-red-500/60">
            The Work
          </span>
          <h2 className="mb-6 text-4xl font-black tracking-tight leading-[0.95] md:text-6xl lg:text-7xl">
            Built early.
            <br />
            <span className="bg-gradient-to-r from-red-500 to-rose-400 bg-clip-text text-transparent">
              Still climbing.
            </span>
            <br />
            730+ sessions logged.
          </h2>
          <p className="max-w-2xl text-base leading-7 text-white/48 md:text-lg">
            Coaches need the real development story, not a polished myth. The
            throughline here is simple: early performance work, steady strength
            gains, two-way football development, and a track-and-field layer
            that reinforces the power projection.
          </p>
        </div>

        <div data-gsap="work-timeline" className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-white/10 md:left-8" />

          {milestones.map((milestone) => (
            <div
              key={milestone.age}
              data-gsap-wave="2"
              style={{ opacity: 0 }}
              className="relative pb-16 pl-12 last:pb-0 md:pl-20"
            >
              <div className="absolute left-[11px] top-1 h-3 w-3 rounded-full border-2 border-[#0A0A0A] bg-red-500 md:left-[27px]" />

              <div className="mb-4 flex items-center gap-4">
                <span className="font-mono text-xs tracking-[0.3em] text-red-500/70">
                  AGE {milestone.age} - {milestone.year}
                </span>
              </div>

              <p className="mb-3 text-base font-semibold leading-relaxed text-white/80 md:text-lg">
                {milestone.headline}
              </p>

              {milestone.lifts && (
                <p className="mb-2 font-mono text-sm tracking-wide text-white/40">
                  {milestone.lifts}
                </p>
              )}

              {milestone.detail && (
                <p className="text-sm leading-relaxed text-white/50">
                  {milestone.detail}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
