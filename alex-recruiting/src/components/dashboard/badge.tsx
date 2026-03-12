import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "accent" | "muted";

const variants: Record<BadgeVariant, string> = {
  default: "bg-white/5 text-white/60 border border-white/10",
  success: "bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20",
  warning: "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20",
  danger: "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20",
  accent: "bg-[#ff000c]/10 text-[#ff000c] border border-[#ff000c]/20",
  muted: "bg-white/5 text-white/40 border border-white/5",
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
