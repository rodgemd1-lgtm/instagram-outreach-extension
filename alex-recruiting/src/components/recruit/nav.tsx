"use client";

import { useEffect, useState } from "react";

/* ──────────────────────────────────────────────────────────────
   Recruit Nav — Utility navigation (not narrative-animated)
   Recruit Nav — Persistent utility navigation.
   Uses CSS transitions only for non-narrative utility elements.
   ────────────────────────────────────────────────────────────── */

const sections = [
  { id: "hero", label: "79", short: "79" },
  { id: "film-reel", label: "Film", short: "Film" },
  { id: "origin", label: "The Work", short: "Work" },
  { id: "character", label: "Character", short: "Char" },
  { id: "academics", label: "Academics", short: "Acad" },
  { id: "fit", label: "The Fit", short: "Fit" },
  { id: "contact", label: "Contact", short: "Contact" },
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
            ? "bg-[#000000]/90 backdrop-blur-xl border-b border-white/5"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => scrollTo("hero")}
            className="font-playfair text-sm tracking-normal text-[#FFFFFF]/60 hover:text-[#FFFFFF] transition-colors min-h-[48px] flex items-center"
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
                    ? "text-[#ff000c]"
                    : "text-[#FFFFFF]/50 hover:text-[#FFFFFF]/60"
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
                ? "border-[#ff000c]/50 text-[#ff000c] hover:bg-[#ff000c]/10"
                : "border-[#FFFFFF]/20 text-[#FFFFFF]/60 hover:text-[#FFFFFF]"
            }`}
          >
            Contact
          </button>
        </div>
      </nav>

      {/* Mobile bottom nav — section dots */}
      {scrolled && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#000000]/95 backdrop-blur-xl border-t border-white/5"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 8px)" }}
        >
          <div className="flex items-center justify-around px-1 py-2">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className="flex flex-col items-center gap-0.5 min-w-[40px] min-h-[44px] justify-center px-1"
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    activeSection === s.id
                      ? "bg-[#ff000c] scale-125"
                      : "bg-[#FFFFFF]/20"
                  }`}
                />
                <span
                  className={`text-[7px] tracking-wider uppercase transition-colors leading-none ${
                    activeSection === s.id
                      ? "text-[#ff000c]"
                      : "text-[#FFFFFF]/50"
                  }`}
                >
                  {s.short}
                </span>
              </button>
            ))}
          </div>
        </nav>
      )}
    </>
  );
}
