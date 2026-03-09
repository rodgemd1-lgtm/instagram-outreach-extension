"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  useRecruitAssembly,
  type AssemblyConfig,
} from "@/hooks/useRecruitAssembly";
import { TypewriterText } from "./typewriter";
import { CounterAnimation } from "./counter";

const milestones = [
  {
    age: "11",
    year: "2021",
    headline: "NX Level sports-performance training begins \u2014 movement quality before football volume.",
    lifts: null,
    detail:
      "Speed work, body control, and athletic foundation built 2 years before high-school football. This is where the movement skill comes from.",
  },
  {
    age: "12",
    year: "2022",
    headline: "Structured strength program starts. Five days a week, every week.",
    lifts: "Bench: 95  |  Squat: 135  |  Deadlift: 185",
    detail:
      "730+ sessions start here. Not chasing maxes \u2014 building the habit that produces the numbers two years later.",
  },
  {
    age: "13",
    year: "2023",
    headline: "Private line coaching + training with older athletes. Strength curve accelerates.",
    lifts: "Bench: 155 (+63%)  |  Squat: 225 (+67%)  |  Deadlift: 275 (+49%)",
    detail:
      "Learning OL and DL technique from position coaches while training alongside upperclassmen. Two-way development starts here.",
  },
  {
    age: "14",
    year: "2024-25",
    headline: "Freshman film year: 11 pancakes, 3 sacks, fumble recovery, state playoff run.",
    lifts: "Bench: 265 (+71%)  |  Squat: 350 (+56%)  |  Deadlift: 405 (+47%)",
    detail:
      "Varsity exposure as a freshman. 405 lb deadlift verified. First-place discus and shot put at conference. The power indicators are real and documented.",
  },
  {
    age: "15",
    year: "NOW",
    headline: "IMG camps, trench training, and continued acceleration. The curve has not flattened.",
    lifts: null,
    detail:
      "730+ total training sessions logged. Offseason lifts still trending up. Camp exposure expanding. The development story is provable at every stage.",
  },
];

export function OriginStory({ backgroundUrl }: { backgroundUrl?: string }) {
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

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
      ref={(el) => {
        (scopeRef as React.MutableRefObject<HTMLElement | null>).current = el;
        (sectionRef as React.MutableRefObject<HTMLElement | null>).current = el;
      }}
      className="relative px-6 py-32 md:px-12 md:py-48"
    >
      {backgroundUrl && (
        <div className="absolute inset-0">
          <Image
            src={backgroundUrl}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[#0A0A0A]/95" />
        </div>
      )}

      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4A853]/20 to-transparent" />

      <div className="relative z-10 mx-auto max-w-4xl">
        <div className="mb-16 md:mb-24">
          <span className="mb-6 block font-jetbrains text-xs uppercase tracking-[0.3em] text-[#D4A853]/80">
            The Work
          </span>
          <h2 className="mb-6 font-playfair text-4xl font-black tracking-tight leading-[0.95] md:text-6xl lg:text-7xl">
            Built early.
            <br />
            <span className="bg-gradient-to-r from-[#D4A853] to-[#E8C068] bg-clip-text text-transparent">
              Still climbing.
            </span>
            <br />
            <CounterAnimation target={730} suffix="+" trigger={inView} className="tabular-nums" /> sessions logged.
          </h2>
          <p className="max-w-2xl text-lg leading-8 text-[#F5F0E6]/65 md:text-xl">
            Every claim on this page is provable. 730+ logged sessions. Bench
            from 95 to 265. Squat from 135 to 350. Deadlift from 185 to 405.
            First-place discus and shot put. The work ethic story is data, not
            narrative.
          </p>
        </div>

        {/* Typewriter narrative */}
        <div className="mb-16 border-l-2 border-[#D4A853]/30 pl-6 md:pl-8">
          <TypewriterText
            text="730+ sessions since age 12. 405 lb deadlift. First-place discus. Every number verified. Not because someone made him. Because he chose it."
            trigger={inView}
            className="font-playfair italic text-2xl leading-relaxed text-[#F5F0E6]/80 md:text-3xl"
          />
        </div>

        <div data-gsap="work-timeline" className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-[#D4A853]/15 md:left-8" />

          {milestones.map((milestone) => (
            <div
              key={milestone.age}
              data-gsap-wave="2"
              style={{ opacity: 0 }}
              className="relative pb-16 pl-12 last:pb-0 md:pl-20"
            >
              <div className="absolute left-[11px] top-1 h-3 w-3 rounded-full border-2 border-[#0A0A0A] bg-[#D4A853] md:left-[27px]" />

              <div className="mb-4 flex items-center gap-4">
                <span className="font-jetbrains text-xs tracking-[0.3em] text-[#D4A853]/90">
                  AGE {milestone.age} - {milestone.year}
                </span>
              </div>

              <p className="mb-3 text-base font-semibold leading-relaxed text-[#F5F0E6]/80 md:text-lg">
                {milestone.headline}
              </p>

              {milestone.lifts && (
                <p className="mb-2 font-jetbrains text-sm tracking-wide text-[#F5F0E6]/40">
                  {milestone.lifts}
                </p>
              )}

              {milestone.detail && (
                <p className="text-sm leading-relaxed text-[#F5F0E6]/50">
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
