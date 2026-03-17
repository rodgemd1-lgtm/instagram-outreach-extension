"use client";

import { useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { SCPageHeader } from "@/components/sc/sc-page-header";
import { SCGlassCard } from "@/components/sc/sc-glass-card";
import { SCStatCard } from "@/components/sc/sc-stat-card";
import { SCBadge } from "@/components/sc/sc-badge";
import { SCButton } from "@/components/sc/sc-button";
import { useRecruitPhotos } from "@/hooks/useRecruitPhotos";
import { useAnalytics } from "@/hooks/use-analytics";
import {
  FEATURED_RECRUIT_REEL,
  SUPPORTING_RECRUIT_REELS,
} from "@/lib/recruit/featured-clips";

/* ---- Static data (real athlete stats, not fake) ---- */
const STATS = [
  { label: "Deadlift", value: "445 lb", icon: "fitness_center" },
  { label: "Bench", value: "265 lb", icon: "fitness_center" },
  { label: "Squat", value: "350 lb", icon: "fitness_center" },
  { label: "Pancakes", value: "11", icon: "sports_football" },
  { label: "Sacks", value: "3", icon: "shield" },
] as const;

const ACADEMICS = [
  { label: "Credits Required", value: "28", context: "WI state min: 15.5" },
  { label: "AP Courses", value: "24", context: "52% of students take AP" },
  { label: "Graduation Rate", value: "97%", context: "State avg: 90%" },
  { label: "College Readiness", value: "10/10", context: "GreatSchools rating" },
];

export default function RecruitPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const { photoMap } = useRecruitPhotos();
  useAnalytics();

  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactError, setContactError] = useState("");
  const [videoModal, setVideoModal] = useState<{ src: string; poster?: string } | null>(null);

  const handleContactSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setContactSubmitting(true);
    setContactError("");

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    if (!formData.get("name") || !formData.get("title") || !formData.get("school") || !formData.get("email")) {
      setContactError("Name, title, school, and email are required.");
      setContactSubmitting(false);
      return;
    }

    const emailValue = formData.get("email") as string;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      setContactError("Please enter a valid email address.");
      setContactSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/recruit/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          title: formData.get("title"),
          school: formData.get("school"),
          email: formData.get("email"),
          message: formData.get("message"),
        }),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(payload?.error ?? "Something went wrong.");
      setContactSubmitted(true);
    } catch (err) {
      setContactError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setContactSubmitting(false);
    }
  };

  return (
    <div ref={pageRef} className="min-h-screen space-y-0">
      {/* ============================================================ */}
      {/* HERO SECTION                                                  */}
      {/* ============================================================ */}
      <section id="hero" className="relative flex min-h-[100svh] items-center overflow-hidden">
        {photoMap.hero && (
          <div className="absolute inset-0">
            <img src={photoMap.hero} alt="" className="h-full w-full object-cover opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-r from-sc-bg via-sc-bg/90 to-sc-bg/60" />
          </div>
        )}

        {/* Ghosted jersey number */}
        <div
          className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 select-none font-black italic text-white/[0.04]"
          style={{ fontSize: "clamp(8rem, 30vw, 40rem)", lineHeight: 0.85 }}
        >
          79
        </div>

        <div className="relative z-10 ml-auto w-full px-6 md:w-2/3 md:px-12 py-20">
          <SCBadge variant="primary" className="mb-4">Class of 2029</SCBadge>

          <h1
            className="font-black italic uppercase leading-none tracking-tighter text-white mb-8"
            style={{ fontSize: "clamp(3.5rem, 9vw, 7.5rem)" }}
          >
            Jacob<br />Rodgers
          </h1>

          <p className="text-lg text-white/80 md:text-xl">
            <span className="text-white font-bold">#79</span>
            <span className="mx-2 text-sc-primary">&middot;</span>
            DT / OG
            <span className="mx-2 text-sc-primary">&middot;</span>
            6&apos;4&quot;
            <span className="mx-2 text-sc-primary">&middot;</span>
            285
          </p>
          <p className="mt-2 text-base text-white/60">
            Pewaukee HS
            <span className="mx-2 text-sc-primary">&middot;</span>
            Wisconsin
          </p>
          <p className="mt-1 text-base text-white/60">
            Varsity Starter
            <span className="mx-2 text-sc-primary">&middot;</span>
            Two-Way Lineman
          </p>

          <div className="mt-8">
            <button
              onClick={() => document.getElementById("film-reel")?.scrollIntoView({ behavior: "smooth" })}
              className="group flex items-center gap-2 text-sm uppercase tracking-widest text-white/50 transition-colors hover:text-white"
            >
              <span className="inline-block h-5 w-px bg-sc-primary transition-all group-hover:h-8" />
              Watch the film
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* FILM + STATS                                                  */}
      {/* ============================================================ */}
      <section id="film-reel" className="relative overflow-hidden px-4 py-16 md:px-12 md:py-32">
        {photoMap["film-reel"] && (
          <div className="absolute inset-0">
            <Image src={photoMap["film-reel"]} alt="" fill sizes="100vw" className="object-cover opacity-10" />
            <div className="absolute inset-0 bg-sc-bg/95" />
          </div>
        )}

        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sc-primary/20 to-transparent" />

        <div className="relative z-10 mx-auto max-w-7xl flex flex-col md:flex-row md:gap-8">
          {/* Left heading */}
          <div className="mb-6 md:mb-0 md:w-1/3 md:sticky md:top-32">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white md:text-5xl lg:text-6xl">
              Can he play?
            </h2>
            <p className="mt-4 max-w-xs text-lg leading-7 text-white/70 md:mt-6 md:text-xl">
              Film, force production, and effort -- every rep, every snap, every game.
            </p>
          </div>

          {/* Right content */}
          <div className="ml-auto min-w-0 w-full md:w-2/3">
            {/* Featured reel */}
            <SCGlassCard variant="strong" className="p-3 md:p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-sc-primary/90">Broadcast Replay</span>
                    <SCBadge variant="primary">Featured</SCBadge>
                    <SCBadge variant="success">Ultra 4K</SCBadge>
                  </div>
                  <h3 className="mt-1 text-xl font-black italic tracking-tight text-white md:text-2xl">
                    {FEATURED_RECRUIT_REEL.title}
                  </h3>
                </div>
                <SCButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setVideoModal({ src: FEATURED_RECRUIT_REEL.src, poster: FEATURED_RECRUIT_REEL.poster })}
                >
                  <span className="material-symbols-outlined text-[16px]">fullscreen</span>
                  Fullscreen
                </SCButton>
              </div>
              <div className="relative aspect-video overflow-hidden rounded-xl border border-sc-border bg-black">
                <video
                  src={FEATURED_RECRUIT_REEL.src}
                  poster={FEATURED_RECRUIT_REEL.poster}
                  controls
                  muted
                  playsInline
                  className="h-full w-full object-contain"
                />
              </div>
            </SCGlassCard>

            {/* Film library bar */}
            <div className="mt-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-sc-primary/90 mb-3">Full Film Library</p>
              <div className="flex gap-3 overflow-x-auto pb-3">
                {SUPPORTING_RECRUIT_REELS.map((reel) => (
                  <button
                    key={reel.id}
                    type="button"
                    onClick={() => setVideoModal({ src: reel.src, poster: reel.poster })}
                    className="group relative aspect-video w-40 shrink-0 overflow-hidden rounded-xl border border-sc-border bg-black md:w-56"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={reel.poster} alt={reel.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/50 group-hover:bg-black/35 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sc-primary/90 shadow-lg">
                        <span className="material-symbols-outlined text-white text-[20px]">play_arrow</span>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 px-2 py-2">
                      <p className="truncate text-left text-xs font-semibold text-white">{reel.title}</p>
                      <p className="text-left text-[10px] uppercase tracking-wider text-white/60">{reel.durationLabel}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Stat counters */}
            <div className="grid grid-cols-3 gap-2 md:grid-cols-5 md:gap-4 mt-8">
              {STATS.map((stat) => (
                <SCStatCard
                  key={stat.label}
                  label={stat.label}
                  value={stat.value}
                  icon={stat.icon}
                />
              ))}
            </div>

            {/* External profile CTAs */}
            <div className="flex flex-wrap gap-3 mt-8">
              <Link
                href="https://recruit-match.ncsasports.org/clientrms/athlete_profiles/13603435"
                target="_blank"
                rel="noreferrer"
              >
                <SCButton variant="secondary">
                  View NCSA profile
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                </SCButton>
              </Link>
              <Link href="#contact">
                <SCButton>Reach Out</SCButton>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* WINGSPAN                                                      */}
      {/* ============================================================ */}
      <section id="wingspan" className="relative overflow-hidden px-4 py-16 md:px-12 md:py-24">
        <div className="relative z-10 mx-auto max-w-6xl text-center">
          <SCBadge variant="primary" className="mb-6">Physical Measurable</SCBadge>

          {photoMap.wingspan && (
            <SCGlassCard variant="strong" className="overflow-hidden">
              <div className="relative aspect-[3/1] md:aspect-[3.5/1]">
                <Image
                  src={photoMap.wingspan}
                  alt="Jacob Rodgers -- 80.5 inch wingspan"
                  fill
                  sizes="(max-width: 768px) 100vw, 1152px"
                  className="object-cover object-top"
                />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.5)_100%)]" />
                {/* measurement line */}
                <div className="absolute left-[8%] right-[8%] top-1/2 -translate-y-1/2 pointer-events-none">
                  <div className="border-t-2 border-dashed border-sc-primary/60" />
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-px bg-sc-primary/60" />
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-px bg-sc-primary/60" />
                </div>
              </div>
            </SCGlassCard>
          )}

          <div className="mt-8">
            <p className="text-5xl font-black tabular-nums text-white md:text-7xl">80.5&quot;</p>
            <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-sc-primary">Wingspan</p>
            <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-white/60 md:text-lg">
              Elite length for a lineman his age -- a measurable you can&apos;t coach.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* COACH EVALUATION BEATS                                        */}
      {/* ============================================================ */}
      <section className="px-6 py-16 md:px-12 md:py-24">
        <div className="mx-auto max-w-4xl space-y-8">
          <SCGlassCard variant="broadcast" className="p-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Coach Evaluation</p>
            <div className="space-y-3">
              <p className="text-lg italic text-white/80">
                &quot;He&apos;s got D1 size at 15. 445 deadlift as a freshman.&quot;
              </p>
              <p className="text-lg italic text-white/60">
                &quot;But is he self-made, or just big?&quot;
              </p>
            </div>
          </SCGlassCard>

          {/* Origin / The Work */}
          {photoMap.origin && (
            <div className="relative overflow-hidden rounded-xl">
              <div className="relative aspect-[2/1]">
                <Image src={photoMap.origin} alt="Training" fill sizes="100vw" className="object-cover opacity-30" />
                <div className="absolute inset-0 bg-gradient-to-t from-sc-bg via-sc-bg/80 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white md:text-5xl">
                  The Work
                </h2>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
                  Years of documented, purposeful training. Real facility. Real trainer. Every rep filmed, every gain tracked.
                </p>
              </div>
            </div>
          )}

          <SCGlassCard variant="broadcast" className="p-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Coach Evaluation</p>
            <div className="space-y-3">
              <p className="text-lg italic text-white/80">
                &quot;Years of documented work. Real facility. Real trainer.&quot;
              </p>
              <p className="text-lg italic text-white/60">
                &quot;The kid is serious. But will he fit our locker room?&quot;
              </p>
            </div>
          </SCGlassCard>

          {/* Character */}
          {photoMap.character && (
            <div className="relative overflow-hidden rounded-xl">
              <div className="relative aspect-[2/1]">
                <Image src={photoMap.character} alt="Character" fill sizes="100vw" className="object-cover opacity-30" />
                <div className="absolute inset-0 bg-gradient-to-t from-sc-bg via-sc-bg/80 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white md:text-5xl">
                  Character
                </h2>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
                  Leadership isn&apos;t a stat. It&apos;s showing up when nobody is watching -- and pulling your teammates with you.
                </p>
              </div>
            </div>
          )}

          <SCGlassCard variant="broadcast" className="p-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Coach Evaluation</p>
            <div className="space-y-3">
              <p className="text-lg italic text-white/80">
                &quot;Four years of work before anyone was watching. 445 deadlift as a freshman. Two games in one day and produced in both.&quot;
              </p>
              <p className="text-lg italic text-white/70 font-bold">
                &quot;Self-made. Coachable. Get him on campus.&quot;
              </p>
            </div>
          </SCGlassCard>
        </div>
      </section>

      {/* ============================================================ */}
      {/* ACADEMICS                                                     */}
      {/* ============================================================ */}
      <section id="academics" className="px-6 py-20 md:px-12 md:py-32">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sc-primary/20 to-transparent" />

        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <SCBadge variant="primary" className="mb-4">Academics</SCBadge>
            <p className="text-4xl font-black text-white md:text-5xl">
              GPA: <span className="tabular-nums">3.25</span>
            </p>
            <p className="mt-2 text-base text-white/50">NCAA Eligible &middot; NCSA Verified</p>
          </div>

          <SCGlassCard variant="strong" className="p-6 md:p-8 mb-8">
            <p className="text-[10px] font-black uppercase tracking-widest text-sc-primary/70 mb-2">Why this GPA matters</p>
            <p className="text-base leading-relaxed text-white/70 md:text-lg">
              Pewaukee High School ranks in the top 6% of Wisconsin high schools
              and requires 28 graduation credits -- nearly double the state minimum
              of 15.5. A 3.25 here is earned under a course load that most schools
              don&apos;t require.
            </p>
          </SCGlassCard>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {ACADEMICS.map((stat) => (
              <SCGlassCard key={stat.label} className="px-4 py-4 text-center">
                <p className="text-2xl font-black text-white md:text-3xl">{stat.value}</p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-sc-primary/70">{stat.label}</p>
                <p className="mt-1 text-xs text-white/40">{stat.context}</p>
              </SCGlassCard>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center">
            <span className="text-sm text-white/50">#27 in WI (U.S. News)</span>
            <span className="inline-block h-1 w-1 rounded-full bg-sc-primary/50" />
            <span className="text-sm text-white/50">Baldrige National Quality Award</span>
            <span className="inline-block h-1 w-1 rounded-full bg-sc-primary/50" />
            <span className="text-sm text-white/50">97% graduation rate</span>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* THE FIT                                                       */}
      {/* ============================================================ */}
      {photoMap.fit && (
        <section id="fit" className="relative overflow-hidden px-6 py-20 md:px-12 md:py-32">
          <div className="absolute inset-0">
            <Image src={photoMap.fit} alt="" fill sizes="100vw" className="object-cover opacity-15" />
            <div className="absolute inset-0 bg-sc-bg/90" />
          </div>
          <div className="relative z-10 mx-auto max-w-4xl">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white md:text-6xl mb-6">
              The Fit
            </h2>
            <p className="max-w-2xl text-lg leading-relaxed text-white/70">
              The right program gets a two-way lineman with verified D1 size, elite work ethic, and a family that understands the process.
            </p>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* CONTACT                                                       */}
      {/* ============================================================ */}
      <section id="contact" className="px-6 py-20 md:px-12 md:py-32">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sc-primary/20 to-transparent" />

        <div className="mx-auto max-w-4xl">
          <div className="mb-16 text-center md:mb-20">
            <h2 className="mb-4 text-4xl font-black tracking-tight text-white md:text-6xl">
              Start the Conversation.
            </h2>
            <p className="text-base text-white/50 md:text-lg">
              Interested in Jacob? We&apos;d love to hear from you.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Contact info */}
            <div className="space-y-6">
              <div>
                <span className="mb-3 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Family Contact
                </span>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-white/90">Mike Rodgers</p>
                  <a href="tel:+12623435680" className="block text-sm font-mono text-white transition-colors hover:text-sc-primary">
                    (262) 343-5680
                  </a>
                  <a href="mailto:rodgemd1@gmail.com" className="block text-sm font-mono text-white transition-colors hover:text-sc-primary">
                    rodgemd1@gmail.com
                  </a>
                </div>
              </div>
              <div>
                <span className="mb-3 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Profiles
                </span>
                <div className="space-y-2">
                  <a href="https://x.com/JacobRodge52987" target="_blank" rel="noreferrer" className="block text-sm font-mono text-white/80 transition-colors hover:text-sc-primary">
                    Twitter -- @JacobRodge52987
                  </a>
                  <a href="https://recruit-match.ncsasports.org/clientrms/athlete_profiles/13603435" target="_blank" rel="noreferrer" className="block text-sm font-mono text-white/80 transition-colors hover:text-sc-primary">
                    NCSA -- Jacob Rodgers
                  </a>
                </div>
              </div>
            </div>

            {/* Contact form */}
            <div>
              {!contactSubmitted ? (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <input
                    type="text" name="name" required autoComplete="name" placeholder="Your name"
                    className="w-full rounded-lg border border-sc-border bg-white/5 px-4 py-3 text-base text-white placeholder-slate-500 transition-colors focus:border-sc-primary/40 focus:outline-none"
                  />
                  <input
                    type="text" name="title" required autoComplete="organization-title" placeholder="Coaching position"
                    className="w-full rounded-lg border border-sc-border bg-white/5 px-4 py-3 text-base text-white placeholder-slate-500 transition-colors focus:border-sc-primary/40 focus:outline-none"
                  />
                  <input
                    type="text" name="school" required autoComplete="organization" placeholder="School / program"
                    className="w-full rounded-lg border border-sc-border bg-white/5 px-4 py-3 text-base text-white placeholder-slate-500 transition-colors focus:border-sc-primary/40 focus:outline-none"
                  />
                  <input
                    type="email" name="email" required autoComplete="email" placeholder="Email"
                    className="w-full rounded-lg border border-sc-border bg-white/5 px-4 py-3 text-base text-white placeholder-slate-500 transition-colors focus:border-sc-primary/40 focus:outline-none"
                  />
                  <textarea
                    name="message" rows={4} placeholder="Message (optional)"
                    className="w-full rounded-lg border border-sc-border bg-white/5 px-4 py-3 text-base text-white placeholder-slate-500 transition-colors focus:border-sc-primary/40 focus:outline-none"
                  />
                  {contactError && <p className="text-sm text-red-400">{contactError}</p>}
                  <SCButton type="submit" disabled={contactSubmitting} className="w-full">
                    {contactSubmitting ? "Sending..." : "Send"}
                  </SCButton>
                </form>
              ) : (
                <SCGlassCard className="p-6 border-emerald-500/20">
                  <p className="text-sm leading-relaxed text-emerald-400">
                    Message sent. We&apos;ll respond within 24 hours.
                  </p>
                </SCGlassCard>
              )}
            </div>
          </div>

          <div className="mt-16 text-center">
            <p className="text-xs uppercase tracking-widest text-white/30">
              Jacob Rodgers &middot; #79 &middot; DT/OG &middot; Class of 2029
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* VIDEO MODAL                                                   */}
      {/* ============================================================ */}
      {videoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" onClick={() => setVideoModal(null)}>
          <div className="relative w-full max-w-5xl mx-4" onClick={e => e.stopPropagation()}>
            <SCButton
              variant="ghost"
              size="sm"
              className="absolute -top-10 right-0"
              onClick={() => setVideoModal(null)}
            >
              <span className="material-symbols-outlined">close</span>
              Close
            </SCButton>
            <div className="aspect-video overflow-hidden rounded-xl border border-sc-border bg-black">
              <video
                src={videoModal.src}
                poster={videoModal.poster}
                controls
                autoPlay
                className="h-full w-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
