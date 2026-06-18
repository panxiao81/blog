import { expect, test } from 'vitest';

import {
  readField,
  rewriteAssetPaths,
  setField,
  splitFrontmatter,
} from '../scripts/translate-post.mjs';

const sourcePost = `---
title: "理解 ARP：一种新方式"
date: 2021-05-01
description: "原始描述"
draft: false
autoTranslated: false
tags: ["network"]
categories: ["Network"]
series: []
---

正文第一段。

![树状图标](./understand-arp/images/tree.webp)
`;

test('splitFrontmatter separates the YAML block from the body', () => {
  const { frontmatter, body } = splitFrontmatter(sourcePost);

  expect(frontmatter).toContain('title: "理解 ARP：一种新方式"');
  expect(body.trimStart()).toMatch(/^正文第一段/);
});

test('splitFrontmatter throws when no frontmatter block is present', () => {
  expect(() => splitFrontmatter('no frontmatter here')).toThrow(/frontmatter/);
});

test('readField returns scalar values with surrounding quotes stripped', () => {
  const { frontmatter } = splitFrontmatter(sourcePost);

  expect(readField(frontmatter, 'title')).toBe('理解 ARP：一种新方式');
  expect(readField(frontmatter, 'description')).toBe('原始描述');
  expect(readField(frontmatter, 'missing')).toBeUndefined();
});

test('setField replaces a scalar and JSON-quotes the value', () => {
  const { frontmatter } = splitFrontmatter(sourcePost);
  const next = setField(frontmatter, 'title', 'Understanding ARP: A New Way');

  expect(next).toContain('title: "Understanding ARP: A New Way"');
  expect(next).not.toContain('理解 ARP');
});

test('setField writes booleans unquoted so YAML parses them as booleans', () => {
  const { frontmatter } = splitFrontmatter(sourcePost);
  const next = setField(frontmatter, 'autoTranslated', true);

  expect(next).toContain('autoTranslated: true');
  expect(next).not.toContain('autoTranslated: "true"');
});

test('setField appends a key that is absent rather than dropping it', () => {
  const next = setField('title: "x"', 'description', 'added');

  expect(next).toContain('description: "added"');
});

test('setField preserves untouched taxonomy and date lines verbatim', () => {
  const { frontmatter } = splitFrontmatter(sourcePost);
  const next = setField(frontmatter, 'title', 'New');

  expect(next).toContain('date: 2021-05-01');
  expect(next).toContain('tags: ["network"]');
  expect(next).toContain('categories: ["Network"]');
});

test('rewriteAssetPaths points co-located assets back at the source locale', () => {
  const { body } = splitFrontmatter(sourcePost);
  const rewritten = rewriteAssetPaths(body, 'zh');

  expect(rewritten).toContain('![树状图标](../zh/understand-arp/images/tree.webp)');
  expect(rewritten).not.toContain('](./understand-arp');
});

test('rewriteAssetPaths rewrites HTML src attributes too', () => {
  const rewritten = rewriteAssetPaths('<img src="./post/images/a.png">', 'zh');

  expect(rewritten).toBe('<img src="../zh/post/images/a.png">');
});
