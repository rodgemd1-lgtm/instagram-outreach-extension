export function parseTargetLimit(rawLimit: string | null): number {
  const parsed = Number.parseInt(rawLimit ?? "", 10);
  if (!Number.isFinite(parsed) || Number.isNaN(parsed)) {
    return 25;
  }

  return Math.max(1, Math.min(parsed, 50));
}
