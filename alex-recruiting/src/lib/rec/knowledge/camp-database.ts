// Camp & Combine Registration + Results Tracker
// Supabase-backed via Drizzle ORM
// Tracks camps Jacob should attend, registration status, results, and coach contacts

import { eq, desc, gte, lte, and } from "drizzle-orm";
import { db, isDbConfigured } from "@/lib/db";
import { camps } from "@/lib/db/schema";

// ---- Types ----

export type CampType = "school_camp" | "prospect_day" | "combine" | "showcase" | "satellite";
export type RegistrationStatus = "not_registered" | "registered" | "waitlisted" | "confirmed";
export type FollowUpStatus = "none" | "pending" | "in_progress" | "completed";

export interface CoachPresent {
  name: string;
  title: string;
  school: string;
  contacted: boolean;
}

export interface CampResult {
  measurables: { name: string; value: string; unit: string }[];
  drills: { name: string; score: string; notes: string }[];
  feedback: string[];
}

export interface CoachContact {
  coachName: string;
  school: string;
  title: string;
  businessCard: boolean;
  followUpNeeded: boolean;
  followUpDone: boolean;
  notes: string;
}

export interface Camp {
  id: string;
  name: string;
  school: string | null;
  location: string | null;
  campType: CampType;
  date: string | null;
  dateEnd: string | null;
  registrationDeadline: string | null;
  registrationStatus: RegistrationStatus;
  cost: number | null;
  coachesPresent: CoachPresent[];
  results: CampResult | null;
  coachContacts: CoachContact[];
  followUpStatus: FollowUpStatus;
  offerCorrelation: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

// ---- Row mapper ----

function rowToCamp(row: typeof camps.$inferSelect): Camp {
  return {
    id: row.id,
    name: row.name,
    school: row.school ?? null,
    location: row.location ?? null,
    campType: row.campType as CampType,
    date: row.date?.toISOString() ?? null,
    dateEnd: row.dateEnd?.toISOString() ?? null,
    registrationDeadline: row.registrationDeadline?.toISOString() ?? null,
    registrationStatus: row.registrationStatus as RegistrationStatus,
    cost: row.cost ?? null,
    coachesPresent: (row.coachesPresent as CoachPresent[]) ?? [],
    results: (row.results as CampResult) ?? null,
    coachContacts: (row.coachContacts as CoachContact[]) ?? [],
    followUpStatus: (row.followUpStatus as FollowUpStatus) ?? "none",
    offerCorrelation: row.offerCorrelation ?? null,
    notes: row.notes ?? null,
    createdAt: row.createdAt?.toISOString() ?? new Date().toISOString(),
    updatedAt: row.updatedAt?.toISOString() ?? new Date().toISOString(),
  };
}

// ---- Pre-populated Summer 2026 camp list ----

export const SUMMER_2026_CAMPS: Omit<Camp, "id" | "createdAt" | "updatedAt">[] = [
  {
    name: "Wisconsin OL Camp",
    school: "Wisconsin",
    location: "Madison, WI",
    campType: "school_camp",
    date: "2026-06-10T09:00:00.000Z",
    dateEnd: "2026-06-10T16:00:00.000Z",
    registrationDeadline: "2026-05-25T23:59:59.000Z",
    registrationStatus: "not_registered",
    cost: 75,
    coachesPresent: [
      { name: "Bob Bostad", title: "OL Coach", school: "Wisconsin", contacted: false },
    ],
    results: null,
    coachContacts: [],
    followUpStatus: "none",
    offerCorrelation: null,
    notes: "Big Ten school. High-level competition. Good for evaluation against D1-level talent. Tier 1 reach program.",
  },
  {
    name: "Iowa OL Camp",
    school: "Iowa",
    location: "Iowa City, IA",
    campType: "school_camp",
    date: "2026-06-15T09:00:00.000Z",
    dateEnd: "2026-06-15T16:00:00.000Z",
    registrationDeadline: "2026-06-01T23:59:59.000Z",
    registrationStatus: "not_registered",
    cost: 65,
    coachesPresent: [
      { name: "George Barnett", title: "OL Coach", school: "Iowa", contacted: false },
    ],
    results: null,
    coachContacts: [],
    followUpStatus: "none",
    offerCorrelation: null,
    notes: "Iowa is known for OL development. Great exposure even as a rising sophomore. Tier 1 reach program.",
  },
  {
    name: "NDSU Prospect Camp",
    school: "NDSU",
    location: "Fargo, ND",
    campType: "prospect_day",
    date: "2026-06-22T08:00:00.000Z",
    dateEnd: "2026-06-22T15:00:00.000Z",
    registrationDeadline: "2026-06-10T23:59:59.000Z",
    registrationStatus: "not_registered",
    cost: 50,
    coachesPresent: [],
    results: null,
    coachContacts: [],
    followUpStatus: "none",
    offerCorrelation: null,
    notes: "FCS powerhouse, 9x national champions. Realistic target for Class of 2029 OL. Tier 2 target program.",
  },
  {
    name: "SDSU Prospect Camp",
    school: "SDSU",
    location: "Brookings, SD",
    campType: "prospect_day",
    date: "2026-06-28T08:00:00.000Z",
    dateEnd: "2026-06-28T15:00:00.000Z",
    registrationDeadline: "2026-06-15T23:59:59.000Z",
    registrationStatus: "not_registered",
    cost: 45,
    coachesPresent: [],
    results: null,
    coachContacts: [],
    followUpStatus: "none",
    offerCorrelation: null,
    notes: "Strong FCS program in the Missouri Valley. Good fit for Midwest OL. Tier 2 target program.",
  },
  {
    name: "NIU OL Camp",
    school: "NIU",
    location: "DeKalb, IL",
    campType: "school_camp",
    date: "2026-06-18T09:00:00.000Z",
    dateEnd: "2026-06-18T16:00:00.000Z",
    registrationDeadline: "2026-06-05T23:59:59.000Z",
    registrationStatus: "not_registered",
    cost: 55,
    coachesPresent: [],
    results: null,
    coachContacts: [],
    followUpStatus: "none",
    offerCorrelation: null,
    notes: "MAC school — realistic D1 FBS target. Coaches are accessible and responsive to Class of 2029 OL. Tier 2 target.",
  },
  {
    name: "Ferris State Camp",
    school: "Ferris State",
    location: "Big Rapids, MI",
    campType: "school_camp",
    date: "2026-07-10T09:00:00.000Z",
    dateEnd: "2026-07-10T15:00:00.000Z",
    registrationDeadline: "2026-06-28T23:59:59.000Z",
    registrationStatus: "not_registered",
    cost: 40,
    coachesPresent: [],
    results: null,
    coachContacts: [],
    followUpStatus: "none",
    offerCorrelation: null,
    notes: "D2 GLIAC powerhouse. Safety school with strong OL tradition. Coaches engage early with underclassmen. Tier 3 safety.",
  },
  {
    name: "National Underclassman Combine",
    school: null,
    location: "Regional Midwest (TBD)",
    campType: "combine",
    date: "2026-07-18T08:00:00.000Z",
    dateEnd: "2026-07-18T17:00:00.000Z",
    registrationDeadline: "2026-07-01T23:59:59.000Z",
    registrationStatus: "not_registered",
    cost: 85,
    coachesPresent: [],
    results: null,
    coachContacts: [],
    followUpStatus: "none",
    offerCorrelation: null,
    notes: "Multi-school combine with verified measurables. Results go into national database. Critical for underclassmen without film ratings.",
  },
];

// ---- In-memory fallback for development ----

const memoryCamps: Camp[] = [];
let memNextId = 1;

function memGenerateId(): string {
  return `camp-${Date.now()}-${memNextId++}`;
}

// ---- Public API ----

export async function getCamps(): Promise<Camp[]> {
  if (!isDbConfigured()) {
    return [...memoryCamps];
  }
  const rows = await db.select().from(camps).orderBy(desc(camps.date));
  return rows.map(rowToCamp);
}

export async function getCampById(id: string): Promise<Camp | undefined> {
  if (!isDbConfigured()) {
    return memoryCamps.find((c) => c.id === id);
  }
  const [row] = await db.select().from(camps).where(eq(camps.id, id));
  return row ? rowToCamp(row) : undefined;
}

export async function getCampsByStatus(status: RegistrationStatus): Promise<Camp[]> {
  if (!isDbConfigured()) {
    return memoryCamps.filter((c) => c.registrationStatus === status);
  }
  const rows = await db
    .select()
    .from(camps)
    .where(eq(camps.registrationStatus, status))
    .orderBy(desc(camps.date));
  return rows.map(rowToCamp);
}

export async function getCampsByType(type: CampType): Promise<Camp[]> {
  if (!isDbConfigured()) {
    return memoryCamps.filter((c) => c.campType === type);
  }
  const rows = await db
    .select()
    .from(camps)
    .where(eq(camps.campType, type))
    .orderBy(desc(camps.date));
  return rows.map(rowToCamp);
}

export async function getCampsBySchool(school: string): Promise<Camp[]> {
  if (!isDbConfigured()) {
    return memoryCamps.filter((c) => c.school?.toLowerCase() === school.toLowerCase());
  }
  const rows = await db
    .select()
    .from(camps)
    .where(eq(camps.school, school))
    .orderBy(desc(camps.date));
  return rows.map(rowToCamp);
}

export async function getUpcomingCamps(monthsAhead: number = 3): Promise<Camp[]> {
  const now = new Date();
  const future = new Date();
  future.setMonth(future.getMonth() + monthsAhead);

  if (!isDbConfigured()) {
    return memoryCamps.filter((c) => {
      if (!c.date) return false;
      const d = new Date(c.date);
      return d >= now && d <= future;
    });
  }

  const rows = await db
    .select()
    .from(camps)
    .where(and(gte(camps.date, now), lte(camps.date, future)))
    .orderBy(camps.date);
  return rows.map(rowToCamp);
}

export async function getCampHistory(): Promise<Camp[]> {
  const now = new Date();

  if (!isDbConfigured()) {
    return memoryCamps.filter((c) => {
      if (!c.date) return false;
      return new Date(c.date) < now;
    });
  }

  const rows = await db
    .select()
    .from(camps)
    .where(lte(camps.date, now))
    .orderBy(desc(camps.date));
  return rows.map(rowToCamp);
}

export async function addCamp(data: {
  name: string;
  school?: string;
  location?: string;
  campType?: CampType;
  date?: string;
  dateEnd?: string;
  registrationDeadline?: string;
  registrationStatus?: RegistrationStatus;
  cost?: number;
  coachesPresent?: CoachPresent[];
  notes?: string;
}): Promise<Camp> {
  if (!isDbConfigured()) {
    const camp: Camp = {
      id: memGenerateId(),
      name: data.name,
      school: data.school ?? null,
      location: data.location ?? null,
      campType: data.campType ?? "school_camp",
      date: data.date ?? null,
      dateEnd: data.dateEnd ?? null,
      registrationDeadline: data.registrationDeadline ?? null,
      registrationStatus: data.registrationStatus ?? "not_registered",
      cost: data.cost ?? null,
      coachesPresent: data.coachesPresent ?? [],
      results: null,
      coachContacts: [],
      followUpStatus: "none",
      offerCorrelation: null,
      notes: data.notes ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryCamps.push(camp);
    return camp;
  }

  const [row] = await db
    .insert(camps)
    .values({
      name: data.name,
      school: data.school,
      location: data.location,
      campType: data.campType ?? "school_camp",
      date: data.date ? new Date(data.date) : undefined,
      dateEnd: data.dateEnd ? new Date(data.dateEnd) : undefined,
      registrationDeadline: data.registrationDeadline ? new Date(data.registrationDeadline) : undefined,
      registrationStatus: data.registrationStatus ?? "not_registered",
      cost: data.cost,
      coachesPresent: data.coachesPresent ?? [],
      notes: data.notes,
    })
    .returning();

  return rowToCamp(row);
}

export async function updateCamp(
  id: string,
  updates: {
    registrationStatus?: RegistrationStatus;
    results?: CampResult;
    coachContacts?: CoachContact[];
    coachesPresent?: CoachPresent[];
    followUpStatus?: FollowUpStatus;
    offerCorrelation?: string;
    notes?: string;
    cost?: number;
    date?: string;
    dateEnd?: string;
    registrationDeadline?: string;
  }
): Promise<Camp | undefined> {
  if (!isDbConfigured()) {
    const index = memoryCamps.findIndex((c) => c.id === id);
    if (index === -1) return undefined;
    const camp = {
      ...memoryCamps[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    memoryCamps[index] = camp;
    return camp;
  }

  const values: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (updates.registrationStatus !== undefined) values.registrationStatus = updates.registrationStatus;
  if (updates.results !== undefined) values.results = updates.results;
  if (updates.coachContacts !== undefined) values.coachContacts = updates.coachContacts;
  if (updates.coachesPresent !== undefined) values.coachesPresent = updates.coachesPresent;
  if (updates.followUpStatus !== undefined) values.followUpStatus = updates.followUpStatus;
  if (updates.offerCorrelation !== undefined) values.offerCorrelation = updates.offerCorrelation;
  if (updates.notes !== undefined) values.notes = updates.notes;
  if (updates.cost !== undefined) values.cost = updates.cost;
  if (updates.date !== undefined) values.date = new Date(updates.date);
  if (updates.dateEnd !== undefined) values.dateEnd = new Date(updates.dateEnd);
  if (updates.registrationDeadline !== undefined) values.registrationDeadline = new Date(updates.registrationDeadline);

  const [row] = await db
    .update(camps)
    .set(values)
    .where(eq(camps.id, id))
    .returning();

  return row ? rowToCamp(row) : undefined;
}

export async function addCampResult(
  id: string,
  results: CampResult
): Promise<Camp | undefined> {
  return updateCamp(id, { results, followUpStatus: "pending" });
}

export async function seedSummer2026Camps(): Promise<Camp[]> {
  const seeded: Camp[] = [];
  for (const campData of SUMMER_2026_CAMPS) {
    const camp = await addCamp({
      name: campData.name,
      school: campData.school ?? undefined,
      location: campData.location ?? undefined,
      campType: campData.campType,
      date: campData.date ?? undefined,
      dateEnd: campData.dateEnd ?? undefined,
      registrationDeadline: campData.registrationDeadline ?? undefined,
      registrationStatus: campData.registrationStatus,
      cost: campData.cost ?? undefined,
      coachesPresent: campData.coachesPresent,
      notes: campData.notes ?? undefined,
    });
    seeded.push(camp);
  }
  return seeded;
}

// ---- Knowledge context for persona injection ----

export async function getKnowledgeContext(): Promise<string> {
  const lines: string[] = [];

  lines.push("=== CAMP & COMBINE TRACKER ===\n");

  let allCamps: Camp[];
  try {
    allCamps = await getCamps();
  } catch {
    // Fall back to the pre-populated list if DB unavailable
    allCamps = [];
  }

  if (allCamps.length === 0) {
    lines.push("No camps tracked yet. Summer 2026 camp plan is ready to seed.\n");
    lines.push("Pre-planned Summer 2026 camps for Jacob Rodgers (Class of 2029, DT/OG, Pewaukee HS WI):");
    for (const camp of SUMMER_2026_CAMPS) {
      const dateStr = camp.date ? new Date(camp.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "TBD";
      lines.push(`  - ${camp.name} (${camp.location}) — ${dateStr} — ${camp.campType} — $${camp.cost ?? "TBD"}`);
    }
    lines.push("");
    lines.push("Camp Strategy:");
    lines.push("  - Camps are the #1 evaluation mechanism for Class of 2029 prospects");
    lines.push("  - Prioritize schools where Jacob has realistic shot (Tier 2 & 3)");
    lines.push("  - Tier 1 camps (Wisconsin, Iowa) for exposure and measuring against top talent");
    lines.push("  - Always get verified measurables at combines — goes into national databases");
    lines.push("  - After each camp: send thank-you DMs to coaches met within 24 hours");
    return lines.join("\n");
  }

  lines.push(`Total camps tracked: ${allCamps.length}\n`);

  const statusCounts: Record<string, number> = {};
  for (const camp of allCamps) {
    statusCounts[camp.registrationStatus] = (statusCounts[camp.registrationStatus] || 0) + 1;
  }

  lines.push("Registration breakdown:");
  for (const [status, count] of Object.entries(statusCounts)) {
    lines.push(`  ${status}: ${count}`);
  }

  const now = new Date();
  const upcoming = allCamps.filter((c) => c.date && new Date(c.date) >= now);
  const past = allCamps.filter((c) => c.date && new Date(c.date) < now);
  const withResults = past.filter((c) => c.results);

  lines.push(`\nUpcoming: ${upcoming.length} | Completed: ${past.length} | With results: ${withResults.length}`);

  if (upcoming.length > 0) {
    lines.push("\nNext camps:");
    for (const camp of upcoming.slice(0, 5)) {
      const dateStr = camp.date ? new Date(camp.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "TBD";
      lines.push(`  - ${camp.name} (${camp.school ?? "Multi-school"}) — ${dateStr} — Status: ${camp.registrationStatus}`);
    }
  }

  const needFollowUp = allCamps.filter((c) => c.followUpStatus === "pending");
  if (needFollowUp.length > 0) {
    lines.push(`\n!! ${needFollowUp.length} camp(s) need follow-up !!`);
    for (const camp of needFollowUp) {
      lines.push(`  - ${camp.name}: Follow up with coaches`);
    }
  }

  return lines.join("\n");
}
