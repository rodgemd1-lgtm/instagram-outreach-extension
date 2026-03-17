import { describe, it, expect } from 'vitest';
import { taskSchedule30d, getTasksByDate, getTasksByType } from '@/lib/data/task-schedule-30d';

describe('30-day task schedule', () => {
  it('has tasks for every day in the 30-day period', () => {
    const uniqueDates = new Set(taskSchedule30d.map(t => t.date));
    expect(uniqueDates.size).toBe(30);
  });
  it('weekdays have at least 4 tasks each', () => {
    const weekdayTasks = taskSchedule30d.filter(t => {
      const day = new Date(t.date).getDay();
      return day >= 1 && day <= 5;
    });
    const weekdayDates = [...new Set(weekdayTasks.map(t => t.date))];
    weekdayDates.forEach(d => {
      expect(getTasksByDate(d).length).toBeGreaterThanOrEqual(4);
    });
  });
  it('has weekly review tasks on Sundays', () => {
    const sundayTasks = taskSchedule30d.filter(t => {
      return new Date(t.date).getDay() === 0;
    });
    const reviewTasks = sundayTasks.filter(t => t.type === 'weekly_review');
    expect(reviewTasks.length).toBeGreaterThanOrEqual(4);
  });
  it('every task has required fields', () => {
    taskSchedule30d.forEach(t => {
      expect(t.title).toBeTruthy();
      expect(t.description).toBeTruthy();
      expect(t.date).toBeTruthy();
      expect(t.time).toMatch(/^\d{2}:\d{2}$/);
      expect(t.type).toBeTruthy();
      expect(t.status).toBe('pending');
      expect(t.priority).toBeGreaterThanOrEqual(1);
      expect(t.priority).toBeLessThanOrEqual(3);
    });
  });
  it('has correct task types', () => {
    const types = new Set(taskSchedule30d.map(t => t.type));
    expect(types.has('engagement')).toBe(true);
    expect(types.has('content_post')).toBe(true);
    expect(types.has('weekly_review')).toBe(true);
  });
});
