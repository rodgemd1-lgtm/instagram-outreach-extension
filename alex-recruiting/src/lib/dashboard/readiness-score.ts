export interface ReadinessInput {
  totalCoaches: number;
  coachesContacted: number;
  coachesReplied: number;
  postsThisWeek: number;
  postsTarget: number;
  profileViews: number;
  filmViewCount: number;
  daysOnPlatform: number;
}

export interface ReadinessScore {
  overall: number;
  outreach: number;
  content: number;
  visibility: number;
  network: number;
  grade: "S" | "A" | "B" | "C" | "D" | "F";
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getGrade(score: number): ReadinessScore["grade"] {
  if (score >= 90) return "S";
  if (score >= 75) return "A";
  if (score >= 60) return "B";
  if (score >= 40) return "C";
  if (score >= 20) return "D";
  return "F";
}

export function calculateReadinessScore(input: ReadinessInput): ReadinessScore {
  const outreach = clamp(
    (input.coachesContacted / Math.max(input.totalCoaches * 0.3, 1)) * 100,
    0,
    100
  );

  const content = clamp(
    (input.postsThisWeek / Math.max(input.postsTarget, 1)) * 100,
    0,
    100
  );

  const visibilityProfile = (input.profileViews / 50) * 50;
  const visibilityFilm = (input.filmViewCount / 200) * 50;
  const visibility = clamp(visibilityProfile + visibilityFilm, 0, 100);

  const network = clamp(
    (input.coachesReplied / Math.max(input.coachesContacted, 1)) * 100,
    0,
    100
  );

  const overall =
    outreach * 0.3 + content * 0.25 + visibility * 0.25 + network * 0.2;

  return {
    overall: Math.round(overall * 100) / 100,
    outreach: Math.round(outreach * 100) / 100,
    content: Math.round(content * 100) / 100,
    visibility: Math.round(visibility * 100) / 100,
    network: Math.round(network * 100) / 100,
    grade: getGrade(overall),
  };
}
