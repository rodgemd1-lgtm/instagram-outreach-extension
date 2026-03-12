"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "./animated-number";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: "up" | "down" | "neutral";
  icon: LucideIcon;
  /** Optional 7-point sparkline data. If provided, renders a mini sparkline SVG. */
  sparkline?: number[];
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const width = 80;
  const height = 24;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
    </svg>
  );
}

export function StatCard({
  label,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  sparkline,
}: StatCardProps) {
  const isNumeric = typeof value === "number";

  const sparklineColor =
    changeType === "up"
      ? "#22C55E"
      : changeType === "down"
        ? "#EF4444"
        : "rgba(255,255,255,0.3)";

  return (
    <div className="rounded-xl border border-white/5 bg-[#0A0A0A] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#111111] hover:border-[#ff000c]/20 hover:shadow-[0_0_20px_rgba(255,0,12,0.05)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">
            {label}
          </p>
          <p className="mt-2 font-mono text-3xl font-bold tracking-tight text-white">
            {isNumeric ? (
              <AnimatedNumber value={value} format="number" />
            ) : (
              value
            )}
          </p>
          {change && (
            <p
              className={cn(
                "mt-1 text-xs font-medium",
                changeType === "up" && "text-[#22C55E]",
                changeType === "down" && "text-[#EF4444]",
                changeType === "neutral" && "text-white/40"
              )}
            >
              {changeType === "up" && "\u2191 "}
              {changeType === "down" && "\u2193 "}
              {change}
            </p>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ff000c]/10">
          <Icon className="h-5 w-5 text-[#ff000c]" />
        </div>
      </div>
      {sparkline && sparkline.length > 1 && (
        <div className="mt-3">
          <Sparkline data={sparkline} color={sparklineColor} />
        </div>
      )}
    </div>
  );
}
