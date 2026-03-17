/**
 * Database Seed Script
 *
 * Populates the database with initial data from target-schools and
 * generates sample coaches, posts, DMs, and analytics snapshots.
 *
 * Usage:
 *   npx tsx src/lib/db/seed.ts
 *
 * Requires JIB_DATABASE_URL environment variable to be set.
 */

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { targetSchools } from "../data/target-schools";
import {
  schools,
  coaches,
  posts,
  dmMessages,
  analyticsSnapshots,
} from "./schema";

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
// Coach title templates per school
// ---------------------------------------------------------------------------
const COACH_TITLES = [
  "Offensive Line Coach",
  "Offensive Coordinator",
  "Head Coach",
  "Recruiting Coordinator",
  "Associate Head Coach",
];

const FIRST_NAMES = [
  "Mike", "Dave", "Chris", "Matt", "Brian", "Tom", "Steve", "Jeff",
  "Jim", "Mark", "Joe", "Bill", "Dan", "Pat", "Rob", "Greg",
  "Kevin", "Jason", "Eric", "Ryan", "Adam", "Scott", "Tim", "Andy",
  "Nick", "James", "John", "Paul", "Derek", "Travis", "Tyler", "Zach",
];

const LAST_NAMES = [
  "Johnson", "Williams", "Smith", "Brown", "Miller", "Davis", "Wilson",
  "Anderson", "Taylor", "Thomas", "Jackson", "Martin", "Thompson",
  "Garcia", "Robinson", "Clark", "Lewis", "Walker", "Hall", "Allen",
  "Young", "King", "Wright", "Lopez", "Hill", "Green", "Adams", "Baker",
  "Nelson", "Carter", "Mitchell", "Roberts", "Turner", "Phillips",
];

// ---------------------------------------------------------------------------
// Content pillar sample posts
// ---------------------------------------------------------------------------
const SAMPLE_POSTS = [
  {
    content: "Early morning work before school. No shortcuts. Every rep counts when you're building a foundation for D1 football. #RecruitJacob #OLLife",
    pillar: "work_ethic",
    hashtags: ["RecruitJacob", "OLLife", "WorkEthic", "ClassOf2029"],
    status: "posted",
    impressions: 342,
    engagements: 28,
    engagementRate: 8.2,
  },
  {
    content: "Film breakdown from Friday's game. Watch the combo block at the point of attack — timing is everything. #GameFilm #OL",
    pillar: "performance",
    hashtags: ["GameFilm", "OL", "FilmRoom", "RecruitJacob"],
    status: "posted",
    impressions: 567,
    engagements: 45,
    engagementRate: 7.9,
  },
  {
    content: "3.8 GPA and 285 lbs. Student-athlete means both words matter. Proud of what we're building on and off the field. #AcademicAthlete",
    pillar: "character",
    hashtags: ["AcademicAthlete", "StudentFirst", "RecruitJacob", "ClassOf2029"],
    status: "posted",
    impressions: 891,
    engagements: 112,
    engagementRate: 12.6,
  },
  {
    content: "New PR on power clean today. 225 lbs at 15 years old. The work doesn't stop. Summer grind loading. #StrengthTraining #OLPower",
    pillar: "performance",
    hashtags: ["StrengthTraining", "OLPower", "RecruitJacob"],
    status: "posted",
    impressions: 423,
    engagements: 38,
    engagementRate: 9.0,
  },
  {
    content: "Grateful for my coaches at Pewaukee who push me every day. Iron sharpens iron. #TeamFirst #GratefulAthlete",
    pillar: "character",
    hashtags: ["TeamFirst", "GratefulAthlete", "PewaukeeFootball"],
    status: "posted",
    impressions: 298,
    engagements: 31,
    engagementRate: 10.4,
  },
  {
    content: "Speed ladder + footwork drills. Big guys can move too. Lateral quickness is what separates good OL from great OL. #Footwork",
    pillar: "work_ethic",
    hashtags: ["Footwork", "OLDrills", "RecruitJacob", "GetBetter"],
    status: "scheduled",
    impressions: 0,
    engagements: 0,
    engagementRate: 0,
  },
  {
    content: "Highlight reel from this season dropping soon. Stay tuned. #ComingSoon #FilmSpeaks",
    pillar: "performance",
    hashtags: ["ComingSoon", "FilmSpeaks", "RecruitJacob"],
    status: "draft",
    impressions: 0,
    engagements: 0,
    engagementRate: 0,
  },
  {
    content: "Community service day with the team. Building character off the field is just as important as on it. #MoreThanAnAthlete",
    pillar: "character",
    hashtags: ["MoreThanAnAthlete", "CommunityFirst", "PewaukeeFootball"],
    status: "draft",
    impressions: 0,
    engagements: 0,
    engagementRate: 0,
  },
];

// ---------------------------------------------------------------------------
// DM templates
// ---------------------------------------------------------------------------
const DM_TEMPLATES = [
  {
    templateType: "introduction",
    content: "Coach, my name is Jacob Rodgers — Class of 2029 OL from Pewaukee, WI. 6'3\" 285 lbs. I've been following your program and love the OL development tradition. I'd be grateful for any feedback on my film. Here's my Hudl: [link]",
    status: "sent",
  },
  {
    templateType: "follow_up",
    content: "Coach, just wanted to follow up on my previous message. I've been working hard this off-season — new PR on power clean (225 lbs). Would love the opportunity to attend a camp this summer. Thank you for your time.",
    status: "drafted",
  },
  {
    templateType: "camp_interest",
    content: "Coach, I'm interested in attending your summer camp. I'm a Class of 2029 OL, 6'3\" 285 lbs from Pewaukee HS in Wisconsin. Would love the chance to compete and get coached up by your staff.",
    status: "drafted",
  },
  {
    templateType: "film_share",
    content: "Coach, I recently uploaded new game film to my Hudl profile. I'd be honored if you could take a look when you have a moment. Here's the link: [link]. Thank you!",
    status: "sent",
  },
  {
    templateType: "gratitude",
    content: "Coach, thank you so much for taking the time to watch my film. Your feedback means the world to me. I'll keep working and improving. Go [team]!",
    status: "responded",
  },
];

// ---------------------------------------------------------------------------
// Helper: random element from array
// ---------------------------------------------------------------------------
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

// ---------------------------------------------------------------------------
// Seed function
// ---------------------------------------------------------------------------
async function seed() {
  const connectionString = process.env.JIB_DATABASE_URL;
  if (!connectionString) {
    console.error("Error: JIB_DATABASE_URL environment variable is not set.");
    console.error("Set it in your .env file or export it before running the seed script.");
    process.exit(1);
  }

  const pool = new Pool({ connectionString, max: 5 });
  const db = drizzle(pool);

  console.log("Starting database seed...\n");

  // ── 1. Seed Schools ───────────────────────────────────────────────────
  console.log("1. Seeding schools...");
  const schoolRows = targetSchools.map((s) => ({
    id: s.id,
    name: s.name,
    division: s.division,
    conference: s.conference,
    state: STATE_MAP[s.id] ?? null,
    priorityTier: s.priorityTier,
    olNeedScore: 3,
    whyJacob: s.whyJacob,
    rosterUrl: s.rosterUrl,
    staffUrl: s.staffUrl,
    officialXHandle: s.officialXHandle,
  }));

  for (const row of schoolRows) {
    await db
      .insert(schools)
      .values(row)
      .onConflictDoUpdate({
        target: schools.id,
        set: {
          name: row.name,
          division: row.division,
          conference: row.conference,
          state: row.state,
          priorityTier: row.priorityTier,
          whyJacob: row.whyJacob,
          rosterUrl: row.rosterUrl,
          staffUrl: row.staffUrl,
          officialXHandle: row.officialXHandle,
          updatedAt: new Date(),
        },
      });
  }
  console.log(`   Upserted ${schoolRows.length} schools.`);

  // ── 2. Seed Coaches (2-3 per school) ──────────────────────────────────
  console.log("2. Seeding coaches...");
  let coachCount = 0;
  const insertedCoachIds: string[] = [];

  for (const school of targetSchools) {
    const numCoaches = 2 + Math.floor(Math.random() * 2); // 2 or 3
    const titles = pickN(COACH_TITLES, numCoaches);

    for (let i = 0; i < numCoaches; i++) {
      const firstName = pick(FIRST_NAMES);
      const lastName = pick(LAST_NAMES);
      const name = `${firstName} ${lastName}`;
      const title = titles[i];
      const xHandle = `@Coach${lastName}${school.id.replace(/-/g, "").slice(0, 4)}`;
      const dmOpen = school.priorityTier === "Tier 3" || (school.priorityTier === "Tier 2" && Math.random() > 0.5);

      const result = await db
        .insert(coaches)
        .values({
          name,
          title,
          schoolId: school.id,
          schoolName: school.name,
          division: school.division,
          conference: school.conference,
          xHandle,
          dmOpen,
          followStatus: dmOpen ? "followed" : "not_followed",
          dmStatus: "not_sent",
          priorityTier: school.priorityTier,
          olNeedScore: 2 + Math.floor(Math.random() * 4), // 2-5
          xActivityScore: 1 + Math.floor(Math.random() * 5), // 1-5
          notes: `${title} at ${school.name}. ${school.whyJacob}`,
        })
        .returning({ id: coaches.id });

      if (result[0]) {
        insertedCoachIds.push(result[0].id);
      }
      coachCount++;
    }
  }
  console.log(`   Inserted ${coachCount} coaches.`);

  // ── 3. Seed Posts ─────────────────────────────────────────────────────
  console.log("3. Seeding posts...");
  const now = new Date();

  for (let i = 0; i < SAMPLE_POSTS.length; i++) {
    const post = SAMPLE_POSTS[i];
    const createdAt = new Date(now.getTime() - (SAMPLE_POSTS.length - i) * 2 * 24 * 60 * 60 * 1000); // stagger by 2 days
    const scheduledFor = post.status === "scheduled"
      ? new Date(now.getTime() + (i + 1) * 24 * 60 * 60 * 1000)
      : createdAt;

    await db.insert(posts).values({
      content: post.content,
      pillar: post.pillar,
      hashtags: post.hashtags,
      scheduledFor,
      bestTime: pick(["7:00 AM", "12:00 PM", "6:00 PM", "8:00 PM"]),
      status: post.status,
      impressions: post.impressions,
      engagements: post.engagements,
      engagementRate: post.engagementRate,
      createdAt,
      updatedAt: createdAt,
    });
  }
  console.log(`   Inserted ${SAMPLE_POSTS.length} posts.`);

  // ── 4. Seed DM Messages ──────────────────────────────────────────────
  console.log("4. Seeding DM messages...");
  let dmCount = 0;

  // Pick some coaches to send DMs to
  const dmCoachIds = pickN(insertedCoachIds, Math.min(8, insertedCoachIds.length));

  for (const coachId of dmCoachIds) {
    const template = pick(DM_TEMPLATES);
    const daysAgo = Math.floor(Math.random() * 30);
    const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const sentAt = template.status !== "drafted" ? createdAt : null;
    const respondedAt = template.status === "responded"
      ? new Date(createdAt.getTime() + (1 + Math.floor(Math.random() * 5)) * 24 * 60 * 60 * 1000)
      : null;

    // Look up coach info — we'll use a placeholder since we can't easily query mid-seed
    const schoolIdx = Math.floor(Math.random() * targetSchools.length);
    const school = targetSchools[schoolIdx];

    await db.insert(dmMessages).values({
      coachId,
      coachName: `Coach at ${school.name}`,
      schoolName: school.name,
      templateType: template.templateType,
      content: template.content,
      status: template.status,
      sentAt,
      respondedAt,
      responseContent: respondedAt ? "Thanks for reaching out, Jacob. I'll take a look at your film this week." : null,
      createdAt,
    });
    dmCount++;
  }
  console.log(`   Inserted ${dmCount} DM messages.`);

  // ── 5. Seed Analytics Snapshots ───────────────────────────────────────
  console.log("5. Seeding analytics snapshots...");
  const snapshotCount = 8;

  for (let i = 0; i < snapshotCount; i++) {
    const weekOffset = snapshotCount - i;
    const date = new Date(now.getTime() - weekOffset * 7 * 24 * 60 * 60 * 1000);

    // Simulate gradual growth over weeks
    const baseFollowers = 20 + i * 8;
    const coachFollows = Math.min(i + 1, 10);
    const dmsSent = Math.floor(i * 1.5);
    const postsPublished = 2 + i * 2;

    await db.insert(analyticsSnapshots).values({
      date,
      totalFollowers: baseFollowers + Math.floor(Math.random() * 10),
      coachFollows,
      dmsSent,
      dmResponseRate: dmsSent > 0 ? Math.round((Math.random() * 30 + 10) * 10) / 10 : 0,
      postsPublished,
      avgEngagementRate: Math.round((5 + Math.random() * 8) * 10) / 10,
      profileVisits: 50 + i * 40 + Math.floor(Math.random() * 30),
      auditScore: Math.min(10, 3 + i),
    });
  }
  console.log(`   Inserted ${snapshotCount} analytics snapshots.`);

  // ── Done ──────────────────────────────────────────────────────────────
  console.log("\nSeed complete!");
  console.log(`  Schools:    ${schoolRows.length}`);
  console.log(`  Coaches:    ${coachCount}`);
  console.log(`  Posts:      ${SAMPLE_POSTS.length}`);
  console.log(`  DMs:        ${dmCount}`);
  console.log(`  Snapshots:  ${snapshotCount}`);

  await pool.end();
}

// ---------------------------------------------------------------------------
// Execute
// ---------------------------------------------------------------------------
seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
