"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  useRecruitAssembly,
  type AssemblyConfig,
} from "@/hooks/useRecruitAssembly";


const rigorStats = [
  {
    label: "Credits Required",
    value: "28",
    context: "WI state min: 15.5",
  },
  {
    label: "AP Courses",
    value: "24",
    context: "52% of students take AP",
  },
  {
    label: "Graduation Rate",
    value: "97%",
    context: "State avg: 90%",
  },
  {
    label: "College Readiness",
    value: "10/10",
    context: "GreatSchools rating",
  },
];

export function AcademicsSection() {
  const sectionRef = useRef<HTMLElement | null>(null);



  const config = useMemo<AssemblyConfig>(
    () => ({
      wave2: [
        {
          containerSelector: '[data-gsap="acad-content"]',
          from: { y: 30, opacity: 0 },
          to: {
            y: 0,
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
    }),
    []
  );

  const scopeRef = useRecruitAssembly(config);

  return (
    <section
      id="academics"
      ref={(el) => {
        (scopeRef as React.MutableRefObject<HTMLElement | null>).current = el;
        (sectionRef as React.MutableRefObject<HTMLElement | null>).current = el;
      }}
      className="relative bg-black px-6 py-24 md:px-12 md:py-32"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ff000c]/20 to-transparent" />

      <div
        data-gsap="acad-content"
        className="mx-auto max-w-4xl"
      >
        {/* Header */}
        <div data-gsap-wave="2" style={{ opacity: 0 }} className="mb-10 text-center">
          <span className="mb-4 block font-jetbrains text-xs uppercase tracking-[0.3em] text-[#ff000c]/80">
            Academics
          </span>
          <p className="text-2xl font-black text-white md:text-3xl">
            GPA: <span className="tabular-nums">3.25</span>
          </p>
          <p className="mt-2 text-sm text-white/50">
            NCAA Eligible &middot; NCSA Verified
          </p>
        </div>

        {/* Course rigor context */}
        <div
          data-gsap-wave="2"
          style={{ opacity: 0 }}
          className="mb-8 rounded-lg border border-white/5 bg-[#111111] p-6 md:p-8"
        >
          <p className="mb-1 font-jetbrains text-xs uppercase tracking-[0.2em] text-[#ff000c]/70">
            Why this GPA matters
          </p>
          <p className="text-sm leading-relaxed text-white/70 md:text-base">
            Pewaukee High School ranks in the top 6% of Wisconsin high schools
            and requires 28 graduation credits &mdash; nearly double the state minimum
            of 15.5. A 3.25 here is earned under a course load that most schools
            don&apos;t require.
          </p>
        </div>

        {/* Rigor stat grid */}
        <div
          data-gsap-wave="2"
          style={{ opacity: 0 }}
          className="grid grid-cols-2 gap-3 md:grid-cols-4"
        >
          {rigorStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-4 text-center"
            >
              <p className="text-xl font-black text-white md:text-2xl">
                {stat.value}
              </p>
              <p className="mt-1 font-jetbrains text-[10px] uppercase tracking-[0.2em] text-[#ff000c]/70">
                {stat.label}
              </p>
              <p className="mt-1 text-[10px] text-white/40">
                {stat.context}
              </p>
            </div>
          ))}
        </div>

        {/* School distinctions */}
        <div
          data-gsap-wave="2"
          style={{ opacity: 0 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center"
        >
          <span className="text-xs text-white/40">
            #27 in WI (U.S. News)
          </span>
          <span className="inline-block h-1 w-1 rounded-full bg-[#ff000c]/50" />
          <span className="text-xs text-white/40">
            Baldrige National Quality Award
          </span>
          <span className="inline-block h-1 w-1 rounded-full bg-[#ff000c]/50" />
          <span className="text-xs text-white/40">
            97% graduation rate
          </span>
        </div>
      </div>
    </section>
  );
}
