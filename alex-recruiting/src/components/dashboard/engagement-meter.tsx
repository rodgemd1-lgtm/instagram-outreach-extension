"use client";

interface EngagementMeterProps {
  score: number;
  className?: string;
}

export function EngagementMeter({ score, className = "" }: EngagementMeterProps) {
  const color =
    score >= 75
      ? "#ff000c"
      : score >= 50
        ? "#D4A853"
        : score >= 25
          ? "#A1A1AA"
          : "#3F3F46";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <span className="font-mono text-[11px] text-white/50 w-7 text-right">
        {score}
      </span>
    </div>
  );
}
