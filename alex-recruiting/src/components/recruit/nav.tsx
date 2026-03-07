"use client";

import { useEffect, useState } from "react";

const sections = [
  { id: "hero", label: "79" },
  { id: "origin", label: "Origin" },
  { id: "character", label: "Character" },
  { id: "film", label: "Film" },
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
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        scrolled
          ? "bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo / Name */}
        <button
          onClick={() => scrollTo("hero")}
          className="font-mono text-sm tracking-[0.3em] text-white/60 hover:text-white transition-colors"
        >
          JACOB RODGERS
        </button>

        {/* Section dots - desktop */}
        <div className="hidden md:flex items-center gap-6">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className={`text-xs tracking-widest uppercase transition-all duration-300 ${
                activeSection === s.id
                  ? "text-amber-400"
                  : "text-white/30 hover:text-white/60"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => scrollTo("contact")}
          className={`text-xs tracking-widest uppercase px-4 py-2 rounded-full border transition-all duration-300 ${
            scrolled
              ? "border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
              : "border-white/20 text-white/60 hover:text-white"
          }`}
        >
          Recruit Me
        </button>
      </div>
    </nav>
  );
}
