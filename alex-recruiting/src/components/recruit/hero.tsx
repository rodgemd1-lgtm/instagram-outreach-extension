"use client";

import { useMemo } from "react";
import {
  useRecruitAssembly,
  type AssemblyConfig,
} from "@/hooks/useRecruitAssembly";

interface HeroProps {
  backgroundUrl?: string;
}

export function RecruitHero({ backgroundUrl }: HeroProps) {
  const config = useMemo((): AssemblyConfig => {
    return {
      wave1: [
        {
          name: "hero-jersey",
          from: { opacity: 0, scale: 0.85 },
          to: { opacity: 0.12, scale: 1, duration: 0.5, ease: "sine.out", position: "0" },
        },
        {
          name: "hero-kicker",
          from: { x: 60, opacity: 0 },
          to: { x: 0, opacity: 1, duration: 0.4, ease: "power2.out", position: "0.15" },
        },
        {
          name: "hero-name",
          from: { x: 60, opacity: 0 },
          to: { x: 0, opacity: 1, duration: 0.4, ease: "power2.out", position: "0.25" },
        },
        {
          name: "hero-measurables",
          from: { x: 60, opacity: 0 },
          to: { x: 0, opacity: 1, duration: 0.4, ease: "power2.out", position: "0.35" },
        },
        {
          name: "hero-scroll-cue",
          from: { opacity: 0 },
          to: { opacity: 1, duration: 0.4, ease: "sine.out", position: "0.6" },
        },
      ],
    };
  }, []);

  const scopeRef = useRecruitAssembly(config);

  return (
    <section
      id="hero"
      ref={scopeRef}
      className="relative flex min-h-[100svh] items-center overflow-hidden bg-black"
    >
      {backgroundUrl && (
        <div className="absolute inset-0">
          <img
            src={backgroundUrl}
            alt=""
            className="h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/40" />
        </div>
      )}

      {/* Ghosted 79 — left third */}
      <div
        data-gsap="hero-jersey"
        className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 select-none font-bold text-white opacity-0"
        style={{ fontSize: "clamp(8rem, 30vw, 40rem)", lineHeight: 0.85 }}
      >
        79
      </div>

      {/* Content — right 2/3 */}
      <div className="relative z-10 ml-auto w-full px-6 md:w-2/3 md:px-12">
        <div data-gsap="hero-kicker" className="mb-4 opacity-0">
          <span className="text-sm font-medium uppercase tracking-[0.3em] text-[#C5050C]">
            Class of 2029
          </span>
        </div>

        <div data-gsap="hero-name" className="mb-8 opacity-0">
          <h1
            className="font-black italic uppercase leading-none tracking-tighter text-white"
            style={{ fontSize: "clamp(3.5rem, 9vw, 7.5rem)" }}
          >
            Jacob
            <br />
            Rodgers
          </h1>
        </div>

        <div data-gsap="hero-measurables" className="mb-12 opacity-0">
          <p className="text-lg text-white/80 md:text-xl">
            <span className="text-white">#79</span>
            <span className="mx-2 text-[#C5050C]">&middot;</span>
            DT / OG
            <span className="mx-2 text-[#C5050C]">&middot;</span>
            6&apos;4&quot;
            <span className="mx-2 text-[#C5050C]">&middot;</span>
            285
          </p>
          <p className="mt-2 text-base text-white/60">
            Pewaukee HS
            <span className="mx-2 text-[#C5050C]">&middot;</span>
            Wisconsin
          </p>
          <p className="mt-1 text-base text-white/60">
            Varsity Starter
            <span className="mx-2 text-[#C5050C]">&middot;</span>
            Two-Way Lineman
          </p>
        </div>

        <div data-gsap="hero-scroll-cue" className="opacity-0">
          <button
            onClick={() => {
              document
                .getElementById("film-reel")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="group flex items-center gap-2 text-sm uppercase tracking-widest text-white/50 transition-colors hover:text-white"
          >
            <span className="inline-block h-5 w-px bg-[#C5050C] transition-all group-hover:h-8" />
            Watch the film
          </button>
        </div>
      </div>
    </section>
  );
}
