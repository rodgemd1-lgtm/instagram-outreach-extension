"use client";

import { useMemo, useState, FormEvent } from "react";
import {
  useRecruitAssembly,
  type AssemblyConfig,
} from "@/hooks/useRecruitAssembly";
import { Check, ExternalLink } from "lucide-react";

/* ──────────────────────────────────────────────────────────────
   Contact CTA — Close the deal
   LAAL Mechanism: Forgiving Stakes
   The form is framed as a low-pressure conversation starter,
   not a commitment. "Let's talk" reduces friction.

   Wave 1: none (below fold)
   Wave 2: header, form, links, footer scroll-reveal
   ────────────────────────────────────────────────────────────── */

export function ContactCTA() {
  const [submitted, setSubmitted] = useState(false);

  const config = useMemo<AssemblyConfig>(
    () => ({
      wave2: [
        {
          /* LAAL: Forgiving Stakes — low-pressure reveal of contact area */
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section
      id="contact"
      ref={scopeRef}
      className="relative py-32 md:py-48 px-6 md:px-12"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

      {/* Large background text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[12rem] md:text-[20rem] font-black text-white/[0.015] select-none leading-none whitespace-nowrap">
        RECRUIT ME
      </div>

      <div
        data-gsap="contact-content"
        className="max-w-4xl mx-auto relative z-10"
      >
        {/* Header — LAAL: Forgiving Stakes */}
        <div
          data-gsap-wave="2"
          style={{ opacity: 0 }}
          className="text-center mb-16 md:mb-24"
        >
          <span className="text-[10px] tracking-[0.5em] text-amber-400/60 uppercase font-mono block mb-6">
            Let&apos;s Connect
          </span>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95] mb-6">
            Ready to talk?
          </h2>
          <p className="text-white/40 text-base md:text-lg max-w-lg mx-auto leading-relaxed">
            I&apos;m looking for a program where I can compete, develop, and
            contribute from day one. Let&apos;s start the conversation.
          </p>
        </div>

        {/* Contact form — LAAL: Forgiving Stakes */}
        {!submitted ? (
          <form
            onSubmit={handleSubmit}
            data-gsap-wave="2"
            style={{ opacity: 0 }}
            className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8 md:p-12 space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] tracking-[0.3em] text-white/30 uppercase block mb-2">
                  Coach Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder-white/20 focus:border-amber-500/40 focus:outline-none transition-colors"
                  placeholder="Coach Smith"
                />
              </div>
              <div>
                <label className="text-[10px] tracking-[0.3em] text-white/30 uppercase block mb-2">
                  School / University
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder-white/20 focus:border-amber-500/40 focus:outline-none transition-colors"
                  placeholder="University of Wisconsin"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] tracking-[0.3em] text-white/30 uppercase block mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder-white/20 focus:border-amber-500/40 focus:outline-none transition-colors"
                  placeholder="coach@university.edu"
                />
              </div>
              <div>
                <label className="text-[10px] tracking-[0.3em] text-white/30 uppercase block mb-2">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder-white/20 focus:border-amber-500/40 focus:outline-none transition-colors"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] tracking-[0.3em] text-white/30 uppercase block mb-2">
                Message
              </label>
              <textarea
                rows={4}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder-white/20 focus:border-amber-500/40 focus:outline-none transition-colors resize-none"
                placeholder="Tell me about your program and what you're looking for in a lineman..."
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold text-sm tracking-widest uppercase hover:from-amber-400 hover:to-orange-400 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/20"
            >
              Send Message
            </button>
          </form>
        ) : (
          <div
            data-gsap-wave="2"
            style={{ opacity: 0 }}
            className="bg-gradient-to-r from-amber-500/5 to-orange-500/5 border border-amber-500/20 rounded-2xl p-12 text-center"
          >
            {/* Lucide Check icon — no emoji */}
            <div className="flex justify-center mb-4">
              <Check className="w-10 h-10 text-amber-400" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Message sent.</h3>
            <p className="text-white/50">
              Thank you, Coach. I&apos;ll respond within 24 hours.
            </p>
          </div>
        )}

        {/* Quick links — LAAL: Forgiving Stakes */}
        <div
          data-gsap-wave="2"
          style={{ opacity: 0 }}
          className="mt-12 flex flex-wrap justify-center gap-6"
        >
          <QuickLink
            label="X / Twitter"
            handle="@JacobRodge52987"
            href="https://x.com/JacobRodge52987"
          />
          <QuickLink label="NCSA Profile" handle="View Profile" href="#" />
          <QuickLink label="Hudl Film" handle="Watch Film" href="#" />
        </div>

        {/* Footer */}
        <div
          data-gsap-wave="2"
          style={{ opacity: 0 }}
          className="mt-20 pt-12 border-t border-white/5 text-center"
        >
          <p className="text-white/20 text-xs tracking-widest">
            JACOB RODGERS &mdash; DT/OG &mdash; CLASS OF 2029 &mdash; PEWAUKEE
            HS, WISCONSIN
          </p>
          <p className="text-white/10 text-[10px] mt-3">
            Built with dedication. Like everything else.
          </p>
        </div>
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
      rel="noopener noreferrer"
      className="flex items-center gap-3 px-6 py-3 rounded-full border border-white/[0.06] hover:border-amber-500/20 transition-colors group"
    >
      <span className="text-[10px] tracking-[0.2em] text-white/30 uppercase">
        {label}
      </span>
      <span className="text-sm text-amber-400/70 group-hover:text-amber-400 transition-colors flex items-center gap-1">
        {handle}
        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
      </span>
    </a>
  );
}
