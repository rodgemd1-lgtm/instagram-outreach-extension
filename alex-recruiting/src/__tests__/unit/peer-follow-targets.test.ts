import { describe, it, expect } from 'vitest';
import { peerFollowTargets, getTargetsByCategory, followerGrowthTargets } from '@/lib/data/peer-follow-targets';

describe('peer follow targets', () => {
  it('has 60 total targets', () => {
    expect(peerFollowTargets).toHaveLength(60);
  });
  it('has correct category distribution', () => {
    expect(getTargetsByCategory('peer_recruit').length).toBe(20);
    expect(getTargetsByCategory('recruiting_media').length).toBe(15);
    expect(getTargetsByCategory('wi_hs_community').length).toBe(15);
    expect(getTargetsByCategory('strength_training').length).toBe(10);
  });
  it('every target has required fields', () => {
    peerFollowTargets.forEach(t => {
      expect(t.name).toBeTruthy();
      expect(t.handle).toMatch(/^@/);
      expect(t.category).toBeTruthy();
      expect(t.follow_priority).toBeGreaterThanOrEqual(1);
      expect(t.follow_priority).toBeLessThanOrEqual(3);
      expect(t.engagement_strategy).toMatch(/^like|reply|quote|follow_only$/);
    });
  });
  it('has follower growth targets', () => {
    expect(followerGrowthTargets.baseline).toBe(47);
    expect(followerGrowthTargets.week4).toBeGreaterThan(followerGrowthTargets.baseline);
    expect(followerGrowthTargets.week8).toBeGreaterThan(followerGrowthTargets.week4);
    expect(followerGrowthTargets.week12).toBeGreaterThan(followerGrowthTargets.week8);
  });
});
