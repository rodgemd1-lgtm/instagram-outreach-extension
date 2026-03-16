import { cn } from "@/lib/utils";
import { GlassCard } from "./glass-card";

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

export function StatCard({ label, value, trend, trendUp, className }: StatCardProps) {
  return (
    <GlassCard className={cn("p-4", className)}>
      <p className="stitch-label">{label}</p>
      <p className="mt-2 text-3xl font-black tracking-tight text-white">
        {value}
      </p>
      {trend && (
        <p
          className={cn(
            "mt-1 text-xs font-semibold",
            trendUp ? "text-[#0bda7d]" : "text-[#C5050C]"
          )}
        >
          {trend}
        </p>
      )}
    </GlassCard>
  );
}
