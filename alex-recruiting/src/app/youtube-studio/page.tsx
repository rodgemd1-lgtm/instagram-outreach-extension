"use client";

import { useEffect, useState } from "react";
import { SCPageHeader } from "@/components/sc/sc-page-header";
import { SCGlassCard } from "@/components/sc/sc-glass-card";
import { SCStatCard } from "@/components/sc/sc-stat-card";
import { SCBadge } from "@/components/sc/sc-badge";
import { SCButton } from "@/components/sc/sc-button";
import { SCTabs } from "@/components/sc/sc-tabs";
import {
  youtubePlaybook,
  categoryToYouTubeMapping,
  formatFileSize,
  formatDuration,
  type VideoStoreEntry,
} from "@/lib/data/youtube-playbook";

type ChecklistItem = {
  id: string;
  label: string;
  description: string;
  completed: boolean;
};

const initialChecklist: ChecklistItem[] = [
  { id: "channel-name", label: "Set channel name", description: `Recommended: "${youtubePlaybook.channel.recommendedName}"`, completed: false },
  { id: "handle", label: "Claim @handle", description: `Suggestions: ${youtubePlaybook.channel.handleSuggestions.join(", ")}`, completed: false },
  { id: "profile-pic", label: "Upload profile picture", description: youtubePlaybook.channel.profilePicSpecs.recommendation, completed: false },
  { id: "banner", label: "Upload channel banner", description: `${youtubePlaybook.channel.bannerSpecs.dimensions} -- include name, #79, position, school, class year`, completed: false },
  { id: "about", label: "Write About section", description: "Full bio with stats, measurables, contact info, and links", completed: false },
  { id: "links", label: "Add channel links", description: youtubePlaybook.channel.links.map((l) => l.label).join(", "), completed: false },
  { id: "watermark", label: "Upload branding watermark", description: youtubePlaybook.brandingGuidelines.watermark.recommendation, completed: false },
  { id: "playlists", label: "Create playlists", description: youtubePlaybook.playlists.map((p) => p.name).join(", "), completed: false },
  { id: "first-video", label: "Upload first video", description: "Start with your best highlight reel to anchor the channel", completed: true },
  { id: "end-screen", label: "Set up end screen template", description: "Subscribe button + latest highlight link in last 20 seconds", completed: false },
];

const categoryIcons: Record<string, string> = {
  highlights: "star",
  training: "fitness_center",
  game_film: "movie",
  camps_combines: "emoji_events",
  shorts: "smartphone",
};

const categoryLabel: Record<string, string> = {
  highlights: "Highlights",
  training: "Training",
  game_film: "Game Film",
  camps_combines: "Camps / Combines",
  shorts: "YouTube Shorts",
};

function mapVideoToYouTubeCategory(v: VideoStoreEntry): string {
  return categoryToYouTubeMapping[v.category] || "shorts";
}

function isVertical(v: VideoStoreEntry): boolean {
  return v.height > v.width;
}

function resolutionLabel(v: VideoStoreEntry): string {
  if (v.width >= 3840) return "4K";
  if (v.width >= 1920 || v.height >= 1920) return "1080p";
  if (v.width >= 1280 || v.height >= 1280) return "720p";
  return `${v.width}x${v.height}`;
}

export default function YouTubeStudioPage() {
  const [checklist, setChecklist] = useState(initialChecklist);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [videoStore, setVideoStore] = useState<VideoStoreEntry[]>([]);
  const [activeTab, setActiveTab] = useState("setup");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadVideoStore() {
      try {
        const response = await fetch("/api/videos", { cache: "no-store" });
        if (!response.ok) throw new Error(`Failed to load videos: ${response.status}`);
        const payload = (await response.json()) as { assets?: VideoStoreEntry[] };
        if (active) setVideoStore(payload.assets ?? []);
      } catch (error) {
        console.error("Failed to load video store:", error);
        if (active) setVideoStore([]);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadVideoStore();
    return () => { active = false; };
  }, []);

  const completedCount = checklist.filter((c) => c.completed).length;
  const progressPercent = Math.round((completedCount / checklist.length) * 100);

  function toggleChecklistItem(id: string) {
    setChecklist((prev) => prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)));
  }

  function copyToClipboard(text: string, fieldId: string) {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  }

  const videosByCategory = videoStore.reduce<Record<string, VideoStoreEntry[]>>((acc, v) => {
    const cat = mapVideoToYouTubeCategory(v);
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(v);
    return acc;
  }, {});

  const totalVideos = videoStore.length;
  const totalSize = videoStore.reduce((sum, v) => sum + v.fileSize, 0);
  const totalDuration = videoStore.reduce((sum, v) => sum + v.duration, 0);
  const verticalCount = videoStore.filter(isVertical).length;
  const fourKCount = videoStore.filter((v) => v.width >= 3840 || v.height >= 3840).length;

  return (
    <div className="space-y-6 max-w-6xl">
      <SCPageHeader
        title="YOUTUBE STUDIO"
        subtitle="Channel strategy and upload plan for Jacob Rodgers' recruiting channel"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <SCStatCard label="Videos in Library" value={loading ? "..." : String(totalVideos)} icon="movie" />
        <SCStatCard label="Total Size" value={loading ? "..." : formatFileSize(totalSize)} icon="cloud_upload" />
        <SCStatCard label="Total Duration" value={loading ? "..." : formatDuration(totalDuration)} icon="schedule" />
        <SCStatCard label="Vertical (Shorts)" value={loading ? "..." : String(verticalCount)} icon="smartphone" />
        <SCStatCard label="4K Videos" value={loading ? "..." : String(fourKCount)} icon="star" />
      </div>

      {/* Tabs */}
      <SCTabs
        tabs={[
          { label: "Channel Setup", value: "setup" },
          { label: "Video Upload Plan", value: "videos" },
          { label: "SEO Playbook", value: "playbook" },
          { label: "Branding", value: "branding" },
          { label: "Live Preview", value: "preview" },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* TAB: Channel Setup */}
      {activeTab === "setup" && (
        <div className="space-y-6">
          <SCGlassCard variant="strong" className="p-5">
            <p className="text-sm font-bold text-white mb-1">Channel Setup Checklist</p>
            <p className="text-xs text-slate-500 mb-3">{completedCount} of {checklist.length} complete ({progressPercent}%)</p>
            <div className="h-2 w-full rounded-full bg-white/5 mb-4">
              <div className="h-2 rounded-full bg-sc-primary transition-all shadow-[0_0_8px_rgba(197,5,12,0.5)]" style={{ width: `${progressPercent}%` }} />
            </div>
            <div className="space-y-1">
              {checklist.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleChecklistItem(item.id)}
                  className="w-full flex items-start gap-3 rounded-lg px-3 py-3 text-left hover:bg-white/5 transition-colors"
                >
                  <span className={`material-symbols-outlined text-[20px] mt-0.5 ${item.completed ? "text-emerald-400" : "text-slate-600"}`}>
                    {item.completed ? "check_circle" : "radio_button_unchecked"}
                  </span>
                  <div>
                    <p className={`text-sm font-bold ${item.completed ? "text-slate-500 line-through" : "text-white"}`}>{item.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </SCGlassCard>

          {/* About Section Template */}
          <SCGlassCard variant="strong" className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-white">About Section Template</p>
              <SCButton variant="ghost" size="sm" onClick={() => copyToClipboard(youtubePlaybook.channel.aboutSection, "about")}>
                <span className="material-symbols-outlined text-[14px] mr-1">{copiedField === "about" ? "check" : "content_copy"}</span>
                {copiedField === "about" ? "Copied" : "Copy"}
              </SCButton>
            </div>
            <pre className="text-xs text-slate-300 bg-white/5 rounded-lg p-4 whitespace-pre-wrap font-mono border border-sc-border">
              {youtubePlaybook.channel.aboutSection}
            </pre>
          </SCGlassCard>

          {/* Channel Links */}
          <SCGlassCard variant="strong" className="p-5">
            <p className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-slate-400">link</span>
              Channel Links
            </p>
            <div className="space-y-2">
              {youtubePlaybook.channel.links.map((link) => (
                <div key={link.label} className="flex items-center justify-between rounded-lg bg-white/5 border border-sc-border px-4 py-3">
                  <div>
                    <p className="text-sm font-bold text-white">{link.label}</p>
                    <p className="text-xs text-slate-500">{link.url}</p>
                  </div>
                  <span className="material-symbols-outlined text-[16px] text-slate-500">open_in_new</span>
                </div>
              ))}
            </div>
          </SCGlassCard>

          {/* Playlists */}
          <SCGlassCard variant="strong" className="p-5">
            <p className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-slate-400">playlist_play</span>
              Playlists to Create
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {youtubePlaybook.playlists.map((pl) => (
                <div key={pl.name} className="rounded-lg border border-sc-border bg-white/5 p-4">
                  <p className="text-sm font-bold text-white">{pl.name}</p>
                  <p className="text-xs text-slate-500 mt-1">{pl.description}</p>
                </div>
              ))}
            </div>
          </SCGlassCard>
        </div>
      )}

      {/* TAB: Video Upload Plan */}
      {activeTab === "videos" && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {youtubePlaybook.categories.map((cat) => (
              <SCGlassCard key={cat.id} className="p-5 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-[18px] text-sc-primary">{categoryIcons[cat.id] || "movie"}</span>
                  <p className="text-sm font-black text-white">{cat.name}</p>
                </div>
                <p className="text-xs text-slate-500 mb-3">{cat.description}</p>
                <div className="flex flex-wrap gap-2 text-xs mb-3">
                  <SCBadge>{cat.uploadFrequency}</SCBadge>
                  <SCBadge>{cat.idealLength}</SCBadge>
                </div>
                <ul className="space-y-1.5 flex-1">
                  {cat.tips.map((tip, i) => (
                    <li key={i} className="text-xs text-slate-400 flex gap-2">
                      <span className="text-slate-600 shrink-0">-</span>{tip}
                    </li>
                  ))}
                </ul>
                {videosByCategory[cat.id] && (
                  <div className="pt-2 mt-2 border-t border-sc-border">
                    <p className="text-xs font-bold text-white">{videosByCategory[cat.id].length} videos ready to upload</p>
                  </div>
                )}
              </SCGlassCard>
            ))}
          </div>

          {/* Video Library */}
          <SCGlassCard variant="strong" className="p-5">
            <p className="text-sm font-bold text-white mb-1">Video Library -- Ready for YouTube</p>
            <p className="text-xs text-slate-500 mb-4">{totalVideos} videos from the local video store</p>
            {Object.entries(videosByCategory)
              .sort(([a], [b]) => {
                const order = ["highlights", "game_film", "training", "camps_combines", "shorts"];
                return order.indexOf(a) - order.indexOf(b);
              })
              .map(([cat, videos]) => (
                <div key={cat} className="mb-6 last:mb-0">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-[18px] text-sc-primary">{categoryIcons[cat] || "movie"}</span>
                    <p className="text-sm font-bold text-white">{categoryLabel[cat] || cat}</p>
                    <SCBadge>{videos.length}</SCBadge>
                  </div>
                  <div className="space-y-1.5">
                    {videos.map((video) => (
                      <div key={video.id} className="flex items-center gap-3 rounded-lg border border-sc-border bg-white/5 px-3 py-2.5 hover:bg-white/[0.08] transition-colors">
                        <div className="w-16 h-10 rounded bg-sc-surface overflow-hidden shrink-0 flex items-center justify-center">
                          {video.thumbnailUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={video.thumbnailUrl} alt={video.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="material-symbols-outlined text-[16px] text-slate-600">movie</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">{video.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-slate-500">{formatDuration(video.duration)}</span>
                            <span className="text-[10px] text-slate-600">|</span>
                            <span className="text-[10px] text-slate-500">{formatFileSize(video.fileSize)}</span>
                            <span className="text-[10px] text-slate-600">|</span>
                            <span className="text-[10px] text-slate-500">{resolutionLabel(video)}</span>
                            {isVertical(video) && <SCBadge>Vertical</SCBadge>}
                          </div>
                        </div>
                        <SCBadge variant={video.uploadStatus === "local" ? "default" : "success"}>
                          {video.uploadStatus === "local" ? "Not uploaded" : video.uploadStatus}
                        </SCBadge>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </SCGlassCard>
        </div>
      )}

      {/* TAB: SEO Playbook */}
      {activeTab === "playbook" && (
        <div className="space-y-6">
          {youtubePlaybook.seoTips.map((section) => (
            <SCGlassCard key={section.title} variant="strong" className="p-5">
              <p className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-slate-400">search</span>
                {section.title}
              </p>
              <ul className="space-y-2">
                {section.tips.map((tip, i) => (
                  <li key={i} className="flex gap-3 text-sm text-slate-300">
                    <span className="text-slate-600 shrink-0 font-mono text-xs mt-0.5">{String(i + 1).padStart(2, "0")}</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </SCGlassCard>
          ))}

          {/* Title Formats */}
          <SCGlassCard variant="strong" className="p-5">
            <p className="text-sm font-bold text-white mb-3">Recommended Title Formats</p>
            <div className="space-y-2">
              {youtubePlaybook.titleFormats.examples.map((ex, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg bg-white/5 border border-sc-border px-4 py-3">
                  <span className="material-symbols-outlined text-[14px] text-sc-primary shrink-0">play_arrow</span>
                  <p className="text-sm text-slate-300 font-mono flex-1">{ex}</p>
                  <button onClick={() => copyToClipboard(ex, `title-${i}`)} className="shrink-0">
                    <span className="material-symbols-outlined text-[14px] text-slate-500 hover:text-white">
                      {copiedField === `title-${i}` ? "check" : "content_copy"}
                    </span>
                  </button>
                </div>
              ))}
            </div>
          </SCGlassCard>

          {/* Tags */}
          <SCGlassCard variant="strong" className="p-5">
            <p className="text-sm font-bold text-white mb-3">Recommended Tags</p>
            <p className="text-xs text-slate-500 mb-4">Copy and paste into YouTube&apos;s tag field. Use 15-20 per video.</p>
            {Object.entries(youtubePlaybook.tags).map(([group, tags]) => (
              <div key={group} className="mb-4 last:mb-0">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-slate-400 capitalize">
                    {group.replace(/_/g, " ")}
                    {group === "always" && <span className="text-sc-primary ml-1">(include in every video)</span>}
                  </p>
                  <button onClick={() => copyToClipboard(tags.join(", "), `tags-${group}`)} className="text-slate-500 hover:text-white">
                    <span className="material-symbols-outlined text-[14px]">{copiedField === `tags-${group}` ? "check" : "content_copy"}</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => <SCBadge key={tag}>{tag}</SCBadge>)}
                </div>
              </div>
            ))}
          </SCGlassCard>
        </div>
      )}

      {/* TAB: Branding */}
      {activeTab === "branding" && (
        <div className="space-y-6">
          <SCGlassCard variant="strong" className="p-5">
            <p className="text-sm font-bold text-white mb-1">Thumbnail Best Practices</p>
            <p className="text-xs text-slate-500 mb-4">
              {youtubePlaybook.thumbnailBestPractices.dimensions} | {youtubePlaybook.thumbnailBestPractices.format}
            </p>
            <ul className="space-y-2">
              {youtubePlaybook.thumbnailBestPractices.guidelines.map((g, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-300">
                  <span className="text-slate-600 shrink-0 font-mono text-xs mt-0.5">{String(i + 1).padStart(2, "0")}</span>
                  {g}
                </li>
              ))}
            </ul>
            <div className="pt-4 mt-4 border-t border-sc-border">
              <p className="text-xs font-bold text-slate-400 mb-3">Brand Color Palette</p>
              <div className="flex gap-3">
                {Object.entries(youtubePlaybook.thumbnailBestPractices.colorPalette).map(([name, value]) => {
                  const hex = value.split(" ")[0];
                  return (
                    <div key={name} className="flex flex-col items-center gap-1.5">
                      <div className="w-12 h-12 rounded-lg border border-sc-border" style={{ backgroundColor: hex }} />
                      <p className="text-[10px] text-slate-500 capitalize">{name}</p>
                      <p className="text-[10px] text-slate-600 font-mono">{hex}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </SCGlassCard>

          <div className="grid gap-4 md:grid-cols-2">
            <SCGlassCard className="p-5">
              <p className="text-sm font-bold text-white mb-1">End Screen</p>
              <p className="text-xs text-slate-500 mb-3">Last {youtubePlaybook.brandingGuidelines.endScreen.duration} of every video</p>
              <ul className="space-y-1.5">
                {youtubePlaybook.brandingGuidelines.endScreen.elements.map((el) => (
                  <li key={el} className="flex gap-2 text-xs text-slate-300">
                    <span className="material-symbols-outlined text-[14px] text-emerald-400 shrink-0 mt-0.5">check_circle</span>
                    {el}
                  </li>
                ))}
              </ul>
            </SCGlassCard>
            <SCGlassCard className="p-5">
              <p className="text-sm font-bold text-white mb-1">Watermark</p>
              <p className="text-xs text-slate-500 mb-3">Appears {youtubePlaybook.brandingGuidelines.watermark.timing}</p>
              <p className="text-sm text-slate-300">{youtubePlaybook.brandingGuidelines.watermark.recommendation}</p>
            </SCGlassCard>
          </div>
        </div>
      )}

      {/* TAB: Live Preview */}
      {activeTab === "preview" && (
        <SCGlassCard variant="strong" className="p-5">
          <p className="text-sm font-bold text-white mb-4">Published Videos</p>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <div className="aspect-[9/16] max-w-[320px] rounded-xl overflow-hidden bg-black mx-auto border border-sc-border">
                <iframe
                  src="https://www.youtube.com/embed/P0HdL4EMziE"
                  title="Jacob Rodgers - YouTube Short"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
              <div className="mt-3 text-center">
                <p className="text-sm font-bold text-white">First YouTube Short</p>
                <a
                  href="https://youtube.com/shorts/P0HdL4EMziE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-sc-primary hover:text-white inline-flex items-center gap-1 mt-1"
                >
                  Watch on YouTube <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                </a>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg border border-sc-border bg-white/5 p-4">
                <p className="text-sm font-bold text-white mb-3">Channel Status</p>
                <div className="space-y-3">
                  {[
                    ["Published Videos", "1"],
                    ["Videos Ready to Upload", String(totalVideos)],
                    ["Shorts Ready", String((videosByCategory["shorts"]?.length || 0) + verticalCount)],
                    ["Channel Setup", `${progressPercent}%`],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">{label}</span>
                      <SCBadge>{value}</SCBadge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-sc-primary/30 bg-sc-primary/5 p-4">
                <p className="text-sm font-bold text-white mb-2">Next Steps</p>
                <ul className="space-y-1.5">
                  {checklist.filter((c) => !c.completed).slice(0, 4).map((item) => (
                    <li key={item.id} className="flex gap-2 text-xs text-slate-300">
                      <span className="material-symbols-outlined text-[14px] text-slate-500 shrink-0 mt-0.5">radio_button_unchecked</span>
                      {item.label}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border border-sc-border bg-white/5 p-4">
                <p className="text-sm font-bold text-white mb-2">Quick Links</p>
                <div className="space-y-2">
                  {[
                    { href: "https://studio.youtube.com", label: "YouTube Studio Dashboard" },
                    { href: "https://youtube.com/upload", label: "Upload New Video" },
                    { href: "https://youtube.com/shorts/P0HdL4EMziE", label: "View Published Short" },
                  ].map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-slate-400 hover:text-sc-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </SCGlassCard>
      )}
    </div>
  );
}
