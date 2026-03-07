// Agent Token Budget Tracker — In-memory daily and monthly caps
//
// Prevents any single agent from runaway Claude API spend. Each agent gets
// a configurable daily and monthly token limit. When the budget is exceeded,
// the agent run is skipped and a warning is logged.
//
// In-memory storage keyed by "agentId:YYYY-MM-DD" (daily) and
// "agentId:YYYY-MM" (monthly). Cold-start resets are safe because they
// only lose consumption history, which causes under-counting (not over).

// -----------------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------------

/** Default daily token budget per agent (100k tokens). */
const DEFAULT_DAILY_LIMIT = 100_000;

/** Default monthly token budget per agent (2M tokens). */
const DEFAULT_MONTHLY_LIMIT = 2_000_000;

/** Optional per-agent overrides. Set via `configureBudget()`. */
const agentOverrides = new Map<string, { dailyLimit?: number; monthlyLimit?: number }>();

// -----------------------------------------------------------------------
// In-memory usage storage
// -----------------------------------------------------------------------

/** Maps "agentId:YYYY-MM-DD" -> tokens used */
const dailyUsage = new Map<string, number>();

/** Maps "agentId:YYYY-MM" -> tokens used */
const monthlyUsage = new Map<string, number>();

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------

function todayKey(agentId: string): string {
  const d = new Date();
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${agentId}:${yyyy}-${mm}-${dd}`;
}

function monthKey(agentId: string): string {
  const d = new Date();
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${agentId}:${yyyy}-${mm}`;
}

function getDailyLimit(agentId: string): number {
  return agentOverrides.get(agentId)?.dailyLimit ?? DEFAULT_DAILY_LIMIT;
}

function getMonthlyLimit(agentId: string): number {
  return agentOverrides.get(agentId)?.monthlyLimit ?? DEFAULT_MONTHLY_LIMIT;
}

// -----------------------------------------------------------------------
// Public API
// -----------------------------------------------------------------------

export interface BudgetCheckResult {
  allowed: boolean;
  daily: {
    used: number;
    limit: number;
    remaining: number;
  };
  monthly: {
    used: number;
    limit: number;
    remaining: number;
  };
  /** Human-readable reason when `allowed` is false. */
  reason?: string;
}

/**
 * Check whether the agent has remaining budget for today and this month.
 */
export function checkBudget(agentId: string): BudgetCheckResult {
  const dKey = todayKey(agentId);
  const mKey = monthKey(agentId);

  const dailyUsed = dailyUsage.get(dKey) ?? 0;
  const monthlyUsed = monthlyUsage.get(mKey) ?? 0;

  const dLimit = getDailyLimit(agentId);
  const mLimit = getMonthlyLimit(agentId);

  const dailyRemaining = Math.max(dLimit - dailyUsed, 0);
  const monthlyRemaining = Math.max(mLimit - monthlyUsed, 0);

  let allowed = true;
  let reason: string | undefined;

  if (dailyUsed >= dLimit) {
    allowed = false;
    reason = `Daily token budget exhausted for agent "${agentId}": ${dailyUsed.toLocaleString()}/${dLimit.toLocaleString()} tokens used today.`;
  } else if (monthlyUsed >= mLimit) {
    allowed = false;
    reason = `Monthly token budget exhausted for agent "${agentId}": ${monthlyUsed.toLocaleString()}/${mLimit.toLocaleString()} tokens used this month.`;
  }

  return {
    allowed,
    daily: { used: dailyUsed, limit: dLimit, remaining: dailyRemaining },
    monthly: { used: monthlyUsed, limit: mLimit, remaining: monthlyRemaining },
    reason,
  };
}

/**
 * Record token usage for an agent after a successful Claude API call.
 * Accepts the total token count from the API response (input + output).
 */
export function recordUsage(agentId: string, tokens: number): void {
  if (tokens <= 0) return;

  const dKey = todayKey(agentId);
  const mKey = monthKey(agentId);

  dailyUsage.set(dKey, (dailyUsage.get(dKey) ?? 0) + tokens);
  monthlyUsage.set(mKey, (monthlyUsage.get(mKey) ?? 0) + tokens);
}

/**
 * Configure custom budget limits for a specific agent.
 * Pass `undefined` for a field to keep the default.
 */
export function configureBudget(
  agentId: string,
  limits: { dailyLimit?: number; monthlyLimit?: number }
): void {
  agentOverrides.set(agentId, limits);
}

/**
 * Get a snapshot of current usage for all tracked agents.
 * Useful for dashboard / monitoring endpoints.
 */
export function getUsageSummary(): Record<string, { daily: number; monthly: number }> {
  const summary: Record<string, { daily: number; monthly: number }> = {};

  for (const [key, used] of dailyUsage.entries()) {
    const agentId = key.split(":")[0];
    if (!summary[agentId]) {
      summary[agentId] = { daily: 0, monthly: 0 };
    }
    // Only count today's entry
    if (key === todayKey(agentId)) {
      summary[agentId].daily = used;
    }
  }

  for (const [key, used] of monthlyUsage.entries()) {
    const agentId = key.split(":")[0];
    if (!summary[agentId]) {
      summary[agentId] = { daily: 0, monthly: 0 };
    }
    if (key === monthKey(agentId)) {
      summary[agentId].monthly = used;
    }
  }

  return summary;
}

// -----------------------------------------------------------------------
// Testing helper
// -----------------------------------------------------------------------

/** Reset all in-memory budget tracking. Useful in tests. */
export function resetBudgets(): void {
  dailyUsage.clear();
  monthlyUsage.clear();
  agentOverrides.clear();
}
