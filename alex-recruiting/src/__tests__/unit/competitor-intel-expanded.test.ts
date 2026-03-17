import { describe, it, expect } from 'vitest';
import { competitorIntel, getActiveCompetitors } from '@/lib/rec/knowledge/competitor-intel';

describe('expanded competitor intel', () => {
  it('has at least 15 competitors', () => {
    expect(competitorIntel.length).toBeGreaterThanOrEqual(15);
  });
  it('every competitor has required fields', () => {
    competitorIntel.forEach(c => {
      expect(c.name).toBeTruthy();
      expect(c.position).toMatch(/OL|DL|OG|OT|DT|DE|C|OC/);
      expect(c.classYear).toBe(2029);
      expect(c.school).toBeTruthy();
      expect(c.state).toBeTruthy();
      expect(c.height).toBeTruthy();
      expect(c.weight).toBeTruthy();
    });
  });
  it('includes Wisconsin and Midwest players', () => {
    const states = competitorIntel.map(c => c.state);
    expect(states.filter(s => s === 'Wisconsin').length).toBeGreaterThanOrEqual(5);
    expect(states.filter(s => ['Wisconsin','Minnesota','Illinois','Iowa','Michigan'].includes(s)).length).toBeGreaterThanOrEqual(12);
  });
  it('has active competitors with X handles', () => {
    expect(getActiveCompetitors().length).toBeGreaterThanOrEqual(8);
  });
});
