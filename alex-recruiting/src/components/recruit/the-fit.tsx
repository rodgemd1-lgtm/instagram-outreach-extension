"use client";

import { useMemo } from "react";
import {
  useRecruitAssembly,
  type AssemblyConfig,
} from "@/hooks/useRecruitAssembly";

const blocks = [
  {
    number: "01",
    title: "Why select Jacob?",
    body: "Because the projection is easy to see: size, two-way trench experience, verified work habits, and a frame that can keep adding strength without losing movement.",
  },
  {
    number: "02",
    title: "Why stay interested?",
    body: "Because the story compounds instead of flattening. Track and field, year-round lifting, trench work, and game reps all support the same upward trend.",
  },
  {
    number: "03",
    title: "What are the moments of truth?",
    body: "Get-off, leverage, strike timing, finish, and effort after first contact. The page now pushes those moments forward instead of burying them behind generic content.",
  },
  {
    number: "04",
    title: "What is the narrative?",
    body: "Big-framed 2029 OL/DL with real power indicators, verified film, and a serious development routine. The right program gets a two-way projection with room to keep climbing.",
  },
];

const reviewBoard = [
  {
    role: "DL Coach",
    verdict: "Yay",
    body: "The defensive-line upside is believable because the page gets quickly to get-off, leverage, disruption, and finish instead of hiding those truths.",
  },
  {
    role: "OL Coach",
    verdict: "Yay",
    body: "The offensive-line projection stays alive because the frame, balance, and movement traits suggest Jacob is not locked into one trench outcome.",
  },
  {
    role: "Story Editor",
    verdict: "Yay",
    body: "The narrative is clean: big-framed 2029 lineman, real power indicators, multi-sport transfer, verified work habit, and a clear next step for coaches.",
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
      <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600/[0.03] blur-[150px]" />

      <div className="relative z-10 mx-auto max-w-5xl">
        <div className="mb-20 md:mb-32">
          <span className="mb-6 block font-mono text-[10px] uppercase tracking-[0.5em] text-red-500/60">
            The Fit
          </span>
          <h2 className="mb-6 text-4xl font-black tracking-tight leading-[0.95] md:text-6xl lg:text-7xl">
            Read this
            <br />
            <span className="bg-gradient-to-r from-red-500 to-rose-400 bg-clip-text text-transparent">
              like a coach.
            </span>
            <br />
            Decide fast.
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
              <div className="relative rounded-2xl border border-white/[0.08] bg-black/60 p-8 backdrop-blur-sm transition-all duration-500 hover:border-red-500/20 md:flex md:items-start md:gap-10 md:p-10">
                <div className="mb-4 md:mb-0 md:w-20">
                  <span className="font-mono text-3xl font-black text-red-500/20 transition-colors group-hover:text-red-500/40 md:text-4xl">
                    {block.number}
                  </span>
                </div>

                <div className="flex-1">
                  <h3 className="mb-3 text-xl font-bold tracking-tight md:text-2xl">
                    {block.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-white/60 md:text-base">
                    {block.body}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-[28px] border border-red-500/12 bg-gradient-to-r from-red-500/8 to-amber-400/6 p-8 md:p-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-red-500/70">
            Coach Verdict
          </p>
          <h3 className="mt-4 text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Yes, because the projection and the work habit are both believable.
          </h3>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/58 md:text-base">
            This is the kind of page that should lead a coach from identity, to
            film, to development, to fit without asking them to guess what they
            are seeing or why it matters.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {reviewBoard.map((review) => (
            <div
              key={review.role}
              className="rounded-[26px] border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between gap-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-white/35">
                  {review.role}
                </p>
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.24em] text-emerald-300">
                  {review.verdict}
                </span>
              </div>
              <p className="mt-4 text-sm leading-6 text-white/58">{review.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
