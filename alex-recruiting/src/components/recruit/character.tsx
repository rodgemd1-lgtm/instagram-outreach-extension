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
      "Plays both sides of the ball \u2014 DT and OG \u2014 wherever the coaching staff needs him. Started JV and varsity in the same season. No questions asked. Just lined up and played.",
    evidence:
      "Multiple coaches, same response: get the correction, apply it on the next rep.",
  },
  {
    trait: "Team First",
    icon: "02",
    description:
      "Freshmen don\u2019t typically start at Pewaukee. Jacob earned it by showing up every day, doing the work seniors do, and never acting like it was owed to him.",
    evidence:
      "Trained alongside upperclassmen since age 13. Two games in one day when the team needed him.",
  },
  {
    trait: "Relentless",
    icon: "03",
    description:
      "Has not missed a scheduled training session since October 2022. 730+ sessions. Five days a week. Personal trainer. NX Level. Discus. Shot put. Football.",
    evidence:
      "445 lb deadlift, first-place conference throws, and a state playoff run as a freshman.",
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
          <div className="absolute inset-0 bg-[#000000]/95" />
        </div>
      )}

      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative z-10 mx-auto max-w-5xl">
        <div className="mb-20 md:mb-32">
          <span className="mb-6 block font-jetbrains text-xs uppercase tracking-[0.3em] text-[#ff000c]/80">
            Character
          </span>
          <h2 className="mb-6 font-playfair text-4xl font-black tracking-tight leading-[0.95] md:text-6xl lg:text-7xl">
            Will he fit
            <br />
            your{" "}
            <span className="bg-gradient-to-r from-[#ff000c] to-[#ff000c] bg-clip-text text-transparent">
              locker room
            </span>
            ?
          </h2>
          <p className="max-w-xl text-base leading-relaxed text-[#FFFFFF]/40 md:text-lg">
            Three traits. Evidence for each.
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
              <div className="relative rounded-2xl border border-white/[0.08] bg-black/60 p-8 backdrop-blur-sm transition-colors duration-500 hover:border-[#ff000c]/20 md:p-12">
                <span className="absolute -top-4 -left-2 select-none font-jetbrains text-6xl font-black text-[#ff000c]/[0.04] md:left-6 md:text-8xl">
                  {trait.icon}
                </span>

                <div className="relative z-10 md:flex md:items-start md:gap-12">
                  <div className="mb-6 md:mb-0 md:w-1/3">
                    <h3 className="text-2xl font-black tracking-tight md:text-3xl">
                      {trait.trait}
                    </h3>
                  </div>

                  <div className="md:w-2/3">
                    <p className="mb-4 text-base leading-relaxed text-[#FFFFFF]/80">
                      {trait.description}
                    </p>
                    <div className="flex items-start gap-3">
                      <div className="mt-1 h-full min-h-[20px] w-1 rounded-full bg-[#ff000c]/30" />
                      <p className="font-jetbrains text-sm leading-relaxed text-[#ff000c]/90">
                        {trait.evidence}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-[#ff000c]/10 bg-gradient-to-r from-[#ff000c]/5 to-[#ff000c]/5 p-10 md:mt-20 md:p-14">
          <span className="font-jetbrains text-xs uppercase tracking-[0.2em] text-[#ff000c]/80">
            Narrative
          </span>
          <h3 className="mt-4 text-2xl font-semibold tracking-tight text-white">
            The coach&apos;s one-liner.
          </h3>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[#FFFFFF]/58">
            6&apos;4&quot;, 285, two-way lineman, 445 deadlift, first-place
            throws, 730+ training sessions, locker room fit, and a development
            curve that has not flattened. He makes the room better.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8">
          <p className="font-playfair italic text-xl text-[#FFFFFF]/70 md:text-2xl leading-relaxed">
            &ldquo;[Attributed quote from head coach or position coach &mdash; real name, real title, real words about Jacob&apos;s character and coachability]&rdquo;
          </p>
          <p className="mt-4 font-jetbrains text-sm text-[#ff000c]/80">
            &mdash; Coach [Name], [Title], Pewaukee HS
          </p>
        </div>
      </div>
    </section>
  );
}
