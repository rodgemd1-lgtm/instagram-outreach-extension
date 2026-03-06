import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const SRC_DIR = path.resolve(__dirname, '../../');

function getAllFiles(dir: string, exts: string[]): string[] {
  const files: string[] = [];
  if (!fs.existsSync(dir)) return files;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip test directories and node_modules
      if (entry.name === '__tests__' || entry.name === 'node_modules') continue;
      files.push(...getAllFiles(fullPath, exts));
    } else if (exts.some((ext) => entry.name.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  return files;
}

describe('QA — Code Quality Checks', () => {
  const sourceFiles = getAllFiles(SRC_DIR, ['.ts', '.tsx']);

  it('found source files to check', () => {
    expect(sourceFiles.length).toBeGreaterThan(0);
  });

  it('no TODO comments in production code', () => {
    const filesWithTodo: string[] = [];
    for (const file of sourceFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      // Match standalone TODO comments (not in variable names etc.)
      if (/\/\/\s*TODO\b/i.test(content) || /\/\*\s*TODO\b/i.test(content)) {
        filesWithTodo.push(path.relative(SRC_DIR, file));
      }
    }
    expect(filesWithTodo).toEqual([]);
  });

  it('no FIXME comments in production code', () => {
    const filesWithFixme: string[] = [];
    for (const file of sourceFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      if (/\/\/\s*FIXME\b/i.test(content) || /\/\*\s*FIXME\b/i.test(content)) {
        filesWithFixme.push(path.relative(SRC_DIR, file));
      }
    }
    expect(filesWithFixme).toEqual([]);
  });

  it('no HACK comments in production code', () => {
    const filesWithHack: string[] = [];
    for (const file of sourceFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      if (/\/\/\s*HACK\b/i.test(content) || /\/\*\s*HACK\b/i.test(content)) {
        filesWithHack.push(path.relative(SRC_DIR, file));
      }
    }
    expect(filesWithHack).toEqual([]);
  });
});

describe('QA — Component Exports', () => {
  const componentFiles = getAllFiles(
    path.join(SRC_DIR, 'components'),
    ['.tsx']
  );

  it('found component files', () => {
    expect(componentFiles.length).toBeGreaterThan(0);
  });

  it('all component files have a default or named export', () => {
    const noExport: string[] = [];
    for (const file of componentFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const hasExport =
        content.includes('export default') ||
        content.includes('export function') ||
        content.includes('export const') ||
        content.includes('export {');
      if (!hasExport) {
        noExport.push(path.relative(SRC_DIR, file));
      }
    }
    expect(noExport).toEqual([]);
  });
});

describe('QA — API Route Exports', () => {
  const apiDir = path.join(SRC_DIR, 'app', 'api');
  const routeFiles = getAllFiles(apiDir, ['.ts']);

  it('found API route files', () => {
    expect(routeFiles.length).toBeGreaterThan(0);
  });

  it('all API routes export HTTP method handlers', () => {
    const noHandler: string[] = [];
    for (const file of routeFiles) {
      if (!file.endsWith('route.ts')) continue;
      const content = fs.readFileSync(file, 'utf-8');
      const hasHandler =
        content.includes('export async function GET') ||
        content.includes('export async function POST') ||
        content.includes('export async function PUT') ||
        content.includes('export async function PATCH') ||
        content.includes('export async function DELETE') ||
        content.includes('export function GET') ||
        content.includes('export function POST') ||
        content.includes('export function PUT') ||
        content.includes('export function PATCH') ||
        content.includes('export function DELETE');
      if (!hasHandler) {
        noHandler.push(path.relative(SRC_DIR, file));
      }
    }
    expect(noHandler).toEqual([]);
  });
});

describe('QA — No console.log in Production Code', () => {
  const sourceFiles = getAllFiles(SRC_DIR, ['.ts', '.tsx']);

  it('no console.log statements (console.error/warn allowed)', () => {
    const filesWithConsoleLog: string[] = [];
    for (const file of sourceFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        // Skip commented-out lines
        if (trimmed.startsWith('//') || trimmed.startsWith('*')) continue;
        // Match console.log but not console.error or console.warn
        if (/\bconsole\.log\b/.test(trimmed)) {
          filesWithConsoleLog.push(path.relative(SRC_DIR, file));
          break;
        }
      }
    }
    expect(filesWithConsoleLog).toEqual([]);
  });
});
