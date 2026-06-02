import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { beforeAll, expect, test } from 'vitest';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(repoRoot, 'dist');
const zhPostPath = path.join(distDir, 'zh', 'posts', 'hello-world', 'index.html');
const enPostPath = path.join(distDir, 'en', 'posts', 'hello-world', 'index.html');
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

test('builds a zh source post to a locale-prefixed post route', () => {
  expect(existsSync(zhPostPath)).toBe(true);

  const html = readFileSync(zhPostPath, 'utf8');

  expect(html).toContain('lang="zh"');
  expect(html).toContain('Hello World');
  expect(html).toContain('2024-01-02');
});

test('does not generate translated post routes that do not exist', () => {
  expect(existsSync(enPostPath)).toBe(false);
});
