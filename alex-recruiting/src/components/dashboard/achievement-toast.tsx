"use client";

import { useEffect, useState } from "react";
import type { Achievement } from "@/lib/dashboard/gamification";

interface AchievementToastProps {
  achievement: Achievement | null;
  onDismiss: () => void;
}

export function AchievementToast({ achievement, onDismiss }: AchievementToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onDismiss, 300); // wait for fade out
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [achievement, onDismiss]);

  if (!achievement) return null;

  return (
    <div
      className={`fixed top-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-[#D4A853]/30 bg-[#0A0A0A] px-5 py-4 shadow-[0_0_30px_rgba(212,168,83,0.2)] transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
      }`}
    >
      <span className="text-2xl">{achievement.icon}</span>
      <div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-[#D4A853]">
          Achievement Unlocked
        </p>
        <p className="text-sm font-bold text-white">{achievement.title}</p>
        <p className="text-xs text-white/50">{achievement.description}</p>
      </div>
    </div>
  );
}
