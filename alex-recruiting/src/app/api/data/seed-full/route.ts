/**
 * POST /api/data/seed-full
 *
 * Seeds all core tables with comprehensive data derived from the existing
 * target-schools list and competitor-intel knowledge base.
 *
 * Tables seeded:
 *   schools (17), coaches (~51), schoolFitScores (17), postingWindows (21),
 *   growthSnapshots (30), competitorRecruits (8), camps (8)
 *
 * If JIB_DATABASE_URL is not configured the endpoint returns the generated
 * data as JSON without attempting any database writes.
 */

import { NextResponse } from "next/server";
import { db, isDbConfigured } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { targetSchools } from "@/lib/data/target-schools";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

// Attempt to import competitor profiles; fall back to built-in data on failure.
let competitorProfiles: {
  name: string;
  position: string;
  classYear: number;
  school: string;
  state: string;
  height: string;
  weight: string;
  xHandle: string | null;
  estimatedFollowers: number;
}[] = [];

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require("@/lib/rec/knowledge/competitor-intel");
  if (mod.competitorIntel && Array.isArray(mod.competitorIntel)) {
    competitorProfiles = mod.competitorIntel;
  }
} catch {
  // will use fallback below
}

// ---------------------------------------------------------------------------
// State mapping for school geography
// ---------------------------------------------------------------------------
const STATE_MAP: Record<string, string> = {
  wisconsin: "WI",
  northwestern: "IL",
  iowa: "IA",
  "iowa-state": "IA",
  "northern-illinois": "IL",
  "western-michigan": "MI",
  "ball-state": "IN",
  "central-michigan": "MI",
  "south-dakota-state": "SD",
  "north-dakota-state": "ND",
  "illinois-state": "IL",
  "youngstown-state": "OH",
  "saginaw-valley": "MI",
  "michigan-tech": "MI",
  "ferris-state": "MI",
  "winona-state": "MN",
  "minnesota-state-mankato": "MN",
};

// ---------------------------------------------------------------------------
// OL need score by tier
// ---------------------------------------------------------------------------
function olNeedScoreForTier(tier: string): number {
  switch (tier) {
    case "Tier 1":
      return 70;
    case "Tier 2":
      return 85;
    case "Tier 3":
      return 90;
    default:
      return 75;
  }
}

// ---------------------------------------------------------------------------
// Deterministic-seeded random helpers (use index-based variation)
// ---------------------------------------------------------------------------
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

function rangeInt(min: number, max: number, seed: number): number {
  return Math.floor(min + seededRandom(seed) * (max - min + 1));
}

function rangeFloat(min: number, max: number, seed: number, decimals = 1): number {
  const val = min + seededRandom(seed) * (max - min);
  const factor = Math.pow(10, decimals);
  return Math.round(val * factor) / factor;
}

// ---------------------------------------------------------------------------
// School abbreviation helper
// ---------------------------------------------------------------------------
function schoolAbbrev(id: string): string {
  const map: Record<string, string> = {
    wisconsin: "UW",
    northwestern: "NU",
    iowa: "UI",
    "iowa-state": "ISU",
    "northern-illinois": "NIU",
    "western-michigan": "WMU",
    "ball-state": "BSU",
    "central-michigan": "CMU",
    "south-dakota-state": "SDSU",
    "north-dakota-state": "NDSU",
    "illinois-state": "ILST",
    "youngstown-state": "YSU",
    "saginaw-valley": "SVSU",
    "michigan-tech": "MTU",
    "ferris-state": "FSU",
    "winona-state": "WSU",
    "minnesota-state-mankato": "MSUM",
  };
  return map[id] ?? id.replace(/-/g, "").slice(0, 4).toUpperCase();
}

// ---------------------------------------------------------------------------
// Realistic coach name pools (deterministic per school index + role index)
// ---------------------------------------------------------------------------
const FIRST_NAMES = [
  "Mike", "Dave", "Chris", "Matt", "Brian", "Tom", "Steve", "Jeff",
  "Jim", "Mark", "Joe", "Bill", "Dan", "Pat", "Rob", "Greg",
  "Kevin", "Jason", "Eric", "Ryan", "Adam", "Scott", "Tim", "Andy",
  "Nick", "James", "John", "Paul", "Derek", "Travis", "Tyler", "Zach",
  "Luke", "Sean", "Brett", "Chad", "Cory", "Nate", "Aaron", "Kyle",
  "Brad", "Phil", "Doug", "Craig", "Keith", "Ray", "Barry", "Terry",
  "Clint", "Ross", "Lance", "Grant",
];

const LAST_NAMES = [
  "Johnson", "Williams", "Smith", "Brown", "Miller", "Davis", "Wilson",
  "Anderson", "Taylor", "Thomas", "Jackson", "Martin", "Thompson",
  "Garcia", "Robinson", "Clark", "Lewis", "Walker", "Hall", "Allen",
  "Young", "King", "Wright", "Lopez", "Hill", "Green", "Adams", "Baker",
  "Nelson", "Carter", "Mitchell", "Roberts", "Turner", "Phillips",
  "Campbell", "Parker", "Evans", "Edwards", "Collins", "Stewart",
  "Sanchez", "Morris", "Rogers", "Reed", "Cook", "Morgan", "Bell",
  "Murphy", "Bailey", "Rivera", "Cooper", "Cox",
];

function coachName(schoolIdx: number, roleIdx: number): { first: string; last: string } {
  const fi = (schoolIdx * 3 + roleIdx * 7 + 11) % FIRST_NAMES.length;
  const li = (schoolIdx * 5 + roleIdx * 13 + 23) % LAST_NAMES.length;
  return { first: FIRST_NAMES[fi], last: LAST_NAMES[li] };
}

// ---------------------------------------------------------------------------
// Data generators
// ---------------------------------------------------------------------------

function generateSchoolRows() {
  return targetSchools.map((s) => ({
    id: s.id,
    name: s.name,
    division: s.division,
    conference: s.conference,
    state: STATE_MAP[s.id] ?? null,
    priorityTier: s.priorityTier,
    olNeedScore: olNeedScoreForTier(s.priorityTier),
    whyJacob: s.whyJacob,
    rosterUrl: s.rosterUrl,
    staffUrl: s.staffUrl,
    officialXHandle: s.officialXHandle,
  }));
}

function generateCoachRows() {
  const rows: {
    name: string;
    title: string;
    schoolId: string;
    schoolName: string;
    division: string;
    conference: string;
    xHandle: string;
    dmOpen: boolean;
    followStatus: string;
    dmStatus: string;
    priorityTier: string;
    olNeedScore: number;
    xActivityScore: number;
    notes: string;
  }[] = [];

  const roles = [
    { title: "Head Coach", roleIdx: 0 },
    { title: "Offensive Line Coach", roleIdx: 1 },
    { title: "Recruiting Coordinator", roleIdx: 2 },
  ];

  targetSchools.forEach((school, schoolIdx) => {
    for (const role of roles) {
      const { first, last } = coachName(schoolIdx, role.roleIdx);
      const abbrev = schoolAbbrev(school.id);
      const xHandle = `@Coach${last}${abbrev}`;

      // DM open logic: Tier 3 = true, Tier 2 = alternating, Tier 1 = false
      let dmOpen = false;
      if (school.priorityTier === "Tier 3") {
        dmOpen = true;
      } else if (school.priorityTier === "Tier 2") {
        dmOpen = (schoolIdx + role.roleIdx) % 2 === 0;
      }

      rows.push({
        name: `${first} ${last}`,
        title: role.title,
        schoolId: school.id,
        schoolName: school.name,
        division: school.division,
        conference: school.conference,
        xHandle,
        dmOpen,
        followStatus: "not_followed",
        dmStatus: "not_sent",
        priorityTier: school.priorityTier,
        olNeedScore: olNeedScoreForTier(school.priorityTier),
        xActivityScore: rangeInt(30, 90, schoolIdx * 3 + role.roleIdx),
        notes: `${role.title} at ${school.name}`,
      });
    }
  });

  return rows;
}

function generateFitScoreRows() {
  return targetSchools.map((school, idx) => {
    const seed = idx * 17;
    const tier = school.priorityTier;

    let fitScore: number,
      rosterNeed: number,
      geography: number,
      academics: number,
      coachEngagement: number,
      competitivePosition: number,
      offerLikelihood: number,
      graduatingSeniorsOL: number;

    if (tier === "Tier 1") {
      fitScore = rangeFloat(55, 70, seed + 1);
      rosterNeed = rangeFloat(60, 80, seed + 2);
      geography = 90;
      academics = 85;
      coachEngagement = rangeFloat(30, 50, seed + 3);
      competitivePosition = rangeFloat(35, 55, seed + 4);
      offerLikelihood = rangeFloat(15, 30, seed + 5);
      graduatingSeniorsOL = rangeInt(4, 6, seed + 6);
    } else if (tier === "Tier 2") {
      fitScore = rangeFloat(70, 85, seed + 1);
      rosterNeed = rangeFloat(75, 90, seed + 2);
      geography = 75;
      academics = 75;
      coachEngagement = rangeFloat(55, 75, seed + 3);
      competitivePosition = rangeFloat(55, 75, seed + 4);
      offerLikelihood = rangeFloat(35, 55, seed + 5);
      graduatingSeniorsOL = rangeInt(3, 5, seed + 6);
    } else {
      // Tier 3
      fitScore = rangeFloat(80, 95, seed + 1);
      rosterNeed = rangeFloat(85, 95, seed + 2);
      geography = 70;
      academics = 70;
      coachEngagement = rangeFloat(80, 95, seed + 3);
      competitivePosition = rangeFloat(70, 90, seed + 4);
      offerLikelihood = rangeFloat(60, 80, seed + 5);
      graduatingSeniorsOL = rangeInt(3, 5, seed + 6);
    }

    return {
      schoolId: school.id,
      schoolName: school.name,
      fitScore,
      rosterNeed,
      geography,
      academics,
      coachEngagement,
      competitivePosition,
      offerLikelihood,
      graduatingSeniorsOL,
    };
  });
}

function generatePostingWindowRows() {
  const windows: {
    dayOfWeek: number;
    hourStart: number;
    hourEnd: number;
    score: number;
    coachOverlap: number;
    avgEngagement: number;
    season: string;
  }[] = [];

  // Weekdays (Monday=1 through Friday=5)
  for (let day = 1; day <= 5; day++) {
    windows.push({
      dayOfWeek: day,
      hourStart: 6,
      hourEnd: 8,
      score: 70,
      coachOverlap: 15,
      avgEngagement: 3.8,
      season: "general",
    });
    windows.push({
      dayOfWeek: day,
      hourStart: 15,
      hourEnd: 17,
      score: 90,
      coachOverlap: 45,
      avgEngagement: 5.2,
      season: "general",
    });
    windows.push({
      dayOfWeek: day,
      hourStart: 19,
      hourEnd: 21,
      score: 60,
      coachOverlap: 25,
      avgEngagement: 4.1,
      season: "general",
    });
  }

  // Saturday (6)
  windows.push({
    dayOfWeek: 6,
    hourStart: 9,
    hourEnd: 11,
    score: 75,
    coachOverlap: 20,
    avgEngagement: 4.0,
    season: "general",
  });
  windows.push({
    dayOfWeek: 6,
    hourStart: 16,
    hourEnd: 19,
    score: 95,
    coachOverlap: 55,
    avgEngagement: 6.1,
    season: "general",
  });
  windows.push({
    dayOfWeek: 6,
    hourStart: 20,
    hourEnd: 22,
    score: 65,
    coachOverlap: 30,
    avgEngagement: 4.5,
    season: "general",
  });

  // Sunday (0)
  windows.push({
    dayOfWeek: 0,
    hourStart: 10,
    hourEnd: 12,
    score: 60,
    coachOverlap: 10,
    avgEngagement: 3.5,
    season: "general",
  });
  windows.push({
    dayOfWeek: 0,
    hourStart: 14,
    hourEnd: 16,
    score: 70,
    coachOverlap: 20,
    avgEngagement: 4.2,
    season: "general",
  });
  windows.push({
    dayOfWeek: 0,
    hourStart: 19,
    hourEnd: 21,
    score: 85,
    coachOverlap: 35,
    avgEngagement: 5.0,
    season: "general",
  });

  return windows;
}

function generateGrowthSnapshotRows() {
  const snapshots: {
    followerCount: number;
    coachFollowers: number;
    followingCount: number;
    engagementRate: number;
    postsThisWeek: number;
    dmsThisWeek: number;
    snapshotDate: Date;
  }[] = [];

  const now = new Date();
  let followers = 47;
  let coachFollowers = 3;
  let following = 82;

  for (let i = 0; i < 30; i++) {
    const daysAgo = 29 - i;
    const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    // Grow followers by 2-5 per day with seeded variance
    const followerGain = rangeInt(2, 5, i * 31);
    followers += followerGain;

    // Coach followers grows 0-1 per day (about 30% chance)
    if (seededRandom(i * 47) > 0.7) {
      coachFollowers += 1;
    }

    // Following count grows slowly
    following += rangeInt(0, 2, i * 53);

    const engagementRate = rangeFloat(3.5, 5.5, i * 61);
    const postsThisWeek = rangeInt(3, 5, i * 71);
    const dmsThisWeek = rangeInt(0, 2, i * 79);

    snapshots.push({
      followerCount: followers,
      coachFollowers,
      followingCount: following,
      engagementRate,
      postsThisWeek,
      dmsThisWeek,
      snapshotDate: date,
    });
  }

  return snapshots;
}

function generateCompetitorRows() {
  // Try to map from imported competitor-intel profiles
  if (competitorProfiles.length >= 8) {
    return competitorProfiles.slice(0, 8).map((c, idx) => {
      const stateAbbrev = c.state === "Wisconsin" ? "WI" : c.state === "Illinois" ? "IL" : c.state;
      return {
        name: c.name,
        xHandle: c.xHandle,
        position: c.position,
        classYear: c.classYear,
        school: c.school,
        state: stateAbbrev,
        height: c.height,
        weight: c.weight,
        followerCount: c.estimatedFollowers,
        postCadence: rangeFloat(0.5, 5, idx * 37),
        engagementRate: rangeFloat(2, 8, idx * 43),
        topContentTypes: ["Training clips", "Game film", "Workout highlights"].slice(
          0,
          rangeInt(1, 3, idx * 51)
        ),
        schoolInterestSignals: [] as string[],
      };
    });
  }

  // Fallback: create 8 Class of 2029 OL recruits
  const fallbackCompetitors = [
    { name: "Ethan Mueller", state: "WI", height: "6'5\"", weight: "275", handle: null, followers: 0 },
    { name: "Marcus Williams", state: "WI", height: "6'2\"", weight: "290", handle: "@MarcWilliams29", followers: 85 },
    { name: "Tyler Bjornstad", state: "WI", height: "6'4\"", weight: "270", handle: "@TBjornstad74", followers: 120 },
    { name: "Ryan O'Donnell", state: "IL", height: "6'2\"", weight: "285", handle: "@RyanOD_OL29", followers: 210 },
    { name: "Jake Henderson", state: "WI", height: "6'3\"", weight: "280", handle: "@JHenderson2029", followers: 95 },
    { name: "Daniel Park", state: "WI", height: "6'4\"", weight: "265", handle: null, followers: 0 },
    { name: "Aiden Kowalski", state: "WI", height: "6'1\"", weight: "295", handle: "@AidenK_OL29", followers: 55 },
    { name: "Brandon Schmidt", state: "WI", height: "6'5\"", weight: "260", handle: "@BSchmidt_MUHS", followers: 150 },
  ];

  return fallbackCompetitors.map((c, idx) => ({
    name: c.name,
    xHandle: c.handle,
    position: idx % 2 === 0 ? "OT" : "OG",
    classYear: 2029,
    school: `${c.state} High School`,
    state: c.state,
    height: c.height,
    weight: c.weight,
    followerCount: c.followers,
    postCadence: rangeFloat(0.5, 5, idx * 37),
    engagementRate: rangeFloat(2, 8, idx * 43),
    topContentTypes: ["Training clips", "Game film", "Workout highlights"].slice(
      0,
      rangeInt(1, 3, idx * 51)
    ),
    schoolInterestSignals: [] as string[],
  }));
}

function generateCampRows() {
  const camps = [
    {
      name: "Wisconsin OL Camp",
      school: "University of Wisconsin",
      location: "Camp Randall Stadium, Madison, WI",
      campType: "school_camp" as const,
      date: new Date("2026-06-13T09:00:00"),
      registrationStatus: "not_registered" as const,
      cost: 75,
      coachesPresent: [
        { name: "Bob Bostad", title: "Offensive Line Coach", school: "Wisconsin", contacted: false },
        { name: "Luke Fickell", title: "Head Coach", school: "Wisconsin", contacted: false },
      ],
      notes: "Flagship Wisconsin OL camp. Priority attendance. Opportunity to get evaluated by Wisconsin OL staff in person.",
    },
    {
      name: "Iowa Lineman Camp",
      school: "Iowa",
      location: "Kinnick Stadium, Iowa City, IA",
      campType: "school_camp" as const,
      date: new Date("2026-06-20T08:00:00"),
      registrationStatus: "not_registered" as const,
      cost: 65,
      coachesPresent: [
        { name: "George Barnett", title: "Offensive Line Coach", school: "Iowa", contacted: false },
        { name: "Kirk Ferentz", title: "Head Coach", school: "Iowa", contacted: false },
      ],
      notes: "Iowa is OL University. Kirk Ferentz built the program on elite OL development. Must-attend for Tier 1 exposure.",
    },
    {
      name: "NDSU Prospect Day",
      school: "North Dakota State",
      location: "Fargodome, Fargo, ND",
      campType: "prospect_day" as const,
      date: new Date("2026-07-11T10:00:00"),
      registrationStatus: "not_registered" as const,
      cost: 0,
      coachesPresent: [
        { name: "Tim Polasek", title: "Offensive Coordinator", school: "NDSU", contacted: false },
      ],
      notes: "Free prospect day. NDSU is the FCS gold standard with 9 national championships. Great chance for film evaluation.",
    },
    {
      name: "IMG Academy Summer Series",
      school: "IMG Academy",
      location: "IMG Academy, Bradenton, FL",
      campType: "showcase" as const,
      date: new Date("2026-07-18T08:00:00"),
      registrationStatus: "not_registered" as const,
      cost: 250,
      coachesPresent: [
        { name: "Various", title: "College Scouts", school: "Multiple Programs", contacted: false },
      ],
      notes: "National showcase event. High cost but exceptional exposure to multiple college programs simultaneously.",
    },
    {
      name: "Midwest OL Showcase",
      school: "Midwest Football Camps",
      location: "Waukesha, WI",
      campType: "showcase" as const,
      date: new Date("2026-06-27T09:00:00"),
      registrationStatus: "not_registered" as const,
      cost: 85,
      coachesPresent: [
        { name: "Various", title: "College Coaches", school: "MAC / MVFC Programs", contacted: false },
      ],
      notes: "Regional OL showcase close to home. MAC and MVFC coaches attend regularly. Strong Tier 2 exposure opportunity.",
    },
    {
      name: "Ferris State Prospect Camp",
      school: "Ferris State",
      location: "Top Taggart Field, Big Rapids, MI",
      campType: "school_camp" as const,
      date: new Date("2026-06-06T09:00:00"),
      registrationStatus: "not_registered" as const,
      cost: 40,
      coachesPresent: [
        { name: "Tony Annese", title: "Head Coach", school: "Ferris State", contacted: false },
      ],
      notes: "D2 powerhouse and 2022 national champions. Ferris State coaches scout X actively. Low cost, high return Tier 3 camp.",
    },
    {
      name: "SDSU Jackrabbit Camp",
      school: "South Dakota State",
      location: "Dana J. Dykhouse Stadium, Brookings, SD",
      campType: "school_camp" as const,
      date: new Date("2026-07-03T09:00:00"),
      registrationStatus: "not_registered" as const,
      cost: 50,
      coachesPresent: [
        { name: "Jason Eck", title: "Head Coach", school: "SDSU", contacted: false },
      ],
      notes: "MVFC powerhouse producing NFL players. SDSU coaches have DM'd Wisconsin freshmen before. Priority Tier 2 camp.",
    },
    {
      name: "Northern Illinois Skills Camp",
      school: "Northern Illinois",
      location: "Huskie Stadium, DeKalb, IL",
      campType: "school_camp" as const,
      date: new Date("2026-06-17T09:00:00"),
      registrationStatus: "not_registered" as const,
      cost: 55,
      coachesPresent: [
        { name: "Thomas Hammock", title: "Head Coach", school: "Northern Illinois", contacted: false },
      ],
      notes: "MAC flagship program. NIU coaches are active on X and respond to DMs. Good Tier 2 exposure with Wisconsin recruiting history.",
    },
  ];

  return camps;
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------
export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  try {
    // Generate all data first
    const schoolRows = generateSchoolRows();
    const coachRows = generateCoachRows();
    const fitScoreRows = generateFitScoreRows();
    const windowRows = generatePostingWindowRows();
    const snapshotRows = generateGrowthSnapshotRows();
    const competitorRows = generateCompetitorRows();
    const campRows = generateCampRows();

    const counts = {
      schools: schoolRows.length,
      coaches: coachRows.length,
      fitScores: fitScoreRows.length,
      windows: windowRows.length,
      snapshots: snapshotRows.length,
      competitors: competitorRows.length,
      camps: campRows.length,
    };

    // If database is not configured, return generated data as JSON
    if (!isDbConfigured()) {
      return NextResponse.json({
        success: true,
        mode: "preview",
        message: "Database not configured (JIB_DATABASE_URL missing). Returning generated data without inserting.",
        seeded: counts,
        data: {
          schools: schoolRows,
          coaches: coachRows,
          fitScores: fitScoreRows,
          windows: windowRows,
          snapshots: snapshotRows,
          competitors: competitorRows,
          camps: campRows,
        },
      });
    }

    // Auth required before any database writes
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ---------------------------------------------------------------------------
    // Database insert path
    // ---------------------------------------------------------------------------
    const results: Record<string, { inserted: number; errors: string[] }> = {};

    // 1. Schools (17 records) — upsert on conflict
    try {
      let schoolInserted = 0;
      for (const row of schoolRows) {
        try {
          await db
            .insert(schema.schools)
            .values(row)
            .onConflictDoUpdate({
              target: schema.schools.id,
              set: {
                name: row.name,
                division: row.division,
                conference: row.conference,
                state: row.state,
                priorityTier: row.priorityTier,
                olNeedScore: row.olNeedScore,
                whyJacob: row.whyJacob,
                rosterUrl: row.rosterUrl,
                staffUrl: row.staffUrl,
                officialXHandle: row.officialXHandle,
                updatedAt: new Date(),
              },
            });
          schoolInserted++;
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          if (!results.schools) results.schools = { inserted: 0, errors: [] };
          results.schools.errors.push(`${row.id}: ${msg}`);
        }
      }
      results.schools = {
        inserted: schoolInserted,
        errors: results.schools?.errors ?? [],
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.schools = { inserted: 0, errors: [`batch: ${msg}`] };
    }

    // 2. Coaches (~51 records) — insert, skip duplicates by catching errors
    try {
      let coachInserted = 0;
      for (const row of coachRows) {
        try {
          await db.insert(schema.coaches).values(row);
          coachInserted++;
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          // Skip duplicate key errors silently
          if (msg.includes("duplicate") || msg.includes("unique")) continue;
          if (!results.coaches) results.coaches = { inserted: 0, errors: [] };
          results.coaches.errors.push(`${row.name}: ${msg}`);
        }
      }
      results.coaches = {
        inserted: coachInserted,
        errors: results.coaches?.errors ?? [],
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.coaches = { inserted: 0, errors: [`batch: ${msg}`] };
    }

    // 3. School Fit Scores (17 records) — clear existing and insert fresh
    try {
      await db.delete(schema.schoolFitScores).where(sql`1=1`);
      let fitInserted = 0;
      for (const row of fitScoreRows) {
        try {
          await db.insert(schema.schoolFitScores).values(row);
          fitInserted++;
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          if (!results.fitScores) results.fitScores = { inserted: 0, errors: [] };
          results.fitScores.errors.push(`${row.schoolId}: ${msg}`);
        }
      }
      results.fitScores = {
        inserted: fitInserted,
        errors: results.fitScores?.errors ?? [],
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.fitScores = { inserted: 0, errors: [`batch: ${msg}`] };
    }

    // 4. Posting Windows (21 records) — clear existing and insert fresh
    try {
      await db.delete(schema.postingWindows).where(sql`1=1`);
      let windowInserted = 0;
      for (const row of windowRows) {
        try {
          await db.insert(schema.postingWindows).values(row);
          windowInserted++;
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          if (!results.windows) results.windows = { inserted: 0, errors: [] };
          results.windows.errors.push(`day${row.dayOfWeek}-${row.hourStart}: ${msg}`);
        }
      }
      results.windows = {
        inserted: windowInserted,
        errors: results.windows?.errors ?? [],
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.windows = { inserted: 0, errors: [`batch: ${msg}`] };
    }

    // 5. Growth Snapshots (30 records) — clear existing and insert fresh
    try {
      await db.delete(schema.growthSnapshots).where(sql`1=1`);
      let snapInserted = 0;
      for (const row of snapshotRows) {
        try {
          await db.insert(schema.growthSnapshots).values(row);
          snapInserted++;
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          if (!results.snapshots) results.snapshots = { inserted: 0, errors: [] };
          results.snapshots.errors.push(msg);
        }
      }
      results.snapshots = {
        inserted: snapInserted,
        errors: results.snapshots?.errors ?? [],
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.snapshots = { inserted: 0, errors: [`batch: ${msg}`] };
    }

    // 6. Competitor Recruits (8 records) — clear existing and insert fresh
    try {
      await db.delete(schema.competitorRecruits).where(sql`1=1`);
      let compInserted = 0;
      for (const row of competitorRows) {
        try {
          await db.insert(schema.competitorRecruits).values(row);
          compInserted++;
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          if (!results.competitors) results.competitors = { inserted: 0, errors: [] };
          results.competitors.errors.push(`${row.name}: ${msg}`);
        }
      }
      results.competitors = {
        inserted: compInserted,
        errors: results.competitors?.errors ?? [],
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.competitors = { inserted: 0, errors: [`batch: ${msg}`] };
    }

    // 7. Camps (8 records) — clear existing and insert fresh
    try {
      await db.delete(schema.camps).where(sql`1=1`);
      let campInserted = 0;
      for (const row of campRows) {
        try {
          await db.insert(schema.camps).values(row);
          campInserted++;
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          if (!results.camps) results.camps = { inserted: 0, errors: [] };
          results.camps.errors.push(`${row.name}: ${msg}`);
        }
      }
      results.camps = {
        inserted: campInserted,
        errors: results.camps?.errors ?? [],
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.camps = { inserted: 0, errors: [`batch: ${msg}`] };
    }

    // Compile summary
    const totalErrors = Object.values(results).reduce(
      (sum, r) => sum + r.errors.length,
      0
    );

    return NextResponse.json({
      success: totalErrors === 0,
      mode: "database",
      seeded: {
        schools: results.schools?.inserted ?? 0,
        coaches: results.coaches?.inserted ?? 0,
        fitScores: results.fitScores?.inserted ?? 0,
        windows: results.windows?.inserted ?? 0,
        snapshots: results.snapshots?.inserted ?? 0,
        competitors: results.competitors?.inserted ?? 0,
        camps: results.camps?.inserted ?? 0,
      },
      ...(totalErrors > 0 && {
        errors: Object.fromEntries(
          Object.entries(results)
            .filter(([, v]) => v.errors.length > 0)
            .map(([k, v]) => [k, v.errors])
        ),
      }),
    });
  } catch (err) {
    console.error("[POST /api/data/seed-full] Fatal error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error during seeding",
      },
      { status: 500 }
    );
  }
}
