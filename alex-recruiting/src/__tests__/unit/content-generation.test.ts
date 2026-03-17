import { describe, it, expect } from 'vitest';
import { contentCalendar30d, getPostsByPillar } from '@/lib/data/content-calendar-30d';

describe('content generation', () => {
  it('has all 3 pillars represented', () => {
    const pillars = new Set(contentCalendar30d.map(p => p.pillar));
    expect(pillars.has('performance')).toBe(true);
    expect(pillars.has('work_ethic')).toBe(true);
    expect(pillars.has('character')).toBe(true);
  });

  it('performance pillar has ~40% of posts', () => {
    const performance = getPostsByPillar('performance');
    const ratio = performance.length / contentCalendar30d.length;
    expect(ratio).toBeGreaterThanOrEqual(0.3);
    expect(ratio).toBeLessThanOrEqual(0.5);
  });

  it('all posts have draft text', () => {
    contentCalendar30d.forEach(p => {
      expect(p.draft_text).toBeTruthy();
      expect(p.draft_text.length).toBeGreaterThan(10);
    });
  });

  it('all posts have hashtags', () => {
    contentCalendar30d.forEach(p => {
      expect(p.hashtags.length).toBeGreaterThan(0);
      p.hashtags.forEach(h => {
        expect(h).toMatch(/^#/);
      });
    });
  });

  it('posts are scheduled on different days', () => {
    const dates = contentCalendar30d.map(p => p.scheduled_time.split('T')[0]);
    const uniqueDates = new Set(dates);
    expect(uniqueDates.size).toBeGreaterThan(10);
  });

  it('all posts have approval_status set to draft', () => {
    contentCalendar30d.forEach(p => {
      expect(p.approval_status).toBe('draft');
    });
  });

  it('post text stays under 280 chars', () => {
    contentCalendar30d.forEach(p => {
      expect(p.draft_text.length).toBeLessThanOrEqual(280);
    });
  });
});
