import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const stitchBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
  {
    variants: {
      variant: {
        default: "bg-white/5 text-white/60 border border-white/10",
        red: "bg-[#C5050C]/15 text-[#C5050C] border border-[#C5050C]/20",
        green: "bg-[#0bda7d]/15 text-[#0bda7d] border border-[#0bda7d]/20",
        blue: "bg-[#00f2ff]/15 text-[#00f2ff] border border-[#00f2ff]/20",
        amber: "bg-amber-400/15 text-amber-400 border border-amber-400/20",
        tier1: "bg-[#C5050C]/15 text-[#C5050C] border border-[#C5050C]/20",
        tier2: "bg-amber-400/15 text-amber-400 border border-amber-400/20",
        tier3: "bg-white/5 text-white/50 border border-white/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface StitchBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof stitchBadgeVariants> {
  dot?: boolean;
  dotColor?: string;
}

export function StitchBadge({
  className,
  variant,
  dot,
  dotColor,
  children,
  ...props
}: StitchBadgeProps) {
  return (
    <span
      className={cn(stitchBadgeVariants({ variant, className }))}
      {...props}
    >
      {dot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full", dotColor || "bg-current")}
        />
      )}
      {children}
    </span>
  );
}
