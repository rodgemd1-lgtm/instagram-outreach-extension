import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface SCButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const variantStyles: Record<NonNullable<SCButtonProps["variant"]>, string> = {
  primary:
    "bg-sc-primary hover:bg-sc-primary/90 text-white shadow-xl shadow-sc-primary-glow font-bold",
  secondary:
    "bg-sc-surface hover:bg-sc-surface/80 text-white border border-sc-border-strong font-bold",
  ghost: "bg-transparent hover:bg-white/5 text-slate-400 hover:text-white",
  danger: "bg-red-600 hover:bg-red-700 text-white font-bold",
};

const sizeStyles: Record<NonNullable<SCButtonProps["size"]>, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

export const SCButton = forwardRef<HTMLButtonElement, SCButtonProps>(
  function SCButton(
    { variant = "primary", size = "md", className, children, ...props },
    ref
  ) {
    return (
      <button
        ref={ref}
        className={cn(
          "rounded-lg transition-all inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
