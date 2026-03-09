"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dispatchOperatorCommand } from "@/lib/os/operator-client";
import type { DraftAnalysis, MediaLabSnapshot } from "@/lib/media-lab/types";
import {
  ArrowRight,
  Bot,
  Camera,
  ExternalLink,
  FileText,
  Film,
  PlayCircle,
  RefreshCw,
  Users,
} from "lucide-react";

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

export function MediaLabDashboard() {
  const [snapshot, setSnapshot] = useState<MediaLabSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSnapshot = useCallback(async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

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

      if (!res.ok) {
        throw new Error(data.error || "Failed to load media lab");
      }

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
        <RefreshCw className="h-8 w-8 animate-spin text-[var(--app-muted)]" />
      </div>
    );
  }

  if (error || !snapshot) {
    return (
      <Card className="border-rose-200">
        <CardHeader className="border-b border-rose-100 bg-rose-50/70">
          <CardTitle className="text-[var(--app-navy-strong)]">Media Lab Unavailable</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-[var(--app-muted)]">
            {error ?? "No media-lab snapshot is available yet."}
          </p>
          <Button onClick={() => void loadSnapshot(true)} disabled={refreshing} className="bg-[var(--app-navy-strong)] text-white hover:bg-[var(--app-navy)]">
            {refreshing ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Build Snapshot
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="shell-panel-strong overflow-hidden px-5 py-5 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="shell-kicker">
              <Bot className="h-3.5 w-3.5" />
              Production media room
            </span>
            <Badge className="border-[rgba(15,40,75,0.1)] bg-white/70 text-[var(--app-navy-strong)] hover:bg-white/70">
              Real asset analysis
            </Badge>
          </div>

          <div className="mt-4 max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-tight text-[var(--app-navy-strong)]">
              Turn raw footage into the next publishable asset, reel, and recruiting proof point.
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--app-muted)] sm:text-base">
              Susan&apos;s team ranks Jacob&apos;s real media, lightly optimizes the strongest photos, assembles a reel package, and feeds the post queue with coach-relevant drafts.
            </p>
            <p className="mt-3 text-xs text-[var(--app-muted)]">
              Last generated: {new Date(snapshot.generatedAt).toLocaleString("en-US", { timeZone: "America/Chicago" })}
            </p>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {[
              {
                label: "Best photo",
                value: nextBestPhoto ? `${nextBestPhoto.score}` : "—",
                detail: nextBestPhoto ? `${nextBestPhoto.name} leads the current photo stack.` : "No ranked photo yet.",
              },
              {
                label: "Best clip",
                value: nextBestVideo ? `${nextBestVideo.score}` : "—",
                detail: nextBestVideo ? `${nextBestVideo.name} leads the current video stack.` : "No ranked clip yet.",
              },
              {
                label: "Draft output",
                value: `${snapshot.drafts.length}`,
                detail: "X drafts already generated from real media selections.",
              },
            ].map((item) => (
              <div key={item.label} className="rounded-[24px] border border-[rgba(15,40,75,0.08)] bg-white/80 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--app-muted)]">
                  {item.label}
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--app-navy-strong)]">{item.value}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--app-muted)]">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="shell-panel-strong px-5 py-5 sm:px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--app-muted)]">
            Recommended move
          </p>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--app-navy-strong)]">
            {snapshot.drafts.length > 0 ? "Push the best asset into publishing" : "Refresh the analysis package"}
          </h3>
          <p className="mt-3 text-sm leading-7 text-[var(--app-muted)]">
            {snapshot.drafts.length > 0
              ? "The analyzer already created real X drafts. Move the best one into the Publish room, then return here for reel and website decisions."
              : "If the draft queue is thin, rebuild the snapshot so new rankings, reel assets, and post suggestions are generated from the latest media library."}
          </p>

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <Button
              onClick={() => dispatchOperatorCommand({ command: "Approve the next post" })}
              disabled={snapshot.drafts.length === 0}
            >
              Review next post
            </Button>
            <Button
              onClick={() => void loadSnapshot(true)}
              disabled={refreshing}
              data-testid="media-lab-refresh"
              className="bg-[var(--app-navy-strong)] text-white hover:bg-[var(--app-navy)]"
            >
              {refreshing ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Refresh analysis
            </Button>
            <Button asChild variant="outline" className="justify-between bg-white/80">
              <Link href="/posts">
                Open publishing room
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-between bg-white/80">
              <Link href="/profile-studio">
                Open identity studio
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Top photos", value: snapshot.topPhotos.length, icon: Camera },
          { label: "Top clips", value: snapshot.topVideos.length, icon: Film },
          { label: "Queued X drafts", value: snapshot.drafts.length, icon: FileText },
          { label: "Reel clips", value: snapshot.reelPackage?.selectedClipCount ?? 0, icon: PlayCircle },
        ].map((metric) => (
          <div key={metric.label} className="shell-metric flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgba(15,40,75,0.08)] bg-white/80 text-[var(--app-navy)]">
              <metric.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--app-muted)]">{metric.label}</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight text-[var(--app-navy-strong)]">{metric.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader className="border-b border-[rgba(15,40,75,0.08)] bg-[rgba(15,40,75,0.03)]">
            <CardTitle className="flex items-center gap-2 text-lg text-[var(--app-navy-strong)]">
              <Users className="h-4 w-4" />
              Susan&apos;s Team
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {snapshot.team.map((member) => (
              <div key={member.id} className="rounded-[22px] border border-[rgba(15,40,75,0.08)] bg-white/74 p-4">
                <p className="text-sm font-semibold text-[var(--app-navy-strong)]">{member.name}</p>
                <p className="text-xs text-[var(--app-muted)]">{member.role}</p>
                <p className="mt-2 text-xs leading-6 text-[var(--app-muted)]">{member.background}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {member.owns.map((item) => (
                    <Badge key={item} variant="secondary">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-[rgba(15,40,75,0.08)] bg-[rgba(15,40,75,0.03)]">
            <CardTitle className="text-lg text-[var(--app-navy-strong)]">Research Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {snapshot.researchNotes.map((note) => (
              <a
                key={note.url}
                href={note.url}
                target="_blank"
                rel="noreferrer"
                className="block rounded-[22px] border border-[rgba(15,40,75,0.08)] bg-white/76 p-4 transition-colors hover:border-[rgba(15,40,75,0.16)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[var(--app-navy-strong)]">{note.title}</p>
                    <p className="mt-1 text-xs leading-6 text-[var(--app-muted)]">{note.takeaway}</p>
                  </div>
                  <ExternalLink className="mt-0.5 h-4 w-4 text-[var(--app-muted)]" />
                </div>
              </a>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b border-[rgba(15,40,75,0.08)] bg-[rgba(15,40,75,0.03)]">
          <CardTitle className="text-lg text-[var(--app-navy-strong)]">Capabilities</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {snapshot.capabilities.map((capability) => (
            <div key={capability.id} className="rounded-[22px] border border-[rgba(15,40,75,0.08)] bg-white/72 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[var(--app-navy-strong)]">{capability.name}</p>
                <Badge variant="outline">{capability.owner}</Badge>
              </div>
              <p className="mt-2 text-xs leading-6 text-[var(--app-muted)]">{capability.summary}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {capability.tools.map((tool) => (
                  <Badge key={tool} variant="secondary">
                    {tool}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg text-[var(--app-navy-strong)]">Top 20 Photos</CardTitle>
          <p className="text-xs text-[var(--app-muted)]">
            Optimized photos are served from the app; all rankings come from real imported media.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {snapshot.topPhotos.map((photo) => (
            <div
              key={photo.id}
              className="overflow-hidden rounded-[24px] border border-[rgba(15,40,75,0.08)] bg-white/78"
              data-testid="media-lab-photo-card"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.optimizedPath ?? `/api/photos/${photo.id}/file`}
                alt={photo.name}
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="space-y-2 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-[var(--app-navy-strong)]">{photo.name}</p>
                  <Badge variant="secondary">{photo.score}</Badge>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline">{photo.category}</Badge>
                  <Badge variant="outline">{photo.recommendedUse}</Badge>
                </div>
                <p className="text-xs leading-6 text-[var(--app-muted)]">{photo.notes[0]}</p>
                <div className="flex flex-wrap gap-1">
                  {photo.tags.slice(0, 4).map((tag) => (
                    <Badge key={`${photo.id}-${tag}`} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg text-[var(--app-navy-strong)]">Top 20 Clips</CardTitle>
          <p className="text-xs text-[var(--app-muted)]">
            Rankings bias toward premium cuts, defensive finishes, impact reps, and coach-friendly trims.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {snapshot.topVideos.map((video) => (
            <div
              key={video.id}
              className="overflow-hidden rounded-[24px] border border-[rgba(15,40,75,0.08)] bg-white/78"
              data-testid="media-lab-video-card"
            >
              {video.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={video.thumbnailUrl}
                  alt={video.name}
                  className="aspect-video w-full object-cover"
                />
              ) : (
                <div className="flex aspect-video items-center justify-center bg-[rgba(15,40,75,0.06)] text-[var(--app-muted)]">
                  <Film className="h-8 w-8" />
                </div>
              )}
              <div className="space-y-2 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-[var(--app-navy-strong)]">{video.name}</p>
                  <Badge variant="secondary">{video.score}</Badge>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline">{video.category}</Badge>
                  <Badge variant="outline">
                    {video.trim.startTime}s-{video.trim.endTime}s
                  </Badge>
                </div>
                <p className="text-xs leading-6 text-[var(--app-muted)]">{video.notes[0]}</p>
                <div className="flex flex-wrap gap-1">
                  {video.tags.slice(0, 4).map((tag) => (
                    <Badge key={`${video.id}-${tag}`} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <a
                  href={`/api/videos/serve?path=${encodeURIComponent(video.filePath)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-[var(--app-navy)] hover:text-[var(--app-navy-strong)]"
                >
                  <PlayCircle className="h-3.5 w-3.5" />
                  Open source clip
                </a>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader className="border-b border-[rgba(15,40,75,0.08)] bg-[rgba(15,40,75,0.03)]">
            <CardTitle className="text-lg text-[var(--app-navy-strong)]">Queued X Drafts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {snapshot.drafts.map((draft, index) => (
              <div
                key={`${draft.pillar}-${index}`}
                className="rounded-[22px] border border-[rgba(15,40,75,0.08)] bg-white/74 p-4"
                data-testid="media-lab-draft-card"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={draft.pillar}>{draft.pillar.replace("_", " ")}</Badge>
                  <Badge variant="secondary">Score {draft.score}</Badge>
                  <Badge variant="outline">{draft.formula}</Badge>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[var(--app-ink)]">{draft.content}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {draft.hashtags.map((tag) => (
                    <Badge key={`${draft.content}-${tag}`} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <p className="mt-3 text-xs text-[var(--app-muted)]">
                  {draft.bestTime} • {mediaAttachmentLabel(draft)}
                </p>
                {draft.mediaUrl ? (
                  <a
                    href={draft.mediaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[var(--app-navy)] hover:text-[var(--app-navy-strong)]"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Open attached media
                  </a>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-[rgba(15,40,75,0.08)] bg-[rgba(15,40,75,0.03)]">
            <CardTitle className="text-lg text-[var(--app-navy-strong)]">Reel Package</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-6 text-[var(--app-muted)]">
              The reel builder exports a quick-turn FFmpeg highlight reel plus a CapCut-friendly shot list and manifest so the family can finish a more polished version without rebuilding clip order from scratch.
            </p>
            <div className="flex flex-wrap gap-2">
              {reelLinks?.reel ? (
                <a href={reelLinks.reel} target="_blank" rel="noreferrer">
                  <Button variant="outline" className="gap-2">
                    <PlayCircle className="h-4 w-4" />
                    Open Reel
                  </Button>
                </a>
              ) : null}
              {reelLinks?.shotList ? (
                <a href={reelLinks.shotList} target="_blank" rel="noreferrer">
                  <Button variant="outline" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Open Shot List
                  </Button>
                </a>
              ) : null}
              {reelLinks?.manifest ? (
                <a href={reelLinks.manifest} target="_blank" rel="noreferrer">
                  <Button variant="outline" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Open Manifest
                  </Button>
                </a>
              ) : null}
            </div>
            <div className="rounded-[22px] border border-[rgba(15,40,75,0.08)] bg-white/74 p-4">
              <p className="text-sm font-semibold text-[var(--app-navy-strong)]">
                Selected clips: {snapshot.reelPackage?.selectedClipCount ?? 0}
              </p>
              <div className="mt-3 space-y-2">
                {snapshot.reelPackage?.notes.map((note) => (
                  <p key={note} className="text-xs leading-6 text-[var(--app-muted)]">
                    {note}
                  </p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
