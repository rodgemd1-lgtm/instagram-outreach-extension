"use client";

import { useEffect, useState } from "react";
import { AnimatedNumber } from "./animated-number";

function SubScore({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex items-center gap-3">
      <span className="w-20 text-[11px] uppercase tracking-[0.15em] text-white/40">
        {label}
      </span>
      <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: mounted ? `${value}%` : "0%",
            backgroundColor: color,
          }}
        />
      </div>
      <span className="w-10 text-right font-mono text-[11px] text-white/60">
        {value}%
      </span>
    </div>
  );
}

function getScoreColor(score: number): string {
  if (score > 70) return "#22C55E";
  if (score >= 40) return "#D4A853";
  return "#EF4444";
}

export function ReadinessScoreGauge() {
  const [animatedOffset, setAnimatedOffset] = useState(true);

  // Hardcoded scores for now
  const overall = 42;
  const subScores = [
    { label: "Outreach", value: 55 },
    { label: "Content", value: 35 },
    { label: "Visibility", value: 48 },
    { label: "Network", value: 30 },
  ];

  const radius = 80;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;
  const scoreColor = getScoreColor(overall);

  useEffect(() => {
    const t = setTimeout(() => setAnimatedOffset(false), 100);
    return () => clearTimeout(t);
  }, []);

  const dashoffset = animatedOffset
    ? circumference
    : circumference * (1 - overall / 100);

  return (
    <div className="rounded-xl border border-white/5 bg-[#0A0A0A] p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-6 w-1 rounded-full bg-[#ff000c]" />
        <h2 className="text-[10px] uppercase tracking-[0.2em] text-white/40">
          Recruiting Readiness
        </h2>
      </div>

      <div className="flex flex-col items-center">
        {/* SVG Gauge */}
        <div className="relative w-[200px] h-[200px]">
          <svg
            width="200"
            height="200"
            viewBox="0 0 200 200"
            className="rotate-[-90deg]"
          >
            {/* Background circle */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={strokeWidth}
            />
            {/* Score arc */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke={scoreColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashoffset}
              className="transition-all duration-[1500ms] ease-out"
            />
          </svg>
          {/* Score number centered */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <AnimatedNumber
              value={overall}
              format="number"
              className="text-[48px] font-bold tracking-tight text-white"
            />
            <span className="text-[11px] uppercase tracking-[0.2em] text-white/30 mt-1">
              / 100
            </span>
          </div>
        </div>

        {/* Sub-scores */}
        <div className="w-full mt-8 space-y-3">
          {subScores.map((sub) => (
            <SubScore
              key={sub.label}
              label={sub.label}
              value={sub.value}
              color={scoreColor}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
