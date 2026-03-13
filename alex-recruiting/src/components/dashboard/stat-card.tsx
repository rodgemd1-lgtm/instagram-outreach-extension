"use client";

import { type LucideIcon } from "lucide-react";
import { AnimatedNumber } from "./animated-number";

interface StatCardProps {
  label: string;
  value: number | string | null | undefined;
  change?: string | null;
  changeType?: "up" | "down" | "neutral";
  icon: LucideIcon;
}

export function StatCard({ label, value, change, changeType, icon: Icon }: StatCardProps) {
  const hasValue = value !== null && value !== undefined && value !== "";
  const isNumeric = hasValue && typeof value === "number";

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[#6B7280]">{label}</p>
          <div className="mt-1">
            {hasValue ? (
              <span className="font-mono text-2xl font-bold text-[#0F1720]">
                {isNumeric ? <AnimatedNumber value={value as number} /> : value}
              </span>
            ) : (
              <span className="font-mono text-2xl font-bold text-[#D1D5DB]">&mdash;</span>
            )}
          </div>
          {change && (
            <p className={`text-xs mt-1 ${
              changeType === "up" ? "text-[#16A34A]" :
              changeType === "down" ? "text-[#DC2626]" :
              "text-[#9CA3AF]"
            }`}>
              {changeType === "up" && "\u2191 "}
              {changeType === "down" && "\u2193 "}
              {change}
            </p>
          )}
        </div>
        <div className="p-2 rounded-lg bg-[#F5F5F4]">
          <Icon className="w-5 h-5 text-[#6B7280]" />
        </div>
      </div>
    </div>
  );
}
