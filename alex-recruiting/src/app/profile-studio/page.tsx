"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SCPageHeader } from "@/components/sc/sc-page-header";
import { SCGlassCard } from "@/components/sc/sc-glass-card";
import { SCStatCard } from "@/components/sc/sc-stat-card";
import { SCBadge } from "@/components/sc/sc-badge";
import { SCButton } from "@/components/sc/sc-button";
import { SCInput } from "@/components/sc/sc-input";
import { SCTabs } from "@/components/sc/sc-tabs";
import { jacobProfile } from "@/lib/data/jacob-profile";
import type { MediaLabSnapshot } from "@/lib/media-lab/types";
import { SUSAN_MEDIA_TEAM } from "@/lib/media-lab/team";
import type { Post } from "@/lib/types";

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
    lines.push("Add the public recruit page before posting this pinned update.");
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

const TABS = [
  { value: "command", label: "Command" },
  { value: "profile", label: "Profile" },
  { value: "visual", label: "Visuals" },
  { value: "publishing", label: "Publishing" },
  { value: "launch", label: "Launch" },
];

export default function ProfileStudioPage() {
  const [activeTab, setActiveTab] = useState("command");
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
    jacobProfile.websiteUrl || jacobProfile.ncsaProfileUrl || jacobProfile.hudlUrl || ""
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
      featured: approved[0] ?? drafts[0] ?? null,
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
        <span className="material-symbols-outlined text-[32px] animate-spin text-slate-400">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SCPageHeader
        title="PROFILE STUDIO"
        subtitle="Design, preview, and push your X profile with real media and real data."
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SCStatCard
          label="Studio Readiness"
          value={`${readinessChecks.score}%`}
          icon="verified"
          progress={readinessChecks.score}
        />
        <SCStatCard
          label="Ranked Assets"
          value={`${snapshot?.topPhotos.length ?? 0} / ${snapshot?.topVideos.length ?? 0}`}
          icon="photo_library"
        />
        <SCStatCard
          label="Drafts"
          value={String(queueSummary.drafts.length)}
          icon="edit_note"
        />
        <SCStatCard
          label="Approved"
          value={String(queueSummary.approved.length)}
          icon="check_circle"
        />
      </div>

      {/* Action bar */}
      <div className="flex flex-wrap gap-3">
        <SCButton onClick={() => void refreshStudio()} disabled={refreshing}>
          <span className={`material-symbols-outlined text-[16px] mr-1.5 ${refreshing ? "animate-spin" : ""}`}>
            {refreshing ? "progress_activity" : "refresh"}
          </span>
          Refresh Studio
        </SCButton>
        <Link href="/media-lab">
          <SCButton variant="secondary">
            <span className="material-symbols-outlined text-[16px] mr-1.5">science</span>
            Open Media Lab
          </SCButton>
        </Link>
        <Link href="/posts">
          <SCButton variant="secondary">
            <span className="material-symbols-outlined text-[16px] mr-1.5">queue</span>
            Open Post Queue
          </SCButton>
        </Link>
      </div>

      {/* Studio message */}
      {studioMessage && (
        <SCGlassCard variant={studioMessage.kind === "success" ? "default" : "broadcast"} className="px-4 py-3">
          <div className="flex items-center gap-2">
            <span className={`material-symbols-outlined text-[18px] ${studioMessage.kind === "success" ? "text-green-400" : "text-red-400"}`}>
              {studioMessage.kind === "success" ? "check_circle" : "error"}
            </span>
            <p className="text-sm text-slate-300">{studioMessage.text}</p>
          </div>
        </SCGlassCard>
      )}

      {/* X Connection Status */}
      {connectionStatus && (
        <SCGlassCard variant="strong" className="p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined text-[20px] ${connectionStatus.connected && !connectionStatus.needsReconnect ? "text-green-400" : "text-amber-400"}`}>
                  {connectionStatus.connected && !connectionStatus.needsReconnect ? "check_circle" : "warning"}
                </span>
                <p className="text-sm font-bold text-white">X Connection Status</p>
              </div>
              <p className="text-xs text-slate-400">
                {connectionStatus.connected && !connectionStatus.needsReconnect
                  ? `Connected as @${connectionStatus.username ?? "unknown"} with auto-refresh enabled.`
                  : connectionStatus.username
                    ? `Stored account @${connectionStatus.username} needs attention before the app can keep using it reliably.`
                    : "No durable X account is connected yet."}
              </p>
              <div className="flex flex-wrap gap-1.5">
                <SCBadge variant={connectionStatus.connected ? "success" : "danger"}>
                  {connectionStatus.connected ? "OAuth 2.0 active" : "Reconnect required"}
                </SCBadge>
                <SCBadge>{connectionStatus.hasRefreshToken ? "Refresh token present" : "No refresh token"}</SCBadge>
                <SCBadge>
                  {connectionStatus.legacyProfileToolsAvailable
                    ? "Legacy profile tools available"
                    : "Legacy profile tools unavailable"}
                </SCBadge>
                <SCBadge>
                  {connectionStatus.legacyProfileConnected
                    ? `Profile tools linked${connectionStatus.legacyProfileUsername ? `: @${connectionStatus.legacyProfileUsername}` : ""}`
                    : "Profile tools not linked"}
                </SCBadge>
              </div>
              {connectionStatus.missingScopes.length > 0 && (
                <p className="text-xs text-amber-400">
                  Missing scopes: {connectionStatus.missingScopes.join(", ")}
                </p>
              )}
              <p className="text-[10px] text-slate-600">
                Posts, follows, likes, DMs, and media uploads use the connected OAuth 2.0 account. Profile name, avatar, and banner updates use a separate legacy X user-context grant.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href="/api/auth/twitter?returnTo=/profile-studio">
                <SCButton size="sm">
                  {connectionStatus.connected && !connectionStatus.needsReconnect ? "Reconnect X" : "Connect X"}
                </SCButton>
              </Link>
              <Link href="/api/auth/twitter/legacy?returnTo=/profile-studio">
                <SCButton variant="secondary" size="sm">
                  {connectionStatus.legacyProfileConnected ? "Reconnect Profile Tools" : "Connect Profile Tools"}
                </SCButton>
              </Link>
              <SCButton variant="ghost" size="sm" onClick={() => void refreshStudio()}>
                <span className="material-symbols-outlined text-[14px] mr-1">refresh</span>
                Refresh
              </SCButton>
            </div>
          </div>
        </SCGlassCard>
      )}

      {/* Tabs */}
      <SCTabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Command Tab */}
      {activeTab === "command" && (
        <div className="grid gap-6 xl:grid-cols-2">
          {/* Readiness Audit */}
          <SCGlassCard variant="strong" className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-[18px] text-slate-400">verified_user</span>
              <p className="text-sm font-bold text-white">Studio Readiness Audit</p>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Fast read on what is ready and what still blocks a clean profile launch.
            </p>
            <div className="space-y-2">
              {readinessChecks.checks.map((check) => (
                <div
                  key={check.label}
                  className="flex items-center justify-between rounded-lg border border-sc-border bg-white/5 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined text-[18px] ${check.complete ? "text-green-400" : "text-amber-400"}`}>
                      {check.complete ? "check_circle" : "warning"}
                    </span>
                    <span className="text-sm text-slate-300">{check.label}</span>
                  </div>
                  <SCBadge variant={check.complete ? "success" : "warning"}>
                    {check.complete ? "Ready" : "Needs work"}
                  </SCBadge>
                </div>
              ))}
            </div>
          </SCGlassCard>

          {/* Susan's Team */}
          <SCGlassCard variant="strong" className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-[18px] text-slate-400">group</span>
              <p className="text-sm font-bold text-white">Susan&apos;s Team</p>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              The people and lanes that now drive the studio instead of generic placeholders.
            </p>
            <div className="space-y-2">
              {teamCards.map((member) => (
                <div key={member.id} className="rounded-lg border border-sc-border bg-white/5 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-white">{member.name}</p>
                      <p className="text-xs text-slate-500">{member.role}</p>
                    </div>
                    <SCBadge>{member.owns[0]}</SCBadge>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-400">{member.background}</p>
                </div>
              ))}
            </div>
          </SCGlassCard>
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="grid gap-6 xl:grid-cols-2">
          {/* Profile Controls */}
          <SCGlassCard variant="strong" className="p-5">
            <p className="text-sm font-bold text-white mb-1">Live Profile Controls</p>
            <p className="text-xs text-slate-500 mb-4">
              Edit the real profile fields and push them to X when the copy is approved.
            </p>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-500">Display name</label>
                <SCInput
                  icon="person"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={50}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-500">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => e.target.value.length <= 160 && setBio(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-sc-border bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-sc-primary focus:outline-none focus:ring-1 focus:ring-sc-primary"
                />
                <div className="mt-1 flex items-center justify-between text-xs">
                  <span className={bio.length > 160 ? "text-red-400" : "text-slate-500"}>
                    {bio.length}/160
                  </span>
                  <SCButton variant="ghost" size="sm" onClick={() => void copyText("bio", bio)}>
                    <span className="material-symbols-outlined text-[14px] mr-1">
                      {copyState === "bio" ? "check" : "content_copy"}
                    </span>
                    {copyState === "bio" ? "Copied" : "Copy"}
                  </SCButton>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-500">Location</label>
                  <SCInput
                    icon="location_on"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-500">Website</label>
                  <SCInput
                    icon="link"
                    value={websiteLink}
                    onChange={(e) => setWebsiteLink(e.target.value)}
                    placeholder="Public recruit page URL"
                  />
                </div>
              </div>
              <SCButton onClick={() => void updateProfileViaApi()} disabled={profileUpdating}>
                <span className={`material-symbols-outlined text-[16px] mr-1.5 ${profileUpdating ? "animate-spin" : ""}`}>
                  {profileUpdating ? "progress_activity" : "arrow_forward"}
                </span>
                Update Profile on X
              </SCButton>
            </div>
          </SCGlassCard>

          {/* Preview */}
          <SCGlassCard variant="strong" className="p-5">
            <p className="text-sm font-bold text-white mb-1">Preview</p>
            <p className="text-xs text-slate-500 mb-4">
              Current studio preview with the latest generated header and top-ranked media.
            </p>
            <div className="overflow-hidden rounded-xl border border-sc-border bg-[#16181c] text-white">
              <div className="relative h-44 bg-slate-900">
                {previewHeader ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewHeader} alt="Header preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-sc-primary/20">
                    <p className="text-sm text-slate-500">No header generated yet</p>
                  </div>
                )}
              </div>
              <div className="relative px-5 pb-5">
                <div className="-mt-10 flex justify-between">
                  <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-[#16181c] bg-slate-800">
                    {previewAvatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={previewAvatar} alt="Profile preview" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xl font-bold text-white">JR</div>
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
                      <span className="material-symbols-outlined text-[16px]">location_on</span>
                      {location}
                    </span>
                    <span className="flex items-center gap-1 text-blue-400">
                      <span className="material-symbols-outlined text-[16px]">link</span>
                      {websiteLink || "Add film or NCSA link"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </SCGlassCard>
        </div>
      )}

      {/* Visuals Tab */}
      {activeTab === "visual" && (
        <div className="grid gap-6 xl:grid-cols-2">
          {/* Visual Command Board */}
          <SCGlassCard variant="strong" className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-[18px] text-slate-400">auto_awesome</span>
              <p className="text-sm font-bold text-white">Visual Command Board</p>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Jordan&apos;s recommended assets, Pewaukee color system, and the header workflow.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 mb-4">
              {(snapshot?.topPhotos.slice(0, 4) ?? []).map((photo) => (
                <div key={photo.id} className="overflow-hidden rounded-lg border border-sc-border bg-white/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.optimizedPath ?? `/api/photos/${photo.id}/file`} alt={photo.name} className="aspect-[4/3] w-full object-cover" />
                  <div className="space-y-2 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-bold text-white">{photo.name}</p>
                      <SCBadge variant="primary">{photo.score}</SCBadge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <SCBadge>{photo.recommendedUse}</SCBadge>
                      {photo.tags.slice(0, 2).map((tag) => (
                        <SCBadge key={`${photo.id}-${tag}`} variant="info">{tag}</SCBadge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {(snapshot?.topPhotos.length ?? 0) === 0 && (
              <div className="py-8 text-center">
                <span className="material-symbols-outlined text-[32px] text-slate-600">photo_library</span>
                <p className="mt-2 text-sm text-slate-500">No ranked photos yet</p>
                <p className="text-xs text-slate-600">Run the Media Lab to rank assets</p>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <SCButton onClick={() => void handleHeaderAction(false)} disabled={headerLoading !== null}>
                <span className={`material-symbols-outlined text-[16px] mr-1.5 ${headerLoading === "generate" ? "animate-spin" : ""}`}>
                  {headerLoading === "generate" ? "progress_activity" : "image"}
                </span>
                Generate Header
              </SCButton>
              <SCButton variant="secondary" onClick={() => void handleHeaderAction(true)} disabled={headerLoading !== null}>
                <span className={`material-symbols-outlined text-[16px] mr-1.5 ${headerLoading === "upload" ? "animate-spin" : ""}`}>
                  {headerLoading === "upload" ? "progress_activity" : "upload"}
                </span>
                Upload Header to X
              </SCButton>
            </div>
          </SCGlassCard>

          {/* Pewaukee Palette */}
          <SCGlassCard variant="strong" className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-[18px] text-slate-400">palette</span>
              <p className="text-sm font-bold text-white">Pewaukee Palette</p>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              The studio uses this palette to keep every asset visually coherent.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {BRAND_COLORS.map((color) => (
                <div key={color.name} className="rounded-lg border border-sc-border bg-white/5 p-3">
                  <div className="h-16 rounded-lg border border-sc-border" style={{ backgroundColor: color.hex }} />
                  <p className="mt-2 text-sm font-bold text-white">{color.name}</p>
                  <p className="text-xs text-slate-500">{color.hex}</p>
                  <SCBadge className="mt-2">{color.use}</SCBadge>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg border border-sc-border bg-white/5 p-4 text-xs text-slate-400">
              Warm stone + navy keeps the studio lighter and easier to use, while the gold accents preserve school identity without turning the UI into a generic sports template.
            </div>
          </SCGlassCard>
        </div>
      )}

      {/* Publishing Tab */}
      {activeTab === "publishing" && (
        <div className="grid gap-6 xl:grid-cols-2">
          {/* Pinned Post Builder */}
          <SCGlassCard variant="strong" className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-[18px] text-slate-400">push_pin</span>
              <p className="text-sm font-bold text-white">Pinned Post Builder</p>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Keep the pinned post coach-readable and link-forward.
            </p>
            <textarea
              value={pinnedPost}
              onChange={(e) => e.target.value.length <= 280 && setPinnedPost(e.target.value)}
              rows={8}
              className="w-full rounded-lg border border-sc-border bg-white/5 px-3 py-2.5 font-mono text-sm text-white placeholder:text-slate-600 focus:border-sc-primary focus:outline-none focus:ring-1 focus:ring-sc-primary"
            />
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span>{pinnedPost.length}/280</span>
              <SCButton variant="ghost" size="sm" onClick={() => void copyText("pinned", pinnedPost)}>
                <span className="material-symbols-outlined text-[14px] mr-1">
                  {copyState === "pinned" ? "check" : "content_copy"}
                </span>
                {copyState === "pinned" ? "Copied" : "Copy"}
              </SCButton>
            </div>
          </SCGlassCard>

          {/* Queue Snapshot */}
          <SCGlassCard variant="strong" className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-[18px] text-slate-400">movie</span>
              <p className="text-sm font-bold text-white">Queue Snapshot</p>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Approved posts can now be sent to X with attached media through the queue.
            </p>
            {queueSummary.featured ? (
              <div className="rounded-lg border border-sc-border bg-white/5 p-4 mb-4">
                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                  <SCBadge variant="primary">{queueSummary.featured.pillar.replace("_", " ")}</SCBadge>
                  <SCBadge>{queueSummary.featured.status}</SCBadge>
                  <SCBadge variant="info">
                    {isVideoMedia(queueSummary.featured.mediaUrl) ? "Video" : "Photo"}
                  </SCBadge>
                </div>
                <p className="whitespace-pre-wrap text-sm text-slate-300">
                  {queueSummary.featured.content}
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-sc-border bg-white/5 p-4 mb-4 text-sm text-slate-500">
                No queued posts yet. Refresh the studio or open the media lab to generate more drafts.
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <Link href="/posts">
                <SCButton size="sm">
                  <span className="material-symbols-outlined text-[14px] mr-1.5">queue</span>
                  Review Queue
                </SCButton>
              </Link>
              <Link href="/media-lab">
                <SCButton variant="secondary" size="sm">
                  <span className="material-symbols-outlined text-[14px] mr-1.5">science</span>
                  Review Ranked Media
                </SCButton>
              </Link>
            </div>
          </SCGlassCard>
        </div>
      )}

      {/* Launch Tab */}
      {activeTab === "launch" && (
        <SCGlassCard variant="strong" className="p-5">
          <p className="text-sm font-bold text-white mb-1">Launch Checklist</p>
          <p className="text-xs text-slate-500 mb-4">
            These are the next operator actions to move from setup to execution.
          </p>
          <div className="space-y-2">
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
              <div
                key={item.label}
                className="flex items-start justify-between rounded-lg border border-sc-border bg-white/5 px-4 py-4"
              >
                <div>
                  <p className="text-sm font-bold text-white">{item.label}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.detail}</p>
                </div>
                <SCBadge variant={item.ready ? "success" : "warning"}>
                  {item.ready ? "Ready" : "Blocked"}
                </SCBadge>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 pt-4">
            <a href="https://x.com/settings/profile" target="_blank" rel="noopener noreferrer">
              <SCButton>
                <span className="material-symbols-outlined text-[16px] mr-1.5">open_in_new</span>
                Open X Settings
              </SCButton>
            </a>
            <Link href="/posts">
              <SCButton variant="secondary">
                <span className="material-symbols-outlined text-[16px] mr-1.5">queue</span>
                Open Queue
              </SCButton>
            </Link>
          </div>
        </SCGlassCard>
      )}
    </div>
  );
}
