"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import {
  useRecruitAssembly,
  type AssemblyConfig,
} from "@/hooks/useRecruitAssembly";

export function ContactCTA() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const sectionRef = useRef<HTMLDivElement | null>(null);

  const config = useMemo<AssemblyConfig>(
    () => ({
      wave2: [
        // Left column slides from left
        {
          containerSelector: "[data-contact-left]",
          from: { x: -60, opacity: 0 },
          to: {
            x: 0,
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
          },
          individual: false,
          scrollTrigger: {
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        },
        // Right column slides from right
        {
          containerSelector: "[data-contact-right]",
          from: { x: 60, opacity: 0 },
          to: {
            x: 0,
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
          },
          individual: false,
          scrollTrigger: {
            start: "top 75%",
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

    if (
      !formData.get("name") ||
      !formData.get("school") ||
      !formData.get("email")
    ) {
      setError("Name, school, and email are required.");
      setSubmitting(false);
      return;
    }

    const emailValue = formData.get("email") as string;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      setError("Please enter a valid email address.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/recruit/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          school: formData.get("school"),
          email: formData.get("email"),
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
      ref={(el) => {
        (scopeRef as React.MutableRefObject<HTMLElement | null>).current = el;
        (sectionRef as React.MutableRefObject<HTMLElement | null>).current = el;
      }}
      className="relative bg-black px-6 py-32 md:px-12 md:py-48"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ff000c]/20 to-transparent" />

      <div className="relative z-10 mx-auto max-w-4xl">
        {/* Centered heading */}
        <div className="mb-16 text-center md:mb-20">
          <h2 className="mb-4 font-playfair text-4xl font-black tracking-tight md:text-6xl">
            Let&apos;s Talk.
          </h2>
          <p className="text-base text-white/50 md:text-lg">
            Interested in Jacob? Reach out directly.
          </p>
        </div>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* LEFT — Contact info + profile links */}
          <div data-contact-left>
            <div data-gsap-wave="2" style={{ opacity: 0 }} className="space-y-6">
              {/* Contact info */}
              <div>
                <span className="mb-3 block text-xs uppercase tracking-[0.2em] text-white/50">
                  Family Contact
                </span>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-white/90">
                    Mike Rodgers
                  </p>
                  <a
                    href="tel:+12623435680"
                    className="block text-sm font-jetbrains text-white transition-colors hover:text-[#ff000c]"
                  >
                    (262) 343-5680
                  </a>
                  <a
                    href="mailto:rodgermd1@gmail.com"
                    className="block text-sm font-jetbrains text-white transition-colors hover:text-[#ff000c]"
                  >
                    rodgermd1@gmail.com
                  </a>
                </div>
              </div>

              {/* Profile links */}
              <div>
                <span className="mb-3 block text-xs uppercase tracking-[0.2em] text-white/50">
                  Profiles
                </span>
                <div className="space-y-2">
                  <a
                    href="https://x.com/JacobRodge52987"
                    target="_blank"
                    rel="noreferrer"
                    className="block text-sm font-jetbrains text-white/80 transition-colors hover:text-[#ff000c]"
                  >
                    Twitter &mdash; @JacobRodge52987
                  </a>
                  {/* Hudl link removed — profile URL was returning 404. Re-add with verified URL. */}
                  <a
                    href="https://www.ncsasports.org/football-recruiting/wisconsin/pewaukee/pewaukee-high-school1/jacob-rodgers2"
                    target="_blank"
                    rel="noreferrer"
                    className="block text-sm font-jetbrains text-white/80 transition-colors hover:text-[#ff000c]"
                  >
                    NCSA &mdash; Jacob Rodgers
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — Contact form */}
          <div data-contact-right>
            <div data-gsap-wave="2" style={{ opacity: 0 }}>
              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      name="name"
                      required
                      autoComplete="name"
                      placeholder="Your name"
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder-white/30 transition-colors focus:border-[#ff000c]/40 focus:outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      name="school"
                      required
                      autoComplete="organization"
                      placeholder="School / program"
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder-white/30 transition-colors focus:border-[#ff000c]/40 focus:outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      name="email"
                      required
                      autoComplete="email"
                      placeholder="Email"
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder-white/30 transition-colors focus:border-[#ff000c]/40 focus:outline-none"
                    />
                  </div>
                  <div>
                    <textarea
                      name="message"
                      rows={4}
                      placeholder="Message (optional)"
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder-white/30 transition-colors focus:border-[#ff000c]/40 focus:outline-none"
                    />
                  </div>

                  {error && <p className="text-sm text-red-400">{error}</p>}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-lg bg-[#ff000c] px-6 py-3 text-sm font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? "Sending..." : "Send"}
                  </button>
                </form>
              ) : (
                <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-6">
                  <p className="text-sm leading-relaxed text-green-400">
                    Message sent. We&apos;ll respond within 24 hours.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer identity anchor */}
        <div className="mt-16 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-white/30">
            Jacob Rodgers &middot; #79 &middot; DT/OG &middot; Class of 2029
          </p>
        </div>
      </div>
    </section>
  );
}
