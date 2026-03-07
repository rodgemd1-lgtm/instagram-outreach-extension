// Coach database knowledge base
// Wraps the target schools data and provides context for system prompt injection

import { targetSchools, type TargetSchool } from "@/lib/data/target-schools";

function summarizeSchool(school: TargetSchool): string {
  return `${school.name} (${school.division}, ${school.conference}) — ${school.priorityTier} | X: ${school.officialXHandle} | DM: ${school.dmTimeline} | Why: ${school.whyJacob}`;
}

export function getSchoolsByTier(tier: string): TargetSchool[] {
  return targetSchools.filter((s) => s.priorityTier === tier);
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

  lines.push("STRATEGY NOTES:");
  lines.push("  - Tier 1 (Reach): Follow + engage only. No DMs until junior year. Let content earn coach attention.");
  lines.push("  - Tier 2 (Target): Follow, engage 2-4 weeks, then DM. FCS/MAC coaches are active on X and respond.");
  lines.push("  - Tier 3 (Safety): DM immediately after establishing profile. D2 coaches respond quickly and often follow back.");
  lines.push("  - All tiers: Track coach likes/reposts as interest signals (Click Don't Type rule).");

  return lines.join("\n");
}
