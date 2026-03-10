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
    title: "Development Runway",
    body: "Class of 2029. Your strength staff gets him at 15 with elite raw material \u2014 445 deadlift, 285 lbs, multi-sport explosiveness \u2014 and three full years to develop him. The ceiling hasn\u2019t been touched.",
  },
  {
    number: "02",
    title: "What He\u2019s Looking For",
    body: "A program with a strong offensive line tradition, coaching staff that invests in player development, and a culture built on competition. Jacob wants to earn it.",
  },
  {
    number: "03",
    title: "The Window",
    body: "Jacob is building his school list. Sophomore film drops this spring. Interested programs should reach out now.",
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
          <div className="absolute inset-0 bg-[#000000]/95" />
        </div>
      )}

      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ff000c]/20 to-transparent" />
      <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff000c]/[0.03] blur-[150px]" />

      <div className="relative z-10 mx-auto max-w-5xl">
        <div className="mb-20 md:mb-32">
          <span className="mb-6 block font-jetbrains text-xs uppercase tracking-[0.3em] text-[#ff000c]/80">
            The Fit
          </span>
          <h2 className="mb-6 font-playfair text-4xl font-black tracking-tight leading-[0.95] md:text-6xl lg:text-7xl">
            Why your program
            <br />
            <span className="bg-gradient-to-r from-[#ff000c] to-[#ff000c] bg-clip-text text-transparent">
              should know
            </span>
            <br />
            Jacob Rodgers.
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
              <div className="relative rounded-2xl border border-white/[0.08] bg-black/60 p-8 backdrop-blur-sm transition-all duration-500 hover:border-[#ff000c]/20 md:flex md:items-start md:gap-10 md:p-10">
                <div className="mb-4 md:mb-0 md:w-20">
                  <span className="font-jetbrains text-3xl font-black text-[#ff000c]/20 transition-colors group-hover:text-[#ff000c]/40 md:text-4xl">
                    {block.number}
                  </span>
                </div>

                <div className="flex-1">
                  <h3 className="mb-3 text-xl font-bold tracking-tight md:text-2xl">
                    {block.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#FFFFFF]/60 md:text-base">
                    {block.body}
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
