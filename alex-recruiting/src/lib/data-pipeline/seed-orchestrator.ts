/**
 * Master Seed Orchestrator
 *
 * Runs all seed-* endpoints in sequence to fully populate the system.
 * Each phase depends on data from previous phases (coaches → intelligence
 * → content → outreach → peers → tasks → learnings).
 */

export interface SeedPhaseResult {
  phase: string;
  endpoint: string;
  status: number;
  data: Record<string, unknown>;
  durationMs: number;
}

export async function seedAll(baseUrl: string, cronSecret: string): Promise<SeedPhaseResult[]> {
  const phases = [
    { name: 'coaches', endpoint: '/api/data-pipeline/seed-coaches-expanded' },
    { name: 'intelligence', endpoint: '/api/data-pipeline/seed-intelligence' },
    { name: 'content', endpoint: '/api/data-pipeline/seed-content' },
    { name: 'outreach', endpoint: '/api/data-pipeline/seed-outreach' },
    { name: 'peers', endpoint: '/api/data-pipeline/seed-peers' },
    { name: 'tasks', endpoint: '/api/data-pipeline/seed-tasks' },
    { name: 'learnings', endpoint: '/api/data-pipeline/seed-learnings' },
  ];

  const results: SeedPhaseResult[] = [];

  for (const phase of phases) {
    const start = Date.now();
    try {
      const res = await fetch(`${baseUrl}${phase.endpoint}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${cronSecret}` },
      });
      const data = await res.json();
      results.push({
        phase: phase.name,
        endpoint: phase.endpoint,
        status: res.status,
        data,
        durationMs: Date.now() - start,
      });
    } catch (error) {
      results.push({
        phase: phase.name,
        endpoint: phase.endpoint,
        status: 500,
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
        durationMs: Date.now() - start,
      });
    }
  }

  return results;
}
