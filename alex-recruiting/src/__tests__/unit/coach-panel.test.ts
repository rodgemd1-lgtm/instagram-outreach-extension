import { describe, it, expect } from 'vitest';
import { panelCoachesData } from '@/lib/data/panel-coaches';
import { panelSurveysSeed } from '@/lib/data/panel-surveys-seed';
import { ALEX_SYSTEM_PROMPT } from '@/lib/integrations/anthropic';
import { createPostRecord } from '@/lib/alex/content-engine';

// ---------------------------------------------------------------------------
// 1. Panel Coaches Data
// ---------------------------------------------------------------------------
describe('Panel Coaches Data', () => {
  it('should have at least 5 panel coaches', () => {
    expect(panelCoachesData.length).toBeGreaterThanOrEqual(5);
  });

  it('should have exactly 8 panel coaches', () => {
    expect(panelCoachesData.length).toBe(8);
  });

  it('each coach should have name, school, division, position_coached, status', () => {
    for (const coach of panelCoachesData) {
      expect(coach.name).toBeTruthy();
      expect(typeof coach.name).toBe('string');
      expect(coach.school).toBeTruthy();
      expect(typeof coach.school).toBe('string');
      expect(coach.division).toBeTruthy();
      expect(coach.position_coached).toBeTruthy();
      expect(typeof coach.position_coached).toBe('string');
      expect(coach.status).toBeTruthy();
    }
  });

  it('should include coaches from at least 2 different divisions (D3, D2, FCS)', () => {
    const divisions = new Set(panelCoachesData.map((c) => c.division));
    expect(divisions.size).toBeGreaterThanOrEqual(2);
  });

  it('should include coaches from all 3 divisions: D3, D2, and FCS', () => {
    const divisions = new Set(panelCoachesData.map((c) => c.division));
    expect(divisions.has('D3')).toBe(true);
    expect(divisions.has('D2')).toBe(true);
    expect(divisions.has('FCS')).toBe(true);
  });

  it('should have 4 D3, 2 D2, and 2 FCS coaches', () => {
    const d3 = panelCoachesData.filter((c) => c.division === 'D3');
    const d2 = panelCoachesData.filter((c) => c.division === 'D2');
    const fcs = panelCoachesData.filter((c) => c.division === 'FCS');
    expect(d3.length).toBe(4);
    expect(d2.length).toBe(2);
    expect(fcs.length).toBe(2);
  });

  it('all coaches should have status "active", "completed", or "invited"', () => {
    const validStatuses = ['active', 'completed', 'invited'];
    for (const coach of panelCoachesData) {
      expect(validStatuses).toContain(coach.status);
    }
  });

  it('all coaches should have unique names', () => {
    const names = panelCoachesData.map((c) => c.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('all coaches should have unique schools', () => {
    const schools = panelCoachesData.map((c) => c.school);
    expect(new Set(schools).size).toBe(schools.length);
  });

  it('each coach should have a coaching_philosophy longer than 50 characters', () => {
    for (const coach of panelCoachesData) {
      expect(coach.coaching_philosophy.length).toBeGreaterThan(50);
    }
  });

  it('each coach should have at least 2 items in what_they_look_for', () => {
    for (const coach of panelCoachesData) {
      expect(coach.what_they_look_for.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('all what_they_look_for entries should be non-empty strings', () => {
    for (const coach of panelCoachesData) {
      for (const item of coach.what_they_look_for) {
        expect(typeof item).toBe('string');
        expect(item.length).toBeGreaterThan(0);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// 2. Panel Surveys Data
// ---------------------------------------------------------------------------
describe('Panel Surveys Data', () => {
  it('should have at least 10 survey responses', () => {
    expect(panelSurveysSeed.length).toBeGreaterThanOrEqual(10);
  });

  it('should have at least 20 survey responses for comprehensive coverage', () => {
    expect(panelSurveysSeed.length).toBeGreaterThanOrEqual(20);
  });

  it('each survey should have panel coach name, would_recruit, what_convinced, what_almost_made_leave', () => {
    for (const survey of panelSurveysSeed) {
      expect(survey.coach_name).toBeTruthy();
      expect(typeof survey.coach_name).toBe('string');
      expect(survey.would_recruit).toBeTruthy();
      expect(survey.what_convinced).toBeTruthy();
      expect(typeof survey.what_convinced).toBe('string');
      expect(survey.what_almost_made_leave).toBeTruthy();
      expect(typeof survey.what_almost_made_leave).toBe('string');
    }
  });

  it('each survey should have a valid post_id', () => {
    for (const survey of panelSurveysSeed) {
      expect(survey.post_id).toBeTruthy();
      expect(survey.post_id).toMatch(/^post-\d{3}$/);
    }
  });

  it('would_recruit should be one of: "yes", "maybe", "no"', () => {
    for (const survey of panelSurveysSeed) {
      expect(['yes', 'maybe', 'no']).toContain(survey.would_recruit);
    }
  });

  it('at least 60% of responses should be "yes" or "maybe"', () => {
    const positiveCount = panelSurveysSeed.filter(
      (s) => s.would_recruit === 'yes' || s.would_recruit === 'maybe'
    ).length;
    const ratio = positiveCount / panelSurveysSeed.length;
    expect(ratio).toBeGreaterThanOrEqual(0.6);
  });

  it('should have a mix of yes, maybe, and no responses', () => {
    const responses = new Set(panelSurveysSeed.map((s) => s.would_recruit));
    expect(responses.size).toBeGreaterThanOrEqual(2);
  });

  it('all surveys should reference valid panel coaches', () => {
    const coachNames = new Set(panelCoachesData.map((c) => c.name));
    for (const survey of panelSurveysSeed) {
      expect(coachNames.has(survey.coach_name)).toBe(true);
    }
  });

  it('every panel coach should have at least 2 reviews', () => {
    const reviewCounts = new Map<string, number>();
    for (const survey of panelSurveysSeed) {
      reviewCounts.set(survey.coach_name, (reviewCounts.get(survey.coach_name) ?? 0) + 1);
    }
    for (const coach of panelCoachesData) {
      expect(reviewCounts.get(coach.name) ?? 0).toBeGreaterThanOrEqual(2);
    }
  });

  it('comparison scores should be between 1 and 10', () => {
    for (const survey of panelSurveysSeed) {
      expect(survey.comparison_score).toBeGreaterThanOrEqual(1);
      expect(survey.comparison_score).toBeLessThanOrEqual(10);
    }
  });

  it('all surveys should have substantive feedback (>10 chars)', () => {
    for (const survey of panelSurveysSeed) {
      expect(survey.what_convinced.length).toBeGreaterThan(10);
      expect(survey.specific_feedback.length).toBeGreaterThan(10);
    }
  });

  it('"no" responses should have critical what_almost_made_leave feedback', () => {
    const noResponses = panelSurveysSeed.filter((s) => s.would_recruit === 'no');
    for (const survey of noResponses) {
      expect(survey.what_almost_made_leave.length).toBeGreaterThan(20);
    }
  });
});

// ---------------------------------------------------------------------------
// 3. Coach Panel in Doctrine
// ---------------------------------------------------------------------------
describe('Coach Panel in Doctrine', () => {
  it('ALEX_SYSTEM_PROMPT should contain "Coach Panel" or "panel"', () => {
    const hasCoachPanel = ALEX_SYSTEM_PROMPT.includes('Coach Panel') || ALEX_SYSTEM_PROMPT.includes('panel');
    expect(hasCoachPanel).toBe(true);
  });

  it('ALEX_SYSTEM_PROMPT should contain "Coach Panel" specifically', () => {
    expect(ALEX_SYSTEM_PROMPT).toContain('Coach Panel');
  });

  it('ALEX_SYSTEM_PROMPT should mention "pending_panel"', () => {
    expect(ALEX_SYSTEM_PROMPT).toContain('pending_panel');
  });

  it('ALEX_SYSTEM_PROMPT should mention panel review requirement', () => {
    expect(ALEX_SYSTEM_PROMPT.toLowerCase()).toContain('panel review');
  });

  it('ALEX_SYSTEM_PROMPT should mention panel approval before publishing', () => {
    expect(ALEX_SYSTEM_PROMPT.toLowerCase()).toContain('panel approval');
  });

  it('ALEX_SYSTEM_PROMPT should reference coach feedback signals', () => {
    const hasWouldRecruit =
      ALEX_SYSTEM_PROMPT.toLowerCase().includes('would they recruit') ||
      ALEX_SYSTEM_PROMPT.toLowerCase().includes('recruit based on');
    expect(hasWouldRecruit).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. Trey's Persona — Coach Panel Integration
// ---------------------------------------------------------------------------
describe("Trey's Persona — Coach Panel Integration", () => {
  // We need to dynamically import to avoid issues with the knowledge base functions
  // that may have side effects. Instead, read the domain instructions from personas.
  // Since we already know the content from reading the file, we test the exported function.

  it('Trey persona should contain COACH PANEL INTEGRATION section', async () => {
    const { getPersonaPrompt } = await import('@/lib/rec/team/personas');
    const treyPrompt = getPersonaPrompt('trey');
    expect(treyPrompt).toContain('COACH PANEL INTEGRATION');
  });

  it('Trey persona should mention panel_approved status tag', async () => {
    const { getPersonaPrompt } = await import('@/lib/rec/team/personas');
    const treyPrompt = getPersonaPrompt('trey');
    expect(treyPrompt).toContain('panel_approved');
  });

  it('Trey persona should mention pending_panel status tag', async () => {
    const { getPersonaPrompt } = await import('@/lib/rec/team/personas');
    const treyPrompt = getPersonaPrompt('trey');
    expect(treyPrompt).toContain('pending_panel');
  });

  it('Trey persona should require minimum 2 panel coach approvals', async () => {
    const { getPersonaPrompt } = await import('@/lib/rec/team/personas');
    const treyPrompt = getPersonaPrompt('trey');
    expect(treyPrompt).toContain('Minimum 2 panel coach approvals');
  });

  it('Trey persona should mention SPOTLIGHT SHIFT CHECK', async () => {
    const { getPersonaPrompt } = await import('@/lib/rec/team/personas');
    const treyPrompt = getPersonaPrompt('trey');
    expect(treyPrompt).toContain('SPOTLIGHT SHIFT CHECK');
  });

  it('Trey persona should list all 5 post formulas', async () => {
    const { getPersonaPrompt } = await import('@/lib/rec/team/personas');
    const treyPrompt = getPersonaPrompt('trey');
    expect(treyPrompt).toContain('Spotlight Shift');
    expect(treyPrompt).toContain('Curious Student');
    expect(treyPrompt).toContain('Honest Progress');
    expect(treyPrompt).toContain('Ambient Update');
    expect(treyPrompt).toContain('Narrative Loop');
  });
});

// ---------------------------------------------------------------------------
// 5. Content Engine Integration
// ---------------------------------------------------------------------------
describe('Content Engine — Coach Panel Integration', () => {
  it('createPostRecord should set status to "pending_panel"', () => {
    const draft = {
      content: 'Test post content for panel review',
      pillar: 'performance' as const,
      hashtags: ['#test'],
      bestTime: '6:00 PM CT',
      mediaSuggestion: 'Test media',
      templateName: 'test',
    };
    const record = createPostRecord(draft, '2026-03-18T23:00:00Z');
    expect(record.status).toBe('pending_panel');
  });

  it('createPostRecord should NOT set status to "draft"', () => {
    const draft = {
      content: 'Another test post',
      pillar: 'work_ethic' as const,
      hashtags: ['#test'],
      bestTime: '7:00 PM CT',
      mediaSuggestion: 'Test media',
      templateName: 'test',
    };
    const record = createPostRecord(draft, '2026-03-20T23:00:00Z');
    expect(record.status).not.toBe('draft');
  });

  it('createPostRecord should include all required fields', () => {
    const draft = {
      content: 'Full field test',
      pillar: 'character' as const,
      hashtags: ['#TeamFirst'],
      bestTime: '6:00 PM CT',
      mediaSuggestion: 'Photo',
      templateName: 'characterPost',
    };
    const record = createPostRecord(draft, '2026-03-25T23:00:00Z');
    expect(record).toHaveProperty('content');
    expect(record).toHaveProperty('pillar');
    expect(record).toHaveProperty('hashtags');
    expect(record).toHaveProperty('status');
    expect(record).toHaveProperty('scheduledFor');
    expect(record).toHaveProperty('createdAt');
    expect(record).toHaveProperty('updatedAt');
    expect(record).toHaveProperty('impressions');
    expect(record).toHaveProperty('engagements');
    expect(record).toHaveProperty('engagementRate');
  });

  it('createPostRecord should set initial engagement metrics to 0', () => {
    const draft = {
      content: 'Metrics test',
      pillar: 'performance' as const,
      hashtags: ['#test'],
      bestTime: '6:00 PM CT',
      mediaSuggestion: 'Video',
      templateName: 'test',
    };
    const record = createPostRecord(draft, '2026-03-18T23:00:00Z');
    expect(record.impressions).toBe(0);
    expect(record.engagements).toBe(0);
    expect(record.engagementRate).toBe(0);
  });

  it('createPostRecord should set valid ISO 8601 timestamps for createdAt and updatedAt', () => {
    const draft = {
      content: 'Timestamp test',
      pillar: 'work_ethic' as const,
      hashtags: ['#test'],
      bestTime: '6:00 PM CT',
      mediaSuggestion: 'Photo',
      templateName: 'test',
    };
    const record = createPostRecord(draft, '2026-03-20T23:00:00Z');
    expect(() => new Date(record.createdAt)).not.toThrow();
    expect(() => new Date(record.updatedAt)).not.toThrow();
    expect(new Date(record.createdAt).toISOString()).toBe(record.createdAt);
    expect(new Date(record.updatedAt).toISOString()).toBe(record.updatedAt);
  });
});
