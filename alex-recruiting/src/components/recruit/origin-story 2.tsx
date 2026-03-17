"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  useRecruitAssembly,
  type AssemblyConfig,
} from "@/hooks/useRecruitAssembly";
import { CounterAnimation } from "./counter";
import { TypewriterText } from "./typewriter";

interface TimelineEntry {
  id: string;
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
    id: "age-11",
    age: 11,
    year: "2021",
    title: "Before anyone asked him to",
    body: "Movement before position. Speed, agility, and footwork twice a week at NX Level \u2014 building the athletic base that every lineman technique depends on. Stance work, first-step quickness, hip mobility, change of direction. Three years before his first meaningful snap.",
    coda: "Investment precedes attention.",
    link: {
      text: "NX Level Sports Performance",
      href: "https://www.gonxlevel.com",
    },
  },
  {
    id: "age-12",
    age: 12,
    year: "2022",
    title: "The turn",
    body: "The car-ride moment. He\u2019d let himself slip \u2014 and he recognized it before anyone else did. Structured strength training started the next week alongside NX Level. Trench Training with Joel Nellis \u2014 former Wisconsin Badger, now one of the state\u2019s top lineman development coaches \u2014 begins the same year. Learning the barbell and the position at the same time: stance mechanics, fit position, base block fundamentals. These numbers are not impressive. They are the floor.",
    lifts: [
      { label: "Bench", value: 95 },
      { label: "Squat", value: 135 },
    ],
    coda: "The commitment is player-driven, not parent-driven.",
    link: {
      text: "Trench Training",
      href: "https://trenchtraining.com",
    },
  },
  {
    id: "age-13",
    age: 13,
    year: "2023",
    title: "He built a team around himself",
    body: "365 sessions. Personal trainer Justin Quintero at Performance Edge for compound strength \u2014 power cleans, front squats, bench, deadlift progressions built for OL/DL. Trench Training with Joel Nellis continuing \u2014 hand combat, punch timing, drive blocks, swim and rip moves, pass-rush technique. NX Level for speed and agility. IMG camps for national-level competition. Deliberate nutrition \u2014 protein-focused to build muscle, not just grow. Training alongside athletes two and three years older, by choice.",
    lifts: [
      { label: "Bench", value: 155 },
      { label: "Squat", value: 225 },
    ],
    coda: "Four distinct training inputs at age 13. He stopped training for football \u2014 he started training like a football player.",
  },
  {
    id: "age-14-8th",
    age: 14,
    year: "2023-24",
    title: "Opponents heard his name before the snap",
    body: "Started every game at both DT and OG \u2014 the full game, both sides of the ball. Opposing coaches called him out by name, told their players to watch for 79. Semi-finals \u2014 one of the last four teams standing. Key defensive player in every round. Started setting up and breaking down his own film between games.",
    lifts: [
      { label: "Bench", value: 225 },
      { label: "Squat", value: 315 },
    ],
    coda: "When opposing coaches call out your number before the snap, the evaluation has already started.",
  },
  {
    id: "age-15-freshman",
    age: 15,
    year: "2024-25",
    title: "Freshman on Varsity · Starter on JV",
    body: "Called in to play varsity. Started and played full JV games. Two games in one day. 11 pancakes. 3 sacks. Fumble recovery. State playoff run.",
    lifts: [
      { label: "Bench", value: 265 },
      { label: "Squat", value: 350 },
      { label: "Deadlift", value: 445 },
    ],
    coda: "This is year one of four. Everything you just saw is the floor.",
  },
  {
    id: "age-15-now",
    age: 15,
    year: "NOW",
    title: "The curve has not flattened",
    body: "School lifts. Performance Edge twice a week. NX Level once a week. Mental performance coaching through IMG Academy \u2014 because he realized sports are as much mental as physical. Blocking out noise, recovering from setbacks, leading through adversity. Five concurrent training tracks \u2014 none dropped, all progressing. Track and field: first in discus, first in shot put at 285 pounds. The rate of improvement has not slowed.",
    coda: "Still in the steep part of the curve.",
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
          containerSelector: '[data-gsap="car-ride"]',
          from: { y: 30, opacity: 0 },
          to: {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: "power2.out",
          },
          individual: false,
          scrollTrigger: {
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        },
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
      className="relative bg-black px-6 py-20 md:px-12 md:py-48"
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
      <div className="relative z-10 max-w-6xl ml-auto md:w-2/3 md:pl-8">
        {/* Header */}
        <div className="mb-10 md:mb-24">
          <span className="mb-6 block font-jetbrains text-xs uppercase tracking-[0.3em] text-[#ff000c]/80">
            The Work
          </span>
          <h2 className="mb-6 font-playfair text-3xl font-black tracking-tight leading-[0.95] md:text-6xl lg:text-7xl text-white">
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

        {/* ── Car-ride moment — standalone emotional beat (appears alone first) ── */}
        <div data-gsap="car-ride" className="mb-0">
          <div
            data-gsap-wave="2"
            style={{ opacity: 0 }}
            className="relative rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#111111] to-[#0a0a0a] p-8 md:p-12"
          >
            {/* Ambient glow behind the quote */}
            <div className="absolute -left-8 top-1/2 -translate-y-1/2 h-40 w-40 rounded-full bg-[#ff000c]/[0.06] blur-[80px] pointer-events-none" />

            <span className="mb-6 block font-jetbrains text-xs uppercase tracking-[0.3em] text-[#ff000c]/70">
              Age 12
            </span>

            <blockquote className="relative z-10">
              <p className="font-playfair text-2xl italic leading-relaxed text-white/90 md:text-3xl lg:text-4xl">
                <TypewriterText
                  text={`"Dad, don\u2019t ever let me stop. If I don\u2019t want to work out one day, push me."`}
                  trigger={inView}
                  speed={40}
                  className="text-white/90"
                />
              </p>
            </blockquote>

            <p className="mt-6 text-base leading-relaxed text-white/70 md:text-lg">
              On the drive home one night, after he&apos;d let himself slip, Jacob
              turned and said the words that changed everything. Structured
              training started the next week. He hasn&apos;t stopped since.
            </p>
          </div>
        </div>

        {/* Spacer — keeps quote isolated before timeline scrolls in */}
        <div className="h-[15vh] md:h-[40vh]" />

        {/* Vertical timeline */}
        <div data-gsap="work-timeline" className="relative">
          {/* Red connector line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-[#ff000c]/30 md:left-6" />

          {timeline.map((entry) => (
            <div
              key={entry.id}
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
