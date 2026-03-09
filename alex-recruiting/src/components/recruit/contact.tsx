"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Check, ExternalLink, Mail } from "lucide-react";
import {
  useRecruitAssembly,
  type AssemblyConfig,
} from "@/hooks/useRecruitAssembly";

export function ContactCTA() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const config = useMemo<AssemblyConfig>(
    () => ({
      wave2: [
        {
          containerSelector: '[data-gsap="contact-content"]',
          from: { y: 40, opacity: 0 },
          to: {
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
          },
          individual: false,
          stagger: 0.12,
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      const res = await fetch("/api/recruit/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          school: formData.get("school"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          message: formData.get("message"),
        }),
      });

      if (!res.ok) throw new Error("Failed to send");
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try emailing us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      ref={scopeRef}
      className="relative px-6 py-32 md:px-12 md:py-48"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-[12rem] font-black leading-none text-white/[0.015] md:text-[20rem]">
        79
      </div>

      <div data-gsap="contact-content" className="relative z-10 mx-auto max-w-4xl">
        <div
          data-gsap-wave="2"
          style={{ opacity: 0 }}
          className="mb-16 text-center md:mb-24"
        >
          <span className="mb-6 block font-mono text-[10px] uppercase tracking-[0.5em] text-red-500/60">
            Contact
          </span>
          <h2 className="mb-6 text-4xl font-black tracking-tight leading-[0.95] md:text-6xl lg:text-7xl">
            Let&apos;s Talk
          </h2>
          <p className="mx-auto max-w-lg text-base leading-relaxed text-white/40 md:text-lg">
            The cleanest next move is simple: watch the CapCut highlight,
            compare the coach and legacy reels, and send a message through the
            coach form.
          </p>
        </div>

        <div
          data-gsap-wave="2"
          style={{ opacity: 0 }}
          className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2"
        >
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 backdrop-blur-xl shadow-lg shadow-black/20 transition-colors duration-300 hover:border-red-500/20">
            <span className="mb-4 block text-[10px] uppercase tracking-[0.3em] text-white/30">
              Family Contact
            </span>
            <a
              href="mailto:rodgermd1@gmail.com"
              className="flex items-center gap-3 text-white transition-colors hover:text-red-500"
            >
              <Mail className="h-4 w-4 text-red-500/60" />
              <span className="text-sm font-mono">rodgermd1@gmail.com</span>
            </a>
            <p className="mt-4 text-sm leading-6 text-white/48">
              Coaches can email directly or use the form below. Family follow-up
              should respond within 24 hours.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 backdrop-blur-xl shadow-lg shadow-black/20 transition-colors duration-300 hover:border-red-500/20">
            <span className="mb-4 block text-[10px] uppercase tracking-[0.3em] text-white/30">
              Live Links
            </span>
            <div className="space-y-3">
              <QuickLink
                label="Main Highlight"
                handle="Open CapCut Reel"
                href="/recruit/featured-clips/jacob-capcut-highlight.mp4"
              />
              <QuickLink
                label="Coach Reel"
                handle="Open Trench Reel"
                href="/recruit/featured-clips/jacob-impact-reel.mp4"
              />
              <QuickLink
                label="Legacy Reel"
                handle="Open Restored Reel"
                href="/recruit/featured-clips/jacob-legacy-trench-reel.mp4"
              />
              <QuickLink
                label="X / Twitter"
                handle="@JacobRodge52987"
                href="https://x.com/JacobRodge52987"
              />
              <QuickLink
                label="YouTube Film"
                handle="Watch Highlights"
                href="https://youtu.be/wkYGNZTN8Xc"
              />
            </div>
          </div>
        </div>

        {!submitted ? (
          <form
            onSubmit={handleSubmit}
            data-gsap-wave="2"
            style={{ opacity: 0 }}
            className="space-y-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 shadow-lg shadow-black/20 backdrop-blur-xl md:p-12"
          >
            <span className="mb-2 block text-[10px] uppercase tracking-[0.3em] text-white/30">
              Or send a message
            </span>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-[10px] uppercase tracking-[0.3em] text-white/30">
                  Your Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-white placeholder-white/20 transition-colors focus:border-red-500/40 focus:outline-none"
                  placeholder="Coach Smith"
                />
              </div>
              <div>
                <label className="mb-2 block text-[10px] uppercase tracking-[0.3em] text-white/30">
                  School
                </label>
                <input
                  type="text"
                  name="school"
                  required
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-white placeholder-white/20 transition-colors focus:border-red-500/40 focus:outline-none"
                  placeholder="University of Wisconsin"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-[10px] uppercase tracking-[0.3em] text-white/30">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-white placeholder-white/20 transition-colors focus:border-red-500/40 focus:outline-none"
                  placeholder="coach@university.edu"
                />
              </div>
              <div>
                <label className="mb-2 block text-[10px] uppercase tracking-[0.3em] text-white/30">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  name="phone"
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-white placeholder-white/20 transition-colors focus:border-red-500/40 focus:outline-none"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[10px] uppercase tracking-[0.3em] text-white/30">
                Message
              </label>
              <textarea
                name="message"
                rows={5}
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-white placeholder-white/20 transition-colors focus:border-red-500/40 focus:outline-none"
                placeholder="We'd like to learn more about Jacob and start a conversation."
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-red-600 via-red-500 to-rose-500 px-10 py-4 text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-red-500/25 transition-all duration-300 hover:scale-105 hover:shadow-red-500/40 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Sending..." : "Send Message"}
            </button>
          </form>
        ) : (
          <div
            data-gsap-wave="2"
            style={{ opacity: 0 }}
            className="flex items-start gap-4 rounded-2xl border border-green-500/20 bg-green-500/[0.04] p-8 md:p-10"
          >
            <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
              <Check className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">
                Message sent.
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/50">
                Thanks. We will follow up with Jacob&apos;s family and staff soon.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function QuickLink({
  label,
  handle,
  href,
}: {
  label: string;
  handle: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 transition-colors hover:border-red-500/25"
    >
      <div>
        <span className="block text-[10px] uppercase tracking-[0.3em] text-white/30">
          {label}
        </span>
        <span className="mt-1 block text-sm font-mono text-white/80">
          {handle}
        </span>
      </div>
      <ExternalLink className="h-4 w-4 text-red-500/60" />
    </a>
  );
}
