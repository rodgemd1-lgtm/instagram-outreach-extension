import { describe, it, expect } from 'vitest';
import { contentCalendar30d, getPostsByPillar } from '@/lib/data/content-calendar-30d';

describe('rewritten content calendar quality', () => {
  const BANNED_PHRASES = [
    'DMs are open',
    'Check out my highlights',
    "Who's watching",
    'Built different',
    'Rise and grind',
    "Can't stop won't stop",
    'Nobody outworks',
    'No shortcuts',
    '#GrindSZN',
  ];

  it('no posts contain banned phrases', () => {
    contentCalendar30d.forEach(p => {
      BANNED_PHRASES.forEach(phrase => {
        expect(p.draft_text.toLowerCase()).not.toContain(phrase.toLowerCase());
      });
    });
  });

  it('all posts have panel_status field', () => {
    contentCalendar30d.forEach(p => {
      expect(p.panel_status).toBeTruthy();
      expect(['pending_panel', 'panel_approved', 'panel_rejected']).toContain(p.panel_status);
    });
  });

  it('all posts have post_formula field', () => {
    const validFormulas = ['spotlight_shift', 'curious_student', 'honest_progress', 'ambient_update', 'narrative_loop'];
    contentCalendar30d.forEach(p => {
      expect(validFormulas).toContain(p.post_formula);
    });
  });

  it('all posts have psychology_mechanism field', () => {
    contentCalendar30d.forEach(p => {
      expect(p.psychology_mechanism).toBeTruthy();
    });
  });

  it('all 5 post formulas are used at least once', () => {
    const formulas = new Set(contentCalendar30d.map(p => p.post_formula));
    expect(formulas.has('spotlight_shift')).toBe(true);
    expect(formulas.has('curious_student')).toBe(true);
    expect(formulas.has('honest_progress')).toBe(true);
    expect(formulas.has('ambient_update')).toBe(true);
    expect(formulas.has('narrative_loop')).toBe(true);
  });

  it('all posts are under 280 characters', () => {
    contentCalendar30d.forEach(p => {
      expect(p.draft_text.length).toBeLessThanOrEqual(280);
    });
  });

  it('all posts have panel_approved status', () => {
    contentCalendar30d.forEach(p => {
      expect(p.panel_status).toBe('panel_approved');
    });
  });

  it('posts use "we/our" language pattern (spot check)', () => {
    // At least 30% of posts should use team-first language
    const teamPosts = contentCalendar30d.filter(p =>
      p.draft_text.includes('we') ||
      p.draft_text.includes('our') ||
      p.draft_text.includes('We') ||
      p.draft_text.includes('Our')
    );
    expect(teamPosts.length).toBeGreaterThanOrEqual(5);
  });

  it('pillar distribution remains correct: 7 performance, 7 work_ethic, 3 character', () => {
    expect(getPostsByPillar('performance').length).toBe(7);
    expect(getPostsByPillar('work_ethic').length).toBe(7);
    expect(getPostsByPillar('character').length).toBe(3);
  });

  it('no motivational speaker tone (no exclamation-heavy posts)', () => {
    contentCalendar30d.forEach(p => {
      const exclamationCount = (p.draft_text.match(/!/g) || []).length;
      expect(exclamationCount).toBeLessThanOrEqual(1);
    });
  });

  it('posts reference specific names or details (not generic)', () => {
    // At least 60% of posts should mention a specific name, number, or school
    const specificPosts = contentCalendar30d.filter(p => {
      const text = p.draft_text;
      return /Coach \w+|@\w+|\d{3}|\d{2,}\s*(lb|lbs)|UW-|Pewaukee/.test(text);
    });
    expect(specificPosts.length).toBeGreaterThanOrEqual(10);
  });
});
