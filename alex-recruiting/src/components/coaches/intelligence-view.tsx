"use client";

import { useState } from "react";
import {
  SCPageHeader,
  SCGlassCard,
  SCButton,
  SCBadge,
  SCTabs,
  SCStatCard,
  SCInput,
  SCHeroBanner,
  SCPageTransition,
} from "@/components/sc";
import { SUSAN_INNOVATION_STUDIO } from "@/lib/media-lab/team";
import { FIVE_YEAR_FUTURE_BACK } from "@/lib/strategy/future-back";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function IntelligenceView() {
  const [score, setScore] = useState<IntelligenceScore | null>(null);
  const [timeline, setTimeline] = useState<RecruitingTimeline | null>(null);
  const [coachProfiles, setCoachProfiles] = useState<CoachProfile[]>([]);
  const [patterns, setPatterns] = useState<TweetPatternSummary[]>([]);
  const [hudlUrl, setHudlUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

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
      if (data.profile) runAnalysis();
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
        body: JSON.stringify({ coaches: [], recruitHandle: "@JacobRodge52987" }),
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
    { label: "Overview", value: "overview" },
    { label: "Film", value: "film" },
    { label: "Coaches", value: "coaches" },
    { label: "Patterns", value: "patterns" },
    { label: "Timeline", value: "timeline" },
    { label: "Future-Back", value: "future_back" },
  ];

  return (
    <SCPageTransition>
    <div className="space-y-8">
      <SCPageHeader
        title="REGIONAL PIPELINE"
        kicker="Intelligence Center"
        subtitle="AI-powered analysis of recruiting signals, film, and coach behavior."
        actions={
          <SCButton onClick={runAnalysis} disabled={loading}>
            <span className="material-symbols-outlined text-[18px]">
              {loading ? "sync" : "play_arrow"}
            </span>
            {loading ? "Analyzing..." : "Run Analysis"}
          </SCButton>
        }
      />

      <SCHeroBanner screen="analytics" className="mb-2" />

      <SCTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      {activeTab === "overview" && <OverviewTab score={score} timeline={timeline} />}
      {activeTab === "film" && (
        <FilmTab
          score={score}
          hudlUrl={hudlUrl}
          setHudlUrl={setHudlUrl}
          onScrape={scrapeHudl}
          loading={loading}
        />
      )}
      {activeTab === "coaches" && (
        <CoachesTab profiles={coachProfiles} onAnalyze={analyzeCoaches} loading={loading} />
      )}
      {activeTab === "patterns" && <PatternsTab patterns={patterns} />}
      {activeTab === "timeline" && <TimelineTab timeline={timeline} />}
      {activeTab === "future_back" && <FutureBackTab />}
    </div>
    </SCPageTransition>
  );
}

/* ------------------------------------------------------------------ */
/* Overview Tab                                                        */
/* ------------------------------------------------------------------ */

function OverviewTab({
  score,
  timeline,
}: {
  score: IntelligenceScore | null;
  timeline: RecruitingTimeline | null;
}) {
  if (!score) {
    return (
      <SCGlassCard className="flex flex-col items-center justify-center px-8 py-16 text-center">
        <span className="material-symbols-outlined mb-4 text-[48px] text-slate-600">
          psychology
        </span>
        <p className="text-lg font-bold text-white">No analysis data yet</p>
        <p className="mt-2 text-sm text-slate-400">
          Click &quot;Run Analysis&quot; to generate recruiting intelligence
        </p>
      </SCGlassCard>
    );
  }

  const scoreCards = [
    { label: "Film", value: `${score.filmScore.score}`, icon: "movie" },
    { label: "Social", value: `${score.socialPresenceScore.score}`, icon: "trending_up" },
    { label: "Momentum", value: `${score.recruitingMomentumScore.score}`, icon: "rocket_launch" },
    { label: "Academic", value: `${score.academicScore.score}`, icon: "school" },
    { label: "Physical", value: `${score.physicalProfileScore.score}`, icon: "fitness_center" },
  ];

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <SCGlassCard variant="strong" className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-400">Overall Intelligence Score</p>
            <p className="text-5xl font-black text-white">{score.overallScore}</p>
            <p className="mt-1 text-xs text-slate-500">
              Data completeness: {Math.round(score.dataCompleteness * 100)}%
            </p>
          </div>
          <div className="text-right">
            <SCBadge
              variant={
                score.tierProjection.currentTier === "Elite"
                  ? "warning"
                  : score.tierProjection.currentTier === "High"
                  ? "success"
                  : "info"
              }
            >
              {score.tierProjection.currentTier} Tier
            </SCBadge>
            {score.tierProjection.projectedTier !== score.tierProjection.currentTier && (
              <div className="mt-2 flex items-center justify-end gap-1 text-sm text-emerald-400">
                <span className="material-symbols-outlined text-[16px]">trending_up</span>
                Projected: {score.tierProjection.projectedTier}
              </div>
            )}
            <p className="mt-1 text-xs text-slate-500">
              Confidence: {Math.round(score.tierProjection.confidence * 100)}%
            </p>
          </div>
        </div>
      </SCGlassCard>

      {/* Sub-Scores */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {scoreCards.map((card) => (
          <SCStatCard
            key={card.label}
            label={card.label}
            value={card.value}
            icon={card.icon}
            progress={parseInt(card.value)}
          />
        ))}
      </div>

      {/* Recommendations */}
      <SCGlassCard className="p-6">
        <h3 className="sc-section-title">Recommendations</h3>
        <div className="mt-4 space-y-3">
          {score.recommendations.slice(0, 5).map((rec, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-lg border border-sc-border bg-white/5 p-4"
            >
              <span
                className={cn(
                  "material-symbols-outlined mt-0.5 text-[20px]",
                  rec.priority === "critical"
                    ? "text-red-400"
                    : rec.priority === "high"
                    ? "text-yellow-400"
                    : "text-blue-400"
                )}
              >
                {rec.priority === "critical" ? "error" : rec.priority === "high" ? "warning" : "info"}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-white">{rec.title}</p>
                  <SCBadge variant="default">{rec.category}</SCBadge>
                </div>
                <p className="mt-1 text-sm text-slate-400">{rec.description}</p>
                <ul className="mt-2 space-y-1">
                  {rec.actionItems.slice(0, 3).map((item, j) => (
                    <li key={j} className="flex items-center gap-1 text-xs text-slate-500">
                      <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </SCGlassCard>

      {/* Timeline Quick View */}
      {timeline && (
        <SCGlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Current Phase</p>
              <p className="text-lg font-black capitalize text-white">
                {timeline.currentPhase.replace(/_/g, " ")}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400">Next Milestone</p>
              <p className="text-sm font-bold text-white">{timeline.nextMilestone}</p>
              {timeline.daysToNextMilestone > 0 && (
                <p className="text-xs text-slate-500">{timeline.daysToNextMilestone} days away</p>
              )}
            </div>
          </div>
        </SCGlassCard>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Film Tab                                                            */
/* ------------------------------------------------------------------ */

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
      <SCGlassCard className="p-6">
        <h3 className="text-sm font-black uppercase tracking-widest text-white">
          Hudl Profile Scraper
        </h3>
        <div className="mt-4 flex gap-3">
          <SCInput
            icon="link"
            placeholder="https://www.hudl.com/profile/12345/athlete-name"
            value={hudlUrl}
            onChange={(e) => setHudlUrl(e.target.value)}
          />
          <SCButton onClick={onScrape} disabled={loading || !hudlUrl} variant="primary" size="sm">
            {loading ? "Scraping..." : "Scrape Profile"}
          </SCButton>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Enter a Hudl profile URL to extract athlete data, film info, and measurables
        </p>
      </SCGlassCard>

      {/* Film Score Details */}
      {score && (
        <>
          <SCGlassCard className="p-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-sc-primary">movie</span>
              <h3 className="text-sm font-black uppercase tracking-widest text-white">
                Film Score: {score.filmScore.score}/100
              </h3>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-sc-border bg-white/5 p-3">
                <p className="text-xs text-slate-500">Hudl Profile</p>
                <p className="text-lg font-black text-white">
                  {score.filmScore.hasHudlProfile ? "Active" : "Not Found"}
                </p>
              </div>
              <div className="rounded-lg border border-sc-border bg-white/5 p-3">
                <p className="text-xs text-slate-500">Highlight Reels</p>
                <p className="text-lg font-black text-white">{score.filmScore.highlightCount}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {score.filmScore.filmQualityIndicators.map((indicator, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                  <span className="material-symbols-outlined text-[16px] text-emerald-400">
                    check_circle
                  </span>
                  {indicator}
                </div>
              ))}
            </div>
          </SCGlassCard>

          {/* Physical Profile */}
          <SCGlassCard className="p-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-sc-primary">
                fitness_center
              </span>
              <h3 className="text-sm font-black uppercase tracking-widest text-white">
                Physical Profile: {score.physicalProfileScore.score}/100
              </h3>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="rounded-lg border border-sc-border bg-white/5 p-3">
                <p className="text-xs text-slate-500">Height</p>
                <p className="text-lg font-black text-white">{score.physicalProfileScore.height}</p>
              </div>
              <div className="rounded-lg border border-sc-border bg-white/5 p-3">
                <p className="text-xs text-slate-500">Weight</p>
                <p className="text-lg font-black text-white">{score.physicalProfileScore.weight}</p>
              </div>
              <div className="rounded-lg border border-sc-border bg-white/5 p-3">
                <p className="text-xs text-slate-500">Position Fit</p>
                <p className="text-lg font-black text-white">
                  {score.physicalProfileScore.positionFit.join(", ")}
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <SCBadge variant={score.physicalProfileScore.meetsD1Threshold ? "success" : "default"}>
                {score.physicalProfileScore.meetsD1Threshold ? "Meets D1" : "Below D1"}
              </SCBadge>
              <SCBadge variant={score.physicalProfileScore.meetsD2Threshold ? "success" : "default"}>
                {score.physicalProfileScore.meetsD2Threshold ? "Meets D2" : "Below D2"}
              </SCBadge>
            </div>
          </SCGlassCard>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Coaches Tab                                                         */
/* ------------------------------------------------------------------ */

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
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">
          {profiles.length > 0
            ? `${profiles.length} coaches analyzed, ranked by response likelihood`
            : "Analyze coach behavior to get personalized outreach strategies"}
        </p>
        <SCButton onClick={onAnalyze} disabled={loading} variant="secondary" size="sm">
          <span className="material-symbols-outlined text-[16px]">group</span>
          {loading ? "Analyzing..." : "Analyze Coaches"}
        </SCButton>
      </div>

      {profiles.length === 0 ? (
        <SCGlassCard className="flex flex-col items-center justify-center px-8 py-16 text-center">
          <span className="material-symbols-outlined mb-4 text-[48px] text-slate-600">group</span>
          <p className="text-white">No coach behavior data yet.</p>
          <p className="text-sm text-slate-400">Click &quot;Analyze Coaches&quot; to start.</p>
        </SCGlassCard>
      ) : (
        <div className="space-y-4">
          {profiles.map((profile, i) => (
            <SCGlassCard key={i} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-white">{profile.coachName}</p>
                    <SCBadge variant="default">{profile.division}</SCBadge>
                  </div>
                  <p className="text-sm text-slate-400">{profile.schoolName}</p>
                </div>
                <SCBadge
                  variant={
                    profile.engagementStyle === "highly_responsive"
                      ? "success"
                      : profile.engagementStyle === "selective"
                      ? "info"
                      : "default"
                  }
                >
                  {profile.engagementStyle.replace(/_/g, " ")}
                </SCBadge>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                {[
                  { label: "DM Open", value: `${Math.round(profile.dmOpenProbability * 100)}%` },
                  { label: "Follow Back", value: `${Math.round(profile.followBackProbability * 100)}%` },
                  {
                    label: "Response Rate",
                    value: `${Math.round(profile.bestApproachStrategy.estimatedResponseRate * 100)}%`,
                  },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-lg border border-sc-border bg-white/5 p-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      {stat.label}
                    </p>
                    <p className="text-sm font-black text-white">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-3">
                <p className="text-xs font-bold text-slate-400">
                  Approach: {profile.bestApproachStrategy.method.replace(/_/g, " ")}
                </p>
                <div className="mt-1 space-y-1">
                  {profile.bestApproachStrategy.steps.slice(0, 3).map((step, j) => (
                    <p key={j} className="flex items-center gap-1 text-xs text-slate-500">
                      <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                      {step}
                    </p>
                  ))}
                </div>
              </div>

              {profile.insights.length > 0 && (
                <div className="mt-3 rounded-lg border border-blue-500/20 bg-blue-500/5 p-2">
                  {profile.insights.slice(0, 2).map((insight, j) => (
                    <p key={j} className="text-xs text-blue-400">
                      &bull; {insight}
                    </p>
                  ))}
                </div>
              )}
            </SCGlassCard>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Patterns Tab                                                        */
/* ------------------------------------------------------------------ */

const patternTypeConfig: Record<string, { label: string; variant: "success" | "info" | "danger" | "warning" | "primary" | "default" }> = {
  offer_announcement: { label: "Offer", variant: "success" },
  commitment: { label: "Commitment", variant: "info" },
  decommitment: { label: "Decommit", variant: "danger" },
  top_schools_list: { label: "Top Schools", variant: "primary" },
  visit_announcement: { label: "Visit", variant: "info" },
  camp_attendance: { label: "Camp", variant: "warning" },
  film_share: { label: "Film", variant: "primary" },
  training_content: { label: "Training", variant: "warning" },
  game_performance: { label: "Game", variant: "success" },
  academic_achievement: { label: "Academic", variant: "info" },
  measurables_update: { label: "Measurables", variant: "success" },
};

function PatternsTab({ patterns }: { patterns: TweetPatternSummary[] }) {
  if (patterns.length === 0) {
    return (
      <SCGlassCard className="flex flex-col items-center justify-center px-8 py-16 text-center">
        <span className="material-symbols-outlined mb-4 text-[48px] text-slate-600">search</span>
        <p className="text-white">No tweet patterns detected yet.</p>
        <p className="text-sm text-slate-400">Run analysis to scan for recruiting signals.</p>
      </SCGlassCard>
    );
  }

  return (
    <div className="space-y-3">
      {patterns.map((pattern, i) => {
        const typeInfo = patternTypeConfig[pattern.patternType] || {
          label: pattern.patternType,
          variant: "default" as const,
        };
        return (
          <SCGlassCard key={i} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <SCBadge variant={typeInfo.variant}>{typeInfo.label}</SCBadge>
                  <span className="text-xs text-slate-500">
                    {Math.round(pattern.confidence * 100)}% confidence
                  </span>
                </div>
                <p className="text-sm text-slate-300">{pattern.tweetText}</p>
                {pattern.schoolMentions.length > 0 && (
                  <div className="mt-2 flex gap-1">
                    {pattern.schoolMentions.map((school, j) => (
                      <SCBadge key={j} variant="default">
                        {school}
                      </SCBadge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </SCGlassCard>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Timeline Tab                                                        */
/* ------------------------------------------------------------------ */

function TimelineTab({ timeline }: { timeline: RecruitingTimeline | null }) {
  if (!timeline) {
    return (
      <SCGlassCard className="flex flex-col items-center justify-center px-8 py-16 text-center">
        <span className="material-symbols-outlined mb-4 text-[48px] text-slate-600">schedule</span>
        <p className="text-white">Run analysis to see your recruiting timeline.</p>
      </SCGlassCard>
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
      <SCGlassCard className="p-6">
        <h3 className="sc-section-title">Recruiting Timeline</h3>
        <div className="mt-6 space-y-4">
          {phases.map((phase, i) => (
            <div key={phase.id} className="flex items-center gap-4">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black",
                  i < currentIdx
                    ? "bg-emerald-500 text-white"
                    : i === currentIdx
                    ? "bg-sc-primary text-white ring-4 ring-sc-primary/20"
                    : "bg-white/10 text-slate-500"
                )}
              >
                {i < currentIdx ? (
                  <span className="material-symbols-outlined text-[16px]">check</span>
                ) : (
                  i + 1
                )}
              </div>
              <div className="flex-1">
                <p
                  className={cn(
                    "text-sm font-bold",
                    i === currentIdx
                      ? "text-sc-primary"
                      : i < currentIdx
                      ? "text-emerald-400"
                      : "text-slate-500"
                  )}
                >
                  {phase.label}
                </p>
                <p className="text-xs text-slate-500">{phase.description}</p>
              </div>
              {i === currentIdx && <SCBadge variant="primary">Current</SCBadge>}
            </div>
          ))}
        </div>
      </SCGlassCard>

      {/* Next Milestone */}
      <SCGlassCard variant="broadcast" className="p-6">
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-[28px] text-sc-primary">flag</span>
          <div>
            <p className="text-sm text-slate-400">Next Milestone</p>
            <p className="text-lg font-black text-white">{timeline.nextMilestone}</p>
            {timeline.daysToNextMilestone > 0 && (
              <p className="text-sm text-slate-500">{timeline.daysToNextMilestone} days away</p>
            )}
          </div>
        </div>
      </SCGlassCard>

      {/* Current Phase Actions */}
      <SCGlassCard className="p-6">
        <h3 className="sc-section-title">Actions for Current Phase</h3>
        <div className="mt-4 space-y-2">
          {timeline.currentPhaseActions.map((action, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg border border-sc-border p-3 transition-colors hover:bg-white/5"
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sc-primary/20 text-xs font-bold text-sc-primary">
                {i + 1}
              </div>
              <p className="text-sm text-slate-300">{action}</p>
            </div>
          ))}
        </div>
      </SCGlassCard>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Future-Back Tab                                                     */
/* ------------------------------------------------------------------ */

function FutureBackTab() {
  return (
    <div className="space-y-6">
      <SCGlassCard variant="strong" className="p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <SCBadge variant="primary">Strategos future-back</SCBadge>
          <SCBadge variant="default">{FIVE_YEAR_FUTURE_BACK.targetYear}</SCBadge>
        </div>
        <h3 className="text-xl font-black italic uppercase text-white">
          {FIVE_YEAR_FUTURE_BACK.title}
        </h3>
        <p className="mt-3 text-sm leading-7 text-slate-400">{FIVE_YEAR_FUTURE_BACK.premise}</p>
        <div className="mt-4 rounded-lg border border-sc-border bg-white/5 p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            2031 North Star
          </p>
          <p className="mt-3 text-lg font-black text-white">
            {FIVE_YEAR_FUTURE_BACK.northStar}
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            {FIVE_YEAR_FUTURE_BACK.strategicQuestion}
          </p>
        </div>
      </SCGlassCard>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Strategic Shifts */}
        <SCGlassCard className="p-6">
          <h3 className="sc-section-title">Strategic Shifts</h3>
          <div className="mt-4 space-y-3">
            {FIVE_YEAR_FUTURE_BACK.shifts.map((shift) => (
              <div key={shift.id} className="rounded-lg border border-sc-border bg-white/5 p-4">
                <p className="text-sm font-bold text-white">{shift.title}</p>
                <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  From
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-400">{shift.from}</p>
                <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  To
                </p>
                <p className="mt-1 text-sm leading-6 text-white">{shift.to}</p>
                <p className="mt-3 text-sm leading-6 text-slate-400">{shift.reason}</p>
              </div>
            ))}
          </div>
        </SCGlassCard>

        {/* Innovation Studio */}
        <SCGlassCard className="p-6">
          <h3 className="sc-section-title">Innovation Studio</h3>
          <div className="mt-4 space-y-3">
            {SUSAN_INNOVATION_STUDIO.map((member) => (
              <div key={member.id} className="rounded-lg border border-sc-border bg-white/5 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-white">{member.name}</p>
                    <p className="text-xs text-slate-400">{member.role}</p>
                  </div>
                  <SCBadge variant="default">{member.owns[0]}</SCBadge>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-400">{member.background}</p>
              </div>
            ))}
          </div>
        </SCGlassCard>
      </div>

      {/* Future Horizons */}
      <SCGlassCard className="p-6">
        <h3 className="sc-section-title">Future Horizons</h3>
        <div className="mt-4 grid gap-4 xl:grid-cols-3">
          {FIVE_YEAR_FUTURE_BACK.horizons.map((horizon) => (
            <div key={horizon.id} className="rounded-lg border border-sc-border bg-white/5 p-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-sc-primary">
                {horizon.horizon}
              </p>
              <p className="mt-3 text-xl font-black text-white">{horizon.headline}</p>
              <p className="mt-3 text-sm leading-7 text-slate-400">{horizon.outcome}</p>
              <div className="mt-4 space-y-2">
                {horizon.signals.map((signal) => (
                  <div key={signal} className="flex items-start gap-2 text-sm leading-6 text-slate-400">
                    <span className="material-symbols-outlined mt-1 text-[16px] text-sc-primary">
                      chevron_right
                    </span>
                    <span>{signal}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SCGlassCard>

      {/* Capability Bets + Reverse Milestones */}
      <div className="grid gap-6 xl:grid-cols-2">
        <SCGlassCard className="p-6">
          <h3 className="sc-section-title">Capability Bets</h3>
          <div className="mt-4 space-y-3">
            {FIVE_YEAR_FUTURE_BACK.capabilityBets.map((bet) => (
              <div key={bet.id} className="rounded-lg border border-sc-border bg-white/5 p-4">
                <p className="text-sm font-bold text-white">{bet.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">{bet.outcome}</p>
                <div className="mt-4 space-y-2 text-sm">
                  <p>
                    <span className="font-bold text-white">Now:</span>{" "}
                    <span className="text-slate-400">{bet.now}</span>
                  </p>
                  <p>
                    <span className="font-bold text-white">Next:</span>{" "}
                    <span className="text-slate-400">{bet.next}</span>
                  </p>
                  <p>
                    <span className="font-bold text-white">Later:</span>{" "}
                    <span className="text-slate-400">{bet.later}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </SCGlassCard>

        <SCGlassCard className="p-6">
          <h3 className="sc-section-title">Reverse Milestones</h3>
          <div className="mt-4 space-y-3">
            {FIVE_YEAR_FUTURE_BACK.reverseMilestones.map((milestone) => (
              <div key={milestone.year} className="rounded-lg border border-sc-border bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-lg font-black text-white">{milestone.year}</p>
                  <SCBadge variant="default">{milestone.objective}</SCBadge>
                </div>
                <div className="mt-3 space-y-2">
                  {milestone.moves.map((move) => (
                    <div key={move} className="flex items-start gap-2 text-sm leading-6 text-slate-400">
                      <span className="material-symbols-outlined mt-1 text-[16px] text-sc-primary">
                        chevron_right
                      </span>
                      <span>{move}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SCGlassCard>
      </div>

      {/* Next 90 Days */}
      <SCGlassCard className="p-6">
        <h3 className="sc-section-title">Next 90 Days</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {FIVE_YEAR_FUTURE_BACK.next90Days.map((item, index) => (
            <div key={item} className="rounded-lg border border-sc-border bg-white/5 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-sc-primary">
                Move {index + 1}
              </p>
              <p className="mt-3 text-sm leading-7 text-white">{item}</p>
            </div>
          ))}
        </div>
      </SCGlassCard>
    </div>
  );
}
