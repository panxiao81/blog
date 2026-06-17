import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { beforeAll, expect, test } from 'vitest';

import { buildFixtureSite, distDir } from './support/site-build';

// Runs against the fixed fixture content set (tests/fixtures/posts).
const zhPostPath = path.join(distDir, 'zh', 'posts', 'hello-world', 'index.html');
const enPostPath = path.join(distDir, 'en', 'posts', 'hello-world', 'index.html');
const nestedTitlePostPath = path.join(distDir, 'zh', 'posts', 'algorithm-array', 'index.html');

beforeAll(() => {
  buildFixtureSite();
});

test('builds a zh source post to a locale-prefixed post route', () => {
  expect(existsSync(zhPostPath)).toBe(true);

  const html = readFileSync(zhPostPath, 'utf8');

  expect(html).toContain('lang="zh"');
  expect(html).toContain('Hello World');
  expect(html).toContain('2024-03-08');
});

test('does not generate translated post routes that do not exist', () => {
  expect(existsSync(enPostPath)).toBe(false);
});

test('builds a source post with a CJK title to its derived zh route', () => {
  expect(existsSync(nestedTitlePostPath)).toBe(true);

  const html = readFileSync(nestedTitlePostPath, 'utf8');

  expect(html).toContain('算法与数据结构 -- 线性表（2）-- 顺序表');
  expect(html).toContain('2024-03-11');
});
