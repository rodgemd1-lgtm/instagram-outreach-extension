"use client";

import { useMemo } from "react";
import { RecruitVideoPlayer } from "@/components/recruit/video-player";
import {
  useRecruitAssembly,
  type AssemblyConfig,
} from "@/hooks/useRecruitAssembly";

export function MultiSportSection() {
  const config = useMemo<AssemblyConfig>(
    () => ({
      wave2: [
        {
          containerSelector: '[data-gsap="athlete-story"]',
          from: { y: 40, opacity: 0 },
          to: {
            y: 0,
            opacity: 1,
            duration: 0.55,
            ease: "power2.out",
          },
          individual: true,
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

  return (
    <section
      id="athlete"
      ref={scopeRef}
      className="relative overflow-hidden px-6 py-28 md:px-12 md:py-40"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.12),transparent_30%),linear-gradient(180deg,rgba(10,10,10,0.98),rgba(8,8,8,0.94))]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div data-gsap="athlete-story" style={{ opacity: 0 }} className="max-w-3xl">
          <span className="mb-6 block font-mono text-[10px] uppercase tracking-[0.5em] text-red-500/60">
            Well-Rounded Athlete
          </span>
          <h2 className="text-4xl font-black leading-[0.95] tracking-tight md:text-6xl lg:text-7xl">
            The projection is not
            <br />
            just football.
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/54 md:text-lg">
            Football is the priority, but the overall athlete matters. Track and
            field, snowboarding, and year-round strength work all support the
            body control, power, and competitive edge that show up in the
            trenches.
          </p>
        </div>

        <div className="mt-12 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div
            data-gsap="athlete-story"
            style={{ opacity: 0 }}
            className="rounded-[30px] border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm"
          >
            <div className="overflow-hidden rounded-[24px] border border-white/[0.08] bg-black/25">
              <div className="grid gap-0 md:grid-cols-[1.05fr_0.95fr]">
                <div className="flex min-h-[18rem] flex-col justify-between p-6">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-amber-300/70">
                      Track And Field
                    </p>
                    <h3 className="mt-4 text-3xl font-semibold tracking-tight text-white">
                      First place in discus and shot put.
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-white/58">
                      The track story matters because it gives coaches another
                      real proof point for power transfer, rotation, and body
                      control outside football reps.
                    </p>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <TrackMetric value="1st" label="Discus" />
                    <TrackMetric value="1st" label="Shot Put" />
                    <TrackMetric value="Near Record" label="Trajectory" />
                  </div>
                </div>

                <div className="border-t border-white/[0.08] md:border-t-0 md:border-l">
                  <div className="flex h-full min-h-[18rem] flex-col justify-between bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(0,0,0,0.18))] p-6">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-red-500/70">
                        Transfer Lens
                      </p>
                      <p className="mt-4 text-sm leading-7 text-white/60">
                        Shot put shows short-area explosion. Discus shows
                        rotational torque and balance. Both map cleanly to power
                        generation in the trenches.
                      </p>
                    </div>

                    <div className="grid gap-3">
                      <TransferCard
                        label="Discus"
                        body="Rotational force, finish mechanics, and hip snap."
                      />
                      <TransferCard
                        label="Shot Put"
                        body="Short-area explosion and force transfer through contact."
                      />
                      <TransferCard
                        label="Football"
                        body="The same power shows up as knock-back, reset strength, and finish."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div
              data-gsap="athlete-story"
              style={{ opacity: 0 }}
              className="rounded-[30px] border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-sm"
            >
              <div className="overflow-hidden rounded-[24px] border border-white/[0.08]">
                <img
                  src="/recruit/photos/snowboard-edge.jpg"
                  alt="Jacob Rodgers snowboarding"
                  className="h-[18rem] w-full object-cover"
                />
              </div>
              <div className="mt-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-amber-300/70">
                  Snowboarding
                </p>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight text-white">
                  Balance under speed.
                </h3>
                <p className="mt-3 text-sm leading-7 text-white/58">
                  Snowboarding adds body control, confidence on unstable edges,
                  and balance under changing terrain. That matters for a big
                  athlete whose game depends on staying centered through contact.
                </p>
              </div>

              <div className="mt-5 overflow-hidden rounded-[24px] border border-white/[0.08]">
                <div className="relative aspect-video">
                  <RecruitVideoPlayer
                    src="/recruit/supporting-reels/snowboard-cut.mp4"
                    poster="/recruit/supporting-reels/snowboard-cut.jpg"
                    mode="inline"
                    className="h-full w-full rounded-none"
                  />
                </div>
              </div>
            </div>

            <div
              data-gsap="athlete-story"
              style={{ opacity: 0 }}
              className="rounded-[30px] border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-sm"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-amber-300/70">
                Training Translation
              </p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-white">
                Strength work that supports the trench story.
              </h3>
              <p className="mt-3 text-sm leading-7 text-white/58">
                The training footage is not filler. It shows force production,
                intent, and why the frame is still moving upward.
              </p>

              <div className="mt-5 overflow-hidden rounded-[24px] border border-white/[0.08]">
                <div className="relative aspect-video">
                  <RecruitVideoPlayer
                    src="/recruit/supporting-reels/training-cut.mp4"
                    poster="/recruit/supporting-reels/training-cut.jpg"
                    mode="inline"
                    className="h-full w-full rounded-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TransferCard({ label, body }: { label: string; body: string }) {
  return (
    <div className="rounded-[22px] border border-white/[0.08] bg-black/28 p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-red-500/70">
        {label}
      </p>
      <p className="mt-3 text-sm leading-6 text-white/64">{body}</p>
    </div>
  );
}

function TrackMetric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-[22px] border border-white/[0.08] bg-black/28 p-4">
      <p className="text-2xl font-black tracking-tight text-white">{value}</p>
      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.3em] text-red-500/70">
        {label}
      </p>
    </div>
  );
}
