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

test('rich-post renders a translation notice because autoTranslated is true', () => {
  const richPostPath = path.join(distDir, 'zh', 'posts', 'rich-post', 'index.html');

  expect(existsSync(richPostPath)).toBe(true);

  const html = readFileSync(richPostPath, 'utf8');

  expect(html).toContain('本文由机器翻译生成。');
});

test('hello-world does not render a translation notice because autoTranslated is false', () => {
  const helloPath = path.join(distDir, 'zh', 'posts', 'hello-world', 'index.html');
  const html = readFileSync(helloPath, 'utf8');

  expect(html).not.toContain('本文由机器翻译生成。');
  expect(html).not.toContain('This post was automatically translated.');
});

test('rich-post TOC links are rendered in the built HTML', () => {
  const richPostPath = path.join(distDir, 'zh', 'posts', 'rich-post', 'index.html');
  const html = readFileSync(richPostPath, 'utf8');

  expect(html).toContain('href="#introduction"');
  expect(html).toContain('href="#code-example"');
  expect(html).toContain('href="#math"');
});

test('hello-world has only a Newer link because it is the oldest post', () => {
  const helloPath = path.join(distDir, 'zh', 'posts', 'hello-world', 'index.html');
  const html = readFileSync(helloPath, 'utf8');

  expect(html).toContain('更新');
  expect(html).not.toContain('更早');
});

test('rich-post has only an Older link because it is the newest post', () => {
  const richPostPath = path.join(distDir, 'zh', 'posts', 'rich-post', 'index.html');
  const html = readFileSync(richPostPath, 'utf8');

  expect(html).toContain('更早');
  expect(html).not.toContain('更新');
});

test('all zh posts render the CC BY-SA license footer', () => {
  for (const slug of ['hello-world', 'second-note', 'third-note', 'rich-post']) {
    const postPath = path.join(distDir, 'zh', 'posts', slug, 'index.html');
    const html = readFileSync(postPath, 'utf8');

    expect(html, `${slug} should have license footer`).toContain('CC BY-SA 4.0');
  }
});

test('rich-post embeds the Utterances script with a locale-agnostic comment key', () => {
  const richPostPath = path.join(distDir, 'zh', 'posts', 'rich-post', 'index.html');
  const html = readFileSync(richPostPath, 'utf8');

  expect(html).toContain('utteranc.es/client.js');
  expect(html).toContain('/posts/rich-post/');
});

test('rich-post renders pre-rendered KaTeX math output', () => {
  const richPostPath = path.join(distDir, 'zh', 'posts', 'rich-post', 'index.html');
  const html = readFileSync(richPostPath, 'utf8');

  expect(html).toContain('katex');
});
