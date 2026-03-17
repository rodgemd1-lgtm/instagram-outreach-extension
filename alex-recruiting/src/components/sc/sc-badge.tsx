import { cn } from "@/lib/utils";

interface SCBadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "danger" | "warning" | "info" | "primary";
  className?: string;
}

const variantStyles: Record<NonNullable<SCBadgeProps["variant"]>, string> = {
  default: "bg-white/10 text-white ring-white/20",
  success: "bg-emerald-500/10 text-emerald-500 ring-emerald-500/30",
  danger: "bg-red-500/10 text-red-500 ring-red-500/30",
  warning: "bg-yellow-500/10 text-yellow-500 ring-yellow-500/30",
  info: "bg-blue-500/10 text-blue-500 ring-blue-500/30",
  primary: "bg-sc-primary/10 text-sc-primary ring-sc-primary/30",
};

export function SCBadge({
  children,
  variant = "default",
  className,
}: SCBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center text-[10px] font-black uppercase px-2 py-1 rounded ring-1",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
