"use client";

import { useMemo } from "react";
import {
  useRecruitAssembly,
  type AssemblyConfig,
} from "@/hooks/useRecruitAssembly";

/* ──────────────────────────────────────────────────────────────
   Character Section — 3 traits backed by facts + coach quote
   LAAL Mechanism: Ownership
   Coaches reading these traits envision Jacob on THEIR team.
   Each trait is a micro-story with verifiable evidence.

   Wave 1: none (below fold)
   Wave 2: individual card reveals + coach quote
   ────────────────────────────────────────────────────────────── */

const traits = [
  {
    trait: "Coachable",
    icon: "01",
    description:
      "Plays both sides of the ball — DT and OG — wherever the coaching staff needs him. Started JV and varsity in the same season. No questions asked. Just lined up and played.",
    evidence:
      "Earned a varsity spot as a freshman at Pewaukee by showing up and taking coaching.",
  },
  {
    trait: "Team First",
    icon: "02",
    description:
      "Freshmen don't typically start at Pewaukee. Jacob earned it by showing up every day, doing the work seniors do, and never acting like it was owed to him.",
    evidence:
      "Two-way starter who sometimes played two games in one day — JV and varsity.",
  },
  {
    trait: "Relentless",
    icon: "03",
    description:
      "Has not missed a scheduled training session since October 2022. 730+ sessions. Five days a week. Personal trainer. NX Level. Discus. Shot put. Football. He doesn't stop.",
    evidence:
      "730+ documented training sessions before his sophomore season.",
  },
];

export function CharacterSection({ backgroundUrl }: { backgroundUrl?: string }) {
  const config = useMemo<AssemblyConfig>(
    () => ({
      wave2: [
        {
          containerSelector: '[data-gsap="character-cards"]',
          from: { x: -60, opacity: 0, rotation: -1 },
          to: {
            x: 0,
            opacity: 1,
            rotation: 0,
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
      id="character"
      ref={scopeRef}
      className="relative py-32 md:py-48 px-6 md:px-12"
    >
      {/* Background photo */}
      {backgroundUrl && (
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={backgroundUrl} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#0A0A0A]/95" />
        </div>
      )}

      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-20 md:mb-32">
          <span className="text-[10px] tracking-[0.5em] text-red-500/60 uppercase font-mono block mb-6">
            Character
          </span>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95] mb-6">
            Numbers tell you
            <br />
            what he{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-400">
              can
            </span>{" "}
            do.
          </h2>
          <p className="text-white/40 text-base md:text-lg max-w-xl leading-relaxed">
            These tell you what he will do.
          </p>
        </div>

        {/* Trait cards */}
        <div
          data-gsap="character-cards"
          className="max-w-5xl mx-auto space-y-8 md:space-y-12"
        >
          {traits.map((t) => (
            <div
              key={t.icon}
              data-gsap-wave="2"
              className="group relative"
              style={{ opacity: 0 }}
            >
              <div className="relative bg-black/60 backdrop-blur-sm border border-white/[0.08] rounded-2xl p-8 md:p-12 hover:border-red-500/20 transition-colors duration-500">
                <span className="absolute -top-4 -left-2 md:left-6 text-6xl md:text-8xl font-mono font-black text-white/[0.03] select-none">
                  {t.icon}
                </span>

                <div className="relative z-10 md:flex md:items-start md:gap-12">
                  <div className="md:w-1/3 mb-6 md:mb-0">
                    <h3 className="text-2xl md:text-3xl font-black tracking-tight">
                      {t.trait}
                    </h3>
                  </div>

                  <div className="md:w-2/3">
                    <p className="text-white/70 text-base leading-relaxed mb-4">
                      {t.description}
                    </p>
                    <div className="flex items-start gap-3">
                      <div className="w-1 h-full min-h-[20px] bg-red-500/30 rounded-full mt-1" />
                      <p className="text-red-500/70 text-sm font-mono leading-relaxed">
                        {t.evidence}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Coach quote placeholder */}
        <div className="mt-16 md:mt-20 bg-gradient-to-r from-red-500/5 to-rose-500/5 border border-red-500/10 rounded-2xl p-10 md:p-14">
          <blockquote className="text-xl md:text-2xl font-light text-white/60 leading-relaxed italic">
            &ldquo;Jacob is the first kid in the weight room and the last one
            out. He takes coaching and applies it immediately. You show him
            something once and it shows up in the next rep.&rdquo;
          </blockquote>
          <div className="mt-6 flex items-center gap-3">
            <div className="w-8 h-px bg-red-500/40" />
            <span className="text-xs tracking-[0.2em] text-red-500/60 uppercase font-mono">
              Pewaukee Pirates Coaching Staff
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
