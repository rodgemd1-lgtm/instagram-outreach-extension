"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  useRecruitAssembly,
  type AssemblyConfig,
} from "@/hooks/useRecruitAssembly";
import { CounterAnimation } from "./counter";

interface WingspanProps {
  photoUrl: string;
}

export function Wingspan({ photoUrl }: WingspanProps) {
  const [inView, setInView] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = observerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const config = useMemo<AssemblyConfig>(
    () => ({
      wave2: [
        {
          containerSelector: '[data-gsap="wingspan-content"]',
          from: { y: 40, opacity: 0 },
          to: {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: "power2.out",
          },
          individual: true,
          stagger: 0.15,
          scrollTrigger: {
            start: "top 80%",
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
      id="wingspan"
      ref={scopeRef as React.RefObject<HTMLElement>}
      className="relative overflow-hidden bg-black px-4 py-16 md:px-12 md:py-24"
    >
      <div ref={observerRef} className="absolute inset-0 pointer-events-none" />

      {/* ambient glow */}
      <div className="absolute left-[10%] top-[20%] h-80 w-80 rounded-full bg-[#ff000c]/[0.06] blur-[140px]" />

      <div
        data-gsap="wingspan-content"
        className="relative z-10 mx-auto max-w-6xl"
      >
        {/* label */}
        <div data-gsap-wave="2" className="mb-6 text-center">
          <p className="font-jetbrains text-xs uppercase tracking-[0.25em] text-[#ff000c]/80">
            Physical Measurable
          </p>
        </div>

        {/* photo with measurement overlay */}
        <div data-gsap-wave="2" className="relative">
          <div className="overflow-hidden rounded-2xl border border-white/[0.08] shadow-[0_35px_80px_rgba(0,0,0,0.4)]">
            <div className="relative aspect-[3/1] md:aspect-[3.5/1]">
              <Image
                src={photoUrl}
                alt="Jacob Rodgers — 80.5 inch wingspan"
                fill
                sizes="(max-width: 768px) 100vw, 1152px"
                className="object-cover object-top"
                priority={false}
              />
              {/* subtle vignette */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.5)_100%)]" />
            </div>
          </div>

          {/* dashed measurement line overlay */}
          <div className="absolute left-[8%] right-[8%] top-1/2 -translate-y-1/2 pointer-events-none">
            <div className="border-t-2 border-dashed border-[#ff000c]/60" />
            {/* left tick */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-px bg-[#ff000c]/60" />
            {/* right tick */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-px bg-[#ff000c]/60" />
          </div>
        </div>

        {/* counter + tagline */}
        <div data-gsap-wave="2" className="mt-8 text-center">
          <CounterAnimation
            target={80.5}
            suffix={'"'}
            trigger={inView}
            duration={2}
            decimals={1}
            className="text-5xl font-black tabular-nums text-white md:text-7xl"
          />
          <p className="mt-2 font-jetbrains text-xs uppercase tracking-[0.2em] text-[#ff000c]/80">
            Wingspan
          </p>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-white/60 md:text-lg">
            Elite length for a lineman his age — a measurable you can&apos;t coach.
          </p>
        </div>
      </div>
    </section>
  );
}
