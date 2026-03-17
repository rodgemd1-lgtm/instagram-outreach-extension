import { cn } from "@/lib/utils";
import { SCGlassCard } from "./sc-glass-card";

interface SCStatCardProps {
  label: string;
  value: React.ReactNode;
  trend?: { value: string; direction: "up" | "down" | "neutral" };
  icon?: string;
  progress?: number;
  className?: string;
}

const trendConfig = {
  up: { color: "text-emerald-400", icon: "trending_up" },
  down: { color: "text-red-400", icon: "trending_down" },
  neutral: { color: "text-slate-400", icon: "trending_flat" },
} as const;

export function SCStatCard({
  label,
  value,
  trend,
  icon,
  progress,
  className,
}: SCStatCardProps) {
  return (
    <SCGlassCard className={cn("relative overflow-hidden p-5", className)}>
      {/* Background icon */}
      {icon && (
        <span
          className="material-symbols-outlined absolute -top-2 -right-2 text-[80px] text-white/[0.04] select-none pointer-events-none"
          aria-hidden="true"
        >
          {icon}
        </span>
      )}

      {/* Content */}
      <div className="relative z-10">
        <p className="text-sm font-semibold text-slate-400 mb-1">{label}</p>
        <p className="text-4xl font-black text-white">{value}</p>

        {trend && (
          <div
            className={cn(
              "mt-2 flex items-center gap-1 text-xs font-bold",
              trendConfig[trend.direction].color
            )}
          >
            <span className="material-symbols-outlined text-[16px]">
              {trendConfig[trend.direction].icon}
            </span>
            <span>{trend.value}</span>
          </div>
        )}

        {typeof progress === "number" && (
          <div className="mt-3 h-1.5 w-full rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-sc-primary shadow-[0_0_8px_rgba(197,5,12,0.5)]"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        )}
      </div>
    </SCGlassCard>
  );
}
