export interface CoachEngagementInput {
  isFollowed: boolean;
  isFollowedBack: boolean;
  dmSent: boolean;
  dmReplied: boolean;
  lastInteractionDays: number | null;
  interactionCount: number;
}

export interface CoachEngagement {
  score: number;
  level: 0 | 1 | 2 | 3 | 4 | 5;
  levelLabel: string;
  levelColor: string;
  isHot: boolean;
  isCold: boolean;
  needsAttention: boolean;
}

interface LevelConfig {
  label: string;
  color: string;
}

const LEVELS: Record<0 | 1 | 2 | 3 | 4 | 5, LevelConfig> = {
  0: { label: "Unknown", color: "#3F3F46" },
  1: { label: "Aware", color: "#A1A1AA" },
  2: { label: "Noticed", color: "#FFFFFF" },
  3: { label: "Engaged", color: "#D4A853" },
  4: { label: "Interested", color: "#F59E0B" },
  5: { label: "Recruiting", color: "#ff000c" },
};

function getLevel(score: number): 0 | 1 | 2 | 3 | 4 | 5 {
  if (score >= 85) return 5;
  if (score >= 65) return 4;
  if (score >= 45) return 3;
  if (score >= 25) return 2;
  if (score >= 10) return 1;
  return 0;
}

export function calculateEngagement(
  input: CoachEngagementInput
): CoachEngagement {
  let score = 0;

  if (input.isFollowed) score += 10;
  if (input.isFollowedBack) score += 20;
  if (input.dmSent) score += 15;
  if (input.dmReplied) score += 25;

  const interactionBonus = Math.min(input.interactionCount * 5, 20);
  score += interactionBonus;

  if (input.lastInteractionDays !== null) {
    if (input.lastInteractionDays < 7) {
      score += 10;
    } else if (input.lastInteractionDays < 14) {
      score += 5;
    } else if (input.lastInteractionDays >= 30) {
      score -= 10;
    }
  }

  score = Math.min(100, Math.max(0, score));

  const level = getLevel(score);
  const config = LEVELS[level];

  const isHot =
    input.lastInteractionDays !== null && input.lastInteractionDays < 7;
  const isCold =
    input.lastInteractionDays !== null && input.lastInteractionDays >= 30;
  const needsAttention =
    input.lastInteractionDays !== null &&
    input.lastInteractionDays >= 14 &&
    input.lastInteractionDays < 30;

  return {
    score,
    level,
    levelLabel: config.label,
    levelColor: config.color,
    isHot,
    isCold,
    needsAttention,
  };
}
