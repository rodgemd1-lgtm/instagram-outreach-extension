import { describe, it, expect } from 'vitest';
import { targetSchools, getSchoolsByTier, getSchoolById } from '@/lib/data/target-schools';
import { weeklyCalendar, getTodayEntry } from '@/lib/data/weekly-calendar';
import { hashtagStack, getHashtagsForPost } from '@/lib/data/hashtags';
import { postTemplates, dmTemplates, fillTemplate } from '@/lib/data/templates';

describe('Target Schools — Data Integrity', () => {
  it('has at least 10 schools', () => {
    expect(targetSchools.length).toBeGreaterThanOrEqual(10);
  });

  it('every school has required fields', () => {
    for (const school of targetSchools) {
      expect(school).toHaveProperty('id');
      expect(school).toHaveProperty('name');
      expect(school).toHaveProperty('conference');
      expect(school).toHaveProperty('division');
      expect(school).toHaveProperty('priorityTier');
      expect(typeof school.id).toBe('string');
      expect(typeof school.name).toBe('string');
      expect(typeof school.conference).toBe('string');
      expect(school.id.length).toBeGreaterThan(0);
      expect(school.name.length).toBeGreaterThan(0);
    }
  });

  it('every school has a valid priorityTier', () => {
    const validTiers = ['Tier 1', 'Tier 2', 'Tier 3'];
    for (const school of targetSchools) {
      expect(validTiers).toContain(school.priorityTier);
    }
  });

  it('every school has a valid division', () => {
    const validDivisions = ['D1 FBS', 'D1 FCS', 'D2', 'D3', 'NAIA'];
    for (const school of targetSchools) {
      expect(validDivisions).toContain(school.division);
    }
  });

  it('every school has whyJacob, olNeedSignal, dmTimeline', () => {
    for (const school of targetSchools) {
      expect(school.whyJacob).toBeTruthy();
      expect(school.olNeedSignal).toBeTruthy();
      expect(school.dmTimeline).toBeTruthy();
    }
  });

  it('every school has officialXHandle, rosterUrl, staffUrl', () => {
    for (const school of targetSchools) {
      expect(school.officialXHandle).toBeTruthy();
      expect(school.rosterUrl).toBeTruthy();
      expect(school.staffUrl).toBeTruthy();
    }
  });

  it('school IDs are unique', () => {
    const ids = targetSchools.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('getSchoolsByTier returns correct schools', () => {
    const tier1 = getSchoolsByTier('Tier 1');
    expect(tier1.length).toBeGreaterThan(0);
    tier1.forEach((s) => expect(s.priorityTier).toBe('Tier 1'));
  });

  it('getSchoolById returns the correct school', () => {
    const school = getSchoolById('wisconsin');
    expect(school).toBeDefined();
    expect(school!.name).toBe('University of Wisconsin');
  });

  it('getSchoolById returns undefined for missing ID', () => {
    expect(getSchoolById('nonexistent')).toBeUndefined();
  });
});

describe('Weekly Calendar — Data Integrity', () => {
  it('has exactly 7 entries (one per day)', () => {
    expect(weeklyCalendar).toHaveLength(7);
  });

  it('covers all days of the week', () => {
    const days = weeklyCalendar.map((e) => e.day);
    expect(days).toContain('Monday');
    expect(days).toContain('Tuesday');
    expect(days).toContain('Wednesday');
    expect(days).toContain('Thursday');
    expect(days).toContain('Friday');
    expect(days).toContain('Saturday');
    expect(days).toContain('Sunday');
  });

  it('every entry has required fields', () => {
    for (const entry of weeklyCalendar) {
      expect(entry).toHaveProperty('day');
      expect(entry).toHaveProperty('contentType');
      expect(entry).toHaveProperty('pillar');
      expect(entry).toHaveProperty('bestTime');
      expect(entry).toHaveProperty('notes');
      expect(typeof entry.day).toBe('string');
      expect(typeof entry.contentType).toBe('string');
      expect(typeof entry.pillar).toBe('string');
      expect(typeof entry.bestTime).toBe('string');
      expect(typeof entry.notes).toBe('string');
    }
  });

  it('every entry has a valid pillar', () => {
    const validPillars = ['performance', 'work_ethic', 'character'];
    for (const entry of weeklyCalendar) {
      expect(validPillars).toContain(entry.pillar);
    }
  });

  it('getTodayEntry returns a valid entry', () => {
    const today = getTodayEntry();
    expect(today).toHaveProperty('day');
    expect(today).toHaveProperty('contentType');
    expect(today).toHaveProperty('pillar');
  });
});

describe('Hashtag Library — Data Integrity', () => {
  it('has multiple categories', () => {
    expect(hashtagStack.length).toBeGreaterThanOrEqual(5);
  });

  it('every category has required fields', () => {
    for (const cat of hashtagStack) {
      expect(cat).toHaveProperty('category');
      expect(cat).toHaveProperty('hashtags');
      expect(cat).toHaveProperty('priority');
      expect(cat).toHaveProperty('notes');
      expect(typeof cat.category).toBe('string');
      expect(Array.isArray(cat.hashtags)).toBe(true);
      expect(cat.hashtags.length).toBeGreaterThan(0);
    }
  });

  it('every hashtag starts with #', () => {
    for (const cat of hashtagStack) {
      for (const tag of cat.hashtags) {
        expect(tag.startsWith('#')).toBe(true);
      }
    }
  });

  it('getHashtagsForPost returns max 5 hashtags', () => {
    const tags = getHashtagsForPost('performance');
    expect(tags.length).toBeLessThanOrEqual(5);
    expect(tags.length).toBeGreaterThan(0);
  });

  it('getHashtagsForPost includes core recruiting tags', () => {
    const tags = getHashtagsForPost('performance');
    expect(tags.some((t) => t.includes('Recruit') || t.includes('Recruiting'))).toBe(true);
  });
});

describe('Templates — Data Integrity', () => {
  it('postTemplates has expected template keys', () => {
    expect(postTemplates).toHaveProperty('pinned');
    expect(postTemplates).toHaveProperty('highlightClip');
    expect(postTemplates).toHaveProperty('trainingPost');
    expect(postTemplates).toHaveProperty('characterPost');
    expect(postTemplates).toHaveProperty('gameDayPost');
    expect(postTemplates).toHaveProperty('campAnnouncement');
    expect(postTemplates).toHaveProperty('milestonePost');
  });

  it('every post template has name and template string', () => {
    for (const [, tmpl] of Object.entries(postTemplates)) {
      expect(tmpl).toHaveProperty('name');
      expect(tmpl).toHaveProperty('template');
      expect(typeof tmpl.name).toBe('string');
      expect(typeof tmpl.template).toBe('string');
      expect(tmpl.template.length).toBeGreaterThan(0);
    }
  });

  it('dmTemplates has expected keys', () => {
    expect(dmTemplates).toHaveProperty('intro');
    expect(dmTemplates).toHaveProperty('postCamp');
    expect(dmTemplates).toHaveProperty('postFollow');
  });

  it('every DM template has name, template, and useCase', () => {
    for (const [, tmpl] of Object.entries(dmTemplates)) {
      expect(tmpl).toHaveProperty('name');
      expect(tmpl).toHaveProperty('template');
      expect(tmpl).toHaveProperty('useCase');
      expect(typeof tmpl.template).toBe('string');
    }
  });

  it('fillTemplate replaces all variables', () => {
    const result = fillTemplate('{A} and {B}', { A: 'hello', B: 'world' });
    expect(result).toBe('hello and world');
  });

  it('fillTemplate replaces multiple occurrences of same variable', () => {
    const result = fillTemplate('{X} or {X}', { X: 'yes' });
    expect(result).toBe('yes or yes');
  });
});
