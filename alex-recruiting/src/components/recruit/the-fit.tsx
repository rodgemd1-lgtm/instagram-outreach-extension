"use client";

import Image from "next/image";
import { useMemo } from "react";
import {
  useRecruitAssembly,
  type AssemblyConfig,
} from "@/hooks/useRecruitAssembly";

const blocks = [
  {
    number: "01",
    title: "The 2029 OL class is thin.",
    body: "Nationally, the 2029 offensive line class lacks depth at the upper levels. Programs that identify early get a three-year development runway. Programs that wait compete for a shrinking pool.",
  },
  {
    number: "02",
    title: "The measurables pass the initial scan.",
    body: "6'4\", 285, 405 lb deadlift, first-place discus. These are not projections \u2014 they are verified numbers. Coaches spend 15 seconds on initial evaluation. Jacob clears that window.",
  },
  {
    number: "03",
    title: "The development curve is still accelerating.",
    body: "730+ logged training sessions since age 12. Bench from 95 to 265, squat from 135 to 350, deadlift from 185 to 405. The trajectory matters more than the current number.",
  },
  {
    number: "04",
    title: "The scholarship gap is real.",
    body: "Programs with 2029 OL scholarship openings are already evaluating. Every month that passes without contact is a month a competing program uses to build the relationship first.",
  },
];

const reviewBoard = [
  {
    role: "DL Coach View",
    verdict: "Evaluate",
    body: "Get-off, leverage, and disruption are visible on film. The defensive-line upside is real and the power numbers back it up. Worth a deeper look.",
  },
  {
    role: "OL Coach View",
    verdict: "Evaluate",
    body: "Frame, balance, and movement skill suggest two-way projection. At 6'4\" / 285 with room to grow, this is the kind of OL prospect that develops into a starter.",
  },
  {
    role: "Recruiting Ops",
    verdict: "Act Now",
    body: "2029 OL class is shallow. Verified measurables, real film, provable work habit. The window to build this relationship is open now \u2014 it will not stay open.",
  },
];

export function TheFit({ backgroundUrl }: { backgroundUrl?: string }) {
  const config = useMemo<AssemblyConfig>(
    () => ({
      wave2: [
        {
          containerSelector: '[data-gsap="fit-reasons"]',
          from: { x: -50, opacity: 0 },
          to: {
            x: 0,
            opacity: 1,
            duration: 0.5,
            ease: "back.out(1.7)",
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
      id="fit"
      ref={scopeRef}
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
      <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D4A853]/[0.03] blur-[150px]" />

      <div className="relative z-10 mx-auto max-w-5xl">
        <div className="mb-20 md:mb-32">
          <span className="mb-6 block font-jetbrains text-xs uppercase tracking-[0.3em] text-[#D4A853]/80">
            The Fit
          </span>
          <h2 className="mb-6 font-playfair text-4xl font-black tracking-tight leading-[0.95] md:text-6xl lg:text-7xl">
            Programs that wait
            <br />
            <span className="bg-gradient-to-r from-[#D4A853] to-[#E8C068] bg-clip-text text-transparent">
              will miss
            </span>
            <br />
            the window.
          </h2>
        </div>

        <div data-gsap="fit-reasons" className="space-y-6 md:space-y-8">
          {blocks.map((block) => (
            <div
              key={block.number}
              data-gsap-wave="2"
              style={{ opacity: 0 }}
              className="group"
            >
              <div className="relative rounded-2xl border border-white/[0.08] bg-black/60 p-8 backdrop-blur-sm transition-all duration-500 hover:border-[#D4A853]/20 md:flex md:items-start md:gap-10 md:p-10">
                <div className="mb-4 md:mb-0 md:w-20">
                  <span className="font-jetbrains text-3xl font-black text-[#D4A853]/20 transition-colors group-hover:text-[#D4A853]/40 md:text-4xl">
                    {block.number}
                  </span>
                </div>

                <div className="flex-1">
                  <h3 className="mb-3 text-xl font-bold tracking-tight md:text-2xl">
                    {block.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#F5F0E6]/60 md:text-base">
                    {block.body}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-[#C0392B]/20 bg-[#C0392B]/[0.06] p-6 md:p-8">
          <p className="font-jetbrains text-xs uppercase tracking-[0.2em] text-[#C0392B]/90">
            Loss Window
          </p>
          <p className="mt-4 text-base font-semibold leading-7 text-[#F5F0E6]/80 md:text-lg">
            The 2029 OL class is thin. Programs that wait will miss the
            development window. The scholarship gap analysis is clear: early
            evaluators get a three-year runway. Late evaluators compete for
            what is left.
          </p>
          <p className="mt-3 text-sm leading-6 text-[#F5F0E6]/50">
            Every month without contact is a month a competing program builds
            the relationship you have not started yet.
          </p>
        </div>

        <div className="mt-10 rounded-[28px] border border-[#D4A853]/12 bg-gradient-to-r from-[#D4A853]/8 to-[#E8C068]/6 p-8 md:p-10">
          <p className="font-jetbrains text-xs uppercase tracking-[0.2em] text-[#D4A853]/90">
            Coach Verdict
          </p>
          <h3 className="mt-4 text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Verified projection. Verified work habit. Verified numbers.
          </h3>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[#F5F0E6]/58 md:text-base">
            Measurables, film, development timeline, and academic eligibility
            are all on this page. No guessing required. The only question is
            whether your program acts before the class fills.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {reviewBoard.map((review) => (
            <div
              key={review.role}
              className="rounded-[26px] border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between gap-4">
                <p className="font-jetbrains text-xs uppercase tracking-[0.2em] text-[#8B8172]">
                  {review.role}
                </p>
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 font-mono text-xs uppercase tracking-[0.16em] text-emerald-300">
                  {review.verdict}
                </span>
              </div>
              <p className="mt-4 text-sm leading-6 text-[#F5F0E6]/58">{review.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
