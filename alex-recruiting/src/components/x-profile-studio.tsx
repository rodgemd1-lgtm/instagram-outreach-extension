"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Film,
  Image as ImageIcon,
  Link as LinkIcon,
  Loader2,
  MapPin,
  Palette,
  Pin,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { jacobProfile } from "@/lib/data/jacob-profile";
import type { MediaLabSnapshot } from "@/lib/media-lab/types";
import { SUSAN_MEDIA_TEAM } from "@/lib/media-lab/team";
import type { Post } from "@/lib/types";
import { cn } from "@/lib/utils";

const BRAND_COLORS = [
  { name: "Pewaukee Navy", hex: "#0F284B", use: "Primary" },
  { name: "Pewaukee Gold", hex: "#C89B3C", use: "Accent" },
  { name: "Warm Stone", hex: "#E7DED1", use: "Background" },
  { name: "Field Black", hex: "#111827", use: "Type" },
];

const RECOMMENDED_BIO =
  `OL/DL | ${jacobProfile.height} ${jacobProfile.weight.replace(" lbs", "")} | ${jacobProfile.school.replace(" High School", " HS")} '${String(jacobProfile.classYear).slice(2)}\n${jacobProfile.state} | ${jacobProfile.gpa} GPA | NCSA Athlete`;

function buildPinnedPost(websiteLink: string): string {
  const lines = [
    `Jacob Rodgers | ${jacobProfile.position} | Class of ${jacobProfile.classYear}`,
    `${jacobProfile.height} ${jacobProfile.weight.replace(" lbs", "")} | ${jacobProfile.school} (${jacobProfile.state})`,
    `${jacobProfile.gpa} GPA | State Champion | ${jacobProfile.seasonStats.pancakeBlocks} pancakes | ${jacobProfile.seasonStats.sacks} sacks`,
  ];

  if (websiteLink) {
    lines.push(`Film / profile: ${websiteLink}`);
  } else {
    lines.push("Add Hudl or NCSA link before posting this pinned update.");
  }

  lines.push("#2029Recruit #FootballRecruiting #WisconsinFootball");
  return lines.join("\n");
}

function isVideoMedia(mediaUrl: string | null): boolean {
  return Boolean(mediaUrl?.includes("/api/videos/serve"));
}

function safePreviewImage(snapshot: MediaLabSnapshot | null): string | null {
  if (!snapshot) return null;
  return (
    snapshot.topPhotos.find((photo) => photo.recommendedUse === "profile")?.optimizedPath ??
    snapshot.topPhotos.find((photo) => photo.category === "profile")?.optimizedPath ??
    snapshot.topPhotos[0]?.optimizedPath ??
    null
  );
}

function safeHeaderImage(snapshot: MediaLabSnapshot | null): string | null {
  if (!snapshot) return null;
  return (
    snapshot.topPhotos.find((photo) => photo.recommendedUse === "hero")?.optimizedPath ??
    snapshot.topPhotos[0]?.optimizedPath ??
    null
  );
}

interface XConnectionStatus {
  connected: boolean;
  needsReconnect: boolean;
  authMode: "oauth2" | "legacy_oauth1" | "none";
  username: string | null;
  displayName: string | null;
  providerUserId: string | null;
  expiresAt: string | null;
  hasRefreshToken: boolean;
  missingScopes: string[];
  legacyProfileToolsAvailable: boolean;
  legacyProfileConnected: boolean;
  legacyProfileUsername: string | null;
  legacyProfileNeedsReconnect: boolean;
}

export function XProfileStudio() {
  const [snapshot, setSnapshot] = useState<MediaLabSnapshot | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<XConnectionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profileUpdating, setProfileUpdating] = useState(false);
  const [headerLoading, setHeaderLoading] = useState<"generate" | "upload" | null>(null);
  const [studioMessage, setStudioMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [headerAvailable, setHeaderAvailable] = useState(false);
  const [copyState, setCopyState] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState<string>(jacobProfile.displayName);
  const [bio, setBio] = useState<string>(RECOMMENDED_BIO);
  const [location, setLocation] = useState<string>(`${jacobProfile.city}, ${jacobProfile.state}`);
  const [websiteLink, setWebsiteLink] = useState<string>(
    jacobProfile.ncsaProfileUrl || jacobProfile.hudlUrl || jacobProfile.websiteUrl || ""
  );
  const [pinnedPost, setPinnedPost] = useState<string>(buildPinnedPost(""));

  useEffect(() => {
    setPinnedPost((current) => {
      if (current.trim().length === 0 || current.includes("Add Hudl or NCSA link")) {
        return buildPinnedPost(websiteLink);
      }

      return current;
    });
  }, [websiteLink]);

  useEffect(() => {
    let active = true;

    async function loadStudio(refresh = false) {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const [mediaRes, postsRes, headerRes, authRes] = await Promise.all([
          fetch("/api/media-lab"),
          fetch("/api/posts"),
          fetch("/header-image.png", { method: "HEAD" }),
          fetch("/api/auth/twitter/status"),
        ]);

        const mediaData = await mediaRes.json().catch(() => ({}));
        const postsData = await postsRes.json().catch(() => ({}));
        const authData = await authRes.json().catch(() => ({}));

        if (!active) return;

        setSnapshot(mediaData.snapshot ?? null);
        setPosts(postsData.posts ?? []);
        setHeaderAvailable(headerRes.ok);
        setConnectionStatus(authRes.ok ? (authData as XConnectionStatus) : null);
      } catch (error) {
        if (!active) return;
        setStudioMessage({
          kind: "error",
          text: error instanceof Error ? error.message : "Failed to load studio data",
        });
      } finally {
        if (!active) return;
        setLoading(false);
        setRefreshing(false);
      }
    }

    void loadStudio();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authState = params.get("xAuth");
    if (!authState) return;

    if (authState === "success") {
      const username = params.get("username");
      setStudioMessage({
        kind: "success",
        text: username
          ? `Connected to X as @${username}. The app will now refresh this token automatically for posting, follows, likes, and DMs.`
          : "Connected to X. The app will now refresh this token automatically for posting, follows, likes, and DMs.",
      });
      return;
    }

    if (authState === "error") {
      const detail = params.get("detail");
      const reason = params.get("reason");
      setStudioMessage({
        kind: "error",
        text: detail ?? reason ?? "X connection failed.",
      });
    }

    const legacyAuthState = params.get("xLegacyAuth");
    if (legacyAuthState === "success") {
      const username = params.get("legacyUsername");
      setStudioMessage({
        kind: "success",
        text: username
          ? `Connected X profile tools as @${username}. Profile and banner updates now use the same live account.`
          : "Connected X profile tools. Profile and banner updates now use the same live account.",
      });
      return;
    }

    if (legacyAuthState === "error") {
      const reason = params.get("reason");
      setStudioMessage({
        kind: "error",
        text: reason ?? "X profile-tools connection failed.",
      });
    }
  }, []);

  const previewAvatar = useMemo(() => safePreviewImage(snapshot), [snapshot]);
  const previewHeader = useMemo(
    () => (headerAvailable ? "/header-image.png" : safeHeaderImage(snapshot)),
    [headerAvailable, snapshot]
  );

  const queueSummary = useMemo(() => {
    const approved = posts.filter((post) => post.status === "approved");
    const drafts = posts.filter((post) => post.status === "draft");
    const posted = posts.filter((post) => post.status === "posted");

    return {
      approved,
      drafts,
      posted,
      featured:
        approved[0] ??
        drafts[0] ??
        null,
    };
  }, [posts]);

  const readinessChecks = useMemo(() => {
    const checks = [
      {
        label: "Profile copy is coach-ready",
        complete: bio.length > 40 && bio.length <= 160 && !/dms open|built different|recruit me/i.test(bio),
      },
      {
        label: "Film or recruiting link is present",
        complete: websiteLink.trim().length > 0,
      },
      {
        label: "Header asset exists",
        complete: headerAvailable,
      },
      {
        label: "Media lab ranked real assets",
        complete: Boolean(snapshot && snapshot.topPhotos.length >= 20 && snapshot.topVideos.length >= 20),
      },
      {
        label: "Publishing queue is stocked",
        complete: posts.length >= 3,
      },
    ];

    const complete = checks.filter((check) => check.complete).length;
    return {
      checks,
      score: Math.round((complete / checks.length) * 100),
      nextAction:
        checks.find((check) => !check.complete)?.label ?? "Studio is ready for execution.",
    };
  }, [bio, headerAvailable, posts.length, snapshot, websiteLink]);

  const teamCards = useMemo(
    () =>
      SUSAN_MEDIA_TEAM.filter((member) =>
        ["susan", "marcus", "prism", "lens", "dashboard", "trey", "jordan", "sophie"].includes(member.id)
      ),
    []
  );

  async function refreshStudio() {
    setStudioMessage(null);
    setRefreshing(true);
    try {
      const [mediaRes, postsRes, authRes] = await Promise.all([
        fetch("/api/media-lab", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ optimizePhotos: true, buildReel: true, queuePosts: true }),
        }),
        fetch("/api/posts"),
        fetch("/api/auth/twitter/status"),
      ]);
      const mediaData = await mediaRes.json().catch(() => ({}));
      const postsData = await postsRes.json().catch(() => ({}));
      const authData = await authRes.json().catch(() => ({}));

      setSnapshot(mediaData.snapshot ?? null);
      setPosts(postsData.posts ?? []);
      setConnectionStatus(authRes.ok ? (authData as XConnectionStatus) : null);
      setStudioMessage({ kind: "success", text: "Studio refreshed from the latest media analysis." });
    } catch (error) {
      setStudioMessage({
        kind: "error",
        text: error instanceof Error ? error.message : "Failed to refresh studio",
      });
    } finally {
      setRefreshing(false);
    }
  }

  async function updateProfileViaApi() {
    setStudioMessage(null);
    setProfileUpdating(true);
    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio,
          displayName,
          location,
          websiteUrl: websiteLink,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Profile update failed");
      }

      setStudioMessage({
        kind: "success",
        text:
          typeof data.warning === "string"
            ? data.warning
            : "Display name, bio, location, and website were sent to X.",
      });
    } catch (error) {
      setStudioMessage({
        kind: "error",
        text: error instanceof Error ? error.message : "Profile update failed",
      });
    } finally {
      setProfileUpdating(false);
    }
  }

  async function handleHeaderAction(upload: boolean) {
    setStudioMessage(null);
    setHeaderLoading(upload ? "upload" : "generate");
    try {
      const res = await fetch(`/api/profile/header?upload=${upload}`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Header action failed");
      }

      setHeaderAvailable(true);
      setStudioMessage({
        kind: "success",
        text:
          typeof data.uploadMessage === "string"
            ? data.uploadMessage
            : upload
              ? "Current header image uploaded to X."
              : "Header generated locally. Review it before uploading to X.",
      });
    } catch (error) {
      setStudioMessage({
        kind: "error",
        text: error instanceof Error ? error.message : "Header action failed",
      });
    } finally {
      setHeaderLoading(null);
    }
  }

  async function copyText(key: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopyState(key);
    setTimeout(() => setCopyState(null), 1800);
  }

  if (loading) {
    return (
      <div className="flex min-h-[480px] items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(200,155,60,0.18),_transparent_38%),linear-gradient(180deg,_#f5f1e8_0%,_#f8fafc_46%,_#eef2f7_100%)]">
      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-950 text-white shadow-xl">
          <div className="grid gap-6 p-6 lg:grid-cols-[1.15fr_0.85fr] lg:p-8">
            <div className="space-y-4">
              <Badge className="border border-amber-300/30 bg-amber-400/15 text-amber-200">
                Susan&apos;s Team Design Studio
              </Badge>
              <div>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Design Studio
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                  This studio now runs on Jacob&apos;s real media library, real post queue, and real X update actions. Trey owns copy, Jordan owns visuals, Sophie owns ranking, and Susan holds the final approval line.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => void refreshStudio()} disabled={refreshing} className="bg-amber-400 text-slate-950 hover:bg-amber-300">
                  {refreshing ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  Refresh Studio
                </Button>
                <Button asChild variant="outline" className="border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800">
                  <Link href="/media-lab">Open Media Lab</Link>
                </Button>
                <Button asChild variant="outline" className="border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800">
                  <Link href="/posts">Open Post Queue</Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {[
                { label: "Studio Readiness", value: `${readinessChecks.score}%`, sublabel: readinessChecks.nextAction },
                { label: "Ranked Assets", value: `${snapshot?.topPhotos.length ?? 0} photos / ${snapshot?.topVideos.length ?? 0} clips`, sublabel: "Real imported media" },
                { label: "Queue Status", value: `${queueSummary.drafts.length} drafts / ${queueSummary.approved.length} approved`, sublabel: "Ready for X publishing" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-800 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
                  <p className="mt-2 text-2xl font-bold">{item.value}</p>
                  <p className="mt-1 text-xs text-slate-400">{item.sublabel}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {studioMessage ? (
          <div
            className={cn(
              "rounded-2xl border px-4 py-3 text-sm",
              studioMessage.kind === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700"
            )}
          >
            {studioMessage.text}
          </div>
        ) : null}

        {connectionStatus ? (
          <section className="rounded-[24px] border border-slate-200 bg-white/90 p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {connectionStatus.connected && !connectionStatus.needsReconnect ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  )}
                  <h2 className="text-lg font-semibold text-slate-900">
                    X Connection Status
                  </h2>
                </div>
                <p className="text-sm text-slate-600">
                  {connectionStatus.connected && !connectionStatus.needsReconnect
                    ? `Connected as @${connectionStatus.username ?? "unknown"} with auto-refresh enabled.`
                    : connectionStatus.username
                      ? `Stored account @${connectionStatus.username} needs attention before the app can keep using it reliably.`
                      : "No durable X account is connected yet."}
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                  <Badge variant={connectionStatus.connected ? "approved" : "draft"}>
                    {connectionStatus.connected ? "OAuth 2.0 active" : "Reconnect required"}
                  </Badge>
                  <Badge variant="outline">
                    {connectionStatus.hasRefreshToken ? "Refresh token present" : "No refresh token"}
                  </Badge>
                  <Badge variant="outline">
                    {connectionStatus.legacyProfileToolsAvailable
                      ? "Legacy profile tools available"
                      : "Legacy profile tools unavailable"}
                  </Badge>
                  <Badge variant="outline">
                    {connectionStatus.legacyProfileConnected
                      ? `Profile tools linked${connectionStatus.legacyProfileUsername ? `: @${connectionStatus.legacyProfileUsername}` : ""}`
                      : "Profile tools not linked"}
                  </Badge>
                </div>
                {connectionStatus.missingScopes.length > 0 ? (
                  <p className="text-sm text-amber-700">
                    Missing scopes: {connectionStatus.missingScopes.join(", ")}
                  </p>
                ) : null}
                <p className="text-xs text-slate-500">
                  Posts, follows, likes, DMs, and media uploads use the connected OAuth 2.0 account. Profile name, avatar, and banner updates use a separate legacy X user-context grant because X keeps those APIs on the older auth surface.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/api/auth/twitter?returnTo=/profile-studio">
                    {connectionStatus.connected && !connectionStatus.needsReconnect
                      ? "Reconnect X"
                      : "Connect X"}
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-slate-200">
                  <Link href="/api/auth/twitter/legacy?returnTo=/profile-studio">
                    {connectionStatus.legacyProfileConnected
                      ? "Reconnect Profile Tools"
                      : "Connect Profile Tools"}
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="border-slate-200"
                  onClick={() => void refreshStudio()}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Status
                </Button>
              </div>
            </div>
          </section>
        ) : null}

        <Tabs defaultValue="command" className="space-y-6">
          <TabsList className="h-auto w-full flex-wrap justify-start gap-2 rounded-2xl bg-white/80 p-2">
            <TabsTrigger value="command">Command</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="visual">Visuals</TabsTrigger>
            <TabsTrigger value="publishing">Publishing</TabsTrigger>
            <TabsTrigger value="launch">Launch</TabsTrigger>
          </TabsList>

          <TabsContent value="command" className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ShieldCheck className="h-5 w-5 text-slate-700" />
                    Studio Readiness Audit
                  </CardTitle>
                  <CardDescription>
                    Fast read on what is ready and what still blocks a clean profile launch.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {readinessChecks.checks.map((check) => (
                    <div key={check.label} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <div className="flex items-center gap-3">
                        {check.complete ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-amber-600" />
                        )}
                        <span className="text-sm font-medium text-slate-800">{check.label}</span>
                      </div>
                      <Badge variant={check.complete ? "approved" : "draft"}>
                        {check.complete ? "Ready" : "Needs work"}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="h-5 w-5 text-slate-700" />
                    Susan&apos;s Team
                  </CardTitle>
                  <CardDescription>
                    The people and lanes that now drive the studio instead of generic placeholders.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3">
                  {teamCards.map((member) => (
                    <div key={member.id} className="rounded-xl border border-slate-200 bg-white p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{member.name}</p>
                          <p className="text-xs text-slate-500">{member.role}</p>
                        </div>
                        <Badge variant="outline">{member.owns[0]}</Badge>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-slate-600">{member.background}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Live Profile Controls</CardTitle>
                  <CardDescription>
                    Edit the real profile fields and push them to X when the copy is approved.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Display name</label>
                    <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={50} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Bio</label>
                    <Textarea
                      value={bio}
                      onChange={(e) => e.target.value.length <= 160 && setBio(e.target.value)}
                      rows={4}
                    />
                    <div className="mt-1 flex items-center justify-between text-xs">
                      <span className={cn(bio.length > 160 ? "text-red-600" : "text-slate-500")}>
                        {bio.length}/160
                      </span>
                      <Button variant="ghost" size="sm" onClick={() => void copyText("bio", bio)}>
                        {copyState === "bio" ? (
                          <>
                            <Check className="mr-1 h-3.5 w-3.5 text-green-600" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="mr-1 h-3.5 w-3.5" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Location</label>
                      <Input value={location} onChange={(e) => setLocation(e.target.value)} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Website</label>
                      <Input value={websiteLink} onChange={(e) => setWebsiteLink(e.target.value)} placeholder="Paste NCSA or Hudl URL" />
                    </div>
                  </div>
                  <Button onClick={() => void updateProfileViaApi()} disabled={profileUpdating}>
                    {profileUpdating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowRight className="mr-2 h-4 w-4" />
                    )}
                    Update Profile on X
                  </Button>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-slate-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Preview</CardTitle>
                  <CardDescription>
                    Current studio preview with the latest generated header and top-ranked media.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-hidden rounded-[24px] border border-slate-800 bg-black text-white">
                    <div className="relative h-44 bg-slate-900">
                      {previewHeader ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={previewHeader} alt="Header preview" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900/60">
                          <p className="text-sm text-slate-300">No header generated yet</p>
                        </div>
                      )}
                    </div>
                    <div className="relative px-5 pb-5">
                      <div className="-mt-10 flex justify-between">
                        <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-black bg-slate-800">
                          {previewAvatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={previewAvatar} alt="Profile preview" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xl font-bold">JR</div>
                          )}
                        </div>
                        <div className="mt-3 rounded-full border border-slate-600 px-4 py-1.5 text-sm font-semibold text-slate-200">
                          Edit profile
                        </div>
                      </div>
                      <div className="mt-3 space-y-2">
                        <div>
                          <p className="text-xl font-bold">{displayName}</p>
                          <p className="text-sm text-slate-500">{jacobProfile.xHandle}</p>
                        </div>
                        <p className="whitespace-pre-line text-sm leading-6">{bio}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {location}
                          </span>
                          <span className="flex items-center gap-1 text-blue-400">
                            <LinkIcon className="h-4 w-4" />
                            {websiteLink || "Add film or NCSA link"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="visual" className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="h-5 w-5 text-slate-700" />
                    Visual Command Board
                  </CardTitle>
                  <CardDescription>
                    Jordan&apos;s recommended assets, Pewaukee color system, and the header workflow that can actually ship.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {(snapshot?.topPhotos.slice(0, 4) ?? []).map((photo) => (
                      <div key={photo.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={photo.optimizedPath ?? `/api/photos/${photo.id}/file`} alt={photo.name} className="aspect-[4/3] w-full object-cover" />
                        <div className="space-y-2 p-3">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-sm font-semibold text-slate-900">{photo.name}</p>
                            <Badge variant="secondary">{photo.score}</Badge>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="outline">{photo.recommendedUse}</Badge>
                            {photo.tags.slice(0, 2).map((tag) => (
                              <Badge key={`${photo.id}-${tag}`} variant="secondary">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={() => void handleHeaderAction(false)} disabled={headerLoading !== null}>
                      {headerLoading === "generate" ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <ImageIcon className="mr-2 h-4 w-4" />
                      )}
                      Generate Header
                    </Button>
                    <Button variant="outline" onClick={() => void handleHeaderAction(true)} disabled={headerLoading !== null}>
                      {headerLoading === "upload" ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="mr-2 h-4 w-4" />
                      )}
                      Upload Current Header to X
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Palette className="h-5 w-5 text-slate-700" />
                    Pewaukee Palette
                  </CardTitle>
                  <CardDescription>
                    The studio uses this palette to keep every asset visually coherent.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {BRAND_COLORS.map((color) => (
                      <div key={color.name} className="rounded-2xl border border-slate-200 bg-white p-3">
                        <div className="h-16 rounded-xl border border-slate-200" style={{ backgroundColor: color.hex }} />
                        <p className="mt-2 text-sm font-semibold text-slate-900">{color.name}</p>
                        <p className="text-xs text-slate-500">{color.hex}</p>
                        <Badge variant="secondary" className="mt-2">
                          {color.use}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    Warm stone + navy keeps the studio lighter and easier to use, while the gold accents preserve school identity without turning the UI into a generic sports template.
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="publishing" className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Pin className="h-5 w-5 text-slate-700" />
                    Pinned Post Builder
                  </CardTitle>
                  <CardDescription>
                    Keep the pinned post coach-readable and link-forward.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={pinnedPost}
                    onChange={(e) => e.target.value.length <= 280 && setPinnedPost(e.target.value)}
                    rows={8}
                    className="font-mono text-sm"
                  />
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{pinnedPost.length}/280</span>
                    <Button variant="ghost" size="sm" onClick={() => void copyText("pinned", pinnedPost)}>
                      {copyState === "pinned" ? (
                        <>
                          <Check className="mr-1 h-3.5 w-3.5 text-green-600" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="mr-1 h-3.5 w-3.5" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Film className="h-5 w-5 text-slate-700" />
                    Queue Snapshot
                  </CardTitle>
                  <CardDescription>
                    Approved posts can now be sent to X with attached media through the queue.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {queueSummary.featured ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="flex items-center gap-2">
                        <Badge variant={queueSummary.featured.pillar}>{queueSummary.featured.pillar.replace("_", " ")}</Badge>
                        <Badge variant="outline">{queueSummary.featured.status}</Badge>
                        <Badge variant="secondary">
                          {isVideoMedia(queueSummary.featured.mediaUrl) ? "Video" : "Photo"}
                        </Badge>
                      </div>
                      <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">
                        {queueSummary.featured.content}
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                      No queued posts yet. Refresh the studio or open the media lab to generate more drafts.
                    </div>
                  )}
                  <div className="flex flex-wrap gap-3">
                    <Button asChild>
                      <Link href="/posts">Review Queue</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/media-lab">Review Ranked Media</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="launch" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Launch Checklist</CardTitle>
                <CardDescription>
                  These are the next operator actions to move from setup to execution.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                {[
                  {
                    label: "Push profile copy to X",
                    detail: "Display name, bio, location, and website are ready to send through the API.",
                    ready: readinessChecks.checks[0]?.complete,
                  },
                  {
                    label: "Generate and upload header",
                    detail: "Use the studio header action after reviewing the current hero asset.",
                    ready: snapshot?.topPhotos.length ? true : false,
                  },
                  {
                    label: "Approve three posts",
                    detail: "The queue now supports real media uploads on send.",
                    ready: queueSummary.drafts.length > 0 || queueSummary.approved.length > 0,
                  },
                  {
                    label: "Open X settings",
                    detail: "Manual review still matters for final profile polish and pinned-post confirmation.",
                    ready: true,
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-start justify-between rounded-2xl border border-slate-200 bg-white px-4 py-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                      <p className="mt-1 text-xs text-slate-500">{item.detail}</p>
                    </div>
                    <Badge variant={item.ready ? "approved" : "draft"}>
                      {item.ready ? "Ready" : "Blocked"}
                    </Badge>
                  </div>
                ))}
                <div className="flex flex-wrap gap-3 pt-2">
                  <Button asChild>
                    <Link href="https://x.com/settings/profile" target="_blank">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open X Settings
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/posts">Open Queue</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
