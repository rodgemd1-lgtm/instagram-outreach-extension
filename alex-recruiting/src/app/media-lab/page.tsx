"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SCPageHeader } from "@/components/sc/sc-page-header";
import { SCGlassCard } from "@/components/sc/sc-glass-card";
import { SCStatCard } from "@/components/sc/sc-stat-card";
import { SCBadge } from "@/components/sc/sc-badge";
import { SCButton } from "@/components/sc/sc-button";
import { dispatchOperatorCommand } from "@/lib/os/operator-client";
import type { DraftAnalysis, MediaLabSnapshot } from "@/lib/media-lab/types";

function mediaAttachmentLabel(draft: DraftAnalysis): string {
  return draft.mediaType === "video" ? "Video attached" : "Photo attached";
}

function toPublicAssetUrl(filePath: string | null): string | null {
  if (!filePath) return null;
  const publicMarker = "/public/";
  const index = filePath.indexOf(publicMarker);
  if (index === -1) return null;
  return filePath.slice(index + publicMarker.length - 1);
}

export default function MediaLabPage() {
  const [snapshot, setSnapshot] = useState<MediaLabSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSnapshot = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await fetch(refresh ? "/api/media-lab" : "/api/media-lab", {
        method: refresh ? "POST" : "GET",
        headers: refresh ? { "Content-Type": "application/json" } : undefined,
        body: refresh
          ? JSON.stringify({ optimizePhotos: true, buildReel: true, queuePosts: true })
          : undefined,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load media lab");
      setSnapshot(data.snapshot ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load media lab");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadSnapshot();
  }, [loadSnapshot]);

  const reelLinks = useMemo(() => {
    if (!snapshot?.reelPackage) return null;
    return {
      reel: snapshot.reelPackage.renderedReelPath,
      shotList: toPublicAssetUrl(snapshot.reelPackage.capCutShotListPath),
      manifest: toPublicAssetUrl(snapshot.reelPackage.manifestPath),
    };
  }, [snapshot]);

  const nextBestPhoto = snapshot?.topPhotos[0] ?? null;
  const nextBestVideo = snapshot?.topVideos[0] ?? null;

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <span className="material-symbols-outlined text-[32px] animate-spin text-slate-400">progress_activity</span>
      </div>
    );
  }

  if (error || !snapshot) {
    return (
      <div className="space-y-6">
        <SCPageHeader title="MEDIA LAB" subtitle="Media lab unavailable" />
        <SCGlassCard variant="broadcast" className="p-6 space-y-4">
          <p className="text-sm text-slate-400">
            {error ?? "No media-lab snapshot is available yet."}
          </p>
          <SCButton onClick={() => void loadSnapshot(true)} disabled={refreshing}>
            {refreshing && (
              <span className="material-symbols-outlined text-[16px] animate-spin mr-2">progress_activity</span>
            )}
            {!refreshing && (
              <span className="material-symbols-outlined text-[16px] mr-2">refresh</span>
            )}
            Build Snapshot
          </SCButton>
        </SCGlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SCPageHeader
        title="MEDIA LAB"
        kicker="Jordan + Prism"
        subtitle="Turn raw footage into the next publishable asset, reel, and recruiting proof point."
        actions={
          <SCButton variant="secondary" onClick={() => void loadSnapshot(true)} disabled={refreshing}>
            {refreshing ? (
              <span className="material-symbols-outlined text-[16px] animate-spin mr-1">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-[16px] mr-1">refresh</span>
            )}
            Refresh Analysis
          </SCButton>
        }
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <SCStatCard label="Top Photos" value={String(snapshot.topPhotos.length)} icon="photo_camera" />
        <SCStatCard label="Top Clips" value={String(snapshot.topVideos.length)} icon="movie" />
        <SCStatCard label="Queued X Drafts" value={String(snapshot.drafts.length)} icon="description" />
        <SCStatCard label="Reel Clips" value={String(snapshot.reelPackage?.selectedClipCount ?? 0)} icon="play_circle" />
      </div>

      {/* Command Section */}
      <div className="grid gap-6 xl:grid-cols-2">
        <SCGlassCard variant="strong" className="p-6">
          <SCBadge variant="primary" className="mb-3">Production media room</SCBadge>
          <p className="text-xs text-slate-500 mt-2">
            Last generated: {new Date(snapshot.generatedAt).toLocaleString("en-US", { timeZone: "America/Chicago" })}
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {[
              {
                label: "Best photo",
                value: nextBestPhoto ? `${nextBestPhoto.score}` : "--",
                detail: nextBestPhoto ? `${nextBestPhoto.name} leads the current photo stack.` : "No ranked photo yet.",
              },
              {
                label: "Best clip",
                value: nextBestVideo ? `${nextBestVideo.score}` : "--",
                detail: nextBestVideo ? `${nextBestVideo.name} leads the current video stack.` : "No ranked clip yet.",
              },
              {
                label: "Draft output",
                value: `${snapshot.drafts.length}`,
                detail: "X drafts already generated from real media selections.",
              },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-sc-border bg-white/5 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{item.label}</p>
                <p className="mt-2 text-2xl font-black text-white">{item.value}</p>
                <p className="mt-2 text-xs text-slate-500">{item.detail}</p>
              </div>
            ))}
          </div>
        </SCGlassCard>

        <SCGlassCard variant="strong" className="p-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Recommended move</p>
          <h3 className="mt-3 text-xl font-black text-white">
            {snapshot.drafts.length > 0 ? "Push the best asset into publishing" : "Refresh the analysis package"}
          </h3>
          <p className="mt-3 text-sm text-slate-400">
            {snapshot.drafts.length > 0
              ? "The analyzer already created real X drafts. Move the best one into the Publish room."
              : "Rebuild the snapshot so new rankings, reel assets, and post suggestions are generated."}
          </p>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <SCButton
              onClick={() => dispatchOperatorCommand({ command: "Approve the next post" })}
              disabled={snapshot.drafts.length === 0}
            >
              Review next post
            </SCButton>
            <SCButton variant="secondary" onClick={() => void loadSnapshot(true)} disabled={refreshing}>
              Refresh analysis
            </SCButton>
            <Link href="/posts">
              <SCButton variant="ghost" className="w-full justify-between">
                Open publishing room
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </SCButton>
            </Link>
            <Link href="/profile-studio">
              <SCButton variant="ghost" className="w-full justify-between">
                Open identity studio
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </SCButton>
            </Link>
          </div>
        </SCGlassCard>
      </div>

      {/* Team & Research */}
      <div className="grid gap-6 xl:grid-cols-2">
        <SCGlassCard variant="strong" className="p-5">
          <p className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-sc-primary">group</span>
            Team
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {snapshot.team.map((member) => (
              <div key={member.id} className="rounded-xl border border-sc-border bg-white/5 p-4">
                <p className="text-sm font-bold text-white">{member.name}</p>
                <p className="text-xs text-slate-500">{member.role}</p>
                <p className="mt-2 text-xs text-slate-500">{member.background}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {member.owns.map((item) => (
                    <SCBadge key={item}>{item}</SCBadge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SCGlassCard>

        <SCGlassCard variant="strong" className="p-5">
          <p className="text-sm font-bold text-white mb-3">Research Notes</p>
          <div className="space-y-3">
            {snapshot.researchNotes.map((note) => (
              <a
                key={note.url}
                href={note.url}
                target="_blank"
                rel="noreferrer"
                className="block rounded-xl border border-sc-border bg-white/5 p-4 transition-colors hover:bg-white/[0.08]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-white">{note.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{note.takeaway}</p>
                  </div>
                  <span className="material-symbols-outlined text-[16px] text-slate-500 mt-0.5">open_in_new</span>
                </div>
              </a>
            ))}
          </div>
        </SCGlassCard>
      </div>

      {/* Capabilities */}
      <SCGlassCard variant="strong" className="p-5">
        <p className="text-sm font-bold text-white mb-3">Capabilities</p>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {snapshot.capabilities.map((capability) => (
            <div key={capability.id} className="rounded-xl border border-sc-border bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-white">{capability.name}</p>
                <SCBadge>{capability.owner}</SCBadge>
              </div>
              <p className="mt-2 text-xs text-slate-500">{capability.summary}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {capability.tools.map((tool) => (
                  <SCBadge key={tool} variant="info">{tool}</SCBadge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SCGlassCard>

      {/* Top Photos */}
      <SCGlassCard variant="strong" className="p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-white">Top 20 Photos</p>
          <p className="text-xs text-slate-500">Optimized photos from real imported media</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {snapshot.topPhotos.map((photo) => (
            <div key={photo.id} className="overflow-hidden rounded-xl border border-sc-border bg-white/5" data-testid="media-lab-photo-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.optimizedPath ?? `/api/photos/${photo.id}/file`} alt={photo.name} className="aspect-[4/3] w-full object-cover" />
              <div className="space-y-2 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-bold text-white">{photo.name}</p>
                  <SCBadge variant="primary">{photo.score}</SCBadge>
                </div>
                <div className="flex flex-wrap gap-1">
                  <SCBadge>{photo.category}</SCBadge>
                  <SCBadge>{photo.recommendedUse}</SCBadge>
                </div>
                <p className="text-xs text-slate-500">{photo.notes[0]}</p>
                <div className="flex flex-wrap gap-1">
                  {photo.tags.slice(0, 4).map((tag) => (
                    <SCBadge key={`${photo.id}-${tag}`}>{tag}</SCBadge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </SCGlassCard>

      {/* Top Videos */}
      <SCGlassCard variant="strong" className="p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-white">Top 20 Clips</p>
          <p className="text-xs text-slate-500">Rankings bias toward premium cuts and coach-friendly trims</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {snapshot.topVideos.map((video) => (
            <div key={video.id} className="overflow-hidden rounded-xl border border-sc-border bg-white/5" data-testid="media-lab-video-card">
              {video.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={video.thumbnailUrl} alt={video.name} className="aspect-video w-full object-cover" />
              ) : (
                <div className="flex aspect-video items-center justify-center bg-white/5">
                  <span className="material-symbols-outlined text-[32px] text-slate-600">movie</span>
                </div>
              )}
              <div className="space-y-2 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-bold text-white">{video.name}</p>
                  <SCBadge variant="primary">{video.score}</SCBadge>
                </div>
                <div className="flex flex-wrap gap-1">
                  <SCBadge>{video.category}</SCBadge>
                  <SCBadge>{video.trim.startTime}s-{video.trim.endTime}s</SCBadge>
                </div>
                <p className="text-xs text-slate-500">{video.notes[0]}</p>
                <div className="flex flex-wrap gap-1">
                  {video.tags.slice(0, 4).map((tag) => (
                    <SCBadge key={`${video.id}-${tag}`}>{tag}</SCBadge>
                  ))}
                </div>
                <a
                  href={`/api/videos/serve?path=${encodeURIComponent(video.filePath)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-sc-primary hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">play_circle</span>
                  Open source clip
                </a>
              </div>
            </div>
          ))}
        </div>
      </SCGlassCard>

      {/* Drafts & Reel */}
      <div className="grid gap-6 xl:grid-cols-2">
        <SCGlassCard variant="strong" className="p-5">
          <p className="text-sm font-bold text-white mb-3">Queued X Drafts</p>
          <div className="space-y-3">
            {snapshot.drafts.map((draft, index) => (
              <div key={`${draft.pillar}-${index}`} className="rounded-xl border border-sc-border bg-white/5 p-4" data-testid="media-lab-draft-card">
                <div className="flex flex-wrap items-center gap-2">
                  <SCBadge variant="primary">{draft.pillar.replace("_", " ")}</SCBadge>
                  <SCBadge>Score {draft.score}</SCBadge>
                  <SCBadge>{draft.formula}</SCBadge>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm text-slate-300">{draft.content}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {draft.hashtags.map((tag) => (
                    <SCBadge key={`${draft.content.slice(0, 10)}-${tag}`}>{tag}</SCBadge>
                  ))}
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  {draft.bestTime} -- {mediaAttachmentLabel(draft)}
                </p>
                {draft.mediaUrl && (
                  <a href={draft.mediaUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-sc-primary hover:text-white">
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                    Open attached media
                  </a>
                )}
              </div>
            ))}
          </div>
        </SCGlassCard>

        <SCGlassCard variant="strong" className="p-5 space-y-4">
          <p className="text-sm font-bold text-white">Reel Package</p>
          <p className="text-sm text-slate-400">
            The reel builder exports a quick-turn FFmpeg highlight reel plus a CapCut-friendly shot list.
          </p>
          <div className="flex flex-wrap gap-2">
            {reelLinks?.reel && (
              <a href={reelLinks.reel} target="_blank" rel="noreferrer">
                <SCButton variant="secondary" size="sm">
                  <span className="material-symbols-outlined text-[14px] mr-1">play_circle</span>
                  Open Reel
                </SCButton>
              </a>
            )}
            {reelLinks?.shotList && (
              <a href={reelLinks.shotList} target="_blank" rel="noreferrer">
                <SCButton variant="secondary" size="sm">
                  <span className="material-symbols-outlined text-[14px] mr-1">description</span>
                  Open Shot List
                </SCButton>
              </a>
            )}
            {reelLinks?.manifest && (
              <a href={reelLinks.manifest} target="_blank" rel="noreferrer">
                <SCButton variant="secondary" size="sm">
                  <span className="material-symbols-outlined text-[14px] mr-1">description</span>
                  Open Manifest
                </SCButton>
              </a>
            )}
          </div>
          <div className="rounded-xl border border-sc-border bg-white/5 p-4">
            <p className="text-sm font-bold text-white">
              Selected clips: {snapshot.reelPackage?.selectedClipCount ?? 0}
            </p>
            <div className="mt-3 space-y-2">
              {snapshot.reelPackage?.notes.map((note) => (
                <p key={note} className="text-xs text-slate-500">{note}</p>
              ))}
            </div>
          </div>
        </SCGlassCard>
      </div>
    </div>
  );
}
