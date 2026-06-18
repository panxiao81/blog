import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { beforeAll, expect, test } from 'vitest';

import { buildFixtureSite, distDir } from './support/site-build';

const zhAboutPath = path.join(distDir, 'zh', 'about', 'index.html');

beforeAll(() => {
  buildFixtureSite();
});

test('builds a zh About page through a shared layout with locale content', () => {
  expect(existsSync(zhAboutPath)).toBe(true);

  const html = readFileSync(zhAboutPath, 'utf8');

  expect(html).toContain('lang="zh"');
  expect(html).toContain('<title>关于 | Xiao Pan</title>');
  expect(html).toContain('潘潇');
  // A frontmatter-driven section renders (Experience/Skills), not just the header.
  expect(html).toContain('SDLab');
  expect(html).toContain('RHCSA');
  expect(html).toContain('href="/zh/"');
});

test('builds a zh Links page from translated content files', () => {
  const zhLinksPath = path.join(distDir, 'zh', 'links', 'index.html');

  expect(existsSync(zhLinksPath)).toBe(true);

  const html = readFileSync(zhLinksPath, 'utf8');

  expect(html).toContain('<title>链接 | Xiao Pan</title>');
  // The shared friend-link set renders from the localized content file.
  expect(html).toContain('https://www.tianlangz.top');
});

test('builds a zh Privacy page from translated content files', () => {
  const zhPrivacyPath = path.join(distDir, 'zh', 'privacy', 'index.html');

  expect(existsSync(zhPrivacyPath)).toBe(true);

  const html = readFileSync(zhPrivacyPath, 'utf8');

  expect(html).toContain('<title>隐私 | Xiao Pan</title>');
  // A section from the localized privacy policy renders, not just the page chrome.
  expect(html).toContain('收集哪些信息');
});

test('zh home page links to About and Links in the header and Privacy in the footer', () => {
  const zhHomePath = path.join(distDir, 'zh', 'index.html');
  const html = readFileSync(zhHomePath, 'utf8');

  expect(html).toContain('href="/zh/about/"');
  expect(html).toContain('href="/zh/links/"');
  expect(html).toContain('href="/zh/privacy/"');
});
