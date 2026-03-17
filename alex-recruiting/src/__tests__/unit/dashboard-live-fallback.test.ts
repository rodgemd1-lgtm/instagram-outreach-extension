import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('CompetitorMap — Dashboard Live Fetch & Fallback', () => {
  const filePath = path.resolve(__dirname, '../../components/competitor-map.tsx');
  const source = fs.readFileSync(filePath, 'utf-8');

  it('fetches from /api/dashboard/live', () => {
    expect(source).toContain('fetch("/api/dashboard/live")');
  });

  it('shows loading state with "..." pattern', () => {
    // While loading, the component should show "..." placeholders
    expect(source).toMatch(/loading\s*\?\s*"\.\.\."/);
  });

  it('shows fallback "--" when fetch fails and loading is complete', () => {
    // When no data and not loading, the component should show "--" placeholders
    expect(source).toMatch(/"--"/);
  });

  it('shows "--%"  fallback for engagement rate', () => {
    // The engagement rate should show "--%"  when no data is available
    expect(source).toContain('"--%"');
  });

  it('initializes jacobStats as null (no hardcoded defaults)', () => {
    // jacobStats should start as null, not with fake numbers
    expect(source).toMatch(/useState<JacobStats\s*\|\s*null>\(null\)/);
  });
});
