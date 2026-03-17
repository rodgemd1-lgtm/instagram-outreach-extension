"use client";

import { useEffect, useState } from "react";

/* ──────────────────────────────────────────────────────────────
   Scroll Progress Bar — Utility element (not narrative-animated)
   Progress bar is ambient feedback — CSS transform is acceptable.
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
        className="h-full bg-gradient-to-r from-[#ff000c] via-[#ff000c] to-[#C0392B] transition-transform duration-100 origin-left"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}
