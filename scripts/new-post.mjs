import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const slug = args[0];
const formatFlagIndex = args.indexOf('--format');
const format = formatFlagIndex === -1 ? 'md' : args[formatFlagIndex + 1];

if (!slug) {
  console.error('Usage: npm run new-post -- <slug> [--format md|mdx]');
  process.exit(1);
}

if (format !== 'md' && format !== 'mdx') {
  console.error('Format must be md or mdx.');
  process.exit(1);
}

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

if (!slugPattern.test(slug)) {
  console.error('Slug must be lowercase kebab-case.');
  process.exit(1);
}

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const postsDir = path.join(repoRoot, 'src', 'content', 'posts', 'zh');
const extension = format === 'mdx' ? 'mdx' : 'md';
const alternateExtension = extension === 'md' ? 'mdx' : 'md';
const postPath = path.join(postsDir, `${slug}.${extension}`);
const alternatePostPath = path.join(postsDir, `${slug}.${alternateExtension}`);

if (existsSync(postPath) || existsSync(alternatePostPath)) {
  console.error(`Post already exists: ${postPath}`);
  process.exit(1);
}

mkdirSync(postsDir, { recursive: true });

const today = new Date().toISOString().slice(0, 10);
const title = slug
  .split('-')
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join(' ');

const contents = `---
title: ${title}
date: ${today}
description: ""
draft: true
autoTranslated: false
tags: []
categories: []
series: []
license: ""
---

`;

writeFileSync(postPath, contents, 'utf8');
process.stdout.write(`${postPath}\n`);
