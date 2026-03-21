"use client";

import { useMemo } from "react";
import {
  useRecruitAssembly,
  type AssemblyConfig,
} from "@/hooks/useRecruitAssembly";
import { Play } from "lucide-react";

/* ──────────────────────────────────────────────────────────────
   Film & Stats Section — The proof
   Purpose: Known-ness
   Concrete numbers that establish Jacob's performance — coaches
   evaluate on measurable output, and this section provides it.

   Wave 1: none (below fold)
   Wave 2: stat cards + highlight cards scroll-reveal
   ────────────────────────────────────────────────────────────── */

const highlights = [
  {
    title: "Pass Protection",
    description:
      "Anchors against bull rushes. Quick feet in pass sets. Maintains leverage with inside hands.",
  },
  {
    title: "Run Blocking",
    description:
      "11 pancake blocks as a freshman. Drives through contact. Creates lanes at the second level.",
  },
  {
    title: "Defensive Disruption",
    description:
      "3 sacks and a fumble recovery. Penetrates gaps with first-step quickness. Motor doesn't stop.",
  },
  {
    title: "Versatility",
    description:
      "Starts at both OL and DL. Rare positional flexibility that gives coordinators options every week.",
  },
];

export function FilmStats() {
  const config = useMemo<AssemblyConfig>(
    () => ({
      wave2: [
        {
          /* Purpose: Known-ness — stats establish measurable identity */
          containerSelector: '[data-gsap="stats-grid"]',
          from: { y: 40, opacity: 0, scale: 0.95 },
          to: {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.5,
            ease: "back.out(1.7)",
          },
          individual: false,
          stagger: 0.1,
          scrollTrigger: {
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        },
        {
          /* Purpose: Known-ness — highlight cards show game film proof */
          containerSelector: '[data-gsap="highlights-grid"]',
          from: { y: 50, opacity: 0, scale: 0.95 },
          to: {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.5,
            ease: "back.out(1.7)",
          },
          individual: false,
          stagger: 0.12,
          scrollTrigger: {
            start: "top 80%",
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
      id="film"
      ref={scopeRef}
      className="relative py-32 md:py-48 px-6 md:px-12"
    >
      {/* Atmospheric divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="mb-20 md:mb-32">
          <span className="text-xs tracking-[0.3em] text-red-500/80 uppercase font-mono block mb-6">
            Film & Stats
          </span>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95] mb-6">
            The tape
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-400">
              doesn&apos;t lie.
            </span>
          </h2>
        </div>

        {/* Stats grid — Wave 2 batched */}
        <div
          data-gsap="stats-grid"
          className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-20 md:mb-32 pb-16 border-b border-white/5"
        >
          <StatBlock
            data-gsap-wave="2"
            value="11"
            label="Pancake Blocks"
          />
          <StatBlock
            data-gsap-wave="2"
            value="3"
            label="Sacks"
          />
          <StatBlock
            data-gsap-wave="2"
            value="265"
            label="Bench Press"
            suffix="lbs"
          />
          <StatBlock
            data-gsap-wave="2"
            value="350"
            label="Squat"
            suffix="lbs"
          />
        </div>

        {/* Secondary stats */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-6 mb-20 md:mb-32">
          <MiniStat value="6'4&quot;" label="Height" />
          <MiniStat value="285" label="Weight" suffix="lbs" />
          <MiniStat value="12-1" label="Record" />
          <MiniStat value="1" label="Fumble Rec" />
          <MiniStat value="#79" label="Jersey" />
          <MiniStat value="FR" label="Year" />
        </div>

        {/* Film highlights — Wave 2 batched */}
        <div
          data-gsap="highlights-grid"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {highlights.map((h) => (
            <div
              key={h.title}
              data-gsap-wave="2"
              style={{ opacity: 0 }}
              className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8 hover:border-red-500/20 transition-colors duration-500"
            >
              <h3 className="text-xl font-bold mb-3 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                {h.title}
              </h3>
              <p className="text-white/40 text-sm leading-relaxed">
                {h.description}
              </p>
            </div>
          ))}
        </div>

        {/* Hudl CTA — Lucide Play icon instead of inline SVG */}
        <div className="mt-16 text-center">
          <a
            href="#"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-all duration-300 group"
          >
            <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-sm tracking-widest uppercase">
              Watch Full Highlights on Hudl
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}

/* ── Sub-components ─────────────────────────────────────────── */

function StatBlock({
  value,
  label,
  suffix = "",
  ...rest
}: {
  value: string;
  label: string;
  suffix?: string;
  "data-gsap-wave"?: string;
}) {
  return (
    <div className="text-center" style={{ opacity: 0 }} {...rest}>
      <div className="text-4xl md:text-6xl font-mono font-black text-white mb-2">
        {value}
        {suffix && (
          <span className="text-lg md:text-2xl text-white/40 ml-1">
            {suffix}
          </span>
        )}
      </div>
      <div className="text-xs tracking-[0.2em] text-white/30 uppercase">
        {label}
      </div>
    </div>
  );
}

function MiniStat({
  value,
  label,
  suffix,
}: {
  value: string;
  label: string;
  suffix?: string;
}) {
  return (
    <div className="text-center py-4">
      <div className="text-lg md:text-2xl font-mono font-bold text-white/80">
        <span>{value}</span>
        {suffix && (
          <span className="text-xs text-white/30 ml-1">{suffix}</span>
        )}
      </div>
      <div className="text-[9px] tracking-[0.2em] text-white/25 uppercase mt-1">
        {label}
      </div>
    </div>
  );
}
