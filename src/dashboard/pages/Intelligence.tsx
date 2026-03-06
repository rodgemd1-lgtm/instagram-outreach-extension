import React, { useState, useCallback } from 'react';
import { MSG } from '../../shared/message-types';

interface IntelligenceResult {
  score?: {
    overallScore: number;
    filmScore: { score: number; hasHudlProfile: boolean; highlightCount: number };
    socialPresenceScore: { score: number };
    recruitingMomentumScore: { score: number; totalOffers: number; trendDirection: string };
    academicScore: { score: number };
    physicalProfileScore: { score: number; meetsD1Threshold: boolean; meetsD2Threshold: boolean };
    tierProjection: { currentTier: string; projectedTier: string; rationale: string };
    recommendations: { priority: string; title: string; description: string; actionItems: string[] }[];
  };
  timeline?: {
    currentPhase: string;
    nextMilestone: string;
    daysToNextMilestone: number;
    currentPhaseActions: string[];
  };
}

interface HudlResult {
  profile?: {
    athleteName: string;
    position: string;
    height: string;
    weight: string;
    gradYear: number;
    highSchool: string;
    highlightReels: { title: string; url: string }[];
  };
  error?: string;
}

export function Intelligence() {
  const [hudlUrl, setHudlUrl] = useState('');
  const [hudlResult, setHudlResult] = useState<HudlResult | null>(null);
  const [intelligenceResult, setIntelligenceResult] = useState<IntelligenceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrapeHudl = useCallback(async () => {
    if (!hudlUrl) return;
    setLoading(true);
    setError(null);
    try {
      const result = await chrome.runtime.sendMessage({
        type: MSG.SCRAPE_HUDL,
        payload: { profileUrl: hudlUrl },
      });
      setHudlResult(result as HudlResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hudl scrape failed');
    } finally {
      setLoading(false);
    }
  }, [hudlUrl]);

  const runIntelligence = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await chrome.runtime.sendMessage({
        type: MSG.RUN_INTELLIGENCE,
        payload: { athleteId: 'jacob-rogers', athleteName: 'Jacob Rogers' },
      });
      setIntelligenceResult(result as IntelligenceResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Intelligence analysis failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const score = intelligenceResult?.score;
  const timeline = intelligenceResult?.timeline;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Recruiting Intelligence</h2>
          <p className="text-sm text-gray-500">
            AI-powered analysis of film, social presence, coach behavior, and recruiting momentum
          </p>
        </div>
        <button
          onClick={runIntelligence}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Run Full Analysis'}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Hudl Scraper */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Hudl Profile Scraper</h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={hudlUrl}
            onChange={(e) => setHudlUrl(e.target.value)}
            placeholder="https://www.hudl.com/profile/12345/athlete-name"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <button
            onClick={scrapeHudl}
            disabled={loading || !hudlUrl}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
          >
            Scrape
          </button>
        </div>
        {hudlResult?.profile && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg space-y-1">
            <p className="text-sm font-medium">{hudlResult.profile.athleteName}</p>
            <p className="text-xs text-gray-500">
              {hudlResult.profile.position} | {hudlResult.profile.height} {hudlResult.profile.weight} | Class of {hudlResult.profile.gradYear}
            </p>
            <p className="text-xs text-gray-500">{hudlResult.profile.highSchool}</p>
            <p className="text-xs text-gray-500">{hudlResult.profile.highlightReels.length} highlight reel(s)</p>
          </div>
        )}
        {hudlResult?.error && (
          <p className="mt-2 text-xs text-red-500">{hudlResult.error}</p>
        )}
      </div>

      {/* Intelligence Score */}
      {score && (
        <>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Overall Score</p>
                <p className="text-4xl font-bold text-gray-800">{score.overallScore}</p>
              </div>
              <div className="text-right">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  score.tierProjection.currentTier === 'Elite' ? 'bg-yellow-100 text-yellow-800' :
                  score.tierProjection.currentTier === 'High' ? 'bg-green-100 text-green-800' :
                  score.tierProjection.currentTier === 'Mid' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {score.tierProjection.currentTier} Tier
                </span>
                {score.tierProjection.projectedTier !== score.tierProjection.currentTier && (
                  <p className="text-xs text-green-600 mt-1">Projected: {score.tierProjection.projectedTier}</p>
                )}
              </div>
            </div>
          </div>

          {/* Sub-Scores */}
          <div className="grid grid-cols-5 gap-3">
            {[
              { label: 'Film', value: score.filmScore.score, color: 'text-purple-600' },
              { label: 'Social', value: score.socialPresenceScore.score, color: 'text-blue-600' },
              { label: 'Momentum', value: score.recruitingMomentumScore.score, color: 'text-green-600' },
              { label: 'Academic', value: score.academicScore.score, color: 'text-amber-600' },
              { label: 'Physical', value: score.physicalProfileScore.score, color: 'text-red-600' },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Recommendations */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Top Recommendations</h3>
            <div className="space-y-3">
              {score.recommendations.slice(0, 5).map((rec, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      rec.priority === 'critical' ? 'bg-red-100 text-red-700' :
                      rec.priority === 'high' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {rec.priority}
                    </span>
                    <p className="text-sm font-medium text-gray-800">{rec.title}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{rec.description}</p>
                  <ul className="mt-2 space-y-1">
                    {rec.actionItems.slice(0, 3).map((item, j) => (
                      <li key={j} className="text-xs text-gray-600 flex items-center gap-1">
                        <span className="text-gray-400">›</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Timeline */}
      {timeline && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Recruiting Timeline</h3>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-gray-500">Current Phase</p>
              <p className="text-sm font-medium text-gray-800 capitalize">
                {timeline.currentPhase.replace(/_/g, ' ')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Next Milestone</p>
              <p className="text-sm font-medium text-gray-800">{timeline.nextMilestone}</p>
              {timeline.daysToNextMilestone > 0 && (
                <p className="text-xs text-gray-400">{timeline.daysToNextMilestone} days</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            {timeline.currentPhaseActions.map((action, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-medium shrink-0">
                  {i + 1}
                </span>
                {action}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
