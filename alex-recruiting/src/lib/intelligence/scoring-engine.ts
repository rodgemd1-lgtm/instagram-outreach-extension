// Recruiting Intelligence Scoring Engine
// Computes composite recruiting intelligence scores from Hudl, Twitter, and coach data.
// Produces tier projections, recommendations, and actionable intelligence.

import type {
  RecruitingIntelligenceScore,
  FilmScore,
  SocialPresenceScore,
  RecruitingMomentumScore,
  AcademicScore,
  PhysicalProfileScore,
  TierProjection,
  IntelligenceRecommendation,
  HudlProfile,
  TweetPattern,
  OfferEvent,
  RecruitingTimeline,
  RecruitingPhase,
} from "../types/recruiting-intelligence";

// ============ SCORE WEIGHTS ============

const SCORE_WEIGHTS = {
  film: 0.25,
  socialPresence: 0.15,
  recruitingMomentum: 0.25,
  academic: 0.15,
  physicalProfile: 0.20,
};

// ============ PHYSICAL THRESHOLDS (OL-specific) ============

const OL_THRESHOLDS = {
  d1: { minHeight: 74, minWeight: 270 }, // 6'2", 270 lbs
  d2: { minHeight: 72, minWeight: 250 }, // 6'0", 250 lbs
  d3: { minHeight: 70, minWeight: 230 }, // 5'10", 230 lbs
};

// ============ MAIN SCORING FUNCTION ============

export function calculateIntelligenceScore(input: {
  athleteId: string;
  athleteName: string;
  hudlProfile: HudlProfile | null;
  tweetPatterns: TweetPattern[];
  offers: OfferEvent[];
  followerCount: number;
  coachFollowerCount: number;
  postFrequency: number;
  engagementRate: number;
  height: string;
  weight: string;
  gpa: number | null;
  satScore: number | null;
  actScore: number | null;
  classYear: number;
}): RecruitingIntelligenceScore {
  const filmScore = calculateFilmScore(input.hudlProfile);
  const socialScore = calculateSocialPresenceScore(
    input.followerCount,
    input.coachFollowerCount,
    input.postFrequency,
    input.engagementRate,
    input.tweetPatterns
  );
  const momentumScore = calculateMomentumScore(input.offers, input.tweetPatterns);
  const academicScore = calculateAcademicScore(input.gpa, input.satScore, input.actScore);
  const physicalScore = calculatePhysicalProfileScore(input.height, input.weight, input.classYear);

  const overallScore = Math.round(
    filmScore.score * SCORE_WEIGHTS.film +
    socialScore.score * SCORE_WEIGHTS.socialPresence +
    momentumScore.score * SCORE_WEIGHTS.recruitingMomentum +
    academicScore.score * SCORE_WEIGHTS.academic +
    physicalScore.score * SCORE_WEIGHTS.physicalProfile
  );

  const dataCompleteness = calculateDataCompleteness(input);
  const tierProjection = projectTier(overallScore, input.offers, physicalScore, input.classYear);
  const recommendations = generateRecommendations(
    filmScore,
    socialScore,
    momentumScore,
    academicScore,
    physicalScore,
    input.classYear
  );

  return {
    athleteId: input.athleteId,
    athleteName: input.athleteName,
    overallScore,
    filmScore,
    socialPresenceScore: socialScore,
    recruitingMomentumScore: momentumScore,
    academicScore,
    physicalProfileScore: physicalScore,
    tierProjection,
    recommendations,
    calculatedAt: Date.now(),
    dataCompleteness,
  };
}

// ============ SUB-SCORE CALCULATORS ============

function calculateFilmScore(hudl: HudlProfile | null): FilmScore {
  if (!hudl) {
    return {
      score: 0,
      hasHudlProfile: false,
      highlightCount: 0,
      gameFilmAvailable: false,
      totalTaggedPlays: 0,
      filmQualityIndicators: ["No Hudl profile found"],
    };
  }

  let score = 20; // Base score for having a profile
  const indicators: string[] = [];

  // Highlight reels
  if (hudl.highlightReels.length > 0) {
    score += 20;
    indicators.push(`${hudl.highlightReels.length} highlight reel(s)`);
  }
  if (hudl.highlightReels.length >= 3) {
    score += 10;
    indicators.push("Multiple highlight reels (strong)");
  }

  // Game film
  if (hudl.gameFilmCount > 0) {
    score += 20;
    indicators.push(`${hudl.gameFilmCount} game film(s) available`);
  }
  if (hudl.gameFilmCount >= 5) {
    score += 10;
    indicators.push("Extensive game film library");
  }

  // Tagged plays
  if (hudl.totalPlaysTagged > 0) {
    score += 10;
    indicators.push(`${hudl.totalPlaysTagged} plays tagged`);
  }
  if (hudl.totalPlaysTagged >= 50) {
    score += 10;
    indicators.push("Well-tagged film (50+ plays)");
  }

  return {
    score: Math.min(score, 100),
    hasHudlProfile: true,
    highlightCount: hudl.highlightReels.length,
    gameFilmAvailable: hudl.gameFilmCount > 0,
    totalTaggedPlays: hudl.totalPlaysTagged,
    filmQualityIndicators: indicators,
  };
}

function calculateSocialPresenceScore(
  followerCount: number,
  coachFollowerCount: number,
  postFrequency: number,
  engagementRate: number,
  patterns: TweetPattern[]
): SocialPresenceScore {
  let score = 0;

  // Follower count (logarithmic scaling)
  if (followerCount > 0) {
    score += Math.min(Math.log10(followerCount) * 10, 25);
  }

  // Coach followers (very valuable)
  score += Math.min(coachFollowerCount * 5, 25);

  // Post frequency (2-5 per week is ideal)
  if (postFrequency >= 2 && postFrequency <= 5) {
    score += 20;
  } else if (postFrequency >= 1 && postFrequency <= 7) {
    score += 10;
  } else if (postFrequency > 0) {
    score += 5;
  }

  // Engagement rate (>3% is good for recruiting accounts)
  if (engagementRate > 5) score += 20;
  else if (engagementRate > 3) score += 15;
  else if (engagementRate > 1) score += 10;
  else if (engagementRate > 0) score += 5;

  // Content pillar balance
  const pillarCounts: Record<string, number> = {};
  for (const p of patterns) {
    const pillar = mapPatternToPillar(p.patternType);
    pillarCounts[pillar] = (pillarCounts[pillar] || 0) + 1;
  }

  const totalPatterns = patterns.length || 1;
  const balance: Record<string, number> = {};
  for (const [pillar, count] of Object.entries(pillarCounts)) {
    balance[pillar] = count / totalPatterns;
  }

  // Bonus for diverse content
  if (Object.keys(pillarCounts).length >= 3) {
    score += 10;
  }

  return {
    score: Math.min(Math.round(score), 100),
    followerCount,
    coachFollowerCount,
    postFrequency,
    engagementRate,
    contentPillarBalance: balance,
    profileCompleteness: calculateProfileCompleteness(followerCount, postFrequency),
  };
}

function calculateMomentumScore(
  offers: OfferEvent[],
  patterns: TweetPattern[]
): RecruitingMomentumScore {
  let score = 0;

  const totalOffers = offers.length;
  const d1Offers = offers.filter((o) => o.division === "D1 FBS").length;
  const fcsOffers = offers.filter((o) => o.division === "D1 FCS").length;
  const d2Offers = offers.filter((o) => o.division === "D2").length;

  // Offer count scoring
  if (totalOffers > 0) score += 20;
  if (totalOffers >= 3) score += 15;
  if (totalOffers >= 5) score += 10;
  if (totalOffers >= 10) score += 10;

  // D1 offers are high value
  score += Math.min(d1Offers * 10, 20);

  // Recent velocity (offers in patterns from last 30 days)
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recentOffers = offers.filter((o) => new Date(o.offerDate).getTime() > thirtyDaysAgo);
  const recentVelocity = recentOffers.length;

  if (recentVelocity >= 3) score += 15;
  else if (recentVelocity >= 1) score += 10;

  // Camp attendance
  const campPatterns = patterns.filter((p) => p.patternType === "camp_attendance");
  const campAttendance = campPatterns.length;
  score += Math.min(campAttendance * 5, 10);

  // Visit announcements
  const visitPatterns = patterns.filter((p) => p.patternType === "visit_announcement");
  const officialVisits = visitPatterns.length;

  // Determine trend
  let trendDirection: "rising" | "stable" | "cooling" = "stable";
  if (recentVelocity >= 2) trendDirection = "rising";
  else if (totalOffers > 0 && recentVelocity === 0) trendDirection = "cooling";

  // Uncommitted check
  const commitments = patterns.filter((p) => p.patternType === "commitment");
  const decommitments = patterns.filter((p) => p.patternType === "decommitment");
  const uncommitted = decommitments.length >= commitments.length;

  return {
    score: Math.min(Math.round(score), 100),
    totalOffers,
    d1Offers,
    fcsOffers,
    d2Offers,
    recentOfferVelocity: recentVelocity,
    campAttendance,
    officialVisits,
    uncommitted,
    trendDirection,
  };
}

function calculateAcademicScore(
  gpa: number | null,
  satScore: number | null,
  actScore: number | null
): AcademicScore {
  let score = 0;
  const highlights: string[] = [];

  if (gpa !== null) {
    if (gpa >= 3.5) { score += 40; highlights.push("Strong GPA (3.5+)"); }
    else if (gpa >= 3.0) { score += 30; highlights.push("Solid GPA (3.0+)"); }
    else if (gpa >= 2.5) { score += 20; highlights.push("Meets NCAA eligibility"); }
    else { score += 10; }
  }

  if (satScore !== null) {
    if (satScore >= 1200) { score += 30; highlights.push("Strong SAT (1200+)"); }
    else if (satScore >= 1000) { score += 20; highlights.push("Solid SAT (1000+)"); }
    else if (satScore >= 820) { score += 10; highlights.push("Meets NCAA SAT threshold"); }
  }

  if (actScore !== null) {
    if (actScore >= 25) { score += 30; highlights.push("Strong ACT (25+)"); }
    else if (actScore >= 21) { score += 20; highlights.push("Solid ACT (21+)"); }
    else if (actScore >= 16) { score += 10; highlights.push("Meets NCAA ACT threshold"); }
  }

  // If no academic data, give a neutral score
  if (gpa === null && satScore === null && actScore === null) {
    score = 50; // Assume average
    highlights.push("No academic data available");
  }

  return {
    score: Math.min(Math.round(score), 100),
    gpaAvailable: gpa !== null,
    gpa,
    testScoresAvailable: satScore !== null || actScore !== null,
    satScore,
    actScore,
    academicHighlights: highlights,
  };
}

function calculatePhysicalProfileScore(
  heightStr: string,
  weightStr: string,
  classYear: number
): PhysicalProfileScore {
  const heightInches = parseHeight(heightStr);
  const weightLbs = parseWeight(weightStr);
  let score = 0;

  const meetsD1 = heightInches >= OL_THRESHOLDS.d1.minHeight && weightLbs >= OL_THRESHOLDS.d1.minWeight;
  const meetsD2 = heightInches >= OL_THRESHOLDS.d2.minHeight && weightLbs >= OL_THRESHOLDS.d2.minWeight;

  if (meetsD1) {
    score = 80;
  } else if (meetsD2) {
    score = 60;
  } else if (heightInches >= OL_THRESHOLDS.d3.minHeight) {
    score = 40;
  } else {
    score = 20;
  }

  // Growth projection bonus for younger athletes
  const currentYear = new Date().getFullYear();
  const yearsUntilGrad = classYear - currentYear;
  if (yearsUntilGrad >= 3 && meetsD2) {
    score += 15; // Lots of growing time
  } else if (yearsUntilGrad >= 2 && meetsD2) {
    score += 10;
  }

  // Extra credit for already meeting D1 thresholds as underclassman
  if (meetsD1 && yearsUntilGrad >= 2) {
    score += 5;
  }

  const positionFit: string[] = [];
  if (heightInches >= 76 && weightLbs >= 290) positionFit.push("OT");
  if (heightInches >= 74 && weightLbs >= 300) positionFit.push("OG");
  if (heightInches >= 72 && weightLbs >= 280) positionFit.push("C");
  if (positionFit.length === 0) positionFit.push("OL");

  let growthProjection: string | null = null;
  if (yearsUntilGrad >= 3) {
    growthProjection = `${yearsUntilGrad} years of development remaining. Could add 15-30 lbs and 1-2 inches.`;
  } else if (yearsUntilGrad >= 2) {
    growthProjection = `${yearsUntilGrad} years remaining. Could add 10-20 lbs.`;
  }

  return {
    score: Math.min(Math.round(score), 100),
    height: heightStr,
    weight: weightStr,
    meetsD1Threshold: meetsD1,
    meetsD2Threshold: meetsD2,
    growthProjection,
    positionFit,
  };
}

// ============ TIER PROJECTION ============

function projectTier(
  overallScore: number,
  offers: OfferEvent[],
  physical: PhysicalProfileScore,
  classYear: number
): TierProjection {
  let currentTier: TierProjection["currentTier"];
  let projectedTier: TierProjection["projectedTier"];

  if (overallScore >= 80) currentTier = "Elite";
  else if (overallScore >= 65) currentTier = "High";
  else if (overallScore >= 45) currentTier = "Mid";
  else if (overallScore >= 20) currentTier = "Developmental";
  else currentTier = "Unknown";

  // Projection considers growth potential
  const yearsUntilGrad = classYear - new Date().getFullYear();
  if (yearsUntilGrad >= 3 && currentTier !== "Elite") {
    // Younger athletes get benefit of the doubt
    const tiers: TierProjection["currentTier"][] = ["Unknown", "Developmental", "Mid", "High", "Elite"];
    const currentIdx = tiers.indexOf(currentTier);
    projectedTier = tiers[Math.min(currentIdx + 1, tiers.length - 1)];
  } else {
    projectedTier = currentTier;
  }

  // D1 offers automatically bump projection
  const d1Offers = offers.filter((o) => o.division === "D1 FBS").length;
  if (d1Offers >= 5 && projectedTier !== "Elite") {
    projectedTier = "Elite";
  } else if (d1Offers >= 1 && projectedTier === "Mid") {
    projectedTier = "High";
  }

  const confidence = overallScore > 60 ? 0.8 : overallScore > 40 ? 0.6 : 0.4;

  return {
    currentTier,
    projectedTier,
    confidence,
    rationale: buildTierRationale(currentTier, projectedTier, physical, offers.length, yearsUntilGrad),
    comparableRecruits: [],
  };
}

function buildTierRationale(
  current: string,
  projected: string,
  physical: PhysicalProfileScore,
  offerCount: number,
  yearsLeft: number
): string {
  const parts: string[] = [];

  if (physical.meetsD1Threshold) {
    parts.push("Physical profile already meets D1 OL thresholds");
  } else if (physical.meetsD2Threshold) {
    parts.push("Physical profile meets D2 OL thresholds");
  }

  if (offerCount > 0) {
    parts.push(`${offerCount} offer(s) on record`);
  }

  if (yearsLeft >= 3) {
    parts.push(`${yearsLeft} years of development remaining — significant upside`);
  }

  if (current !== projected) {
    parts.push(`Projected to improve from ${current} to ${projected} tier`);
  }

  return parts.join(". ") + ".";
}

// ============ RECOMMENDATION ENGINE ============

function generateRecommendations(
  film: FilmScore,
  social: SocialPresenceScore,
  momentum: RecruitingMomentumScore,
  academic: AcademicScore,
  physical: PhysicalProfileScore,
  classYear: number
): IntelligenceRecommendation[] {
  const recs: IntelligenceRecommendation[] = [];
  const currentYear = new Date().getFullYear();
  const yearsLeft = classYear - currentYear;

  // Film recommendations
  if (!film.hasHudlProfile) {
    recs.push({
      priority: "critical",
      category: "film",
      title: "Create Hudl Profile",
      description: "No Hudl profile found. This is the #1 tool coaches use to evaluate recruits.",
      actionItems: [
        "Create a Hudl account at hudl.com",
        "Upload at least 3-5 minute highlight reel",
        "Tag individual plays by type (pass pro, run blocking, pull, etc.)",
        "Add Hudl link to X/Twitter bio",
      ],
      deadline: null,
    });
  } else if (film.highlightCount === 0) {
    recs.push({
      priority: "high",
      category: "film",
      title: "Add Highlight Reel",
      description: "Hudl profile exists but no highlight reel. Coaches watch highlights first.",
      actionItems: [
        "Create a 3-5 minute highlight reel of best plays",
        "Include variety: pass protection, run blocking, pulling, pancakes",
        "Add visual identifiers (arrows, circles) so coaches can spot you",
      ],
      deadline: null,
    });
  }

  // Social recommendations
  if (social.postFrequency < 2) {
    recs.push({
      priority: "high",
      category: "social",
      title: "Increase Posting Frequency",
      description: "Posting less than 2x/week. Coaches check recruit accounts and want to see consistent activity.",
      actionItems: [
        "Post at least 3-4 times per week",
        "Mix content: 40% film/performance, 40% training, 20% character",
        "Use the weekly content calendar for structure",
      ],
      deadline: null,
    });
  }

  if (social.coachFollowerCount < 5) {
    recs.push({
      priority: "high",
      category: "engagement",
      title: "Build Coach Network",
      description: "Few coaches following. Need to increase visibility with coaching staffs.",
      actionItems: [
        "Follow all target school coaching accounts",
        "Like and reply to coach tweets (genuine, not spammy)",
        "Tag coaches in film/training content",
        "Attend camps and post about the experience tagging the school",
      ],
      deadline: null,
    });
  }

  // Momentum recommendations
  if (momentum.totalOffers === 0 && yearsLeft <= 2) {
    recs.push({
      priority: "critical",
      category: "engagement",
      title: "Accelerate Coach Outreach",
      description: `${yearsLeft} year(s) until graduation with no offers. Time to be proactive.`,
      actionItems: [
        "Send personalized DMs to Tier 3 (D2/NAIA) coaches this week",
        "Register for upcoming camps at target schools",
        "Share Hudl link directly with coaches",
        "Have high school coach make calls to college staffs",
      ],
      deadline: yearsLeft <= 1 ? "Immediate" : null,
    });
  }

  if (momentum.campAttendance === 0 && yearsLeft >= 2) {
    recs.push({
      priority: "medium",
      category: "engagement",
      title: "Attend Camps",
      description: "No camp attendance detected. Camps are the best way to get evaluated in person.",
      actionItems: [
        "Register for 3-5 camps at target schools this summer",
        "Prioritize schools where you already have coach engagement",
        "Post about each camp on X (tag the school and coaches)",
      ],
      deadline: null,
    });
  }

  // Academic recommendations
  if (!academic.gpaAvailable) {
    recs.push({
      priority: "medium",
      category: "academics",
      title: "Add Academic Info",
      description: "No academic data available. Coaches need to verify eligibility early.",
      actionItems: [
        "Add GPA to Hudl profile",
        "Register with NCAA Eligibility Center",
        "Consider posting academic achievements on X",
      ],
      deadline: null,
    });
  }

  // Timing recommendations
  if (yearsLeft === 2) {
    recs.push({
      priority: "high",
      category: "timing",
      title: "Sophomore Year — Critical Window",
      description: "This is when FCS and D2 coaches start reaching out. Need to be maximally visible.",
      actionItems: [
        "Ensure Hudl profile is updated with current season film",
        "Start sending introductory DMs to Tier 2 coaches",
        "Attend at least 3 camps this summer",
        "Begin NCSA profile if not already done",
      ],
      deadline: null,
    });
  }

  return recs.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

// ============ RECRUITING TIMELINE ============

export function calculateRecruitingTimeline(
  classYear: number,
  division: string = "D1 FBS"
): RecruitingTimeline {
  const currentDate = new Date();
  const seniorYear = classYear;
  const juniorYear = classYear - 1;
  const sophomoreYear = classYear - 2;

  const timelines: Record<string, { firstContact: string; firstCall: string; ovOpen: string }> = {
    "D1 FBS": {
      firstContact: `${juniorYear}-09-01`,
      firstCall: `${juniorYear}-04-15`,
      ovOpen: `${juniorYear}-09-01`,
    },
    "D1 FCS": {
      firstContact: `${juniorYear}-09-01`,
      firstCall: `${juniorYear}-04-15`,
      ovOpen: `${juniorYear}-09-01`,
    },
    "D2": {
      firstContact: `${sophomoreYear}-06-15`,
      firstCall: `${sophomoreYear}-06-15`,
      ovOpen: `${juniorYear}-01-01`,
    },
    "D3": {
      firstContact: `${sophomoreYear}-06-15`,
      firstCall: `${sophomoreYear}-06-15`,
      ovOpen: `${juniorYear}-01-01`,
    },
    "NAIA": {
      firstContact: `${sophomoreYear}-06-15`,
      firstCall: `${sophomoreYear}-06-15`,
      ovOpen: `${juniorYear}-01-01`,
    },
  };

  const timeline = timelines[division] || timelines["D1 FBS"];
  const earlySigningPeriod = `${seniorYear}-12-04`;
  const nationalSigningDay = `${seniorYear + 1}-02-05`;

  // Determine current phase
  const currentPhase = determinePhase(currentDate, timeline, earlySigningPeriod);

  // Next milestone
  const milestones = [
    { date: timeline.firstContact, label: "First contact allowed" },
    { date: timeline.firstCall, label: "Phone calls allowed" },
    { date: timeline.ovOpen, label: "Official visits open" },
    { date: earlySigningPeriod, label: "Early signing period" },
    { date: nationalSigningDay, label: "National Signing Day" },
  ];

  const upcoming = milestones.find((m) => new Date(m.date) > currentDate);
  const nextMilestone = upcoming?.label || "All milestones passed";
  const daysToNext = upcoming
    ? Math.ceil((new Date(upcoming.date).getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return {
    athleteClassYear: classYear,
    division,
    firstContactAllowed: timeline.firstContact,
    firstPhoneCallAllowed: timeline.firstCall,
    officialVisitsOpen: timeline.ovOpen,
    earlySigningPeriod,
    nationalSigningDay,
    currentPhase,
    nextMilestone,
    daysToNextMilestone: daysToNext,
    currentPhaseActions: getPhaseActions(currentPhase),
  };
}

function determinePhase(
  current: Date,
  timeline: { firstContact: string; firstCall: string; ovOpen: string },
  earlySigningPeriod: string
): RecruitingPhase {
  const now = current.getTime();

  if (now < new Date(timeline.firstContact).getTime()) return "pre_contact";
  if (now < new Date(timeline.firstCall).getTime()) return "evaluation";
  if (now < new Date(timeline.ovOpen).getTime()) return "active_recruiting";
  if (now < new Date(earlySigningPeriod).getTime()) return "official_visits";
  return "decision";
}

function getPhaseActions(phase: RecruitingPhase): string[] {
  const actions: Record<RecruitingPhase, string[]> = {
    pre_contact: [
      "Build social media presence and film library",
      "Follow target school coaches on X",
      "Attend camps and showcases",
      "Focus on academics — GPA matters for eligibility",
      "Send introductory emails to coaches (athletes can initiate contact anytime)",
    ],
    evaluation: [
      "Update Hudl with current season film weekly",
      "Engage with coach content on X (likes, genuine replies)",
      "Register with NCAA Eligibility Center",
      "Attend prospect camps at target schools",
      "Post consistently: film, training, character content",
    ],
    active_recruiting: [
      "Send personalized DMs to coaches who've engaged",
      "Share updated film and measurables",
      "Schedule unofficial visits",
      "Respond promptly to all coach communication",
      "Continue posting recruiting-focused content",
    ],
    official_visits: [
      "Schedule official visits at top schools",
      "Prepare questions for each visit",
      "Post about visits (tag schools and coaches)",
      "Compare scholarship offers",
      "Discuss options with family and high school coach",
    ],
    decision: [
      "Narrow to final schools",
      "Complete official visits if any remain",
      "Prepare commitment announcement",
      "Sign during early signing period or NSD",
      "Thank all coaches who recruited you",
    ],
    signed: [
      "Announce signing on social media",
      "Thank high school coaches and teammates",
      "Prepare for college transition",
      "Continue training and development",
    ],
  };

  return actions[phase] || [];
}

// ============ UTILITY FUNCTIONS ============

function parseHeight(heightStr: string): number {
  // Parse "6'4"", "6-4", "6'4", etc. to total inches
  const match = heightStr.match(/(\d)['′-]\s*(\d{1,2})/);
  if (match) {
    return parseInt(match[1]) * 12 + parseInt(match[2]);
  }
  return 0;
}

function parseWeight(weightStr: string): number {
  const match = weightStr.match(/(\d{2,3})/);
  return match ? parseInt(match[1]) : 0;
}

function mapPatternToPillar(type: string): string {
  const pillarMap: Record<string, string> = {
    game_performance: "performance",
    film_share: "performance",
    training_content: "work_ethic",
    measurables_update: "work_ethic",
    camp_attendance: "work_ethic",
    academic_achievement: "character",
    offer_announcement: "recruiting",
    commitment: "recruiting",
    decommitment: "recruiting",
    visit_announcement: "recruiting",
    top_schools_list: "recruiting",
    coach_engagement: "engagement",
    generic_recruiting: "recruiting",
  };
  return pillarMap[type] || "other";
}

function calculateProfileCompleteness(followerCount: number, postFrequency: number): number {
  let completeness = 0;
  if (followerCount > 0) completeness += 0.3;
  if (postFrequency > 0) completeness += 0.3;
  if (postFrequency >= 2) completeness += 0.2;
  if (followerCount >= 100) completeness += 0.2;
  return Math.min(completeness, 1);
}

function calculateDataCompleteness(input: {
  hudlProfile: HudlProfile | null;
  tweetPatterns: TweetPattern[];
  offers: OfferEvent[];
  followerCount: number;
  gpa: number | null;
  height: string;
  weight: string;
}): number {
  let fields = 0;
  let filled = 0;

  fields++; if (input.hudlProfile) filled++;
  fields++; if (input.tweetPatterns.length > 0) filled++;
  fields++; if (input.followerCount > 0) filled++;
  fields++; if (input.gpa !== null) filled++;
  fields++; if (input.height) filled++;
  fields++; if (input.weight) filled++;
  fields++; if (input.offers.length > 0) filled++;

  return fields > 0 ? filled / fields : 0;
}
