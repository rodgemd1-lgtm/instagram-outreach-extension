"use client";

import { useMemo } from "react";
import {
  useRecruitAssembly,
  type AssemblyConfig,
} from "@/hooks/useRecruitAssembly";

const blocks = [
  {
    number: "01",
    title: "Defensive-Line Ceiling",
    body: "The quickest path to impact is on the defensive line: size, leverage upside, and a strength curve that still has room to move. Offensive-line versatility stays in the background as added value.",
  },
  {
    number: "02",
    title: "Winning Room Fit",
    body: "The right environment is a winning culture built on teamwork, hard work, and real development. Jacob wants teaching, accountability, and a room where work matters more than hype.",
  },
  {
    number: "03",
    title: "Development Inputs Already In Place",
    body: "IMG camps twice a year, trench training, one-on-one work with Joel and Justin, and steady offseason lift gains mean the development habits are already established before a college staff takes over.",
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
            Why your
            <br />
            <span className="bg-gradient-to-r from-red-500 to-rose-400 bg-clip-text text-transparent">
              program
            </span>
            <br />
            should know Jacob.
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
      </div>
    </section>
  );
}
