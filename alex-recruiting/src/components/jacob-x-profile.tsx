"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  MapPin,
  Link as LinkIcon,
  CalendarDays,
  CheckCircle2,
  Copy,
  Check,
  Pin,
  Heart,
  MessageCircle,
  Repeat2,
  BarChart3,
  Share,
  Camera,
  Image,
  Video,
  Type,
  Clock,
  Target,
  TrendingUp,
  Hash,
  ChevronDown,
  ChevronUp,
  XCircle,
  ArrowUpRight,
} from "lucide-react";
import { jacobProfile } from "@/lib/data/jacob-profile";
import { jacobXProfile } from "@/lib/data/jacob-x-profile";

// ─── Helpers ────────────────────────────────────────────────────────────────

function getPillarBadgeVariant(pillar: string) {
  switch (pillar) {
    case "performance":
      return "performance" as const;
    case "work_ethic":
      return "work_ethic" as const;
    case "character":
      return "character" as const;
    default:
      return "default" as const;
  }
}

function getPillarLabel(pillar: string) {
  switch (pillar) {
    case "performance":
      return "Performance";
    case "work_ethic":
      return "Work Ethic";
    case "character":
      return "Character";
    default:
      return pillar;
  }
}

function getMediaIcon(mediaType: string) {
  switch (mediaType) {
    case "video":
      return Video;
    case "photo":
      return Image;
    case "carousel":
      return Camera;
    default:
      return Type;
  }
}

function getMediaLabel(mediaType: string) {
  switch (mediaType) {
    case "video":
      return "Video";
    case "photo":
      return "Photo";
    case "carousel":
      return "Carousel";
    default:
      return "Text";
  }
}

// ─── Copy Button ────────────────────────────────────────────────────────────

function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className={cn("gap-1.5", className)}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-green-500" />
          <span className="text-green-500 text-xs">Copied</span>
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          <span className="text-xs">Copy</span>
        </>
      )}
    </Button>
  );
}

// ─── Section 1: Profile Preview ─────────────────────────────────────────────

function ProfilePreview() {
  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">X</span>
          </div>
          Profile Preview
        </CardTitle>
        <CardDescription>
          How Jacob&apos;s profile will look on X (Twitter)
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {/* X Profile Mockup — Dark Theme */}
        <div className="bg-black text-white rounded-b-lg overflow-hidden">
          {/* Header Image */}
          <div className="h-44 bg-gradient-to-br from-slate-800 via-blue-900 to-slate-900 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-1 opacity-80">
                <p className="text-lg font-bold tracking-wide">
                  6&apos;4&quot; | 285 | Class of 2029
                </p>
                <p className="text-sm text-slate-300">Pewaukee, Wisconsin</p>
              </div>
            </div>
            <div className="absolute bottom-2 right-3">
              <Camera className="h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Profile Info */}
          <div className="px-4 pb-4 relative">
            {/* Avatar */}
            <div className="absolute -top-12 left-4">
              <div className="h-24 w-24 rounded-full border-4 border-black bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">JR</span>
              </div>
            </div>

            {/* Edit Profile Button */}
            <div className="flex justify-end pt-2 pb-8">
              <div className="border border-slate-600 rounded-full px-4 py-1.5 text-sm font-semibold text-slate-300 cursor-default">
                Edit profile
              </div>
            </div>

            {/* Name + Handle */}
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold">
                  {jacobXProfile.displayName}
                </span>
                <svg
                  viewBox="0 0 22 22"
                  className="h-5 w-5 text-blue-400 fill-current"
                >
                  <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.69-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.636.433 1.221.878 1.69.47.446 1.055.752 1.69.883.635.13 1.294.083 1.902-.143.271.586.702 1.084 1.24 1.438.54.354 1.167.551 1.813.568.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.225 1.261.272 1.893.143.636-.131 1.222-.434 1.694-.88.445-.47.749-1.055.878-1.691.13-.634.075-1.293-.148-1.9.587-.27 1.088-.7 1.443-1.242.355-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" />
                </svg>
              </div>
              <p className="text-slate-500 text-sm">{jacobXProfile.handle}</p>
            </div>

            {/* Bio */}
            <p className="mt-3 text-sm leading-relaxed whitespace-pre-line">
              {jacobXProfile.bio}
            </p>

            {/* Location, Link, Join Date */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-slate-500 text-sm">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {jacobXProfile.location}
              </span>
              <span className="flex items-center gap-1">
                <LinkIcon className="h-4 w-4" />
                <span className="text-blue-400">
                  {jacobXProfile.website || "ncsasports.org/..."}
                </span>
              </span>
              <span className="flex items-center gap-1">
                <CalendarDays className="h-4 w-4" />
                Joined {jacobXProfile.joinDate}
              </span>
            </div>

            {/* Following / Followers */}
            <div className="flex gap-4 mt-3 text-sm">
              <span>
                <span className="font-bold text-white">
                  {jacobXProfile.followingCount}
                </span>{" "}
                <span className="text-slate-500">Following</span>
              </span>
              <span>
                <span className="font-bold text-white">
                  {jacobXProfile.followersCount}
                </span>{" "}
                <span className="text-slate-500">Followers</span>
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Section 2: Profile Checklist ───────────────────────────────────────────

function ProfileChecklist() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          Profile Setup Checklist
        </CardTitle>
        <CardDescription>
          Everything needed before the first post goes live
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {jacobXProfile.checklist.map((item) => (
            <div
              key={item.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                item.complete
                  ? "bg-green-50 border-green-200"
                  : "bg-slate-50 border-slate-200"
              )}
            >
              <div className="mt-0.5">
                {item.complete ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{item.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {item.description}
                </p>
              </div>
              <div>
                {item.complete ? (
                  <Badge variant="posted" className="text-xs">
                    Done
                  </Badge>
                ) : (
                  <Badge variant="draft" className="text-xs">
                    To Do
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">
              {jacobXProfile.checklist.filter((c) => c.complete).length}/
              {jacobXProfile.checklist.length}
            </span>{" "}
            items complete. Finish all items before launching the account.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Section 3: Pinned Post Preview ─────────────────────────────────────────

function PinnedPostPreview() {
  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Pin className="h-5 w-5 text-blue-500" />
          Pinned Post
        </CardTitle>
        <CardDescription>{jacobXProfile.pinnedPost.notes}</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="bg-black text-white p-4 rounded-b-lg">
          {/* Pin indicator */}
          <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-2 ml-10">
            <Pin className="h-3 w-3" />
            Pinned
          </div>

          <div className="flex gap-3">
            {/* Avatar */}
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold">JR</span>
            </div>

            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm">
                  {jacobXProfile.displayName}
                </span>
                <svg
                  viewBox="0 0 22 22"
                  className="h-4 w-4 text-blue-400 fill-current flex-shrink-0"
                >
                  <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.69-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.636.433 1.221.878 1.69.47.446 1.055.752 1.69.883.635.13 1.294.083 1.902-.143.271.586.702 1.084 1.24 1.438.54.354 1.167.551 1.813.568.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.225 1.261.272 1.893.143.636-.131 1.222-.434 1.694-.88.445-.47.749-1.055.878-1.691.13-.634.075-1.293-.148-1.9.587-.27 1.088-.7 1.443-1.242.355-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" />
                </svg>
                <span className="text-slate-500 text-sm">
                  {jacobXProfile.handle}
                </span>
              </div>

              {/* Content */}
              <div className="mt-2 text-sm leading-relaxed whitespace-pre-line">
                {jacobXProfile.pinnedPost.content.split(/(#\w+)/g).map((part, i) =>
                  part.startsWith("#") ? (
                    <span key={i} className="text-blue-400">
                      {part}
                    </span>
                  ) : (
                    <span key={i}>{part}</span>
                  )
                )}
              </div>

              {/* Engagement mockup */}
              <div className="flex items-center gap-6 mt-3 text-slate-500">
                <span className="flex items-center gap-1.5 text-xs hover:text-blue-400 cursor-pointer">
                  <MessageCircle className="h-4 w-4" /> 3
                </span>
                <span className="flex items-center gap-1.5 text-xs hover:text-green-400 cursor-pointer">
                  <Repeat2 className="h-4 w-4" /> 8
                </span>
                <span className="flex items-center gap-1.5 text-xs hover:text-pink-400 cursor-pointer">
                  <Heart className="h-4 w-4" /> 24
                </span>
                <span className="flex items-center gap-1.5 text-xs hover:text-blue-400 cursor-pointer">
                  <BarChart3 className="h-4 w-4" /> 412
                </span>
                <span className="flex items-center gap-1.5 text-xs hover:text-blue-400 cursor-pointer">
                  <Share className="h-4 w-4" />
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 flex justify-end">
            <CopyButton
              text={jacobXProfile.pinnedPost.content}
              className="text-slate-400 hover:text-white"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Single Post Card (X-style dark) ────────────────────────────────────────

function PostCard({
  post,
}: {
  post: (typeof jacobXProfile.posts)[number];
}) {
  const [expanded, setExpanded] = useState(false);
  const MediaIcon = getMediaIcon(post.mediaType);
  const charCount = post.content.length;

  return (
    <div className="bg-black text-white rounded-lg border border-slate-800 overflow-hidden">
      {/* Post meta header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className="bg-slate-800 text-slate-300 border-slate-700 text-xs">
            #{post.id}
          </Badge>
          <Badge className="bg-slate-800 text-slate-300 border-slate-700 text-xs">
            Week {post.weekNumber}, {post.day}
          </Badge>
          <Badge variant={getPillarBadgeVariant(post.pillar)}>
            {getPillarLabel(post.pillar)}
          </Badge>
          <span className="flex items-center gap-1 text-slate-500 text-xs">
            <MediaIcon className="h-3 w-3" />
            {getMediaLabel(post.mediaType)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Clock className="h-3 w-3" />
          {post.suggestedTime}
        </div>
      </div>

      {/* Post content — X style */}
      <div className="px-4 py-2">
        <div className="flex gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold">JR</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="font-bold text-sm">
                {jacobXProfile.displayName}
              </span>
              <span className="text-slate-500 text-xs">
                {jacobXProfile.handle}
              </span>
            </div>
            <div className="text-sm leading-relaxed whitespace-pre-line">
              {post.content.split(/(#\w+|@\w+)/g).map((part, i) =>
                part.startsWith("#") || part.startsWith("@") ? (
                  <span key={i} className="text-blue-400">
                    {part}
                  </span>
                ) : (
                  <span key={i}>{part}</span>
                )
              )}
            </div>

            {/* Media placeholder */}
            {post.mediaType !== "text" && (
              <div className="mt-2 rounded-xl border border-slate-800 bg-slate-900 h-20 flex items-center justify-center text-slate-600">
                <MediaIcon className="h-6 w-6 mr-2" />
                <span className="text-xs">{getMediaLabel(post.mediaType)} attachment</span>
              </div>
            )}

            {/* Engagement mockup */}
            <div className="flex items-center gap-6 mt-2 text-slate-600">
              <span className="flex items-center gap-1.5 text-xs">
                <MessageCircle className="h-3.5 w-3.5" />
              </span>
              <span className="flex items-center gap-1.5 text-xs">
                <Repeat2 className="h-3.5 w-3.5" />
              </span>
              <span className="flex items-center gap-1.5 text-xs">
                <Heart className="h-3.5 w-3.5" />
              </span>
              <span className="flex items-center gap-1.5 text-xs">
                <BarChart3 className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer: char count, notes, copy */}
      <div className="px-4 py-2 border-t border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "text-xs font-mono",
              charCount > 280 ? "text-red-400" : "text-slate-500"
            )}
          >
            {charCount}/280
          </span>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3 w-3" /> Hide notes
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" /> Notes
              </>
            )}
          </button>
        </div>
        <CopyButton
          text={post.content}
          className="text-slate-400 hover:text-white"
        />
      </div>

      {/* Expandable notes */}
      {expanded && (
        <div className="px-4 pb-3 border-t border-slate-800">
          <p className="text-xs text-slate-400 pt-2">{post.notes}</p>
        </div>
      )}
    </div>
  );
}

// ─── Section 4: All 30 Posts ────────────────────────────────────────────────

function PostTimeline() {
  const [activeWeek, setActiveWeek] = useState<number | "all">("all");

  const filteredPosts =
    activeWeek === "all"
      ? jacobXProfile.posts
      : jacobXProfile.posts.filter((p) => p.weekNumber === activeWeek);

  const weekLabels: Record<number, string> = {
    1: "Introduction",
    2: "Consistency",
    3: "Consistency",
    4: "Engagement",
    5: "Engagement",
    6: "Momentum",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          First 30 Posts &mdash; 6-Week Content Calendar
        </CardTitle>
        <CardDescription>
          Complete, ready-to-copy posts. 5 per week across all pillars.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Week filter */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant={activeWeek === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveWeek("all")}
          >
            All Posts ({jacobXProfile.posts.length})
          </Button>
          {[1, 2, 3, 4, 5, 6].map((w) => (
            <Button
              key={w}
              variant={activeWeek === w ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveWeek(w)}
            >
              Week {w}{" "}
              <span className="ml-1 text-xs opacity-70">
                {weekLabels[w]}
              </span>
            </Button>
          ))}
        </div>

        {/* Posts */}
        <div className="space-y-3 max-h-[800px] overflow-y-auto pr-1">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Section 5: Content Strategy Summary ────────────────────────────────────

function ContentStrategySummary() {
  const pillarCounts = jacobXProfile.posts.reduce(
    (acc, post) => {
      acc[post.pillar] = (acc[post.pillar] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const total = jacobXProfile.posts.length;

  const pillarBars = [
    {
      label: "On-Field Performance",
      key: "performance",
      count: pillarCounts["performance"] || 0,
      color: "bg-blue-500",
      textColor: "text-blue-700",
    },
    {
      label: "Work Ethic & Training",
      key: "work_ethic",
      count: pillarCounts["work_ethic"] || 0,
      color: "bg-orange-500",
      textColor: "text-orange-700",
    },
    {
      label: "Character & Brand",
      key: "character",
      count: pillarCounts["character"] || 0,
      color: "bg-green-500",
      textColor: "text-green-700",
    },
  ];

  const mediaTypes = jacobXProfile.posts.reduce(
    (acc, post) => {
      acc[post.mediaType] = (acc[post.mediaType] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="h-5 w-5 text-purple-600" />
          Content Strategy Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Pillar distribution */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Pillar Distribution</h4>
            <div className="space-y-3">
              {pillarBars.map((p) => (
                <div key={p.key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className={p.textColor}>{p.label}</span>
                    <span className="text-slate-500">
                      {p.count}/{total} ({Math.round((p.count / total) * 100)}%)
                    </span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full", p.color)}
                      style={{
                        width: `${(p.count / total) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Media type breakdown */}
            <h4 className="font-semibold text-sm mt-6 mb-3">Media Types</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(mediaTypes).map(([type, count]) => {
                const Icon = getMediaIcon(type);
                return (
                  <div
                    key={type}
                    className="flex items-center gap-1.5 bg-slate-50 border rounded-lg px-3 py-1.5"
                  >
                    <Icon className="h-3.5 w-3.5 text-slate-500" />
                    <span className="text-sm capitalize">{type}</span>
                    <Badge variant="secondary" className="text-xs ml-1">
                      {count}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-5">
            {/* Posting cadence */}
            <div>
              <h4 className="font-semibold text-sm mb-2">Post Cadence</h4>
              <p className="text-sm text-slate-600">
                5 posts per week for 6 weeks (Mon, Tue, Wed, Thu, Fri)
              </p>
            </div>

            {/* Best posting times */}
            <div>
              <h4 className="font-semibold text-sm mb-2">Best Posting Times</h4>
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-slate-600">
                    <span className="font-medium">Weekdays:</span>{" "}
                    {jacobXProfile.postingTimes.weekday}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-slate-600">
                    <span className="font-medium">Saturday:</span>{" "}
                    {jacobXProfile.postingTimes.saturday}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-slate-600">
                    <span className="font-medium">Sunday:</span>{" "}
                    {jacobXProfile.postingTimes.sunday}
                  </span>
                </div>
              </div>
            </div>

            {/* Hashtag strategy */}
            <div>
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-1.5">
                <Hash className="h-3.5 w-3.5" />
                Hashtag Strategy
              </h4>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Always use:</p>
                  <div className="flex flex-wrap gap-1">
                    {jacobXProfile.hashtagStrategy.always.map((tag) => (
                      <Badge key={tag} variant="default" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">
                    Rotate ({jacobXProfile.hashtagStrategy.maxPerPost} max per
                    post):
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {jacobXProfile.hashtagStrategy.rotate.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 30-day goals */}
            <div>
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-1.5">
                <ArrowUpRight className="h-3.5 w-3.5" />
                30-Day Goals
              </h4>
              <ul className="space-y-1.5">
                {jacobXProfile.thirtyDayGoals.map((goal, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-slate-600"
                  >
                    <div className="h-5 w-5 rounded-full border border-slate-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs text-slate-400">{i + 1}</span>
                    </div>
                    {goal}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Section 6: Bio Variations ──────────────────────────────────────────────

function BioVariations() {
  const bios = jacobProfile.bioVariations;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Type className="h-5 w-5 text-indigo-600" />
          Bio Variations
        </CardTitle>
        <CardDescription>
          Pre-written bio options. Copy, test, and rotate every 30 days.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {bios.map((bio, i) => {
            const charCount = bio.length;
            const isRecommended = i === 1;
            return (
              <div
                key={i}
                className={cn(
                  "p-4 rounded-lg border",
                  isRecommended
                    ? "border-blue-300 bg-blue-50"
                    : "border-slate-200 bg-slate-50"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-medium text-sm">
                        Variation {i + 1}
                      </span>
                      {isRecommended && (
                        <Badge className="bg-blue-600 text-white text-xs">
                          Recommended
                        </Badge>
                      )}
                      <span
                        className={cn(
                          "text-xs font-mono",
                          charCount > 160
                            ? "text-red-500"
                            : "text-slate-500"
                        )}
                      >
                        {charCount}/160 chars
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 whitespace-pre-line">
                      {bio}
                    </p>
                  </div>
                  <CopyButton text={bio} />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function JacobXProfile() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Jacob&apos;s X Profile
        </h1>
        <p className="text-slate-500 mt-1">
          Complete profile blueprint, content calendar, and first 30 posts
          &mdash; ready to deploy.
        </p>
      </div>

      <Tabs defaultValue="preview" className="w-full">
        <TabsList className="w-full flex flex-wrap h-auto gap-1">
          <TabsTrigger value="preview">Profile Preview</TabsTrigger>
          <TabsTrigger value="checklist">Setup Checklist</TabsTrigger>
          <TabsTrigger value="pinned">Pinned Post</TabsTrigger>
          <TabsTrigger value="posts">30 Posts</TabsTrigger>
          <TabsTrigger value="strategy">Strategy</TabsTrigger>
          <TabsTrigger value="bios">Bio Variations</TabsTrigger>
        </TabsList>

        <TabsContent value="preview">
          <ProfilePreview />
        </TabsContent>

        <TabsContent value="checklist">
          <ProfileChecklist />
        </TabsContent>

        <TabsContent value="pinned">
          <PinnedPostPreview />
        </TabsContent>

        <TabsContent value="posts">
          <PostTimeline />
        </TabsContent>

        <TabsContent value="strategy">
          <ContentStrategySummary />
        </TabsContent>

        <TabsContent value="bios">
          <BioVariations />
        </TabsContent>
      </Tabs>
    </div>
  );
}
