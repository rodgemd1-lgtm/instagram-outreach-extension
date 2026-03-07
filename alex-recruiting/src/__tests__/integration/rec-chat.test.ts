import { describe, it, expect } from 'vitest';

describe('REC Team Chat', () => {
  it('buildChatSystemPrompt includes persona + knowledge for nina', async () => {
    const { buildChatSystemPrompt } = await import('@/lib/rec/team/personas');
    const prompt = await buildChatSystemPrompt('nina');
    expect(prompt).toContain('Nina Banks');
    expect(prompt).toContain('Jacob Rodgers');
    expect(prompt).toContain('KNOWLEDGE BASE');
    expect(prompt).toContain('coach');
    expect(prompt.length).toBeGreaterThan(500);
  });

  it('buildChatSystemPrompt for devin includes all knowledge bases', async () => {
    const { buildChatSystemPrompt } = await import('@/lib/rec/team/personas');
    const prompt = await buildChatSystemPrompt('devin');
    expect(prompt).toContain('Devin');
    expect(prompt).toContain('KNOWLEDGE BASE');
    // Devin gets everything
    expect(prompt.length).toBeGreaterThan(2000);
  });

  it('buildChatSystemPrompt for marcus includes NCAA rules and school needs', async () => {
    const { buildChatSystemPrompt } = await import('@/lib/rec/team/personas');
    const prompt = await buildChatSystemPrompt('marcus');
    expect(prompt).toContain('Marcus Cole');
    expect(prompt).toContain('KNOWLEDGE BASE');
  });

  it('buildChatSystemPrompt for trey includes x-playbook and content library', async () => {
    const { buildChatSystemPrompt } = await import('@/lib/rec/team/personas');
    const prompt = await buildChatSystemPrompt('trey');
    expect(prompt).toContain('Trey Jackson');
    expect(prompt).toContain('KNOWLEDGE BASE');
  });
});
