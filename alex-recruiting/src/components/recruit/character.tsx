"use client";

import { useMemo } from "react";
import {
  useRecruitAssembly,
  type AssemblyConfig,
} from "@/hooks/useRecruitAssembly";

/* ──────────────────────────────────────────────────────────────
   Character Section — What measurables don't show
   LAAL Mechanism: Ownership
   Coaches reading these traits start to envision Jacob on THEIR
   team. Each trait is evidence that transfers to any program.

   Wave 1: section header entry (fires on scroll into view)
   Wave 2: individual card reveals (ScrollTrigger per card)
   ────────────────────────────────────────────────────────────── */

const traits = [
  {
    trait: "Coachable",
    icon: "01",
    description:
      "First one to ask for feedback. Watches his own film without being told. Takes correction and turns it into improvement by the next rep.",
    evidence:
      "Started varsity as a freshman -- earning trust through attitude, not just talent.",
  },
  {
    trait: "Relentless Work Ethic",
    icon: "02",
    description:
      "Five days a week since age twelve. Not because someone made a schedule -- because he made one himself. Two hours before school, every morning.",
    evidence: "730+ training sessions before his first varsity snap.",
  },
  {
    trait: "Team First",
    icon: "03",
    description:
      "Plays wherever the team needs him. DT on defense, OG on offense. Never complained, never questioned. The kind of player who makes everyone around him better.",
    evidence: "Two-way starter on a 12-1 State Championship team.",
  },
  {
    trait: "Mentally Tough",
    icon: "04",
    description:
      "Thrives under pressure. Doesn't fold when the game is on the line. The bigger the moment, the more locked in he becomes.",
    evidence:
      "11 pancake blocks in a championship season -- most in high-leverage situations.",
  },
  {
    trait: "Growth Mindset",
    icon: "05",
    description:
      "Already 6'4\" 285 as a freshman with elite measurables. But what sets him apart is the hunger -- he knows he's not done. Three more years of development ahead.",
    evidence: "Bench 265 / Squat 350 and still gaining every month.",
  },
];

export function CharacterSection() {
  const config = useMemo<AssemblyConfig>(
    () => ({
      wave2: [
        {
          /* LAAL: Ownership — each trait card lets the coach "claim" this player */
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
      {/* Section header */}
      <div className="max-w-5xl mx-auto mb-20 md:mb-32">
        <span className="text-[10px] tracking-[0.5em] text-red-500/60 uppercase font-mono block mb-6">
          Character
        </span>
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95] mb-6">
          What the
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-400">
            measurables
          </span>
          <br />
          don&apos;t show.
        </h2>
        <p className="text-white/40 text-base md:text-lg max-w-xl leading-relaxed">
          Numbers tell you what a player can do. Character tells you what he
          will do -- when it&apos;s 4th and goal, when nobody&apos;s watching,
          when the easy choice is to quit.
        </p>
      </div>

      {/* Trait cards — Wave 2 scroll-triggered */}
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
            <div className="relative bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8 md:p-12 hover:border-red-500/20 transition-colors duration-500">
              {/* Number accent */}
              <span className="absolute -top-4 -left-2 md:left-6 text-6xl md:text-8xl font-mono font-black text-white/[0.03] select-none">
                {t.icon}
              </span>

              <div className="relative z-10 md:flex md:items-start md:gap-12">
                {/* Trait name */}
                <div className="md:w-1/3 mb-6 md:mb-0">
                  <h3 className="text-2xl md:text-3xl font-black tracking-tight">
                    {t.trait}
                  </h3>
                </div>

                {/* Description + Evidence */}
                <div className="md:w-2/3">
                  <p className="text-white/50 text-base leading-relaxed mb-4">
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
    </section>
  );
}
