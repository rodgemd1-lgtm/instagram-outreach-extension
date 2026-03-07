"use client";

import { useMemo } from "react";
import {
  useRecruitAssembly,
  type AssemblyConfig,
} from "@/hooks/useRecruitAssembly";

/* ──────────────────────────────────────────────────────────────
   The Fit — Why your program should know Jacob
   LAAL Mechanism: Ownership + Loss Aversion
   Three blocks: Development Runway (projection), What He's
   Looking For (ownership inversion), The Window (loss aversion).

   Wave 1: none (below fold)
   Wave 2: individual block reveals
   ────────────────────────────────────────────────────────────── */

const blocks = [
  {
    number: "01",
    title: "Development Runway",
    body: "Class of 2029. Your strength staff gets him at 15 with elite raw material — 405 deadlift, 285 lbs, multi-sport explosiveness — and three full years to develop him. The ceiling hasn't been touched.",
  },
  {
    number: "02",
    title: "What He's Looking For",
    body: "A program with a strong offensive line tradition, coaching staff that invests in player development, and a culture built on competition. Jacob wants to earn it.",
  },
  {
    number: "03",
    title: "The Window",
    body: "Jacob is building his school list. Sophomore film drops this fall. Interested programs should reach out now.",
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
      className="relative py-32 md:py-48 px-6 md:px-12"
    >
      {/* Background photo */}
      {backgroundUrl && (
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={backgroundUrl} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#0A0A0A]/88" />
        </div>
      )}

      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/[0.03] rounded-full blur-[150px]" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-20 md:mb-32">
          <span className="text-[10px] tracking-[0.5em] text-red-500/60 uppercase font-mono block mb-6">
            The Fit
          </span>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95] mb-6">
            Why your
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-400">
              program
            </span>
            <br />
            should know Jacob.
          </h2>
        </div>

        {/* Blocks */}
        <div
          data-gsap="fit-reasons"
          className="space-y-6 md:space-y-8"
        >
          {blocks.map((r) => (
            <div
              key={r.number}
              data-gsap-wave="2"
              style={{ opacity: 0 }}
              className="group"
            >
              <div className="relative bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8 md:p-10 hover:border-red-500/20 transition-all duration-500 md:flex md:items-start md:gap-10">
                <div className="md:w-20 mb-4 md:mb-0">
                  <span className="text-3xl md:text-4xl font-mono font-black text-red-500/20 group-hover:text-red-500/40 transition-colors">
                    {r.number}
                  </span>
                </div>

                <div className="flex-1">
                  <h3 className="text-xl md:text-2xl font-bold tracking-tight mb-3">
                    {r.title}
                  </h3>
                  <p className="text-white/40 text-sm md:text-base leading-relaxed">
                    {r.body}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
