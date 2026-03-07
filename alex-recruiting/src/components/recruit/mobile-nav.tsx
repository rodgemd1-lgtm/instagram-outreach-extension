"use client";

import { useEffect, useState } from "react";

/* ──────────────────────────────────────────────────────────────
   Mobile Bottom Nav — Sticky section dots for mobile (< md)
   Shows below md: breakpoint with pirate-red active state.
   ────────────────────────────────────────────────────────────── */

const sections = [
  { id: "hero", label: "79" },
  { id: "film-reel", label: "Film" },
  { id: "origin", label: "Work" },
  { id: "character", label: "Char" },
  { id: "academics", label: "Acad" },
  { id: "fit", label: "Fit" },
  { id: "contact", label: "Talk" },
];

export function MobileNav() {
  const [activeSection, setActiveSection] = useState("hero");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // Show mobile nav after scrolling past hero
      setVisible(window.scrollY > window.innerHeight * 0.5);

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
    <nav
      className={`fixed bottom-0 left-0 right-0 z-40 md:hidden transition-all duration-300 ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-full opacity-0"
      }`}
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="bg-[#0A0A0A]/95 backdrop-blur-xl border-t border-white/5">
        <div className="flex items-center justify-around px-2 py-2">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className={`flex flex-col items-center gap-1 px-1 py-1 min-w-0 transition-colors ${
                activeSection === s.id ? "text-red-500" : "text-white/30"
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  activeSection === s.id
                    ? "bg-red-500 scale-125"
                    : "bg-white/20"
                }`}
              />
              <span className="text-[8px] tracking-wider uppercase truncate">
                {s.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
