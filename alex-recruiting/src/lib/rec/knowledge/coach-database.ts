// Coach database knowledge base
// Wraps the target schools data and provides context for system prompt injection

import { targetSchools, type TargetSchool } from "@/lib/data/target-schools";

// --- WIAC Coach Data (2026 verified staffs) ---

export interface WiacCoach {
  school: string;
  name: string;
  title: string;
  xHandle: string | null;
  tier: number;
}

export const wiacCoaches: WiacCoach[] = [
  // --- UW-Whitewater ---
  { school: 'UW-Whitewater', name: 'Jace Rindahl', title: 'Head Coach', xHandle: '@CoachRindahl', tier: 1 },
  { school: 'UW-Whitewater', name: 'Jake Kienbaum', title: 'Offensive Line Coach', xHandle: '@CoachKienbaum', tier: 2 },
  { school: 'UW-Whitewater', name: 'Ryan Cortez', title: 'Defensive Coordinator/DL', xHandle: '@CoachCortez53', tier: 2 },

  // --- UW-Oshkosh ---
  { school: 'UW-Oshkosh', name: 'Peter Jennings', title: 'Head Coach', xHandle: '@PeteyBananas', tier: 1 },
  { school: 'UW-Oshkosh', name: 'Rich Worsell', title: 'Offensive Coordinator/OL', xHandle: '@Coach_Worsell', tier: 2 },
  { school: 'UW-Oshkosh', name: 'Alex Jagla', title: 'Defensive Line Coach', xHandle: '@jaglabeans', tier: 2 },

  // --- UW-Eau Claire ---
  { school: 'UW-Eau Claire', name: 'Rob Erickson', title: 'Head Coach', xHandle: '@CoachE_Blugolds', tier: 1 },
  { school: 'UW-Eau Claire', name: 'Michael McHugh', title: 'OL/Run Game Coordinator', xHandle: null, tier: 2 },
  { school: 'UW-Eau Claire', name: 'Ricky Lang', title: 'Defensive Line Coach', xHandle: null, tier: 2 },

  // --- UW-La Crosse ---
  { school: 'UW-La Crosse', name: 'Michael Zweifel', title: 'Head Coach', xHandle: '@CoachMZweifel', tier: 1 },
  { school: 'UW-La Crosse', name: 'Staff TBD', title: 'Offensive Line Coach', xHandle: null, tier: 2 },
  { school: 'UW-La Crosse', name: 'Staff TBD', title: 'Defensive Line Coach', xHandle: null, tier: 2 },

  // --- UW-Stevens Point ---
  { school: 'UW-Stevens Point', name: 'Luke Venne', title: 'Head Coach', xHandle: '@CoachVenne', tier: 1 },
  { school: 'UW-Stevens Point', name: 'Austin Archer', title: 'Offensive Coordinator/OL', xHandle: '@CoachAArcher', tier: 2 },
  { school: 'UW-Stevens Point', name: 'Lorenzo Bocanegra', title: 'Defensive Line Coach', xHandle: null, tier: 2 },

  // --- UW-Platteville ---
  { school: 'UW-Platteville', name: 'Ryan Munz', title: 'Head Coach', xHandle: '@Ryan_Munz', tier: 1 },
  { school: 'UW-Platteville', name: 'Brent Allen', title: 'Offensive Coordinator/OL', xHandle: '@Allenbt29', tier: 2 },
  { school: 'UW-Platteville', name: 'Staff TBD', title: 'Defensive Line Coach', xHandle: null, tier: 2 },

  // --- UW-Stout ---
  { school: 'UW-Stout', name: 'Clayt Birmingham', title: 'Head Coach', xHandle: '@BlueDevil_HC', tier: 1 },
  { school: 'UW-Stout', name: 'Derek Branch', title: 'Offensive Line Coach', xHandle: '@CoachDeBo76', tier: 2 },
  { school: 'UW-Stout', name: 'Jake Schiff', title: 'Defensive Line Coach', xHandle: '@CoachJRSchiff', tier: 2 },

  // --- UW-River Falls ---
  { school: 'UW-River Falls', name: 'Jake Wissing', title: 'Interim Head Coach', xHandle: null, tier: 1 },
  { school: 'UW-River Falls', name: 'Kristian Crabb', title: 'OL/Run Game Coordinator', xHandle: null, tier: 2 },
  { school: 'UW-River Falls', name: 'Pete Range', title: 'Defensive Line Coach', xHandle: null, tier: 2 },
];

/** Get WIAC coaches filtered by school */
export function getWiacCoachesBySchool(school: string): WiacCoach[] {
  return wiacCoaches.filter((c) => c.school === school);
}

/** Get all WIAC head coaches */
export function getWiacHeadCoaches(): WiacCoach[] {
  return wiacCoaches.filter((c) => c.title.includes('Head Coach'));
}

/** Get WIAC position coaches relevant to Jacob (OL/DL) */
export function getWiacPositionCoaches(): WiacCoach[] {
  return wiacCoaches.filter((c) => c.title.includes('Line Coach'));
}

// --- Target Schools (D1/D2) ---

function summarizeSchool(school: TargetSchool): string {
  return `${school.name} (${school.division}, ${school.conference}) — ${school.priorityTier} | X: ${school.officialXHandle} | DM: ${school.dmTimeline} | Why: ${school.whyJacob}`;
}

export function getSchoolsByTier(tier: string): TargetSchool[] {
  return targetSchools.filter((s) => s.priorityTier === tier);
}

function summarizeWiacCoach(coach: WiacCoach): string {
  const x = coach.xHandle ? `X: ${coach.xHandle}` : 'X: none';
  return `${coach.school} — ${coach.name} (${coach.title}) | ${x}`;
}

export function getKnowledgeContext(): string {
  const lines: string[] = [];

  lines.push("=== COACH & SCHOOL DATABASE ===\n");
  lines.push(`Total target schools: ${targetSchools.length}\n`);

  const tiers = ["Tier 1", "Tier 2", "Tier 3"] as const;

  for (const tier of tiers) {
    const schools = targetSchools.filter((s) => s.priorityTier === tier);
    const tierLabel =
      tier === "Tier 1"
        ? "TIER 1 — Reach Programs (D1 FBS / Big Ten / Big 12)"
        : tier === "Tier 2"
          ? "TIER 2 — Target Programs (D1 FCS / MAC)"
          : "TIER 3 — Safety Programs (D2 / GLIAC / NSIC)";

    lines.push(`${tierLabel} (${schools.length} schools):`);
    for (const school of schools) {
      lines.push(`  - ${summarizeSchool(school)}`);
    }
    lines.push("");
  }

  // WIAC D3 coaching staff section
  lines.push("=== WIAC COACHING STAFFS (D3 — Wisconsin) ===\n");
  lines.push(`Total WIAC coaches tracked: ${wiacCoaches.length}\n`);

  const wiacSchools = [...new Set(wiacCoaches.map((c) => c.school))];
  for (const school of wiacSchools) {
    const staff = wiacCoaches.filter((c) => c.school === school);
    lines.push(`${school}:`);
    for (const coach of staff) {
      lines.push(`  - ${summarizeWiacCoach(coach)}`);
    }
    lines.push("");
  }

  lines.push("STRATEGY NOTES:");
  lines.push("  - Tier 1 (Reach): Follow + engage only. No DMs until junior year. Let content earn coach attention.");
  lines.push("  - Tier 2 (Target): Follow, engage 2-4 weeks, then DM. FCS/MAC coaches are active on X and respond.");
  lines.push("  - Tier 3 (Safety): DM immediately after establishing profile. D2 coaches respond quickly and often follow back.");
  lines.push("  - WIAC (D3): Local Wisconsin conference — high priority for Jacob. DM head coaches and OL/DL coaches directly.");
  lines.push("  - All tiers: Track coach likes/reposts as interest signals (Click Don't Type rule).");

  return lines.join("\n");
}
