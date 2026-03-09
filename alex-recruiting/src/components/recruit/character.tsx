"use client";

import Image from "next/image";
import { useMemo } from "react";
import {
  useRecruitAssembly,
  type AssemblyConfig,
} from "@/hooks/useRecruitAssembly";

const traits = [
  {
    trait: "Coachable",
    icon: "01",
    description:
      "Works on both sides of the ball and has taken coaching from school staff, private line trainers, and sports-performance coaches. The pattern is simple: get the correction, apply it on the next rep.",
    evidence:
      "The development story stays grounded in real coaching inputs, film, and training habits instead of inflated labels.",
  },
  {
    trait: "Team Built",
    icon: "02",
    description:
      "The fit is not about ego. It is about being useful to the room, putting in offseason work, and learning around older players and coaches who raise the standard.",
    evidence:
      "The best stills and clips now emphasize huddle presence, line play, and room fit instead of generic hype language.",
  },
  {
    trait: "Well-Rounded",
    icon: "03",
    description:
      "Track and field, snowboarding, lifting, and football all point to the same thing: a big athlete who keeps building movement skill, balance, and usable power.",
    evidence:
      "That wider athlete profile matters because coaches recruit projection, not just the last rep they watched.",
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

      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative z-10 mx-auto max-w-5xl">
        <div className="mb-20 md:mb-32">
          <span className="mb-6 block font-mono text-[10px] uppercase tracking-[0.5em] text-red-500/60">
            Character
          </span>
          <h2 className="mb-6 text-4xl font-black tracking-tight leading-[0.95] md:text-6xl lg:text-7xl">
            Numbers tell you
            <br />
            what he{" "}
            <span className="bg-gradient-to-r from-red-500 to-rose-400 bg-clip-text text-transparent">
              can
            </span>{" "}
            do.
          </h2>
          <p className="max-w-xl text-base leading-relaxed text-white/40 md:text-lg">
            These tell you how he is wired.
          </p>
        </div>

        <div
          data-gsap="character-cards"
          className="mx-auto max-w-5xl space-y-8 md:space-y-12"
        >
          {traits.map((trait) => (
            <div
              key={trait.icon}
              data-gsap-wave="2"
              className="group relative"
              style={{ opacity: 0 }}
            >
              <div className="relative rounded-2xl border border-white/[0.08] bg-black/60 p-8 backdrop-blur-sm transition-colors duration-500 hover:border-red-500/20 md:p-12">
                <span className="absolute -top-4 -left-2 select-none font-mono text-6xl font-black text-white/[0.03] md:left-6 md:text-8xl">
                  {trait.icon}
                </span>

                <div className="relative z-10 md:flex md:items-start md:gap-12">
                  <div className="mb-6 md:mb-0 md:w-1/3">
                    <h3 className="text-2xl font-black tracking-tight md:text-3xl">
                      {trait.trait}
                    </h3>
                  </div>

                  <div className="md:w-2/3">
                    <p className="mb-4 text-base leading-relaxed text-white/70">
                      {trait.description}
                    </p>
                    <div className="flex items-start gap-3">
                      <div className="mt-1 h-full min-h-[20px] w-1 rounded-full bg-red-500/30" />
                      <p className="font-mono text-sm leading-relaxed text-red-500/70">
                        {trait.evidence}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-red-500/10 bg-gradient-to-r from-red-500/5 to-rose-500/5 p-10 md:mt-20 md:p-14">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-red-500/60">
            Narrative
          </span>
          <h3 className="mt-4 text-2xl font-semibold tracking-tight text-white">
            The right sentence for a coach to repeat is simple.
          </h3>
          <p className="mt-4 max-w-3xl text-base leading-7 text-white/58">
            Jacob is a big-framed 2029 lineman with defensive-line upside,
            offensive-line flexibility, first-place throwing power, and a work
            habit that already looks like a college development case.
          </p>
        </div>
      </div>
    </section>
  );
}
