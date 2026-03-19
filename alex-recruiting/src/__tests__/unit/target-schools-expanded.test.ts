import { describe, it, expect } from 'vitest';
import { expandedTargetSchools, getSchoolsByTier, getSchoolsByConference } from '@/lib/data/target-schools-expanded';

describe('expandedTargetSchools', () => {
  it('has exactly 40 schools', () => {
    expect(expandedTargetSchools).toHaveLength(40);
  });
  it('has 8 Tier 1 WIAC schools', () => {
    expect(getSchoolsByTier(1)).toHaveLength(8);
    expect(getSchoolsByTier(1).every(s => s.conference === 'WIAC')).toBe(true);
  });
  it('has 12 Tier 2 Midwest D3 schools', () => {
    expect(getSchoolsByTier(2)).toHaveLength(12);
  });
  it('has 12 Tier 3 D2 schools', () => {
    expect(getSchoolsByTier(3)).toHaveLength(12);
  });
  it('has 8 Tier 4 FCS schools', () => {
    expect(getSchoolsByTier(4)).toHaveLength(8);
  });
  it('every school has required fields', () => {
    expandedTargetSchools.forEach(s => {
      expect(s.name).toBeTruthy();
      expect(s.slug).toBeTruthy();
      expect(s.conference).toBeTruthy();
      expect(s.division).toMatch(/^D[123]|FCS$/);
      expect(s.tier).toBeGreaterThanOrEqual(1);
      expect(s.tier).toBeLessThanOrEqual(4);
      expect(s.state).toHaveLength(2);
      expect(s.coaches.length).toBeGreaterThanOrEqual(1);
      expect(s.coaches.length).toBeLessThanOrEqual(4);
    });
  });
});
