import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('Content Queue — Edit Button', () => {
  const filePath = path.resolve(__dirname, '../../components/content/content-queue.tsx');
  const source = fs.readFileSync(filePath, 'utf-8');

  it('edit button uses an <a> tag with href (not a noop onClick)', () => {
    // The edit action should be a link to the create page with the post ID
    expect(source).toMatch(/<a\s[^>]*href=\{?`\/create\?editPostId=/);
  });

  it('edit button does not use onClick={() => {}}', () => {
    expect(source).not.toMatch(/onClick=\{\(\)\s*=>\s*\{\}\}/);
  });

  it('edit button links to /create with editPostId query param', () => {
    expect(source).toContain('/create?editPostId=');
  });
});
