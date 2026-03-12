import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: "up" | "down" | "neutral";
  icon: LucideIcon;
}

export function StatCard({
  label,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-white/5 bg-[#0A0A0A] p-5 transition-colors hover:bg-[#111111]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">{label}</p>
          <p className="mt-2 font-jetbrains text-3xl font-bold tracking-tight text-white">
            {value}
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
              {change}
            </p>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ff000c]/10">
          <Icon className="h-5 w-5 text-[#ff000c]" />
        </div>
      </div>
    </div>
  );
}
