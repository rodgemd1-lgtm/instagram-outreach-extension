import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[var(--app-navy-strong)] text-white shadow-sm hover:bg-[var(--app-navy)]",
        destructive: "bg-red-500 text-slate-50 hover:bg-red-500/90",
        outline: "border border-[rgba(15,40,75,0.12)] bg-white/80 text-[var(--app-navy-strong)] hover:bg-white hover:text-[var(--app-navy)]",
        secondary: "bg-[rgba(200,155,60,0.12)] text-[var(--app-navy-strong)] hover:bg-[rgba(200,155,60,0.2)]",
        ghost: "hover:bg-[rgba(15,40,75,0.06)] hover:text-[var(--app-navy-strong)]",
        link: "text-[var(--app-navy-strong)] underline-offset-4 hover:underline",
        success: "bg-green-600 text-white hover:bg-green-600/90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
