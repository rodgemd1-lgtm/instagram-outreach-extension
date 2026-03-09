"use client";

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
          name: "hero-rail",
          from: { opacity: 0, y: 24 },
          to: {
            opacity: 1,
            y: 0,
            duration: 0.35,
            ease: "power2.out",
            position: "0.7",
          },
        },
        {
          name: "hero-scroll-cue",
          from: { opacity: 0 },
          to: {
            opacity: 1,
            duration: 0.35,
            ease: "sine.out",
            position: "1.05",
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
          <img
            src={backgroundUrl}
            alt="Jacob Rodgers action shot"
            loading="eager"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.2),transparent_24%),linear-gradient(120deg,rgba(8,8,8,0.92)_12%,rgba(8,8,8,0.56)_42%,rgba(8,8,8,0.82)_100%)]" />
        <div className="absolute inset-y-0 right-0 w-[42vw] bg-gradient-to-l from-[#F59E0B]/18 via-transparent to-transparent" />
        <div className="absolute left-[8%] top-[14%] h-52 w-52 rounded-full bg-red-500/12 blur-[100px]" />
        <div className="absolute right-[8%] top-[24%] h-64 w-64 rounded-full bg-amber-400/10 blur-[120px]" />
      </div>

      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
        <div data-gsap="hero-jersey" style={{ opacity: 0 }}>
          <span
            className="pointer-events-none absolute left-[-6%] top-1/2 -translate-y-1/2 font-mono text-[14rem] font-black leading-none tracking-tighter text-red-500/18 blur-[32px] md:text-[24rem] lg:text-[28rem]"
            aria-hidden="true"
          >
            79
          </span>
          <span className="pointer-events-none absolute left-[-4%] top-1/2 -translate-y-1/2 font-mono text-[14rem] font-black leading-none tracking-tighter text-white/10 md:text-[24rem] lg:text-[28rem]">
            79
          </span>
        </div>

        <div className="relative">
          <span
            data-gsap="hero-kicker"
            style={{ opacity: 0 }}
            className="mb-6 inline-flex rounded-full border border-white/15 bg-black/35 px-4 py-2 font-mono text-[11px] tracking-[0.35em] text-amber-300/85 backdrop-blur-md"
          >
            PEWAUKEE HS · CLASS OF 2029 · #79
          </span>

          <div data-gsap="hero-copy" style={{ opacity: 0 }} className="max-w-4xl">
            <h1 className="text-5xl font-black leading-[0.92] tracking-[-0.04em] md:text-8xl lg:text-[7.25rem]">
              Jacob Rodgers
            </h1>
            <p className="mt-4 max-w-3xl text-lg font-medium leading-relaxed text-white/72 md:text-2xl">
              Defensive-line upside. Offensive-line versatility. First-place
              shot put and discus power. Built through trench training,
              sports-performance work, and a year-round weight-room routine.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Measurable label="Position" value="OL / DL" />
              <Measurable label="Height" value={`6'4"`} />
              <Measurable label="Weight" value="285" />
              <Measurable label="School" value="Pewaukee HS" />
              <Measurable label="Track" value="Discus / Shot Put" />
              <Measurable label="State" value="WI" />
            </div>

            <div
              data-gsap="hero-actions"
              style={{ opacity: 0 }}
              className="mt-10 flex flex-wrap gap-4"
            >
              <ActionButton
                label="Watch Impact Reel"
                onClick={() => {
                  const filmSection = document.getElementById("film-reel");
                  filmSection?.scrollIntoView({ behavior: "smooth" });
                }}
                primary
              />
              <ActionButton
                label="Contact Family"
                onClick={() => {
                  const contactSection = document.getElementById("contact");
                  contactSection?.scrollIntoView({ behavior: "smooth" });
                }}
              />
            </div>
          </div>
        </div>

        <div
          data-gsap="hero-rail"
          style={{ opacity: 0 }}
          className="relative overflow-hidden rounded-[32px] border border-white/12 bg-black/40 p-6 backdrop-blur-xl shadow-[0_28px_90px_rgba(0,0,0,0.28)] lg:p-8"
        >
          <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(245,158,11,0.14),transparent_40%,rgba(255,255,255,0.03))]" />
          <div className="relative">
            <span className="font-mono text-[10px] tracking-[0.4em] text-amber-300/75">
              COACH SNAPSHOT
            </span>
            <div className="mt-6 grid gap-4">
              <SnapshotCard
                label="Why Select Jacob"
                title="Big frame and real two-way projection"
                body="The film starts with defensive-line finishes, but the offensive-line flexibility, movement skill, and size keep the upside broad."
              />
              <SnapshotCard
                label="Why Stay Interested"
                title="The power story is bigger than football alone"
                body="Track and field, strength work, trench sessions, and year-round training all point in the same direction: the body is still moving upward."
              />
              <SnapshotCard
                label="Moments Of Truth"
                title="Get-off, leverage, finish, and effort"
                body="The best clips were selected because coaches can quickly find #79, see the contact point, and judge how the rep ends."
              />
            </div>

            <div
              data-gsap="hero-scroll-cue"
              style={{ opacity: 0 }}
              className="mt-8 flex items-center gap-3 text-sm text-white/45"
            >
              <Play className="h-4 w-4 text-amber-300/80" />
              Scroll to film for the new coach-first reel, ranked clips, and the athlete-story layer.
              <ChevronDown className="ml-auto h-4 w-4 animate-bounce text-white/30" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Measurable({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full border border-white/12 bg-black/35 px-4 py-3 text-left backdrop-blur-md">
      <div className="mb-1 text-[9px] uppercase tracking-[0.3em] text-white/35">
        {label}
      </div>
      <div className="font-mono text-sm font-semibold text-white/92 md:text-base">
        {value}
      </div>
    </div>
  );
}

function SnapshotCard({
  label,
  title,
  body,
}: {
  label: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
      <div className="text-[9px] uppercase tracking-[0.3em] text-amber-300/60">
        {label}
      </div>
      <h3 className="mt-2 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-white/60">{body}</p>
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
          ? "inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-red-600 via-red-500 to-amber-400 px-7 py-4 text-sm font-bold uppercase tracking-[0.28em] text-white shadow-lg shadow-red-500/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-red-500/40"
          : "inline-flex items-center gap-3 rounded-full border border-white/14 bg-black/28 px-7 py-4 text-sm font-semibold uppercase tracking-[0.28em] text-white/88 backdrop-blur-md transition-all duration-300 hover:border-amber-300/35 hover:text-white"
      }
    >
      {primary && <Play className="h-4 w-4 fill-current" />}
      {label}
    </button>
  );
}
