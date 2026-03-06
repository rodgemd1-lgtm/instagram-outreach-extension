"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Heart, MessageCircle, Repeat2, TrendingUp, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeedItem {
  id: string;
  type: "follow" | "like" | "reply" | "mention" | "trend" | "alert";
  title: string;
  description: string;
  timestamp: string;
  isCoach: boolean;
  schoolName?: string;
}

const sampleFeed: FeedItem[] = [
  {
    id: "1",
    type: "alert",
    title: "Profile Setup Required",
    description: "Jacob's X profile is not yet configured. Complete Phase 03 — Build to go live.",
    timestamp: "Just now",
    isCoach: false,
  },
  {
    id: "2",
    type: "trend",
    title: "#2029Recruit trending",
    description: "The hashtag #2029Recruit has seen a 15% increase in engagement this week. Ideal time to post film content.",
    timestamp: "Today",
    isCoach: false,
  },
  {
    id: "3",
    type: "alert",
    title: "DM Wave 0 Ready",
    description: "5 Tier 3 D2/GLIAC coaches are ready for introductory DMs. Review and approve in DM Campaigns.",
    timestamp: "Today",
    isCoach: true,
    schoolName: "Multiple D2 Programs",
  },
];

const iconMap = {
  follow: UserPlus,
  like: Heart,
  reply: MessageCircle,
  mention: Repeat2,
  trend: TrendingUp,
  alert: AlertCircle,
};

const colorMap = {
  follow: "text-green-600 bg-green-50",
  like: "text-red-500 bg-red-50",
  reply: "text-blue-600 bg-blue-50",
  mention: "text-purple-600 bg-purple-50",
  trend: "text-orange-600 bg-orange-50",
  alert: "text-yellow-600 bg-yellow-50",
};

export function RecruitingFeed() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recruiting Intelligence Feed</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sampleFeed.map((item) => {
            const Icon = iconMap[item.type];
            return (
              <div key={item.id} className="flex gap-3 pb-4 border-b last:border-b-0 last:pb-0">
                <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", colorMap[item.type])}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{item.title}</p>
                    {item.isCoach && <Badge variant="tier1" className="text-[10px]">Coach</Badge>}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{item.timestamp}</p>
                </div>
              </div>
            );
          })}

          {sampleFeed.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-4">
              No new intelligence. Feed updates when account is live.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
