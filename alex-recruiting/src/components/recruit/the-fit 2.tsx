"use client";

import Image from "next/image";
import { useLayoutEffect, useMemo, useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  useRecruitAssembly,
  type AssemblyConfig,
} from "@/hooks/useRecruitAssembly";
import { TypewriterText } from "./typewriter";

const blocks = [
  {
    label: "DEVELOPMENT RUNWAY",
    body: "6\u20194\u201d, 285 as a freshman. 445 deadlift, still accelerating. Three more years of structured development ahead \u2014 with the training infrastructure already in place.",
  },
  {
    label: "WHAT HE\u2019S LOOKING FOR",
    body: "A program with a strong D-line and O-line tradition where he can contribute on both sides of the ball. Development-focused coaching staff. Competitive culture.",
  },
  {
    label: "THE WINDOW",
    body: "Building his school list now. Sophomore film drops this fall. Early conversations welcome \u2014 the evaluation starts here.",
  },
];

const camps = [
  {
    name: "IMG Lineman Camp",
    timing: "Late March 2026",
    note: "Second year attending",
  },
  {
    name: "Big Man Camp \u2014 Chicago",
    timing: "Summer 2026",
    note: "",
  },
  {
    name: "IMG Skills Camp",
    timing: "Summer 2026",
    note: "Signing up shortly",
  },
];

const offField = [
  { label: "Photography", detail: "Sports photography and photo technology" },
  { label: "Snowboarding", detail: "Double black diamonds at Breckenridge in two years" },
  { label: "Technology", detail: "PC building and game development" },
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

  /* ── Pin section for progressive disclosure ── */
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
      className="relative bg-black px-6 py-20 md:px-12 md:py-48"
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
            <p className="font-jetbrains text-2xl leading-relaxed text-white/80 md:text-3xl">
              <TypewriterText
                text="Here's why Jacob should be on your board."
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
                className="rounded-lg border border-white/5 bg-[#111111] p-8 md:bg-black/50"
              >
                <span className="mb-2 block font-jetbrains text-sm font-bold uppercase tracking-[0.2em] text-[#ff000c]">
                  {block.label}
                </span>
                <p className="text-base leading-relaxed text-white/70 md:text-lg">
                  {block.body}
                </p>
              </div>
            ))}
          </div>

          {/* Upcoming camps */}
          <div className="mt-10">
            <span className="mb-4 block font-jetbrains text-sm uppercase tracking-[0.3em] text-[#ff000c]/70">
              Where to See Him
            </span>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {camps.map((camp) => (
                <div
                  key={camp.name}
                  className="rounded-lg border border-white/5 bg-[#111111] px-5 py-4"
                >
                  <p className="text-base font-semibold text-white/90">
                    {camp.name}
                  </p>
                  <p className="mt-1 font-jetbrains text-sm text-white/50">
                    {camp.timing}
                    {camp.note ? ` \u2014 ${camp.note}` : ""}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-base leading-relaxed text-white/50">
              Interested in having Jacob at your camp? Send camp information
              via{" "}
              <a
                href="https://recruit-match.ncsasports.org/clientrms/athlete_profiles/13603435"
                target="_blank"
                rel="noreferrer"
                className="text-[#ff000c]/70 underline underline-offset-2 transition-colors hover:text-[#ff000c]"
              >
                NCSA
              </a>{" "}
              or use the contact form below.
            </p>
          </div>

          {/* Off-field interests */}
          <div className="mt-10">
            <span className="mb-4 block font-jetbrains text-sm uppercase tracking-[0.3em] text-[#ff000c]/70">
              Beyond Football
            </span>
            <div className="flex flex-wrap gap-3">
              {offField.map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border border-white/5 bg-[#111111] px-5 py-4"
                >
                  <p className="text-base font-semibold text-white/90">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-white/50">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
