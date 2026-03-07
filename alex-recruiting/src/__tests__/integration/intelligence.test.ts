import { describe, it, expect } from 'vitest';

describe('Intelligence System — Scoring Engine', () => {
  it('exports calculateIntelligenceScore', async () => {
    const mod = await import('@/lib/intelligence/scoring-engine');
    expect(typeof mod.calculateIntelligenceScore).toBe('function');
  });

  it('exports calculateRecruitingTimeline', async () => {
    const mod = await import('@/lib/intelligence/scoring-engine');
    expect(typeof mod.calculateRecruitingTimeline).toBe('function');
  });

  it('calculateIntelligenceScore produces valid output', async () => {
    const { calculateIntelligenceScore } = await import(
      '@/lib/intelligence/scoring-engine'
    );
    const result = calculateIntelligenceScore({
      athleteId: 'test-1',
      athleteName: 'Test Athlete',
      hudlProfile: null,
      tweetPatterns: [],
      offers: [],
      followerCount: 100,
      coachFollowerCount: 2,
      postFrequency: 3,
      engagementRate: 4.5,
      height: "6'4\"",
      weight: '285',
      gpa: 3.5,
      satScore: null,
      actScore: null,
      classYear: 2028,
    });
    expect(result).toHaveProperty('overallScore');
    expect(result).toHaveProperty('filmScore');
    expect(result).toHaveProperty('socialPresenceScore');
    expect(result).toHaveProperty('recruitingMomentumScore');
    expect(result).toHaveProperty('academicScore');
    expect(result).toHaveProperty('physicalProfileScore');
    expect(result).toHaveProperty('tierProjection');
    expect(result).toHaveProperty('recommendations');
    expect(result.overallScore).toBeGreaterThanOrEqual(0);
    expect(result.overallScore).toBeLessThanOrEqual(100);
  });

  it('calculateRecruitingTimeline returns timeline with phases', async () => {
    const { calculateRecruitingTimeline } = await import(
      '@/lib/intelligence/scoring-engine'
    );
    const timeline = calculateRecruitingTimeline(2028, 'D1 FBS');
    expect(timeline).toHaveProperty('athleteClassYear', 2028);
    expect(timeline).toHaveProperty('division', 'D1 FBS');
    expect(timeline).toHaveProperty('currentPhase');
    expect(timeline).toHaveProperty('nextMilestone');
    expect(timeline).toHaveProperty('currentPhaseActions');
    expect(Array.isArray(timeline.currentPhaseActions)).toBe(true);
  });
});

describe('Intelligence System — Coach Behavior', () => {
  it('exports analyzeCoachBehavior', async () => {
    const mod = await import('@/lib/intelligence/coach-behavior');
    expect(typeof mod.analyzeCoachBehavior).toBe('function');
  });

  it('exports rankCoachesByResponseLikelihood', async () => {
    const mod = await import('@/lib/intelligence/coach-behavior');
    expect(typeof mod.rankCoachesByResponseLikelihood).toBe('function');
  });

  it('exports getCoachInsights', async () => {
    const mod = await import('@/lib/intelligence/coach-behavior');
    expect(typeof mod.getCoachInsights).toBe('function');
  });

  it('analyzeCoachBehavior returns a behavior profile', async () => {
    const { analyzeCoachBehavior } = await import(
      '@/lib/intelligence/coach-behavior'
    );
    const profile = analyzeCoachBehavior(
      {
        id: 'coach-1',
        name: 'Coach Test',
        schoolName: 'Test University',
        division: 'D2',
        conference: 'GLIAC',
        dmOpen: true,
        olNeedScore: 4,
      },
      [
        {
          id: 'tweet-1',
          text: 'Great recruit! #classof2028 offer',
          created_at: '2025-06-15T10:00:00Z',
        },
        {
          id: 'tweet-2',
          text: '@recruit Great film!',
          created_at: '2025-06-16T14:00:00Z',
        },
      ],
      null,
      false,
      false
    );
    expect(profile).toHaveProperty('coachId');
    expect(profile).toHaveProperty('engagementStyle');
    expect(profile).toHaveProperty('dmOpenProbability');
    expect(profile).toHaveProperty('followBackProbability');
    expect(profile).toHaveProperty('bestApproachStrategy');
    expect(profile).toHaveProperty('optimalContactWindow');
    expect(profile.dmOpenProbability).toBeGreaterThanOrEqual(0);
    expect(profile.dmOpenProbability).toBeLessThanOrEqual(1);
  });
});

describe('Intelligence System — Twitter Patterns', () => {
  it('exports analyzeTweet', async () => {
    const mod = await import('@/lib/intelligence/twitter-patterns');
    expect(typeof mod.analyzeTweet).toBe('function');
  });

  it('exports analyzeTweets', async () => {
    const mod = await import('@/lib/intelligence/twitter-patterns');
    expect(typeof mod.analyzeTweets).toBe('function');
  });

  it('exports extractOfferEvents', async () => {
    const mod = await import('@/lib/intelligence/twitter-patterns');
    expect(typeof mod.extractOfferEvents).toBe('function');
  });

  it('exports extractCommitmentEvents', async () => {
    const mod = await import('@/lib/intelligence/twitter-patterns');
    expect(typeof mod.extractCommitmentEvents).toBe('function');
  });

  it('exports buildRecruitingSearchQuery', async () => {
    const mod = await import('@/lib/intelligence/twitter-patterns');
    expect(typeof mod.buildRecruitingSearchQuery).toBe('function');
  });

  it('exports buildCompetitorMonitorQuery', async () => {
    const mod = await import('@/lib/intelligence/twitter-patterns');
    expect(typeof mod.buildCompetitorMonitorQuery).toBe('function');
  });

  it('analyzeTweet detects offer announcements', async () => {
    const { analyzeTweet } = await import(
      '@/lib/intelligence/twitter-patterns'
    );
    const result = analyzeTweet(
      {
        id: 't1',
        text: '#AGTG Blessed to receive an offer from @BadgerFootball!',
        created_at: '2025-06-01T12:00:00Z',
      },
      'testuser',
      'Test User'
    );
    expect(result).not.toBeNull();
    expect(result!.patternType).toBe('offer_announcement');
    expect(result!.confidence).toBeGreaterThan(0.5);
  });

  it('analyzeTweet detects commitment', async () => {
    const { analyzeTweet } = await import(
      '@/lib/intelligence/twitter-patterns'
    );
    const result = analyzeTweet(
      {
        id: 't2',
        text: "I'm committed to Wisconsin! Go Badgers!",
        created_at: '2025-06-01T12:00:00Z',
      },
      'testuser',
      'Test User'
    );
    expect(result).not.toBeNull();
    expect(result!.patternType).toBe('commitment');
  });

  it('analyzeTweet returns null for unrelated tweets', async () => {
    const { analyzeTweet } = await import(
      '@/lib/intelligence/twitter-patterns'
    );
    const result = analyzeTweet(
      {
        id: 't3',
        text: 'Just had lunch at a nice restaurant downtown.',
        created_at: '2025-06-01T12:00:00Z',
      },
      'testuser',
      'Test User'
    );
    expect(result).toBeNull();
  });

  it('buildRecruitingSearchQuery builds valid query', async () => {
    const { buildRecruitingSearchQuery } = await import(
      '@/lib/intelligence/twitter-patterns'
    );
    const query = buildRecruitingSearchQuery({
      athleteHandle: '@JacobRogersOL28',
      position: 'OL',
      classYear: 2028,
    });
    expect(query).toContain('from:JacobRogersOL28');
    expect(query).toContain('OL');
    expect(query).toContain('2028');
  });

  it('buildCompetitorMonitorQuery includes handles', async () => {
    const { buildCompetitorMonitorQuery } = await import(
      '@/lib/intelligence/twitter-patterns'
    );
    const query = buildCompetitorMonitorQuery(
      ['@handle1', '@handle2'],
      'OL'
    );
    expect(query).toContain('from:handle1');
    expect(query).toContain('from:handle2');
    expect(query).toContain('OL');
  });
});

describe('Intelligence System — Hudl Scraper', () => {
  it('exports scrapeHudlProfile', async () => {
    const mod = await import('@/lib/intelligence/hudl-scraper');
    expect(typeof mod.scrapeHudlProfile).toBe('function');
  });

  it('exports parseHudlMarkdown', async () => {
    const mod = await import('@/lib/intelligence/hudl-scraper');
    expect(typeof mod.parseHudlMarkdown).toBe('function');
  });

  it('exports isValidHudlUrl', async () => {
    const mod = await import('@/lib/intelligence/hudl-scraper');
    expect(typeof mod.isValidHudlUrl).toBe('function');
  });

  it('exports extractHudlUrl', async () => {
    const mod = await import('@/lib/intelligence/hudl-scraper');
    expect(typeof mod.extractHudlUrl).toBe('function');
  });

  it('exports createScrapeJob', async () => {
    const mod = await import('@/lib/intelligence/hudl-scraper');
    expect(typeof mod.createScrapeJob).toBe('function');
  });

  it('exports batchScrapeHudlProfiles', async () => {
    const mod = await import('@/lib/intelligence/hudl-scraper');
    expect(typeof mod.batchScrapeHudlProfiles).toBe('function');
  });

  it('isValidHudlUrl validates correct URLs', async () => {
    const { isValidHudlUrl } = await import(
      '@/lib/intelligence/hudl-scraper'
    );
    expect(isValidHudlUrl('https://www.hudl.com/profile/12345/john-doe')).toBe(
      true
    );
    expect(isValidHudlUrl('https://hudl.com/profile/99999')).toBe(true);
    expect(isValidHudlUrl('https://google.com')).toBe(false);
    expect(isValidHudlUrl('not-a-url')).toBe(false);
  });

  it('extractHudlUrl extracts URLs from text', async () => {
    const { extractHudlUrl } = await import(
      '@/lib/intelligence/hudl-scraper'
    );
    const url = extractHudlUrl(
      'Check out my film: https://www.hudl.com/profile/12345/jacob-rogers and follow me!'
    );
    expect(url).toBe('https://www.hudl.com/profile/12345/jacob-rogers');
  });

  it('extractHudlUrl returns null when no URL found', async () => {
    const { extractHudlUrl } = await import(
      '@/lib/intelligence/hudl-scraper'
    );
    expect(extractHudlUrl('No hudl link here')).toBeNull();
  });

  it('parseHudlMarkdown returns structured profile', async () => {
    const { parseHudlMarkdown } = await import(
      '@/lib/intelligence/hudl-scraper'
    );
    const markdown = `
# Jacob Rogers
**Position:** OL
**Height:** 6'4"
**Weight:** 285 lbs
**Class of** 2028
**School:** Pewaukee High School
**GPA:** 3.5
    `;
    const profile = parseHudlMarkdown(
      markdown,
      'https://hudl.com/profile/12345/jacob-rogers'
    );
    expect(profile.profileId).toBe('12345');
    expect(profile.profileUrl).toContain('hudl.com');
    expect(profile).toHaveProperty('athleteName');
    expect(profile).toHaveProperty('position');
    expect(profile).toHaveProperty('highlightReels');
    expect(Array.isArray(profile.highlightReels)).toBe(true);
  });

  it('createScrapeJob returns a valid job object', async () => {
    const { createScrapeJob } = await import(
      '@/lib/intelligence/hudl-scraper'
    );
    const job = createScrapeJob('https://hudl.com/profile/12345');
    expect(job).toHaveProperty('id');
    expect(job).toHaveProperty('type', 'hudl_profile');
    expect(job).toHaveProperty('status', 'pending');
    expect(job).toHaveProperty('targetUrl', 'https://hudl.com/profile/12345');
    expect(job).toHaveProperty('retryCount', 0);
  });
});

describe('Intelligence System — Index (Public API)', () => {
  it('re-exports all public functions from index', async () => {
    const mod = await import('@/lib/intelligence/index');
    // Hudl
    expect(typeof mod.scrapeHudlProfile).toBe('function');
    expect(typeof mod.batchScrapeHudlProfiles).toBe('function');
    expect(typeof mod.isValidHudlUrl).toBe('function');
    expect(typeof mod.extractHudlUrl).toBe('function');
    expect(typeof mod.parseHudlMarkdown).toBe('function');
    expect(typeof mod.createScrapeJob).toBe('function');
    // Twitter
    expect(typeof mod.analyzeTweet).toBe('function');
    expect(typeof mod.analyzeTweets).toBe('function');
    expect(typeof mod.extractOfferEvents).toBe('function');
    expect(typeof mod.extractCommitmentEvents).toBe('function');
    expect(typeof mod.buildRecruitingSearchQuery).toBe('function');
    expect(typeof mod.buildCompetitorMonitorQuery).toBe('function');
    // Scoring
    expect(typeof mod.calculateIntelligenceScore).toBe('function');
    expect(typeof mod.calculateRecruitingTimeline).toBe('function');
    // Coach behavior
    expect(typeof mod.analyzeCoachBehavior).toBe('function');
    expect(typeof mod.rankCoachesByResponseLikelihood).toBe('function');
    expect(typeof mod.getCoachInsights).toBe('function');
  });
});
