"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useRecruitAssembly,
  type AssemblyConfig,
} from "@/hooks/useRecruitAssembly";
import {
  FEATURED_RECRUIT_REEL,
  FULL_FILM_LINKS,
  SUPPORTING_RECRUIT_REELS,
} from "@/lib/recruit/featured-clips";
import { RecruitVideoPlayer } from "./video-player";
import { VideoModal } from "./video-modal";
import { CounterAnimation } from "./counter";
import { TypewriterText } from "./typewriter";

/* ─── stat data ─────────────────────────────────────────── */

const STATS = [
  { label: "Deadlift", target: 445, suffix: " lb" },
  { label: "Bench", target: 265, suffix: " lb" },
  { label: "Squat", target: 350, suffix: " lb" },
  { label: "Pancakes", target: 11, suffix: "" },
  { label: "Sacks", target: 3, suffix: "" },
] as const;

/* ─── component ─────────────────────────────────────────── */

interface FilmReelProps {
  backgroundUrl?: string;
}

export function FilmReel({ backgroundUrl }: FilmReelProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSrc, setModalSrc] = useState("");
  const [modalPoster, setModalPoster] = useState<string | undefined>(undefined);
  const [inView, setInView] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  /* ── IntersectionObserver — triggers counters + typewriter ── */
  useEffect(() => {
    const el = observerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* ── GSAP Wave 2 — slide from right ── */
  const config = useMemo<AssemblyConfig>(
    () => ({
      wave2: [
        {
          containerSelector: '[data-gsap="beat2-content"]',
          from: { x: 60, opacity: 0 },
          to: {
            x: 0,
            opacity: 1,
            duration: 0.55,
            ease: "power2.out",
          },
          individual: false,
          stagger: 0.12,
          scrollTrigger: {
            start: "top 82%",
            toggleActions: "play none none reverse",
          },
        },
        {
          containerSelector: '[data-gsap="beat2-grid"]',
          from: { y: 30, opacity: 0 },
          to: {
            y: 0,
            opacity: 1,
            duration: 0.45,
            ease: "power2.out",
          },
          individual: true,
          scrollTrigger: {
            start: "top 88%",
            toggleActions: "play none none reverse",
          },
        },
      ],
    }),
    []
  );

  const scopeRef = useRecruitAssembly(config);

  const openFullscreen = useCallback((src: string, poster?: string) => {
    setModalSrc(src);
    setModalPoster(poster);
    setModalOpen(true);
  }, []);

  const splashReels = SUPPORTING_RECRUIT_REELS.slice(0, 4);

  return (
    <>
      <section
        id="film-reel"
        ref={scopeRef}
        className="relative overflow-hidden px-6 py-24 md:px-12 md:py-32"
      >
        {/* ── observer sentinel for counter/typewriter trigger ── */}
        <div ref={observerRef} className="absolute inset-0 pointer-events-none" />

        {/* ── background ── */}
        {backgroundUrl && (
          <div className="absolute inset-0">
            <Image
              src={backgroundUrl}
              alt=""
              fill
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(8,8,8,0.96),rgba(8,8,8,0.78)_48%,rgba(8,8,8,0.94)_100%)]" />
          </div>
        )}

        {/* ── ambient glow ── */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ff000c]/20 to-transparent" />
        <div className="absolute right-[8%] top-[10%] h-72 w-72 rounded-full bg-[#ff000c]/[0.08] blur-[120px]" />

        {/* ── dialogue layout ── */}
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col md:flex-row md:items-start md:gap-0">
          {/* LEFT — typewriter margin (1/3) */}
          <div className="mb-10 md:mb-0 md:w-1/3 md:sticky md:top-32">
            <span className="mb-4 block font-jetbrains text-xs uppercase tracking-[0.3em] text-[#ff000c]/80">
              Beat 2
            </span>
            <h2 className="text-4xl font-black tracking-tight leading-[0.95] text-white md:text-5xl lg:text-6xl">
              <TypewriterText
                text="Can he play?"
                trigger={inView}
                speed={55}
                className="text-white"
              />
            </h2>
            <p className="mt-6 max-w-xs text-sm leading-6 text-white/50">
              Jacob answers with film, force production, and effort that shows up every rep.
            </p>
          </div>

          {/* RIGHT — main content (2/3) */}
          <div className="ml-auto md:w-2/3 md:pl-8">
            {/* ── main reel ── */}
            <div
              data-gsap="beat2-content"
              style={{ opacity: 0 }}
            >
              <div
                data-gsap-wave="2"
                className="overflow-hidden rounded-2xl border border-white/[0.08] bg-black/40 p-3 shadow-[0_35px_80px_rgba(0,0,0,0.32)] backdrop-blur-sm md:p-4"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-jetbrains text-xs uppercase tracking-[0.2em] text-[#ff000c]/90">
                      Main Highlight
                    </p>
                    <h3 className="mt-1 text-xl font-semibold tracking-tight text-white md:text-2xl">
                      {FEATURED_RECRUIT_REEL.title}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      openFullscreen(FEATURED_RECRUIT_REEL.src, FEATURED_RECRUIT_REEL.poster)
                    }
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/70 transition hover:border-[#ff000c]/30 hover:text-white"
                  >
                    Fullscreen
                  </button>
                </div>

                <div className="relative aspect-video overflow-hidden rounded-xl border border-white/[0.08] bg-black">
                  <RecruitVideoPlayer
                    src={FEATURED_RECRUIT_REEL.src}
                    poster={FEATURED_RECRUIT_REEL.poster}
                    mode="reel"
                    objectFit="contain"
                    onFullscreen={() =>
                      openFullscreen(FEATURED_RECRUIT_REEL.src, FEATURED_RECRUIT_REEL.poster)
                    }
                    className="h-full w-full rounded-none"
                  />
                </div>
              </div>

              {/* ── 2x2 splash grid ── */}
              <div
                data-gsap-wave="2"
                className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4"
              >
                {splashReels.map((reel) => (
                  <button
                    key={reel.id}
                    type="button"
                    onClick={() => openFullscreen(reel.src, reel.poster)}
                    className="group/splash relative aspect-video overflow-hidden rounded-xl border border-white/[0.08] bg-black focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff000c]/50"
                  >
                    {/* poster */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={reel.poster}
                      alt={reel.title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover/splash:scale-105"
                    />
                    {/* dark overlay */}
                    <div className="absolute inset-0 bg-black/50 transition-colors group-hover/splash:bg-black/35" />

                    {/* play button — CSS triangle, no lucide icons */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ff000c]/90 shadow-lg transition-transform group-hover/splash:scale-110">
                        <div
                          className="ml-0.5 h-0 w-0"
                          style={{
                            borderTop: "6px solid transparent",
                            borderBottom: "6px solid transparent",
                            borderLeft: "10px solid white",
                          }}
                        />
                      </div>
                    </div>

                    {/* title + duration */}
                    <div className="absolute bottom-0 left-0 right-0 px-2 py-2">
                      <p className="truncate text-left text-xs font-semibold text-white">
                        {reel.title}
                      </p>
                      <p className="text-left font-jetbrains text-[10px] uppercase tracking-wider text-white/60">
                        {reel.durationLabel}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* ── stat counters ── */}
            <div
              data-gsap="beat2-grid"
              style={{ opacity: 0 }}
              className="mt-8"
            >
              <div
                data-gsap-wave="2"
                className="grid grid-cols-3 gap-4 md:grid-cols-5"
              >
                {STATS.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex flex-col items-center rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-4 backdrop-blur-sm"
                  >
                    <CounterAnimation
                      target={stat.target}
                      suffix={stat.suffix}
                      trigger={inView}
                      duration={1.8}
                      className="text-2xl font-black tabular-nums text-white md:text-3xl"
                    />
                    <span className="mt-1 font-jetbrains text-[10px] uppercase tracking-[0.2em] text-[#ff000c]/80">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Hudl CTA + external film links ── */}
            <div
              data-gsap="beat2-grid"
              style={{ opacity: 0 }}
              className="mt-8"
            >
              <div
                data-gsap-wave="2"
                className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-sm"
              >
                <p className="font-jetbrains text-xs uppercase tracking-[0.2em] text-[#ff000c]/90">
                  Full Film
                </p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {FULL_FILM_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-start justify-between gap-4 rounded-xl border border-white/[0.08] bg-black/24 px-4 py-4 transition hover:border-[#ff000c]/25"
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">{link.label}</p>
                        <p className="mt-2 text-sm leading-6 text-white/50">
                          {link.description}
                        </p>
                      </div>
                      {/* arrow icon — no lucide */}
                      <span className="mt-1 shrink-0 text-white/40 text-sm">&#8599;</span>
                    </Link>
                  ))}
                </div>

                <Link
                  href="https://www.hudl.com/profile/21702986/Jacob-Rodgers"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#ff000c]/30 bg-[#ff000c]/10 px-5 py-2.5 text-sm font-semibold text-[#ff000c] transition hover:bg-[#ff000c]/20"
                >
                  View full Hudl profile
                  <span className="text-xs">&#8599;</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <VideoModal
        src={modalSrc}
        poster={modalPoster}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
