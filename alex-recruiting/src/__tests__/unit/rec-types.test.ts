import { describe, it, expect } from 'vitest';

describe('REC Types', () => {
  it('TEAM_MEMBERS contains all 7 members', async () => {
    const { TEAM_MEMBERS } = await import('@/lib/rec/types');
    expect(TEAM_MEMBERS).toHaveLength(7);
    expect(TEAM_MEMBERS.map(m => m.id)).toContain('devin');
    expect(TEAM_MEMBERS.map(m => m.id)).toContain('marcus');
    expect(TEAM_MEMBERS.map(m => m.id)).toContain('nina');
    expect(TEAM_MEMBERS.map(m => m.id)).toContain('trey');
    expect(TEAM_MEMBERS.map(m => m.id)).toContain('jordan');
    expect(TEAM_MEMBERS.map(m => m.id)).toContain('sophie');
    expect(TEAM_MEMBERS.map(m => m.id)).toContain('casey');
  });

  it('each member has required fields', async () => {
    const { TEAM_MEMBERS } = await import('@/lib/rec/types');
    for (const member of TEAM_MEMBERS) {
      expect(member).toHaveProperty('id');
      expect(member).toHaveProperty('name');
      expect(member).toHaveProperty('title');
      expect(member).toHaveProperty('specialty');
      expect(member).toHaveProperty('owns');
      expect(member).toHaveProperty('color');
      expect(typeof member.name).toBe('string');
      expect(member.owns.length).toBeGreaterThan(0);
    }
  });

  it('getTeamMember returns correct member by id', async () => {
    const { getTeamMember } = await import('@/lib/rec/types');
    const nina = getTeamMember('nina');
    expect(nina).toBeDefined();
    expect(nina!.name).toBe('Nina Banks');
  });

  it('getTeamMember returns undefined for invalid id', async () => {
    const { getTeamMember } = await import('@/lib/rec/types');
    expect(getTeamMember('nobody')).toBeUndefined();
  });
});
