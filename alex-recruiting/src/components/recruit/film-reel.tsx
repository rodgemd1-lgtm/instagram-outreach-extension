"use client";

import { useMemo, useState, useCallback } from "react";
import {
  useRecruitAssembly,
  type AssemblyConfig,
} from "@/hooks/useRecruitAssembly";
import { RecruitVideoPlayer } from "./video-player";
import { VideoModal } from "./video-modal";
import { Play } from "lucide-react";

/* ──────────────────────────────────────────────────────────────
   Film + Stats — Position #2 (merged section)
   LAAL Mechanism: Known-ness
   Film is the most important content on the page. Stats live
   directly beneath the video so the coach sees both together.

   Wave 1: none (below hero)
   Wave 2: scroll-triggered reveal of video, stats, and CTAs
   ────────────────────────────────────────────────────────────── */

interface FilmReelProps {
  reelSrc?: string;
  reelPoster?: string;
  fullHighlightSrc?: string;
  backgroundUrl?: string;
  youtubeId?: string;
  clipThumbnails?: Array<{
    title: string;
    thumbnail: string;
    src: string;
  }>;
}

export function FilmReel({
  reelSrc = "/recruit/micro-reel.mp4",
  reelPoster,
  fullHighlightSrc,
  backgroundUrl,
  youtubeId = "P0HdL4EMziE",
  clipThumbnails = [],
}: FilmReelProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSrc, setModalSrc] = useState("");

  const config = useMemo<AssemblyConfig>(
    () => ({
      wave2: [
        {
          containerSelector: '[data-gsap="film-reel-content"]',
          from: { y: 50, opacity: 0, scale: 0.98 },
          to: {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: "power2.out",
          },
          individual: false,
          stagger: 0.15,
          scrollTrigger: {
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
        },
      ],
    }),
    []
  );

  const scopeRef = useRecruitAssembly(config);

  const openFullscreen = useCallback(
    (src: string) => {
      setModalSrc(src);
      setModalOpen(true);
    },
    []
  );

  return (
    <>
      <section
        id="film-reel"
        ref={scopeRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden py-20 md:py-0"
      >
        {/* Background photo overlay */}
        {backgroundUrl && (
          <div className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={backgroundUrl}
              alt=""
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-[#0A0A0A]/92" />
          </div>
        )}

        {/* Dark background fallback */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-[#0D0D0D] to-[#0A0A0A]" style={{ opacity: backgroundUrl ? 0 : 1 }} />

        {/* Top divider */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />

        <div
          data-gsap="film-reel-content"
          className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 w-full"
        >
          {/* Section label + context */}
          <div
            data-gsap-wave="2"
            style={{ opacity: 0 }}
            className="mb-8 md:mb-12"
          >
            <span className="text-[10px] tracking-[0.5em] text-red-500/60 uppercase font-mono block mb-4">
              Film
            </span>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[0.95] mb-3">
              See him{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-400">
                play.
              </span>
            </h2>
            <p className="text-white/30 text-sm font-mono">
              Freshman Season &nbsp;|&nbsp; DT &amp; OG &nbsp;|&nbsp; Pewaukee HS &nbsp;|&nbsp; State Playoff Run
            </p>
          </div>

          {/* Main video + side clips layout */}
          <div
            data-gsap-wave="2"
            style={{ opacity: 0 }}
            className="md:flex md:gap-6"
          >
            {/* Main reel player */}
            <div className="flex-1">
              <div className="aspect-[9/16] md:aspect-video max-w-sm md:max-w-none mx-auto bg-black/50 rounded-xl overflow-hidden border border-white/[0.06]">
                {youtubeId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
                    title="Jacob Rodgers Highlights"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                ) : reelSrc ? (
                  <RecruitVideoPlayer
                    src={reelSrc}
                    poster={reelPoster}
                    mode="reel"
                    onFullscreen={() => openFullscreen(reelSrc)}
                    className="w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <Play className="w-16 h-16 text-white/20 mx-auto mb-4" />
                      <p className="text-white/30 text-sm">
                        Highlight reel coming soon
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Side panel — clip thumbnails (desktop only) */}
            {clipThumbnails.length > 0 && (
              <div className="hidden md:flex md:flex-col md:gap-3 md:w-48 lg:w-56">
                {clipThumbnails.slice(0, 4).map((clip, i) => (
                  <button
                    key={i}
                    onClick={() => openFullscreen(clip.src)}
                    className="relative aspect-video rounded-lg overflow-hidden border border-white/[0.06] hover:border-red-500/30 transition-colors group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={clip.thumbnail}
                      alt={clip.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                    <Play className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-white/70 group-hover:text-white transition-colors" />
                    <span className="absolute bottom-1 left-2 text-[9px] text-white/60 font-mono">
                      {clip.title}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Stat bar — immediately below film */}
          <div
            data-gsap-wave="2"
            style={{ opacity: 0 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-6 md:gap-10 py-6 border-t border-b border-white/5"
          >
            <StatPill value="11" label="Pancakes" />
            <StatPill value="3" label="Sacks" />
            <StatPill value="1" label="Fumble Rec" />
            <div className="w-px h-8 bg-white/10 hidden md:block" />
            <StatPill value="405" label="Deadlift" suffix="lb" />
            <StatPill value="265" label="Bench" suffix="lb" />
            <StatPill value="350" label="Squat" suffix="lb" />
          </div>

          {/* CTA — Watch Full Highlights */}
          <div
            data-gsap-wave="2"
            style={{ opacity: 0 }}
            className="mt-8 text-center md:text-left"
          >
            <a
              href={youtubeId ? `https://youtube.com/shorts/${youtubeId}` : fullHighlightSrc || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-all duration-300 group"
            >
              <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-sm tracking-widest uppercase">
                Watch Full Highlights
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* Fullscreen modal */}
      <VideoModal
        src={modalSrc}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}

function StatPill({ value, label, suffix }: { value: string; label: string; suffix?: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl md:text-3xl font-mono font-black text-white">
        {value}
        {suffix && <span className="text-sm text-white/30 ml-0.5">{suffix}</span>}
      </div>
      <div className="text-[9px] tracking-[0.2em] text-white/30 uppercase">
        {label}
      </div>
    </div>
  );
}
