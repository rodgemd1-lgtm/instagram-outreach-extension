"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  useRecruitAssembly,
  type AssemblyConfig,
} from "@/hooks/useRecruitAssembly";
import { CounterAnimation } from "./counter";

interface TimelineEntry {
  age: number;
  year: string;
  title: string;
  body: string;
  lifts?: { label: string; value: number }[];
  link?: { text: string; href: string };
  coda?: string;
}

const timeline: TimelineEntry[] = [
  {
    age: 11,
    year: "2021",
    title: "NX Level begins",
    body: "Twice a week. Speed, agility, footwork. Movement training before football volume.",
    link: {
      text: "NX Level Sports Performance",
      href: "https://www.gonxlevel.com",
    },
  },
  {
    age: 12,
    year: "2022",
    title: "Weight training added",
    body: "NX Level continues. Structured strength program starts alongside movement work.",
    lifts: [
      { label: "Bench", value: 95 },
      { label: "Squat", value: 135 },
    ],
  },
  {
    age: 13,
    year: "2023",
    title: "365 sessions",
    body: "Personal trainer. Compound movements for OL/DL. Training with older athletes. Strength curve accelerates.",
    lifts: [
      { label: "Bench", value: 155 },
      { label: "Squat", value: 225 },
    ],
  },
  {
    age: 14,
    year: "2024-25",
    title: "Freshman year — Varsity & JV",
    body: "Played both levels as a freshman. Two games in one day. 11 pancakes. 3 sacks. Fumble recovery. State playoff run.",
    lifts: [
      { label: "Bench", value: 265 },
      { label: "Squat", value: 350 },
      { label: "Deadlift", value: 445 },
    ],
  },
  {
    age: 15,
    year: "NOW",
    title: "The trajectory has not flattened",
    body: "School lifts + personal trainer 2x/week + NX Level 1x/week. Off-season: building size, speed, agility. Track: 1st discus, 1st shot put.",
    link: {
      text: "NX Level Sports Performance",
      href: "https://www.gonxlevel.com",
    },
  },
];

export function OriginStory({ backgroundUrl }: { backgroundUrl?: string }) {
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const config = useMemo<AssemblyConfig>(
    () => ({
      wave2: [
        {
          containerSelector: '[data-gsap="work-timeline"]',
          from: { x: 60, opacity: 0 },
          to: {
            x: 0,
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
            stagger: 0.15,
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
      className="relative bg-black px-6 py-32 md:px-12 md:py-48"
    >
      {backgroundUrl && (
        <div className="absolute inset-0">
          <img
            src={backgroundUrl}
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/95" />
        </div>
      )}

      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ff000c]/20 to-transparent" />

      {/* Right 2/3 layout */}
      <div className="relative z-10 mx-auto max-w-6xl ml-auto md:w-2/3 md:pl-8">
        {/* Header */}
        <div className="mb-16 md:mb-24">
          <span className="mb-6 block font-jetbrains text-xs uppercase tracking-[0.3em] text-[#ff000c]/80">
            The Work
          </span>
          <h2 className="mb-6 font-playfair text-4xl font-black tracking-tight leading-[0.95] md:text-6xl lg:text-7xl text-white">
            Training since age 11.
            <br />
            <CounterAnimation
              target={730}
              suffix="+"
              trigger={inView}
              className="tabular-nums"
            />{" "}
            sessions.
            <br />
            Still going.
          </h2>
        </div>

        {/* Vertical timeline */}
        <div data-gsap="work-timeline" className="relative">
          {/* Red connector line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-[#ff000c]/30 md:left-6" />

          {timeline.map((entry) => (
            <div
              key={entry.age}
              data-gsap-wave="2"
              style={{ opacity: 0 }}
              className="relative pb-14 pl-12 last:pb-0 md:pl-16"
            >
              {/* Timeline dot */}
              <div className="absolute left-[11px] top-1.5 h-3 w-3 rounded-full border-2 border-black bg-[#ff000c] md:left-[19px]" />

              {/* Age / year label */}
              <div className="mb-3 flex items-baseline gap-3">
                <span className="font-jetbrains text-sm font-bold tracking-[0.2em] text-[#ff000c]">
                  AGE {entry.age}
                </span>
                <span className="font-jetbrains text-xs tracking-wider text-white/40">
                  ({entry.year})
                </span>
              </div>

              {/* Title */}
              <p className="mb-2 text-lg font-semibold leading-snug text-white/90 md:text-xl">
                {entry.title}
              </p>

              {/* Body */}
              <p className="mb-3 text-base leading-relaxed text-white/70 md:text-lg">
                {entry.body}
              </p>

              {/* Lift counters */}
              {entry.lifts && (
                <div className="mb-3 flex flex-wrap gap-x-6 gap-y-1">
                  {entry.lifts.map((lift) => (
                    <span
                      key={lift.label}
                      className="font-jetbrains text-sm tracking-wide text-white/50"
                    >
                      {lift.label}:{" "}
                      <CounterAnimation
                        target={lift.value}
                        trigger={inView}
                        className="tabular-nums text-white/80"
                      />
                    </span>
                  ))}
                </div>
              )}

              {/* Link */}
              {entry.link && (
                <a
                  href={entry.link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-sm text-[#ff000c]/70 underline underline-offset-2 transition-colors hover:text-[#ff000c]"
                >
                  {entry.link.text}
                </a>
              )}

              {/* Coda */}
              {entry.coda && (
                <p className="mt-2 font-playfair text-base italic text-white/70">
                  {entry.coda}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
