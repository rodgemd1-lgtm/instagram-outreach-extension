import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-black",
  {
    variants: {
      variant: {
        default: "border-white/10 bg-white/5 text-white/60",
        secondary: "border-white/10 bg-white/5 text-white/60",
        destructive: "border-[#EF4444]/20 bg-[#EF4444]/10 text-[#EF4444]",
        outline: "border-white/10 text-white/60",
        performance: "border-[#3B82F6]/20 bg-[#3B82F6]/10 text-[#3B82F6]",
        work_ethic: "border-[#F59E0B]/20 bg-[#F59E0B]/10 text-[#F59E0B]",
        character: "border-[#22C55E]/20 bg-[#22C55E]/10 text-[#22C55E]",
        tier1: "border-[#ff000c]/20 bg-[#ff000c]/10 text-[#ff000c]",
        tier2: "border-[#D4A853]/20 bg-[#D4A853]/10 text-[#D4A853]",
        tier3: "border-white/10 bg-white/5 text-white/60",
        draft: "border-[#F59E0B]/20 bg-[#F59E0B]/10 text-[#F59E0B]",
        approved: "border-[#3B82F6]/20 bg-[#3B82F6]/10 text-[#3B82F6]",
        posted: "border-[#22C55E]/20 bg-[#22C55E]/10 text-[#22C55E]",
        rejected: "border-[#EF4444]/20 bg-[#EF4444]/10 text-[#EF4444]",
        sent: "border-[#22C55E]/20 bg-[#22C55E]/10 text-[#22C55E]",
        responded: "border-[#14B8A6]/20 bg-[#14B8A6]/10 text-[#14B8A6]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
