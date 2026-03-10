"use client";

import { KenBurnsImage } from "@/components/recruit/ken-burns";
import { useMemo } from "react";
import { ChevronDown, Play } from "lucide-react";
import {
  useRecruitAssembly,
  type AssemblyConfig,
} from "@/hooks/useRecruitAssembly";

export function RecruitHero({ backgroundUrl }: { backgroundUrl?: string }) {
  const config = useMemo<AssemblyConfig>(
    () => ({
      wave1: [
        {
          name: "hero-jersey",
          from: { opacity: 0, scale: 0.8 },
          to: {
            opacity: 0.12,
            scale: 1,
            duration: 0.4,
            ease: "sine.out",
            position: "0",
          },
        },
        {
          name: "hero-kicker",
          from: { opacity: 0, y: 24 },
          to: {
            opacity: 1,
            y: 0,
            duration: 0.35,
            ease: "back.out(1.7)",
            position: "0.15",
          },
        },
        {
          name: "hero-copy",
          from: { opacity: 0, y: 32 },
          to: {
            opacity: 1,
            y: 0,
            duration: 0.35,
            ease: "back.out(1.7)",
            position: "0.3",
          },
        },
        {
          name: "hero-actions",
          from: { opacity: 0, y: 32 },
          to: {
            opacity: 1,
            y: 0,
            duration: 0.35,
            ease: "power2.out",
            position: "0.45",
          },
        },
        {
          name: "hero-scroll-cue",
          from: { opacity: 0 },
          to: {
            opacity: 1,
            duration: 0.35,
            ease: "sine.out",
            position: "0.7",
          },
        },
      ],
    }),
    []
  );

  const scopeRef = useRecruitAssembly(config);

  return (
    <section
      id="hero"
      ref={scopeRef}
      className="relative flex min-h-[100svh] items-center overflow-hidden px-6 py-24 md:px-12"
    >
      <div className="absolute inset-0">
        {backgroundUrl && (
          <KenBurnsImage src={backgroundUrl} alt="Jacob Rodgers action shot" />
        )}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.2),transparent_24%),linear-gradient(120deg,rgba(8,8,8,0.92)_12%,rgba(8,8,8,0.56)_42%,rgba(8,8,8,0.82)_100%)]" />
        <div className="absolute inset-y-0 right-0 w-[42vw] bg-gradient-to-l from-[#ff000c]/12 via-transparent to-transparent" />
        <div className="absolute left-[8%] top-[14%] h-52 w-52 rounded-full bg-[#C0392B]/10 blur-[100px]" />
        <div className="absolute right-[8%] top-[24%] h-64 w-64 rounded-full bg-[#ff000c]/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(10,10,10,0.5)_100%)]" />
        <div className="absolute -top-20 -left-20 h-[500px] w-[500px] rounded-full bg-[#ff000c]/8 blur-[160px]" />
      </div>

      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-5xl">
        <div data-gsap="hero-jersey" style={{ opacity: 0 }}>
          <span
            className="pointer-events-none absolute left-[-6%] top-1/2 -translate-y-1/2 font-jetbrains text-[14rem] font-black leading-none tracking-tighter text-[#C0392B]/15 blur-[32px] md:text-[24rem] lg:text-[28rem]"
            aria-hidden="true"
          >
            79
          </span>
          <span className="pointer-events-none absolute left-[-4%] top-1/2 -translate-y-1/2 font-jetbrains text-[14rem] font-black leading-none tracking-tighter text-[#FFFFFF]/8 md:text-[24rem] lg:text-[28rem]">
            79
          </span>
        </div>

        <div className="relative">
          <span
            data-gsap="hero-kicker"
            style={{ opacity: 0 }}
            className="mb-6 inline-flex rounded-full border border-white/15 bg-black/35 px-4 py-2 font-jetbrains text-[11px] tracking-[0.35em] text-[#ff000c]/85 backdrop-blur-md"
          >
            CLASS OF 2029 · #79 · DT / OG · PEWAUKEE HS
          </span>

          <div data-gsap="hero-copy" style={{ opacity: 0 }} className="max-w-4xl">
            <h1 className="font-playfair text-5xl font-black leading-[0.92] tracking-[-0.04em] md:text-8xl lg:text-[7.25rem]">
              Jacob Rodgers
            </h1>
            <p className="mt-4 max-w-3xl font-jetbrains text-lg font-medium leading-relaxed tracking-wide text-[#FFFFFF]/70 md:text-xl">
              #79 | DT / OG | 6&apos;4&quot; | 285 | Pewaukee HS | Wisconsin |
              State Playoff Run | Freshman Starter | Two-Way | 445 lb Deadlift
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Measurable label="Height" value={`6'4"`} />
              <Measurable label="Weight" value="285" />
              <Measurable label="Position" value="OL / DL" />
              <Measurable label="Deadlift" value="445 lbs" />
              <Measurable label="Track" value="1st Discus / Shot" />
              <Measurable label="School" value="Pewaukee HS (WI)" />
            </div>

            <div
              data-gsap="hero-actions"
              style={{ opacity: 0 }}
              className="mt-10 flex flex-wrap gap-4"
            >
              <ActionButton
                label="Watch Film"
                onClick={() => {
                  const filmSection = document.getElementById("film-reel");
                  filmSection?.scrollIntoView({ behavior: "smooth" });
                }}
                primary
              />
              <ActionButton
                label="Start Evaluation"
                onClick={() => {
                  const contactSection = document.getElementById("contact");
                  contactSection?.scrollIntoView({ behavior: "smooth" });
                }}
              />
            </div>
          </div>
        </div>

        <div
          data-gsap="hero-scroll-cue"
          style={{ opacity: 0 }}
          className="mt-12 flex items-center gap-3 text-sm text-[#FFFFFF]/45"
        >
          <ChevronDown className="h-4 w-4 animate-bounce text-[#ff000c]/80" />
          Watch the film
        </div>
      </div>
    </section>
  );
}

function Measurable({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full border border-white/12 bg-black/35 px-4 py-3 text-left backdrop-blur-md">
      <div className="mb-1 text-[9px] uppercase tracking-[0.3em] text-[#9CA3AF]">
        {label}
      </div>
      <div className="font-jetbrains text-sm font-semibold text-[#FFFFFF] md:text-base">
        {value}
      </div>
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  primary = false,
}: {
  label: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={
        primary
          ? "inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#C0392B] to-[#A33225] px-7 py-4 text-sm font-bold uppercase tracking-[0.28em] text-white shadow-lg shadow-[#C0392B]/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-[#C0392B]/40"
          : "inline-flex items-center gap-3 rounded-full border border-white/14 bg-black/28 px-7 py-4 text-sm font-semibold uppercase tracking-[0.28em] text-[#FFFFFF]/88 backdrop-blur-md transition-all duration-300 hover:border-[#ff000c]/35 hover:text-white"
      }
    >
      {primary && <Play className="h-4 w-4 fill-current" />}
      {label}
    </button>
  );
}
