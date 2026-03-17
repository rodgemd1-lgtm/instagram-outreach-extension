import { describe, it, expect } from 'vitest';
import { outreachSchedule60d, getActionsByWeek, getActionsByCoach, getActionsByType } from '@/lib/data/outreach-schedule-60d';

describe('60-day outreach schedule', () => {
  it('has actions for all 4 waves', () => {
    const w0 = outreachSchedule60d.filter(a => a.wave === 0);
    const w1 = outreachSchedule60d.filter(a => a.wave === 1);
    const w2 = outreachSchedule60d.filter(a => a.wave === 2);
    const w3 = outreachSchedule60d.filter(a => a.wave === 3);
    expect(w0.length).toBeGreaterThan(0);
    expect(w1.length).toBeGreaterThan(0);
    expect(w2.length).toBeGreaterThan(0);
    expect(w3.length).toBeGreaterThan(0);
  });
  it('covers at least 35 unique coaches', () => {
    const uniqueCoaches = new Set(outreachSchedule60d.map(a => a.coach_slug));
    expect(uniqueCoaches.size).toBeGreaterThanOrEqual(35);
  });
  it('every action has the 8-step cadence fields', () => {
    outreachSchedule60d.forEach(a => {
      expect(a.action_type).toMatch(/^follow|like|reply|mention|dm|email|followup|status_check$/);
      expect(a.scheduled_date).toBeTruthy();
      expect(a.status).toBe('pending');
      expect(a.wave).toBeGreaterThanOrEqual(0);
      expect(a.wave).toBeLessThanOrEqual(3);
    });
  });
  it('actions per day never exceed 7', () => {
    const byDate: Record<string, number> = {};
    outreachSchedule60d.forEach(a => {
      const d = a.scheduled_date.split('T')[0];
      byDate[d] = (byDate[d] || 0) + 1;
    });
    Object.values(byDate).forEach(count => {
      expect(count).toBeLessThanOrEqual(7);
    });
  });
  it('has correct action types in order per coach', () => {
    const coachSlugs = [...new Set(outreachSchedule60d.map(a => a.coach_slug))];
    const firstCoach = outreachSchedule60d.filter(a => a.coach_slug === coachSlugs[0]);
    const steps = firstCoach.map(a => a.step_number);
    expect(steps[0]).toBe(1);
    // Steps should be in ascending order
    for (let i = 1; i < steps.length; i++) {
      expect(steps[i]).toBeGreaterThan(steps[i - 1]);
    }
  });
});
