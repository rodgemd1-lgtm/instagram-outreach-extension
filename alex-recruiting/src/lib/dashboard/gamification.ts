export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface StreakInfo {
  type: "posting" | "outreach" | "activity";
  currentStreak: number;
  longestStreak: number;
  isActive: boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-follow",
    title: "First Contact",
    description: "Followed your first coach",
    icon: "\uD83C\uDFAF",
    unlocked: false,
  },
  {
    id: "first-dm",
    title: "Opening Salvo",
    description: "Sent your first DM",
    icon: "\uD83D\uDCAC",
    unlocked: false,
  },
  {
    id: "first-reply",
    title: "Two-Way Street",
    description: "Got your first DM reply",
    icon: "\uD83E\uDD1D",
    unlocked: false,
  },
  {
    id: "first-followback",
    title: "On Their Radar",
    description: "A coach followed you back",
    icon: "\uD83D\uDC40",
    unlocked: false,
  },
  {
    id: "content-7",
    title: "Content Machine",
    description: "7-day posting streak",
    icon: "\uD83D\uDD25",
    unlocked: false,
  },
  {
    id: "content-30",
    title: "Content Legend",
    description: "30-day posting streak",
    icon: "\u26A1",
    unlocked: false,
  },
  {
    id: "outreach-10",
    title: "Casting the Net",
    description: "DMed 10 coaches",
    icon: "\uD83C\uDFA3",
    unlocked: false,
  },
  {
    id: "outreach-50",
    title: "Full Court Press",
    description: "DMed 50 coaches",
    icon: "\uD83C\uDFC8",
    unlocked: false,
  },
  {
    id: "network-25",
    title: "Building the Network",
    description: "25 coaches in database",
    icon: "\uD83D\uDD78\uFE0F",
    unlocked: false,
  },
  {
    id: "network-100",
    title: "Connected",
    description: "100 coaches in database",
    icon: "\uD83C\uDF10",
    unlocked: false,
  },
  {
    id: "reply-rate-25",
    title: "Getting Noticed",
    description: "25% DM reply rate",
    icon: "\uD83D\uDCC8",
    unlocked: false,
  },
  {
    id: "camp-ready",
    title: "Camp Season",
    description: "First camp registered",
    icon: "\u26FA",
    unlocked: false,
  },
];

export interface AchievementStats {
  coachesFollowed: number;
  dmsSent: number;
  dmsReplied: number;
  followBacks: number;
  postingStreak: number;
  totalCoaches: number;
}

export function checkAchievements(stats: AchievementStats): Achievement[] {
  const now = new Date().toISOString();

  return ACHIEVEMENTS.map((achievement) => {
    let unlocked = false;

    switch (achievement.id) {
      case "first-follow":
        unlocked = stats.coachesFollowed >= 1;
        break;
      case "first-dm":
        unlocked = stats.dmsSent >= 1;
        break;
      case "first-reply":
        unlocked = stats.dmsReplied >= 1;
        break;
      case "first-followback":
        unlocked = stats.followBacks >= 1;
        break;
      case "content-7":
        unlocked = stats.postingStreak >= 7;
        break;
      case "content-30":
        unlocked = stats.postingStreak >= 30;
        break;
      case "outreach-10":
        unlocked = stats.dmsSent >= 10;
        break;
      case "outreach-50":
        unlocked = stats.dmsSent >= 50;
        break;
      case "network-25":
        unlocked = stats.totalCoaches >= 25;
        break;
      case "network-100":
        unlocked = stats.totalCoaches >= 100;
        break;
      case "reply-rate-25":
        unlocked =
          stats.dmsSent > 0 && stats.dmsReplied / stats.dmsSent >= 0.25;
        break;
      case "camp-ready":
        // This achievement is unlocked externally; cannot be derived from these stats
        unlocked = false;
        break;
    }

    return {
      ...achievement,
      unlocked,
      ...(unlocked ? { unlockedAt: now } : {}),
    };
  });
}

export function calculateStreak(dates: string[]): number {
  if (dates.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const uniqueDays = new Set(
    dates.map((d) => {
      const date = new Date(d);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    })
  );

  const sortedDays = Array.from(uniqueDays).sort((a, b) => b - a);

  const MS_PER_DAY = 86400000;
  const todayTime = today.getTime();
  const yesterdayTime = todayTime - MS_PER_DAY;

  // Streak must include today or yesterday to be current
  if (sortedDays[0] !== todayTime && sortedDays[0] !== yesterdayTime) {
    return 0;
  }

  let streak = 1;
  for (let i = 1; i < sortedDays.length; i++) {
    const diff = sortedDays[i - 1] - sortedDays[i];
    if (diff === MS_PER_DAY) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
