import { describe, it, expect } from 'vitest';

describe('REC Personas', () => {
  it('getPersonaPrompt returns a string for each team member', async () => {
    const { getPersonaPrompt } = await import('@/lib/rec/team/personas');
    const { TEAM_MEMBERS } = await import('@/lib/rec/types');
    for (const member of TEAM_MEMBERS) {
      const prompt = getPersonaPrompt(member.id);
      expect(typeof prompt).toBe('string');
      expect(prompt.length).toBeGreaterThan(100);
      expect(prompt).toContain(member.name);
    }
  });

  it('persona prompt includes Jacob context', async () => {
    const { getPersonaPrompt } = await import('@/lib/rec/team/personas');
    const prompt = getPersonaPrompt('nina');
    expect(prompt).toContain('Jacob Rodgers');
    expect(prompt).toContain('Class of 2029');
  });

  it('detectTeamMember identifies member from natural language', async () => {
    const { detectTeamMember } = await import('@/lib/rec/team/personas');
    expect(detectTeamMember('Nina, draft a DM')).toBe('nina');
    expect(detectTeamMember('Ask Marcus about the timeline')).toBe('marcus');
    expect(detectTeamMember('Hey Trey, create a post')).toBe('trey');
    expect(detectTeamMember('What should I do today?')).toBeNull();
  });

  it('buildChatSystemPrompt returns extended prompt', async () => {
    const { buildChatSystemPrompt } = await import('@/lib/rec/team/personas');
    const prompt = await buildChatSystemPrompt('nina');
    expect(prompt).toContain('Nina Banks');
    expect(prompt).toContain('Jacob Rodgers');
    expect(prompt.length).toBeGreaterThan(500);
  });
});
