import { Buffer } from 'node:buffer';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { URL, fileURLToPath } from 'node:url';

const sourceRepo = {
  owner: 'panxiao81',
  name: 'new-blog',
  branch: 'master',
};

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const overwrite = args.includes('--overwrite');

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const targetPostsDir = path.join(repoRoot, 'src', 'content', 'posts', 'zh');

const sourcePostsPrefix = 'content/posts/';
const sourceImagesPrefix = 'static/images/';
const skippedPrefixes = ['content/posts/shortcodes/'];
const skippedBasenames = new Set(['_index.md']);
const githubApiBaseUrl = `https://api.github.com/repos/${sourceRepo.owner}/${sourceRepo.name}`;
const githubRawBaseUrl = `https://raw.githubusercontent.com/${sourceRepo.owner}/${sourceRepo.name}/${sourceRepo.branch}`;

function encodeRepoPath(repoPath) {
  return repoPath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

async function fetchJson(url) {
  const response = await globalThis.fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'frontend-blog-importer',
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${url}`);
  }

  return response.json();
}

async function fetchText(url) {
  const response = await globalThis.fetch(url, {
    headers: {
      'User-Agent': 'frontend-blog-importer',
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${url}`);
  }

  return response.text();
}

async function fetchBuffer(url) {
  const response = await globalThis.fetch(url, {
    headers: {
      'User-Agent': 'frontend-blog-importer',
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${url}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

function getTreeApiUrl() {
  return `${githubApiBaseUrl}/git/trees/${sourceRepo.branch}?recursive=1`;
}

function getRawRepoUrl(repoPath) {
  return `${githubRawBaseUrl}/${encodeRepoPath(repoPath)}`;
}

function trimSlash(value) {
  return value.replace(/^\/+|\/+$/g, '');
}

function unquote(value) {
  const trimmed = value.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

function parseArrayValue(value) {
  const trimmed = value.trim();

  if (trimmed === '[]') {
    return [];
  }

  const inner = trimmed.replace(/^\[/, '').replace(/\]$/, '');

  return inner
    .split(',')
    .map((item) => unquote(item))
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseScalarValue(value) {
  const trimmed = value.trim();

  if (trimmed === 'true') {
    return true;
  }

  if (trimmed === 'false') {
    return false;
  }

  if (trimmed === '[]') {
    return [];
  }

  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    return parseArrayValue(trimmed);
  }

  return unquote(trimmed);
}

function parseYamlFrontmatter(frontmatter) {
  const lines = frontmatter.split(/\r?\n/);
  const data = {};

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const match = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);

    if (!match) {
      continue;
    }

    const [, key, rest] = match;

    if (rest.trim() === '[' || (rest.trim().startsWith('[') && !rest.trim().endsWith(']'))) {
      const parts = [rest.trim()];

      while (index + 1 < lines.length) {
        index += 1;
        parts.push(lines[index].trim());
        if (lines[index].includes(']')) {
          break;
        }
      }

      data[key] = parseArrayValue(parts.join(' '));
      continue;
    }

    data[key] = parseScalarValue(rest);
  }

  return data;
}

function parseTomlFrontmatter(frontmatter) {
  const lines = frontmatter.split(/\r?\n/);
  const data = {};

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();

    if (!line || line.startsWith('#')) {
      continue;
    }

    const match = line.match(/^([A-Za-z][\w-]*)\s*=\s*(.*)$/);

    if (!match) {
      continue;
    }

    const [, key, rest] = match;

    if (rest.trim() === '[' || (rest.trim().startsWith('[') && !rest.trim().endsWith(']'))) {
      const parts = [rest.trim()];

      while (index + 1 < lines.length) {
        index += 1;
        parts.push(lines[index].trim());
        if (lines[index].includes(']')) {
          break;
        }
      }

      data[key] = parseArrayValue(parts.join(' '));
      continue;
    }

    data[key] = parseScalarValue(rest);
  }

  return data;
}

/**
 * @param {string} source
 * @returns {{ data: Record<string, unknown>, body: string, format: 'yaml' | 'toml' | null }}
 */
export function parseFrontmatter(source) {
  if (source.startsWith('---\n') || source.startsWith('---\r\n')) {
    const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);

    if (!match) {
      throw new Error('Invalid YAML frontmatter block.');
    }

    return {
      data: parseYamlFrontmatter(match[1]),
      body: source.slice(match[0].length),
      format: 'yaml',
    };
  }

  if (source.startsWith('+++\n') || source.startsWith('+++\r\n')) {
    const match = source.match(/^\+\+\+\r?\n([\s\S]*?)\r?\n\+\+\+\r?\n?/);

    if (!match) {
      throw new Error('Invalid TOML frontmatter block.');
    }

    return {
      data: parseTomlFrontmatter(match[1]),
      body: source.slice(match[0].length),
      format: 'toml',
    };
  }

  return {
    data: {},
    body: source,
    format: null,
  };
}

function stripDatePrefix(filename) {
  return filename.replace(/^\d{4}-\d{1,2}-\d{1,2}-/, '');
}

function slugifySegment(segment) {
  return segment
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[’'`]+/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export function buildSlug(sourcePath) {
  const relativePath = sourcePath.slice(sourcePostsPrefix.length).replace(/\.md$/, '');
  const segments = relativePath.split('/');
  const fileStem = stripDatePrefix(segments.pop() ?? '');
  const slugParts = [...segments, fileStem].map(slugifySegment).filter(Boolean);

  return slugParts.join('-');
}

function stripHtmlTags(value) {
  return value.replace(/<[^>]+>/g, ' ');
}

function stripMarkdownSyntax(value) {
  return value
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^>+\s?/gm, '')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/_(.*?)_/g, '$1');
}

function normalizeWhitespace(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function findFirstMeaningfulParagraph(body) {
  const blocks = body
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  for (const block of blocks) {
    if (block.startsWith('```') || block.startsWith('<!--')) {
      continue;
    }

    const nonEmptyLines = block.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

    if (nonEmptyLines.length > 0 && nonEmptyLines.every((line) => /^#{1,6}\s+/.test(line))) {
      continue;
    }

    const plainText = normalizeWhitespace(stripMarkdownSyntax(stripHtmlTags(block)));

    if (plainText) {
      return plainText;
    }
  }

  return '';
}

export function extractDescription(body) {
  const excerptSource = body.includes('<!--more-->') ? body.split('<!--more-->')[0] : findFirstMeaningfulParagraph(body);
  const plainText = normalizeWhitespace(stripMarkdownSyntax(stripHtmlTags(excerptSource)));

  return plainText || findFirstMeaningfulParagraph(body);
}

function removeMoreMarker(body) {
  return body.replace(/^\s*<!--more-->\s*$/gm, '').replace(/\n{3,}/g, '\n\n').trim();
}

function sanitizePathSegment(segment) {
  return segment
    .normalize('NFKC')
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function sanitizeRelativePath(relativePath) {
  return trimSlash(relativePath)
    .split('/')
    .filter(Boolean)
    .map(sanitizePathSegment)
    .filter(Boolean)
    .join('/');
}

function encodePathSegments(relativePath) {
  return relativePath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

function isRemoteUrl(url) {
  return /^https?:\/\//i.test(url);
}

function isLikelyLocalAsset(url) {
  return /\.(png|jpe?g|gif|svg|webp|avif)$/i.test(url);
}

function resolveRelativeSourceAssetPath(sourcePostPath, assetUrl) {
  const sourceDir = path.posix.dirname(sourcePostPath);
  return path.posix.normalize(path.posix.join(sourceDir, assetUrl));
}

function getTargetMarkdownAssetUrl(slug, relativeAssetPath) {
  return `./${encodeURIComponent(slug)}/${encodePathSegments(relativeAssetPath)}`;
}

function createAssetEntry({ sourcePath, sourceUrl, targetRelativePath, markdownUrl, originalUrl }) {
  return {
    sourcePath,
    sourceUrl,
    targetRelativePath,
    markdownUrl,
    originalUrl,
  };
}

export function rewriteBodyAssets(body, { sourcePath, slug, sourceTreePaths, warnings }) {
  const assets = new Map();

  function registerAssetUrl(assetUrl) {
    if (!assetUrl || assetUrl.startsWith('#')) {
      return assetUrl;
    }

    if (isRemoteUrl(assetUrl)) {
      const remoteUrl = new URL(assetUrl);

      if (!remoteUrl.pathname.includes('/wp-content/uploads/')) {
        return assetUrl;
      }

      const targetRelativePath = sanitizeRelativePath(remoteUrl.pathname);
      const markdownUrl = getTargetMarkdownAssetUrl(slug, targetRelativePath);
      const assetKey = `remote:${remoteUrl.href}`;

      if (!assets.has(assetKey)) {
        assets.set(
          assetKey,
          createAssetEntry({
            sourcePath: null,
            sourceUrl: remoteUrl.href,
            targetRelativePath,
            markdownUrl,
            originalUrl: assetUrl,
          }),
        );
      }

      return markdownUrl;
    }

    const decodedUrl = assetUrl.replace(/^<|>$/g, '');

    if (decodedUrl.startsWith('/images/')) {
      const sourceAssetPath = `static${decodedUrl}`;

      if (!sourceTreePaths.has(sourceAssetPath)) {
        warnings.push(`Missing source asset: ${sourceAssetPath} (${sourcePath})`);
        return assetUrl;
      }

      const targetRelativePath = sanitizeRelativePath(decodedUrl.slice(1));
      const markdownUrl = getTargetMarkdownAssetUrl(slug, targetRelativePath);
      const assetKey = `repo:${sourceAssetPath}`;

      if (!assets.has(assetKey)) {
        assets.set(
          assetKey,
          createAssetEntry({
            sourcePath: sourceAssetPath,
            sourceUrl: getRawRepoUrl(sourceAssetPath),
            targetRelativePath,
            markdownUrl,
            originalUrl: assetUrl,
          }),
        );
      }

      return markdownUrl;
    }

    if (!decodedUrl.startsWith('/') && isLikelyLocalAsset(decodedUrl)) {
      const sourceAssetPath = resolveRelativeSourceAssetPath(sourcePath, decodedUrl);
      const fallbackStaticPath = path.posix.normalize(`static/${trimSlash(decodedUrl)}`);
      const resolvedSourceAssetPath = sourceTreePaths.has(sourceAssetPath)
        ? sourceAssetPath
        : sourceTreePaths.has(fallbackStaticPath)
          ? fallbackStaticPath
          : null;

      if (!resolvedSourceAssetPath) {
        warnings.push(`Missing co-located asset: ${sourceAssetPath} (${sourcePath})`);
        return assetUrl;
      }

      const targetRelativePath = sanitizeRelativePath(
        resolvedSourceAssetPath.startsWith(sourceImagesPrefix)
          ? resolvedSourceAssetPath.slice('static/'.length)
          : path.posix.basename(resolvedSourceAssetPath),
      );
      const markdownUrl = getTargetMarkdownAssetUrl(slug, targetRelativePath);
      const assetKey = `repo:${resolvedSourceAssetPath}`;

      if (!assets.has(assetKey)) {
        assets.set(
          assetKey,
          createAssetEntry({
            sourcePath: resolvedSourceAssetPath,
            sourceUrl: getRawRepoUrl(resolvedSourceAssetPath),
            targetRelativePath,
            markdownUrl,
            originalUrl: assetUrl,
          }),
        );
      }

      return markdownUrl;
    }

    return assetUrl;
  }

  const markdownPattern = /(!\[[^\]]*\]\()(<)?([^)>\s]+)(>)?((?:\s+["'][^"']*["'])?\))/g;
  const htmlPattern = /(<img\b[^>]*\bsrc=(['"]))([^'"]+)((?:\2)[^>]*>)/gi;

  let rewritten = body.replace(markdownPattern, (match, prefix, open, assetUrl, close, suffix) => {
    const rewrittenUrl = registerAssetUrl(assetUrl);
    return `${prefix}${open ?? ''}${rewrittenUrl}${close ?? ''}${suffix}`;
  });

  rewritten = rewritten.replace(htmlPattern, (match, prefix, quote, assetUrl, suffix) => {
    const rewrittenUrl = registerAssetUrl(assetUrl);
    return `${prefix}${rewrittenUrl}${suffix}`;
  });

  return {
    body: rewritten,
    assets: [...assets.values()],
  };
}

function formatYamlString(value) {
  return JSON.stringify(value ?? '');
}

function formatYamlArray(values) {
  return `[${values.map((value) => JSON.stringify(value)).join(', ')}]`;
}

export function buildTargetFrontmatter(data, description) {
  return {
    title: String(data.title ?? '').trim(),
    date: String(data.date ?? '').trim(),
    description,
    draft: Boolean(data.draft ?? false),
    autoTranslated: false,
    tags: Array.isArray(data.tags) ? data.tags : [],
    categories: Array.isArray(data.categories) ? data.categories : [],
    series: Array.isArray(data.series) ? data.series : [],
  };
}

export function formatTargetPost(frontmatter, body) {
  return `---\ntitle: ${formatYamlString(frontmatter.title)}\ndate: ${frontmatter.date}\ndescription: ${formatYamlString(frontmatter.description)}\ndraft: ${frontmatter.draft}\nautoTranslated: false\ntags: ${formatYamlArray(frontmatter.tags)}\ncategories: ${formatYamlArray(frontmatter.categories)}\nseries: ${formatYamlArray(frontmatter.series)}\n---\n\n${body.trim()}\n`;
}

function shouldSkipPostPath(sourcePath) {
  if (!sourcePath.startsWith(sourcePostsPrefix) || !sourcePath.endsWith('.md')) {
    return true;
  }

  if (skippedPrefixes.some((prefix) => sourcePath.startsWith(prefix))) {
    return true;
  }

  return skippedBasenames.has(path.posix.basename(sourcePath));
}

export async function transformSourcePost({ sourcePath, sourceText, sourceTreePaths }) {
  if (!sourceText.trim()) {
    return { skip: true, reason: 'empty file' };
  }

  const slug = buildSlug(sourcePath);

  if (!slug) {
    return { skip: true, reason: 'empty slug' };
  }

  const { data, body } = parseFrontmatter(sourceText);
  const title = String(data.title ?? '').trim();
  const date = String(data.date ?? '').trim();

  if (!title || !date) {
    return { skip: true, reason: 'missing required frontmatter' };
  }

  const warnings = [];
  const description = extractDescription(body);
  const cleanedBody = removeMoreMarker(body);
  const rewritten = rewriteBodyAssets(cleanedBody, { sourcePath, slug, sourceTreePaths, warnings });
  const frontmatter = buildTargetFrontmatter(data, description);

  return {
    skip: false,
    slug,
    sourcePath,
    warnings,
    assets: rewritten.assets,
    output: formatTargetPost(frontmatter, rewritten.body),
  };
}

function getTargetPostPath(slug) {
  return path.join(targetPostsDir, `${slug}.md`);
}

function getTargetAssetPath(slug, relativeAssetPath) {
  return path.join(targetPostsDir, slug, ...relativeAssetPath.split('/'));
}

function ensureParentDirectory(filePath) {
  mkdirSync(path.dirname(filePath), { recursive: true });
}

async function writeImportedPost(result) {
  const postPath = getTargetPostPath(result.slug);

  if (existsSync(postPath) && !overwrite) {
    return {
      status: 'skipped',
      reason: 'target post already exists',
      slug: result.slug,
      targetPath: postPath,
      warnings: result.warnings,
    };
  }

  let output = result.output;

  for (const asset of result.assets) {
    const assetPath = getTargetAssetPath(result.slug, asset.targetRelativePath);

    if (existsSync(assetPath) && !overwrite) {
      continue;
    }

    ensureParentDirectory(assetPath);

    try {
      const buffer = await fetchBuffer(asset.sourceUrl);
      writeFileSync(assetPath, buffer);
    } catch (error) {
      result.warnings.push(`Failed to download asset ${asset.originalUrl}: ${error.message}`);
      output = output.split(asset.markdownUrl).join(asset.originalUrl);
    }
  }

  ensureParentDirectory(postPath);
  writeFileSync(postPath, output, 'utf8');

  return {
    status: 'imported',
    slug: result.slug,
    targetPath: postPath,
    warnings: result.warnings,
    assetCount: result.assets.length,
  };
}

async function loadSourceTree() {
  const tree = await fetchJson(getTreeApiUrl());
  const sourceTreePaths = new Set(tree.tree.map((entry) => entry.path));
  const postPaths = tree.tree
    .filter((entry) => entry.type === 'blob')
    .map((entry) => entry.path)
    .filter((entryPath) => !shouldSkipPostPath(entryPath));

  return { postPaths, sourceTreePaths };
}

function logSummary(results) {
  const imported = results.filter((result) => result.status === 'imported').length;
  const skipped = results.filter((result) => result.status === 'skipped').length;
  const warnings = results.flatMap((result) => result.warnings ?? []);

  console.log(`Imported: ${imported}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Warnings: ${warnings.length}`);

  for (const warning of warnings) {
    console.warn(`WARN ${warning}`);
  }
}

export async function importPosts() {
  const { postPaths, sourceTreePaths } = await loadSourceTree();
  const results = [];

  for (const sourcePath of postPaths) {
    const sourceText = await fetchText(getRawRepoUrl(sourcePath));
    const transformed = await transformSourcePost({ sourcePath, sourceText, sourceTreePaths });

    if (transformed.skip) {
      results.push({
        status: 'skipped',
        sourcePath,
        warnings: [],
      });
      console.log(`SKIP ${sourcePath} (${transformed.reason})`);
      continue;
    }

    const targetPath = getTargetPostPath(transformed.slug);

    if (dryRun) {
      console.log(`DRY ${sourcePath} -> ${path.relative(repoRoot, targetPath)} (${transformed.assets.length} assets)`);
      for (const warning of transformed.warnings) {
        console.warn(`WARN ${warning}`);
      }
      results.push({
        status: 'imported',
        slug: transformed.slug,
        targetPath,
        warnings: transformed.warnings,
        assetCount: transformed.assets.length,
      });
      continue;
    }

    const writeResult = await writeImportedPost(transformed);
    console.log(`${writeResult.status.toUpperCase()} ${sourcePath} -> ${path.relative(repoRoot, writeResult.targetPath)}`);
    results.push(writeResult);
  }

  logSummary(results);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  importPosts().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
