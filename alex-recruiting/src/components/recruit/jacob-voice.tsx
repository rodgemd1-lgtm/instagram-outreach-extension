"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  useRecruitAssembly,
  type AssemblyConfig,
} from "@/hooks/useRecruitAssembly";
import { TypewriterText } from "./typewriter";

/* ──────────────────────────────────────────────────────────────
   Jacob's Voice — The athlete speaks for himself.

   Uses typewriter delivery like the coach monologues, but at
   a slower pace (speed 30) to signal a different, younger voice.
   Paragraphs sequence: first finishes → pause → second starts →
   pause → closer lands.
   ────────────────────────────────────────────────────────────── */

const JACOB_PARAGRAPHS = [
  "First day of high school football, I walked into the weight room and the seniors were moving weight I couldn\u2019t even get off the rack. I\u2019m lining up across from guys who\u2019ve been doing this three years longer than me and outweigh me by fifty pounds. There\u2019s this voice in your head that goes, \u201CYou don\u2019t belong here.\u201D I still hear it sometimes.",
  "But I remember this car ride home with my dad where I told him, \u201CDon\u2019t ever let me stop.\u201D I didn\u2019t know if I was good enough. I just knew I wasn\u2019t done.",
  "I\u2019m still not done.",
];

export function JacobVoice() {
  const [inView, setInView] = useState(false);
  const [activeParagraph, setActiveParagraph] = useState(-1);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  const config = useMemo((): AssemblyConfig => {
    return {
      wave2: [
        {
          containerSelector: '[data-gsap="jacob-voice"]',
          from: { y: 40, opacity: 0 },
          to: {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: "power2.out",
          },
          scrollTrigger: {
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        },
      ],
    };
  }, []);

  const scopeRef = useRecruitAssembly(config);

  /* ── Pin on desktop so the typewriter completes before scroll-away ── */
  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const el = sectionRef.current;
    if (!el) return;

    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", () => {
      const trigger = ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "+=60%",
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
        if (entry.isIntersecting) {
          setInView(true);
          setActiveParagraph(0);
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* Advance to next paragraph after a pause */
  const handleParagraphComplete = useCallback((index: number) => {
    const delay = index === JACOB_PARAGRAPHS.length - 2 ? 800 : 600;
    setTimeout(() => {
      setActiveParagraph(index + 1);
    }, delay);
  }, []);

  /* Show CTA after final paragraph */
  const [showCTA, setShowCTA] = useState(false);
  const handleFinalComplete = useCallback(() => {
    setTimeout(() => setShowCTA(true), 400);
  }, []);

  return (
    <div
      id="jacob-voice"
      ref={(el) => {
        (scopeRef as React.MutableRefObject<HTMLElement | null>).current = el;
        (sectionRef as React.MutableRefObject<HTMLElement | null>).current = el;
      }}
      className="relative flex min-h-[50svh] items-center px-6 py-24 md:py-32 bg-black"
    >
      {/* Subtle top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />

      {/* No label. No container. Just Jacob speaking. */}
      <div
        data-gsap="jacob-voice"
        className="relative z-10 ml-auto md:w-2/3 md:pl-8"
      >
        <div
          data-gsap-wave="2"
          style={{ opacity: 0 }}
          className="relative"
        >
          {/* Oversized quotation mark — visual anchor for "someone is speaking" */}
          <span
            className="absolute -top-8 -left-2 font-playfair text-7xl leading-none text-white/[0.06] select-none pointer-events-none md:-left-6 md:-top-10 md:text-8xl"
            aria-hidden="true"
          >
            &ldquo;
          </span>

          <div className="space-y-6">
            {JACOB_PARAGRAPHS.map((paragraph, i) => {
              const isLast = i === JACOB_PARAGRAPHS.length - 1;
              const isActive = i <= activeParagraph;

              return (
                <p
                  key={i}
                  className={`${isLast ? "text-3xl font-bold md:text-4xl" : "text-xl md:text-2xl"} leading-relaxed`}
                  style={{
                    color: isLast ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0.78)",
                    minHeight: isActive ? undefined : 0,
                    visibility: isActive ? "visible" : "hidden",
                    position: isActive ? "relative" : "absolute",
                  }}
                >
                  {isActive ? (
                    <TypewriterText
                      text={paragraph}
                      trigger={i === activeParagraph}
                      speed={isLast ? 50 : 30}
                      className=""
                      onComplete={
                        isLast
                          ? handleFinalComplete
                          : () => handleParagraphComplete(i)
                      }
                    />
                  ) : null}
                </p>
              );
            })}
          </div>

          {/* Attribution — minimal */}
          <div
            className={`mt-8 flex items-center gap-3 transition-opacity duration-500 ${showCTA ? "opacity-100" : "opacity-0"}`}
          >
            <div className="h-px flex-1 bg-white/[0.06]" />
            <span className="font-jetbrains text-xs tracking-[0.2em] text-white/25">
              Jacob, age 15
            </span>
          </div>

          {/* Inline CTA at emotional peak */}
          <div
            className={`mt-10 transition-all duration-700 ease-out ${showCTA ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-full bg-[#ff000c] px-6 py-3 text-sm font-bold uppercase tracking-widest text-white transition hover:opacity-90"
            >
              Reach Out
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
