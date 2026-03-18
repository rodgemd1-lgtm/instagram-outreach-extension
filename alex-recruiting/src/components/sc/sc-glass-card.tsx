import { cn } from "@/lib/utils";

interface SCGlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "strong" | "broadcast";
}

const variantStyles: Record<NonNullable<SCGlassCardProps["variant"]>, string> = {
  default:
    "bg-sc-surface-glass backdrop-blur-[12px] border border-sc-border rounded-xl",
  strong:
    "bg-[rgba(26,19,19,0.8)] backdrop-blur-[12px] border border-sc-border-strong rounded-xl",
  broadcast:
    "bg-sc-surface-glass backdrop-blur-[12px] border border-sc-border rounded-xl border-l-4 border-l-sc-primary",
};

export function SCGlassCard({
  children,
  className,
  variant = "default",
  ...props
}: SCGlassCardProps) {
  return (
    <div className={cn(variantStyles[variant], className)} {...props}>{children}</div>
  );
}
