"use client";

import { cn } from "@/lib/utils";

interface SCTabsProps {
  tabs: { label: string; value: string }[];
  activeTab: string;
  onTabChange: (value: string) => void;
  className?: string;
}

export function SCTabs({
  tabs,
  activeTab,
  onTabChange,
  className,
}: SCTabsProps) {
  return (
    <div className={cn("flex flex-row gap-4", className)} role="tablist">
      {tabs.map((tab) => {
        const isActive = tab.value === activeTab;
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.value)}
            className={cn(
              "text-xs font-bold uppercase pb-1 transition-colors",
              isActive
                ? "text-sc-primary border-b-2 border-sc-primary"
                : "text-slate-500 hover:text-white"
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
