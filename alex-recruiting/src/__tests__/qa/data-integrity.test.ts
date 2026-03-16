import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

const SRC_DIR = path.resolve(__dirname, '../../');

describe('QA — SmartPostCreator Data Integrity', () => {
  const filePath = path.join(SRC_DIR, 'components', 'smart-post-creator.tsx');
  const source = fs.readFileSync(filePath, 'utf-8');

  it('does not contain an INITIAL_DRAFT constant', () => {
    expect(source).not.toMatch(/\bINITIAL_DRAFT\b/);
  });

  it('does not contain an INITIAL_QUEUE constant', () => {
    expect(source).not.toMatch(/\bINITIAL_QUEUE\b/);
  });

  it('does not contain hardcoded engagement numbers (24, 89, 342, 12.4K patterns)', () => {
    // Check for specific hardcoded engagement-like numbers in JSX context
    expect(source).not.toMatch(/>24<\//);
    expect(source).not.toMatch(/>89<\//);
    expect(source).not.toMatch(/>342<\//);
    expect(source).not.toMatch(/12\.4K/);
    // Also check for number patterns that look like engagement counts in span/p tags
    expect(source).not.toMatch(/>\d{2,4}<\/span>/);
  });
});

describe('QA — CompetitorMap Data Integrity', () => {
  const filePath = path.join(SRC_DIR, 'components', 'competitor-map.tsx');
  const source = fs.readFileSync(filePath, 'utf-8');

  it('does not have hardcoded "0" for Jacob stats (>0</p> patterns)', () => {
    // Jacob's stats section should not hardcode >0</p> for followers/posts/engagement
    expect(source).not.toMatch(/>0<\/p>/);
  });
});

describe('QA — Content Queue Edit Button', () => {
  const filePath = path.join(SRC_DIR, 'app', 'content-queue', 'page.tsx');
  const source = fs.readFileSync(filePath, 'utf-8');

  it('edit button does not use a noop onClick handler', () => {
    expect(source).not.toMatch(/onClick=\{?\(\)\s*=>\s*\{\}\}?/);
  });
});
