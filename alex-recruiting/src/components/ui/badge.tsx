import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-slate-900 text-slate-50",
        secondary: "border-transparent bg-slate-100 text-slate-900",
        destructive: "border-transparent bg-red-500 text-slate-50",
        outline: "text-slate-950",
        performance: "border-transparent bg-blue-100 text-blue-800",
        work_ethic: "border-transparent bg-orange-100 text-orange-800",
        character: "border-transparent bg-green-100 text-green-800",
        tier1: "border-[rgba(15,40,75,0.12)] bg-[rgba(15,40,75,0.08)] text-[var(--app-navy-strong)]",
        tier2: "border-blue-200 bg-blue-50 text-blue-700",
        tier3: "border-green-200 bg-green-50 text-green-700",
        draft: "border-yellow-200 bg-yellow-50 text-yellow-700",
        approved: "border-blue-200 bg-blue-50 text-blue-700",
        posted: "border-green-200 bg-green-50 text-green-700",
        rejected: "border-red-200 bg-red-50 text-red-700",
        sent: "border-emerald-200 bg-emerald-50 text-emerald-700",
        responded: "border-teal-200 bg-teal-50 text-teal-700",
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
