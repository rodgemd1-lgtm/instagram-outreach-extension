import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const APP_DIR = path.resolve(__dirname, '../../app');

describe('User Workflows — Navigation Paths', () => {
  const expectedPages = [
    '',           // root page.tsx
    'analytics',
    'audit',
    'calendar',
    'coaches',
    'competitors',
    'dms',
    'posts',
    'scrape',
    'intelligence',
  ];

  for (const pagePath of expectedPages) {
    const displayName = pagePath || '/ (home)';
    it(`page "${displayName}" exists as a page.tsx file`, () => {
      const fullPath = path.join(APP_DIR, pagePath, 'page.tsx');
      expect(fs.existsSync(fullPath)).toBe(true);
    });
  }
});

describe('User Workflows — Page Exports', () => {
  it('home page exports a default component', async () => {
    const mod = await import('@/app/page');
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe('function');
  });

  it('analytics page exports a default component', async () => {
    const mod = await import('@/app/analytics/page');
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe('function');
  });

  it('audit page exports a default component', async () => {
    const mod = await import('@/app/audit/page');
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe('function');
  });

  it('calendar page exports a default component', async () => {
    const mod = await import('@/app/calendar/page');
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe('function');
  });

  it('coaches page exports a default component', async () => {
    const mod = await import('@/app/coaches/page');
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe('function');
  });

  it('competitors page exports a default component', async () => {
    const mod = await import('@/app/competitors/page');
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe('function');
  });

  it('dms page exports a default component', async () => {
    const mod = await import('@/app/dms/page');
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe('function');
  });

  it('posts page exports a default component', async () => {
    const mod = await import('@/app/posts/page');
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe('function');
  });

  it('scrape page exports a default component', async () => {
    const mod = await import('@/app/scrape/page');
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe('function');
  });

  it('intelligence page exports a default component', async () => {
    const mod = await import('@/app/intelligence/page');
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe('function');
  });
});

describe('User Workflows — Layout', () => {
  it('root layout file exists', () => {
    const layoutPath = path.join(APP_DIR, 'layout.tsx');
    expect(fs.existsSync(layoutPath)).toBe(true);
  });

  it('root layout file exports a default function', () => {
    const layoutPath = path.join(APP_DIR, 'layout.tsx');
    const content = fs.readFileSync(layoutPath, 'utf-8');
    // Layout should have an export default
    const hasDefault =
      content.includes('export default') ||
      /export\s+default\s+function/.test(content);
    expect(hasDefault).toBe(true);
  });
});
