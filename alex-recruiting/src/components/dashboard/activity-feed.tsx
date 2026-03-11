import { FileText, Mail, UserPlus, TrendingUp } from "lucide-react";

type ActivityType = "post" | "dm" | "follow" | "engagement";

interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  timestamp: string;
}

interface ActivityFeedProps {
  activities: Activity[];
}

const iconMap: Record<ActivityType, typeof FileText> = {
  post: FileText,
  dm: Mail,
  follow: UserPlus,
  engagement: TrendingUp,
};

function timeAgo(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;

  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="rounded-xl border border-dash-border bg-dash-surface">
      <div className="border-b border-dash-border px-5 py-4">
        <h3 className="text-sm font-semibold text-dash-text">
          Recent Activity
        </h3>
      </div>
      {activities.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <p className="text-sm text-dash-muted">No recent activity yet.</p>
        </div>
      ) : (
        <div className="divide-y divide-dash-border-subtle">
          {activities.map((activity) => {
            const Icon = iconMap[activity.type];
            return (
              <div
                key={activity.id}
                className="flex items-center gap-3 px-5 py-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-dash-surface-raised">
                  <Icon className="h-4 w-4 text-dash-muted" />
                </div>
                <p className="min-w-0 flex-1 truncate text-sm text-dash-text">
                  {activity.description}
                </p>
                <span className="shrink-0 text-xs text-dash-muted">
                  {timeAgo(activity.timestamp)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
