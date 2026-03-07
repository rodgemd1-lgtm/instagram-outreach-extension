import { describe, it, expect } from 'vitest';

describe('Smoke Tests — Core App Functionality', () => {
  describe('Utility functions', () => {
    it('generateId returns a valid UUID string', async () => {
      const { generateId } = await import('@/lib/utils');
      const id = generateId();
      expect(typeof id).toBe('string');
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
      );
    });

    it('cn utility merges class names', async () => {
      const { cn } = await import('@/lib/utils');
      const result = cn('px-4', 'py-2');
      expect(typeof result).toBe('string');
      expect(result).toContain('px-4');
      expect(result).toContain('py-2');
    });

    it('fillTemplate renders variables into templates', async () => {
      const { fillTemplate } = await import('@/lib/data/templates');
      const result = fillTemplate('Hello {NAME}, welcome to {PLACE}!', {
        NAME: 'Jacob',
        PLACE: 'Wisconsin',
      });
      expect(result).toBe('Hello Jacob, welcome to Wisconsin!');
    });
  });

  describe('Data file exports', () => {
    it('target-schools exports an array of schools', async () => {
      const { targetSchools } = await import('@/lib/data/target-schools');
      expect(Array.isArray(targetSchools)).toBe(true);
      expect(targetSchools.length).toBeGreaterThan(0);
    });

    it('weekly-calendar exports an array of 7 entries', async () => {
      const { weeklyCalendar } = await import('@/lib/data/weekly-calendar');
      expect(Array.isArray(weeklyCalendar)).toBe(true);
      expect(weeklyCalendar).toHaveLength(7);
    });

    it('hashtags exports hashtagStack array', async () => {
      const { hashtagStack } = await import('@/lib/data/hashtags');
      expect(Array.isArray(hashtagStack)).toBe(true);
      expect(hashtagStack.length).toBeGreaterThan(0);
    });

    it('templates exports postTemplates and dmTemplates', async () => {
      const { postTemplates, dmTemplates } = await import(
        '@/lib/data/templates'
      );
      expect(postTemplates).toBeDefined();
      expect(dmTemplates).toBeDefined();
      expect(typeof postTemplates).toBe('object');
      expect(typeof dmTemplates).toBe('object');
    });
  });

  describe('Type definitions', () => {
    it('types module exports without errors', async () => {
      const types = await import('@/lib/types');
      expect(types).toBeDefined();
    });

    it('recruiting-intelligence types module exports without errors', async () => {
      const types = await import('@/lib/types/recruiting-intelligence');
      expect(types).toBeDefined();
    });
  });
});
