export function generateId(): string {
  return crypto.randomUUID();
}

export function randomDelay(min: number, max: number): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

export function addJitter(baseDelay: number, factor = 0.2): number {
  const jitter = baseDelay * factor;
  return baseDelay + (Math.random() * 2 - 1) * jitter;
}

export function gaussianRandom(mean: number, stddev: number): number {
  // Box-Muller transform
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return Math.round(mean + z * stddev);
}

export function extractFirstName(fullName: string | null): string | null {
  if (!fullName) return null;
  return fullName.trim().split(/\s+/)[0] || null;
}

export function getNextMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime();
}

export function isWithinHours(start: number, end: number): boolean {
  const hour = new Date().getHours();
  if (start <= end) {
    return hour >= start && hour < end;
  }
  // Handles overnight ranges like 22-6
  return hour >= start || hour < end;
}
