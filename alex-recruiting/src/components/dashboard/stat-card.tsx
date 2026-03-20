"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number | null;
  change?: string | null;
  changeType?: "up" | "down" | "neutral";
  icon?: LucideIcon;
}

export function StatCard({ label, value, change, changeType = "neutral", icon: Icon }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{value ?? "—"}</p>
            {change && (
              <p className={`text-xs mt-1 ${changeType === "up" ? "text-green-600" : changeType === "down" ? "text-red-600" : "text-muted-foreground"}`}>
                {change}
              </p>
            )}
          </div>
          {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
        </div>
      </CardContent>
    </Card>
  );
}
