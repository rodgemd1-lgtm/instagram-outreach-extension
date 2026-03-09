"use client";

import { useCallback, useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";
import {
  useRecruitAssembly,
  type AssemblyConfig,
} from "@/hooks/useRecruitAssembly";
import { RecruitVideoPlayer } from "./video-player";
import { VideoModal } from "./video-modal";
import {
  FEATURED_RECRUIT_CLIPS,
  FEATURED_RECRUIT_REEL,
  FULL_FILM_LINKS,
} from "@/lib/recruit/featured-clips";

interface FilmReelProps {
  reelSrc?: string;
  reelPoster?: string;
  backgroundUrl?: string;
}

export function FilmReel({
  reelSrc = FEATURED_RECRUIT_REEL.src,
  reelPoster = FEATURED_RECRUIT_REEL.poster,
  backgroundUrl,
}: FilmReelProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSrc, setModalSrc] = useState("");
  const [modalPoster, setModalPoster] = useState<string | undefined>(undefined);

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
        className="relative min-h-screen overflow-hidden py-20 md:py-24"
      >
        {backgroundUrl && (
          <div className="absolute inset-0">
            <img
              src={backgroundUrl}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-[#0A0A0A]/92" />
          </div>
        )}

        <div
          className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-[#0D0D0D] to-[#0A0A0A]"
          style={{ opacity: backgroundUrl ? 0 : 1 }}
        />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />

        <div
          data-gsap="film-reel-content"
          className="relative z-10 mx-auto w-full max-w-6xl px-6 md:px-12"
        >
          <div data-gsap-wave="2" style={{ opacity: 0 }} className="mb-8 md:mb-12">
            <span className="mb-4 block font-mono text-[10px] uppercase tracking-[0.5em] text-red-500/60">
              Film
            </span>
            <h2 className="text-3xl font-black tracking-tight leading-[0.95] md:text-5xl lg:text-6xl">
              Start with the{" "}
              <span className="bg-gradient-to-r from-red-500 to-rose-400 bg-clip-text text-transparent">
                impact reps.
              </span>
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/45 md:text-base">
              Jennifer&apos;s strongest message clips are now live on the page. The
              main player opens with a tighter coach-first reel, then the ranked
              clips below let coaches review the clearest reps one by one.
            </p>
          </div>

          <div
            data-gsap-wave="2"
            style={{ opacity: 0 }}
            className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]"
          >
            <div className="flex-1">
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 hidden w-3 -translate-x-5 md:flex md:flex-col md:items-center">
                  <div className="relative h-full w-px bg-red-500/20">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div
                        key={`l-${i}`}
                        className="absolute left-[-4px] h-px w-2 bg-red-500/30"
                        style={{ top: `${(i + 1) * 5}%` }}
                      />
                    ))}
                  </div>
                </div>

                <div className="absolute right-0 top-0 bottom-0 hidden w-3 translate-x-5 md:flex md:flex-col md:items-center">
                  <div className="relative h-full w-px bg-red-500/20">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div
                        key={`r-${i}`}
                        className="absolute right-[-4px] h-px w-2 bg-red-500/30"
                        style={{ top: `${(i + 1) * 5}%` }}
                      />
                    ))}
                  </div>
                </div>

                <div
                  className="relative w-full overflow-hidden rounded-xl border border-white/[0.06] bg-black/50"
                  style={{ paddingBottom: "56.25%" }}
                >
                  <div className="absolute inset-0">
                    <RecruitVideoPlayer
                      src={reelSrc}
                      poster={reelPoster}
                      mode="reel"
                      onFullscreen={() => openFullscreen(reelSrc, reelPoster)}
                      className="h-full w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-red-500/60">
                What changed
              </span>
              <div className="mt-5 space-y-4">
                <ImpactNote
                  title="No more weak lead video"
                  body="The first player is now a tighter impact reel built from the strongest message clips instead of opening on the old NCSA-led flow."
                />
                <ImpactNote
                  title="Ranked rep stack"
                  body="The four clips below were ranked for frame clarity, trench visibility, and coach usability."
                />
                <ImpactNote
                  title="Longer film still available"
                  body="Full reels stay linked for coaches who want broader season context after the first pass."
                />
              </div>

              <div className="mt-8 space-y-3">
                {FULL_FILM_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-start justify-between gap-4 rounded-2xl border border-white/[0.08] bg-black/30 px-4 py-4 transition-colors hover:border-red-500/25"
                  >
                    <div>
                      <p className="font-semibold text-white">{link.label}</p>
                      <p className="mt-1 text-sm leading-6 text-white/45">
                        {link.description}
                      </p>
                    </div>
                    <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-white/40" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div
            data-gsap-wave="2"
            style={{ opacity: 0 }}
            className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4"
          >
            {FEATURED_RECRUIT_CLIPS.map((clip) => (
              <div
                key={clip.rank}
                className="overflow-hidden rounded-[26px] border border-white/[0.08] bg-black/40 backdrop-blur-sm"
              >
                <div className="relative aspect-video">
                  <RecruitVideoPlayer
                    src={clip.src}
                    poster={clip.poster}
                    mode="inline"
                    onFullscreen={() => openFullscreen(clip.src, clip.poster)}
                    className="h-full w-full rounded-none"
                  />
                  <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-white/15 bg-black/55 px-3 py-1 font-mono text-[11px] tracking-[0.3em] text-white/75">
                    {clip.rank}
                  </div>
                </div>
                <div className="space-y-3 p-5">
                  <div>
                    <p className="text-lg font-semibold text-white">{clip.title}</p>
                    <p className="mt-1 text-sm text-white/45">{clip.subtitle}</p>
                  </div>
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.26em] text-red-500/60">
                    <span>{clip.durationLabel}</span>
                    <span>{clip.sourceName.replace(".MOV", "")}</span>
                  </div>
                  <p className="text-sm leading-6 text-white/58">
                    {clip.analysisNotes}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <VideoModal
        open={modalOpen}
        src={modalSrc}
        poster={modalPoster}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}

function ImpactNote({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-white/50">{body}</p>
    </div>
  );
}
