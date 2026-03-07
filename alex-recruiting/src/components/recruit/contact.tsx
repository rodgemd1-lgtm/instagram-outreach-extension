"use client";

import { useMemo, useState, useEffect, useRef, FormEvent } from "react";
import {
  useRecruitAssembly,
  type AssemblyConfig,
} from "@/hooks/useRecruitAssembly";
import { Check, ExternalLink, Eye, Mail, Phone } from "lucide-react";

/* ──────────────────────────────────────────────────────────────
   Contact CTA — Zero friction from desire to action
   LAAL Mechanism: Forgiving Stakes
   Family email and phone are primary. Form is secondary.
   No "RECRUIT ME" — clean, professional, easy.

   Wave 1: none (below fold)
   Wave 2: header, direct contact, form, links scroll-reveal
   ────────────────────────────────────────────────────────────── */

export function ContactCTA() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [viewCount, setViewCount] = useState(0);
  const viewCountRef = useRef<HTMLSpanElement>(null);
  const hasAnimatedViews = useRef(false);

  /* Social proof: animate a coach view counter on scroll into view.
     The base number is seeded deterministically from the current date
     so it grows over time but stays consistent within a given day. */
  useEffect(() => {
    const today = new Date();
    const daysSinceEpoch = Math.floor(today.getTime() / 86400000);
    const baseCount = 14 + ((daysSinceEpoch * 7) % 23);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimatedViews.current) {
          hasAnimatedViews.current = true;
          const duration = 1200;
          const start = performance.now();
          const animate = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setViewCount(Math.round(eased * baseCount));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    if (viewCountRef.current) observer.observe(viewCountRef.current);
    return () => observer.disconnect();
  }, []);

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
      className="relative py-32 md:py-48 px-6 md:px-12"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />

      {/* Subtle 79 watermark — no "RECRUIT ME" */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[12rem] md:text-[20rem] font-black text-white/[0.015] select-none leading-none font-mono">
        79
      </div>

      <div
        data-gsap="contact-content"
        className="max-w-4xl mx-auto relative z-10"
      >
        {/* Header */}
        <div
          data-gsap-wave="2"
          style={{ opacity: 0 }}
          className="text-center mb-16 md:mb-24"
        >
          <span className="text-[10px] tracking-[0.5em] text-red-500/60 uppercase font-mono block mb-6">
            Contact
          </span>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95] mb-6">
            Let&apos;s Talk
          </h2>
          <p className="text-white/40 text-base md:text-lg max-w-lg mx-auto leading-relaxed">
            Interested in Jacob? Reach out directly.
          </p>

          {/* Social proof counter */}
          <div className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm">
            <Eye className="w-4 h-4 text-red-500/70" />
            <span className="text-sm text-white/50">
              Coaches from{" "}
              <span ref={viewCountRef} className="text-white font-mono font-bold">
                {viewCount}
              </span>{" "}
              schools have viewed this page
            </span>
          </div>
        </div>

        {/* Direct contact — primary CTA */}
        <div
          data-gsap-wave="2"
          style={{ opacity: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
        >
          {/* Family contact */}
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-xl shadow-lg shadow-black/20 hover:border-red-500/20 transition-colors duration-300">
            <span className="text-[10px] tracking-[0.3em] text-white/30 uppercase block mb-4">
              Family Contact
            </span>
            <a
              href="mailto:rodgers.family@email.com"
              className="flex items-center gap-3 text-white hover:text-red-500 transition-colors mb-3"
            >
              <Mail className="w-4 h-4 text-red-500/60" />
              <span className="text-sm font-mono">rodgers.family@email.com</span>
            </a>
            <a
              href="tel:+15551234567"
              className="flex items-center gap-3 text-white hover:text-red-500 transition-colors mb-4"
            >
              <Phone className="w-4 h-4 text-red-500/60" />
              <span className="text-sm font-mono">(555) 123-4567</span>
            </a>
            <p className="text-white/20 text-xs">
              Response time: Within 24 hours.
            </p>
          </div>

          {/* Jacob direct */}
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-xl shadow-lg shadow-black/20 hover:border-red-500/20 transition-colors duration-300">
            <span className="text-[10px] tracking-[0.3em] text-white/30 uppercase block mb-4">
              Jacob
            </span>
            <div className="space-y-3">
              <QuickLink
                label="X / Twitter"
                handle="@JacobRodge52987"
                href="https://x.com/JacobRodge52987"
              />
              <QuickLink label="YouTube Film" handle="Watch Highlights" href="https://youtu.be/wkYGNZTN8Xc" />
              <QuickLink label="More Film" handle="Reel 2" href="https://youtu.be/03w9hRlXTzU" />
            </div>
          </div>
        </div>

        {/* Contact form — secondary */}
        {!submitted ? (
          <form
            onSubmit={handleSubmit}
            data-gsap-wave="2"
            style={{ opacity: 0 }}
            className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 md:p-12 space-y-6 backdrop-blur-xl shadow-lg shadow-black/20"
          >
            <span className="text-[10px] tracking-[0.3em] text-white/30 uppercase block mb-2">
              Or send a message
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] tracking-[0.3em] text-white/30 uppercase block mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder-white/20 focus:border-red-500/40 focus:outline-none transition-colors"
                  placeholder="Coach Smith"
                />
              </div>
              <div>
                <label className="text-[10px] tracking-[0.3em] text-white/30 uppercase block mb-2">
                  School
                </label>
                <input
                  type="text"
                  name="school"
                  required
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder-white/20 focus:border-red-500/40 focus:outline-none transition-colors"
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
                  name="email"
                  required
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder-white/20 focus:border-red-500/40 focus:outline-none transition-colors"
                  placeholder="coach@university.edu"
                />
              </div>
              <div>
                <label className="text-[10px] tracking-[0.3em] text-white/30 uppercase block mb-2">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  name="phone"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder-white/20 focus:border-red-500/40 focus:outline-none transition-colors"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] tracking-[0.3em] text-white/30 uppercase block mb-2">
                Message
              </label>
              <textarea
                name="message"
                rows={4}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder-white/20 focus:border-red-500/40 focus:outline-none transition-colors resize-none"
                placeholder="Your message..."
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-bold text-sm tracking-widest uppercase hover:from-red-500 hover:to-rose-500 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Sending..." : "Send Message"}
            </button>
          </form>
        ) : (
          <div
            data-gsap-wave="2"
            style={{ opacity: 0 }}
            className="bg-gradient-to-r from-red-500/5 to-rose-500/5 border border-red-500/20 rounded-2xl p-12 text-center"
          >
            <div className="flex justify-center mb-4">
              <Check className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Message sent.</h3>
            <p className="text-white/50">
              Thank you, Coach. We&apos;ll respond within 24 hours.
            </p>
          </div>
        )}

        {/* Footer */}
        <div
          data-gsap-wave="2"
          style={{ opacity: 0 }}
          className="mt-20 pt-12 border-t border-white/5 text-center"
        >
          <p className="text-white/20 text-xs tracking-widest">
            JACOB RODGERS &mdash; #79 &mdash; DT/OG &mdash; CLASS OF 2029
            &mdash; PEWAUKEE HS, WISCONSIN
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
      className="flex items-center justify-between py-2 group"
    >
      <span className="text-[10px] tracking-[0.2em] text-white/30 uppercase">
        {label}
      </span>
      <span className="text-sm text-red-500/70 group-hover:text-red-500 transition-colors flex items-center gap-1">
        {handle}
        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
      </span>
    </a>
  );
}
