"use client";

import { useEffect, useRef, useState } from "react";

interface StatBlockProps {
  value: string;
  label: string;
  suffix?: string;
}

function AnimatedStat({ value, label, suffix = "" }: StatBlockProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [displayValue, setDisplayValue] = useState("0");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !visible) {
          setVisible(true);
          const numericValue = parseInt(value.replace(/[^0-9]/g, ""));
          if (isNaN(numericValue)) {
            setDisplayValue(value);
            return;
          }

          const duration = 1500;
          const steps = 40;
          const stepDuration = duration / steps;
          let step = 0;

          const interval = setInterval(() => {
            step++;
            const progress = step / steps;
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(numericValue * eased);
            setDisplayValue(
              value.includes("'")
                ? value
                : value.includes(".")
                ? (numericValue * eased).toFixed(1)
                : String(current)
            );
            if (step >= steps) {
              setDisplayValue(value);
              clearInterval(interval);
            }
          }, stepDuration);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, visible]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl md:text-6xl font-mono font-black text-white mb-2">
        {displayValue}
        {suffix && (
          <span className="text-lg md:text-2xl text-white/40 ml-1">
            {suffix}
          </span>
        )}
      </div>
      <div className="text-[10px] tracking-[0.3em] text-white/30 uppercase">
        {label}
      </div>
    </div>
  );
}

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
      "Starts at both DT and OG. Rare positional flexibility that gives coordinators options every week.",
  },
];

export function FilmStats() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const initGSAP = async () => {
      try {
        const gsapModule = await import("gsap");
        const scrollTriggerModule = await import("gsap/ScrollTrigger");
        const gsap = gsapModule.default || gsapModule;
        const ScrollTrigger =
          scrollTriggerModule.ScrollTrigger || scrollTriggerModule.default;

        gsap.registerPlugin(ScrollTrigger);

        if (!sectionRef.current) return;

        const cards = sectionRef.current.querySelectorAll(".highlight-card");
        gsap.fromTo(
          cards,
          { y: 60, opacity: 0, scale: 0.95 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: "back.out(1.4)",
            scrollTrigger: {
              trigger: sectionRef.current.querySelector(".highlights-grid"),
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );

        cleanup = () => {
          ScrollTrigger.getAll().forEach((t: { kill: () => void }) => t.kill());
        };
      } catch {
        // Fallback
      }
    };

    initGSAP();
    return () => cleanup?.();
  }, []);

  return (
    <section
      id="film"
      ref={sectionRef}
      className="relative py-32 md:py-48 px-6 md:px-12"
    >
      {/* Atmospheric divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="mb-20 md:mb-32">
          <span className="text-[10px] tracking-[0.5em] text-amber-400/60 uppercase font-mono block mb-6">
            Film & Stats
          </span>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95] mb-6">
            The tape
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
              doesn&apos;t lie.
            </span>
          </h2>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-20 md:mb-32 pb-16 border-b border-white/5">
          <AnimatedStat value="11" label="Pancake Blocks" />
          <AnimatedStat value="3" label="Sacks" />
          <AnimatedStat value="265" label="Bench Press" suffix="lbs" />
          <AnimatedStat value="350" label="Squat" suffix="lbs" />
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

        {/* Film highlights */}
        <div className="highlights-grid grid grid-cols-1 md:grid-cols-2 gap-6">
          {highlights.map((h) => (
            <div
              key={h.title}
              className="highlight-card bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8 hover:border-amber-500/20 transition-colors duration-500"
            >
              <h3 className="text-xl font-bold mb-3 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                {h.title}
              </h3>
              <p className="text-white/40 text-sm leading-relaxed">
                {h.description}
              </p>
            </div>
          ))}
        </div>

        {/* Hudl CTA */}
        <div className="mt-16 text-center">
          <a
            href="#"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 transition-all duration-300 group"
          >
            <svg
              className="w-5 h-5 group-hover:scale-110 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm tracking-widest uppercase">
              Watch Full Highlights on Hudl
            </span>
          </a>
        </div>
      </div>
    </section>
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
        <span dangerouslySetInnerHTML={{ __html: value }} />
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
