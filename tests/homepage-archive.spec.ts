import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { beforeAll, expect, test } from 'vitest';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(repoRoot, 'dist');
const zhHomePath = path.join(distDir, 'zh', 'index.html');
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function buildSite() {
  execFileSync(npmCommand, ['run', 'build'], {
    cwd: repoRoot,
    env: { ...process.env, CI: '1' },
    stdio: 'pipe',
  });
}

beforeAll(() => {
  rmSync(distDir, { recursive: true, force: true });
  buildSite();
});

test('zh home page renders the most recent post items from typed post content', () => {
  expect(existsSync(zhHomePath)).toBe(true);

  const html = readFileSync(zhHomePath, 'utf8');

  expect(html).toContain('Second Note');
  expect(html).toContain('The second source post.');
  expect(html).toContain('Third Note');
  expect(html).toContain('href="/zh/posts/second-note/"');
  expect(html).toContain('href="/zh/posts/third-note/"');
});

test('zh archive page renders recent post title, date, and taxonomy labels', () => {
  const zhArchivePath = path.join(distDir, 'zh', 'archive', 'index.html');

  expect(existsSync(zhArchivePath)).toBe(true);

  const html = readFileSync(zhArchivePath, 'utf8');

  expect(html).toContain('<title>Archive | Xiao Pan</title>');
  expect(html).toContain('Second Note');
  expect(html).toContain('2024-01-04');
  expect(html).toContain('update');
  expect(html).toContain('notes');
});

test('en home page shows source-post placeholders in date order when no translations exist', () => {
  const enHomePath = path.join(distDir, 'en', 'index.html');
  const html = readFileSync(enHomePath, 'utf8');

  expect(html).toContain('Second Note');
  expect(html).toContain('Third Note');
  expect(html).not.toContain('Hello World');
  expect(html).toContain('href="/zh/posts/second-note/"');
  expect(html).toContain('href="/zh/posts/third-note/"');
  expect(html).toContain('中文');
});

test('zh home page uses a clean page 1 route and omits the intro blurb on page 2', () => {
  const zhPage2Path = path.join(distDir, 'zh', 'page', '2', 'index.html');
  const page1Html = readFileSync(zhHomePath, 'utf8');

  expect(existsSync(zhPage2Path)).toBe(true);
  expect(page1Html).toContain('这里发布文章、笔记与作品。');
  expect(page1Html).not.toContain('Hello World');

  const page2Html = readFileSync(zhPage2Path, 'utf8');

  expect(page2Html).not.toContain('这里发布文章、笔记与作品。');
  expect(page2Html).toContain('Hello World');
});

test('zh archive uses a clean page 1 route and exposes page 2 for older posts', () => {
  const zhArchivePath = path.join(distDir, 'zh', 'archive', 'index.html');
  const zhArchivePage2Path = path.join(distDir, 'zh', 'archive', 'page', '2', 'index.html');
  const page1Html = readFileSync(zhArchivePath, 'utf8');

  expect(existsSync(zhArchivePage2Path)).toBe(true);
  expect(page1Html).not.toContain('Hello World');

  const page2Html = readFileSync(zhArchivePage2Path, 'utf8');

  expect(page2Html).toContain('Hello World');
  expect(page2Html).toContain('2024-01-02');
});

test('en archive shows source-post placeholders linking to zh posts', () => {
  const enArchivePath = path.join(distDir, 'en', 'archive', 'index.html');
  const html = readFileSync(enArchivePath, 'utf8');

  expect(html).toContain('Second Note');
  expect(html).toContain('href="/zh/posts/second-note/"');
  expect(html).toContain('中文');
});
