# Blog

A personal publishing site for essays, notes, and portfolio content — built to put writing first and treat every language as a first-class reading surface. Content is authored in Chinese, Japanese, and English, with locale-prefixed routes, light/dark themes, and a plain, text-first interface.

Built with [Astro](https://astro.build/) (static output) and [Tailwind CSS](https://tailwindcss.com/), and deployed to Cloudflare Workers static assets.

## Stack

- **Framework:** Astro 6 (`output: 'static'`)
- **Styling:** Tailwind CSS 4 + `@tailwindcss/typography`
- **Content:** Markdown (MDX as an escape hatch), via Astro content collections
- **Math & diagrams:** KaTeX (`remark-math` + `rehype-katex`) and Mermaid
- **Feeds & SEO:** `@astrojs/rss`, `@astrojs/sitemap`
- **Tests:** Vitest (fixture-based)
- **Deploy:** Cloudflare Workers (static assets) via Wrangler

## Prerequisites

- Node.js **22** (see `.nvmrc`)
- pnpm **11** (`packageManager` is pinned in `package.json`)

## Getting started

```bash
pnpm install
pnpm dev          # local dev server
```

Then open the printed URL. The root (`/`) redirects to the reader's preferred or browser locale, falling back to the default (`zh`); all pages live under `/{locale}/…`.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the Astro dev server |
| `pnpm build` | Build the static site to `dist/` |
| `pnpm preview` | Preview the production build locally |
| `pnpm check` | Type-check with `astro check` |
| `pnpm lint` | Lint with ESLint |
| `pnpm test` / `pnpm test:run` | Run the Vitest suite (watch / once) |
| `pnpm quality` | Lint + check + tests + build (the full gate) |
| `pnpm new-post <slug>` | Scaffold a new post (see below) |
| `pnpm import-posts` | Import posts from the legacy Hugo repo |
| `pnpm deploy` | Build and deploy to Cloudflare |

## Writing posts

Scaffold a draft (lowercase kebab-case slug; `--format mdx` for MDX):

```bash
pnpm new-post my-post-slug
```

Posts live under `src/content/posts/{locale}/<slug>.md`. **The directory is the post's source locale** — a file in `posts/en/` is an English-authored post, `posts/zh/` is Chinese, and so on. A translation is the same slug in another locale's directory, and the slug stays identical across locales.

Frontmatter schema (see `src/content.config.ts`):

```yaml
---
title: My Post
date: 2026-06-17
description: ""        # optional; used in lists and meta
draft: true            # draft posts are excluded from the build
autoTranslated: false  # true marks a machine-translated version
tags: []
categories: []
series: []
license: ""            # optional; overrides the default license
---
```

### Locales & placeholders

The supported locales are `en`, `zh`, and `ja` (`src/config/site.ts`), with `zh` as the default. Each locale archive lists the posts written in it. When a post has no version in the locale you're viewing, a **Source Post Placeholder** is shown instead — a list entry that links to the post's source in whatever language it was authored. The source is the author-written version (`autoTranslated: false`).

UI strings ("Site Chrome") live in `src/i18n/dictionaries.ts`, one entry per locale.

## Project structure

```
src/
  components/        Shared Astro components (Pagination, AdUnit)
  config/site.ts     Locales, labels, nav links, site constants
  content/
    posts/{locale}/  Posts, by source locale
    pages/           About / Links / Privacy content, per locale
  content.config.ts  Posts collection schema
  i18n/              Locale dictionaries (UI strings)
  layouts/           SiteShell (header, footer, theme, consent)
  pages/[locale]/    Locale-prefixed routes (index, archive, posts, taxonomy…)
scripts/             new-post / import-posts helpers
tests/               Vitest specs + tests/fixtures/posts (fixed content set)
```

## Testing

Tests build the site against a **fixed fixture content set** (`tests/fixtures/posts`) rather than real posts, so adding or removing a post never breaks them. Run them with:

```bash
pnpm test:run
```

## Deployment

The site builds to static assets and is served by Cloudflare Workers (`wrangler.jsonc` points at `./dist`). Pushing to the default branch triggers a Cloudflare build; you can also deploy manually:

```bash
pnpm deploy
```

Set the `SITE` environment variable to the canonical URL so canonical links, the sitemap, and feeds resolve correctly.

## Project docs

- `CONTEXT.md` — domain language and core concepts
- `PRODUCT.md` — product purpose, audience, and design principles
- `DESIGN.md` — the visual design system ("The Precise Notebook")
- `docs/spec.md` — the v1 specification
- `docs/agents/` — issue-tracker, triage, and domain notes
