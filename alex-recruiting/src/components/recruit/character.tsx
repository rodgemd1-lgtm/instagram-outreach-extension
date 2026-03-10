"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  useRecruitAssembly,
  type AssemblyConfig,
} from "@/hooks/useRecruitAssembly";
import { TypewriterText } from "./typewriter";

const traits = [
  {
    label: "TEAM FIRST",
    body: "Freshmen don\u2019t start on varsity at Pewaukee. Jacob earned it from day one. Shows up doing the work seniors do. Never acted like it was owed.",
  },
  {
    label: "COACHABLE",
    body: "Learns from his peers just as much as his coaches. Takes correction, applies it the next rep.",
  },
  {
    label: "RELENTLESS",
    body: "Has not missed a scheduled session since 2021. 730+. NX Level. Trainer. Discus. Shot put. Snowboarding. Football. He doesn\u2019t stop.",
  },
];

const coachQuote =
  "[Attributed quote from head coach or position coach \u2014 real name, real title, real words about Jacob\u2019s character and coachability]";

export function CharacterSection({
  backgroundUrl,
}: {
  backgroundUrl?: string;
}) {
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const config = useMemo<AssemblyConfig>(
    () => ({
      wave2: [
        {
          containerSelector: '[data-gsap="character-cards"]',
          from: { y: 40, opacity: 0 },
          to: {
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
          },
          individual: true,
          stagger: 0.2,
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
      ref={(el) => {
        (scopeRef as React.MutableRefObject<HTMLElement | null>).current = el;
        (sectionRef as React.MutableRefObject<HTMLElement | null>).current = el;
      }}
      className="relative bg-black px-6 py-32 md:px-12 md:py-48"
    >
      {backgroundUrl && (
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundUrl})` }}
          />
          <div className="absolute inset-0 bg-[#000000]/95" />
        </div>
      )}

      <div className="relative z-10 mx-auto max-w-5xl">
        {/* Right-aligned 2/3 column — Jacob speaks */}
        <div className="ml-auto md:w-2/3 md:pl-8">
          {/* Typewriter intro */}
          <p className="mb-10 font-jetbrains text-lg leading-relaxed text-white/90 md:text-xl">
            <TypewriterText
              text="Numbers tell you what he can do. These tell you what he will do."
              trigger={inView}
              speed={35}
            />
          </p>

          {/* Trait cards — G-Card stack */}
          <div
            data-gsap="character-cards"
            className="space-y-4"
          >
            {traits.map((trait) => (
              <div
                key={trait.label}
                data-gsap-wave="2"
                className="rounded-lg border-l-2 border-[#ff000c] bg-[#111111] p-6"
                style={{ opacity: 0 }}
              >
                <h3 className="mb-2 font-jetbrains text-sm font-bold uppercase tracking-[0.2em] text-white">
                  {trait.label}
                </h3>
                <p className="text-base leading-relaxed text-white/70">
                  {trait.body}
                </p>
              </div>
            ))}
          </div>

          {/* Coach quote placeholder — types last */}
          <div className="mt-10">
            <p className="font-playfair text-lg italic leading-relaxed text-white/50 md:text-xl">
              &ldquo;
              <TypewriterText
                text={coachQuote}
                trigger={inView}
                speed={25}
              />
              &rdquo;
            </p>
            <p className="mt-3 font-jetbrains text-sm text-[#ff000c]/80">
              &mdash; Coach [Name], [Title], Pewaukee HS
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
