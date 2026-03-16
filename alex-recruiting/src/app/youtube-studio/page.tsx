"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  youtubePlaybook,
  categoryToYouTubeMapping,
  formatFileSize,
  formatDuration,
  type VideoStoreEntry,
} from "@/lib/data/youtube-playbook";
import {
  CheckCircle2,
  Circle,
  ExternalLink,
  Play,
  Upload,
  Clock,
  Film,
  Star,
  Dumbbell,
  Trophy,
  Smartphone,
  Search,
  Palette,
  LayoutList,
  Tag,
  FileText,
  ImageIcon,
  CalendarDays,
  Link2,
  Type,
  Copy,
  Check,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Channel Setup Checklist
// ---------------------------------------------------------------------------
type ChecklistItem = {
  id: string;
  label: string;
  description: string;
  completed: boolean;
};

const initialChecklist: ChecklistItem[] = [
  {
    id: "channel-name",
    label: "Set channel name",
    description: `Recommended: "${youtubePlaybook.channel.recommendedName}"`,
    completed: false,
  },
  {
    id: "handle",
    label: "Claim @handle",
    description: `Suggestions: ${youtubePlaybook.channel.handleSuggestions.join(", ")}`,
    completed: false,
  },
  {
    id: "profile-pic",
    label: "Upload profile picture",
    description: youtubePlaybook.channel.profilePicSpecs.recommendation,
    completed: false,
  },
  {
    id: "banner",
    label: "Upload channel banner",
    description: `${youtubePlaybook.channel.bannerSpecs.dimensions} — include name, #79, position, school, class year`,
    completed: false,
  },
  {
    id: "about",
    label: "Write About section",
    description: "Full bio with stats, measurables, contact info, and links",
    completed: false,
  },
  {
    id: "links",
    label: "Add channel links",
    description: youtubePlaybook.channel.links.map((l) => l.label).join(", "),
    completed: false,
  },
  {
    id: "watermark",
    label: "Upload branding watermark",
    description: youtubePlaybook.brandingGuidelines.watermark.recommendation,
    completed: false,
  },
  {
    id: "playlists",
    label: "Create playlists",
    description: youtubePlaybook.playlists.map((p) => p.name).join(", "),
    completed: false,
  },
  {
    id: "first-video",
    label: "Upload first video",
    description: "Start with your best highlight reel to anchor the channel",
    completed: true,
  },
  {
    id: "end-screen",
    label: "Set up end screen template",
    description: "Subscribe button + latest highlight link in last 20 seconds",
    completed: false,
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getCategoryIcon(id: string): React.ReactNode {
  switch (id) {
    case "highlights": return <Star className="h-4 w-4 text-yellow-500" />;
    case "training": return <Dumbbell className="h-4 w-4 text-blue-500" />;
    case "game_film": return <Film className="h-4 w-4 text-purple-500" />;
    case "camps_combines": return <Trophy className="h-4 w-4 text-orange-500" />;
    case "shorts": return <Smartphone className="h-4 w-4 text-red-500" />;
    default: return <Film className="h-4 w-4 text-slate-400" />;
  }
}

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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function YouTubeStudioPage() {
  const [checklist, setChecklist] = useState(initialChecklist);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [videoStore, setVideoStore] = useState<VideoStoreEntry[]>([]);

  useEffect(() => {
    let active = true;

    async function loadVideoStore() {
      try {
        const response = await fetch("/api/videos", { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Failed to load videos: ${response.status}`);
        }

        const payload = (await response.json()) as {
          assets?: VideoStoreEntry[];
        };

        if (active) {
          setVideoStore(payload.assets ?? []);
        }
      } catch (error) {
        console.error("Failed to load video store:", error);
        if (active) {
          setVideoStore([]);
        }
      }
    }

    loadVideoStore();

    return () => {
      active = false;
    };
  }, []);

  const completedCount = checklist.filter((c) => c.completed).length;
  const progressPercent = Math.round((completedCount / checklist.length) * 100);

  function toggleChecklistItem(id: string) {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  }

  function copyToClipboard(text: string, fieldId: string) {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  }

  // Group video store entries by YouTube category
  const videosByCategory = videoStore.reduce<Record<string, VideoStoreEntry[]>>((acc, v) => {
    const cat = mapVideoToYouTubeCategory(v);
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(v);
    return acc;
  }, {});

  // Stats
  const totalVideos = videoStore.length;
  const totalSize = videoStore.reduce((sum, v) => sum + v.fileSize, 0);
  const totalDuration = videoStore.reduce((sum, v) => sum + v.duration, 0);
  const verticalCount = videoStore.filter(isVertical).length;
  const fourKCount = videoStore.filter((v) => v.width >= 3840 || v.height >= 3840).length;

  return (
    <div className="space-y-8 max-w-6xl">
      {/* ================================================================ */}
      {/* Page Header                                                       */}
      {/* ================================================================ */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-600 text-white">
            <Play className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">YouTube Studio</h1>
            <p className="text-sm text-slate-500">
              Channel strategy and upload plan for Jacob Rodgers&apos; recruiting channel
            </p>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* Stats Overview                                                    */}
      {/* ================================================================ */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Videos in Library", value: totalVideos, icon: Film },
          { label: "Total Size", value: formatFileSize(totalSize), icon: Upload },
          { label: "Total Duration", value: formatDuration(totalDuration), icon: Clock },
          { label: "Vertical (Shorts)", value: verticalCount, icon: Smartphone },
          { label: "4K Videos", value: fourKCount, icon: Star },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className="h-4 w-4 text-slate-400" />
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
              <p className="text-xl font-bold text-slate-900">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ================================================================ */}
      {/* Tabs                                                              */}
      {/* ================================================================ */}
      <Tabs defaultValue="setup" className="space-y-6">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="setup">Channel Setup</TabsTrigger>
          <TabsTrigger value="videos">Video Upload Plan</TabsTrigger>
          <TabsTrigger value="playbook">SEO Playbook</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="preview">Live Preview</TabsTrigger>
        </TabsList>

        {/* -------------------------------------------------------------- */}
        {/* TAB: Channel Setup                                              */}
        {/* -------------------------------------------------------------- */}
        <TabsContent value="setup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Channel Setup Checklist</CardTitle>
              <CardDescription>
                {completedCount} of {checklist.length} complete ({progressPercent}%)
              </CardDescription>
              <div className="h-2 w-full rounded-full bg-slate-100 mt-2">
                <div
                  className="h-2 rounded-full bg-red-600 transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              {checklist.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleChecklistItem(item.id)}
                  className="w-full flex items-start gap-3 rounded-lg px-3 py-3 text-left hover:bg-slate-50 transition-colors"
                >
                  {item.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-slate-300 mt-0.5 shrink-0" />
                  )}
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        item.completed ? "text-slate-400 line-through" : "text-slate-900"
                      }`}
                    >
                      {item.label}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* About Section Template */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">About Section Template</CardTitle>
                <button
                  onClick={() => copyToClipboard(youtubePlaybook.channel.aboutSection, "about")}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors"
                >
                  {copiedField === "about" ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-green-600" />
                      <span className="text-green-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="text-xs text-slate-700 bg-slate-50 rounded-lg p-4 whitespace-pre-wrap font-mono">
                {youtubePlaybook.channel.aboutSection}
              </pre>
            </CardContent>
          </Card>

          {/* Channel Links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                Channel Links
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {youtubePlaybook.channel.links.map((link) => (
                  <div key={link.label} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{link.label}</p>
                      <p className="text-xs text-slate-500">{link.url}</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Playlists to Create */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <LayoutList className="h-4 w-4" />
                Playlists to Create
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {youtubePlaybook.playlists.map((pl) => (
                  <div key={pl.name} className="rounded-lg border border-slate-200 p-4">
                    <p className="text-sm font-semibold text-slate-900">{pl.name}</p>
                    <p className="text-xs text-slate-500 mt-1">{pl.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* -------------------------------------------------------------- */}
        {/* TAB: Video Upload Plan                                          */}
        {/* -------------------------------------------------------------- */}
        <TabsContent value="videos" className="space-y-6">
          {/* Upload Categories */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {youtubePlaybook.categories.map((cat) => (
              <Card key={cat.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(cat.id)}
                    <CardTitle className="text-base">{cat.name}</CardTitle>
                  </div>
                  <CardDescription className="text-xs">{cat.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-3">
                  <div className="flex flex-wrap gap-2 text-xs">
                    <Badge variant="secondary">{cat.uploadFrequency}</Badge>
                    <Badge variant="outline">{cat.idealLength}</Badge>
                  </div>
                  <ul className="space-y-1.5">
                    {cat.tips.map((tip, i) => (
                      <li key={i} className="text-xs text-slate-600 flex gap-2">
                        <span className="text-slate-400 shrink-0">-</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                  {videosByCategory[cat.id] && (
                    <div className="pt-2 border-t border-slate-100">
                      <p className="text-xs font-medium text-slate-700">
                        {videosByCategory[cat.id].length} videos ready to upload
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Upload Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Upload Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {[youtubePlaybook.uploadSchedule.inSeason, youtubePlaybook.uploadSchedule.offSeason].map(
                  (schedule) => (
                    <div key={schedule.label}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-slate-900">{schedule.label}</h3>
                        <Badge variant="secondary">{schedule.weeklyTarget} / week</Badge>
                      </div>
                      <div className="space-y-2">
                        {schedule.cadence.map((item, i) => (
                          <div key={i} className="flex items-start gap-3 rounded-lg bg-slate-50 px-3 py-2.5">
                            <div className="w-20 shrink-0">
                              <p className="text-xs font-semibold text-slate-700">{item.day}</p>
                              <p className="text-[10px] text-slate-400">{item.time}</p>
                            </div>
                            <p className="text-xs text-slate-600">{item.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs font-medium text-slate-700 mb-2">Best Upload Times (CT)</p>
                <div className="flex flex-wrap gap-2">
                  {youtubePlaybook.uploadSchedule.bestUploadTimes.map((time, i) => (
                    <Badge key={i} variant="outline" className="text-xs font-normal">
                      {time}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Videos from Video Store */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Video Library — Ready for YouTube
              </CardTitle>
              <CardDescription>
                {totalVideos} videos from the local video store, categorized for upload
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.entries(videosByCategory)
                .sort(([a], [b]) => {
                  const order = ["highlights", "game_film", "training", "camps_combines", "shorts"];
                  return order.indexOf(a) - order.indexOf(b);
                })
                .map(([cat, videos]) => (
                  <div key={cat} className="mb-6 last:mb-0">
                    <div className="flex items-center gap-2 mb-3">
                      {getCategoryIcon(cat)}
                      <h3 className="text-sm font-semibold text-slate-900">
                        {categoryLabel[cat] || cat}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {videos.length}
                      </Badge>
                    </div>
                    <div className="space-y-1.5">
                      {videos.map((video) => (
                        <div
                          key={video.id}
                          className="flex items-center gap-3 rounded-lg border border-slate-100 px-3 py-2.5 hover:bg-slate-50 transition-colors"
                        >
                          {/* Thumbnail */}
                          <div className="w-16 h-10 rounded bg-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                            {video.thumbnailUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={video.thumbnailUrl}
                                alt={video.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Film className="h-4 w-4 text-slate-400" />
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-slate-900 truncate">
                              {video.name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-slate-400">
                                {formatDuration(video.duration)}
                              </span>
                              <span className="text-[10px] text-slate-300">|</span>
                              <span className="text-[10px] text-slate-400">
                                {formatFileSize(video.fileSize)}
                              </span>
                              <span className="text-[10px] text-slate-300">|</span>
                              <span className="text-[10px] text-slate-400">
                                {resolutionLabel(video)}
                              </span>
                              {isVertical(video) && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                  Vertical
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Upload status */}
                          <Badge
                            variant={video.uploadStatus === "local" ? "outline" : "default"}
                            className="text-[10px] shrink-0"
                          >
                            {video.uploadStatus === "local" ? "Not uploaded" : video.uploadStatus}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* -------------------------------------------------------------- */}
        {/* TAB: SEO Playbook                                               */}
        {/* -------------------------------------------------------------- */}
        <TabsContent value="playbook" className="space-y-6">
          {/* SEO Tips */}
          {youtubePlaybook.seoTips.map((section) => (
            <Card key={section.title}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Search className="h-4 w-4 text-slate-400" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {section.tips.map((tip, i) => (
                    <li key={i} className="flex gap-3 text-sm text-slate-700">
                      <span className="text-slate-300 shrink-0 font-mono text-xs mt-0.5">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}

          {/* Title Formats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Type className="h-4 w-4" />
                Recommended Title Formats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {youtubePlaybook.titleFormats.examples.map((ex, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg bg-slate-50 px-4 py-3"
                >
                  <Play className="h-3.5 w-3.5 text-red-500 shrink-0" />
                  <p className="text-sm text-slate-800 font-mono">{ex}</p>
                  <button
                    onClick={() => copyToClipboard(ex, `title-${i}`)}
                    className="ml-auto shrink-0"
                  >
                    {copiedField === `title-${i}` ? (
                      <Check className="h-3.5 w-3.5 text-green-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-slate-400 hover:text-slate-600" />
                    )}
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Description Template */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Description Template
                </CardTitle>
                <button
                  onClick={() => copyToClipboard(youtubePlaybook.descriptionTemplate, "desc")}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors"
                >
                  {copiedField === "desc" ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-green-600" />
                      <span className="text-green-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="text-xs text-slate-700 bg-slate-50 rounded-lg p-4 whitespace-pre-wrap font-mono leading-relaxed">
                {youtubePlaybook.descriptionTemplate}
              </pre>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Recommended Tags
              </CardTitle>
              <CardDescription>
                Copy and paste into YouTube&apos;s tag field. Use 15-20 per video.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(youtubePlaybook.tags).map(([group, tags]) => (
                <div key={group}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-slate-700 capitalize">
                      {group.replace(/_/g, " ")}
                      {group === "always" && (
                        <span className="text-red-600 ml-1">(include in every video)</span>
                      )}
                    </p>
                    <button
                      onClick={() => copyToClipboard(tags.join(", "), `tags-${group}`)}
                      className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-600"
                    >
                      {copiedField === `tags-${group}` ? (
                        <Check className="h-3 w-3 text-green-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs font-normal">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* -------------------------------------------------------------- */}
        {/* TAB: Branding                                                   */}
        {/* -------------------------------------------------------------- */}
        <TabsContent value="branding" className="space-y-6">
          {/* Thumbnail Best Practices */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Thumbnail Best Practices
              </CardTitle>
              <CardDescription>
                {youtubePlaybook.thumbnailBestPractices.dimensions} | {youtubePlaybook.thumbnailBestPractices.format}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {youtubePlaybook.thumbnailBestPractices.guidelines.map((g, i) => (
                  <li key={i} className="flex gap-3 text-sm text-slate-700">
                    <span className="text-slate-300 shrink-0 font-mono text-xs mt-0.5">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {g}
                  </li>
                ))}
              </ul>

              {/* Color Palette */}
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-700 mb-3">Brand Color Palette</p>
                <div className="flex gap-3">
                  {Object.entries(youtubePlaybook.thumbnailBestPractices.colorPalette).map(
                    ([name, value]) => {
                      const hex = value.split(" ")[0];
                      return (
                        <div key={name} className="flex flex-col items-center gap-1.5">
                          <div
                            className="w-12 h-12 rounded-lg border border-slate-200 shadow-sm"
                            style={{ backgroundColor: hex }}
                          />
                          <p className="text-[10px] text-slate-500 capitalize">{name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{hex}</p>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Font Recommendations */}
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-700 mb-2">Recommended Fonts</p>
                <div className="flex flex-wrap gap-2">
                  {youtubePlaybook.thumbnailBestPractices.fontRecommendations.map((font) => (
                    <Badge key={font} variant="outline" className="text-xs font-normal">
                      {font}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Template Layout */}
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-700 mb-2">
                  {youtubePlaybook.thumbnailBestPractices.templateLayout.description}
                </p>
                <div className="space-y-1.5">
                  {youtubePlaybook.thumbnailBestPractices.templateLayout.zones.map((zone, i) => (
                    <div key={i} className="flex gap-2 text-xs text-slate-600">
                      <span className="text-slate-400 shrink-0">-</span>
                      {zone}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Banner Specs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Channel Banner
              </CardTitle>
              <CardDescription>
                {youtubePlaybook.channel.bannerSpecs.dimensions} (safe area:{" "}
                {youtubePlaybook.channel.bannerSpecs.safeArea})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs font-semibold text-slate-700 mb-2">Required Elements</p>
              <div className="flex flex-wrap gap-2">
                {youtubePlaybook.channel.bannerSpecs.elements.map((el) => (
                  <Badge key={el} variant="secondary" className="text-xs font-normal">
                    {el}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* End Screen & Watermark */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">End Screen</CardTitle>
                <CardDescription>
                  Last {youtubePlaybook.brandingGuidelines.endScreen.duration} of every video
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5">
                  {youtubePlaybook.brandingGuidelines.endScreen.elements.map((el) => (
                    <li key={el} className="flex gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
                      {el}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Watermark</CardTitle>
                <CardDescription>
                  Appears {youtubePlaybook.brandingGuidelines.watermark.timing}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700">
                  {youtubePlaybook.brandingGuidelines.watermark.recommendation}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Cross-Platform Consistency */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cross-Platform Consistency</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {youtubePlaybook.brandingGuidelines.consistency.map((item, i) => (
                  <li key={i} className="flex gap-3 text-sm text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* -------------------------------------------------------------- */}
        {/* TAB: Live Preview                                               */}
        {/* -------------------------------------------------------------- */}
        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Published Videos</CardTitle>
              <CardDescription>
                Jacob&apos;s current YouTube content — embedded preview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {/* Current YouTube Short */}
                <div>
                  <div className="aspect-[9/16] max-w-[320px] rounded-xl overflow-hidden bg-black mx-auto">
                    <iframe
                      src="https://www.youtube.com/embed/P0HdL4EMziE"
                      title="Jacob Rodgers - YouTube Short"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                  <div className="mt-3 text-center">
                    <p className="text-sm font-medium text-slate-900">First YouTube Short</p>
                    <a
                      href="https://youtube.com/shorts/P0HdL4EMziE"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-red-600 hover:text-red-700 inline-flex items-center gap-1 mt-1"
                    >
                      Watch on YouTube <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                {/* Channel Status Panel */}
                <div className="space-y-4">
                  <div className="rounded-lg border border-slate-200 p-4">
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">Channel Status</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-600">Published Videos</span>
                        <Badge variant="default">1</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-600">Videos Ready to Upload</span>
                        <Badge variant="secondary">{totalVideos}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-600">Shorts Ready</span>
                        <Badge variant="secondary">
                          {(videosByCategory["shorts"]?.length || 0) + verticalCount}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-600">Channel Setup</span>
                        <Badge variant={progressPercent === 100 ? "default" : "outline"}>
                          {progressPercent}%
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg bg-red-50 border border-red-100 p-4">
                    <h3 className="text-sm font-semibold text-red-900 mb-2">Next Steps</h3>
                    <ul className="space-y-1.5">
                      {checklist
                        .filter((c) => !c.completed)
                        .slice(0, 4)
                        .map((item) => (
                          <li key={item.id} className="flex gap-2 text-xs text-red-800">
                            <Circle className="h-3.5 w-3.5 text-red-300 shrink-0 mt-0.5" />
                            {item.label}
                          </li>
                        ))}
                      {checklist.filter((c) => !c.completed).length > 4 && (
                        <li className="text-xs text-red-500 pl-5">
                          +{checklist.filter((c) => !c.completed).length - 4} more...
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
                    <h3 className="text-sm font-semibold text-slate-900 mb-2">Quick Links</h3>
                    <div className="space-y-2">
                      <a
                        href="https://studio.youtube.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs text-slate-600 hover:text-red-600 transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                        YouTube Studio Dashboard
                      </a>
                      <a
                        href="https://youtube.com/upload"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs text-slate-600 hover:text-red-600 transition-colors"
                      >
                        <Upload className="h-3 w-3" />
                        Upload New Video
                      </a>
                      <a
                        href="https://youtube.com/shorts/P0HdL4EMziE"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs text-slate-600 hover:text-red-600 transition-colors"
                      >
                        <Play className="h-3 w-3" />
                        View Published Short
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
