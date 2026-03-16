import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const stitchButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5050C]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        pirate:
          "pirate-gradient text-white shadow-lg shadow-[#C5050C]/20 hover:shadow-[#C5050C]/40 hover:brightness-110 active:scale-[0.97]",
        ghost:
          "text-white/60 hover:bg-white/5 hover:text-white",
        outline:
          "border border-white/10 text-white/70 hover:border-white/20 hover:bg-white/5 hover:text-white",
        terminal:
          "border border-[#0bda7d]/30 bg-[#0bda7d]/10 font-mono text-[#0bda7d] hover:bg-[#0bda7d]/20",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "pirate",
      size: "default",
    },
  }
);

export interface StitchButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof stitchButtonVariants> {
  asChild?: boolean;
}

const StitchButton = React.forwardRef<HTMLButtonElement, StitchButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(stitchButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
StitchButton.displayName = "StitchButton";

export { StitchButton, stitchButtonVariants };
