import { execFileSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const distDir = path.join(repoRoot, 'dist');

const fixturesDir = path.join(repoRoot, 'tests', 'fixtures', 'posts');
const pnpmCommand = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';

/**
 * Build the site against the fixed fixture content set (tests/fixtures/posts)
 * rather than the real posts, so build-based tests stay stable as real content
 * is added or removed. `extraEnv` lets a spec configure things the build reads
 * from the environment (SITE, analytics ids, ad slots, ...).
 *
 * Astro's glob loader fully reconciles the content store on each build, so
 * switching between the real and fixture content dirs leaves no stale entries —
 * no cache clearing is required.
 */
export function buildFixtureSite(extraEnv: Record<string, string> = {}) {
  rmSync(distDir, { recursive: true, force: true });

  execFileSync(pnpmCommand, ['run', 'build'], {
    cwd: repoRoot,
    env: { ...process.env, CI: '1', BLOG_CONTENT_DIR: fixturesDir, ...extraEnv },
    stdio: 'pipe',
  });
}
