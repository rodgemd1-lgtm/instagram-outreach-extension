import { describe, it, expect } from 'vitest';

describe('Content Engine', () => {
  it('exports getTodayRecommendation', async () => {
    const mod = await import('@/lib/alex/content-engine');
    expect(typeof mod.getTodayRecommendation).toBe('function');
  });

  it('exports generateDraftFromTemplate', async () => {
    const mod = await import('@/lib/alex/content-engine');
    expect(typeof mod.generateDraftFromTemplate).toBe('function');
  });

  it('exports getWeeklyPlan', async () => {
    const mod = await import('@/lib/alex/content-engine');
    expect(typeof mod.getWeeklyPlan).toBe('function');
  });

  it('exports calculatePillarDistribution', async () => {
    const mod = await import('@/lib/alex/content-engine');
    expect(typeof mod.calculatePillarDistribution).toBe('function');
  });

  it('exports createPostRecord', async () => {
    const mod = await import('@/lib/alex/content-engine');
    expect(typeof mod.createPostRecord).toBe('function');
  });

  it('getTodayRecommendation returns correct shape', async () => {
    const { getTodayRecommendation } = await import(
      '@/lib/alex/content-engine'
    );
    const rec = getTodayRecommendation();
    expect(rec).toHaveProperty('day');
    expect(rec).toHaveProperty('pillar');
    expect(rec).toHaveProperty('contentType');
    expect(rec).toHaveProperty('bestTime');
    expect(rec).toHaveProperty('notes');
    expect(rec).toHaveProperty('hashtags');
    expect(Array.isArray(rec.hashtags)).toBe(true);
  });

  it('generateDraftFromTemplate produces a PostDraft', async () => {
    const { generateDraftFromTemplate } = await import(
      '@/lib/alex/content-engine'
    );
    const draft = generateDraftFromTemplate('trainingPost', {
      TRAINING_DESCRIPTION: 'Morning lift session',
      HASHTAGS: '#OL #Grind',
    });
    expect(draft).toHaveProperty('content');
    expect(draft).toHaveProperty('pillar');
    expect(draft).toHaveProperty('hashtags');
    expect(draft).toHaveProperty('bestTime');
    expect(draft).toHaveProperty('mediaSuggestion');
    expect(draft).toHaveProperty('templateName');
    expect(draft.content).toContain('Morning lift session');
  });

  it('calculatePillarDistribution handles balanced posts', async () => {
    const { calculatePillarDistribution } = await import(
      '@/lib/alex/content-engine'
    );
    const posts = [
      { pillar: 'performance' },
      { pillar: 'performance' },
      { pillar: 'work_ethic' },
      { pillar: 'work_ethic' },
      { pillar: 'character' },
    ] as { pillar: string }[];
    const dist = calculatePillarDistribution(posts);
    expect(dist.performance).toBe(40);
    expect(dist.work_ethic).toBe(40);
    expect(dist.character).toBe(20);
    expect(dist.balanced).toBe(true);
  });

  it('calculatePillarDistribution detects imbalance', async () => {
    const { calculatePillarDistribution } = await import(
      '@/lib/alex/content-engine'
    );
    const posts = [
      { pillar: 'performance' },
      { pillar: 'performance' },
      { pillar: 'performance' },
      { pillar: 'performance' },
      { pillar: 'performance' },
    ] as { pillar: string }[];
    const dist = calculatePillarDistribution(posts);
    expect(dist.balanced).toBe(false);
  });

  it('getWeeklyPlan returns 7 entries', async () => {
    const { getWeeklyPlan } = await import('@/lib/alex/content-engine');
    const plan = getWeeklyPlan();
    expect(plan).toHaveLength(7);
  });
});

describe('DM Engine', () => {
  it('exports generateDM', async () => {
    const mod = await import('@/lib/alex/dm-engine');
    expect(typeof mod.generateDM).toBe('function');
  });

  it('exports createDMRecord', async () => {
    const mod = await import('@/lib/alex/dm-engine');
    expect(typeof mod.createDMRecord).toBe('function');
  });

  it('exports getDMWaveRecommendations', async () => {
    const mod = await import('@/lib/alex/dm-engine');
    expect(typeof mod.getDMWaveRecommendations).toBe('function');
  });

  it('exports getAvailableTemplates', async () => {
    const mod = await import('@/lib/alex/dm-engine');
    expect(typeof mod.getAvailableTemplates).toBe('function');
  });

  it('generateDM fills in coach name and school', async () => {
    const { generateDM } = await import('@/lib/alex/dm-engine');
    const msg = generateDM(
      { name: 'John Smith', schoolName: 'Wisconsin' },
      'intro'
    );
    expect(msg).toContain('Smith');
    expect(msg).toContain('Wisconsin');
  });

  it('getAvailableTemplates returns array with keys', async () => {
    const { getAvailableTemplates } = await import('@/lib/alex/dm-engine');
    const templates = getAvailableTemplates();
    expect(Array.isArray(templates)).toBe(true);
    expect(templates.length).toBeGreaterThan(0);
    expect(templates[0]).toHaveProperty('key');
    expect(templates[0]).toHaveProperty('name');
    expect(templates[0]).toHaveProperty('useCase');
  });
});

describe('Profile Audit', () => {
  it('exports runProfileAudit', async () => {
    const mod = await import('@/lib/alex/profile-audit');
    expect(typeof mod.runProfileAudit).toBe('function');
  });

  it('exports getScoreInterpretation', async () => {
    const mod = await import('@/lib/alex/profile-audit');
    expect(typeof mod.getScoreInterpretation).toBe('function');
  });

  it('runProfileAudit returns a score and recommendations', async () => {
    const { runProfileAudit } = await import('@/lib/alex/profile-audit');
    const result = runProfileAudit({
      hasProfilePhoto: true,
      hasHeaderImage: true,
      bioHasAllElements: true,
      hasPinnedPost: true,
      pinnedPostAge: 30,
      postsLast30Days: [],
      coaches: [],
      dmsLast30Days: [],
      constitutionViolations: 0,
    });
    expect(result).toHaveProperty('totalScore');
    expect(result).toHaveProperty('recommendations');
    expect(typeof result.totalScore).toBe('number');
    expect(Array.isArray(result.recommendations)).toBe(true);
  });

  it('perfect audit returns high score', async () => {
    const { runProfileAudit } = await import('@/lib/alex/profile-audit');
    const posts = Array.from({ length: 20 }, (_, i) => ({
      id: `post-${i}`,
      pillar: ['performance', 'work_ethic', 'character'][i % 3],
      engagementRate: 5,
      content: '',
      hashtags: [],
      mediaUrl: null,
      scheduledFor: '',
      bestTime: '',
      status: 'posted' as const,
      xPostId: null,
      impressions: 100,
      engagements: 5,
      createdAt: '',
      updatedAt: '',
    }));
    const coaches = Array.from({ length: 6 }, (_, i) => ({
      id: `coach-${i}`,
      name: `Coach ${i}`,
      title: 'OL Coach',
      schoolId: '',
      schoolName: '',
      division: 'D2' as const,
      conference: '',
      xHandle: '',
      dmOpen: true,
      followStatus: 'followed_back' as const,
      dmStatus: 'not_sent' as const,
      priorityTier: 'Tier 3' as const,
      olNeedScore: 3,
      xActivityScore: 3,
      lastEngaged: null,
      notes: '',
      createdAt: '',
      updatedAt: '',
    }));
    const dms = Array.from({ length: 3 }, (_, i) => ({
      id: `dm-${i}`,
      coachId: '',
      coachName: '',
      schoolName: '',
      templateType: 'intro',
      content: '',
      status: 'sent' as const,
      sentAt: null,
      respondedAt: null,
      responseContent: null,
      createdAt: '',
    }));
    const result = runProfileAudit({
      hasProfilePhoto: true,
      hasHeaderImage: true,
      bioHasAllElements: true,
      hasPinnedPost: true,
      pinnedPostAge: 10,
      postsLast30Days: posts,
      coaches,
      dmsLast30Days: dms,
      constitutionViolations: 0,
    });
    expect(result.totalScore).toBeGreaterThanOrEqual(8);
  });

  it('getScoreInterpretation returns labels for different ranges', async () => {
    const { getScoreInterpretation } = await import(
      '@/lib/alex/profile-audit'
    );
    expect(getScoreInterpretation(9).label).toBe('Elite');
    expect(getScoreInterpretation(7).label).toBe('Good');
    expect(getScoreInterpretation(5).label).toBe('Needs Work');
    expect(getScoreInterpretation(2).label).toBe('Reset');
  });
});
