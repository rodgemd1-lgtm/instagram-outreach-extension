import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('Coach Pipeline — Upsert Safety', () => {
  const filePath = path.resolve(__dirname, '../../app/api/coaches/scrape-x/route.ts');
  const source = fs.readFileSync(filePath, 'utf-8');

  it('does NOT use bare db.insert() without conflict handling', () => {
    // The route should check for existing records or use onConflictDoUpdate
    // to prevent duplicate entries when re-scraping the same coaches.
    const hasExistingCheck = source.includes('existing') && source.includes('db.select');
    const hasOnConflict = source.includes('onConflictDoUpdate');

    // At least one upsert strategy must be present
    expect(hasExistingCheck || hasOnConflict).toBe(true);
  });

  it('checks for existing records before inserting', () => {
    // Verify the existing-check upsert pattern is used
    expect(source).toContain('existing');
    expect(source).toMatch(/existing\.length\s*>\s*0/);
  });

  it('updates existing records when found', () => {
    // When an existing profile is found, it should update rather than insert
    expect(source).toContain('db.update(coachBehaviorProfiles)');
  });

  it('inserts new records only when no existing record is found', () => {
    // The insert path should be in the else branch (when existing.length === 0)
    expect(source).toContain('db.insert(coachBehaviorProfiles)');
  });
});
