import * as React from "react";
import { cn } from "@/lib/utils";

export interface StitchInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const StitchInput = React.forwardRef<HTMLInputElement, StitchInputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[#C5050C]/40 focus:outline-none focus:ring-1 focus:ring-[#C5050C]/20 disabled:cursor-not-allowed disabled:opacity-40",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
StitchInput.displayName = "StitchInput";

export { StitchInput };
