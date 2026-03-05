"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, RefreshCw, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuditResult {
  audit: {
    photoQuality: boolean;
    headerImage: boolean;
    bioCompleteness: boolean;
    pinnedPost: boolean;
    postCadence: boolean;
    pillarDistribution: boolean;
    engagementRate: boolean;
    coachFollowCount: boolean;
    dmLog: boolean;
    constitutionCompliance: boolean;
    totalScore: number;
    recommendations: string[];
  };
  interpretation: {
    label: string;
    description: string;
    color: string;
  };
}

const auditItems = [
  { key: "photoQuality", label: "Profile Photo Quality", description: "High-resolution, professional, athletic (400x400px min)" },
  { key: "headerImage", label: "Header Image", description: "Action shot with text overlay, current" },
  { key: "bioCompleteness", label: "Bio Completeness", description: "Position, size, school, class year, GPA, NCSA link, film link" },
  { key: "pinnedPost", label: "Pinned Post", description: "Current film (within 90 days), native video, all hashtags" },
  { key: "postCadence", label: "Post Cadence", description: "4+ posts per week over the last 30 days" },
  { key: "pillarDistribution", label: "Pillar Distribution", description: "At least 1 post per pillar per week" },
  { key: "engagementRate", label: "Engagement Rate", description: "Average engagement > 4% across last 10 posts" },
  { key: "coachFollowCount", label: "Coach Follows", description: "5+ coaches following Jacob" },
  { key: "dmLog", label: "DM Activity", description: "At least 2 DMs sent to target coaches in last 30 days" },
  { key: "constitutionCompliance", label: "Constitution Compliance", description: "Zero constitution violations in the last 30 days" },
];

export function ProfileAudit() {
  const [result, setResult] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function runAudit() {
    setLoading(true);
    try {
      const res = await fetch("/api/audit");
      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error("Audit failed:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    runAudit();
  }, []);

  return (
    <div className="space-y-6">
      {/* Score Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Profile Audit Score</h2>
              <p className="text-sm text-slate-500">10-point evaluation of Jacob&apos;s recruiting profile</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className={cn("text-5xl font-bold", result?.interpretation.color || "text-slate-300")}>
                  {result?.audit.totalScore ?? "—"}
                </p>
                <p className="text-xs text-slate-500 mt-1">out of 10</p>
              </div>
              <Button variant="outline" size="sm" onClick={runAudit} disabled={loading}>
                <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                Re-run
              </Button>
            </div>
          </div>
          {result && (
            <div className={cn("mt-4 rounded-lg p-3", result.interpretation.color.replace("text-", "bg-").replace("600", "50"))}>
              <p className={cn("text-sm font-medium", result.interpretation.color)}>
                {result.interpretation.label}: {result.interpretation.description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Audit Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {auditItems.map((item) => {
              const passed = result?.audit[item.key as keyof typeof result.audit] as boolean;
              return (
                <div key={item.key} className="flex items-start gap-3 py-2 border-b last:border-b-0">
                  {passed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className={cn("text-sm font-medium", passed ? "text-green-700" : "text-slate-700")}>
                      {item.label}
                    </p>
                    <p className="text-xs text-slate-500">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {result && result.audit.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              Improvement Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {result.audit.recommendations.map((rec, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <span className="text-slate-400 shrink-0">{i + 1}.</span>
                  <p className="text-slate-700">{rec}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
