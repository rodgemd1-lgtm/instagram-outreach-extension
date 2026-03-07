"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, Mail, BarChart3, Eye, TrendingUp, Target, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalyticsData {
  current: {
    totalFollowers: number;
    coachFollows: number;
    dmsSent: number;
    dmResponseRate: number;
    postsPublished: number;
    avgEngagementRate: number;
    profileVisits: number;
    auditScore: number;
  };
  targets: {
    month1: Record<string, number>;
    month3: Record<string, number>;
    month6: Record<string, number>;
  };
}

const metricCards = [
  { key: "totalFollowers", label: "Total Followers", icon: Users, targetKey: "followers", color: "text-blue-600" },
  { key: "coachFollows", label: "Coach Follows", icon: UserCheck, targetKey: "coachFollows", color: "text-green-600" },
  { key: "dmsSent", label: "DMs Sent", icon: Mail, targetKey: "dmsSent", color: "text-purple-600" },
  { key: "dmResponseRate", label: "DM Response Rate", icon: Target, targetKey: "dmResponseRate", suffix: "%", color: "text-orange-600" },
  { key: "postsPublished", label: "Posts Published", icon: BarChart3, targetKey: "posts", color: "text-indigo-600" },
  { key: "avgEngagementRate", label: "Avg Engagement", icon: TrendingUp, targetKey: "engagementRate", suffix: "%", color: "text-emerald-600" },
  { key: "profileVisits", label: "Profile Visits", icon: Eye, targetKey: "profileVisits", color: "text-pink-600" },
  { key: "auditScore", label: "Audit Score", icon: ShieldCheck, targetKey: "auditScore", suffix: "/10", color: "text-amber-600" },
];

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) return <div className="text-sm text-slate-500">Loading analytics...</div>;

  return (
    <div className="space-y-6">
      {/* Current Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {metricCards.map((metric) => {
          const value = data.current[metric.key as keyof typeof data.current] || 0;
          const target1 = data.targets.month1[metric.targetKey] || 0;
          const Icon = metric.icon;

          return (
            <Card key={metric.key}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Icon className={cn("h-4 w-4", metric.color)} />
                  <Badge variant="secondary" className="text-[10px]">
                    Target: {target1}{metric.suffix || ""}
                  </Badge>
                </div>
                <p className={cn("text-2xl font-bold", metric.color)}>
                  {value}{metric.suffix || ""}
                </p>
                <p className="text-xs text-slate-500">{metric.label}</p>
                <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100">
                  <div
                    className={cn("h-1.5 rounded-full", metric.color.replace("text-", "bg-"))}
                    style={{ width: `${Math.min((value / (target1 || 1)) * 100, 100)}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Target Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recruiting Scorecard — Target Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4 font-medium text-slate-500">Metric</th>
                  <th className="text-center py-2 px-4 font-medium text-slate-500">Current</th>
                  <th className="text-center py-2 px-4 font-medium text-blue-500">Month 1</th>
                  <th className="text-center py-2 px-4 font-medium text-purple-500">Month 3</th>
                  <th className="text-center py-2 px-4 font-medium text-green-500">Month 6</th>
                </tr>
              </thead>
              <tbody>
                {metricCards.map((metric) => {
                  const current = data.current[metric.key as keyof typeof data.current] || 0;
                  const t1 = data.targets.month1[metric.targetKey] || 0;
                  const t3 = data.targets.month3[metric.targetKey] || 0;
                  const t6 = data.targets.month6[metric.targetKey] || 0;
                  const s = metric.suffix || "";
                  return (
                    <tr key={metric.key} className="border-b last:border-b-0">
                      <td className="py-2 pr-4 font-medium">{metric.label}</td>
                      <td className="text-center py-2 px-4">{current}{s}</td>
                      <td className="text-center py-2 px-4 text-blue-600">{t1}+{s}</td>
                      <td className="text-center py-2 px-4 text-purple-600">{t3}+{s}</td>
                      <td className="text-center py-2 px-4 text-green-600">{t6}+{s}</td>
                    </tr>
                  );
                })}
                <tr>
                  <td className="py-2 pr-4 font-medium">Constitution Violations</td>
                  <td className="text-center py-2 px-4">0</td>
                  <td className="text-center py-2 px-4 text-blue-600">0</td>
                  <td className="text-center py-2 px-4 text-purple-600">0</td>
                  <td className="text-center py-2 px-4 text-green-600">0</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
