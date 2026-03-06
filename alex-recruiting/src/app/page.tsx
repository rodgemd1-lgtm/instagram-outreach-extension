"use client";

import { AlexChat } from "@/components/alex-chat";
import { RecruitingFeed } from "@/components/recruiting-feed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { targetSchools } from "@/lib/data/target-schools";
import { getTodayEntry } from "@/lib/data/weekly-calendar";
import { getPillarLabel, getPillarColor, cn } from "@/lib/utils";
import { Calendar, Users } from "lucide-react";

export default function DashboardPage() {
  const today = getTodayEntry();
  const tier1 = targetSchools.filter((s) => s.priorityTier === "Tier 1").length;
  const tier2 = targetSchools.filter((s) => s.priorityTier === "Tier 2").length;
  const tier3 = targetSchools.filter((s) => s.priorityTier === "Tier 3").length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
      {/* Left Column — Alex Chat */}
      <div className="lg:col-span-2 order-2 lg:order-1">
        <AlexChat />
      </div>

      {/* Right Column — Intelligence Feed + Quick Stats */}
      <div className="space-y-4 md:space-y-6 order-1 lg:order-2">
        {/* Today's Content */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Today&apos;s Post
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              <div className={cn("h-2.5 w-2.5 rounded-full", getPillarColor(today.pillar))} />
              <Badge variant={today.pillar as "performance" | "work_ethic" | "character"}>
                {getPillarLabel(today.pillar)}
              </Badge>
            </div>
            <p className="text-sm text-slate-700">{today.contentType}</p>
            <p className="text-xs text-slate-500 mt-1">Best time: {today.bestTime}</p>
            <p className="text-xs text-slate-400 mt-1">{today.notes}</p>
          </CardContent>
        </Card>

        {/* Target School Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              Target Schools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-lg font-bold text-purple-600">{tier1}</p>
                <p className="text-[10px] text-slate-500">Tier 1 (Reach)</p>
              </div>
              <div>
                <p className="text-lg font-bold text-blue-600">{tier2}</p>
                <p className="text-[10px] text-slate-500">Tier 2 (Target)</p>
              </div>
              <div>
                <p className="text-lg font-bold text-green-600">{tier3}</p>
                <p className="text-[10px] text-slate-500">Tier 3 (Safety)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Double Black Box Phase Tracker */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Double Black Box Phase</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { phase: "01 Scout", status: "completed" },
                { phase: "02 Define", status: "completed" },
                { phase: "GATE", status: "completed" },
                { phase: "03 Build", status: "active" },
                { phase: "04 Grow", status: "pending" },
                { phase: "05 Amplify", status: "pending" },
                { phase: "06 Measure", status: "pending" },
              ].map((item) => (
                <div key={item.phase} className="flex items-center gap-2">
                  <div
                    className={cn(
                      "h-2 w-2 rounded-full",
                      item.status === "completed" ? "bg-green-500" :
                      item.status === "active" ? "bg-blue-500 animate-pulse" :
                      "bg-slate-200"
                    )}
                  />
                  <span className={cn(
                    "text-xs",
                    item.status === "active" ? "font-semibold text-blue-600" :
                    item.status === "completed" ? "text-green-600" :
                    "text-slate-400"
                  )}>
                    {item.phase}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recruiting Feed */}
        <RecruitingFeed />
      </div>
    </div>
  );
}
