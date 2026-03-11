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
    <div className="rounded-xl border border-dash-border bg-dash-surface p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-dash-muted">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-dash-text">
            {value}
          </p>
          {change && (
            <p
              className={cn(
                "mt-1 text-xs font-medium",
                changeType === "up" && "text-dash-success",
                changeType === "down" && "text-dash-danger",
                changeType === "neutral" && "text-dash-muted"
              )}
            >
              {change}
            </p>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-dash-accent/10">
          <Icon className="h-5 w-5 text-dash-accent" />
        </div>
      </div>
    </div>
  );
}
