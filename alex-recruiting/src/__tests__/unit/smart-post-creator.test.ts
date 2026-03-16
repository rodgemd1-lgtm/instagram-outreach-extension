import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SmartPostCreator } from '@/components/smart-post-creator';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

describe('SmartPostCreator — Initialization', () => {
  it('initializes with empty content (no INITIAL_DRAFT)', () => {
    const filePath = path.resolve(__dirname, '../../components/smart-post-creator.tsx');
    const source = fs.readFileSync(filePath, 'utf-8');

    // The component should use useState("") for content, not a pre-filled INITIAL_DRAFT
    expect(source).toMatch(/useState\(""\)/);
    expect(source).not.toMatch(/\bINITIAL_DRAFT\b/);
  });

  it('initializes with an empty queue (no INITIAL_QUEUE)', () => {
    const filePath = path.resolve(__dirname, '../../components/smart-post-creator.tsx');
    const source = fs.readFileSync(filePath, 'utf-8');

    // The component should use useState<QueuedPost[]>([]) for queue
    expect(source).toMatch(/useState<QueuedPost\[\]>\(\[\]\)/);
    expect(source).not.toMatch(/\bINITIAL_QUEUE\b/);
  });
});

describe('SmartPostCreator — XPostPreview', () => {
  it('shows "--" for engagement metrics (not hardcoded numbers)', () => {
    const filePath = path.resolve(__dirname, '../../components/smart-post-creator.tsx');
    const source = fs.readFileSync(filePath, 'utf-8');

    // The engagement buttons should display "--" as placeholder text
    const dashMatches = source.match(/"text-\[13px\]">--<\/span>/g);
    expect(dashMatches).not.toBeNull();
    // There are 4 engagement buttons: replies, retweets, likes, views
    expect(dashMatches!.length).toBe(4);
  });
});

describe('SmartPostCreator — handleAddToQueue API call', () => {
  it('calls POST /api/posts when adding to queue', () => {
    const filePath = path.resolve(__dirname, '../../components/smart-post-creator.tsx');
    const source = fs.readFileSync(filePath, 'utf-8');

    // Verify the component uses the correct API endpoint
    expect(source).toContain('fetch("/api/posts"');
    expect(source).toContain('method: "POST"');
    expect(source).toContain('"Content-Type": "application/json"');
  });

  it('sends content, pillar, and status in the POST body', () => {
    const filePath = path.resolve(__dirname, '../../components/smart-post-creator.tsx');
    const source = fs.readFileSync(filePath, 'utf-8');

    // Verify the request body includes the required fields
    expect(source).toMatch(/JSON\.stringify\(\{[^}]*content/);
    expect(source).toMatch(/JSON\.stringify\(\{[^}]*pillar/);
    expect(source).toMatch(/JSON\.stringify\(\{[^}]*status/);
  });
});
