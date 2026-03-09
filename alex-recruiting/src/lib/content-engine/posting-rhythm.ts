export const RECOMMENDED_POST_WINDOWS = [
  {
    weekday: 1,
    pillar: "work_ethic",
    label: "Monday training / strength post",
    bestTime: "7:30 PM CT",
    categories: ["training", "strength"],
  },
  {
    weekday: 3,
    pillar: "performance",
    label: "Wednesday film / game clip",
    bestTime: "7:30 PM CT",
    categories: ["game", "highlight", "film"],
  },
  {
    weekday: 5,
    pillar: "character",
    label: "Friday team / character post",
    bestTime: "7:30 PM CT",
    categories: ["team", "personal", "camp", "community"],
  },
] as const;

export type RecommendedPostWindow = (typeof RECOMMENDED_POST_WINDOWS)[number];
