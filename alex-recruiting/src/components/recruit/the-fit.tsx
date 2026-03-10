"use client";

import Image from "next/image";
import { useMemo, useRef, useState, useEffect } from "react";
import {
  useRecruitAssembly,
  type AssemblyConfig,
} from "@/hooks/useRecruitAssembly";
import { TypewriterText } from "./typewriter";

const blocks = [
  {
    label: "DEVELOPMENT RUNWAY",
    body: "If you see what he can do at 15, imagine his full potential in college.",
  },
  {
    label: "WHAT HE\u2019S LOOKING FOR",
    body: "A program with a strong D-line and O-line tradition. He wants to help on both sides of the field.",
  },
  {
    label: "THE WINDOW",
    body: "Building his school list now. Sophomore film drops this fall. The conversation starts here.",
  },
];

export function TheFit({ backgroundUrl }: { backgroundUrl?: string }) {
  const [typewriterTriggered, setTypewriterTriggered] = useState(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  const config = useMemo<AssemblyConfig>(
    () => ({
      wave2: [
        {
          containerSelector: '[data-gsap="fit-blocks"]',
          from: { y: 30, opacity: 0 },
          to: {
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
          },
          individual: true,
          stagger: 0.3,
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

  // IntersectionObserver for typewriter trigger
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTypewriterTriggered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="fit"
      ref={(el) => {
        (scopeRef as React.MutableRefObject<HTMLElement | null>).current = el;
        (sectionRef as React.MutableRefObject<HTMLElement | null>).current = el;
      }}
      className="relative px-6 py-32 md:px-12 md:py-48"
    >
      {backgroundUrl && (
        <div className="absolute inset-0">
          <Image
            src={backgroundUrl}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[#000000]/95" />
        </div>
      )}

      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ff000c]/20 to-transparent" />

      <div className="relative z-10 mx-auto max-w-5xl">
        {/* Coach speaks — left 2/3 */}
        <div className="mr-auto md:w-2/3 md:pr-8">
          {/* Typewriter intro */}
          <div className="mb-10 rounded-lg bg-[#111111] p-6 md:bg-transparent md:p-0">
            <p className="text-lg leading-relaxed text-white/80 md:text-xl">
              <TypewriterText
                text="If you're evaluating a lineman right now, here's why Jacob should be on your board."
                trigger={typewriterTriggered}
                speed={30}
                className=""
              />
            </p>
          </div>

          {/* Progressive disclosure blocks */}
          <div data-gsap="fit-blocks" className="space-y-4">
            {blocks.map((block) => (
              <div
                key={block.label}
                data-gsap-wave="2"
                style={{ opacity: 0 }}
                className="rounded-lg border border-white/5 bg-[#111111] p-6 md:bg-black/50"
              >
                <span className="mb-2 block font-jetbrains text-xs font-bold uppercase tracking-[0.2em] text-[#ff000c]">
                  {block.label}
                </span>
                <p className="text-sm leading-relaxed text-white/70 md:text-base">
                  {block.body}
                </p>
              </div>
            ))}
          </div>

          {/* Live activity indicator */}
          <div className="mt-8 flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff000c] opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#ff000c]" />
            </span>
            <span className="text-xs text-white/40">
              12 programs have viewed this page this month
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
