import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { beforeAll, expect, test } from 'vitest';

import { buildFixtureSite, distDir } from './support/site-build';

// Runs against the fixed fixture content set (tests/fixtures/posts). Relevant
// posts: `rich-post` is newest and autoTranslated; `algorithm-array` sits in
// the middle of the sequence and carries TOC headings + KaTeX math.
beforeAll(() => {
  buildFixtureSite();
});

test('rich-post renders a translation notice because autoTranslated is true', () => {
  const richPostPath = path.join(distDir, 'zh', 'posts', 'rich-post', 'index.html');

  expect(existsSync(richPostPath)).toBe(true);

  const html = readFileSync(richPostPath, 'utf8');

  expect(html).toContain('本文由机器翻译生成。');
});

test('algorithm-array does not render a translation notice because autoTranslated is false', () => {
  const algorithmArrayPath = path.join(distDir, 'zh', 'posts', 'algorithm-array', 'index.html');
  const html = readFileSync(algorithmArrayPath, 'utf8');

  expect(html).not.toContain('本文由机器翻译生成。');
  expect(html).not.toContain('This post was automatically translated.');
});

test('algorithm-array TOC links are rendered in the built HTML', () => {
  const algorithmArrayPath = path.join(distDir, 'zh', 'posts', 'algorithm-array', 'index.html');
  const html = readFileSync(algorithmArrayPath, 'utf8');

  expect(html).toContain('href="#顺序表"');
  expect(html).toContain('href="#初始化"');
  expect(html).toContain('href="#删除"');
});

test('the newest post has only an Older link because nothing is newer', () => {
  // rich-post (2024-03-13) is the newest fixture post; the next-older is feature-tour.
  const newestPostPath = path.join(distDir, 'zh', 'posts', 'rich-post', 'index.html');
  const html = readFileSync(newestPostPath, 'utf8');

  expect(html).toContain('href="/zh/posts/feature-tour/"');
  expect(html).toContain('<span class="text-zinc-500 dark:text-zinc-400">更早</span>');
  expect(html).not.toContain('<span class="text-zinc-500 dark:text-zinc-400">更新</span>');
});

test('algorithm-array has both Newer and Older links because it sits within the imported sequence', () => {
  const algorithmArrayPath = path.join(distDir, 'zh', 'posts', 'algorithm-array', 'index.html');
  const html = readFileSync(algorithmArrayPath, 'utf8');

  expect(html).toContain('更早');
  expect(html).toContain('更新');
});

test('representative zh posts render the CC BY-SA license footer', () => {
  for (const slug of ['rich-post', 'algorithm-array', 'feature-tour', 'hello-world']) {
    const postPath = path.join(distDir, 'zh', 'posts', slug, 'index.html');
    const html = readFileSync(postPath, 'utf8');

    expect(html, `${slug} should have license footer`).toContain('CC BY-SA 4.0');
  }
});

test('algorithm-array embeds the Utterances script with a locale-agnostic comment key', () => {
  const algorithmArrayPath = path.join(distDir, 'zh', 'posts', 'algorithm-array', 'index.html');
  const html = readFileSync(algorithmArrayPath, 'utf8');

  expect(html).toContain('utteranc.es/client.js');
  expect(html).toContain('data-repo="panxiao81/new-blog"');
  // Comment Key matches the legacy Utterances issue-term: no leading slash,
  // no locale prefix, so existing threads stay attached across locales.
  expect(html).toContain('data-issue-term="posts/algorithm-array/"');
});

test('algorithm-array renders pre-rendered KaTeX math output', () => {
  const algorithmArrayPath = path.join(distDir, 'zh', 'posts', 'algorithm-array', 'index.html');
  const html = readFileSync(algorithmArrayPath, 'utf8');

  expect(html).toContain('katex');
});
