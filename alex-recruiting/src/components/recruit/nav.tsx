"use client";

import { useEffect, useState } from "react";

/* ──────────────────────────────────────────────────────────────
   Recruit Nav — Utility navigation (not narrative-animated)
   No LAAL mechanism — nav is a persistent UI element, not part
   of the motion narrative. Uses CSS transitions only (acceptable
   for non-narrative utility elements per protocol).
   ────────────────────────────────────────────────────────────── */

const sections = [
  { id: "hero", label: "79" },
  { id: "film-reel", label: "Film" },
  { id: "origin", label: "The Work" },
  { id: "athlete", label: "Athlete" },
  { id: "character", label: "Character" },
  { id: "academics", label: "Academics" },
  { id: "fit", label: "The Fit" },
  { id: "contact", label: "Contact" },
];

export function RecruitNav() {
  const [activeSection, setActiveSection] = useState("hero");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 100);

      const sectionEls = sections
        .map((s) => ({
          id: s.id,
          el: document.getElementById(s.id),
        }))
        .filter((s) => s.el);

      const viewportCenter = window.innerHeight / 2;

      for (let i = sectionEls.length - 1; i >= 0; i--) {
        const rect = sectionEls[i].el!.getBoundingClientRect();
        if (rect.top <= viewportCenter) {
          setActiveSection(sectionEls[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* Desktop top nav */}
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          scrolled
            ? "bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-white/5"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => scrollTo("hero")}
            className="font-playfair text-sm tracking-normal text-[#F5F0E6]/60 hover:text-[#F5F0E6] transition-colors min-h-[48px] flex items-center"
          >
            JACOB RODGERS
          </button>

          <div className="hidden md:flex items-center gap-6">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={`text-xs tracking-widest uppercase transition-all duration-300 min-h-[48px] px-2 flex items-center ${
                  activeSection === s.id
                    ? "text-[#D4A853]"
                    : "text-[#F5F0E6]/50 hover:text-[#F5F0E6]/60"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => scrollTo("contact")}
            className={`text-xs tracking-widest uppercase px-4 py-2 rounded-full border transition-all duration-300 min-h-[48px] flex items-center ${
              scrolled
                ? "border-[#D4A853]/50 text-[#D4A853] hover:bg-[#D4A853]/10"
                : "border-[#F5F0E6]/20 text-[#F5F0E6]/60 hover:text-[#F5F0E6]"
            }`}
          >
            Contact
          </button>
        </div>
      </nav>

      {/* Mobile bottom nav — section dots */}
      {scrolled && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#0A0A0A]/95 backdrop-blur-xl border-t border-white/5"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 8px)" }}
        >
          <div className="flex items-center justify-around px-2 py-3">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className="flex flex-col items-center gap-1 min-w-[48px] min-h-[48px] justify-center"
              >
                <div
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    activeSection === s.id
                      ? "bg-[#D4A853] scale-125"
                      : "bg-[#F5F0E6]/20"
                  }`}
                />
                <span
                  className={`text-[8px] tracking-wider uppercase transition-colors ${
                    activeSection === s.id
                      ? "text-[#D4A853]"
                      : "text-[#F5F0E6]/50"
                  }`}
                >
                  {s.label}
                </span>
              </button>
            ))}
          </div>
        </nav>
      )}
    </>
  );
}
