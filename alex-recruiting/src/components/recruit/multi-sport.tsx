"use client";

import Image from "next/image";
import { useMemo } from "react";
import { RecruitVideoPlayer } from "@/components/recruit/video-player";
import {
  useRecruitAssembly,
  type AssemblyConfig,
} from "@/hooks/useRecruitAssembly";

const winterPhotos = [
  {
    src: "/recruit/winter/photos/snowboard-ride.jpg",
    alt: "Jacob Rodgers snowboarding downhill",
    label: "Ride",
  },
  {
    src: "/recruit/winter/photos/snowboard-carve.jpg",
    alt: "Jacob Rodgers carving on a snowboard",
    label: "Carve",
  },
  {
    src: "/recruit/winter/photos/snowboard-lineup.jpg",
    alt: "Jacob Rodgers at the top of the slope with his snowboard",
    label: "Lineup",
  },
];

const winterReels = [
  {
    title: "Snowboard run one",
    body: "Edge control, center of gravity, and comfort moving fast on unstable terrain.",
    src: "/recruit/winter/reels/snowboard-run-1.mp4",
    poster: "/recruit/winter/posters/snowboard-run-1.jpg",
  },
  {
    title: "Snowboard run two",
    body: "More balance under speed and a better visual for lower-body control through transition.",
    src: "/recruit/winter/reels/snowboard-run-2.mp4",
    poster: "/recruit/winter/posters/snowboard-run-2.jpg",
  },
];

const reviewPanels = [
  {
    label: "Marcus, coach lens",
    body: "Track results matter because they validate force production. Winter footage matters because it shows balance and body control for a 285-pound athlete.",
  },
  {
    label: "Jordan, film producer",
    body: "The winter assets now sit as support material, not filler. Coaches see football first, then the movement proof that makes the projection stronger.",
  },
  {
    label: "Prism + Lens, design studio",
    body: "The section is rebuilt as a story block with asymmetry, motion, and visual rhythm instead of static cards stacked in a grid.",
  },
];

export function MultiSportSection() {
  const config = useMemo<AssemblyConfig>(
    () => ({
      wave2: [
        {
          containerSelector: '[data-gsap="athlete-panel"]',
          from: { y: 44, opacity: 0 },
          to: {
            y: 0,
            opacity: 1,
            duration: 0.55,
            ease: "power2.out",
          },
          individual: true,
          scrollTrigger: {
            start: "top 86%",
            toggleActions: "play none none reverse",
          },
        },
        {
          containerSelector: '[data-gsap="athlete-side"]',
          from: { x: 38, opacity: 0 },
          to: {
            x: 0,
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
          },
          individual: true,
          scrollTrigger: {
            start: "top 84%",
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
      id="athlete"
      ref={scopeRef}
      className="relative overflow-hidden px-6 py-28 md:px-12 md:py-40"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(192,57,43,0.12),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(192,57,43,0.12),transparent_24%),linear-gradient(180deg,rgba(10,10,10,0.98),rgba(8,8,8,0.94))]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4A853]/20 to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div data-gsap="athlete-panel" style={{ opacity: 0 }} className="max-w-4xl">
          <span className="mb-6 block font-jetbrains text-xs uppercase tracking-[0.3em] text-[#D4A853]/80">
            Athletic Projection
          </span>
          <h2 className="font-playfair text-4xl font-black leading-[0.95] tracking-tight md:text-6xl lg:text-7xl">
            Recruit the trench player.
            <br />
            Believe the broader athlete.
          </h2>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[#F5F0E6]/58 md:text-xl">
            Football stays first. The supporting evidence is what makes the
            projection stronger: first-place throws in track and field, winter
            balance work on a snowboard, and year-round strength development
            that keeps feeding the line-play story.
          </p>
        </div>

        <div className="mt-12 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="grid gap-6">
            <div
              data-gsap="athlete-panel"
              style={{ opacity: 0 }}
              className="overflow-hidden rounded-[34px] border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm"
            >
              <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="p-6 md:p-8">
                  <p className="font-jetbrains text-xs uppercase tracking-[0.2em] text-[#D4A853]/90">
                    Track And Field
                  </p>
                  <h3 className="mt-4 text-3xl font-semibold tracking-tight text-white">
                    First place in discus and shot put.
                  </h3>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-[#F5F0E6]/60">
                    For an OL/DL prospect, track is not side content. Shot put
                    and discus validate rotational power, force transfer, and
                    lower-body pop. It gives coaches a second proof channel for
                    the same traits they want in the trenches.
                  </p>

                  <div className="mt-8 grid gap-3 sm:grid-cols-3">
                    <MetricCard value="1st" label="Discus" />
                    <MetricCard value="1st" label="Shot Put" />
                    <MetricCard value="Near Record" label="Trajectory" />
                  </div>
                </div>

                <div className="border-t border-white/[0.08] bg-black/28 p-6 md:border-t-0 md:border-l md:p-8">
                  <p className="font-jetbrains text-xs uppercase tracking-[0.2em] text-[#C0392B]/85">
                    Coach Translation
                  </p>
                  <div className="mt-5 space-y-4">
                    <TransferCard
                      label="Shot Put"
                      body="Short-area explosion, hip violence, and force through the finish."
                    />
                    <TransferCard
                      label="Discus"
                      body="Rotational torque, body control, and staying centered through motion."
                    />
                    <TransferCard
                      label="Trenches"
                      body="Those same qualities show up as knock-back, redirect power, and the ability to finish through contact."
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
              <div
                data-gsap="athlete-panel"
                style={{ opacity: 0 }}
                className="rounded-[34px] border border-white/[0.08] bg-black/28 p-6 backdrop-blur-sm md:p-8"
              >
                <p className="font-jetbrains text-xs uppercase tracking-[0.2em] text-[#D4A853]/90">
                  Winter Athlete
                </p>
                <h3 className="mt-4 text-2xl font-semibold tracking-tight text-white">
                  The uploaded winter assets are live now.
                </h3>
                <p className="mt-4 text-sm leading-7 text-[#F5F0E6]/58">
                  The actual files in the intake were snowboard media. They are
                  now part of the site as movement-proof support instead of
                  disappearing behind a single placeholder tile.
                </p>
                <div className="mt-6 grid gap-3">
                  {winterPhotos.map((photo) => (
                    <div
                      key={photo.src}
                      className="overflow-hidden rounded-[22px] border border-white/[0.08]"
                    >
                      <div className="relative h-40 w-full">
                        <Image
                          src={photo.src}
                          alt={photo.alt}
                          fill
                          sizes="(max-width: 1024px) 100vw, 33vw"
                          className="object-cover"
                        />
                      </div>
                      <div className="border-t border-white/[0.08] bg-black/40 px-4 py-3">
                        <p className="font-jetbrains text-xs uppercase tracking-[0.2em] text-[#F5F0E6]/55">
                          {photo.label}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-6">
                <div
                  data-gsap="athlete-side"
                  style={{ opacity: 0 }}
                  className="rounded-[34px] border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-sm md:p-6"
                >
                  <div className="grid gap-5 md:grid-cols-2">
                    {winterReels.map((reel) => (
                      <div
                        key={reel.src}
                        className="overflow-hidden rounded-[26px] border border-white/[0.08] bg-black/28"
                      >
                        <div className="relative aspect-[4/5] bg-black">
                          <RecruitVideoPlayer
                            src={reel.src}
                            poster={reel.poster}
                            mode="inline"
                            objectFit="contain"
                            className="h-full w-full rounded-none"
                          />
                        </div>
                        <div className="p-4">
                          <p className="text-sm font-semibold text-white">{reel.title}</p>
                          <p className="mt-2 text-sm leading-6 text-[#F5F0E6]/56">
                            {reel.body}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  data-gsap="athlete-side"
                  style={{ opacity: 0 }}
                  className="rounded-[34px] border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm md:p-8"
                >
                  <p className="font-jetbrains text-xs uppercase tracking-[0.2em] text-[#D4A853]/90">
                    Susan&apos;s Review Board
                  </p>
                  <div className="mt-5 grid gap-4 md:grid-cols-3">
                    {reviewPanels.map((panel) => (
                      <div
                        key={panel.label}
                        className="rounded-[24px] border border-white/[0.08] bg-black/24 p-4"
                      >
                        <p className="text-sm font-semibold text-white">{panel.label}</p>
                        <p className="mt-3 text-sm leading-6 text-[#F5F0E6]/58">
                          {panel.body}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            data-gsap="athlete-side"
            style={{ opacity: 0 }}
            className="rounded-[34px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.3))] p-6 backdrop-blur-sm md:p-8"
          >
            <p className="font-jetbrains text-xs uppercase tracking-[0.2em] text-[#C0392B]/85">
              Why Coaches Care
            </p>
            <h3 className="mt-4 text-3xl font-semibold tracking-tight text-white">
              The non-football evidence answers the projection question.
            </h3>
            <div className="mt-6 space-y-5">
              <NarrativeCard
                title="If you coach defensive line"
                body="You care about first-step power, lower-body control, and whether the athlete can keep his center through contact. Track and winter footage reinforce that upside."
              />
              <NarrativeCard
                title="If you coach offensive line"
                body="You care about balance, redirect strength, and movement skill in a large frame. The athlete story shows Jacob is not just big; he is coordinated and still developing."
              />
              <NarrativeCard
                title="If you recruit on projection"
                body="Football film gets him into the conversation. The broader athlete proof is what makes it easier to imagine what he becomes after two or three years in your room."
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MetricCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-[22px] border border-white/[0.08] bg-black/28 p-4">
      <p className="text-2xl font-black tracking-tight text-white">{value}</p>
      <p className="mt-2 font-jetbrains text-xs uppercase tracking-[0.2em] text-[#D4A853]/90">
        {label}
      </p>
    </div>
  );
}

function TransferCard({ label, body }: { label: string; body: string }) {
  return (
    <div className="rounded-[22px] border border-white/[0.08] bg-white/[0.03] p-4">
      <p className="font-jetbrains text-xs uppercase tracking-[0.2em] text-[#D4A853]/90">
        {label}
      </p>
      <p className="mt-3 text-sm leading-6 text-[#F5F0E6]/62">{body}</p>
    </div>
  );
}

function NarrativeCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[26px] border border-white/[0.08] bg-black/28 p-5">
      <p className="text-lg font-semibold text-white">{title}</p>
      <p className="mt-3 text-sm leading-7 text-[#F5F0E6]/58">{body}</p>
    </div>
  );
}
