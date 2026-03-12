"use client";

import { useEffect, useState } from "react";

interface PipelineStage {
  label: string;
  count: number;
  color: string;
}

interface PipelineFunnelProps {
  stages: PipelineStage[];
}

const STAGE_COLORS = ["#ff000c", "#D4A853", "#22C55E", "#22C55E"];

export function PipelineFunnel({ stages }: PipelineFunnelProps) {
  const [mounted, setMounted] = useState(false);
  const maxCount = Math.max(...stages.map((s) => s.count), 1);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="rounded-xl border border-white/5 bg-[#0A0A0A] p-6">
      <h3 className="mb-5 text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">
        Coach Pipeline
      </h3>
      <div className="space-y-0">
        {stages.map((stage, index) => {
          // Each stage narrows: top width is based on this stage's count,
          // bottom width is based on next stage (or slightly narrower)
          const topPct = Math.max((stage.count / maxCount) * 100, 12);
          const nextPct =
            index < stages.length - 1
              ? Math.max((stages[index + 1].count / maxCount) * 100, 8)
              : topPct * 0.7;

          const topLeft = (100 - topPct) / 2;
          const topRight = topLeft + topPct;
          const botLeft = (100 - nextPct) / 2;
          const botRight = botLeft + nextPct;

          const clipPath = `polygon(${topLeft}% 0%, ${topRight}% 0%, ${botRight}% 100%, ${botLeft}% 100%)`;

          // Conversion rate from previous stage
          let conversionRate: number | null = null;
          if (index > 0 && stages[index - 1].count > 0) {
            conversionRate = Math.round(
              (stage.count / stages[index - 1].count) * 100
            );
          }

          const color = STAGE_COLORS[index] || stage.color;

          return (
            <div key={stage.label}>
              {/* Conversion rate between stages */}
              {conversionRate !== null && (
                <div className="flex items-center justify-center gap-2 py-1">
                  <svg
                    className="h-3 w-3 text-white/20"
                    viewBox="0 0 12 12"
                    fill="none"
                  >
                    <path
                      d="M6 2L6 10M6 10L3 7M6 10L9 7"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span
                    className={`font-mono text-xs font-medium ${
                      conversionRate >= 20
                        ? "text-[#22C55E]"
                        : "text-[#F59E0B]"
                    }`}
                  >
                    {conversionRate}%
                  </span>
                </div>
              )}

              {/* Funnel trapezoid */}
              <div
                className="relative mx-auto flex h-12 items-center justify-center transition-all duration-700"
                style={{
                  clipPath: mounted ? clipPath : `polygon(50% 0%, 50% 0%, 50% 100%, 50% 100%)`,
                  backgroundColor: color,
                  opacity: mounted ? 1 : 0,
                  transitionDelay: `${index * 100}ms`,
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-white/90">
                    {stage.label}
                  </span>
                  <span className="font-mono text-sm font-bold text-white">
                    {stage.count}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
