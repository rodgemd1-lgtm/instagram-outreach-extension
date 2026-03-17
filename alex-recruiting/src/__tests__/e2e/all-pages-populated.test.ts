import { describe, it, expect } from 'vitest';
import { expandedTargetSchools } from '@/lib/data/target-schools-expanded';
import { competitorIntel } from '@/lib/rec/knowledge/competitor-intel';
import { contentCalendar30d } from '@/lib/data/content-calendar-30d';
import { outreachSchedule60d } from '@/lib/data/outreach-schedule-60d';
import { peerFollowTargets } from '@/lib/data/peer-follow-targets';
import { taskSchedule30d } from '@/lib/data/task-schedule-30d';
import { wiacCoaches } from '@/lib/rec/knowledge/coach-database';

describe('all pages have backing data', () => {
  it('coaches page: 40 schools with 80 coaches', () => {
    expect(expandedTargetSchools.length).toBe(40);
    const totalCoaches = expandedTargetSchools.reduce((sum, s) => sum + s.coaches.length, 0);
    expect(totalCoaches).toBe(80);
  });
  it('coaches page: WIAC has 24 coaches', () => {
    expect(wiacCoaches.length).toBe(24);
  });
  it('competitors page: 15 profiles', () => {
    expect(competitorIntel.length).toBe(15);
  });
  it('content queue: 17 scheduled posts', () => {
    expect(contentCalendar30d.length).toBe(17);
  });
  it('outreach page: has outreach actions', () => {
    expect(outreachSchedule60d.length).toBeGreaterThan(0);
  });
  it('connections page: 200+ peer targets', () => {
    expect(peerFollowTargets.length).toBeGreaterThanOrEqual(200);
  });
  it('calendar page: 30 days of tasks', () => {
    const uniqueDates = new Set(taskSchedule30d.map(t => t.date));
    expect(uniqueDates.size).toBe(30);
  });
});
