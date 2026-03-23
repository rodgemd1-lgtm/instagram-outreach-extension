"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  SCPageHeader,
  SCGlassCard,
  SCStatCard,
  SCBadge,
  SCButton,
  SCTabs,
} from "@/components/sc";
import {
  generatePostSchedule,
  exportToCSV,
  exportToJSON,
  getScheduleSummary,
  type AirtablePostRecord,
} from "@/lib/data/airtable-export";

// ─── Helpers ────────────────────────────────────────────────────────────────

function getStatusVariant(status: AirtablePostRecord["status"]): "default" | "info" | "primary" | "success" | "warning" {
  switch (status) {
    case "Draft": return "default";
    case "Ready": return "info";
    case "Scheduled": return "primary";
    case "Posted": return "success";
    case "Skipped": return "warning";
    default: return "default";
  }
}

function getPillarVariant(pillar: string): "info" | "warning" | "success" {
  if (pillar === "performance") return "info";
  if (pillar === "work_ethic") return "warning";
  return "success";
}

function getMediaIcon(mediaType: string): string {
  switch (mediaType) {
    case "video": return "videocam";
    case "photo": return "photo_camera";
    case "carousel": return "view_carousel";
    case "text": return "article";
    default: return "description";
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

// ─── Performance Data ────────────────────────────────────────────────────────

const MOCK_PERFORMANCE: { id: string; likes: number; retweets: number; replies: number; impressions: number }[] = [];

// ─── Tab Content Components ─────────────────────────────────────────────────

function ScheduleTab({
  posts,
  summary,
  postsByWeek,
  expandedPost,
  setExpandedPost,
  copiedId,
  handleCopyContent,
  handleMarkReady,
}: {
  posts: AirtablePostRecord[];
  summary: ReturnType<typeof getScheduleSummary>;
  postsByWeek: Map<number, AirtablePostRecord[]>;
  expandedPost: string | null;
  setExpandedPost: (id: string | null) => void;
  copiedId: string | null;
  handleCopyContent: (post: AirtablePostRecord) => void;
  handleMarkReady: (id: string) => void;
}) {
  return (
    <div className="space-y-6">
      <SCGlassCard className="p-5">
        <h3 className="text-sm font-bold text-white mb-3">Content Distribution</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <SCBadge variant="info">Performance</SCBadge>
            <span className="text-sm font-medium text-slate-300">{summary.byPillar.performance} posts</span>
          </div>
          <div className="flex items-center gap-2">
            <SCBadge variant="warning">Work Ethic</SCBadge>
            <span className="text-sm font-medium text-slate-300">{summary.byPillar.work_ethic} posts</span>
          </div>
          <div className="flex items-center gap-2">
            <SCBadge variant="success">Character</SCBadge>
            <span className="text-sm font-medium text-slate-300">{summary.byPillar.character} posts</span>
          </div>
          <div className="ml-auto flex flex-wrap gap-3 text-sm text-slate-500">
            {Object.entries(summary.byMedia).map(([type, count]) => (
              <span key={type} className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">{getMediaIcon(type)}</span>
                {type}: {count}
              </span>
            ))}
          </div>
        </div>
      </SCGlassCard>

      {Array.from(postsByWeek.entries()).map(([weekNum, weekPosts]) => (
        <SCGlassCard key={weekNum} className="p-5">
          <h3 className="text-sm font-bold text-white mb-4">
            Week {weekNum}
            <span className="text-xs font-normal text-slate-500 ml-2">
              {weekPosts.length > 0 &&
                `${formatDateDisplay(weekPosts[0].postDate)} — ${formatDateDisplay(weekPosts[weekPosts.length - 1].postDate)}`}
            </span>
          </h3>
          <div className="space-y-2">
            {weekPosts.map((post) => (
              <div
                key={post.id}
                className={`rounded-lg border p-3 transition-colors ${
                  isToday(post.postDate)
                    ? "border-sc-primary/30 bg-sc-primary/5"
                    : "border-sc-border bg-white/5 hover:bg-white/[0.08]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-sm font-medium w-24 text-slate-400 flex-shrink-0">
                      {formatDateDisplay(post.postDate)}
                    </span>
                    <span className="text-xs text-slate-500 w-20 flex-shrink-0">
                      {post.postTime}
                    </span>
                    <SCBadge variant={getPillarVariant(post.pillar)}>
                      {post.pillar.replace("_", " ")}
                    </SCBadge>
                    <span className="material-symbols-outlined text-[16px] text-slate-400 flex-shrink-0">
                      {getMediaIcon(post.mediaType)}
                    </span>
                    <span className="text-sm text-slate-300 truncate">
                      {post.content.substring(0, 80)}
                      {post.content.length > 80 ? "..." : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <SCBadge variant={getStatusVariant(post.status)}>{post.status}</SCBadge>
                    {post.status === "Draft" && (
                      <SCButton variant="secondary" size="sm" onClick={() => handleMarkReady(post.id)}>
                        Mark Ready
                      </SCButton>
                    )}
                    <SCButton
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {expandedPost === post.id ? "expand_less" : "expand_more"}
                      </span>
                    </SCButton>
                  </div>
                </div>

                {expandedPost === post.id && (
                  <div className="mt-3 pt-3 border-t border-sc-border">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Full Content</p>
                        <p className="text-sm whitespace-pre-wrap rounded-lg bg-white/5 border border-sc-border p-3 text-slate-300">
                          {post.content}
                        </p>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Hashtags</p>
                          <p className="text-sm text-sc-primary">{post.hashtags}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Media Notes</p>
                          <p className="text-sm text-slate-400">{post.mediaDescription}</p>
                        </div>
                        <SCButton variant="secondary" size="sm" onClick={() => handleCopyContent(post)}>
                          <span className="material-symbols-outlined text-[14px]">
                            {copiedId === post.id ? "check" : "content_copy"}
                          </span>
                          {copiedId === post.id ? "Copied!" : "Copy to Clipboard"}
                        </SCButton>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </SCGlassCard>
      ))}
    </div>
  );
}

function ThisWeekTab({
  todayPost,
  thisWeekPosts,
  summary,
  copiedId,
  handleCopyContent,
  handleMarkReady,
  handleMarkPosted,
}: {
  todayPost: AirtablePostRecord | undefined;
  thisWeekPosts: AirtablePostRecord[];
  summary: ReturnType<typeof getScheduleSummary>;
  copiedId: string | null;
  handleCopyContent: (post: AirtablePostRecord) => void;
  handleMarkReady: (id: string) => void;
  handleMarkPosted: (id: string) => void;
}) {
  return (
    <div className="space-y-6">
      {todayPost ? (
        <SCGlassCard variant="broadcast" className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-sc-primary">today</span>
                Today&apos;s Post
                <SCBadge variant={getPillarVariant(todayPost.pillar)}>
                  {todayPost.pillar.replace("_", " ")}
                </SCBadge>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Scheduled for {todayPost.postTime} — {todayPost.dayOfWeek}, {formatDateDisplay(todayPost.postDate)}
              </p>
            </div>
            <div className="flex gap-2">
              <SCButton variant="secondary" size="sm" onClick={() => handleCopyContent(todayPost)}>
                <span className="material-symbols-outlined text-[14px]">
                  {copiedId === todayPost.id ? "check" : "content_copy"}
                </span>
                {copiedId === todayPost.id ? "Copied!" : "Copy"}
              </SCButton>
              {todayPost.status !== "Posted" && (
                <SCButton variant="primary" size="sm" onClick={() => handleMarkPosted(todayPost.id)}>
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  Mark as Posted
                </SCButton>
              )}
            </div>
          </div>
          <div className="rounded-lg bg-white/5 border border-sc-border p-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">{todayPost.content}</p>
            <div className="mt-3 pt-3 border-t border-sc-border flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="material-symbols-outlined text-[14px]">{getMediaIcon(todayPost.mediaType)}</span>
                {todayPost.mediaType} — {todayPost.mediaDescription}
              </span>
              <SCBadge variant={getStatusVariant(todayPost.status)}>{todayPost.status}</SCBadge>
            </div>
          </div>
        </SCGlassCard>
      ) : (
        <SCGlassCard className="py-8 text-center">
          <span className="material-symbols-outlined text-[40px] text-white/10">event_busy</span>
          <p className="text-sm text-slate-500 mt-3">No post scheduled for today. Check the full schedule tab.</p>
        </SCGlassCard>
      )}

      <SCGlassCard className="p-5">
        <h3 className="text-sm font-bold text-white mb-1">This Week&apos;s Schedule</h3>
        <p className="text-xs text-slate-500 mb-4">
          {thisWeekPosts.length > 0
            ? `${thisWeekPosts.length} posts scheduled this week`
            : "No posts scheduled for this week in the current calendar."}
        </p>
        {thisWeekPosts.length > 0 ? (
          <div className="space-y-3">
            {thisWeekPosts.map((post) => (
              <div
                key={post.id}
                className={`rounded-lg border p-4 ${
                  isToday(post.postDate)
                    ? "border-sc-primary/30 bg-sc-primary/5"
                    : "border-sc-border bg-white/5"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-medium text-sm text-white">{post.dayOfWeek}</span>
                      <span className="text-xs text-slate-500">
                        {formatDateDisplay(post.postDate)} at {post.postTime}
                      </span>
                      <SCBadge variant={getPillarVariant(post.pillar)}>
                        {post.pillar.replace("_", " ")}
                      </SCBadge>
                      <span className="material-symbols-outlined text-[14px] text-slate-400">
                        {getMediaIcon(post.mediaType)}
                      </span>
                      <SCBadge variant={getStatusVariant(post.status)}>{post.status}</SCBadge>
                    </div>
                    <p className="text-sm text-slate-300 whitespace-pre-wrap">{post.content}</p>
                  </div>
                  <div className="flex flex-col gap-1 ml-4 flex-shrink-0">
                    <SCButton variant="secondary" size="sm" onClick={() => handleCopyContent(post)}>
                      {copiedId === post.id ? "Copied!" : "Copy"}
                    </SCButton>
                    {post.status === "Draft" && (
                      <SCButton variant="secondary" size="sm" onClick={() => handleMarkReady(post.id)}>
                        Mark Ready
                      </SCButton>
                    )}
                    {post.status === "Ready" && (
                      <SCButton variant="primary" size="sm" onClick={() => handleMarkPosted(post.id)}>
                        Posted
                      </SCButton>
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
      </SCGlassCard>
    </div>
  );
}

function ExportTab({
  posts,
  summary,
  handleExportCSV,
  handleExportJSON,
}: {
  posts: AirtablePostRecord[];
  summary: ReturnType<typeof getScheduleSummary>;
  handleExportCSV: () => void;
  handleExportJSON: () => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <SCGlassCard className="p-5 space-y-4">
        <h3 className="text-sm font-bold text-white">Export Data</h3>
        <p className="text-xs text-slate-500">Generate files ready to import into Airtable</p>

        <div className="rounded-lg border border-sc-border bg-white/5 p-4 space-y-3">
          <div>
            <h4 className="font-bold text-sm text-white">CSV Export</h4>
            <p className="text-xs text-slate-500 mt-1">
              All 30 posts formatted for Airtable CSV import. Includes dates, times, content, hashtags, and status fields.
            </p>
          </div>
          <SCButton variant="primary" size="md" className="w-full" onClick={handleExportCSV}>
            <span className="material-symbols-outlined text-[16px]">download</span>
            Export to Airtable CSV
          </SCButton>
        </div>

        <div className="rounded-lg border border-sc-border bg-white/5 p-4 space-y-3">
          <div>
            <h4 className="font-bold text-sm text-white">JSON Export</h4>
            <p className="text-xs text-slate-500 mt-1">
              Structured JSON with all post data. Use with Airtable API or custom integrations.
            </p>
          </div>
          <SCButton variant="secondary" size="md" className="w-full" onClick={handleExportJSON}>
            <span className="material-symbols-outlined text-[16px]">code</span>
            Export to JSON
          </SCButton>
        </div>

        <div className="rounded-lg border border-sc-border bg-white/5 p-4 space-y-3">
          <div>
            <h4 className="font-bold text-sm text-white">Sync with Airtable</h4>
            <p className="text-xs text-slate-500 mt-1">
              Push all records directly to Airtable via API. Requires API key configured in environment variables.
            </p>
          </div>
          <SCButton variant="ghost" size="md" className="w-full" disabled>
            <span className="material-symbols-outlined text-[16px]">sync</span>
            Sync with Airtable (Configure API Key)
          </SCButton>
        </div>
      </SCGlassCard>

      <SCGlassCard className="p-5">
        <h3 className="text-sm font-bold text-white mb-1">Export Summary</h3>
        <p className="text-xs text-slate-500 mb-4">What will be exported</p>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Total Posts", value: String(summary.totalPosts) },
              { label: "Weeks", value: String(summary.weeks) },
              { label: "Start Date", value: summary.startDate },
              { label: "End Date", value: summary.endDate },
            ].map((item) => (
              <div key={item.label} className="rounded-lg bg-white/5 border border-sc-border p-3">
                <p className="text-sm font-bold text-white">{item.value}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-sc-border pt-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Posts by Status</p>
            <div className="flex flex-wrap gap-2">
              {(["Draft", "Ready", "Scheduled", "Posted", "Skipped"] as const).map((status) => {
                const count = posts.filter((p) => p.status === status).length;
                if (count === 0) return null;
                return (
                  <SCBadge key={status} variant={getStatusVariant(status)}>
                    {status}: {count}
                  </SCBadge>
                );
              })}
            </div>
          </div>

          <div className="border-t border-sc-border pt-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Airtable Table Columns</p>
            <div className="flex flex-wrap gap-1">
              {[
                "Post ID", "Week", "Day", "Date", "Time", "Pillar", "Content",
                "Hashtags", "Media Type", "Status", "Constitution Check", "Notes",
                "X Post URL", "Likes", "Retweets", "Replies", "Impressions",
              ].map((col) => (
                <span
                  key={col}
                  className="inline-flex items-center rounded border border-sc-border px-1.5 py-0.5 text-[10px] text-slate-500"
                >
                  {col}
                </span>
              ))}
            </div>
          </div>
        </div>
      </SCGlassCard>
    </div>
  );
}

function SetupTab() {
  const steps = [
    {
      number: 1,
      title: "Create Airtable Base",
      content: (
        <div className="text-sm text-slate-400 space-y-2">
          <p>Create a new Airtable base with the following tables:</p>
          <div className="rounded-lg bg-sc-bg border border-sc-border p-3 font-mono text-xs space-y-1 text-slate-300">
            <p className="font-bold text-white">Table: Posts</p>
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
            <p>- Engagement: Likes, Retweets, Replies, Impressions (Number)</p>
          </div>
        </div>
      ),
    },
    {
      number: 2,
      title: "Import CSV",
      content: (
        <div className="text-sm text-slate-400 space-y-2">
          <p>Export the CSV from the Export tab, then import into Airtable:</p>
          <ol className="list-decimal list-inside space-y-1 text-xs text-slate-500">
            <li>Click &quot;Export to Airtable CSV&quot; in the Export tab</li>
            <li>In Airtable, go to your Posts table</li>
            <li>Click the &quot;+&quot; button to add a view, select &quot;Import CSV&quot;</li>
            <li>Upload the downloaded CSV file</li>
            <li>Map columns to your table fields</li>
            <li>All 30 posts will be imported with dates and content</li>
          </ol>
        </div>
      ),
    },
    {
      number: 3,
      title: "Create Zapier Zap: Airtable to X (Twitter)",
      content: (
        <div className="text-sm text-slate-400 space-y-2">
          <p>Create a Zap with this flow:</p>
          <div className="rounded-lg bg-sc-bg border border-sc-border p-3 text-xs space-y-1 text-slate-300">
            <p className="font-bold text-white">Trigger: Airtable — Record Updated</p>
            <p>- Base: Jacob Rodgers Content</p>
            <p>- Table: Posts</p>
            <p>- Filter: Status = &quot;Ready&quot;</p>
            <p className="font-bold text-white mt-2">Action: Twitter / X — Create Tweet</p>
            <p>- Tweet Text: Map to &quot;Content&quot; field</p>
            <p className="font-bold text-white mt-2">Action 2: Airtable — Update Record</p>
            <p>- Set Status to &quot;Posted&quot;</p>
            <p>- Set X Post URL to the tweet URL from Step 2</p>
          </div>
        </div>
      ),
    },
    {
      number: 4,
      title: "Set Up Engagement Tracking",
      content: (
        <div className="text-sm text-slate-400 space-y-2">
          <p>Create a scheduled Zap for engagement updates:</p>
          <div className="rounded-lg bg-sc-bg border border-sc-border p-3 text-xs space-y-1 text-slate-300">
            <p className="font-bold text-white">Trigger: Schedule — Every Day</p>
            <p className="font-bold text-white mt-2">Action: Webhooks — GET</p>
            <p>- URL: X API endpoint for tweet metrics</p>
            <p className="font-bold text-white mt-2">Action 2: Airtable — Update Record</p>
            <p>- Update Likes, Retweets, Replies, Impressions</p>
          </div>
          <p className="text-xs text-slate-600 italic">
            Note: Manual engagement tracking is also effective. Update numbers weekly from X Analytics.
          </p>
        </div>
      ),
    },
    {
      number: 5,
      title: "Environment Variables",
      content: (
        <div className="text-sm text-slate-400 space-y-2">
          <p>
            Add these to your <code className="rounded bg-white/10 px-1 text-slate-300">.env.local</code> file for API integration:
          </p>
          <div className="rounded-lg bg-sc-bg border border-sc-border p-3 font-mono text-xs space-y-1 text-emerald-400">
            <p className="text-slate-500"># Airtable Configuration</p>
            <p>AIRTABLE_API_KEY=pat_xxxxxxxxxxxxx</p>
            <p>AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX</p>
            <p>AIRTABLE_POSTS_TABLE_ID=Posts</p>
            <p>AIRTABLE_DMS_TABLE_ID=DMs</p>
            <p>AIRTABLE_COACHES_TABLE_ID=Coaches</p>
            <p>&nbsp;</p>
            <p className="text-slate-500"># Zapier Webhooks</p>
            <p>ZAPIER_POST_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/xxxxx/xxxxx/</p>
            <p>ZAPIER_DM_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/xxxxx/xxxxx/</p>
            <p>ZAPIER_SLACK_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/xxxxx/xxxxx/</p>
          </div>
          <p className="text-xs text-slate-600">
            Get your Airtable API key from airtable.com/create/tokens.
            Base ID is in the Airtable URL when viewing your base.
          </p>
        </div>
      ),
    },
  ];

  return (
    <SCGlassCard className="p-5">
      <h3 className="text-sm font-bold text-white mb-1">Airtable + Zapier Setup Guide</h3>
      <p className="text-xs text-slate-500 mb-6">
        Step-by-step instructions to automate Jacob&apos;s X content pipeline
      </p>
      <div className="space-y-4">
        {steps.map((step) => (
          <div key={step.number} className="rounded-lg border border-sc-border bg-white/5 p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-sc-primary text-white text-xs font-black">
                {step.number}
              </span>
              <h4 className="font-bold text-sm text-white">{step.title}</h4>
            </div>
            <div className="ml-8">{step.content}</div>
          </div>
        ))}
      </div>
    </SCGlassCard>
  );
}

function PerformanceTab({ posts }: { posts: AirtablePostRecord[] }) {
  const totalImpressions = MOCK_PERFORMANCE.reduce((a, p) => a + p.impressions, 0);
  const totalLikes = MOCK_PERFORMANCE.reduce((a, p) => a + p.likes, 0);
  const totalRetweets = MOCK_PERFORMANCE.reduce((a, p) => a + p.retweets, 0);
  const totalEngagements = MOCK_PERFORMANCE.reduce((a, p) => a + p.likes + p.retweets + p.replies, 0);
  const avgEngRate = totalImpressions > 0 ? ((totalEngagements / totalImpressions) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SCStatCard label="Total Impressions" value={totalImpressions.toLocaleString()} icon="visibility" />
        <SCStatCard label="Total Likes" value={String(totalLikes)} icon="favorite" />
        <SCStatCard label="Total Retweets" value={String(totalRetweets)} icon="repeat" />
        <SCStatCard label="Avg Engagement Rate" value={`${avgEngRate}%`} icon="trending_up" />
      </div>

      <SCGlassCard className="p-5">
        <h3 className="text-sm font-bold text-white mb-1">Post Performance</h3>
        <p className="text-xs text-slate-500 mb-4">
          Engagement metrics for posted content
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-sc-border">
                <th className="py-2 px-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Post</th>
                <th className="py-2 px-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Content Preview</th>
                <th className="py-2 px-3 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">Likes</th>
                <th className="py-2 px-3 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">Retweets</th>
                <th className="py-2 px-3 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">Replies</th>
                <th className="py-2 px-3 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">Impressions</th>
                <th className="py-2 px-3 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">Eng. Rate</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_PERFORMANCE.map((perf) => {
                const post = posts.find((p) => p.id === perf.id);
                const engRate =
                  perf.impressions > 0
                    ? (((perf.likes + perf.retweets + perf.replies) / perf.impressions) * 100).toFixed(1)
                    : "0.0";
                return (
                  <tr key={perf.id} className="border-b border-sc-border/50 hover:bg-white/5">
                    <td className="py-2 px-3 font-bold text-white">{perf.id}</td>
                    <td className="py-2 px-3 max-w-xs truncate text-slate-400">
                      {post ? post.content.substring(0, 60) + "..." : "—"}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-300">{perf.likes}</td>
                    <td className="py-2 px-3 text-right text-slate-300">{perf.retweets}</td>
                    <td className="py-2 px-3 text-right text-slate-300">{perf.replies}</td>
                    <td className="py-2 px-3 text-right text-slate-300">{perf.impressions.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right font-bold text-white">{engRate}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SCGlassCard>

      <SCGlassCard className="p-5">
        <h3 className="text-sm font-bold text-white mb-4">Performance by Pillar</h3>
        <div className="grid grid-cols-3 gap-4">
          {(["performance", "work_ethic", "character"] as const).map((pillar) => {
            const pillarPosts = posts.filter((p) => p.pillar === pillar);
            return (
              <div key={pillar} className="rounded-lg border border-sc-border bg-white/5 p-4 text-center">
                <SCBadge variant={getPillarVariant(pillar)}>
                  {pillar.replace("_", " ")}
                </SCBadge>
                <p className="text-2xl font-black text-white mt-2">{pillarPosts.length}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">posts scheduled</p>
              </div>
            );
          })}
        </div>
      </SCGlassCard>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

const TABS = [
  { label: "Schedule", value: "schedule" },
  { label: "This Week", value: "this-week" },
  { label: "Export", value: "export" },
  { label: "Setup Guide", value: "setup" },
  { label: "Performance", value: "performance" },
];

export default function ManagePage() {
  const [posts, setPosts] = useState<AirtablePostRecord[]>(() => generatePostSchedule());
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("schedule");

  const summary = useMemo(() => getScheduleSummary(posts), [posts]);
  const thisWeekPosts = useMemo(() => posts.filter((p) => isCurrentWeek(p.postDate)), [posts]);
  const todayPost = useMemo(() => posts.find((p) => isToday(p.postDate)), [posts]);

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
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, status: "Ready" as const } : p)));
  }, []);

  const handleMarkPosted = useCallback((postId: string) => {
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, status: "Posted" as const } : p)));
  }, []);

  const handleCopyContent = useCallback(async (post: AirtablePostRecord) => {
    try {
      await navigator.clipboard.writeText(post.content);
      setCopiedId(post.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
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
    <div className="space-y-6">
      <SCPageHeader
        kicker="Content Operations"
        title="MANAGE"
        subtitle="Airtable + Zapier content management for Jacob Rodgers' X account"
        actions={
          <div className="flex items-center gap-2">
            <SCBadge variant="default">{summary.totalPosts} Posts</SCBadge>
            <SCBadge variant="default">{summary.weeks} Weeks</SCBadge>
            <SCBadge variant="default">{summary.startDate} — {summary.endDate}</SCBadge>
          </div>
        }
      />

      <SCTabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "schedule" && (
        <ScheduleTab
          posts={posts}
          summary={summary}
          postsByWeek={postsByWeek}
          expandedPost={expandedPost}
          setExpandedPost={setExpandedPost}
          copiedId={copiedId}
          handleCopyContent={handleCopyContent}
          handleMarkReady={handleMarkReady}
        />
      )}

      {activeTab === "this-week" && (
        <ThisWeekTab
          todayPost={todayPost}
          thisWeekPosts={thisWeekPosts}
          summary={summary}
          copiedId={copiedId}
          handleCopyContent={handleCopyContent}
          handleMarkReady={handleMarkReady}
          handleMarkPosted={handleMarkPosted}
        />
      )}

      {activeTab === "export" && (
        <ExportTab
          posts={posts}
          summary={summary}
          handleExportCSV={handleExportCSV}
          handleExportJSON={handleExportJSON}
        />
      )}

      {activeTab === "setup" && <SetupTab />}

      {activeTab === "performance" && <PerformanceTab posts={posts} />}
    </div>
  );
}
