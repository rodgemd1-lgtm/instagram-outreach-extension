"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.4 }
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
      className="relative px-6 py-16 md:py-24 bg-black"
    >
      <div
        data-monologue={id}
        className="mr-auto md:w-2/3 md:pr-8"
      >
        <div className="rounded-lg border border-white/5 bg-[#111111] p-8 md:p-12">
          <TypewriterText
            text={fullText}
            trigger={inView}
            speed={35}
            className="text-lg italic leading-relaxed text-white/70 md:text-xl"
          />
        </div>
      </div>
    </div>
  );
}
