import { expect, test } from 'vitest';

import {
  buildSlug,
  extractDescription,
  parseFrontmatter,
  rewriteBodyAssets,
  transformSourcePost,
} from '../scripts/import-posts.mjs';

test('parses multiline YAML arrays from Hugo posts', () => {
  const source = `---
title: "算法与数据结构 -- 线性表（2）-- 顺序表"
date: 2022-12-22T19:57:00+08:00
categories: [
  "Algorithm"
]
tags: [
  'programming',
  'algorithm',
  'data-structure',
]
series: ["408", "Algorithm"]
---

正文
`;

  const frontmatter = parseFrontmatter(source);

  expect(frontmatter.data.categories).toEqual(['Algorithm']);
  expect(frontmatter.data.tags).toEqual(['programming', 'algorithm', 'data-structure']);
  expect(frontmatter.data.series).toEqual(['408', 'Algorithm']);
});

test('builds collision-resistant slugs from nested source paths', () => {
  expect(buildSlug('content/posts/algorithm/array.md')).toBe('algorithm-array');
  expect(buildSlug('content/posts/2020-12-10-EX200模拟题解.md')).toBe('ex200模拟题解');
  expect(buildSlug('content/posts/Mixing Basics/2019-08-31-Mixing BasicsCompressorCheaper 1.md')).toBe(
    'mixing-basics-mixing-basicscompressorcheaper-1',
  );
});

test('extracts description from excerpt marker when present', () => {
  const body = `第一段摘要。\n\n<!--more-->\n\n## 正文\n\n更多内容。`;

  expect(extractDescription(body)).toBe('第一段摘要。');
});

test('skips heading-only blocks when generating fallback descriptions', () => {
  const body = `## 总览\n\n压缩器是混音中的好伙伴。`;

  expect(extractDescription(body)).toBe('压缩器是混音中的好伙伴。');
});

test('rewrites repo-local markdown and HTML image URLs', () => {
  const sourceTreePaths = new Set([
    'static/images/EX200/example.png',
    'content/posts/Mixing Basics/Inbox.png',
  ]);
  const warnings: string[] = [];
  const rewritten = rewriteBodyAssets(
    [
      '![Example](/images/EX200/example.png)',
      '',
      '![Inbox](Inbox.png)',
      '',
      '<img src="/images/EX200/example.png" alt="example" />',
    ].join('\n'),
    {
      sourcePath: 'content/posts/Mixing Basics/2019-08-31-Mixing BasicsCompressorCheaper 1.md',
      slug: 'mixing-basics-mixing-basicscompressorcheaper-1',
      sourceTreePaths,
      warnings,
    },
  );

  expect(rewritten.body).toContain(
    '![Example](./mixing-basics-mixing-basicscompressorcheaper-1/images/EX200/example.png)',
  );
  expect(rewritten.body).toContain(
    '![Inbox](./mixing-basics-mixing-basicscompressorcheaper-1/Inbox.png)',
  );
  expect(rewritten.body).toContain(
    '<img src="./mixing-basics-mixing-basicscompressorcheaper-1/images/EX200/example.png" alt="example" />',
  );
  expect(rewritten.assets).toHaveLength(2);
  expect(warnings).toEqual([]);
});

test('transforms a representative source post into target frontmatter and local assets', async () => {
  const sourceTreePaths = new Set([
    'content/posts/2020-12-10-EX200模拟题解.md',
    'static/images/EX200/image-20201210112318431.png',
  ]);
  const sourceText = `---
title: EX200 模拟题解
date: 2020-12-10
categories: [Linux]
tags: [linux]
---

EX200 的 Dump，现在好像有附加题了，仅供参考吧

<!--more-->

![image-20201210112318431](/images/EX200/image-20201210112318431.png)
`;

  const transformed = await transformSourcePost({
    sourcePath: 'content/posts/2020-12-10-EX200模拟题解.md',
    sourceText,
    sourceTreePaths,
  });

  expect(transformed.skip).toBe(false);
  expect(transformed.slug).toBe('ex200模拟题解');
  expect(transformed.output).toContain('title: "EX200 模拟题解"');
  expect(transformed.output).toContain('description: "EX200 的 Dump，现在好像有附加题了，仅供参考吧"');
  expect(transformed.output).toContain('draft: false');
  expect(transformed.output).toContain('![image-20201210112318431](./ex200%E6%A8%A1%E6%8B%9F%E9%A2%98%E8%A7%A3/images/EX200/image-20201210112318431.png)');
  expect(transformed.assets).toHaveLength(1);
  expect(transformed.warnings).toEqual([]);
});
