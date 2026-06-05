import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { beforeAll, expect, test } from 'vitest';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(repoRoot, 'dist');
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

test('zh tags landing page lists locale-scoped terms with links and counts', () => {
  const zhTagsPath = path.join(distDir, 'zh', 'tags', 'index.html');

  expect(existsSync(zhTagsPath)).toBe(true);

  const html = readFileSync(zhTagsPath, 'utf8');

  expect(html).toContain('<title>标签 | Xiao Pan</title>');
  expect(html).toContain('href="/zh/tags/intro/"');
  expect(html).toContain('href="/zh/tags/update/"');
  expect(html).toContain('(1)');
  expect(html).toContain('(2)');
});

test('zh tag result page renders the matching posts with an explicit heading', () => {
  const zhUpdateTagPath = path.join(distDir, 'zh', 'tags', 'update', 'index.html');

  expect(existsSync(zhUpdateTagPath)).toBe(true);

  const html = readFileSync(zhUpdateTagPath, 'utf8');

  expect(html).toContain('<title>标签: update | Xiao Pan</title>');
  expect(html).toContain('Second Note');
  expect(html).toContain('Third Note');
  expect(html).not.toContain('Hello World');
});

test('zh category result pages use a clean page 1 route and paginate older posts', () => {
  const zhCategoryPath = path.join(distDir, 'zh', 'categories', 'notes', 'index.html');
  const zhCategoryPage2Path = path.join(distDir, 'zh', 'categories', 'notes', 'page', '2', 'index.html');

  expect(existsSync(zhCategoryPath)).toBe(true);
  expect(existsSync(zhCategoryPage2Path)).toBe(true);

  const page1Html = readFileSync(zhCategoryPath, 'utf8');
  const page2Html = readFileSync(zhCategoryPage2Path, 'utf8');

  expect(page1Html).toContain('分类: notes');
  expect(page1Html).toContain('Rich Post');
  expect(page1Html).toContain('Second Note');
  expect(page1Html).not.toContain('Third Note');
  expect(page1Html).not.toContain('Hello World');
  expect(page2Html).toContain('Third Note');
  expect(page2Html).toContain('Hello World');
});

test('en tags landing page stays empty instead of showing source-post placeholders', () => {
  const enTagsPath = path.join(distDir, 'en', 'tags', 'index.html');

  expect(existsSync(enTagsPath)).toBe(true);

  const html = readFileSync(enTagsPath, 'utf8');

  expect(html).toContain('Nothing here yet.');
  expect(html).not.toContain('Second Note');
  expect(html).not.toContain('/zh/posts/');
});

test('zh series landing page renders an empty state instead of 404 when no series exist', () => {
  const zhSeriesPath = path.join(distDir, 'zh', 'series', 'index.html');

  expect(existsSync(zhSeriesPath)).toBe(true);

  const html = readFileSync(zhSeriesPath, 'utf8');

  expect(html).toContain('这里还没有内容。');
});

test('zh post pages link taxonomy terms back to their locale-scoped routes', () => {
  const zhPostPath = path.join(distDir, 'zh', 'posts', 'hello-world', 'index.html');

  expect(existsSync(zhPostPath)).toBe(true);

  const html = readFileSync(zhPostPath, 'utf8');

  expect(html).toContain('href="/zh/tags/intro/"');
  expect(html).toContain('href="/zh/categories/notes/"');
});
