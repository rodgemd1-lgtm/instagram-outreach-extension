/**
 * Environment variable validation for Alex Recruiting.
 *
 * Call validateEnv() in any server-side context to confirm that all required
 * environment variables are present before attempting API calls that depend on them.
 */

const REQUIRED_VARS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "X_API_BEARER_TOKEN",
  "ANTHROPIC_API_KEY",
] as const;

export type RequiredVar = (typeof REQUIRED_VARS)[number];

export interface EnvValidationResult {
  valid: boolean;
  missing: string[];
}

/**
 * Validates that all required environment variables are present.
 * Returns { valid: true, missing: [] } if all are set, or
 * { valid: false, missing: [...] } listing the absent variable names.
 */
export function validateEnv(): EnvValidationResult {
  const missing = REQUIRED_VARS.filter((v) => !process.env[v]);
  return { valid: missing.length === 0, missing };
}
