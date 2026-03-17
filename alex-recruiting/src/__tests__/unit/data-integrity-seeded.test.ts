import { describe, it, expect } from 'vitest';
import { expandedTargetSchools } from '@/lib/data/target-schools-expanded';
import { competitorIntel } from '@/lib/rec/knowledge/competitor-intel';
import { contentCalendar30d } from '@/lib/data/content-calendar-30d';
import { outreachSchedule60d } from '@/lib/data/outreach-schedule-60d';
import { peerFollowTargets } from '@/lib/data/peer-follow-targets';
import { taskSchedule30d } from '@/lib/data/task-schedule-30d';
import { wiacCoaches } from '@/lib/rec/knowledge/coach-database';
import { followerGrowthTargets } from '@/lib/data/peer-follow-targets';

describe('data integrity', () => {
  it('all schools have unique slugs', () => {
    const slugs = expandedTargetSchools.map(s => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('all schools have exactly 2 coaches', () => {
    expandedTargetSchools.forEach(s => {
      expect(s.coaches.length).toBe(2);
    });
  });

  it('all coaches have name and title', () => {
    expandedTargetSchools.forEach(s => {
      s.coaches.forEach(c => {
        expect(c.name).toBeTruthy();
        expect(c.title).toBeTruthy();
      });
    });
  });

  it('outreach actions reference valid coach slugs from expanded schools', () => {
    const validSlugs = new Set(expandedTargetSchools.map(s => s.slug));
    outreachSchedule60d.forEach(a => {
      expect(validSlugs.has(a.coach_slug)).toBe(true);
    });
  });

  it('content calendar dates are within 30-day window', () => {
    const dates = contentCalendar30d.map(p => new Date(p.scheduled_time));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    const daySpan = (maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24);
    expect(daySpan).toBeLessThanOrEqual(30);
  });

  it('competitor profiles have no duplicate names', () => {
    const names = competitorIntel.map(c => c.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('follower growth targets are monotonically increasing', () => {
    const targets = followerGrowthTargets;
    expect(targets.week4).toBeGreaterThan(targets.baseline);
    expect(targets.week8).toBeGreaterThan(targets.week4);
    expect(targets.week12).toBeGreaterThan(targets.week8);
  });

  it('WIAC coaches have valid school names', () => {
    const validSchools = ['UW-Whitewater', 'UW-Oshkosh', 'UW-Eau Claire', 'UW-La Crosse', 'UW-Stevens Point', 'UW-Platteville', 'UW-Stout', 'UW-River Falls'];
    wiacCoaches.forEach(c => {
      expect(validSchools).toContain(c.school);
    });
  });

  it('all task dates are valid ISO date strings', () => {
    taskSchedule30d.forEach(t => {
      expect(new Date(t.date).toString()).not.toBe('Invalid Date');
    });
  });

  it('peer follow targets all have valid handles starting with @', () => {
    peerFollowTargets.forEach(t => {
      expect(t.handle).toMatch(/^@/);
    });
  });
});
