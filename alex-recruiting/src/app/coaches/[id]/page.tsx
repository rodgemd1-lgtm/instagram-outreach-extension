"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { StudioPageHeader } from "@/components/studio-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ArrowLeft, Loader2 } from "lucide-react";

interface CoachPersona {
  schoolId: string;
  schoolName: string;
  division: string;
  conference: string;
  priorityTier: string;
  communicationStyle: string;
  recruitingPriorities: string[];
  bestApproachMethod: string;
  bestApproachSteps: string[];
  engagementStrategy: string;
  dmOpenProbability: number;
  followBackProbability: number;
  estimatedResponseRate: number;
  optimalContactMonths: number[];
  optimalContactHours: number[];
  personaSource: "ai" | "deterministic";
}

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatHour(h: number): string {
  if (h === 0) return "12 AM";
  if (h === 12) return "12 PM";
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
}

function ProbabilityBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const pct = Math.round(value * 100);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-600">{label}</span>
        <span className="font-semibold text-[var(--app-navy-strong)]">
          {pct}%
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-100">
        <div
          className="h-2 rounded-full bg-[var(--app-navy-strong)] transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function CoachDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [persona, setPersona] = useState<CoachPersona | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPersona() {
      try {
        const res = await fetch(
          `/api/coaches/personas?schoolId=${encodeURIComponent(id)}`
        );
        const data = await res.json();
        if (data.persona) {
          setPersona(data.persona);
        } else {
          setError("No persona data found for this school.");
        }
      } catch (err) {
        console.error("Failed to fetch persona:", err);
        setError("Failed to load coach intelligence data.");
      } finally {
        setLoading(false);
      }
    }
    fetchPersona();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/coaches")}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          <span className="ml-3 text-slate-500">Loading coach profile...</span>
        </div>
      </div>
    );
  }

  if (error || !persona) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/coaches")}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-sm text-slate-500">
              {error ||
                "No intelligence data yet. Run 'Research' from the Coach Pipeline to gather data."}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => router.push("/coaches")}
            >
              Go to Coach Pipeline
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tierVariant =
    persona.priorityTier === "Tier 1"
      ? "tier1"
      : persona.priorityTier === "Tier 2"
        ? "tier2"
        : "tier3";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/coaches")}
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </Button>
      </div>

      <StudioPageHeader
        icon="Brain"
        kicker={`Coach Intelligence + ${persona.schoolName}`}
        title={persona.schoolName}
        description={`${persona.division} - ${persona.conference} | ${persona.priorityTier} | Communication: ${persona.communicationStyle.replace(/_/g, " ")}`}
        council={["Nina", "Marcus", "Sophie"]}
      />

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="x-activity">X Activity</TabsTrigger>
          <TabsTrigger value="outreach">Outreach History</TabsTrigger>
          <TabsTrigger value="actions">Recommended Actions</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">School Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">School</span>
                  <span className="text-sm font-medium">
                    {persona.schoolName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Division</span>
                  <span className="text-sm font-medium">
                    {persona.division}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Conference</span>
                  <span className="text-sm font-medium">
                    {persona.conference}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Priority Tier</span>
                  <Badge variant={tierVariant as "tier1" | "tier2" | "tier3"}>
                    {persona.priorityTier}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Communication Style
                  </span>
                  <span className="text-sm font-medium capitalize">
                    {persona.communicationStyle.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Persona Source</span>
                  <Badge
                    variant={
                      persona.personaSource === "ai" ? "approved" : "draft"
                    }
                  >
                    {persona.personaSource === "ai"
                      ? "AI-Generated"
                      : "Deterministic"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Response Probabilities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ProbabilityBar
                  label="DM Open Probability"
                  value={persona.dmOpenProbability}
                />
                <ProbabilityBar
                  label="Follow-Back Probability"
                  value={persona.followBackProbability}
                />
                <ProbabilityBar
                  label="Estimated Response Rate"
                  value={persona.estimatedResponseRate}
                />
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">
                  Recruiting Priorities
                </CardTitle>
              </CardHeader>
              <CardContent>
                {persona.recruitingPriorities.length > 0 ? (
                  <ul className="space-y-2">
                    {persona.recruitingPriorities.map((priority, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-sm text-slate-700"
                      >
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--app-navy-strong)]" />
                        {priority}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">
                    No recruiting priority data available yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* X Activity Tab */}
        <TabsContent value="x-activity">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Optimal Contact Windows
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Best Months
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {persona.optimalContactMonths.length > 0 ? (
                      persona.optimalContactMonths.map((month) => (
                        <Badge key={month} variant="outline" className="bg-white text-[var(--app-navy-strong)] border-[rgba(15,40,75,0.15)]">
                          {MONTH_NAMES[month - 1]}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-slate-400">
                        No data available
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Peak Hours
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {persona.optimalContactHours.length > 0 ? (
                      persona.optimalContactHours.map((hour) => (
                        <Badge key={hour} variant="outline" className="bg-white text-[var(--app-navy-strong)] border-[rgba(15,40,75,0.15)]">
                          {formatHour(hour)}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-slate-400">
                        No data available
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Engagement Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Communication Style
                  </span>
                  <span className="text-sm font-medium capitalize">
                    {persona.communicationStyle.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    DM Open Likelihood
                  </span>
                  <span className="text-sm font-medium">
                    {Math.round(persona.dmOpenProbability * 100)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Follow-Back Rate
                  </span>
                  <span className="text-sm font-medium">
                    {Math.round(persona.followBackProbability * 100)}%
                  </span>
                </div>
                <p className="mt-4 text-xs text-slate-400 italic">
                  Run X scrape from the Coach Pipeline to populate live tweet
                  frequency, content themes, and hashtag data.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Outreach History Tab */}
        <TabsContent value="outreach">
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-sm text-slate-500">
                No outreach history recorded yet for {persona.schoolName}.
              </p>
              <p className="mt-2 text-xs text-slate-400">
                Interactions such as follows, DMs, and engagements will appear
                here once tracked.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommended Actions Tab */}
        <TabsContent value="actions">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">
                  Best Approach Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700">
                  {persona.bestApproachMethod}
                </p>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">
                  Step-by-Step Action Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                {persona.bestApproachSteps.length > 0 ? (
                  <ol className="space-y-3">
                    {persona.bestApproachSteps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--app-navy-strong)] text-xs font-semibold text-white">
                          {idx + 1}
                        </span>
                        <span className="text-sm text-slate-700">{step}</span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-sm text-slate-500">
                    No action steps generated yet. Run persona generation from
                    the Coach Pipeline.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">
                  Engagement Strategy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700">
                  {persona.engagementStrategy || "No strategy data available."}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
