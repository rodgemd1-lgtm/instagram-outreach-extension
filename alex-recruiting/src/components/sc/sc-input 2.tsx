import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface SCInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: string;
  label?: string;
}

export const SCInput = forwardRef<HTMLInputElement, SCInputProps>(
  function SCInput({ icon, label, className, id, ...props }, ref) {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="sc-label mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-400"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span
              className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-500 pointer-events-none"
              aria-hidden="true"
            >
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full bg-white/5 border border-sc-border rounded-lg py-2 text-sm text-white placeholder:text-slate-500",
              "focus:outline-none focus:ring-1 focus:ring-sc-primary/50 focus:border-sc-primary/50",
              "transition-colors",
              icon ? "pl-10 pr-4" : "px-4",
              className
            )}
            {...props}
          />
        </div>
      </div>
    );
  }
);
