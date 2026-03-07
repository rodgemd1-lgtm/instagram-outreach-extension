"use client";

import { useMemo, useState, useCallback, useEffect, useRef } from "react";
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
  youtubeIds?: string[];
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
  youtubeId = "wkYGNZTN8Xc",
  youtubeIds = ["wkYGNZTN8Xc", "03w9hRlXTzU"],
  clipThumbnails = [],
}: FilmReelProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSrc, setModalSrc] = useState("");
  const [activeVideoIdx, setActiveVideoIdx] = useState(0);
  const activeYoutubeId = youtubeIds[activeVideoIdx] || youtubeId;

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
            {/* Main reel player with film strip decoration */}
            <div className="flex-1">
              <div className="relative">
                {/* Film strip — left side */}
                <div className="absolute left-0 top-0 bottom-0 w-3 hidden md:flex flex-col items-center -translate-x-5">
                  <div className="w-px h-full bg-red-500/20 relative">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div
                        key={`l-${i}`}
                        className="absolute w-2 h-px bg-red-500/30"
                        style={{ top: `${(i + 1) * 5}%`, left: "-4px" }}
                      />
                    ))}
                  </div>
                </div>

                {/* Film strip — right side */}
                <div className="absolute right-0 top-0 bottom-0 w-3 hidden md:flex flex-col items-center translate-x-5">
                  <div className="w-px h-full bg-red-500/20 relative">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div
                        key={`r-${i}`}
                        className="absolute w-2 h-px bg-red-500/30"
                        style={{ top: `${(i + 1) * 5}%`, right: "-4px" }}
                      />
                    ))}
                  </div>
                </div>

                {/* Responsive video embed with padding-bottom technique */}
                <div className="relative w-full bg-black/50 rounded-xl overflow-hidden border border-white/[0.06]"
                  style={{ paddingBottom: "56.25%" }}
                >
                  {activeYoutubeId ? (
                    <iframe
                      key={activeYoutubeId}
                      src={`https://www.youtube.com/embed/${activeYoutubeId}?rel=0&modestbranding=1`}
                      title="Jacob Rodgers Highlights"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    />
                  ) : reelSrc ? (
                    <div className="absolute inset-0">
                      <RecruitVideoPlayer
                        src={reelSrc}
                        poster={reelPoster}
                        mode="reel"
                        onFullscreen={() => openFullscreen(reelSrc)}
                        className="w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
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
            </div>

            {/* Side panel — video selector */}
            {youtubeIds.length > 1 && (
              <div className="hidden md:flex md:flex-col md:gap-3 md:w-48 lg:w-56">
                {youtubeIds.map((vid, i) => (
                  <button
                    key={vid}
                    onClick={() => setActiveVideoIdx(i)}
                    className={`relative aspect-video rounded-lg overflow-hidden border transition-colors group ${
                      i === activeVideoIdx
                        ? "border-red-500/60 ring-1 ring-red-500/30"
                        : "border-white/[0.06] hover:border-red-500/30"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://img.youtube.com/vi/${vid}/mqdefault.jpg`}
                      alt={`Highlight ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className={`absolute inset-0 transition-colors ${
                      i === activeVideoIdx ? "bg-black/10" : "bg-black/40 group-hover:bg-black/20"
                    }`} />
                    {i !== activeVideoIdx && (
                      <Play className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-white/70 group-hover:text-white transition-colors" />
                    )}
                    <span className="absolute bottom-1 left-2 text-[9px] text-white/60 font-mono">
                      {i === 0 ? "Highlights" : `Reel ${i + 1}`}
                    </span>
                    {i === activeVideoIdx && (
                      <span className="absolute top-1 right-1 text-[8px] bg-red-500/80 text-white px-1.5 py-0.5 rounded font-mono">
                        Playing
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Mobile video selector */}
            {youtubeIds.length > 1 && (
              <div className="flex md:hidden gap-2 mt-4">
                {youtubeIds.map((vid, i) => (
                  <button
                    key={vid}
                    onClick={() => setActiveVideoIdx(i)}
                    className={`flex-1 relative aspect-video rounded-lg overflow-hidden border transition-colors ${
                      i === activeVideoIdx
                        ? "border-red-500/60"
                        : "border-white/[0.08]"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://img.youtube.com/vi/${vid}/mqdefault.jpg`}
                      alt={`Highlight ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className={`absolute inset-0 ${i === activeVideoIdx ? "bg-black/10" : "bg-black/50"}`} />
                    {i !== activeVideoIdx && (
                      <Play className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-white/70" />
                    )}
                    <span className="absolute bottom-0.5 left-1.5 text-[8px] text-white/60 font-mono">
                      {i === 0 ? "Highlights" : `Reel ${i + 1}`}
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
              href={activeYoutubeId ? `https://youtu.be/${activeYoutubeId}` : fullHighlightSrc || "#"}
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
  const [displayed, setDisplayed] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);
  const numValue = parseInt(value, 10);

  useEffect(() => {
    if (!ref.current || isNaN(numValue)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 800;
          const start = performance.now();
          const animate = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayed(Math.round(eased * numValue));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [numValue]);

  return (
    <div className="text-center" ref={ref}>
      <div className="text-2xl md:text-3xl font-mono font-black text-white">
        {isNaN(numValue) ? value : displayed}
        {suffix && <span className="text-sm text-white/40 ml-0.5">{suffix}</span>}
      </div>
      <div className="text-[9px] tracking-[0.2em] text-white/40 uppercase">
        {label}
      </div>
    </div>
  );
}
