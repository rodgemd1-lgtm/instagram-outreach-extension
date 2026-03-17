import { NextRequest, NextResponse } from "next/server";
import {
  createAdminClient,
  isSupabaseConfigured,
} from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * POST /api/coaches/seed
 *
 * One-time seed endpoint: updates placeholder "OL Coach — {School}" rows
 * with real coach names, titles, and X handles scraped from MCP sources.
 * Protected by CRON_SECRET.
 */

const REAL_COACHES: Record<
  string,
  { name: string; title: string; xHandle: string; notes: string }
> = {
  // Tier 1 — FBS
  wisconsin: {
    name: "Eric Mateos",
    title: "Offensive Line Coach",
    xHandle: "",
    notes:
      "Hired Dec 2025 from Arkansas. Previously at SMU, Alabama (2019-22). Wisconsin alum.",
  },
  iowa: {
    name: "George Barnett",
    title: "Offensive Line Coach",
    xHandle: "",
    notes:
      "Iowa OL coach since 2013 under Kirk Ferentz. PFF #1 rated OL in 2025. NFL pipeline.",
  },
  northwestern: {
    name: "Tim Drevno",
    title: "Offensive Line Coach",
    xHandle: "",
    notes:
      "Hired Jan 2026. 33-year veteran with NFL experience (49ers). Previously at Michigan, USC.",
  },
  "iowa-state": {
    name: "Jake Thornton",
    title: "Offensive Line Coach",
    xHandle: "",
    notes:
      "New hire under first-year HC Jimmy Rogers. Iowa State rebuilding OL staff for 2026.",
  },

  // Tier 2 — FCS/MAC
  "north-dakota-state": {
    name: "Dylan Chmura",
    title: "Offensive Line Coach",
    xHandle: "",
    notes:
      "Hired Feb 2025. Son of Packers TE Mark Chmura. NDSU FCS dynasty program.",
  },
  "south-dakota-state": {
    name: "Mike Bangtson",
    title: "Offensive Line Coach",
    xHandle: "",
    notes:
      "Hired Jan 2025. Iowa native. Replaced Ryan Olson (moved to Big Ten). SDSU back-to-back FCS champions.",
  },
  "illinois-state": {
    name: "Harold Etheridge",
    title: "Assistant Coach/Offensive Line",
    xHandle: "",
    notes:
      "7th season with Illinois State in 2025 (second stint). Brock Spack's staff. MVFC program.",
  },
  "youngstown-state": {
    name: "Austen Bujnoch",
    title: "Offensive Line Coach / Co-Offensive Coordinator",
    xHandle: "",
    notes:
      "5th season at YSU under Doug Phillips. Co-OC since 2023. Record-setting offense.",
  },
  "northern-illinois": {
    name: "Matt White",
    title: "Offensive Line Coach",
    xHandle: "",
    notes:
      "New hire Feb 2026 under Thomas Hammock. Previously at Southern Utah, Truman State. Midwest ties.",
  },
  "western-michigan": {
    name: "Joe Pawlak",
    title: "Offensive Line Coach",
    xHandle: "",
    notes:
      "Hired April 2025 under Lance Taylor. Previously at Montana (FCS playoff), North Dakota (4x FCS playoffs).",
  },
  "ball-state": {
    name: "Alex Barr",
    title: "Offensive Line Coach",
    xHandle: "",
    notes:
      "Arrived with new HC Mike Uremovich from Butler. Previously Butler OC. New staff building program.",
  },
  "central-michigan": {
    name: "Hayden Mace",
    title: "Offensive Line Coach",
    xHandle: "",
    notes:
      "On Matt Drinkall's staff at CMU. MAC program actively recruiting Midwest OL.",
  },

  // Tier 3 — D2
  "ferris-state": {
    name: "Drew Burton",
    title: "Offensive Line Coach",
    xHandle: "",
    notes:
      "New hire July 2025 under Tony Annese. 3x D2 national champion program.",
  },
  "michigan-tech": {
    name: "Jack Rustman",
    title: "Offensive Line Coach",
    xHandle: "",
    notes:
      "At Michigan Tech since Feb 2022 under Dan Mettlach. Previously at Concordia (Chicago).",
  },
  "saginaw-valley": {
    name: "Cole Hoover",
    title: "Offensive Coordinator / Offensive Line Coach",
    xHandle: "",
    notes:
      "Hired Jan 2026 under HC Michael Engle. Dual OC/OL role. GLIAC program.",
  },
  "minnesota-state-mankato": {
    name: "Chad Henning",
    title: "Run Game Coordinator / Offensive Line Coach",
    xHandle: "@CoachHenning75",
    notes:
      "Under HC Todd Hoffner. Dual run game coordinator/OL role. Strong NSIC program.",
  },
  "winona-state": {
    name: "Nick Holeton",
    title: "Asst. Football Coach / Offensive Line",
    xHandle: "",
    notes:
      "On Brian Curtin's 2026 staff at Winona State. NSIC D2 program near Wisconsin border.",
  },
};

export async function POST(req: NextRequest) {
  // Protect with CRON_SECRET
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 503 },
    );
  }

  const supabase = createAdminClient();
  const results: { school: string; status: string; name: string }[] = [];

  for (const [schoolId, coach] of Object.entries(REAL_COACHES)) {
    try {
      // Find existing coach row by school_id
      const { data: existing } = await supabase
        .from("coaches")
        .select("id, name")
        .eq("school_id", schoolId);

      if (existing && existing.length > 0) {
        // Update existing row
        const { error } = await supabase
          .from("coaches")
          .update({
            name: coach.name,
            title: coach.title,
            x_handle: coach.xHandle || null,
            notes: coach.notes,
            updated_at: new Date().toISOString(),
          })
          .eq("school_id", schoolId);

        if (error) {
          results.push({
            school: schoolId,
            status: `error: ${error.message}`,
            name: coach.name,
          });
        } else {
          results.push({
            school: schoolId,
            status: `updated (was: ${existing[0].name})`,
            name: coach.name,
          });
        }
      } else {
        // Insert new row
        const { error } = await supabase.from("coaches").insert({
          name: coach.name,
          title: coach.title,
          school_id: schoolId,
          school_name:
            schoolId
              .split("-")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" "),
          division: ["wisconsin", "iowa", "northwestern", "iowa-state", "northern-illinois", "western-michigan", "ball-state", "central-michigan"].includes(schoolId)
            ? "D1 FBS"
            : ["north-dakota-state", "south-dakota-state", "illinois-state", "youngstown-state"].includes(schoolId)
              ? "D1 FCS"
              : "D2",
          conference: "",
          x_handle: coach.xHandle || null,
          priority_tier: ["wisconsin", "iowa", "northwestern", "iowa-state"].includes(schoolId)
            ? "Tier 1"
            : ["ferris-state", "michigan-tech", "saginaw-valley", "minnesota-state-mankato", "winona-state"].includes(schoolId)
              ? "Tier 3"
              : "Tier 2",
          ol_need_score: 3,
          x_activity_score: 3,
          notes: coach.notes,
        });

        if (error) {
          results.push({
            school: schoolId,
            status: `insert error: ${error.message}`,
            name: coach.name,
          });
        } else {
          results.push({
            school: schoolId,
            status: "inserted (new row)",
            name: coach.name,
          });
        }
      }
    } catch (err) {
      results.push({
        school: schoolId,
        status: `exception: ${String(err)}`,
        name: coach.name,
      });
    }
  }

  return NextResponse.json({
    seeded: results.length,
    results,
  });
}
