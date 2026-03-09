"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { ArrowRight, ExternalLink } from "lucide-react";
import {
  useRecruitAssembly,
  type AssemblyConfig,
} from "@/hooks/useRecruitAssembly";
import {
  CURRENT_FEATURED_CLIPS,
  FEATURED_RECRUIT_REEL,
  FULL_FILM_LINKS,
  LEGACY_FEATURED_CLIPS,
  SUPPORTING_RECRUIT_REELS,
  type FeaturedRecruitClip,
} from "@/lib/recruit/featured-clips";
import { RecruitVideoPlayer } from "./video-player";
import { VideoModal } from "./video-modal";

interface FilmReelProps {
  backgroundUrl?: string;
}

const coachReasons = [
  {
    label: "Why keep the CapCut reel first",
    body: "It is Jacob's own 30-second cut, it stays football-only, and it gets to his best visual moments faster than the longer reels.",
  },
  {
    label: "Why the older clips came back",
    body: "Some of the earlier site clips are cleaner from a coach-readability standpoint, so they now sit beside the newer trench clips instead of disappearing.",
  },
  {
    label: "How to use this page",
    body: "Watch the CapCut reel, compare the legacy and current clip stacks, then open whichever longer reel best fits your evaluation style.",
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
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4A853]/20 to-transparent" />
        <div className="absolute right-[8%] top-[10%] h-72 w-72 rounded-full bg-[#D4A853]/8 blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <div data-gsap="film-header" style={{ opacity: 0 }} className="max-w-4xl">
            <span className="mb-6 block font-jetbrains text-[10px] uppercase tracking-[0.5em] text-[#D4A853]/60">
              Film
            </span>
            <h2 className="text-4xl font-black tracking-tight leading-[0.95] md:text-6xl lg:text-7xl">
              Lead with the reel
              <br />
              he already believes in.
            </h2>
            <p className="mt-6 max-w-3xl text-base leading-7 text-[#F5F0E6]/54 md:text-lg">
              The main player now uses Jacob&apos;s 30-second CapCut highlight.
              The older clips are back, the newer trench clips stay live, and
              the coach-first reel is still here as a second pass.
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
                  <p className="font-jetbrains text-[10px] uppercase tracking-[0.32em] text-[#D4A853]/70">
                    Main Highlight
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                    {FEATURED_RECRUIT_REEL.title}
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[#F5F0E6]/52">
                    {FEATURED_RECRUIT_REEL.subtitle}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    openFullscreen(FEATURED_RECRUIT_REEL.src, FEATURED_RECRUIT_REEL.poster)
                  }
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/70 transition hover:border-[#D4A853]/30 hover:text-[#F5F0E6]"
                >
                  Fullscreen
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] border border-white/[0.08] bg-black md:aspect-[3/4] xl:aspect-video">
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

            <div className="grid gap-6">
              <div
                data-gsap="film-stage"
                style={{ opacity: 0 }}
                className="rounded-[34px] border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm"
              >
                <p className="font-jetbrains text-[10px] uppercase tracking-[0.32em] text-[#D4A853]/70">
                  Coach Lens
                </p>
                <div className="mt-5 space-y-4">
                  {coachReasons.map((reason) => (
                    <div
                      key={reason.label}
                      className="rounded-[22px] border border-white/[0.08] bg-black/24 p-4"
                    >
                      <p className="text-sm font-semibold text-white">{reason.label}</p>
                      <p className="mt-2 text-sm leading-6 text-[#F5F0E6]/58">
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
                <p className="font-jetbrains text-[10px] uppercase tracking-[0.32em] text-[#D4A853]/70">
                  External Film
                </p>
                <div className="mt-5 space-y-3">
                  {FULL_FILM_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-start justify-between gap-4 rounded-[22px] border border-white/[0.08] bg-black/24 px-4 py-4 transition hover:border-[#D4A853]/25"
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">{link.label}</p>
                        <p className="mt-2 text-sm leading-6 text-[#F5F0E6]/52">
                          {link.description}
                        </p>
                      </div>
                      <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-[#F5F0E6]/38" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <div data-gsap="film-header" style={{ opacity: 0 }} className="max-w-3xl">
              <p className="font-jetbrains text-[10px] uppercase tracking-[0.32em] text-[#D4A853]/70">
                More Reels
              </p>
              <h3 className="mt-3 text-3xl font-semibold tracking-tight text-white">
                Compare the legacy stack, the coach-first reel, and the athlete-context cuts.
              </h3>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
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
                      <p className="mt-1 text-sm text-[#F5F0E6]/48">{reel.subtitle}</p>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-jetbrains text-[11px] uppercase tracking-[0.24em] text-[#C0392B]/65">
                        {reel.durationLabel}
                      </p>
                      <span className="rounded-full border border-white/[0.08] bg-black/24 px-3 py-1 font-jetbrains text-[10px] uppercase tracking-[0.24em] text-[#D4A853]/75">
                        {reel.lens}
                      </span>
                    </div>
                    <p className="text-sm leading-6 text-[#F5F0E6]/56">
                      {reel.analysisNotes}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <ClipLibrary
            title="Restored legacy clips"
            subtitle="The older site favorites are back on page."
            clips={LEGACY_FEATURED_CLIPS}
          />

          <ClipLibrary
            title="Fresh trench clips"
            subtitle="The newer football batch stays live too."
            clips={CURRENT_FEATURED_CLIPS}
          />
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

function ClipLibrary({
  title,
  subtitle,
  clips,
}: {
  title: string;
  subtitle: string;
  clips: FeaturedRecruitClip[];
}) {
  return (
    <div className="mt-12">
      <div data-gsap="film-header" style={{ opacity: 0 }} className="max-w-3xl">
        <p className="font-jetbrains text-[10px] uppercase tracking-[0.32em] text-[#D4A853]/70">
          Featured Clips
        </p>
        <h3 className="mt-3 text-3xl font-semibold tracking-tight text-white">
          {title}
        </h3>
        <p className="mt-3 text-sm leading-6 text-[#F5F0E6]/54 md:text-base">
          {subtitle}
        </p>
      </div>

      <div className="mt-8 grid gap-5 xl:grid-cols-3">
        {clips.map((clip) => (
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
                className="h-full w-full rounded-none"
              />
              <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-white/15 bg-black/55 px-3 py-1 font-jetbrains text-[11px] tracking-[0.3em] text-[#F5F0E6]/80">
                {clip.rank}
              </div>
            </div>
            <div className="space-y-3 p-5">
              <div>
                <p className="text-lg font-semibold text-white">{clip.title}</p>
                <p className="mt-1 text-sm text-[#F5F0E6]/48">{clip.subtitle}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {clip.moments.map((moment) => (
                  <span
                    key={moment}
                    className="rounded-full border border-white/[0.08] bg-black/24 px-3 py-1 font-jetbrains text-[10px] uppercase tracking-[0.24em] text-[#D4A853]/75"
                  >
                    {moment}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.24em] text-[#C0392B]/65">
                <span>{clip.durationLabel}</span>
                <span>{clip.sourceName.replace(".MOV", "")}</span>
              </div>
              <p className="text-sm leading-6 text-[#F5F0E6]/56">{clip.analysisNotes}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
