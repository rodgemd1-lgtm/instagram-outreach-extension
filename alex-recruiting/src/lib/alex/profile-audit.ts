import type { ProfileAudit, Post, Coach, DMMessage } from "../types";

interface AuditInput {
  hasProfilePhoto: boolean;
  hasHeaderImage: boolean;
  bioHasAllElements: boolean; // position, size, school, class year, GPA, NCSA link, film link
  hasPinnedPost: boolean;
  pinnedPostAge: number; // days since pinned post was updated
  postsLast30Days: Post[];
  coaches: Coach[];
  dmsLast30Days: DMMessage[];
  constitutionViolations: number;
}

export function runProfileAudit(input: AuditInput): ProfileAudit {
  const recommendations: string[] = [];
  let score = 0;

  // 1. Profile photo quality (1 point)
  const photoQuality = input.hasProfilePhoto;
  if (photoQuality) score++;
  else recommendations.push("Upload a professional athletic headshot — Pewaukee jersey or training gear, 400x400px minimum, clear face, confident posture");

  // 2. Header image (1 point)
  const headerImage = input.hasHeaderImage;
  if (headerImage) score++;
  else recommendations.push("Add an action shot header image — in-game block or IMG training photo, 1500x500px, with text overlay: name, position, class year, school");

  // 3. Bio completeness (1 point)
  const bioCompleteness = input.bioHasAllElements;
  if (bioCompleteness) score++;
  else recommendations.push("Complete your bio with all 7 elements: position, size, school, class year, GPA (if 3.0+), NCSA link, and film link");

  // 4. Pinned post (1 point) — current within 90 days
  const pinnedPost = input.hasPinnedPost && input.pinnedPostAge <= 90;
  if (pinnedPost) score++;
  else if (!input.hasPinnedPost) {
    recommendations.push("Pin your highlight video with vitals, links, and hashtags — this is what coaches see FIRST");
  } else {
    recommendations.push("Your pinned post is over 90 days old — update with new/better film");
  }

  // 5. Post cadence (1 point) — 4+ posts per week over last 30 days (16+ posts)
  const postCadence = input.postsLast30Days.length >= 16;
  if (postCadence) score++;
  else recommendations.push(`Post cadence is ${input.postsLast30Days.length}/16 for the month — target 4+ posts per week`);

  // 6. Pillar distribution (1 point) — at least 1 post per pillar per week
  const pillars = new Set<string>(input.postsLast30Days.map((p) => p.pillar));
  const pillarDistribution = pillars.size >= 3;
  if (pillarDistribution) score++;
  else {
    const missing = ["performance", "work_ethic", "character"].filter((p) => !pillars.has(p));
    recommendations.push(`Missing content pillars: ${missing.join(", ")} — ensure at least 1 post per pillar per week`);
  }

  // 7. Engagement rate (1 point) — average > 4% across last 10 posts
  const recentPosts = input.postsLast30Days.slice(-10);
  const avgEngagement = recentPosts.length > 0
    ? recentPosts.reduce((sum, p) => sum + p.engagementRate, 0) / recentPosts.length
    : 0;
  const engagementRate = avgEngagement >= 4;
  if (engagementRate) score++;
  else recommendations.push(`Average engagement rate is ${avgEngagement.toFixed(1)}% — target 4%+. Use more native video, position-specific hashtags, and post during optimal windows`);

  // 8. Coach follow count (1 point) — 5+ coaches following Jacob
  const coachFollows = input.coaches.filter((c) => c.followStatus === "followed_back").length;
  const coachFollowCount = coachFollows >= 5;
  if (coachFollowCount) score++;
  else recommendations.push(`${coachFollows}/5 coaches following — increase engagement with coach posts: like, reply with specific comments, RT team highlights`);

  // 9. DM log (1 point) — at least 2 DMs sent in last 30 days
  const dmLog = input.dmsLast30Days.filter((d) => d.status === "sent" || d.status === "responded").length >= 2;
  if (dmLog) score++;
  else recommendations.push("Send at least 2 DMs to target coaches this month — start with Tier 3 D2/GLIAC coaches who have open DMs");

  // 10. Constitution compliance (1 point) — zero violations
  const constitutionCompliance = input.constitutionViolations === 0;
  if (constitutionCompliance) score++;
  else recommendations.push(`${input.constitutionViolations} constitution violations detected — review posting rules immediately`);

  return {
    id: "",
    date: new Date().toISOString(),
    photoQuality,
    headerImage,
    bioCompleteness,
    pinnedPost,
    postCadence,
    pillarDistribution,
    engagementRate,
    coachFollowCount,
    dmLog,
    constitutionCompliance,
    totalScore: score as ProfileAudit["totalScore"],
    recommendations,
  };
}

export function getScoreInterpretation(score: number): {
  label: string;
  description: string;
  color: string;
} {
  if (score >= 8) return { label: "Elite", description: "Maintain cadence, add content complexity", color: "text-green-600" };
  if (score >= 6) return { label: "Good", description: "Tighten post quality and DM cadence", color: "text-blue-600" };
  if (score >= 4) return { label: "Needs Work", description: "Alex flags specific gaps for immediate correction", color: "text-yellow-600" };
  return { label: "Reset", description: "Go back to Phase 03 Build and rebuild foundations", color: "text-red-600" };
}
