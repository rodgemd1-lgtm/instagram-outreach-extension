"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlexChat } from "@/components/alex-chat";
import { RecruitingFeed } from "@/components/recruiting-feed";
import { getTodayEntry, weeklyCalendar } from "@/lib/data/weekly-calendar";
import { getPillarLabel, getPillarColor, cn } from "@/lib/utils";
import type { WeeklyCalendarEntry } from "@/lib/types";
import {
  Calendar,
  Flame,
  ArrowUp,
  PenSquare,
  Mail,
  Palette,
  Users,
  ShieldCheck,
  Brain,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Heart,
  UserPlus,
  MessageCircle,
  Star,
  Target,
} from "lucide-react";

/* ─── Constitution Reminders ─── */
const constitutionReminders = [
  "Every post must reflect one of three pillars: On-Field Performance, Work Ethic, or Character.",
  "Never post anything you wouldn&apos;t want a head coach to screenshot and discuss in a staff meeting.",
  "Consistency beats virality. Show up every day with quality content.",
  "Engage before you ask. Like and comment on coaches&apos; posts before sending DMs.",
  "Your profile is your digital handshake. Keep it clean, current, and recruiting-ready.",
];

/* ─── Feed Items ─── */
interface DashboardFeedItem {
  id: string;
  icon: "heart" | "user-plus" | "pen" | "message" | "star";
  text: string;
  time: string;
}

const feedItems: DashboardFeedItem[] = [
  { id: "f1", icon: "heart", text: "Coach Mike Thompson (Ball State) liked your last post", time: "2h ago" },
  { id: "f2", icon: "user-plus", text: "New follower: @CoachJennings_WIU", time: "5h ago" },
  { id: "f3", icon: "pen", text: "Jacob posted: Training highlight #OLGrind", time: "1d ago" },
  { id: "f4", icon: "message", text: "DM response from Ashland OL Coach", time: "2d ago" },
  { id: "f5", icon: "star", text: "Profile audit score improved: 4 → 6", time: "3d ago" },
];

const feedIconMap = {
  heart: Heart,
  "user-plus": UserPlus,
  pen: PenSquare,
  message: MessageCircle,
  star: Star,
};

const feedColorMap = {
  heart: "text-red-500 bg-red-50",
  "user-plus": "text-green-600 bg-green-50",
  pen: "text-blue-600 bg-blue-50",
  message: "text-purple-600 bg-purple-50",
  star: "text-yellow-600 bg-yellow-50",
};

/* ─── Quick Action definition ─── */
interface QuickAction {
  label: string;
  description: string;
  href: string;
  icon: typeof PenSquare;
  color: string;
}

const quickActions: QuickAction[] = [
  { label: "Create Post", description: "Draft new content", href: "/create", icon: PenSquare, color: "text-blue-600 bg-blue-50" },
  { label: "DM a Coach", description: "Send outreach", href: "/dms", icon: Mail, color: "text-purple-600 bg-purple-50" },
  { label: "Profile Studio", description: "Optimize profile", href: "/profile-studio", icon: Palette, color: "text-pink-600 bg-pink-50" },
  { label: "Coach Pipeline", description: "Track coaches", href: "/coaches", icon: Users, color: "text-green-600 bg-green-50" },
  { label: "Run Audit", description: "Score your profile", href: "/audit", icon: ShieldCheck, color: "text-orange-600 bg-orange-50" },
  { label: "Intelligence", description: "Competitor intel", href: "/intelligence", icon: Brain, color: "text-teal-600 bg-teal-50" },
];

/* ─── Helpers ─── */
function getNext3Days(): { label: string; entry: WeeklyCalendarEntry; isToday: boolean }[] {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const todayIdx = new Date().getDay();
  const results: { label: string; entry: WeeklyCalendarEntry; isToday: boolean }[] = [];

  for (let offset = 0; offset < 3; offset++) {
    const idx = (todayIdx + offset) % 7;
    const dayName = days[idx];
    const entry = weeklyCalendar.find((e) => e.day === dayName) || weeklyCalendar[0];
    const label = offset === 0 ? "Today" : offset === 1 ? "Tomorrow" : days[idx];
    results.push({ label, entry, isToday: offset === 0 });
  }
  return results;
}

function getFormattedDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/* ─── Circular Progress Component ─── */
function CircularProgress({ current, total, size = 40 }: { current: number; total: number; size?: number }) {
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(current / total, 1);
  const dashOffset = circumference * (1 - progress);

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={3} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#3b82f6"
        strokeWidth={3}
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ─── Calendar Status Badges ─── */
const calendarStatuses: Record<string, { label: string; variant: "draft" | "approved" | "posted" }> = {
  Today: { label: "Drafted", variant: "draft" },
  Tomorrow: { label: "Scheduled", variant: "approved" },
};

/* ─── Main Component ─── */
export default function DashboardPage() {
  const today = getTodayEntry();
  const [chatOpen, setChatOpen] = useState(false);

  const formattedDate = getFormattedDate();
  const calendarDays = getNext3Days();
  const reminderIndex = new Date().getDay() % constitutionReminders.length;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* ═══ ROW 1: Daily Briefing ═══ */}
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 via-white to-slate-50">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{formattedDate}</p>
              <CardTitle className="text-lg sm:text-xl mt-1">Daily Briefing</CardTitle>
            </div>
            <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-1.5">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-bold text-orange-700">12-day streak</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Today's Mission */}
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Today&apos;s Mission</h4>
              <div className="flex items-center gap-2 mb-1.5">
                <div className={cn("h-2.5 w-2.5 rounded-full", getPillarColor(today.pillar))} />
                <Badge variant={today.pillar as "performance" | "work_ethic" | "character"}>
                  {getPillarLabel(today.pillar)}
                </Badge>
              </div>
              <p className="text-sm text-slate-700">{today.contentType}</p>
              <p className="text-xs text-slate-500 mt-1">Best posting time: {today.bestTime}</p>
            </div>

            {/* Priority Actions */}
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Priority Actions</h4>
              <ul className="space-y-1.5">
                <li className="flex items-start gap-2">
                  <Target className="h-3.5 w-3.5 text-blue-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-700">Post training video by {today.bestTime.split("-")[0] || "6:30 PM"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Heart className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-700">Like Coach Thompson&apos;s latest post</span>
                </li>
                <li className="flex items-start gap-2">
                  <Mail className="h-3.5 w-3.5 text-purple-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-700">Draft DM for Ball State OL coach</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Constitution Reminder */}
          <div className="mt-4 pt-3 border-t border-blue-100">
            <p className="text-xs text-slate-500">
              <span className="font-semibold text-slate-600">Constitution Reminder:</span>{" "}
              {constitutionReminders[reminderIndex].replace(/&apos;/g, "'")}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ═══ ROW 2: Metric Cards ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Followers */}
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">Followers</p>
            <div className="flex items-end justify-between mt-1">
              <p className="text-2xl font-bold text-slate-900">47</p>
              <div className="flex items-center gap-0.5 text-green-600">
                <ArrowUp className="h-3.5 w-3.5" />
                <span className="text-xs font-semibold">12 this week</span>
              </div>
            </div>
            <div className="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: "47%" }} />
            </div>
          </CardContent>
        </Card>

        {/* Coach Follows */}
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">Coach Follows</p>
            <div className="flex items-end justify-between mt-1">
              <p className="text-2xl font-bold text-slate-900">3</p>
              <span className="text-xs text-slate-400">target: 15</span>
            </div>
            <div className="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: "20%" }} />
            </div>
          </CardContent>
        </Card>

        {/* Posts This Week */}
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">Posts This Week</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-2xl font-bold text-slate-900">4/5</p>
              <CircularProgress current={4} total={5} size={36} />
            </div>
            <p className="text-xs text-slate-400 mt-1">1 post remaining</p>
          </CardContent>
        </Card>

        {/* Engagement Rate */}
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">Engagement Rate</p>
            <div className="flex items-end justify-between mt-1">
              <p className="text-2xl font-bold text-slate-900">6.2%</p>
              <div className="flex items-center gap-0.5 text-green-600">
                <ArrowUp className="h-3.5 w-3.5" />
                <span className="text-xs font-semibold">1.1%</span>
              </div>
            </div>
            <div className="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: "62%" }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ═══ ROW 3: Quick Actions + Calendar ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Quick Actions Grid */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.label} href={action.href}>
                    <div className="group flex flex-col items-center gap-2 rounded-lg border border-slate-100 p-3 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer text-center">
                      <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", action.color)}>
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-800 group-hover:text-slate-900">{action.label}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{action.description}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Content Calendar Preview */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Content Calendar
              </CardTitle>
              <Link href="/calendar" className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-0.5">
                View Full Calendar <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {calendarDays.map(({ label, entry, isToday }) => {
                const status = calendarStatuses[label] || { label: "Pending", variant: "draft" as const };
                return (
                  <div
                    key={label}
                    className={cn(
                      "flex items-start gap-3 rounded-lg p-2.5 transition-colors",
                      isToday ? "bg-blue-50 border border-blue-100" : "hover:bg-slate-50"
                    )}
                  >
                    <div className={cn("h-2.5 w-2.5 rounded-full mt-1.5 shrink-0", getPillarColor(entry.pillar))} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={cn("text-xs font-semibold", isToday ? "text-blue-700" : "text-slate-700")}>
                          {label}
                        </p>
                        <Badge variant={status.variant} className="text-[10px]">
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 truncate">{entry.contentType}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Best time: {entry.bestTime}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ═══ ROW 4: Alex Chat (Collapsible) ═══ */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Alex Chat
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setChatOpen(!chatOpen)} className="h-7 px-2">
              {chatOpen ? (
                <span className="flex items-center gap-1 text-xs">
                  Collapse <ChevronUp className="h-3 w-3" />
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs">
                  Open Chat <ChevronDown className="h-3 w-3" />
                </span>
              )}
            </Button>
          </div>
        </CardHeader>
        {!chatOpen && (
          <CardContent className="pt-0 pb-4">
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-3 border border-slate-100">
              <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <MessageSquare className="h-3 w-3 text-blue-600" />
              </div>
              <p className="text-xs text-slate-600 truncate">
                Ask me anything about your recruiting strategy, content ideas, or coach outreach.
              </p>
            </div>
          </CardContent>
        )}
        {chatOpen && (
          <CardContent className="pt-0">
            <AlexChat />
          </CardContent>
        )}
      </Card>

      {/* ═══ ROW 5: Activity Feed + Recruiting Feed ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {feedItems.map((item) => {
                const Icon = feedIconMap[item.icon];
                return (
                  <div key={item.id} className="flex gap-3 pb-3 border-b last:border-b-0 last:pb-0">
                    <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", feedColorMap[item.icon])}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-700">{item.text}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{item.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recruiting Intelligence Feed */}
        <RecruitingFeed />
      </div>
    </div>
  );
}
