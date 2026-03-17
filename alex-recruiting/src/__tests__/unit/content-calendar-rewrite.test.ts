import { describe, it, expect } from 'vitest';
import { contentCalendar30d, getPostsByPillar } from '@/lib/data/content-calendar-30d';

// ---------------------------------------------------------------------------
// 1. Structure Validation
// ---------------------------------------------------------------------------
describe('Content Calendar — Structure Validation', () => {
  it('should have exactly 17 posts', () => {
    expect(contentCalendar30d.length).toBe(17);
  });

  it('each post should have all required fields', () => {
    for (const post of contentCalendar30d) {
      expect(post).toHaveProperty('id');
      expect(post).toHaveProperty('draft_text');
      expect(post).toHaveProperty('pillar');
      expect(post).toHaveProperty('post_type');
      expect(post).toHaveProperty('scheduled_time');
      expect(post).toHaveProperty('suggested_media');
      expect(post).toHaveProperty('hashtags');
      expect(post).toHaveProperty('target_coaches_to_tag');
      expect(post).toHaveProperty('approval_status');
      expect(post).toHaveProperty('panel_status');
      expect(post).toHaveProperty('post_formula');
      expect(post).toHaveProperty('psychology_mechanism');
    }
  });

  it('all post IDs should follow pattern "post-XXX"', () => {
    for (const post of contentCalendar30d) {
      expect(post.id).toMatch(/^post-\d{3}$/);
    }
  });

  it('all post IDs should be unique', () => {
    const ids = contentCalendar30d.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('post IDs should be sequential from post-001 to post-017', () => {
    for (let i = 0; i < contentCalendar30d.length; i++) {
      const expected = `post-${String(i + 1).padStart(3, '0')}`;
      expect(contentCalendar30d[i].id).toBe(expected);
    }
  });

  it('each post should have non-empty draft_text', () => {
    for (const post of contentCalendar30d) {
      expect(post.draft_text.length).toBeGreaterThan(0);
    }
  });

  it('each post should have at least 1 hashtag', () => {
    for (const post of contentCalendar30d) {
      expect(post.hashtags.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('each post should have a non-empty psychology_mechanism', () => {
    for (const post of contentCalendar30d) {
      expect(post.psychology_mechanism.length).toBeGreaterThan(10);
    }
  });

  it('each post should have a non-empty suggested_media', () => {
    for (const post of contentCalendar30d) {
      expect(post.suggested_media.length).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// 2. Pillar Distribution
// ---------------------------------------------------------------------------
describe('Content Calendar — Pillar Distribution', () => {
  it('should have exactly 7 performance posts', () => {
    expect(getPostsByPillar('performance').length).toBe(7);
  });

  it('should have exactly 7 work_ethic posts', () => {
    expect(getPostsByPillar('work_ethic').length).toBe(7);
  });

  it('should have exactly 3 character posts', () => {
    expect(getPostsByPillar('character').length).toBe(3);
  });

  it('pillar counts should add up to total posts', () => {
    const perf = getPostsByPillar('performance').length;
    const ethic = getPostsByPillar('work_ethic').length;
    const char = getPostsByPillar('character').length;
    expect(perf + ethic + char).toBe(contentCalendar30d.length);
  });

  it('all pillars should be valid values', () => {
    const validPillars = ['performance', 'work_ethic', 'character'];
    for (const post of contentCalendar30d) {
      expect(validPillars).toContain(post.pillar);
    }
  });
});

// ---------------------------------------------------------------------------
// 3. Post Formula Coverage
// ---------------------------------------------------------------------------
describe('Content Calendar — Post Formula Coverage', () => {
  const VALID_FORMULAS = [
    'spotlight_shift',
    'curious_student',
    'honest_progress',
    'ambient_update',
    'narrative_loop',
  ] as const;

  it('every post should use a valid post formula', () => {
    for (const post of contentCalendar30d) {
      expect(VALID_FORMULAS).toContain(post.post_formula);
    }
  });

  it('at least 3 different formulas should be used across all posts', () => {
    const formulas = new Set(contentCalendar30d.map((p) => p.post_formula));
    expect(formulas.size).toBeGreaterThanOrEqual(3);
  });

  it('all 5 formulas should be represented', () => {
    const formulas = new Set(contentCalendar30d.map((p) => p.post_formula));
    expect(formulas.has('spotlight_shift')).toBe(true);
    expect(formulas.has('curious_student')).toBe(true);
    expect(formulas.has('honest_progress')).toBe(true);
    expect(formulas.has('ambient_update')).toBe(true);
    expect(formulas.has('narrative_loop')).toBe(true);
  });

  it('no formula should be used for more than 40% of posts (diversity)', () => {
    const formulaCounts = new Map<string, number>();
    for (const post of contentCalendar30d) {
      formulaCounts.set(post.post_formula, (formulaCounts.get(post.post_formula) ?? 0) + 1);
    }
    const maxAllowed = Math.ceil(contentCalendar30d.length * 0.4);
    for (const [formula, count] of formulaCounts) {
      expect(
        count,
        `Formula "${formula}" used ${count} times, max allowed is ${maxAllowed}`
      ).toBeLessThanOrEqual(maxAllowed);
    }
  });
});

// ---------------------------------------------------------------------------
// 4. Spotlight Shift Check
// ---------------------------------------------------------------------------
describe('Content Calendar — Spotlight Shift Check', () => {
  const BANNED_PHRASES = [
    'DMs are open',
    'Check out my highlights',
    "Who's watching?",
    'Built different',
    'Rise and grind',
    "Can't stop won't stop",
    'Nobody outworks me',
    'Giving back feels good',
    'Two-a-days build champions',
    'DL hates seeing me',
  ];

  it('no post should contain any banned phrases', () => {
    for (const post of contentCalendar30d) {
      for (const phrase of BANNED_PHRASES) {
        expect(
          post.draft_text.toLowerCase(),
          `Post ${post.id} contains banned phrase: "${phrase}"`
        ).not.toContain(phrase.toLowerCase());
      }
    }
  });

  it('posts using spotlight_shift formula should contain "we", "our", or reference someone by name', () => {
    const spotlightPosts = contentCalendar30d.filter((p) => p.post_formula === 'spotlight_shift');
    expect(spotlightPosts.length).toBeGreaterThan(0);

    for (const post of spotlightPosts) {
      const text = post.draft_text;
      const hasTeamLanguage = /\bwe\b/i.test(text) || /\bour\b/i.test(text);
      const hasNameReference = /Coach \w+|\b[A-Z][a-z]+(?:,? (?:our|my|the))/.test(text) ||
        /\b(?:Ethan|Tyler|Marcus|Davis|Meyers)\b/.test(text);
      expect(
        hasTeamLanguage || hasNameReference,
        `Spotlight Shift post ${post.id} should use "we/our" or reference someone by name`
      ).toBe(true);
    }
  });

  it('no post should contain generic motivational hashtags (#GrindSZN)', () => {
    for (const post of contentCalendar30d) {
      expect(post.draft_text).not.toContain('#GrindSZN');
      for (const tag of post.hashtags) {
        expect(tag).not.toBe('#GrindSZN');
      }
    }
  });

  it('no post should have more than 1 exclamation mark (no motivational speaker tone)', () => {
    for (const post of contentCalendar30d) {
      const exclamationCount = (post.draft_text.match(/!/g) || []).length;
      expect(
        exclamationCount,
        `Post ${post.id} has ${exclamationCount} exclamation marks`
      ).toBeLessThanOrEqual(1);
    }
  });
});

// ---------------------------------------------------------------------------
// 5. Coach Panel Status
// ---------------------------------------------------------------------------
describe('Content Calendar — Coach Panel Status', () => {
  it('all posts should have panel_status of "panel_approved"', () => {
    for (const post of contentCalendar30d) {
      expect(post.panel_status, `Post ${post.id} panel_status`).toBe('panel_approved');
    }
  });

  it('all posts should have approval_status of "pending" (waiting for user final approval)', () => {
    for (const post of contentCalendar30d) {
      expect(post.approval_status, `Post ${post.id} approval_status`).toBe('pending');
    }
  });

  it('panel_status should be a valid enum value', () => {
    const validStatuses = ['pending_panel', 'panel_approved', 'panel_rejected'];
    for (const post of contentCalendar30d) {
      expect(validStatuses).toContain(post.panel_status);
    }
  });

  it('approval_status should be a valid enum value', () => {
    const validStatuses = ['pending', 'approved', 'posted'];
    for (const post of contentCalendar30d) {
      expect(validStatuses).toContain(post.approval_status);
    }
  });
});

// ---------------------------------------------------------------------------
// 6. Tone Bible Compliance
// ---------------------------------------------------------------------------
describe('Content Calendar — Tone Bible Compliance', () => {
  it('no post should exceed 280 characters (X/Twitter limit)', () => {
    for (const post of contentCalendar30d) {
      expect(
        post.draft_text.length,
        `Post ${post.id} is ${post.draft_text.length} chars, exceeds 280`
      ).toBeLessThanOrEqual(280);
    }
  });

  it('posts should contain more "we/our" than "I/my" on aggregate', () => {
    let weOurCount = 0;
    let iMyCount = 0;

    for (const post of contentCalendar30d) {
      const text = post.draft_text;
      // Count "we" and "our" as whole words
      weOurCount += (text.match(/\b(we|our|We|Our)\b/g) || []).length;
      // Count "I" and "my" as whole words
      iMyCount += (text.match(/\b(I|my|My)\b/g) || []).length;
    }

    expect(
      weOurCount,
      `"we/our" count (${weOurCount}) should exceed "I/my" count (${iMyCount})`
    ).toBeGreaterThan(iMyCount);
  });

  it('at least 3 posts should tag a specific coach', () => {
    const postsWithCoachTags = contentCalendar30d.filter(
      (p) => p.target_coaches_to_tag.length > 0
    );
    expect(postsWithCoachTags.length).toBeGreaterThanOrEqual(3);
  });

  it('coach tags should use @ prefix format', () => {
    for (const post of contentCalendar30d) {
      for (const tag of post.target_coaches_to_tag) {
        expect(tag, `Tag "${tag}" in post ${post.id} should start with @`).toMatch(/^@/);
      }
    }
  });

  it('at least 60% of posts should mention a specific name, number, or school', () => {
    const specificPosts = contentCalendar30d.filter((p) => {
      const text = p.draft_text;
      return /Coach \w+|@\w+|\d{3}|\d{2,}\s*(lb|lbs)|UW-|Pewaukee/.test(text);
    });
    const ratio = specificPosts.length / contentCalendar30d.length;
    expect(ratio).toBeGreaterThanOrEqual(0.6);
  });

  it('at least 5 posts should use team-first language (we/our)', () => {
    const teamPosts = contentCalendar30d.filter((p) =>
      /\b(we|our|We|Our)\b/.test(p.draft_text)
    );
    expect(teamPosts.length).toBeGreaterThanOrEqual(5);
  });
});

// ---------------------------------------------------------------------------
// 7. Schedule Validation
// ---------------------------------------------------------------------------
describe('Content Calendar — Schedule Validation', () => {
  it('all scheduled_time values should be valid ISO 8601 dates', () => {
    for (const post of contentCalendar30d) {
      const date = new Date(post.scheduled_time);
      expect(date.toString(), `Post ${post.id} has invalid date`).not.toBe('Invalid Date');
      // Verify round-trip: parsing and re-serializing should produce equivalent timestamps
      expect(date.getTime(), `Post ${post.id} date should round-trip`).toBe(
        new Date(post.scheduled_time).getTime()
      );
      // Verify ISO 8601 format (with or without milliseconds)
      expect(post.scheduled_time).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/);
    }
  });

  it('posts should span from March 18 to April 15, 2026', () => {
    const dates = contentCalendar30d.map((p) => new Date(p.scheduled_time));
    const earliest = new Date(Math.min(...dates.map((d) => d.getTime())));
    const latest = new Date(Math.max(...dates.map((d) => d.getTime())));

    // Earliest should be March 18, 2026 (UTC)
    expect(earliest.getUTCFullYear()).toBe(2026);
    expect(earliest.getUTCMonth()).toBe(2); // March = 2 (0-indexed)
    expect(earliest.getUTCDate()).toBe(18);

    // Latest should be April 15, 2026 (UTC)
    expect(latest.getUTCFullYear()).toBe(2026);
    expect(latest.getUTCMonth()).toBe(3); // April = 3 (0-indexed)
    expect(latest.getUTCDate()).toBe(15);
  });

  it('posts should be in chronological order', () => {
    for (let i = 1; i < contentCalendar30d.length; i++) {
      const prev = new Date(contentCalendar30d[i - 1].scheduled_time).getTime();
      const curr = new Date(contentCalendar30d[i].scheduled_time).getTime();
      expect(
        curr,
        `Post ${contentCalendar30d[i].id} should be after ${contentCalendar30d[i - 1].id}`
      ).toBeGreaterThan(prev);
    }
  });

  it('all posts should be scheduled at 23:00 UTC (6 PM CT)', () => {
    for (const post of contentCalendar30d) {
      const date = new Date(post.scheduled_time);
      expect(date.getUTCHours(), `Post ${post.id} should be at 23:00 UTC`).toBe(23);
      expect(date.getUTCMinutes()).toBe(0);
    }
  });

  it('no two posts should be scheduled on the same day', () => {
    const dateParts = contentCalendar30d.map((p) => p.scheduled_time.split('T')[0]);
    expect(new Set(dateParts).size).toBe(dateParts.length);
  });
});
