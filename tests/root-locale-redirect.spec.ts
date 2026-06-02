import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

import { beforeAll, expect, test } from 'vitest';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(repoRoot, 'dist');
const rootIndexPath = path.join(distDir, 'index.html');
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function buildSite() {
  execFileSync(npmCommand, ['run', 'build'], {
    cwd: repoRoot,
    env: { ...process.env, CI: '1' },
    stdio: 'pipe',
  });
}

function extractRedirectScript(html: string) {
  const match = html.match(/<script>([\s\S]*?)<\/script>/);

  if (!match) {
    throw new Error('Expected root page to include an inline redirect script.');
  }

  return match[1];
}

function runRedirectScript(script: string, options: {
  storedLocale?: string | null;
  navigatorLanguages?: string[];
  navigatorLanguage?: string;
}) {
  let redirectedTo: string | null = null;

  const context = {
    localStorage: {
      getItem(key: string) {
        if (key === 'preferred-locale') {
          return options.storedLocale ?? null;
        }

        return null;
      },
    },
    navigator: {
      languages: options.navigatorLanguages ?? [],
      language: options.navigatorLanguage,
    },
    location: {
      replace(value: string) {
        redirectedTo = value;
      },
    },
  };

  vm.runInNewContext(script, context);

  return redirectedTo;
}

beforeAll(() => {
  rmSync(distDir, { recursive: true, force: true });
  buildSite();
});

test('root redirect prefers a saved locale choice over browser language', () => {
  expect(existsSync(rootIndexPath)).toBe(true);

  const html = readFileSync(rootIndexPath, 'utf8');
  const script = extractRedirectScript(html);
  const redirectedTo = runRedirectScript(script, {
    storedLocale: 'ja',
    navigatorLanguages: ['en-US'],
    navigatorLanguage: 'en-US',
  });

  expect(redirectedTo).toBe('/ja/');
});

test('root redirect falls back to browser language when no saved locale exists', () => {
  const html = readFileSync(rootIndexPath, 'utf8');
  const script = extractRedirectScript(html);
  const redirectedTo = runRedirectScript(script, {
    storedLocale: null,
    navigatorLanguages: ['ja-JP'],
    navigatorLanguage: 'ja-JP',
  });

  expect(redirectedTo).toBe('/ja/');
});

test('root page exposes /zh/ as the non-JS fallback', () => {
  const html = readFileSync(rootIndexPath, 'utf8');

  expect(html).toContain('http-equiv="refresh"');
  expect(html).toContain('0;url=/zh/');
  expect(html).toContain('href="/zh/"');
});
