"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface StitchTabsProps {
  tabs: { value: string; label: string }[];
  defaultValue?: string;
  onChange?: (value: string) => void;
  children: (activeTab: string) => React.ReactNode;
  className?: string;
}

export function StitchTabs({
  tabs,
  defaultValue,
  onChange,
  children,
  className,
}: StitchTabsProps) {
  const [active, setActive] = useState(defaultValue || tabs[0]?.value || "");

  function handleChange(value: string) {
    setActive(value);
    onChange?.(value);
  }

  return (
    <div className={className}>
      <div className="flex gap-1 rounded-lg bg-white/[0.03] p-1">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleChange(tab.value)}
            className={cn(
              "rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all",
              active === tab.value
                ? "bg-[#C5050C] text-white shadow-lg shadow-[#C5050C]/20"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4">{children(active)}</div>
    </div>
  );
}
