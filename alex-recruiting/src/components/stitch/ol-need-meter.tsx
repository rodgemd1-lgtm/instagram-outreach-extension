import { cn } from "@/lib/utils";

interface OLNeedMeterProps {
  level: number; // 0-5
  className?: string;
}

export function OLNeedMeter({ level, className }: OLNeedMeterProps) {
  return (
    <div
      className={cn("flex items-center gap-1", className)}
      role="meter"
      aria-valuenow={level}
      aria-valuemin={0}
      aria-valuemax={5}
      aria-label={`OL need level ${level} of 5`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={cn(
            "h-2 w-2 rounded-full transition-all",
            i <= level
              ? "bg-[#C5050C] shadow-[0_0_6px_rgba(197,5,12,0.5)]"
              : "bg-white/10"
          )}
        />
      ))}
    </div>
  );
}
