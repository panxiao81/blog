import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

import { beforeAll, expect, test } from 'vitest';

import { buildFixtureSite, distDir } from './support/site-build';

const rootIndexPath = path.join(distDir, 'index.html');

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
  buildFixtureSite();
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
