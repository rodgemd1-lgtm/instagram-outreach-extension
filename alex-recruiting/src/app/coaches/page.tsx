"use client";

import { useState } from "react";
import { CoachCRM } from "@/components/coach-crm";
import { CoachPipeline } from "@/components/coach-pipeline";
import { SchoolCard } from "@/components/school-card";
import { StudioPageHeader } from "@/components/studio-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSchoolsByTier } from "@/lib/data/target-schools";
import type { TargetSchool } from "@/lib/data/target-schools";
import { Loader2, Search } from "lucide-react";
import Link from "next/link";

// Persona completeness: 0% = no data, 33% = basic info, 66% = X data, 100% = full persona
function PersonaCompletenessIndicator({
  school,
  personaStatus,
}: {
  school: TargetSchool;
  personaStatus: Record<string, number>;
}) {
  const completeness = personaStatus[school.id] ?? 0;

  const label =
    completeness === 0
      ? "No data"
      : completeness <= 33
        ? "Basic"
        : completeness <= 66
          ? "X Data"
          : "Full Persona";

  const colorClass =
    completeness === 0
      ? "bg-slate-200"
      : completeness <= 33
        ? "bg-amber-400"
        : completeness <= 66
          ? "bg-blue-400"
          : "bg-emerald-500";

  return (
    <div className="flex items-center gap-2 mt-2">
      <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${colorClass}`}
          style={{ width: `${completeness}%` }}
        />
      </div>
      <span className="text-[10px] text-slate-400 whitespace-nowrap">
        {label}
      </span>
    </div>
  );
}

export default function CoachesPage() {
  const [researchLoading, setResearchLoading] = useState(false);
  const [researchResult, setResearchResult] = useState<{
    schoolsResearched: number;
    totalCoachesFound: number;
    totalArticlesFound: number;
  } | null>(null);
  const [personaStatus, setPersonaStatus] = useState<Record<string, number>>(
    {}
  );

  async function handleResearchAll() {
    setResearchLoading(true);
    setResearchResult(null);
    try {
      // Step 1: Research all schools
      const researchRes = await fetch("/api/coaches/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const researchData = await researchRes.json();

      if (researchData.success) {
        setResearchResult(researchData.summary);

        // Update persona status based on research results
        const newStatus: Record<string, number> = { ...personaStatus };
        for (const result of researchData.results || []) {
          // Basic info gathered = 33%
          newStatus[result.schoolId] = Math.max(
            newStatus[result.schoolId] || 0,
            33
          );
        }
        setPersonaStatus(newStatus);
      }

      // Step 2: Generate personas
      try {
        const personaRes = await fetch("/api/coaches/personas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        const personaData = await personaRes.json();

        if (personaData.success && personaData.personas) {
          const updatedStatus: Record<string, number> = { ...personaStatus };
          for (const persona of personaData.personas) {
            // Full persona = 100%
            updatedStatus[persona.schoolId] = 100;
          }
          setPersonaStatus(updatedStatus);
        }
      } catch (personaErr) {
        console.error("Persona generation failed:", personaErr);
      }
    } catch (err) {
      console.error("Research failed:", err);
    } finally {
      setResearchLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <StudioPageHeader
        icon="Users"
        kicker="Dashboard Studio + Susan"
        title="Run the coach pipeline with clear stages, not scattered names and loose notes."
        description="This is the relationship map for target programs. Prioritize the right schools, enrich the right coaches, and keep the next action obvious."
        council={["Susan", "Dashboard", "Marcus"]}
      >
        <p className="font-semibold">Recruiting ops rule:</p>
        <p className="mt-2 leading-6 text-[var(--app-muted)]">
          Pipeline quality beats raw volume. A smaller list with real signals, X handles, and next actions is worth more than a bloated list of dead rows.
        </p>
      </StudioPageHeader>

      {/* Research All Action Bar */}
      <div className="flex items-center gap-4">
        <Button
          onClick={handleResearchAll}
          disabled={researchLoading}
          variant="default"
          size="sm"
        >
          {researchLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Researching...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Research All Schools
            </>
          )}
        </Button>
        {researchResult && (
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <Badge variant="approved">
              {researchResult.schoolsResearched} schools
            </Badge>
            <span>
              {researchResult.totalCoachesFound} coaches found
            </span>
            <span>
              {researchResult.totalArticlesFound} articles found
            </span>
          </div>
        )}
      </div>

      <Tabs defaultValue="crm">
        <TabsList>
          <TabsTrigger value="crm">CRM Table</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="schools">Target Schools</TabsTrigger>
        </TabsList>

        <TabsContent value="crm">
          <CoachCRM />
        </TabsContent>

        <TabsContent value="pipeline">
          <CoachPipeline />
        </TabsContent>

        <TabsContent value="schools">
          <div className="space-y-6">
            {(["Tier 1", "Tier 2", "Tier 3"] as const).map((tier) => (
              <div key={tier}>
                <h2 className="text-lg font-semibold mb-3">
                  {tier} — {tier === "Tier 1" ? "Reach Programs" : tier === "Tier 2" ? "Target Programs" : "Safety Programs"}
                </h2>
                <div className="grid grid-cols-3 gap-4">
                  {getSchoolsByTier(tier).map((school) => (
                    <Link
                      key={school.id}
                      href={`/coaches/${school.id}`}
                      className="block"
                    >
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-sm">
                                {school.name}
                              </h3>
                              <p className="text-xs text-slate-500">
                                {school.division} — {school.conference}
                              </p>
                            </div>
                            <Badge
                              variant={
                                school.priorityTier === "Tier 1"
                                  ? "tier1"
                                  : school.priorityTier === "Tier 2"
                                    ? "tier2"
                                    : "tier3"
                              }
                            >
                              {school.priorityTier}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-600 mb-2">
                            {school.whyJacob}
                          </p>
                          <p className="text-xs text-slate-500 italic">
                            {school.olNeedSignal}
                          </p>
                          <div className="flex items-center justify-between mt-3 pt-2 border-t">
                            <span className="text-[10px] text-slate-400">
                              DM: {school.dmTimeline}
                            </span>
                            {school.officialXHandle && (
                              <span className="text-[10px] text-blue-600">
                                {school.officialXHandle}
                              </span>
                            )}
                          </div>
                          <PersonaCompletenessIndicator
                            school={school}
                            personaStatus={personaStatus}
                          />
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
