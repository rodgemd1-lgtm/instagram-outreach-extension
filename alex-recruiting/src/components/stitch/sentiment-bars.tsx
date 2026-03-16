import { cn } from "@/lib/utils";

interface SentimentBar {
  label: string;
  value: number; // 0-100
  color?: string;
}

interface SentimentBarsProps {
  bars: SentimentBar[];
  className?: string;
}

export function SentimentBars({ bars, className }: SentimentBarsProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {bars.map((bar) => (
        <div key={bar.label}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-white/50">{bar.label}</span>
            <span className="text-[11px] font-semibold text-white/70">
              {bar.value}%
            </span>
          </div>
          <div
            className="h-1.5 w-full rounded-full bg-white/5"
            role="progressbar"
            aria-valuenow={bar.value}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${bar.label}: ${bar.value}%`}
          >
            <div
              className="h-1.5 rounded-full transition-all"
              style={{
                width: `${bar.value}%`,
                background: bar.color || "#C5050C",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
