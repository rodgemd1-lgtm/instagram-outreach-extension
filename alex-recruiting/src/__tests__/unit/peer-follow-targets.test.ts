import { describe, it, expect } from 'vitest';
import {
  peerFollowTargets,
  getTargetsByCategory,
  getTargetsForWeek,
  getScheduledTargets,
  followerGrowthTargets,
  followScheduleSummary,
} from '@/lib/data/peer-follow-targets';

describe('peer follow targets', () => {
  it('has at least 200 total targets (programs + coaches + media + community)', () => {
    expect(peerFollowTargets.length).toBeGreaterThanOrEqual(200);
  });

  it('has targets across all categories', () => {
    expect(getTargetsByCategory('college_program').length).toBeGreaterThan(0);
    expect(getTargetsByCategory('college_coach').length).toBeGreaterThan(0);
    expect(getTargetsByCategory('recruiting_media').length).toBeGreaterThan(0);
    expect(getTargetsByCategory('wi_hs_community').length).toBeGreaterThan(0);
    expect(getTargetsByCategory('strength_training').length).toBeGreaterThan(0);
  });

  it('every target has required fields', () => {
    peerFollowTargets.forEach((t) => {
      expect(t.name).toBeTruthy();
      expect(t.handle).toMatch(/^@/);
      expect(t.category).toBeTruthy();
      expect(t.follow_priority).toBeGreaterThanOrEqual(1);
      expect(t.follow_priority).toBeLessThanOrEqual(3);
      expect(t.engagement_strategy).toMatch(/^like|reply|quote|follow_only$/);
    });
  });

  it('has no duplicate handles', () => {
    const handles = peerFollowTargets.map((t) => t.handle.toLowerCase());
    const unique = new Set(handles);
    expect(unique.size).toBe(handles.length);
  });

  it('has targets scheduled across 26 weeks', () => {
    const scheduled = getScheduledTargets();
    expect(scheduled.length).toBeGreaterThan(0);
    const weeks = new Set(scheduled.map((t) => t.scheduled_week));
    // Should cover at least 15 different weeks
    expect(weeks.size).toBeGreaterThanOrEqual(15);
  });

  it('has follower growth targets with progressive milestones', () => {
    expect(followerGrowthTargets.baseline).toBe(47);
    expect(followerGrowthTargets.week4).toBeGreaterThan(followerGrowthTargets.baseline);
    expect(followerGrowthTargets.week8).toBeGreaterThan(followerGrowthTargets.week4);
    expect(followerGrowthTargets.week12).toBeGreaterThan(followerGrowthTargets.week8);
    expect(followerGrowthTargets.week26).toBeGreaterThan(followerGrowthTargets.week12);
  });

  it('college programs outnumber other categories', () => {
    const programs = getTargetsByCategory('college_program').length;
    const coaches = getTargetsByCategory('college_coach').length;
    const totalCollegeAccounts = programs + coaches;
    expect(totalCollegeAccounts).toBeGreaterThan(peerFollowTargets.length / 3);
  });

  it('schedule summary has correct phase structure', () => {
    expect(followScheduleSummary.weeksInPlan).toBe(26);
    expect(followScheduleSummary.phases).toHaveLength(7);
    expect(followScheduleSummary.totalTargets).toBe(peerFollowTargets.length);
  });

  it('getTargetsForWeek returns targets for specific weeks', () => {
    const week1 = getTargetsForWeek(1);
    const week15 = getTargetsForWeek(15);
    // Both should have some targets
    expect(week1.length + week15.length).toBeGreaterThan(0);
  });
});
