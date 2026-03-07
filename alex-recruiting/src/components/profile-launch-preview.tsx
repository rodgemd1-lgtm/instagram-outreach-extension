"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  MapPin,
  CalendarDays,
  Copy,
  Check,
  Rocket,
  ExternalLink,
  Loader2,
  CheckCircle2,
  Camera,
  Image,
  Pin,
  Heart,
  MessageCircle,
  Repeat2,
  BarChart3,
  Share,
  BadgeCheck,
} from "lucide-react";
import { jacobProfile } from "@/lib/data/jacob-profile";
import { jacobXProfile } from "@/lib/data/jacob-x-profile";

// ─── Bio Options ────────────────────────────────────────────────────────────

const bioOptions = [
  {
    id: "stats",
    label: "A -- Stats-Forward",
    bio: jacobProfile.bioVariations[0],
    rationale: "Leads with 47 pancakes and 0 sacks -- attention-grabbing production numbers.",
  },
  {
    id: "identity",
    label: "B -- Two-Way Identity",
    bio: jacobProfile.bioVariations[1],
    rationale: "Leads with DT/OG versatility -- differentiates from single-position recruits.",
  },
  {
    id: "measurables",
    label: "C -- Measurables",
    bio: jacobProfile.bioVariations[2],
    rationale: "Leads with bench/squat numbers -- shows physical readiness for college ball.",
  },
  {
    id: "coach",
    label: "D -- Coach-Targeted",
    bio: jacobProfile.bioVariations[3],
    rationale: 'Leads with team success (12-1), ends with "DMs open" -- direct call to action.',
  },
];

// ─── Component ──────────────────────────────────────────────────────────────

export function ProfileLaunchPreview() {
  const [selectedBio, setSelectedBio] = useState(0);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [launching, setLaunching] = useState(false);
  const [launched, setLaunched] = useState(false);
  const [launchError, setLaunchError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [liveFollowing, setLiveFollowing] = useState(jacobXProfile.followingCount);
  const [liveFollowers, setLiveFollowers] = useState(jacobXProfile.followersCount);

  const currentBio = bioOptions[selectedBio].bio;
  const displayName = jacobProfile.displayName;
  const handle = jacobXProfile.handle;
  const location = jacobXProfile.location;

  // Fetch real profile data on mount
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/profile/info");
        if (!res.ok) return;
        const data = await res.json();
        if (data.profile_image_url) {
          setProfileImageUrl(data.profile_image_url);
        }
        if (data.public_metrics) {
          setLiveFollowing(data.public_metrics.following_count ?? 0);
          setLiveFollowers(data.public_metrics.followers_count ?? 0);
        }
      } catch {
        // Fall back to defaults
      }
    }
    fetchProfile();
  }, []);

  const avatarElement = profileImageUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={profileImageUrl}
      alt="Jacob Rodgers"
      className="h-full w-full rounded-full object-cover"
    />
  ) : (
    <span className="text-2xl font-bold text-white">JR</span>
  );

  const avatarSmallElement = profileImageUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={profileImageUrl}
      alt="Jacob Rodgers"
      className="h-full w-full rounded-full object-cover"
    />
  ) : (
    <span className="text-sm font-bold">JR</span>
  );

  async function copyToClipboard(text: string, field: string) {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }

  async function handleLaunch() {
    setLaunching(true);
    setLaunchError(null);
    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio: currentBio,
          displayName,
          location,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");
      setLaunched(true);
      setDialogOpen(false);
    } catch (err) {
      setLaunchError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLaunching(false);
    }
  }

  // ─── Success State ──────────────────────────────────────────────────────

  if (launched) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border-2 border-green-200 bg-green-50 p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
            <div>
              <h2 className="text-xl font-bold text-green-900">Profile Launched</h2>
              <p className="text-sm text-green-700">Jacob&apos;s X profile has been updated successfully.</p>
            </div>
          </div>
          <a
            href={`https://x.com/${handle.replace("@", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
          >
            View on X <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Next Steps (Manual)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500 mb-4">
              The X API can set bio, display name, and location -- but these items require manual action in the X app:
            </p>
            <div className="space-y-3">
              {[
                { icon: Camera, label: "Upload profile photo", desc: "Professional headshot in Pewaukee jersey" },
                { icon: Image, label: "Upload header image", desc: 'Action shot with stats overlay: 6\'4" | 285 | DT/OG | State Champions' },
                { icon: Pin, label: "Pin recruiting post", desc: "Create and pin the recruiting card post with NCSA link" },
              ].map((step) => (
                <div key={step.label} className="flex items-start gap-3 rounded-lg border border-slate-200 p-3">
                  <step.icon className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{step.label}</p>
                    <p className="text-xs text-slate-500">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Main Preview ───────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Section A: X Profile Mockup */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="bg-black text-white">
          {/* Header gradient */}
          <div className="relative h-36 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-sm font-medium text-white/70 tracking-wider">
                6&apos;4&quot; &nbsp;|&nbsp; 285 &nbsp;|&nbsp; DT/OG &nbsp;|&nbsp; State Champions
              </p>
            </div>
            {/* Avatar */}
            <div className="absolute -bottom-10 left-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-black bg-slate-700 overflow-hidden">
                {avatarElement}
              </div>
            </div>
          </div>

          {/* Profile info */}
          <div className="px-4 pt-12 pb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">{displayName}</h2>
              <BadgeCheck className="h-5 w-5 text-blue-400" />
            </div>
            <p className="text-sm text-gray-500">{handle}</p>

            {/* Bio -- updates live */}
            <p className="mt-3 text-sm text-gray-200 whitespace-pre-line leading-relaxed">
              {currentBio}
            </p>

            {/* Location + join date */}
            <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {location}
              </span>
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" />
                Joined {jacobXProfile.joinDate}
              </span>
            </div>

            {/* Follower counts */}
            <div className="mt-2 flex items-center gap-4 text-xs">
              <span>
                <strong className="text-white">{liveFollowing}</strong>{" "}
                <span className="text-gray-500">Following</span>
              </span>
              <span>
                <strong className="text-white">{liveFollowers}</strong>{" "}
                <span className="text-gray-500">Followers</span>
              </span>
            </div>
          </div>

          {/* Tab bar mock */}
          <div className="flex border-b border-gray-800">
            {["Posts", "Replies", "Media", "Likes"].map((tab, i) => (
              <button
                key={tab}
                className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
                  i === 0
                    ? "border-b-2 border-blue-400 text-white"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Pinned post preview */}
          <div className="border-b border-gray-800 p-4">
            <div className="flex items-center gap-1.5 mb-2 text-xs text-gray-500">
              <Pin className="h-3 w-3" />
              Pinned
            </div>
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-700 overflow-hidden">
                {avatarSmallElement}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">{displayName}</span>
                  <BadgeCheck className="h-4 w-4 text-blue-400" />
                  <span className="text-xs text-gray-500">{handle}</span>
                </div>
                <p className="mt-1 text-sm text-gray-300 whitespace-pre-line leading-relaxed">
                  {jacobXProfile.pinnedPost.content}
                </p>
                {/* Engagement mock */}
                <div className="mt-3 flex items-center gap-6 text-gray-500">
                  {[
                    { icon: MessageCircle, count: "0" },
                    { icon: Repeat2, count: "0" },
                    { icon: Heart, count: "0" },
                    { icon: BarChart3, count: "0" },
                    { icon: Share, count: "" },
                  ].map((action, idx) => (
                    <span key={idx} className="flex items-center gap-1 text-xs">
                      <action.icon className="h-4 w-4" />
                      {action.count}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Section B: Bio Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Choose Bio</CardTitle>
          <p className="text-xs text-slate-500">
            Select a bio option below -- the profile preview above updates live.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {bioOptions.map((option, index) => (
            <button
              key={option.id}
              onClick={() => setSelectedBio(index)}
              className={`w-full text-left rounded-lg border-2 p-4 transition-all ${
                selectedBio === index
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                      selectedBio === index
                        ? "border-blue-500"
                        : "border-slate-300"
                    }`}
                  >
                    {selectedBio === index && (
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-slate-900">
                    {option.label}
                  </span>
                </div>
                <Badge variant="secondary" className="text-[10px]">
                  {option.bio.length} chars
                </Badge>
              </div>
              <p className="ml-6 text-xs font-mono text-slate-700 leading-relaxed">
                {option.bio}
              </p>
              <p className="ml-6 mt-1.5 text-[11px] text-slate-500 italic">
                {option.rationale}
              </p>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Section C: Profile Details Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Display Name", value: displayName },
              { label: "Handle", value: handle },
              { label: "Location", value: location },
              { label: "Website", value: jacobXProfile.website || "(not set)" },
            ].map((field) => (
              <div
                key={field.label}
                className="flex items-center justify-between rounded-lg border border-slate-200 p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                    {field.label}
                  </p>
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {field.value}
                  </p>
                </div>
                {field.value !== "(not set)" && (
                  <button
                    onClick={() => copyToClipboard(field.value, field.label)}
                    className="ml-2 shrink-0 rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                  >
                    {copiedField === field.label ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Pinned post full text */}
          <div className="mt-4 rounded-lg border border-slate-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                Pinned Post
              </p>
              <button
                onClick={() =>
                  copyToClipboard(jacobXProfile.pinnedPost.content, "pinned")
                }
                className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                {copiedField === "pinned" ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed font-mono">
              {jacobXProfile.pinnedPost.content}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Section D: Approve & Launch */}
      <Card className="border-2 border-green-200">
        <CardContent className="pt-6">
          {launchError && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {launchError}
            </div>
          )}

          <div className="text-center">
            <p className="text-sm text-slate-600 mb-4">
              This will update Jacob&apos;s X profile with the selected bio, display name, and location.
            </p>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white gap-2"
                >
                  <Rocket className="h-5 w-5" />
                  Approve &amp; Launch Profile
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Launch Jacob&apos;s X Profile?</DialogTitle>
                  <DialogDescription>
                    This will push the following to {handle}:
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-2">
                  <div className="rounded-lg bg-slate-50 p-3 text-sm space-y-1">
                    <p>
                      <strong>Display Name:</strong> {displayName}
                    </p>
                    <p>
                      <strong>Location:</strong> {location}
                    </p>
                    <p>
                      <strong>Bio:</strong>
                    </p>
                    <p className="font-mono text-xs text-slate-700">{currentBio}</p>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    disabled={launching}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleLaunch}
                    disabled={launching}
                    className="bg-green-600 hover:bg-green-700 text-white gap-2"
                  >
                    {launching ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Launching...
                      </>
                    ) : (
                      <>
                        <Rocket className="h-4 w-4" />
                        Confirm Launch
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
