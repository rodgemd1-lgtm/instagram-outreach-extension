import { cn } from "@/lib/utils";

type DotStatus = "replied" | "sent" | "unsent" | "none";

interface EngagementDotProps {
  status: DotStatus;
  label?: string;
  className?: string;
}

const statusColors: Record<DotStatus, string> = {
  replied: "bg-[#0bda7d]",
  sent: "bg-[#00f2ff]",
  unsent: "bg-white/15",
  none: "bg-white/5",
};

const statusLabels: Record<DotStatus, string> = {
  replied: "Replied",
  sent: "Sent",
  unsent: "Unsent",
  none: "N/A",
};

export function EngagementDot({ status, label, className }: EngagementDotProps) {
  const displayLabel = label ?? statusLabels[status];
  return (
    <div className={cn("flex items-center gap-1.5", className)} role="status" aria-label={`Engagement: ${displayLabel}`}>
      <span className={cn("h-2 w-2 rounded-full", statusColors[status])} aria-hidden="true" />
      <span className="text-[10px] text-white/40">
        {displayLabel}
      </span>
    </div>
  );
}
