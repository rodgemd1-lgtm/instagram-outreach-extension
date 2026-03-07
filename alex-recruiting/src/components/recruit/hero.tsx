"use client";

import { useMemo } from "react";
import { useRecruitAssembly, type AssemblyConfig } from "@/hooks/useRecruitAssembly";
import { ChevronDown, Play } from "lucide-react";

/* ──────────────────────────────────────────────────────────────
   Hero Section — Wave 1 only (above-fold, no scroll content)
   LAAL Mechanism: Known-ness
   Establishes who Jacob is — name, number, measurables, identity.
   Timing budget: 2.5–3s total hero entrance
   ────────────────────────────────────────────────────────────── */

export function RecruitHero({ backgroundUrl }: { backgroundUrl?: string }) {
  const config = useMemo<AssemblyConfig>(
    () => ({
      wave1: [
        {
          /* LAAL: Known-ness — jersey number, visual anchor */
          name: "hero-jersey",
          from: { opacity: 0, scale: 0.8 },
          to: {
            opacity: 0.15,
            scale: 1,
            duration: 0.4,
            ease: "sine.out",
            position: "0",
          },
        },
        {
          /* LAAL: Known-ness — class year, temporal context */
          name: "hero-class",
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
          /* LAAL: Known-ness — first name, primary identity */
          name: "hero-first",
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
          /* LAAL: Known-ness — last name, primary identity */
          name: "hero-last",
          from: { opacity: 0, y: 32 },
          to: {
            opacity: 1,
            y: 0,
            duration: 0.35,
            ease: "back.out(1.7)",
            position: "0.45",
          },
        },
        {
          /* LAAL: Known-ness — measurables bar */
          name: "hero-measurables",
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
          /* LAAL: Known-ness — identity tagline */
          name: "hero-tagline",
          from: { opacity: 0, y: 20 },
          to: {
            opacity: 1,
            y: 0,
            duration: 0.35,
            ease: "power2.out",
            position: "0.9",
          },
        },
        {
          /* LAAL: Continuity Thread — scroll cue, connects to next section */
          name: "hero-scroll-cue",
          from: { opacity: 0 },
          to: {
            opacity: 1,
            duration: 0.35,
            ease: "sine.out",
            position: "1.2",
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
      className="relative h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background photo + gradient overlay */}
      <div className="absolute inset-0">
        {backgroundUrl && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={backgroundUrl}
            alt="Jacob Rodgers action shot"
            loading="eager"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/70 via-[#0D1117]/60 to-[#0A0A0A]/90" />
        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
      </div>

      {/* Grid overlay for texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Main content */}
      <div className="relative z-10 text-center px-6">
        {/* Jersey number - massive, ghosted, with pulsing glow */}
        <div data-gsap="hero-jersey" style={{ opacity: 0 }}>
          {/* Pulsing glow layer behind the number */}
          <span
            className="font-mono text-[20rem] md:text-[32rem] font-black leading-none tracking-tighter select-none text-red-500/20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 blur-[60px] animate-jersey-pulse"
            aria-hidden="true"
          >
            79
          </span>
          <span className="font-mono text-[20rem] md:text-[32rem] font-black leading-none tracking-tighter select-none text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            79
          </span>
        </div>

        {/* Name */}
        <h1 className="relative">
          <span
            data-gsap="hero-class"
            style={{ opacity: 0 }}
            className="block font-mono text-sm md:text-base tracking-[0.5em] text-red-500/80 mb-4"
          >
            CLASS OF 2029
          </span>
          <span
            data-gsap="hero-first"
            style={{ opacity: 0 }}
            className="block text-5xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.9]"
          >
            JACOB
          </span>
          <span
            data-gsap="hero-last"
            style={{ opacity: 0 }}
            className="block text-5xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.9] text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-red-400"
          >
            RODGERS
          </span>
        </h1>

        {/* Position & measurables */}
        <div
          data-gsap="hero-measurables"
          style={{ opacity: 0 }}
          className="mt-8 md:mt-12 flex flex-wrap items-center justify-center gap-3 md:gap-6"
        >
          <Measurable label="POS" value="DT / OG" />
          <Divider />
          <Measurable label="HT" value={`6'4"`} />
          <Divider />
          <Measurable label="WT" value="285" />
          <Divider />
          <Measurable label="SCHOOL" value="Pewaukee HS" />
          <Divider />
          <Measurable label="STATE" value="WI" />
        </div>

        {/* Qualifying credentials */}
        <p
          data-gsap="hero-tagline"
          style={{ opacity: 0 }}
          className="mt-8 md:mt-12 text-white/60 text-sm md:text-base max-w-xl mx-auto leading-relaxed font-mono tracking-wide"
        >
          State Playoff Run &nbsp;|&nbsp; Freshman Starter &nbsp;|&nbsp; Two-Way
        </p>

        {/* Watch Film CTA — prominent red gradient, scrolls to film section */}
        <div
          data-gsap="hero-scroll-cue"
          style={{ opacity: 0 }}
          className="mt-10 md:mt-14 flex flex-col items-center gap-6"
        >
          <button
            onClick={() => {
              const filmSection = document.getElementById("film-reel");
              if (filmSection) {
                filmSection.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="inline-flex items-center gap-3 px-10 py-4 rounded-full bg-gradient-to-r from-red-600 via-red-500 to-rose-500 text-white font-bold text-sm tracking-widest uppercase shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:scale-105 transition-all duration-300 group"
          >
            <Play className="w-5 h-5 group-hover:scale-110 transition-transform fill-current" />
            Watch Film
          </button>

          {/* Scroll indicator — secondary, subtle */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
            <ChevronDown className="w-4 h-4 text-white/20 animate-pulse" />
          </div>
        </div>
      </div>

    </section>
  );
}

function Measurable({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-[10px] tracking-[0.3em] text-white/30 mb-1">
        {label}
      </div>
      <div className="text-sm md:text-lg font-mono font-semibold text-white/90">
        {value}
      </div>
    </div>
  );
}

function Divider() {
  return <div className="w-px h-8 bg-white/10 hidden md:block" />;
}
