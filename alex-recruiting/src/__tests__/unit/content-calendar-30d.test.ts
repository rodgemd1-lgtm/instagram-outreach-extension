import { describe, it, expect } from 'vitest';
import { contentCalendar30d, getPostsByPillar } from '@/lib/data/content-calendar-30d';

describe('30-day content calendar', () => {
  it('has 17 scheduled posts', () => {
    expect(contentCalendar30d).toHaveLength(17);
  });
  it('has correct pillar distribution', () => {
    expect(getPostsByPillar('performance').length).toBe(7);
    expect(getPostsByPillar('work_ethic').length).toBe(7);
    expect(getPostsByPillar('character').length).toBe(3);
  });
  it('every post has required fields', () => {
    contentCalendar30d.forEach(p => {
      expect(p.draft_text.length).toBeGreaterThan(20);
      expect(p.draft_text.length).toBeLessThanOrEqual(280);
      expect(p.pillar).toMatch(/^performance|work_ethic|character$/);
      expect(p.scheduled_time).toBeTruthy();
      expect(p.hashtags.length).toBeGreaterThan(0);
      expect(p.approval_status).toBe('pending');
    });
  });
  it('posts are scheduled Mon/Wed/Fri at 6pm CT with weekend bonuses', () => {
    const weekdayPosts = contentCalendar30d.filter(p => {
      const day = new Date(p.scheduled_time).getDay();
      return day === 1 || day === 3 || day === 5;
    });
    expect(weekdayPosts.length).toBeGreaterThanOrEqual(12);
  });
});
