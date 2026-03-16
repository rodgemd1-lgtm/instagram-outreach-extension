import { describe, it, expect } from 'vitest';
import {
  cn,
  formatDate,
  generateId,
  truncate,
  getEngagementRate,
  getPillarColor,
  getPillarLabel,
  getTierColor,
  getStatusColor,
} from '@/lib/utils';

describe('cn() — class name merger', () => {
  it('merges multiple class strings', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2');
  });

  it('handles conditional classes', () => {
    const result = cn('base', false && 'hidden', 'extra');
    expect(result).toBe('base extra');
  });

  it('resolves Tailwind conflicts (last wins)', () => {
    const result = cn('px-4', 'px-8');
    expect(result).toBe('px-8');
  });

  it('handles empty input', () => {
    expect(cn()).toBe('');
  });

  it('handles undefined and null inputs', () => {
    expect(cn('a', undefined, null, 'b')).toBe('a b');
  });
});

describe('getPillarLabel()', () => {
  it('returns "On-Field Performance" for "performance"', () => {
    expect(getPillarLabel('performance')).toBe('On-Field Performance');
  });

  it('returns "Work Ethic & Training" for "work_ethic"', () => {
    expect(getPillarLabel('work_ethic')).toBe('Work Ethic & Training');
  });

  it('returns "Character & Brand" for "character"', () => {
    expect(getPillarLabel('character')).toBe('Character & Brand');
  });

  it('returns the input string for unknown pillars', () => {
    expect(getPillarLabel('unknown_pillar')).toBe('unknown_pillar');
  });
});

describe('getPillarColor()', () => {
  it('returns red-tinted class for performance', () => {
    expect(getPillarColor('performance')).toContain('#ff000c');
  });

  it('returns gold-tinted class for work_ethic', () => {
    expect(getPillarColor('work_ethic')).toContain('#D4A853');
  });

  it('returns white-tinted class for character', () => {
    expect(getPillarColor('character')).toContain('white');
  });

  it('returns muted class for unknown pillar', () => {
    expect(getPillarColor('something_else')).toContain('white');
  });
});

describe('formatDate()', () => {
  it('formats a date string to short US format', () => {
    const result = formatDate('2025-01-15');
    // Date string parsing can shift by timezone; accept Jan 14 or Jan 15
    expect(result).toMatch(/Jan\s+1[45],\s+2025/);
  });

  it('formats a Date object', () => {
    const result = formatDate(new Date('2025-06-01'));
    // Month may vary by timezone but should contain 2025
    expect(result).toContain('2025');
  });
});

describe('generateId()', () => {
  it('returns a UUID v4 string', () => {
    const id = generateId();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    );
  });

  it('generates unique IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});

describe('truncate()', () => {
  it('truncates long strings and adds ellipsis', () => {
    expect(truncate('Hello World', 5)).toBe('Hello...');
  });

  it('returns original string if within length', () => {
    expect(truncate('Hi', 10)).toBe('Hi');
  });

  it('returns original string if exactly at length', () => {
    expect(truncate('Hello', 5)).toBe('Hello');
  });
});

describe('getEngagementRate()', () => {
  it('calculates engagement rate as percentage', () => {
    expect(getEngagementRate(1000, 50)).toBe(5);
  });

  it('returns 0 when impressions is 0', () => {
    expect(getEngagementRate(0, 50)).toBe(0);
  });

  it('rounds to 2 decimal places', () => {
    expect(getEngagementRate(300, 1)).toBe(0.33);
  });
});

describe('getTierColor()', () => {
  it('returns red classes for Tier 1', () => {
    expect(getTierColor('Tier 1')).toContain('#ff000c');
  });

  it('returns gold classes for Tier 2', () => {
    expect(getTierColor('Tier 2')).toContain('#D4A853');
  });

  it('returns muted classes for Tier 3', () => {
    expect(getTierColor('Tier 3')).toContain('white');
  });

  it('returns muted classes for unknown tier', () => {
    expect(getTierColor('Unknown')).toContain('white');
  });
});

describe('getStatusColor()', () => {
  it('returns amber for draft', () => {
    expect(getStatusColor('draft')).toContain('#F59E0B');
  });

  it('returns green for posted', () => {
    expect(getStatusColor('posted')).toContain('#22C55E');
  });

  it('returns red for rejected', () => {
    expect(getStatusColor('rejected')).toContain('#EF4444');
  });

  it('returns muted for unknown status', () => {
    expect(getStatusColor('anything')).toContain('white');
  });
});
