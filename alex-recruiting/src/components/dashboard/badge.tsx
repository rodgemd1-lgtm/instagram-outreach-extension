import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "accent" | "muted";

const variants: Record<BadgeVariant, string> = {
  default: "bg-dash-surface-raised text-dash-text-secondary",
  success: "bg-dash-success/15 text-dash-success",
  warning: "bg-dash-warning/15 text-dash-warning",
  danger: "bg-dash-danger/15 text-dash-danger",
  accent: "bg-dash-accent/15 text-dash-accent",
  muted: "bg-dash-surface-raised text-dash-muted",
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
