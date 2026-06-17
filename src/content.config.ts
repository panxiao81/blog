import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Tests point this at a fixed fixture set (tests/fixtures/posts) so assertions
// stay stable when real posts are added or removed. Production leaves it unset.
const postsBase = process.env.BLOG_CONTENT_DIR ?? './src/content/posts';

const posts = defineCollection({
  loader: glob({
    base: postsBase,
    pattern: '**/*.{md,mdx}',
  }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string().optional(),
    draft: z.boolean(),
    autoTranslated: z.boolean(),
    tags: z.array(z.string()),
    categories: z.array(z.string()),
    series: z.array(z.string()),
    license: z.string().optional(),
  }),
});

export const collections = { posts };
