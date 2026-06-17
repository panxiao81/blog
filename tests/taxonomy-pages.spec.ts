import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { beforeAll, expect, test } from 'vitest';

import { buildFixtureSite, distDir } from './support/site-build';

// Runs against the fixed fixture content set (tests/fixtures/posts). Taxonomy
// shape there: tag `journal` is on all 13 posts (so it paginates), tag
// `algorithm` is on the 3 算法 posts, and series Handbook / 408 / Algorithm all
// exist. These facts are owned by the fixtures, not by real content.
beforeAll(() => {
  buildFixtureSite();
});

test('zh tags landing page lists locale-scoped terms with links and counts', () => {
  const zhTagsPath = path.join(distDir, 'zh', 'tags', 'index.html');

  expect(existsSync(zhTagsPath)).toBe(true);

  const html = readFileSync(zhTagsPath, 'utf8');

  expect(html).toContain('<title>标签 | Xiao Pan</title>');
  expect(html).toContain('href="/zh/tags/journal/"');
  expect(html).toContain('href="/zh/tags/algorithm/"');
  expect(html).toContain('(13)');
  expect(html).toContain('(3)');
});

test('zh tag result page renders the matching posts with an explicit heading', () => {
  const zhAlgorithmTagPath = path.join(distDir, 'zh', 'tags', 'algorithm', 'index.html');

  expect(existsSync(zhAlgorithmTagPath)).toBe(true);

  const html = readFileSync(zhAlgorithmTagPath, 'utf8');

  expect(html).toContain('<title>标签: algorithm | Xiao Pan</title>');
  expect(html).toContain('算法与数据结构 -- 栈');
  expect(html).toContain('算法与数据结构 -- 队列');
  expect(html).not.toContain('Rich Post');
});

test('zh tag result pages use a clean page 1 route and paginate older posts', () => {
  // The `journal` tag is on all 13 fixture posts, so it spans two pages.
  const zhTagPath = path.join(distDir, 'zh', 'tags', 'journal', 'index.html');
  const zhTagPage2Path = path.join(distDir, 'zh', 'tags', 'journal', 'page', '2', 'index.html');

  expect(existsSync(zhTagPath)).toBe(true);
  expect(existsSync(zhTagPage2Path)).toBe(true);

  const page1Html = readFileSync(zhTagPath, 'utf8');
  const page2Html = readFileSync(zhTagPage2Path, 'utf8');

  expect(page1Html).toContain('标签: journal');
  // Page 1 holds the newest 10 and links onward; the rest spill to page 2.
  expect(page1Html).toContain('href="/zh/tags/journal/page/2/"');
  expect(page1Html).toContain('Rich Post');
  expect(page1Html).not.toContain('Fixture Note Seven');
  expect(page2Html).toContain('Fixture Note Seven');
  expect(page2Html).toContain('Oldest Fixture Note');
});

test('en tags landing page stays empty instead of showing source-post placeholders', () => {
  const enTagsPath = path.join(distDir, 'en', 'tags', 'index.html');

  expect(existsSync(enTagsPath)).toBe(true);

  const html = readFileSync(enTagsPath, 'utf8');

  expect(html).toContain('Nothing here yet.');
  expect(html).not.toContain('Rich Post');
  expect(html).not.toContain('/zh/posts/');
});

test('zh series landing page lists series terms instead of an empty state', () => {
  const zhSeriesPath = path.join(distDir, 'zh', 'series', 'index.html');

  expect(existsSync(zhSeriesPath)).toBe(true);

  const html = readFileSync(zhSeriesPath, 'utf8');

  expect(html).toContain('<title>系列 | Xiao Pan</title>');
  expect(html).toContain('href="/zh/series/Handbook/"');
  expect(html).toContain('href="/zh/series/408/"');
  expect(html).toContain('href="/zh/series/Algorithm/"');
});

test('zh post pages link taxonomy terms back to their locale-scoped routes', () => {
  const zhPostPath = path.join(distDir, 'zh', 'posts', 'algorithm-array', 'index.html');

  expect(existsSync(zhPostPath)).toBe(true);

  const html = readFileSync(zhPostPath, 'utf8');

  expect(html).toContain('href="/zh/tags/algorithm/"');
  expect(html).toContain('href="/zh/categories/Algorithm/"');
  expect(html).toContain('href="/zh/series/Algorithm/"');
});
