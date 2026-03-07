"use client";

import { useEffect, useRef } from "react";

export function AcademicsSection() {
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

        const reveals = sectionRef.current.querySelectorAll(".acad-reveal");
        gsap.fromTo(
          reveals,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 70%",
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
      id="academics"
      ref={sectionRef}
      className="relative py-32 md:py-48 px-6 md:px-12"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="acad-reveal mb-16 md:mb-24">
          <span className="text-[10px] tracking-[0.5em] text-amber-400/60 uppercase font-mono block mb-6">
            Academics
          </span>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95] mb-6">
            Student
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
              {" "}
              athlete.
            </span>
            <br />
            Both words matter.
          </h2>
        </div>

        {/* Academic stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="acad-reveal bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8 text-center">
            <div className="text-5xl md:text-6xl font-mono font-black text-amber-400 mb-3">
              3.25
            </div>
            <div className="text-[10px] tracking-[0.3em] text-white/30 uppercase mb-4">
              GPA
            </div>
            <p className="text-white/40 text-sm">
              Maintains academic excellence while training five days a week and
              starting varsity as a freshman.
            </p>
          </div>

          <div className="acad-reveal bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8 text-center">
            <div className="text-5xl md:text-6xl font-mono font-black text-white mb-3">
              NCAA
            </div>
            <div className="text-[10px] tracking-[0.3em] text-white/30 uppercase mb-4">
              Eligible
            </div>
            <p className="text-white/40 text-sm">
              On track for full NCAA eligibility. Core course requirements and
              GPA thresholds being met across all divisions.
            </p>
          </div>

          <div className="acad-reveal bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8 text-center">
            <div className="text-5xl md:text-6xl font-mono font-black text-white/80 mb-3">
              NCSA
            </div>
            <div className="text-[10px] tracking-[0.3em] text-white/30 uppercase mb-4">
              Verified
            </div>
            <p className="text-white/40 text-sm">
              Active NCSA profile with verified academic and athletic
              credentials. Professionally represented.
            </p>
          </div>
        </div>

        {/* The commitment message */}
        <div className="acad-reveal bg-gradient-to-r from-amber-500/5 to-orange-500/5 border border-amber-500/10 rounded-2xl p-10 md:p-14">
          <blockquote className="text-xl md:text-2xl font-light text-white/70 leading-relaxed italic">
            &ldquo;The weight room teaches discipline. The classroom teaches
            discipline too. Jacob doesn&apos;t separate the two — he brings the
            same focus to both.&rdquo;
          </blockquote>
          <div className="mt-6 flex items-center gap-3">
            <div className="w-8 h-px bg-amber-500/40" />
            <span className="text-xs tracking-[0.2em] text-amber-400/60 uppercase">
              A commitment to excellence, everywhere
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
