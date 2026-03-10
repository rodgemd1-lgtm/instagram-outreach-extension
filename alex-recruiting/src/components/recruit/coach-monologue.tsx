"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  useRecruitAssembly,
  type AssemblyConfig,
} from "@/hooks/useRecruitAssembly";
import { TypewriterText } from "./typewriter";

interface CoachMonologueProps {
  id: string;
  lines: string[];
}

export function CoachMonologue({ id, lines }: CoachMonologueProps) {
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  const config = useMemo((): AssemblyConfig => {
    return {
      wave2: [
        {
          containerSelector: `[data-monologue="${id}"]`,
          from: { x: -60, opacity: 0 },
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
  }, [id]);

  const scopeRef = useRecruitAssembly(config);

  /* ── Pin monologue on desktop so typewriter completes before scroll-away ── */
  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const el = sectionRef.current;
    if (!el) return;

    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", () => {
      const trigger = ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "+=30%",
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
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const fullText = `"${lines.join(" ")}"`;

  return (
    <div
      id={id}
      ref={(el) => {
        (scopeRef as React.MutableRefObject<HTMLElement | null>).current = el;
        (sectionRef as React.MutableRefObject<HTMLElement | null>).current = el;
      }}
      className="relative flex min-h-[50svh] items-center px-6 py-24 md:px-12 md:py-32 bg-black"
    >
      {/* Ambient red glow — atmospheric presence */}
      <div className="absolute left-[8%] top-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-[#ff000c]/[0.06] blur-[120px] pointer-events-none" />

      {/* Subtle top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ff000c]/10 to-transparent" />

      <div
        data-monologue={id}
        className="relative z-10 mr-auto md:w-2/3 md:pr-8"
      >
        {/* Coach voice label */}
        <span className="mb-4 block font-jetbrains text-xs uppercase tracking-[0.3em] text-[#ff000c]/70">
          Coach&apos;s Evaluation
        </span>

        <div className="rounded-lg border border-white/5 bg-[#111111] p-8 md:p-12">
          <TypewriterText
            text={fullText}
            trigger={inView}
            speed={35}
            className="text-xl italic leading-relaxed text-white/70 md:text-2xl"
          />
        </div>
      </div>
    </div>
  );
}
