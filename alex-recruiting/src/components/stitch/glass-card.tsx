import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export function GlassCard({ children, className, glow }: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/5 bg-[rgba(20,20,20,0.4)] backdrop-blur-[12px]",
        glow && "stitch-glow-border",
        className
      )}
    >
      {children}
    </div>
  );
}
