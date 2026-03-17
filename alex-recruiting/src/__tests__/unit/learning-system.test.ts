import { describe, it, expect } from 'vitest';
import { learningHistoryMock } from '@/lib/data/learning-history-mock';

describe('learning system', () => {
  it('has 4 weeks of history', () => {
    expect(learningHistoryMock.length).toBe(4);
  });

  it('weeks are sequential', () => {
    for (let i = 0; i < learningHistoryMock.length - 1; i++) {
      expect(learningHistoryMock[i].week_number).toBeLessThan(learningHistoryMock[i + 1].week_number);
    }
  });

  it('each week has what_worked, what_didnt, what_to_try arrays', () => {
    learningHistoryMock.forEach(w => {
      expect(Array.isArray(w.what_worked)).toBe(true);
      expect(Array.isArray(w.what_didnt)).toBe(true);
      expect(Array.isArray(w.what_to_try)).toBe(true);
      expect(w.what_worked.length).toBeGreaterThan(0);
      expect(w.what_didnt.length).toBeGreaterThan(0);
      expect(w.what_to_try.length).toBeGreaterThan(0);
    });
  });

  it('each week has metrics object with follower data', () => {
    learningHistoryMock.forEach(w => {
      expect(w.metrics).toBeDefined();
      expect(typeof w.metrics.followers).toBe('number');
    });
  });

  it('follower count trends upward across weeks', () => {
    for (let i = 0; i < learningHistoryMock.length - 1; i++) {
      expect(learningHistoryMock[i + 1].metrics.followers).toBeGreaterThanOrEqual(
        learningHistoryMock[i].metrics.followers
      );
    }
  });

  it('each week has valid date range', () => {
    learningHistoryMock.forEach(w => {
      expect(w.week_start).toBeTruthy();
      expect(w.week_end).toBeTruthy();
      const start = new Date(w.week_start);
      const end = new Date(w.week_end);
      expect(end.getTime()).toBeGreaterThan(start.getTime());
    });
  });

  it('generated_by is set', () => {
    learningHistoryMock.forEach(w => {
      expect(w.generated_by).toBeTruthy();
    });
  });
});
