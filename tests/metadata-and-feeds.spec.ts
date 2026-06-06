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
    env: { ...process.env, CI: '1', SITE: 'https://example.com' },
    stdio: 'pipe',
  });
}

beforeAll(() => {
  rmSync(distDir, { recursive: true, force: true });
  buildSite();
});

test('zh RSS feed exists and contains Rich Post title', () => {
  const rssPath = path.join(distDir, 'zh', 'rss.xml');

  expect(existsSync(rssPath)).toBe(true);

  const xml = readFileSync(rssPath, 'utf8');

  expect(xml).toContain('Rich Post');
  expect(xml).toContain('<channel>');
});

test('zh RSS feed includes the language element', () => {
  const xml = readFileSync(path.join(distDir, 'zh', 'rss.xml'), 'utf8');

  expect(xml).toContain('<language>zh</language>');
});

test('en RSS feed exists and is valid RSS XML', () => {
  const rssPath = path.join(distDir, 'en', 'rss.xml');

  expect(existsSync(rssPath)).toBe(true);

  const xml = readFileSync(rssPath, 'utf8');

  expect(xml).toContain('<rss');
  expect(xml).toContain('<channel>');
  expect(xml).toContain('<language>en</language>');
});

test('sitemap index exists when SITE is set', () => {
  const sitemapPath = path.join(distDir, 'sitemap-index.xml');

  expect(existsSync(sitemapPath)).toBe(true);
});

test('rich-post HTML has self-canonical link', () => {
  const html = readFileSync(
    path.join(distDir, 'zh', 'posts', 'rich-post', 'index.html'),
    'utf8',
  );

  expect(html).toContain('rel="canonical"');
  expect(html).toContain('href="https://example.com/zh/posts/rich-post/"');
});

test('rich-post HTML has default OG image', () => {
  const html = readFileSync(
    path.join(distDir, 'zh', 'posts', 'rich-post', 'index.html'),
    'utf8',
  );

  expect(html).toContain('og:image');
  expect(html).toContain('https://example.com/og-default.svg');
});

test('rich-post HTML has og:type article', () => {
  const html = readFileSync(
    path.join(distDir, 'zh', 'posts', 'rich-post', 'index.html'),
    'utf8',
  );

  expect(html).toContain('og:type');
  expect(html).toContain('article');
});

test('rich-post HTML has hreflang self-reference for zh', () => {
  const html = readFileSync(
    path.join(distDir, 'zh', 'posts', 'rich-post', 'index.html'),
    'utf8',
  );

  expect(html).toContain('rel="alternate"');
  expect(html).toContain('hreflang="zh"');
});

test('zh home page footer has RSS link', () => {
  const html = readFileSync(path.join(distDir, 'zh', 'index.html'), 'utf8');

  expect(html).toContain('href="/zh/rss.xml"');
  expect(html).toContain('RSS');
});

test('zh home page footer shows the founding year', () => {
  const html = readFileSync(path.join(distDir, 'zh', 'index.html'), 'utf8');

  expect(html).toContain('2024');
});

test('zh home page footer has Privacy Settings consent reopen button', () => {
  const html = readFileSync(path.join(distDir, 'zh', 'index.html'), 'utf8');

  expect(html).toContain('data-consent-reopen');
  expect(html).toContain('隐私设置');
});
