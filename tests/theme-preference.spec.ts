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

function extractThemeScript(html: string) {
  const match = html.match(/<script data-theme-init>([\s\S]*?)<\/script>/);

  if (!match) {
    throw new Error('Expected page to include an inline theme initialisation script.');
  }

  return match[1];
}

function extractThemeInteractionScript(html: string) {
  const match = html.match(/<script data-theme-interact>([\s\S]*?)<\/script>/);

  if (!match) {
    throw new Error('Expected page to include an inline theme interaction script.');
  }

  return match[1];
}

type MockButton = {
  dataTheme: string;
  ariaPressedValue: string | null;
  clickHandler: (() => void) | null;
};

function runThemeInteractionScript(script: string, options: {
  storedTheme?: string | null;
  prefersColorSchemeDark?: boolean;
}) {
  const classList = makeClassList();
  const storedValues: Record<string, string> = {};

  if (options.storedTheme) {
    storedValues['theme-preference'] = options.storedTheme;
  }

  const buttons: MockButton[] = ['light', 'dark', 'system'].map((t) => ({
    dataTheme: t,
    ariaPressedValue: null,
    clickHandler: null,
  }));

  const context = {
    localStorage: {
      getItem: (key: string) => storedValues[key] ?? null,
      setItem: (key: string, value: string) => { storedValues[key] = value; },
    },
    window: {
      matchMedia: (query: string) => ({
        matches: query === '(prefers-color-scheme: dark)' && (options.prefersColorSchemeDark ?? false),
      }),
    },
    document: {
      documentElement: { classList },
      querySelectorAll: (_: string) => ({
        forEach: (fn: (el: unknown) => void) => {
          buttons.forEach((btn) => {
            fn({
              getAttribute: (attr: string) => attr === 'data-theme' ? btn.dataTheme : null,
              setAttribute: (attr: string, value: string) => {
                if (attr === 'aria-pressed') btn.ariaPressedValue = value;
              },
              addEventListener: (_evt: string, handler: () => void) => {
                btn.clickHandler = handler;
              },
            });
          });
        },
      }),
    },
  };

  vm.runInNewContext(script, context);

  return { buttons, storedValues, classList };
}

type ClassList = {
  add: (cls: string) => void;
  remove: (cls: string) => void;
  toggle: (cls: string, force?: boolean) => void;
  contains: (cls: string) => boolean;
  _classes: Set<string>;
};

function makeClassList(): ClassList {
  const _classes = new Set<string>();
  return {
    _classes,
    add(cls: string) { _classes.add(cls); },
    remove(cls: string) { _classes.delete(cls); },
    toggle(cls: string, force?: boolean) {
      if (force === true) _classes.add(cls);
      else if (force === false) _classes.delete(cls);
      else if (_classes.has(cls)) _classes.delete(cls);
      else _classes.add(cls);
    },
    contains(cls: string) { return _classes.has(cls); },
  };
}

function runThemeScript(script: string, options: {
  storedTheme?: string | null;
  prefersColorSchemeDark?: boolean;
}) {
  const classList = makeClassList();

  const context = {
    localStorage: {
      getItem(key: string) {
        if (key === 'theme-preference') {
          return options.storedTheme ?? null;
        }
        return null;
      },
    },
    window: {
      matchMedia(query: string) {
        return {
          matches: query === '(prefers-color-scheme: dark)' && (options.prefersColorSchemeDark ?? false),
        };
      },
    },
    document: {
      documentElement: { classList },
    },
  };

  vm.runInNewContext(script, context);

  return classList._classes;
}

beforeAll(() => {
  rmSync(distDir, { recursive: true, force: true });
  buildSite();
});

test('zh page renders a theme menu with all three theme options', () => {
  const html = readFileSync(zhIndexPath, 'utf8');

  expect(html).toContain('aria-label="Theme"');
  expect(html).toContain('data-theme="light"');
  expect(html).toContain('data-theme="dark"');
  expect(html).toContain('data-theme="system"');
});

test('theme init script applies dark class when preference is dark', () => {
  const html = readFileSync(zhIndexPath, 'utf8');
  const script = extractThemeScript(html);
  const classes = runThemeScript(script, { storedTheme: 'dark' });

  expect(classes.has('dark')).toBe(true);
});

test('theme init script applies no dark class when preference is light', () => {
  const html = readFileSync(zhIndexPath, 'utf8');
  const script = extractThemeScript(html);
  const classes = runThemeScript(script, { storedTheme: 'light', prefersColorSchemeDark: true });

  expect(classes.has('dark')).toBe(false);
});

test('theme init script follows system dark preference when no stored theme', () => {
  const html = readFileSync(zhIndexPath, 'utf8');
  const script = extractThemeScript(html);
  const classes = runThemeScript(script, { storedTheme: null, prefersColorSchemeDark: true });

  expect(classes.has('dark')).toBe(true);
});

test('theme interaction script marks the stored theme button as active', () => {
  const html = readFileSync(zhIndexPath, 'utf8');
  const script = extractThemeInteractionScript(html);
  const { buttons } = runThemeInteractionScript(script, { storedTheme: 'dark' });

  const darkBtn = buttons.find((b) => b.dataTheme === 'dark')!;
  const lightBtn = buttons.find((b) => b.dataTheme === 'light')!;

  expect(darkBtn.ariaPressedValue).toBe('true');
  expect(lightBtn.ariaPressedValue).toBe('false');
});

test('theme interaction script persists new preference when a theme button is clicked', () => {
  const html = readFileSync(zhIndexPath, 'utf8');
  const script = extractThemeInteractionScript(html);
  const { buttons, storedValues } = runThemeInteractionScript(script, { storedTheme: 'light' });

  const darkBtn = buttons.find((b) => b.dataTheme === 'dark')!;
  darkBtn.clickHandler!();

  expect(storedValues['theme-preference']).toBe('dark');
});
