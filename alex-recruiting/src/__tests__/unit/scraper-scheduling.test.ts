import { describe, it, expect } from 'vitest';
import { taskSchedule30d, getTasksByDate, getTasksByType } from '@/lib/data/task-schedule-30d';

describe('task scheduling', () => {
  it('covers 30 unique dates', () => {
    const uniqueDates = new Set(taskSchedule30d.map(t => t.date));
    expect(uniqueDates.size).toBe(30);
  });

  it('weekdays have at least 4 tasks', () => {
    const weekdayDates = [...new Set(taskSchedule30d.map(t => t.date))].filter(d => {
      const day = new Date(d).getDay();
      return day >= 1 && day <= 5;
    });
    weekdayDates.forEach(d => {
      expect(getTasksByDate(d).length).toBeGreaterThanOrEqual(4);
    });
  });

  it('has weekly review tasks', () => {
    const reviews = getTasksByType('weekly_review');
    expect(reviews.length).toBeGreaterThanOrEqual(3);
  });

  it('all tasks have valid time format HH:MM', () => {
    taskSchedule30d.forEach(t => {
      expect(t.time).toMatch(/^\d{2}:\d{2}$/);
    });
  });

  it('all tasks have priority 1-3', () => {
    taskSchedule30d.forEach(t => {
      expect(t.priority).toBeGreaterThanOrEqual(1);
      expect(t.priority).toBeLessThanOrEqual(3);
    });
  });

  it('all tasks start as pending', () => {
    taskSchedule30d.forEach(t => {
      expect(t.status).toBe('pending');
    });
  });

  it('has multiple task types', () => {
    const types = new Set(taskSchedule30d.map(t => t.type));
    expect(types.size).toBeGreaterThanOrEqual(4);
  });
});
