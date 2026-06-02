import { execFileSync } from 'node:child_process';
import { readFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

import { beforeAll, expect, test } from 'vitest';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(repoRoot, 'dist');
const zhIndexPath = path.join(distDir, 'zh', 'index.html');
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

test('zh page renders a desktop search form visible by default', () => {
  const html = readFileSync(zhIndexPath, 'utf8');

  expect(html).toContain('role="search"');
  expect(html).toContain('data-search="desktop"');
  expect(html).toContain('aria-label=');
});

test('zh page renders a mobile search toggle button', () => {
  const html = readFileSync(zhIndexPath, 'utf8');

  expect(html).toContain('data-search="mobile-toggle"');
  expect(html).toContain('aria-expanded');
  expect(html).toContain('aria-controls');
});

test('search form action targets Google site search on the canonical domain', () => {
  const html = readFileSync(zhIndexPath, 'utf8');

  expect(html).toContain('action="https://www.google.com/search"');
  expect(html).toContain('name="sitesearch"');
});

test('zh page renders a mobile search panel that is initially hidden', () => {
  const html = readFileSync(zhIndexPath, 'utf8');

  expect(html).toContain('id="mobile-search"');
  expect(html).toContain('data-search="mobile"');
  expect(html).toContain('hidden');
});

test('mobile toggle button script expands and collapses the search panel', () => {
  const html = readFileSync(zhIndexPath, 'utf8');
  const match = html.match(/<script data-search-toggle>([\s\S]*?)<\/script>/);

  if (!match) {
    throw new Error('Expected page to include a mobile search toggle script.');
  }

  const script = match[1];
  let panelHidden = true;
  let toggleExpanded = 'false';

  const context = {
    document: {
      querySelector: (sel: string) => {
        if (sel === '[data-search="mobile-toggle"]') {
          return {
            getAttribute: () => toggleExpanded,
            setAttribute: (_attr: string, value: string) => { toggleExpanded = value; },
            addEventListener: (_evt: string, handler: () => void) => {
              (context as Record<string, unknown>)._toggleHandler = handler;
            },
          };
        }
        if (sel === '#mobile-search') {
          return {
            get hidden() { return panelHidden; },
            set hidden(v: boolean) { panelHidden = v; },
          };
        }
        return null;
      },
    },
  } as Record<string, unknown>;

  vm.runInNewContext(script, context);

  const toggle = (context as Record<string, unknown>)._toggleHandler as () => void;

  toggle();
  expect(panelHidden).toBe(false);
  expect(toggleExpanded).toBe('true');

  toggle();
  expect(panelHidden).toBe(true);
  expect(toggleExpanded).toBe('false');
});
