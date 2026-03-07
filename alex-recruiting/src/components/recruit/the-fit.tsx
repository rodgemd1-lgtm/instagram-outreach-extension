"use client";

import { useEffect, useRef } from "react";

const reasons = [
  {
    number: "01",
    title: "Size that translates",
    body: "6'4\" 285 as a freshman. Already at D1 minimum threshold with three full years of physical development ahead. His frame can carry 300+ while maintaining athleticism.",
  },
  {
    number: "02",
    title: "Two-way proof of concept",
    body: "Most linemen specialize early. Jacob produces on both sides — 11 pancake blocks on offense, 3 sacks and a fumble recovery on defense. Your coaching staff gets options.",
  },
  {
    number: "03",
    title: "Program-ready culture fit",
    body: "12-1 State Championship season. He knows what winning culture looks like because he helped build one. The transition from high school winner to college contributor is shorter.",
  },
  {
    number: "04",
    title: "Three years of development runway",
    body: "Class of 2029 means your strength staff gets him at 15 with elite raw material. The ceiling hasn't been touched yet. Every month, the measurables climb.",
  },
  {
    number: "05",
    title: "Low maintenance, high return",
    body: "Coachable. Self-motivated. Academically eligible. No off-field concerns. The kind of recruit who adds to your program's culture from day one.",
  },
];

export function TheFit() {
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

        const items = sectionRef.current.querySelectorAll(".fit-item");
        items.forEach((item, i) => {
          gsap.fromTo(
            item,
            { x: i % 2 === 0 ? -60 : 60, opacity: 0 },
            {
              x: 0,
              opacity: 1,
              duration: 0.9,
              ease: "back.out(1.2)",
              scrollTrigger: {
                trigger: item,
                start: "top 85%",
                toggleActions: "play none none reverse",
              },
            }
          );
        });

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
      id="fit"
      ref={sectionRef}
      className="relative py-32 md:py-48 px-6 md:px-12"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-600/3 rounded-full blur-[150px]" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-20 md:mb-32">
          <span className="text-[10px] tracking-[0.5em] text-amber-400/60 uppercase font-mono block mb-6">
            The Fit
          </span>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95] mb-6">
            Why your
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
              program
            </span>
            <br />
            needs Jacob.
          </h2>
          <p className="text-white/40 text-base md:text-lg max-w-lg leading-relaxed">
            Five reasons to start the conversation today.
          </p>
        </div>

        {/* Reasons */}
        <div className="space-y-6 md:space-y-8">
          {reasons.map((r) => (
            <div
              key={r.number}
              className="fit-item group"
            >
              <div className="relative bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8 md:p-10 hover:border-amber-500/20 transition-all duration-500 md:flex md:items-start md:gap-10">
                {/* Number */}
                <div className="md:w-20 mb-4 md:mb-0">
                  <span className="text-3xl md:text-4xl font-mono font-black text-amber-500/20 group-hover:text-amber-500/40 transition-colors">
                    {r.number}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-xl md:text-2xl font-bold tracking-tight mb-3">
                    {r.title}
                  </h3>
                  <p className="text-white/40 text-sm md:text-base leading-relaxed">
                    {r.body}
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
