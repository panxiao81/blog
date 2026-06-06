import { execFileSync } from 'node:child_process';
import { readFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { beforeAll, expect, test } from 'vitest';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(repoRoot, 'dist');
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function buildSite() {
  execFileSync(npmCommand, ['run', 'build'], {
    cwd: repoRoot,
    env: {
      ...process.env,
      CI: '1',
      SITE: 'https://example.com',
      GTAG_ID: 'G-TESTID1234',
      ADSENSE_ID: 'ca-pub-1234567890123456',
      ADSENSE_LIST_SLOT: '1111111111',
      ADSENSE_POST_SLOT: '2222222222',
    },
    stdio: 'pipe',
  });
}

beforeAll(() => {
  rmSync(distDir, { recursive: true, force: true });
  buildSite();
});

test('zh home page has consent banner element', () => {
  const html = readFileSync(path.join(distDir, 'zh', 'index.html'), 'utf8');

  expect(html).toContain('id="consent-banner"');
});

test('zh home page has Accept button with zh label', () => {
  const html = readFileSync(path.join(distDir, 'zh', 'index.html'), 'utf8');

  expect(html).toContain('id="consent-accept"');
  expect(html).toContain('接受');
});

test('zh home page has Decline button with zh label', () => {
  const html = readFileSync(path.join(distDir, 'zh', 'index.html'), 'utf8');

  expect(html).toContain('id="consent-decline"');
  expect(html).toContain('拒绝');
});

test('zh privacy page has data-consent-reopen button', () => {
  const html = readFileSync(path.join(distDir, 'zh', 'privacy', 'index.html'), 'utf8');

  expect(html).toContain('data-consent-reopen');
  expect(html).toContain('隐私设置');
});

test('zh home page has GA4 gtag init script', () => {
  const html = readFileSync(path.join(distDir, 'zh', 'index.html'), 'utf8');

  expect(html).toContain('G-TESTID1234');
  expect(html).toContain('gtag(');
  expect(html).toContain('analytics_storage');
});

test('zh home page has googletagmanager script tag', () => {
  const html = readFileSync(path.join(distDir, 'zh', 'index.html'), 'utf8');

  expect(html).toContain('googletagmanager.com/gtag/js');
});

test('zh home page has AdSense loader with publisher ID', () => {
  const html = readFileSync(path.join(distDir, 'zh', 'index.html'), 'utf8');

  expect(html).toContain('pagead2.googlesyndication.com/pagead/js/adsbygoogle.js');
  expect(html).toContain('ca-pub-1234567890123456');
});

test('zh home page has ad unit ins.adsbygoogle', () => {
  const html = readFileSync(path.join(distDir, 'zh', 'index.html'), 'utf8');

  expect(html).toContain('class="adsbygoogle"');
  expect(html).toContain('data-ad-client="ca-pub-1234567890123456"');
  expect(html).toContain('data-ad-slot="1111111111"');
});

test('zh archive page has ad unit ins.adsbygoogle', () => {
  const html = readFileSync(path.join(distDir, 'zh', 'archive', 'index.html'), 'utf8');

  expect(html).toContain('class="adsbygoogle"');
  expect(html).toContain('data-ad-slot="1111111111"');
});

test('zh hello-world post page has end-of-post ad unit with post slot', () => {
  const html = readFileSync(
    path.join(distDir, 'zh', 'posts', 'hello-world', 'index.html'),
    'utf8',
  );

  expect(html).toContain('class="adsbygoogle"');
  expect(html).toContain('data-ad-slot="2222222222"');
});
