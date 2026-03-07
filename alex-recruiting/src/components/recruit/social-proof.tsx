"use client";

import { useMemo } from "react";
import {
  useRecruitAssembly,
  type AssemblyConfig,
} from "@/hooks/useRecruitAssembly";

/* ------------------------------------------------------------------
   Social Proof Banner
   A thin horizontal strip displaying school names that fade in/out
   in a continuous loop. Signals credibility and breadth of interest
   without making unverifiable claims.

   Positioned between Film and Origin Story sections.
   ------------------------------------------------------------------ */

const SCHOOLS = [
  "Wisconsin",
  "Iowa",
  "Minnesota",
  "Iowa State",
  "North Dakota State",
  "South Dakota State",
  "Illinois State",
  "Northern Illinois",
  "Western Michigan",
  "Eastern Michigan",
  "Ball State",
  "Wisconsin-Whitewater",
];

export function SocialProofBanner() {
  const config = useMemo<AssemblyConfig>(
    () => ({
      wave2: [
        {
          containerSelector: '[data-gsap="social-proof-content"]',
          from: { y: 20, opacity: 0 },
          to: {
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
          },
          individual: false,
          stagger: 0,
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
      ref={scopeRef}
      className="relative py-10 md:py-14 overflow-hidden"
    >
      {/* Top and bottom dividers */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div
        data-gsap="social-proof-content"
        className="max-w-6xl mx-auto px-6"
      >
        <div data-gsap-wave="2" style={{ opacity: 0 }}>
          {/* Label */}
          <p className="text-center text-[10px] tracking-[0.5em] text-white/25 uppercase font-mono mb-6">
            Coaches evaluating Jacob represent programs including
          </p>

          {/* Scrolling school names — CSS-only infinite scroll */}
          <div className="relative">
            {/* Fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-[#0A0A0A] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-[#0A0A0A] to-transparent z-10 pointer-events-none" />

            <div className="flex overflow-hidden">
              <div className="flex animate-scroll-left gap-8 md:gap-12 items-center whitespace-nowrap">
                {[...SCHOOLS, ...SCHOOLS].map((school, i) => (
                  <span
                    key={`${school}-${i}`}
                    className="text-sm md:text-base font-mono text-white/20 hover:text-white/40 transition-colors duration-300 select-none"
                  >
                    {school}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
