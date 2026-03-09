"use client";

import { useEffect, useState } from "react";

/* ──────────────────────────────────────────────────────────────
   Scroll Progress Bar — Utility element (not narrative-animated)
   No LAAL mechanism — progress bar is ambient feedback, not part
   of the motion narrative. CSS transform is acceptable here.
   ────────────────────────────────────────────────────────────── */

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? scrollTop / docHeight : 0);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[2px]">
      <div
        className="h-full bg-gradient-to-r from-[#D4A853] via-[#E8C068] to-[#C0392B] transition-transform duration-100 origin-left"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}
