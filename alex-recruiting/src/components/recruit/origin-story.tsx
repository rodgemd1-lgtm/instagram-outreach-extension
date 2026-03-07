"use client";

import { useEffect, useRef } from "react";

const milestones = [
  {
    age: "12",
    year: "2022",
    title: "The Beginning",
    description:
      "Started training five days a week. While other kids played video games, Jacob was in the weight room. Not because someone made him — because he chose it.",
    stat: "5 days/week",
    statLabel: "Training commitment",
    accent: "from-amber-500/20 to-amber-600/5",
  },
  {
    age: "13",
    year: "2023",
    title: "The Foundation",
    description:
      "Built the work ethic that coaches can't teach. Two hours before school, every morning. Film study on weekends. The fundamentals became second nature.",
    stat: "730+",
    statLabel: "Training sessions",
    accent: "from-orange-500/20 to-orange-600/5",
  },
  {
    age: "14",
    year: "2024",
    title: "The Breakout",
    description:
      "Earned a varsity spot as a freshman at Pewaukee HS. Played both sides of the ball — Defensive Tackle and Offensive Guard. 12-1 season. State Champions.",
    stat: "12-1",
    statLabel: "State Champions",
    accent: "from-red-500/20 to-red-600/5",
  },
  {
    age: "15",
    year: "2025",
    title: "The Ascent",
    description:
      "6'4\", 285 lbs with room to grow. Bench 265, squat 350. NCSA verified. Three more years to become one of the top two-way lineman prospects in Wisconsin.",
    stat: "3 years",
    statLabel: "Of growth remaining",
    accent: "from-amber-400/20 to-amber-500/5",
  },
];

export function OriginStory() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

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

        if (!sectionRef.current || !trackRef.current) return;

        const panels = trackRef.current.querySelectorAll(".milestone-panel");
        const totalPanels = panels.length;

        // Horizontal scroll pin
        const tween = gsap.to(trackRef.current, {
          xPercent: -((totalPanels - 1) * 100) / totalPanels,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            pin: true,
            scrub: 1,
            end: () => `+=${window.innerWidth * (totalPanels - 1)}`,
            invalidateOnRefresh: true,
          },
        });

        // Animate each panel's elements on entry
        panels.forEach((panel, i) => {
          const elements = panel.querySelectorAll(".gsap-reveal");
          gsap.fromTo(
            elements,
            { y: 40, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              stagger: 0.12,
              ease: "back.out(1.4)",
              scrollTrigger: {
                trigger: panel,
                containerAnimation: tween,
                start: "left 80%",
                end: "left 20%",
                toggleActions: "play none none reverse",
              },
            }
          );

          // Stat counter animation
          const statEl = panel.querySelector(".stat-value");
          if (statEl) {
            gsap.fromTo(
              statEl,
              { scale: 0.5, opacity: 0 },
              {
                scale: 1,
                opacity: 1,
                duration: 1,
                ease: "back.out(2)",
                scrollTrigger: {
                  trigger: panel,
                  containerAnimation: tween,
                  start: "left 60%",
                  toggleActions: "play none none reverse",
                },
              }
            );
          }
        });

        cleanup = () => {
          ScrollTrigger.getAll().forEach((t: { kill: () => void }) => t.kill());
        };
      } catch {
        // GSAP not available — fallback to static layout
        if (trackRef.current) {
          trackRef.current.style.display = "flex";
          trackRef.current.style.flexDirection = "column";
        }
      }
    };

    initGSAP();
    return () => cleanup?.();
  }, []);

  return (
    <section id="origin" ref={sectionRef} className="relative overflow-hidden">
      {/* Section intro */}
      <div className="absolute top-8 left-8 md:left-12 z-10">
        <span className="text-[10px] tracking-[0.5em] text-amber-400/60 uppercase font-mono">
          The Origin
        </span>
      </div>

      {/* Horizontal track */}
      <div
        ref={trackRef}
        className="flex h-screen"
        style={{ width: `${milestones.length * 100}vw` }}
      >
        {milestones.map((m, i) => (
          <div
            key={m.age}
            className="milestone-panel w-screen h-screen flex items-center justify-center px-8 md:px-20 relative"
          >
            {/* Background gradient unique to panel */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${m.accent} opacity-50`}
            />

            {/* Age number - ghosted in background */}
            <span className="absolute top-1/2 right-12 -translate-y-1/2 text-[16rem] md:text-[24rem] font-black text-white/[0.02] font-mono select-none leading-none">
              {m.age}
            </span>

            {/* Content */}
            <div className="relative z-10 max-w-2xl">
              {/* Timeline indicator */}
              <div className="gsap-reveal flex items-center gap-4 mb-8">
                <div className="w-12 h-px bg-amber-500/50" />
                <span className="text-xs tracking-[0.3em] text-amber-400/70 font-mono">
                  AGE {m.age} &mdash; {m.year}
                </span>
                <div className="flex-1 h-px bg-white/5" />
              </div>

              {/* Title */}
              <h2 className="gsap-reveal text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-[0.95]">
                {m.title}
              </h2>

              {/* Description */}
              <p className="gsap-reveal text-white/50 text-base md:text-lg leading-relaxed max-w-lg mb-10">
                {m.description}
              </p>

              {/* Stat block */}
              <div className="gsap-reveal flex items-end gap-4">
                <span className="stat-value text-5xl md:text-7xl font-mono font-black text-amber-400">
                  {m.stat}
                </span>
                <span className="text-xs tracking-[0.2em] text-white/30 uppercase mb-3">
                  {m.statLabel}
                </span>
              </div>
            </div>

            {/* Panel index dots */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3">
              {milestones.map((_, j) => (
                <div
                  key={j}
                  className={`w-2 h-2 rounded-full transition-all ${
                    j === i ? "bg-amber-400 scale-125" : "bg-white/10"
                  }`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
