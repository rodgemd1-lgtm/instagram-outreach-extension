"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { ArrowRight, ExternalLink } from "lucide-react";
import {
  useRecruitAssembly,
  type AssemblyConfig,
} from "@/hooks/useRecruitAssembly";
import {
  FEATURED_RECRUIT_CLIPS,
  FEATURED_RECRUIT_REEL,
  FULL_FILM_LINKS,
  SUPPORTING_RECRUIT_REELS,
} from "@/lib/recruit/featured-clips";
import { RecruitVideoPlayer } from "./video-player";
import { VideoModal } from "./video-modal";

interface FilmReelProps {
  backgroundUrl?: string;
}

const coachReasons = [
  {
    label: "Why a coach keeps watching",
    body: "The frame is big, the reps are easy to identify, and the film moves quickly into real contact moments.",
  },
  {
    label: "Moments of truth",
    body: "Get-off, contact point, leverage, finish, and whether #79 stays involved after the first collision.",
  },
  {
    label: "Narrative to leave with",
    body: "A 2029 lineman with defensive upside, offensive flexibility, and a broader athlete profile that supports projection.",
  },
];

export function FilmReel({ backgroundUrl }: FilmReelProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSrc, setModalSrc] = useState("");
  const [modalPoster, setModalPoster] = useState<string | undefined>(undefined);

  const config = useMemo<AssemblyConfig>(
    () => ({
      wave2: [
        {
          containerSelector: '[data-gsap="film-header"]',
          from: { y: 34, opacity: 0 },
          to: {
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
          },
          individual: false,
          stagger: 0,
          scrollTrigger: {
            start: "top 84%",
            toggleActions: "play none none reverse",
          },
        },
        {
          containerSelector: '[data-gsap="film-stage"]',
          from: { x: -48, opacity: 0 },
          to: {
            x: 0,
            opacity: 1,
            duration: 0.55,
            ease: "power2.out",
          },
          individual: true,
          scrollTrigger: {
            start: "top 82%",
            toggleActions: "play none none reverse",
          },
        },
        {
          containerSelector: '[data-gsap="film-grid"]',
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

  return (
    <>
      <section
        id="film-reel"
        ref={scopeRef}
        className="relative overflow-hidden px-6 py-24 md:px-12 md:py-32"
      >
        {backgroundUrl && (
          <div className="absolute inset-0">
            <img
              src={backgroundUrl}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(8,8,8,0.96),rgba(8,8,8,0.78)_48%,rgba(8,8,8,0.94)_100%)]" />
          </div>
        )}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
        <div className="absolute right-[8%] top-[10%] h-72 w-72 rounded-full bg-amber-400/8 blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <div data-gsap="film-header" style={{ opacity: 0 }} className="max-w-4xl">
            <span className="mb-6 block font-mono text-[10px] uppercase tracking-[0.5em] text-red-500/60">
              Film
            </span>
            <h2 className="text-4xl font-black tracking-tight leading-[0.95] md:text-6xl lg:text-7xl">
              Film should answer the
              <br />
              first question immediately.
            </h2>
            <p className="mt-6 max-w-3xl text-base leading-7 text-white/54 md:text-lg">
              Start with the coach-first highlight reel. Then move through six
              ranked clips that make it easy to evaluate #79 as an OL/DL
              development case.
            </p>
          </div>

          <div className="mt-12 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div
              data-gsap="film-stage"
              style={{ opacity: 0 }}
              className="overflow-hidden rounded-[34px] border border-white/[0.08] bg-black/40 p-4 shadow-[0_35px_80px_rgba(0,0,0,0.32)] backdrop-blur-sm md:p-5"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-amber-300/70">
                    Main Reel
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                    {FEATURED_RECRUIT_REEL.title}
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-white/52">
                    {FEATURED_RECRUIT_REEL.subtitle}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    openFullscreen(FEATURED_RECRUIT_REEL.src, FEATURED_RECRUIT_REEL.poster)
                  }
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/70 transition hover:border-white/20 hover:text-white"
                >
                  Fullscreen
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <div className="relative aspect-video overflow-hidden rounded-[28px] border border-white/[0.08]">
                <RecruitVideoPlayer
                  src={FEATURED_RECRUIT_REEL.src}
                  poster={FEATURED_RECRUIT_REEL.poster}
                  mode="reel"
                  onFullscreen={() =>
                    openFullscreen(FEATURED_RECRUIT_REEL.src, FEATURED_RECRUIT_REEL.poster)
                  }
                  className="h-full w-full rounded-none"
                />
              </div>
            </div>

            <div className="grid gap-6">
              <div
                data-gsap="film-stage"
                style={{ opacity: 0 }}
                className="rounded-[34px] border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-amber-300/70">
                  Coach Lens
                </p>
                <div className="mt-5 space-y-4">
                  {coachReasons.map((reason) => (
                    <div
                      key={reason.label}
                      className="rounded-[22px] border border-white/[0.08] bg-black/24 p-4"
                    >
                      <p className="text-sm font-semibold text-white">{reason.label}</p>
                      <p className="mt-2 text-sm leading-6 text-white/58">
                        {reason.body}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div
                data-gsap="film-stage"
                style={{ opacity: 0 }}
                className="rounded-[34px] border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-amber-300/70">
                  Extended Film
                </p>
                <div className="mt-5 space-y-3">
                  {FULL_FILM_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-start justify-between gap-4 rounded-[22px] border border-white/[0.08] bg-black/24 px-4 py-4 transition hover:border-red-500/25"
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">{link.label}</p>
                        <p className="mt-2 text-sm leading-6 text-white/52">
                          {link.description}
                        </p>
                      </div>
                      <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-white/38" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <div data-gsap="film-header" style={{ opacity: 0 }} className="max-w-3xl">
              <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-amber-300/70">
                Ranked Clips
              </p>
              <h3 className="mt-3 text-3xl font-semibold tracking-tight text-white">
                Six individual reps worth featuring.
              </h3>
            </div>

            <div className="mt-8 grid gap-5 xl:grid-cols-3">
              {FEATURED_RECRUIT_CLIPS.map((clip) => (
                <div
                  key={clip.rank}
                  data-gsap="film-grid"
                  style={{ opacity: 0 }}
                  className="overflow-hidden rounded-[28px] border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm"
                >
                  <div className="relative aspect-video">
                    <RecruitVideoPlayer
                      src={clip.src}
                      poster={clip.poster}
                      mode="inline"
                      onFullscreen={() => openFullscreen(clip.src, clip.poster)}
                      className="h-full w-full rounded-none"
                    />
                    <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-white/15 bg-black/55 px-3 py-1 font-mono text-[11px] tracking-[0.3em] text-white/80">
                      {clip.rank}
                    </div>
                  </div>
                  <div className="space-y-3 p-5">
                    <div>
                      <p className="text-lg font-semibold text-white">{clip.title}</p>
                      <p className="mt-1 text-sm text-white/48">{clip.subtitle}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {clip.moments.map((moment) => (
                        <span
                          key={moment}
                          className="rounded-full border border-white/[0.08] bg-black/24 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.24em] text-amber-300/75"
                        >
                          {moment}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.24em] text-red-500/65">
                      <span>{clip.durationLabel}</span>
                      <span>{clip.sourceName.replace(".MOV", "")}</span>
                    </div>
                    <p className="text-sm leading-6 text-white/56">
                      {clip.analysisNotes}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12">
            <div data-gsap="film-header" style={{ opacity: 0 }} className="max-w-3xl">
              <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-amber-300/70">
                Supporting Reels
              </p>
              <h3 className="mt-3 text-3xl font-semibold tracking-tight text-white">
                Use these to understand the full athlete.
              </h3>
            </div>

            <div className="mt-8 grid gap-5 xl:grid-cols-3">
              {SUPPORTING_RECRUIT_REELS.map((reel) => (
                <div
                  key={reel.id}
                  data-gsap="film-grid"
                  style={{ opacity: 0 }}
                  className="overflow-hidden rounded-[28px] border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm"
                >
                  <div className="relative aspect-video">
                    <RecruitVideoPlayer
                      src={reel.src}
                      poster={reel.poster}
                      mode="inline"
                      onFullscreen={() => openFullscreen(reel.src, reel.poster)}
                      className="h-full w-full rounded-none"
                    />
                  </div>
                  <div className="space-y-3 p-5">
                    <div>
                      <p className="text-lg font-semibold text-white">{reel.title}</p>
                      <p className="mt-1 text-sm text-white/48">{reel.subtitle}</p>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-red-500/65">
                        {reel.durationLabel}
                      </p>
                      <span className="rounded-full border border-white/[0.08] bg-black/24 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.24em] text-amber-300/75">
                        {reel.lens}
                      </span>
                    </div>
                    <p className="text-sm leading-6 text-white/56">
                      {reel.analysisNotes}
                    </p>
                  </div>
                </div>
              ))}
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
