"use client";

import Image from "next/image";
import { useMemo } from "react";
import {
  useRecruitAssembly,
  type AssemblyConfig,
} from "@/hooks/useRecruitAssembly";

const traits = [
  {
    trait: "Locker Room Fit",
    icon: "01",
    description:
      "Coaches rank locker room fit as a top-3 recruiting factor. Jacob trains with older athletes, takes coaching from multiple sources, and shows up for offseason work without being asked. The pattern coaches look for: does he make the room better?",
    evidence:
      "Trained alongside upperclassmen since age 13. Multiple coaches, same response: get the correction, apply it on the next rep. No ego, just work.",
  },
  {
    trait: "Coachable Under Pressure",
    icon: "02",
    description:
      "Research shows the #1 trait coaches evaluate in character is coachability under adversity. Jacob has taken coaching from school staff, private OL/DL trainers, and sports-performance coaches across 730+ sessions. The correction-to-application cycle is fast.",
    evidence:
      "Two-way development (OL and DL) requires absorbing different coaching systems simultaneously. That adaptability is visible in the film and the training logs.",
  },
  {
    trait: "Verified Competitor",
    icon: "03",
    description:
      "Multi-sport athletes project better at the college level. Track and field (first-place discus and shot put), football (two-way starter), and year-round lifting all point to the same profile: a big athlete who competes, not just trains.",
    evidence:
      "405 lb deadlift, first-place conference throws, and a state playoff run as a freshman. The competitive edge is documented, not claimed.",
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
          <span className="mb-6 block font-jetbrains text-xs uppercase tracking-[0.3em] text-[#D4A853]/80">
            Character
          </span>
          <h2 className="mb-6 font-playfair text-4xl font-black tracking-tight leading-[0.95] md:text-6xl lg:text-7xl">
            Will he fit
            <br />
            your{" "}
            <span className="bg-gradient-to-r from-[#D4A853] to-[#E8C068] bg-clip-text text-transparent">
              locker room
            </span>
            ?
          </h2>
          <p className="max-w-xl text-base leading-relaxed text-[#F5F0E6]/40 md:text-lg">
            The traits coaches explicitly evaluate, backed by evidence.
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
              <div className="relative rounded-2xl border border-white/[0.08] bg-black/60 p-8 backdrop-blur-sm transition-colors duration-500 hover:border-[#D4A853]/20 md:p-12">
                <span className="absolute -top-4 -left-2 select-none font-jetbrains text-6xl font-black text-[#D4A853]/[0.04] md:left-6 md:text-8xl">
                  {trait.icon}
                </span>

                <div className="relative z-10 md:flex md:items-start md:gap-12">
                  <div className="mb-6 md:mb-0 md:w-1/3">
                    <h3 className="text-2xl font-black tracking-tight md:text-3xl">
                      {trait.trait}
                    </h3>
                  </div>

                  <div className="md:w-2/3">
                    <p className="mb-4 text-base leading-relaxed text-[#F5F0E6]/80">
                      {trait.description}
                    </p>
                    <div className="flex items-start gap-3">
                      <div className="mt-1 h-full min-h-[20px] w-1 rounded-full bg-[#D4A853]/30" />
                      <p className="font-jetbrains text-sm leading-relaxed text-[#D4A853]/90">
                        {trait.evidence}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-[#D4A853]/10 bg-gradient-to-r from-[#D4A853]/5 to-[#E8C068]/5 p-10 md:mt-20 md:p-14">
          <span className="font-jetbrains text-xs uppercase tracking-[0.2em] text-[#D4A853]/80">
            Narrative
          </span>
          <h3 className="mt-4 text-2xl font-semibold tracking-tight text-white">
            The coach&apos;s one-liner.
          </h3>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[#F5F0E6]/58">
            6&apos;4&quot;, 285, two-way lineman, 405 deadlift, first-place
            throws, 730+ training sessions, locker room fit, and a development
            curve that has not flattened. He makes the room better.
          </p>
        </div>
      </div>
    </section>
  );
}
