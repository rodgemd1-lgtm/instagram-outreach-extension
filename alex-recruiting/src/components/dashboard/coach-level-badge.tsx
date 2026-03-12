"use client";

interface CoachLevelBadgeProps {
  level: 0 | 1 | 2 | 3 | 4 | 5;
  label: string;
  color: string;
  size?: "sm" | "md";
  className?: string;
}

export function CoachLevelBadge({ level, label, color, size = "sm", className = "" }: CoachLevelBadgeProps) {
  const sizeClasses = size === "sm"
    ? "h-5 px-1.5 text-[10px] gap-1"
    : "h-6 px-2 text-[11px] gap-1.5";

  return (
    <div
      className={`inline-flex items-center rounded-full border ${className}`}
      style={{ borderColor: `${color}40`, backgroundColor: `${color}10` }}
    >
      <div className={`flex items-center ${sizeClasses}`}>
        <span
          className="font-mono font-bold"
          style={{ color }}
        >
          L{level}
        </span>
        <span className="text-white/50">{label}</span>
      </div>
    </div>
  );
}
