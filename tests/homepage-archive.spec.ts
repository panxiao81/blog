import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { beforeAll, expect, test } from 'vitest';

import { buildFixtureSite, distDir } from './support/site-build';

// These tests run against the fixed fixture content set (tests/fixtures/posts):
// 13 zh posts dated 2024-03-13 (newest, "Rich Post") down to 2024-03-01
// ("Oldest Fixture Note"), plus one en source post, "English Source Note"
// (2022-01-01), which is the oldest of all. With 10 posts per page, page 1 holds
// the newest 10 and page 2 holds the rest — the first of which is still
// "Fixture Note Seven" (2024-03-03). Adding or removing real posts does not
// touch these fixtures, so these assertions stay stable.
const zhHomePath = path.join(distDir, 'zh', 'index.html');

beforeAll(() => {
  buildFixtureSite();
});

test('zh home page renders the most recent post items from typed post content', () => {
  expect(existsSync(zhHomePath)).toBe(true);

  const html = readFileSync(zhHomePath, 'utf8');

  expect(html).toContain('Rich Post');
  expect(html).toContain('Feature Tour');
  expect(html).toContain('href="/zh/posts/rich-post/"');
  expect(html).toContain('href="/zh/posts/feature-tour/"');
});

test('zh archive page renders recent post title, date, and browseable taxonomy labels', () => {
  const zhArchivePath = path.join(distDir, 'zh', 'archive', 'index.html');

  expect(existsSync(zhArchivePath)).toBe(true);

  const html = readFileSync(zhArchivePath, 'utf8');

  expect(html).toContain('<title>归档 | Xiao Pan</title>');
  expect(html).toContain('Rich Post');
  expect(html).toContain('2024-03-13');
  expect(html).toContain('href="/zh/tags/journal/"');
  expect(html).toContain('href="/zh/categories/Guides/"');
});

test('en home page shows source-post placeholders in date order when no translations exist', () => {
  const enHomePath = path.join(distDir, 'en', 'index.html');
  const html = readFileSync(enHomePath, 'utf8');

  expect(html).toContain('Rich Post');
  expect(html).toContain('Feature Tour');
  // The oldest post belongs to page 2, so it is absent from the page 1 feed.
  expect(html).not.toContain('Oldest Fixture Note');
  expect(html).toContain('href="/zh/posts/rich-post/"');
  expect(html).toContain('href="/zh/posts/feature-tour/"');
  expect(html).toContain('中文 · Not in this locale yet.');
});

test('zh home page renders a pagination control linking onward to page 2', () => {
  const zhPage2Path = path.join(distDir, 'zh', 'page', '2', 'index.html');
  const page1Html = readFileSync(zhHomePath, 'utf8');

  expect(existsSync(zhPage2Path)).toBe(true);
  expect(page1Html).toContain('这里发布从原始写作语言出发的文章、笔记与作品。');
  // The pagination control links forward; the first page-2 post is not on page 1.
  expect(page1Html).toContain('href="/zh/page/2/"');
  expect(page1Html).not.toContain('Fixture Note Seven');

  const page2Html = readFileSync(zhPage2Path, 'utf8');

  expect(page2Html).not.toContain('这里发布从原始写作语言出发的文章、笔记与作品。');
  expect(page2Html).toContain('Fixture Note Seven');
  // Page 2 links back toward newer posts.
  expect(page2Html).toContain('rel="prev"');
});

test('zh archive uses a clean page 1 route and exposes page 2 for older posts', () => {
  const zhArchivePath = path.join(distDir, 'zh', 'archive', 'index.html');
  const zhArchivePage2Path = path.join(distDir, 'zh', 'archive', 'page', '2', 'index.html');
  const page1Html = readFileSync(zhArchivePath, 'utf8');

  expect(existsSync(zhArchivePage2Path)).toBe(true);
  expect(page1Html).toContain('href="/zh/archive/page/2/"');
  expect(page1Html).not.toContain('Fixture Note Seven');

  const page2Html = readFileSync(zhArchivePage2Path, 'utf8');

  expect(page2Html).toContain('Fixture Note Seven');
  expect(page2Html).toContain('2024-03-03');
});

test('en archive shows source-post placeholders linking to zh posts', () => {
  const enArchivePath = path.join(distDir, 'en', 'archive', 'index.html');
  const html = readFileSync(enArchivePath, 'utf8');

  expect(html).toContain('Rich Post');
  expect(html).toContain('href="/zh/posts/rich-post/"');
  expect(html).toContain('中文');
});

test('zh archive shows a source-post placeholder for an en-authored post', () => {
  // The en source post is the oldest entry, so its placeholder lands on the last
  // archive page. This proves placeholders propagate from any source Locale, not
  // only the default Locale.
  const zhArchivePage2Path = path.join(distDir, 'zh', 'archive', 'page', '2', 'index.html');
  const html = readFileSync(zhArchivePage2Path, 'utf8');

  expect(html).toContain('English Source Note');
  expect(html).toContain('href="/en/posts/english-source-note/"');
  expect(html).toContain('>EN</p>');
});

test('the en source post builds its own post page under /en/', () => {
  const enPostPath = path.join(distDir, 'en', 'posts', 'english-source-note', 'index.html');

  expect(existsSync(enPostPath)).toBe(true);
});
