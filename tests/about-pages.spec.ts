import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { beforeAll, expect, test } from 'vitest';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(repoRoot, 'dist');
const zhAboutPath = path.join(distDir, 'zh', 'about', 'index.html');
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

test('builds a zh About page through a shared layout with locale content', () => {
  expect(existsSync(zhAboutPath)).toBe(true);

  const html = readFileSync(zhAboutPath, 'utf8');

  expect(html).toContain('lang="zh"');
  expect(html).toContain('<title>关于 | Xiao Pan</title>');
  expect(html).toContain('这是关于页面。');
  expect(html).toContain('href="/zh/"');
});

test('builds a zh Links page from translated content files', () => {
  const zhLinksPath = path.join(distDir, 'zh', 'links', 'index.html');

  expect(existsSync(zhLinksPath)).toBe(true);

  const html = readFileSync(zhLinksPath, 'utf8');

  expect(html).toContain('<title>链接 | Xiao Pan</title>');
  expect(html).toContain('这些是链接页面内容。');
});

test('builds a zh Privacy page from translated content files', () => {
  const zhPrivacyPath = path.join(distDir, 'zh', 'privacy', 'index.html');

  expect(existsSync(zhPrivacyPath)).toBe(true);

  const html = readFileSync(zhPrivacyPath, 'utf8');

  expect(html).toContain('<title>隐私 | Xiao Pan</title>');
  expect(html).toContain('这是隐私页面内容。');
});

test('zh home page links to About and Links in the header and Privacy in the footer', () => {
  const zhHomePath = path.join(distDir, 'zh', 'index.html');
  const html = readFileSync(zhHomePath, 'utf8');

  expect(html).toContain('href="/zh/about/"');
  expect(html).toContain('href="/zh/links/"');
  expect(html).toContain('href="/zh/privacy/"');
});
