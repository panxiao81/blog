import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { beforeAll, expect, test } from 'vitest';

import { buildFixtureSite, distDir } from './support/site-build';

const zhIndexPath = path.join(distDir, 'zh', 'index.html');
const enIndexPath = path.join(distDir, 'en', 'index.html');
const frIndexPath = path.join(distDir, 'fr', 'index.html');

beforeAll(() => {
  buildFixtureSite();
});

test('builds a zh locale-prefixed home page through the shared site shell', () => {

  expect(existsSync(zhIndexPath)).toBe(true);

  const html = readFileSync(zhIndexPath, 'utf8');

  expect(html).toContain('lang="zh"');
  expect(html).toContain('Xiao Pan');
  expect(html).toContain('首页');
  expect(html).toContain('min-h-screen');
});

test('reuses the shared site shell for the en locale', () => {
  expect(existsSync(enIndexPath)).toBe(true);

  const html = readFileSync(enIndexPath, 'utf8');

  expect(html).toContain('lang="en"');
  expect(html).toContain('Xiao Pan');
  expect(html).toContain('Home');
});

test('does not generate unsupported locale routes', () => {
  expect(existsSync(frIndexPath)).toBe(false);
});

test('renders locale switcher with all locales in agreed order on zh page', () => {
  const html = readFileSync(zhIndexPath, 'utf8');

  expect(html).toContain('aria-label="Language"');
  expect(html).toContain('EN');
  expect(html).toContain('中文');
  expect(html).toContain('日本語');

  const enIndex = html.indexOf('EN');
  const zhIndex = html.indexOf('中文');
  const jaIndex = html.indexOf('日本語');

  expect(enIndex).toBeLessThan(zhIndex);
  expect(zhIndex).toBeLessThan(jaIndex);
});

test('marks the current locale as selected in the locale switcher', () => {
  const html = readFileSync(zhIndexPath, 'utf8');

  expect(html).toContain('aria-current="page"');
  expect(html).toMatch(/aria-current="page"[^>]*>中文/);
});

test('links non-current locales to their locale-prefixed pages', () => {
  const html = readFileSync(zhIndexPath, 'utf8');

  expect(html).toContain('href="/en/"');
  expect(html).toContain('href="/ja/"');
});
