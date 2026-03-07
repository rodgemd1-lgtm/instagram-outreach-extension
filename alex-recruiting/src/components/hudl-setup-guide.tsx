"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ExternalLink,
  CheckCircle2,
  Loader2,
  Video,
  ClipboardList,
  UserPlus,
  Ruler,
  Upload,
  GraduationCap,
  Share2,
  Monitor,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// ─── Types ───────────────────────────────────────────────────────────────────

interface HudlProfileData {
  name: string;
  position: string;
  school: string;
  height: string;
  weight: string;
  highlightsCount: number;
}

interface ScraperResult {
  success: boolean;
  data?: HudlProfileData;
  error?: string;
}

// ─── Setup Steps ─────────────────────────────────────────────────────────────

const SETUP_STEPS = [
  {
    number: 1,
    title: "Sign Up on Hudl",
    description: 'Go to hudl.com and click "Sign Up" to create a new account.',
    icon: Monitor,
  },
  {
    number: 2,
    title: "Select Account Type",
    description: 'Choose "Athlete" as your account type during registration.',
    icon: UserPlus,
  },
  {
    number: 3,
    title: "Enter Profile Information",
    description:
      "Enter Jacob's info: Name, Pewaukee HS, Class of 2029.",
    icon: ClipboardList,
  },
  {
    number: 4,
    title: "Choose Position",
    description: "Select Offensive Lineman as the primary position.",
    icon: Video,
  },
  {
    number: 5,
    title: "Add Measurables",
    description: 'Add measurables: 6\'4", 285 lbs.',
    icon: Ruler,
  },
  {
    number: 6,
    title: "Upload Highlight Video",
    description:
      "Upload highlight video with at least 3-5 plays showing pass protection and run blocking.",
    icon: Upload,
  },
  {
    number: 7,
    title: "Add Academic Info",
    description: "Add academic information: 3.7 GPA.",
    icon: GraduationCap,
  },
  {
    number: 8,
    title: "Share Profile",
    description:
      "Share profile URL with coaches and add to X bio for maximum visibility.",
    icon: Share2,
  },
];

// ─── Main Component ──────────────────────────────────────────────────────────

export function HudlSetupGuide({
  compact = false,
}: {
  compact?: boolean;
}) {
  const [hudlUrl, setHudlUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScraperResult | null>(null);

  async function handleTestScraper() {
    if (!hudlUrl.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/intelligence/hudl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: hudlUrl }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ success: true, data });
      } else {
        setResult({
          success: false,
          error: data.error || "Failed to scrape Hudl profile",
        });
      }
    } catch (err) {
      setResult({
        success: false,
        error:
          err instanceof Error
            ? err.message
            : "Network error — could not reach scraper",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={compact ? "space-y-4" : "space-y-6"}>
      {/* ── Status Banner ──────────────────────────────────────────────── */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              Hudl Profile Not Yet Created
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Jacob doesn&apos;t have a Hudl profile yet. Follow the steps below
              to create one.
            </p>
          </div>
        </div>
      </div>

      {/* ── 8-Step Setup Guide ─────────────────────────────────────────── */}
      <Card>
        <CardHeader className={compact ? "pb-2" : undefined}>
          <CardTitle
            className={
              compact
                ? "text-base flex items-center gap-2"
                : "text-lg flex items-center gap-2"
            }
          >
            <Video className="h-5 w-5 text-slate-600" />
            Hudl Profile Setup Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          {compact ? (
            /* Compact mode: simple numbered list */
            <ol className="space-y-2">
              {SETUP_STEPS.map((step) => (
                <li key={step.number} className="flex items-start gap-2">
                  <span className="flex-shrink-0 text-xs font-bold text-slate-500 mt-0.5">
                    {step.number}.
                  </span>
                  <div>
                    <span className="text-sm font-medium text-slate-800">
                      {step.title}
                    </span>
                    <span className="text-sm text-slate-500">
                      {" "}
                      &mdash; {step.description}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            /* Full mode: card-like rows */
            <div className="space-y-3">
              {SETUP_STEPS.map((step) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.number}
                    className="flex items-start gap-4 rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-300 transition-colors"
                  >
                    {/* Step number circle */}
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold">
                      {step.number}
                    </div>
                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Icon className="h-4 w-4 text-slate-400 flex-shrink-0" />
                        <p className="text-sm font-semibold text-slate-900">
                          {step.title}
                        </p>
                      </div>
                      <p className="text-sm text-slate-500">
                        {step.description}
                      </p>
                    </div>
                    {/* External link for step 1 */}
                    {step.number === 1 && (
                      <a
                        href="https://www.hudl.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 mt-1"
                      >
                        <ExternalLink className="h-4 w-4 text-slate-400 hover:text-slate-600 transition-colors" />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Scraper Test Section ───────────────────────────────────────── */}
      <Card>
        <CardHeader className={compact ? "pb-2" : undefined}>
          <div className="flex items-center justify-between">
            <CardTitle
              className={
                compact
                  ? "text-base flex items-center gap-2"
                  : "text-lg flex items-center gap-2"
              }
            >
              <Monitor className="h-5 w-5 text-slate-600" />
              Scraper Test
            </CardTitle>
            {/* Scraper Status Badge */}
            <div className="flex flex-col items-end gap-0.5">
              <Badge className="bg-green-100 text-green-700 border-green-200 gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Scraper Ready
              </Badge>
              <span className="text-[10px] text-slate-400">
                Powered by Jina Reader with Firecrawl fallback
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={hudlUrl}
              onChange={(e) => setHudlUrl(e.target.value)}
              placeholder="https://www.hudl.com/profile/..."
              className="flex-1"
              disabled={loading}
            />
            <Button
              onClick={handleTestScraper}
              disabled={loading || !hudlUrl.trim()}
              className="gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                "Test Scraper"
              )}
            </Button>
          </div>

          {/* Result display */}
          {result && (
            <div className="mt-4">
              {result.success && result.data ? (
                <div className="space-y-3">
                  <Badge className="bg-green-100 text-green-700 border-green-200 gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Profile Scraped Successfully
                  </Badge>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                    {[
                      { label: "Name", value: result.data.name },
                      { label: "Position", value: result.data.position },
                      { label: "School", value: result.data.school },
                      { label: "Height", value: result.data.height },
                      { label: "Weight", value: result.data.weight },
                      {
                        label: "Highlights",
                        value: String(result.data.highlightsCount),
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                      >
                        <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">
                          {item.label}
                        </p>
                        <p className="text-sm font-semibold text-slate-900 mt-0.5">
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Error
                  </Badge>
                  <p className="text-sm text-red-600 mt-0.5">
                    {result.error}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
