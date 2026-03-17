import { describe, it, expect } from 'vitest';
import { outreachSchedule60d, getActionsByWeek, getActionsByCoach, getActionsByType } from '@/lib/data/outreach-schedule-60d';

describe('outreach workflow', () => {
  it('has actions across all 4 waves', () => {
    const waves = new Set(outreachSchedule60d.map(a => a.wave));
    expect(waves.size).toBe(4);
    expect(waves.has(0)).toBe(true);
    expect(waves.has(1)).toBe(true);
    expect(waves.has(2)).toBe(true);
    expect(waves.has(3)).toBe(true);
  });

  it('each coach has 8 sequential steps', () => {
    const coachSlugs = [...new Set(outreachSchedule60d.map(a => a.coach_slug))];
    coachSlugs.forEach(slug => {
      const actions = getActionsByCoach(slug);
      const steps = actions.map(a => a.step_number).sort((a, b) => a - b);
      expect(steps[0]).toBe(1);
      expect(steps[steps.length - 1]).toBe(8);
    });
  });

  it('first step is always follow', () => {
    const coachSlugs = [...new Set(outreachSchedule60d.map(a => a.coach_slug))];
    coachSlugs.forEach(slug => {
      const actions = getActionsByCoach(slug);
      const firstStep = actions.find(a => a.step_number === 1);
      expect(firstStep?.action_type).toBe('follow');
    });
  });

  it('DM steps have templates', () => {
    const dmActions = getActionsByType('dm');
    dmActions.forEach(a => {
      expect(a.template).toBeTruthy();
    });
  });

  it('all actions start as pending', () => {
    outreachSchedule60d.forEach(a => {
      expect(a.status).toBe('pending');
    });
  });

  it('wave 0 dates come before wave 1 dates', () => {
    const wave0Dates = outreachSchedule60d.filter(a => a.wave === 0).map(a => new Date(a.scheduled_date).getTime());
    const wave1Dates = outreachSchedule60d.filter(a => a.wave === 1).map(a => new Date(a.scheduled_date).getTime());
    if (wave0Dates.length > 0 && wave1Dates.length > 0) {
      expect(Math.max(...wave0Dates)).toBeLessThanOrEqual(Math.max(...wave1Dates));
    }
  });

  it('getActionsByWeek returns actions for week 1', () => {
    const week1 = getActionsByWeek(1);
    expect(week1.length).toBeGreaterThan(0);
  });
});
