"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  useRecruitAssembly,
  type AssemblyConfig,
} from "@/hooks/useRecruitAssembly";
import { TypewriterText } from "./typewriter";

/* ──────────────────────────────────────────────────────────────
   Jacob's Voice — The athlete speaks for himself.

   Visual treatment is intentionally different from Coach Monologue:
   - Coach: left-aligned, dark bg, italic, "Coach's Evaluation" label
   - Jacob: right-aligned, subtle border-left accent, no italic,
     "In His Own Words" label — signals first-person authenticity
   ────────────────────────────────────────────────────────────── */

const JACOB_PARAGRAPHS = [
  "First day of high school football, I walked into the weight room and the seniors were moving weight I couldn\u2019t even get off the rack. I\u2019m lining up across from guys who\u2019ve been doing this three years longer than me and outweigh me by fifty pounds. There\u2019s this voice in your head that goes, \u201CYou don\u2019t belong here.\u201D I still hear it sometimes.",
  "But I remember this car ride home with my dad where I told him, \u201CDon\u2019t ever let me stop.\u201D I didn\u2019t know if I was good enough. I just knew I wasn\u2019t done.",
];

export function JacobVoice() {
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  const config = useMemo((): AssemblyConfig => {
    return {
      wave2: [
        {
          containerSelector: '[data-gsap="jacob-voice"]',
          from: { x: 60, opacity: 0 },
          to: {
            x: 0,
            opacity: 1,
            duration: 0.7,
            ease: "power2.out",
          },
          scrollTrigger: {
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        },
      ],
    };
  }, []);

  const scopeRef = useRecruitAssembly(config);

  /* ── Pin on desktop so typewriter completes before scroll-away ── */
  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const el = sectionRef.current;
    if (!el) return;

    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", () => {
      const trigger = ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "+=40%",
        pin: true,
        pinSpacing: true,
      });
      return () => trigger.kill();
    });

    return () => mm.revert();
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      id="jacob-voice"
      ref={(el) => {
        (scopeRef as React.MutableRefObject<HTMLElement | null>).current = el;
        (sectionRef as React.MutableRefObject<HTMLElement | null>).current = el;
      }}
      className="relative flex min-h-[60svh] items-center px-6 py-24 md:py-32 bg-black"
    >
      {/* Ambient glow — warm, positioned right (Jacob's side) */}
      <div className="absolute right-[8%] top-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-[#ff000c]/[0.04] blur-[120px] pointer-events-none" />

      {/* Top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ff000c]/10 to-transparent" />

      <div
        data-gsap="jacob-voice"
        className="relative z-10 ml-auto md:w-2/3 md:pl-8"
      >
        {/* Voice label — distinct from coach */}
        <span className="mb-4 block font-jetbrains text-xs uppercase tracking-[0.3em] text-white/40">
          In His Own Words
        </span>

        <div
          data-gsap-wave="2"
          style={{ opacity: 0 }}
          className="rounded-2xl border border-white/[0.08] bg-[#0a0a0a] p-8 md:p-12"
        >
          <div className="space-y-6">
            {JACOB_PARAGRAPHS.map((paragraph, i) => (
              <p
                key={i}
                className="text-lg leading-relaxed text-white/80 md:text-xl"
              >
                {i === 0 ? (
                  <TypewriterText
                    text={paragraph}
                    trigger={inView}
                    speed={25}
                    className="text-white/80"
                  />
                ) : (
                  paragraph
                )}
              </p>
            ))}
          </div>

          {/* Attribution */}
          <div className="mt-8 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/[0.06]" />
            <span className="font-jetbrains text-xs tracking-[0.2em] text-white/30">
              Jacob, age 15
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
