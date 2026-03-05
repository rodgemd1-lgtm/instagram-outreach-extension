"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TargetSchool } from "@/lib/data/target-schools";

export function SchoolCard({ school }: { school: TargetSchool }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-sm">{school.name}</h3>
            <p className="text-xs text-slate-500">{school.division} — {school.conference}</p>
          </div>
          <Badge
            variant={school.priorityTier === "Tier 1" ? "tier1" : school.priorityTier === "Tier 2" ? "tier2" : "tier3"}
          >
            {school.priorityTier}
          </Badge>
        </div>
        <p className="text-xs text-slate-600 mb-2">{school.whyJacob}</p>
        <p className="text-xs text-slate-500 italic">{school.olNeedSignal}</p>
        <div className="flex items-center justify-between mt-3 pt-2 border-t">
          <span className="text-[10px] text-slate-400">DM: {school.dmTimeline}</span>
          {school.officialXHandle && (
            <span className="text-[10px] text-blue-600">{school.officialXHandle}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
