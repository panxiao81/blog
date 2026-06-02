import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterEach, expect, test } from 'vitest';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const slug = 'tdd-source-post';
const mdxSlug = 'tdd-mdx-post';
const markdownPostPath = path.join(repoRoot, 'src', 'content', 'posts', 'zh', `${slug}.md`);
const mdxPostPath = path.join(repoRoot, 'src', 'content', 'posts', 'zh', `${mdxSlug}.mdx`);
const mdxFallbackMarkdownPath = path.join(repoRoot, 'src', 'content', 'posts', 'zh', `${mdxSlug}.md`);

afterEach(() => {
  rmSync(markdownPostPath, { force: true });
  rmSync(mdxPostPath, { force: true });
  rmSync(mdxFallbackMarkdownPath, { force: true });
});

test('creates a zh source post in markdown by default', () => {
  execFileSync(npmCommand, ['run', 'new-post', '--', slug], {
    cwd: repoRoot,
    env: { ...process.env, CI: '1' },
    stdio: 'pipe',
  });

  expect(existsSync(markdownPostPath)).toBe(true);

  const file = readFileSync(markdownPostPath, 'utf8');

  expect(file).toContain('title:');
  expect(file).toContain('date:');
  expect(file).toContain('draft: true');
  expect(file).toContain('autoTranslated: false');
  expect(file).toContain('tags:');
  expect(file).toContain('categories:');
  expect(file).toContain('series: []');
});

test('creates a zh source post in mdx when requested', () => {
  execFileSync(npmCommand, ['run', 'new-post', '--', mdxSlug, '--format', 'mdx'], {
    cwd: repoRoot,
    env: { ...process.env, CI: '1' },
    stdio: 'pipe',
  });

  expect(existsSync(mdxPostPath)).toBe(true);
  expect(existsSync(mdxFallbackMarkdownPath)).toBe(false);
});
