import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from 'vitest';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pnpmCommand = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';

test(
  'pnpm run lint exits successfully on the current codebase',
  () => {
    const pkg = JSON.parse(readFileSync(path.join(repoRoot, 'package.json'), 'utf8'));
    expect(pkg.scripts?.lint).toBeTruthy();

    expect(() =>
      execFileSync(pnpmCommand, ['run', 'lint'], {
        cwd: repoRoot,
        env: { ...process.env, CI: '1' },
        stdio: 'pipe',
      })
    ).not.toThrow();
  },
  30000,
);

test('a CI workflow file exists', () => {
  const ciPath = path.join(repoRoot, '.github', 'workflows', 'ci.yml');
  expect(existsSync(ciPath)).toBe(true);
});
