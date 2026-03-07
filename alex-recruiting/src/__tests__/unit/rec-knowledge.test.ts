import { describe, it, expect } from 'vitest';

describe('REC Knowledge Bases', () => {
  it('ncaaRules contains recruiting calendar and contact rules', async () => {
    const { ncaaRules } = await import('@/lib/rec/knowledge/ncaa-rules');
    expect(ncaaRules).toHaveProperty('contactRules');
    expect(ncaaRules).toHaveProperty('recruitingCalendar');
    expect(ncaaRules).toHaveProperty('classOf2029Timeline');
    expect(ncaaRules.classOf2029Timeline.length).toBeGreaterThan(0);
  });

  it('xPlaybook contains posting best practices', async () => {
    const { xPlaybook } = await import('@/lib/rec/knowledge/x-playbook');
    expect(xPlaybook).toHaveProperty('profileOptimization');
    expect(xPlaybook).toHaveProperty('postingCadence');
    expect(xPlaybook).toHaveProperty('dmStrategy');
    expect(xPlaybook).toHaveProperty('followStrategy');
  });

  it('all knowledge bases export getKnowledgeContext function', async () => {
    const modules = [
      '@/lib/rec/knowledge/ncaa-rules',
      '@/lib/rec/knowledge/x-playbook',
      '@/lib/rec/knowledge/coach-database',
      '@/lib/rec/knowledge/ncsa-leads',
      '@/lib/rec/knowledge/school-needs',
      '@/lib/rec/knowledge/competitor-intel',
      '@/lib/rec/knowledge/content-library',
    ];
    for (const mod of modules) {
      const m = await import(mod);
      expect(typeof m.getKnowledgeContext).toBe('function');
      const ctx = await m.getKnowledgeContext();
      expect(typeof ctx).toBe('string');
      expect(ctx.length).toBeGreaterThan(0);
    }
  });
});
