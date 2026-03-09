"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Brain,
  Film,
  TrendingUp,
  Users,
  GraduationCap,
  Ruler,
  Target,
  Clock,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Search,
  RefreshCw,
} from "lucide-react";
import { SUSAN_INNOVATION_STUDIO } from "@/lib/media-lab/team";
import { FIVE_YEAR_FUTURE_BACK } from "@/lib/strategy/future-back";
import { cn } from "@/lib/utils";

// ============ TYPES ============

interface IntelligenceScore {
  athleteId: string;
  athleteName: string;
  overallScore: number;
  filmScore: { score: number; hasHudlProfile: boolean; highlightCount: number; filmQualityIndicators: string[] };
  socialPresenceScore: { score: number; followerCount: number; coachFollowerCount: number; postFrequency: number; engagementRate: number };
  recruitingMomentumScore: { score: number; totalOffers: number; d1Offers: number; trendDirection: string };
  academicScore: { score: number; gpa: number | null; academicHighlights: string[] };
  physicalProfileScore: { score: number; height: string; weight: string; meetsD1Threshold: boolean; meetsD2Threshold: boolean; positionFit: string[] };
  tierProjection: { currentTier: string; projectedTier: string; confidence: number; rationale: string };
  recommendations: { priority: string; category: string; title: string; description: string; actionItems: string[] }[];
  dataCompleteness: number;
}

interface RecruitingTimeline {
  currentPhase: string;
  nextMilestone: string;
  daysToNextMilestone: number;
  currentPhaseActions: string[];
}

interface CoachProfile {
  coachName: string;
  schoolName: string;
  division: string;
  engagementStyle: string;
  dmOpenProbability: number;
  followBackProbability: number;
  bestApproachStrategy: { method: string; steps: string[]; estimatedResponseRate: number; timeToFirstResponse: string };
  insights: string[];
}

interface TweetPatternSummary {
  patternType: string;
  confidence: number;
  schoolMentions: string[];
  tweetText: string;
  createdAt: string;
}

// ============ MAIN COMPONENT ============

export function IntelligenceDashboard() {
  const [score, setScore] = useState<IntelligenceScore | null>(null);
  const [timeline, setTimeline] = useState<RecruitingTimeline | null>(null);
  const [coachProfiles, setCoachProfiles] = useState<CoachProfile[]>([]);
  const [patterns, setPatterns] = useState<TweetPatternSummary[]>([]);
  const [hudlUrl, setHudlUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "film" | "coaches" | "patterns" | "timeline" | "future_back">("overview");

  async function runAnalysis() {
    setLoading(true);
    try {
      const res = await fetch("/api/intelligence/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          athleteId: "jacob-rogers",
          athleteName: "Jacob Rodgers",
          athleteHandle: "@JacobRodge52987",
          classYear: 2029,
          height: '6\'4"',
          weight: "285 lbs",
          division: "D1 FBS",
        }),
      });
      const data = await res.json();
      setScore(data.score);
      setTimeline(data.timeline);
      setPatterns(data.tweetPatterns || []);
    } catch (err) {
      console.error("Analysis failed:", err);
    } finally {
      setLoading(false);
    }
  }

  async function scrapeHudl() {
    if (!hudlUrl) return;
    setLoading(true);
    try {
      const res = await fetch("/api/intelligence/hudl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileUrl: hudlUrl }),
      });
      const data = await res.json();
      if (data.profile) {
        // Re-run analysis with Hudl data
        runAnalysis();
      }
    } catch (err) {
      console.error("Hudl scrape failed:", err);
    } finally {
      setLoading(false);
    }
  }

  async function analyzeCoaches() {
    setLoading(true);
    try {
      const res = await fetch("/api/intelligence/coach-behavior", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coaches: [],
          recruitHandle: "@JacobRodge52987",
        }),
      });
      const data = await res.json();
      setCoachProfiles(data.profiles || []);
    } catch (err) {
      console.error("Coach analysis failed:", err);
    } finally {
      setLoading(false);
    }
  }

  const tabs = [
    { id: "overview" as const, label: "Overview", icon: Brain },
    { id: "film" as const, label: "Film", icon: Film },
    { id: "coaches" as const, label: "Coaches", icon: Users },
    { id: "patterns" as const, label: "Patterns", icon: Search },
    { id: "timeline" as const, label: "Timeline", icon: Clock },
    { id: "future_back" as const, label: "Future-Back", icon: Target },
  ];

  return (
    <div className="space-y-6">
      <div className="shell-panel flex flex-col gap-4 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--app-navy-strong)]">Recruiting Intelligence</h2>
          <p className="text-sm leading-6 text-[var(--app-muted)]">AI-powered analysis of recruiting signals, film, and coach behavior</p>
        </div>
        <Button
          onClick={runAnalysis}
          disabled={loading}
          className="gap-2 bg-[var(--app-navy-strong)] text-white hover:bg-[var(--app-navy)]"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          {loading ? "Analyzing..." : "Run Analysis"}
        </Button>
      </div>

      <div className="inline-flex flex-wrap gap-1 rounded-full border border-[rgba(15,40,75,0.08)] bg-white/72 p-1 shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              activeTab === tab.id
                ? "bg-[var(--app-navy-strong)] text-white shadow-[0_14px_30px_rgba(15,40,75,0.18)]"
                : "text-[var(--app-muted)] hover:text-[var(--app-navy-strong)]"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && <OverviewTab score={score} timeline={timeline} />}
      {activeTab === "film" && <FilmTab score={score} hudlUrl={hudlUrl} setHudlUrl={setHudlUrl} onScrape={scrapeHudl} loading={loading} />}
      {activeTab === "coaches" && <CoachesTab profiles={coachProfiles} onAnalyze={analyzeCoaches} loading={loading} />}
      {activeTab === "patterns" && <PatternsTab patterns={patterns} />}
      {activeTab === "timeline" && <TimelineTab timeline={timeline} />}
      {activeTab === "future_back" && <FutureBackTab />}
    </div>
  );
}

// ============ OVERVIEW TAB ============

function OverviewTab({ score, timeline }: { score: IntelligenceScore | null; timeline: RecruitingTimeline | null }) {
  if (!score) {
    return (
      <div className="text-center py-12 text-slate-500">
        <Brain className="h-12 w-12 mx-auto mb-4 text-slate-300" />
        <p className="text-lg font-medium">No analysis data yet</p>
        <p className="text-sm">Click &quot;Run Analysis&quot; to generate recruiting intelligence</p>
      </div>
    );
  }

  const scoreCards = [
    { label: "Film", score: score.filmScore.score, icon: Film, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Social", score: score.socialPresenceScore.score, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Momentum", score: score.recruitingMomentumScore.score, icon: Target, color: "text-green-600", bg: "bg-green-50" },
    { label: "Academic", score: score.academicScore.score, icon: GraduationCap, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Physical", score: score.physicalProfileScore.score, icon: Ruler, color: "text-red-600", bg: "bg-red-50" },
  ];

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Overall Intelligence Score</p>
              <p className="text-5xl font-bold text-slate-900">{score.overallScore}</p>
              <p className="text-sm text-slate-500 mt-1">Data completeness: {Math.round(score.dataCompleteness * 100)}%</p>
            </div>
            <div className="text-right">
              <Badge className={cn(
                "text-sm px-3 py-1",
                score.tierProjection.currentTier === "Elite" ? "bg-yellow-100 text-yellow-800" :
                score.tierProjection.currentTier === "High" ? "bg-green-100 text-green-800" :
                score.tierProjection.currentTier === "Mid" ? "bg-blue-100 text-blue-800" :
                "bg-slate-100 text-slate-800"
              )}>
                {score.tierProjection.currentTier} Tier
              </Badge>
              {score.tierProjection.projectedTier !== score.tierProjection.currentTier && (
                <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  Projected: {score.tierProjection.projectedTier}
                </div>
              )}
              <p className="text-xs text-slate-400 mt-1">
                Confidence: {Math.round(score.tierProjection.confidence * 100)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sub-Scores */}
      <div className="grid grid-cols-5 gap-4">
        {scoreCards.map((card) => (
          <Card key={card.label}>
            <CardContent className="pt-4 pb-4 text-center">
              <div className={cn("inline-flex p-2 rounded-lg mb-2", card.bg)}>
                <card.icon className={cn("h-5 w-5", card.color)} />
              </div>
              <p className="text-2xl font-bold text-slate-900">{card.score}</p>
              <p className="text-xs text-slate-500">{card.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {score.recommendations.slice(0, 5).map((rec, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                {rec.priority === "critical" ? (
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                ) : rec.priority === "high" ? (
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-900">{rec.title}</p>
                    <Badge variant="outline" className="text-xs">
                      {rec.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{rec.description}</p>
                  <ul className="mt-2 space-y-1">
                    {rec.actionItems.slice(0, 3).map((item, j) => (
                      <li key={j} className="text-xs text-slate-600 flex items-center gap-1">
                        <ChevronRight className="h-3 w-3" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Timeline Quick View */}
      {timeline && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Current Phase</p>
                <p className="text-lg font-semibold text-slate-900 capitalize">
                  {timeline.currentPhase.replace(/_/g, " ")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">Next Milestone</p>
                <p className="text-sm font-medium text-slate-900">{timeline.nextMilestone}</p>
                {timeline.daysToNextMilestone > 0 && (
                  <p className="text-xs text-slate-400">{timeline.daysToNextMilestone} days away</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============ FILM TAB ============

function FilmTab({
  score,
  hudlUrl,
  setHudlUrl,
  onScrape,
  loading,
}: {
  score: IntelligenceScore | null;
  hudlUrl: string;
  setHudlUrl: (url: string) => void;
  onScrape: () => void;
  loading: boolean;
}) {
  return (
    <div className="space-y-6">
      {/* Hudl Scraper */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Hudl Profile Scraper</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="https://www.hudl.com/profile/12345/athlete-name"
              value={hudlUrl}
              onChange={(e) => setHudlUrl(e.target.value)}
              className="flex-1"
            />
            <Button onClick={onScrape} disabled={loading || !hudlUrl}>
              {loading ? "Scraping..." : "Scrape Profile"}
            </Button>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Enter a Hudl profile URL to extract athlete data, film info, and measurables
          </p>
        </CardContent>
      </Card>

      {/* Film Score Details */}
      {score && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Film className="h-5 w-5 text-purple-600" />
              Film Score: {score.filmScore.score}/100
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500">Hudl Profile</p>
                <p className="text-lg font-semibold">
                  {score.filmScore.hasHudlProfile ? "Active" : "Not Found"}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500">Highlight Reels</p>
                <p className="text-lg font-semibold">{score.filmScore.highlightCount}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {score.filmScore.filmQualityIndicators.map((indicator, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {indicator}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Physical Profile */}
      {score && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Ruler className="h-5 w-5 text-red-600" />
              Physical Profile: {score.physicalProfileScore.score}/100
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500">Height</p>
                <p className="text-lg font-semibold">{score.physicalProfileScore.height}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500">Weight</p>
                <p className="text-lg font-semibold">{score.physicalProfileScore.weight}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500">Position Fit</p>
                <p className="text-lg font-semibold">{score.physicalProfileScore.positionFit.join(", ")}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <Badge className={score.physicalProfileScore.meetsD1Threshold ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"}>
                {score.physicalProfileScore.meetsD1Threshold ? "Meets D1 Threshold" : "Below D1 Threshold"}
              </Badge>
              <Badge className={score.physicalProfileScore.meetsD2Threshold ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"}>
                {score.physicalProfileScore.meetsD2Threshold ? "Meets D2 Threshold" : "Below D2 Threshold"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============ COACHES TAB ============

function CoachesTab({
  profiles,
  onAnalyze,
  loading,
}: {
  profiles: CoachProfile[];
  onAnalyze: () => void;
  loading: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500">
          {profiles.length > 0
            ? `${profiles.length} coaches analyzed, ranked by response likelihood`
            : "Analyze coach behavior to get personalized outreach strategies"}
        </p>
        <Button onClick={onAnalyze} disabled={loading} variant="outline" className="gap-2">
          <Users className="h-4 w-4" />
          {loading ? "Analyzing..." : "Analyze Coaches"}
        </Button>
      </div>

      {profiles.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <Users className="h-12 w-12 mx-auto mb-4 text-slate-300" />
          <p>No coach behavior data yet. Click &quot;Analyze Coaches&quot; to start.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {profiles.map((profile, i) => (
            <Card key={i}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900">{profile.coachName}</p>
                      <Badge variant="outline">{profile.division}</Badge>
                    </div>
                    <p className="text-sm text-slate-500">{profile.schoolName}</p>
                  </div>
                  <div className="text-right">
                    <Badge className={cn(
                      "text-xs",
                      profile.engagementStyle === "highly_responsive" ? "bg-green-100 text-green-800" :
                      profile.engagementStyle === "selective" ? "bg-blue-100 text-blue-800" :
                      "bg-slate-100 text-slate-600"
                    )}>
                      {profile.engagementStyle.replace(/_/g, " ")}
                    </Badge>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                  <div className="p-2 bg-slate-50 rounded">
                    <p className="text-xs text-slate-500">DM Open</p>
                    <p className="text-sm font-semibold">{Math.round(profile.dmOpenProbability * 100)}%</p>
                  </div>
                  <div className="p-2 bg-slate-50 rounded">
                    <p className="text-xs text-slate-500">Follow Back</p>
                    <p className="text-sm font-semibold">{Math.round(profile.followBackProbability * 100)}%</p>
                  </div>
                  <div className="p-2 bg-slate-50 rounded">
                    <p className="text-xs text-slate-500">Response Rate</p>
                    <p className="text-sm font-semibold">{Math.round(profile.bestApproachStrategy.estimatedResponseRate * 100)}%</p>
                  </div>
                </div>

                <div className="mt-3">
                  <p className="text-xs font-medium text-slate-600 mb-1">Approach: {profile.bestApproachStrategy.method.replace(/_/g, " ")}</p>
                  <div className="space-y-1">
                    {profile.bestApproachStrategy.steps.slice(0, 3).map((step, j) => (
                      <p key={j} className="text-xs text-slate-500 flex items-center gap-1">
                        <ChevronRight className="h-3 w-3" />
                        {step}
                      </p>
                    ))}
                  </div>
                </div>

                {profile.insights.length > 0 && (
                  <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                    {profile.insights.slice(0, 2).map((insight, j) => (
                      <p key={j} className="text-xs text-blue-700">• {insight}</p>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ PATTERNS TAB ============

function PatternsTab({ patterns }: { patterns: TweetPatternSummary[] }) {
  const patternTypeLabels: Record<string, { label: string; color: string }> = {
    offer_announcement: { label: "Offer", color: "bg-green-100 text-green-800" },
    commitment: { label: "Commitment", color: "bg-blue-100 text-blue-800" },
    decommitment: { label: "Decommit", color: "bg-red-100 text-red-800" },
    top_schools_list: { label: "Top Schools", color: "bg-purple-100 text-purple-800" },
    visit_announcement: { label: "Visit", color: "bg-indigo-100 text-indigo-800" },
    camp_attendance: { label: "Camp", color: "bg-amber-100 text-amber-800" },
    film_share: { label: "Film", color: "bg-pink-100 text-pink-800" },
    training_content: { label: "Training", color: "bg-orange-100 text-orange-800" },
    game_performance: { label: "Game", color: "bg-emerald-100 text-emerald-800" },
    academic_achievement: { label: "Academic", color: "bg-cyan-100 text-cyan-800" },
    measurables_update: { label: "Measurables", color: "bg-teal-100 text-teal-800" },
  };

  if (patterns.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <Search className="h-12 w-12 mx-auto mb-4 text-slate-300" />
        <p>No tweet patterns detected yet. Run analysis to scan for recruiting signals.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {patterns.map((pattern, i) => {
        const typeInfo = patternTypeLabels[pattern.patternType] || { label: pattern.patternType, color: "bg-slate-100 text-slate-600" };
        return (
          <Card key={i}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={cn("text-xs", typeInfo.color)}>{typeInfo.label}</Badge>
                    <span className="text-xs text-slate-400">
                      {Math.round(pattern.confidence * 100)}% confidence
                    </span>
                  </div>
                  <p className="text-sm text-slate-700">{pattern.tweetText}</p>
                  {pattern.schoolMentions.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {pattern.schoolMentions.map((school, j) => (
                        <Badge key={j} variant="outline" className="text-xs">{school}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function FutureBackTab() {
  return (
    <div className="space-y-6">
      <Card className="shell-panel-strong border-none bg-transparent shadow-none">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-[rgba(15,40,75,0.1)] bg-white/70 text-[var(--app-navy-strong)] hover:bg-white/70">
              Strategos future-back
            </Badge>
            <Badge variant="outline">{FIVE_YEAR_FUTURE_BACK.targetYear}</Badge>
          </div>
          <CardTitle className="text-[var(--app-navy-strong)]">{FIVE_YEAR_FUTURE_BACK.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-7 text-[var(--app-muted)]">{FIVE_YEAR_FUTURE_BACK.premise}</p>
          <div className="rounded-[24px] border border-[rgba(15,40,75,0.08)] bg-white/82 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--app-muted)]">
              2031 north star
            </p>
            <p className="mt-3 text-lg font-semibold text-[var(--app-navy-strong)]">
              {FIVE_YEAR_FUTURE_BACK.northStar}
            </p>
            <p className="mt-3 text-sm leading-7 text-[var(--app-muted)]">
              {FIVE_YEAR_FUTURE_BACK.strategicQuestion}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Strategic shifts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {FIVE_YEAR_FUTURE_BACK.shifts.map((shift) => (
              <div key={shift.id} className="rounded-[22px] border border-[rgba(15,40,75,0.08)] bg-white/78 p-4">
                <p className="text-sm font-semibold text-[var(--app-navy-strong)]">{shift.title}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--app-muted)]">
                  From
                </p>
                <p className="mt-1 text-sm leading-6 text-[var(--app-muted)]">{shift.from}</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--app-muted)]">
                  To
                </p>
                <p className="mt-1 text-sm leading-6 text-[var(--app-navy-strong)]">{shift.to}</p>
                <p className="mt-3 text-sm leading-6 text-[var(--app-muted)]">{shift.reason}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Innovation studio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {SUSAN_INNOVATION_STUDIO.map((member) => (
              <div key={member.id} className="rounded-[22px] border border-[rgba(15,40,75,0.08)] bg-white/78 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[var(--app-navy-strong)]">{member.name}</p>
                    <p className="text-xs text-[var(--app-muted)]">{member.role}</p>
                  </div>
                  <Badge variant="outline">{member.owns[0]}</Badge>
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--app-muted)]">{member.background}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Future horizons</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 xl:grid-cols-3">
          {FIVE_YEAR_FUTURE_BACK.horizons.map((horizon) => (
            <div key={horizon.id} className="rounded-[24px] border border-[rgba(15,40,75,0.08)] bg-white/80 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--app-muted)]">
                {horizon.horizon}
              </p>
              <p className="mt-3 text-xl font-semibold text-[var(--app-navy-strong)]">{horizon.headline}</p>
              <p className="mt-3 text-sm leading-7 text-[var(--app-muted)]">{horizon.outcome}</p>
              <div className="mt-4 space-y-2">
                {horizon.signals.map((signal) => (
                  <div key={signal} className="flex items-start gap-2 text-sm leading-6 text-[var(--app-muted)]">
                    <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-[var(--app-gold)]" />
                    <span>{signal}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Capability bets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {FIVE_YEAR_FUTURE_BACK.capabilityBets.map((bet) => (
              <div key={bet.id} className="rounded-[22px] border border-[rgba(15,40,75,0.08)] bg-white/78 p-4">
                <p className="text-sm font-semibold text-[var(--app-navy-strong)]">{bet.title}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--app-muted)]">{bet.outcome}</p>
                <div className="mt-4 space-y-2 text-sm">
                  <p><span className="font-semibold text-[var(--app-navy-strong)]">Now:</span> <span className="text-[var(--app-muted)]">{bet.now}</span></p>
                  <p><span className="font-semibold text-[var(--app-navy-strong)]">Next:</span> <span className="text-[var(--app-muted)]">{bet.next}</span></p>
                  <p><span className="font-semibold text-[var(--app-navy-strong)]">Later:</span> <span className="text-[var(--app-muted)]">{bet.later}</span></p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Reverse milestones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {FIVE_YEAR_FUTURE_BACK.reverseMilestones.map((milestone) => (
              <div key={milestone.year} className="rounded-[22px] border border-[rgba(15,40,75,0.08)] bg-white/78 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-lg font-semibold text-[var(--app-navy-strong)]">{milestone.year}</p>
                  <Badge variant="outline">{milestone.objective}</Badge>
                </div>
                <div className="mt-3 space-y-2">
                  {milestone.moves.map((move) => (
                    <div key={move} className="flex items-start gap-2 text-sm leading-6 text-[var(--app-muted)]">
                      <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-[var(--app-gold)]" />
                      <span>{move}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Next 90 days</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {FIVE_YEAR_FUTURE_BACK.next90Days.map((item, index) => (
            <div key={item} className="rounded-[22px] border border-[rgba(15,40,75,0.08)] bg-white/78 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--app-muted)]">
                Move {index + 1}
              </p>
              <p className="mt-3 text-sm leading-7 text-[var(--app-navy-strong)]">{item}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ============ TIMELINE TAB ============

function TimelineTab({ timeline }: { timeline: RecruitingTimeline | null }) {
  if (!timeline) {
    return (
      <div className="text-center py-12 text-slate-500">
        <Clock className="h-12 w-12 mx-auto mb-4 text-slate-300" />
        <p>Run analysis to see your recruiting timeline.</p>
      </div>
    );
  }

  const phases = [
    { id: "pre_contact", label: "Pre-Contact", description: "Build profile and film library" },
    { id: "evaluation", label: "Evaluation", description: "Coaches evaluating, limited contact" },
    { id: "active_recruiting", label: "Active Recruiting", description: "Full contact period" },
    { id: "official_visits", label: "Official Visits", description: "Visit and evaluate schools" },
    { id: "decision", label: "Decision", description: "Narrow down and commit" },
    { id: "signed", label: "Signed", description: "Celebrate and prepare" },
  ];

  const currentIdx = phases.findIndex((p) => p.id === timeline.currentPhase);

  return (
    <div className="space-y-6">
      {/* Phase Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recruiting Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {phases.map((phase, i) => (
              <div key={phase.id} className="flex items-center gap-4">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                  i < currentIdx ? "bg-green-500 text-white" :
                  i === currentIdx ? "bg-blue-600 text-white ring-4 ring-blue-100" :
                  "bg-slate-200 text-slate-500"
                )}>
                  {i < currentIdx ? "✓" : i + 1}
                </div>
                <div className="flex-1">
                  <p className={cn(
                    "text-sm font-medium",
                    i === currentIdx ? "text-blue-600" : i < currentIdx ? "text-green-600" : "text-slate-400"
                  )}>
                    {phase.label}
                  </p>
                  <p className="text-xs text-slate-400">{phase.description}</p>
                </div>
                {i === currentIdx && (
                  <Badge className="bg-blue-100 text-blue-800 text-xs">Current</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Next Milestone */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-lg">
              <Target className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Next Milestone</p>
              <p className="text-lg font-semibold text-slate-900">{timeline.nextMilestone}</p>
              {timeline.daysToNextMilestone > 0 && (
                <p className="text-sm text-slate-400">{timeline.daysToNextMilestone} days away</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Phase Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Actions for Current Phase</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {timeline.currentPhaseActions.map((action, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs text-blue-600 font-medium shrink-0">
                  {i + 1}
                </div>
                <p className="text-sm text-slate-700">{action}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
