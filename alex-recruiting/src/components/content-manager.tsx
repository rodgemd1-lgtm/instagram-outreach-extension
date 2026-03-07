"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  generatePostSchedule,
  exportToCSV,
  exportToJSON,
  getScheduleSummary,
  type AirtablePostRecord,
} from "@/lib/data/airtable-export";

// ─── Helpers ────────────────────────────────────────────────────────────────

function getStatusColor(status: AirtablePostRecord["status"]): string {
  switch (status) {
    case "Draft":
      return "bg-slate-100 text-slate-700";
    case "Ready":
      return "bg-blue-100 text-blue-800";
    case "Scheduled":
      return "bg-purple-100 text-purple-800";
    case "Posted":
      return "bg-green-100 text-green-800";
    case "Skipped":
      return "bg-yellow-100 text-yellow-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function getPillarVariant(pillar: string): "performance" | "work_ethic" | "character" {
  if (pillar === "performance") return "performance";
  if (pillar === "work_ethic") return "work_ethic";
  return "character";
}

function getMediaIcon(mediaType: string): string {
  switch (mediaType) {
    case "video":
      return "🎬";
    case "photo":
      return "📷";
    case "carousel":
      return "🎠";
    case "text":
      return "📝";
    default:
      return "📄";
  }
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function isCurrentWeek(postDate: string): boolean {
  const now = new Date();
  const startOfWeek = new Date(now);
  const dayOfWeek = startOfWeek.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  startOfWeek.setDate(startOfWeek.getDate() + diff);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  const d = new Date(postDate + "T00:00:00");
  return d >= startOfWeek && d < endOfWeek;
}

function isToday(postDate: string): boolean {
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  return postDate === todayStr;
}

function formatDateDisplay(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

// ─── Mock Performance Data ──────────────────────────────────────────────────

const MOCK_PERFORMANCE = [
  { id: "post-001", likes: 12, retweets: 3, replies: 2, impressions: 450 },
  { id: "post-002", likes: 28, retweets: 8, replies: 5, impressions: 1120 },
  { id: "post-003", likes: 9, retweets: 1, replies: 3, impressions: 310 },
  { id: "post-004", likes: 34, retweets: 12, replies: 7, impressions: 1580 },
  { id: "post-005", likes: 18, retweets: 5, replies: 1, impressions: 720 },
];

// ─── Component ──────────────────────────────────────────────────────────────

export function ContentManager() {
  const [posts, setPosts] = useState<AirtablePostRecord[]>(() =>
    generatePostSchedule()
  );
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("schedule");

  const summary = useMemo(() => getScheduleSummary(posts), [posts]);

  const thisWeekPosts = useMemo(
    () => posts.filter((p) => isCurrentWeek(p.postDate)),
    [posts]
  );

  const todayPost = useMemo(
    () => posts.find((p) => isToday(p.postDate)),
    [posts]
  );

  const postsByWeek = useMemo(() => {
    const map = new Map<number, AirtablePostRecord[]>();
    for (const p of posts) {
      const week = map.get(p.weekNumber) || [];
      week.push(p);
      map.set(p.weekNumber, week);
    }
    return map;
  }, [posts]);

  const handleMarkReady = useCallback((postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, status: "Ready" as const } : p))
    );
  }, []);

  const handleMarkPosted = useCallback((postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, status: "Posted" as const } : p))
    );
  }, []);

  const handleCopyContent = useCallback(async (post: AirtablePostRecord) => {
    try {
      await navigator.clipboard.writeText(post.content);
      setCopiedId(post.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback for environments without clipboard API
      const textarea = document.createElement("textarea");
      textarea.value = post.content;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedId(post.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  }, []);

  const handleExportCSV = useCallback(() => {
    const csv = exportToCSV(posts);
    downloadFile(csv, "jacob-rodgers-content-schedule.csv", "text/csv");
  }, [posts]);

  const handleExportJSON = useCallback(() => {
    const json = exportToJSON(posts);
    downloadFile(json, "jacob-rodgers-content-schedule.json", "application/json");
  }, [posts]);

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Manager</h1>
          <p className="text-slate-500 mt-1">
            Airtable + Zapier content management for Jacob Rodgers&apos; X account
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="text-sm px-3 py-1">
            {summary.totalPosts} Posts
          </Badge>
          <Badge variant="secondary" className="text-sm px-3 py-1">
            {summary.weeks} Weeks
          </Badge>
          <Badge variant="secondary" className="text-sm px-3 py-1">
            {summary.startDate} — {summary.endDate}
          </Badge>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="this-week">This Week</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
          <TabsTrigger value="setup">Setup Guide</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* ─── Tab 1: Post Schedule Timeline ─────────────────────── */}
        <TabsContent value="schedule">
          <div className="space-y-6">
            {/* Pillar Distribution */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Content Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <Badge variant="performance">Performance</Badge>
                    <span className="text-sm font-medium">{summary.byPillar.performance} posts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="work_ethic">Work Ethic</Badge>
                    <span className="text-sm font-medium">{summary.byPillar.work_ethic} posts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="character">Character</Badge>
                    <span className="text-sm font-medium">{summary.byPillar.character} posts</span>
                  </div>
                  <div className="ml-auto flex gap-4 text-sm text-slate-500">
                    {Object.entries(summary.byMedia).map(([type, count]) => (
                      <span key={type}>
                        {getMediaIcon(type)} {type}: {count}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Week-by-Week View */}
            {Array.from(postsByWeek.entries()).map(([weekNum, weekPosts]) => (
              <Card key={weekNum}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">
                    Week {weekNum}
                    <span className="text-sm font-normal text-slate-500 ml-2">
                      {weekPosts.length > 0 &&
                        `${formatDateDisplay(weekPosts[0].postDate)} — ${formatDateDisplay(weekPosts[weekPosts.length - 1].postDate)}`}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {weekPosts.map((post) => (
                      <div
                        key={post.id}
                        className={`border rounded-lg p-3 transition-colors ${
                          isToday(post.postDate)
                            ? "border-blue-300 bg-blue-50/50"
                            : "border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium w-24 text-slate-600">
                              {formatDateDisplay(post.postDate)}
                            </span>
                            <span className="text-xs text-slate-400 w-20">
                              {post.postTime}
                            </span>
                            <Badge variant={getPillarVariant(post.pillar)}>
                              {post.pillar.replace("_", " ")}
                            </Badge>
                            <span className="text-sm" title={post.mediaType}>
                              {getMediaIcon(post.mediaType)}
                            </span>
                            <span className="text-sm text-slate-700 truncate max-w-md">
                              {post.content.substring(0, 80)}
                              {post.content.length > 80 ? "..." : ""}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusColor(post.status)}`}
                            >
                              {post.status}
                            </span>
                            {post.status === "Draft" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMarkReady(post.id)}
                              >
                                Mark Ready
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                setExpandedPost(
                                  expandedPost === post.id ? null : post.id
                                )
                              }
                            >
                              {expandedPost === post.id ? "Collapse" : "View"}
                            </Button>
                          </div>
                        </div>

                        {expandedPost === post.id && (
                          <div className="mt-3 pt-3 border-t border-slate-200">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs font-medium text-slate-500 mb-1">
                                  Full Content
                                </p>
                                <p className="text-sm whitespace-pre-wrap bg-white border rounded p-3">
                                  {post.content}
                                </p>
                              </div>
                              <div className="space-y-3">
                                <div>
                                  <p className="text-xs font-medium text-slate-500 mb-1">
                                    Hashtags
                                  </p>
                                  <p className="text-sm text-blue-600">
                                    {post.hashtags}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-slate-500 mb-1">
                                    Media Notes
                                  </p>
                                  <p className="text-sm text-slate-600">
                                    {post.mediaDescription}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleCopyContent(post)}
                                  >
                                    {copiedId === post.id
                                      ? "Copied!"
                                      : "Copy to Clipboard"}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ─── Tab 2: This Week's Posts ───────────────────────── */}
        <TabsContent value="this-week">
          <div className="space-y-6">
            {/* Today's Post */}
            {todayPost ? (
              <Card className="border-blue-300 bg-blue-50/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        Today&apos;s Post
                        <Badge variant={getPillarVariant(todayPost.pillar)}>
                          {todayPost.pillar.replace("_", " ")}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Scheduled for {todayPost.postTime} — {todayPost.dayOfWeek},{" "}
                        {formatDateDisplay(todayPost.postDate)}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyContent(todayPost)}
                      >
                        {copiedId === todayPost.id
                          ? "Copied!"
                          : "Copy to Clipboard"}
                      </Button>
                      {todayPost.status !== "Posted" && (
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleMarkPosted(todayPost.id)}
                        >
                          Mark as Posted
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-white border rounded-lg p-4">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {todayPost.content}
                    </p>
                    <div className="mt-3 pt-3 border-t flex items-center justify-between text-sm">
                      <span className="text-slate-500">
                        {getMediaIcon(todayPost.mediaType)} {todayPost.mediaType} — {todayPost.mediaDescription}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusColor(todayPost.status)}`}
                      >
                        {todayPost.status}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-slate-500">
                  No post scheduled for today. Check the full schedule tab.
                </CardContent>
              </Card>
            )}

            {/* This Week's Remaining Posts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">This Week&apos;s Schedule</CardTitle>
                <CardDescription>
                  {thisWeekPosts.length > 0
                    ? `${thisWeekPosts.length} posts scheduled this week`
                    : "No posts scheduled for this week in the current calendar."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {thisWeekPosts.length > 0 ? (
                  <div className="space-y-3">
                    {thisWeekPosts.map((post) => (
                      <div
                        key={post.id}
                        className={`border rounded-lg p-4 ${
                          isToday(post.postDate) ? "border-blue-300 bg-blue-50/30" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium text-sm">
                                {post.dayOfWeek}
                              </span>
                              <span className="text-xs text-slate-500">
                                {formatDateDisplay(post.postDate)} at {post.postTime}
                              </span>
                              <Badge variant={getPillarVariant(post.pillar)}>
                                {post.pillar.replace("_", " ")}
                              </Badge>
                              <span>{getMediaIcon(post.mediaType)}</span>
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusColor(post.status)}`}
                              >
                                {post.status}
                              </span>
                            </div>
                            <p className="text-sm text-slate-700 whitespace-pre-wrap">
                              {post.content}
                            </p>
                          </div>
                          <div className="flex flex-col gap-1 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCopyContent(post)}
                            >
                              {copiedId === post.id ? "Copied!" : "Copy"}
                            </Button>
                            {post.status === "Draft" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMarkReady(post.id)}
                              >
                                Mark Ready
                              </Button>
                            )}
                            {post.status === "Ready" && (
                              <Button
                                size="sm"
                                variant="success"
                                onClick={() => handleMarkPosted(post.id)}
                              >
                                Posted
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 py-4 text-center">
                    The content schedule starts on {summary.startDate}. Current week has no scheduled posts.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ─── Tab 3: Export Controls ─────────────────────────── */}
        <TabsContent value="export">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Export Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Export Data</CardTitle>
                <CardDescription>
                  Generate files ready to import into Airtable
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-4 space-y-3">
                  <div>
                    <h4 className="font-medium text-sm">CSV Export</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      All 30 posts formatted for Airtable CSV import. Includes dates, times, content, hashtags, and status fields.
                    </p>
                  </div>
                  <Button onClick={handleExportCSV} className="w-full">
                    Export to Airtable CSV
                  </Button>
                </div>

                <div className="border rounded-lg p-4 space-y-3">
                  <div>
                    <h4 className="font-medium text-sm">JSON Export</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Structured JSON with all post data. Use with Airtable API or custom integrations.
                    </p>
                  </div>
                  <Button variant="outline" onClick={handleExportJSON} className="w-full">
                    Export to JSON
                  </Button>
                </div>

                <div className="border rounded-lg p-4 space-y-3">
                  <div>
                    <h4 className="font-medium text-sm">Sync with Airtable</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Push all records directly to Airtable via API. Requires API key configured in environment variables.
                    </p>
                  </div>
                  <Button variant="secondary" disabled className="w-full">
                    Sync with Airtable (Configure API Key)
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Export Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Export Summary</CardTitle>
                <CardDescription>
                  What will be exported
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-slate-50 rounded p-3">
                      <p className="font-medium">{summary.totalPosts}</p>
                      <p className="text-xs text-slate-500">Total Posts</p>
                    </div>
                    <div className="bg-slate-50 rounded p-3">
                      <p className="font-medium">{summary.weeks}</p>
                      <p className="text-xs text-slate-500">Weeks</p>
                    </div>
                    <div className="bg-slate-50 rounded p-3">
                      <p className="font-medium">{summary.startDate}</p>
                      <p className="text-xs text-slate-500">Start Date</p>
                    </div>
                    <div className="bg-slate-50 rounded p-3">
                      <p className="font-medium">{summary.endDate}</p>
                      <p className="text-xs text-slate-500">End Date</p>
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <p className="text-xs font-medium text-slate-500 mb-2">
                      Posts by Status
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(["Draft", "Ready", "Scheduled", "Posted", "Skipped"] as const).map(
                        (status) => {
                          const count = posts.filter((p) => p.status === status).length;
                          if (count === 0) return null;
                          return (
                            <span
                              key={status}
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(status)}`}
                            >
                              {status}: {count}
                            </span>
                          );
                        }
                      )}
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <p className="text-xs font-medium text-slate-500 mb-2">
                      Airtable Table Columns
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {[
                        "Post ID",
                        "Week",
                        "Day",
                        "Date",
                        "Time",
                        "Pillar",
                        "Content",
                        "Hashtags",
                        "Media Type",
                        "Status",
                        "Constitution Check",
                        "Notes",
                        "X Post URL",
                        "Likes",
                        "Retweets",
                        "Replies",
                        "Impressions",
                      ].map((col) => (
                        <span
                          key={col}
                          className="inline-flex items-center rounded border border-slate-200 px-1.5 py-0.5 text-xs text-slate-600"
                        >
                          {col}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ─── Tab 4: Setup Guide ─────────────────────────────── */}
        <TabsContent value="setup">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Airtable + Zapier Setup Guide
              </CardTitle>
              <CardDescription>
                Step-by-step instructions to automate Jacob&apos;s X content pipeline
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Step 1 */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold">
                      1
                    </span>
                    <h4 className="font-medium">Create Airtable Base</h4>
                  </div>
                  <div className="ml-8 text-sm text-slate-600 space-y-2">
                    <p>
                      Create a new Airtable base with the following tables:
                    </p>
                    <div className="bg-slate-50 rounded p-3 font-mono text-xs space-y-1">
                      <p className="font-semibold text-slate-800">Table: Posts</p>
                      <p>- Post ID (Single line text, Primary)</p>
                      <p>- Week Number (Number)</p>
                      <p>- Day of Week (Single select: Mon-Sun)</p>
                      <p>- Post Date (Date)</p>
                      <p>- Post Time (Single line text)</p>
                      <p>- Pillar (Single select: performance, work_ethic, character)</p>
                      <p>- Content (Long text)</p>
                      <p>- Hashtags (Long text)</p>
                      <p>- Media Type (Single select: video, photo, text, carousel)</p>
                      <p>- Media Description (Long text)</p>
                      <p>- Status (Single select: Draft, Ready, Scheduled, Posted, Skipped)</p>
                      <p>- Constitution Check (Single select: Pass, Pending, Fail)</p>
                      <p>- Notes (Long text)</p>
                      <p>- X Post URL (URL)</p>
                      <p>- Engagement: Likes (Number)</p>
                      <p>- Engagement: Retweets (Number)</p>
                      <p>- Engagement: Replies (Number)</p>
                      <p>- Engagement: Impressions (Number)</p>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold">
                      2
                    </span>
                    <h4 className="font-medium">Import CSV</h4>
                  </div>
                  <div className="ml-8 text-sm text-slate-600 space-y-2">
                    <p>
                      Export the CSV from the Export tab, then import into Airtable:
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      <li>Click &quot;Export to Airtable CSV&quot; in the Export tab</li>
                      <li>In Airtable, go to your Posts table</li>
                      <li>Click the &quot;+&quot; button to add a view, select &quot;Import CSV&quot;</li>
                      <li>Upload the downloaded CSV file</li>
                      <li>Map columns to your table fields</li>
                      <li>All 30 posts will be imported with dates and content</li>
                    </ol>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold">
                      3
                    </span>
                    <h4 className="font-medium">
                      Create Zapier Zap: Airtable → X (Twitter)
                    </h4>
                  </div>
                  <div className="ml-8 text-sm text-slate-600 space-y-2">
                    <p>Create a Zap with this flow:</p>
                    <div className="bg-slate-50 rounded p-3 text-xs space-y-1">
                      <p className="font-semibold">Trigger: Airtable — Record Updated</p>
                      <p>- Base: Jacob Rodgers Content</p>
                      <p>- Table: Posts</p>
                      <p>- Filter: Status = &quot;Ready&quot;</p>
                      <p className="font-semibold mt-2">Action: Twitter / X — Create Tweet</p>
                      <p>- Tweet Text: Map to &quot;Content&quot; field</p>
                      <p>- (Optional) Shorten URLs: Yes</p>
                      <p className="font-semibold mt-2">Action 2: Airtable — Update Record</p>
                      <p>- Set Status to &quot;Posted&quot;</p>
                      <p>- Set X Post URL to the tweet URL from Step 2</p>
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold">
                      4
                    </span>
                    <h4 className="font-medium">
                      Set Up Engagement Tracking
                    </h4>
                  </div>
                  <div className="ml-8 text-sm text-slate-600 space-y-2">
                    <p>Create a scheduled Zap for engagement updates:</p>
                    <div className="bg-slate-50 rounded p-3 text-xs space-y-1">
                      <p className="font-semibold">Trigger: Schedule — Every Day</p>
                      <p className="font-semibold mt-2">Action: Webhooks — GET</p>
                      <p>- URL: X API endpoint for tweet metrics</p>
                      <p>- (Requires X API access for automated metrics)</p>
                      <p className="font-semibold mt-2">Action 2: Airtable — Update Record</p>
                      <p>- Update Likes, Retweets, Replies, Impressions</p>
                    </div>
                    <p className="text-xs text-slate-500 italic">
                      Note: Manual engagement tracking is also effective. Update numbers weekly from X Analytics.
                    </p>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold">
                      5
                    </span>
                    <h4 className="font-medium">Environment Variables</h4>
                  </div>
                  <div className="ml-8 text-sm text-slate-600 space-y-2">
                    <p>
                      Add these to your <code className="bg-slate-100 px-1 rounded">.env.local</code> file for API integration:
                    </p>
                    <div className="bg-slate-900 text-green-400 rounded p-3 font-mono text-xs space-y-1">
                      <p># Airtable Configuration</p>
                      <p>AIRTABLE_API_KEY=pat_xxxxxxxxxxxxx</p>
                      <p>AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX</p>
                      <p>AIRTABLE_POSTS_TABLE_ID=Posts</p>
                      <p>AIRTABLE_DMS_TABLE_ID=DMs</p>
                      <p>AIRTABLE_COACHES_TABLE_ID=Coaches</p>
                      <p>&nbsp;</p>
                      <p># Zapier Webhooks</p>
                      <p>ZAPIER_POST_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/xxxxx/xxxxx/</p>
                      <p>ZAPIER_DM_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/xxxxx/xxxxx/</p>
                      <p>ZAPIER_SLACK_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/xxxxx/xxxxx/</p>
                    </div>
                    <p className="text-xs text-slate-500">
                      Get your Airtable API key from{" "}
                      <span className="font-medium">airtable.com/create/tokens</span>.
                      Base ID is in the Airtable URL when viewing your base.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Tab 5: Performance ─────────────────────────────── */}
        <TabsContent value="performance">
          <div className="space-y-6">
            {/* Weekly Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {MOCK_PERFORMANCE.reduce((a, p) => a + p.impressions, 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Total Impressions</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {MOCK_PERFORMANCE.reduce((a, p) => a + p.likes, 0)}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Total Likes</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {MOCK_PERFORMANCE.reduce((a, p) => a + p.retweets, 0)}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Total Retweets</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {(
                      (MOCK_PERFORMANCE.reduce((a, p) => a + p.likes + p.retweets + p.replies, 0) /
                        MOCK_PERFORMANCE.reduce((a, p) => a + p.impressions, 0)) *
                      100
                    ).toFixed(1)}
                    %
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Avg Engagement Rate</p>
                </CardContent>
              </Card>
            </div>

            {/* Performance Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Post Performance</CardTitle>
                <CardDescription>
                  Engagement metrics for posted content (sample data — connect Airtable for live tracking)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Post</TableHead>
                      <TableHead>Content Preview</TableHead>
                      <TableHead className="text-right">Likes</TableHead>
                      <TableHead className="text-right">Retweets</TableHead>
                      <TableHead className="text-right">Replies</TableHead>
                      <TableHead className="text-right">Impressions</TableHead>
                      <TableHead className="text-right">Eng. Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_PERFORMANCE.map((perf) => {
                      const post = posts.find((p) => p.id === perf.id);
                      const engRate =
                        perf.impressions > 0
                          ? (
                              ((perf.likes + perf.retweets + perf.replies) /
                                perf.impressions) *
                              100
                            ).toFixed(1)
                          : "0.0";
                      return (
                        <TableRow key={perf.id}>
                          <TableCell className="font-medium">
                            {perf.id}
                          </TableCell>
                          <TableCell className="max-w-xs truncate text-sm text-slate-600">
                            {post
                              ? post.content.substring(0, 60) + "..."
                              : "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            {perf.likes}
                          </TableCell>
                          <TableCell className="text-right">
                            {perf.retweets}
                          </TableCell>
                          <TableCell className="text-right">
                            {perf.replies}
                          </TableCell>
                          <TableCell className="text-right">
                            {perf.impressions.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            {engRate}%
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Pillar Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance by Pillar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {(["performance", "work_ethic", "character"] as const).map(
                    (pillar) => {
                      const pillarPosts = posts.filter(
                        (p) => p.pillar === pillar
                      );
                      return (
                        <div
                          key={pillar}
                          className="border rounded-lg p-4 text-center"
                        >
                          <Badge variant={getPillarVariant(pillar)} className="mb-2">
                            {pillar.replace("_", " ")}
                          </Badge>
                          <p className="text-2xl font-bold">
                            {pillarPosts.length}
                          </p>
                          <p className="text-xs text-slate-500">
                            posts scheduled
                          </p>
                        </div>
                      );
                    }
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
