import { getCollection, type CollectionEntry } from 'astro:content';

import { defaultLocale, locales, type Locale } from '../config/site';

export type PostEntry = CollectionEntry<'posts'>;
export type TaxonomyKey = 'tags' | 'categories' | 'series';
export type PostRouteEntry = {
  entry: PostEntry;
  locale: Locale;
  slug: string;
};
export type LocalePostListItem =
  | {
      kind: 'post';
      entry: PostEntry;
      locale: Locale;
      slug: string;
      sourceLocale: Locale;
    }
  | {
      kind: 'placeholder';
      entry: PostEntry;
      locale: Locale;
      slug: string;
      sourceLocale: Locale;
    };
export type TaxonomyTermListItem = {
  term: string;
  param: string;
  count: number;
};
export type TaxonomyRouteEntry = {
  locale: Locale;
  term: string;
  param: string;
  posts: PostRouteEntry[];
};

function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

function getPostRouteEntry(entry: PostEntry): PostRouteEntry | null {
  const [locale, slug] = entry.id.split('/');

  if (!locale || !slug || !isLocale(locale)) {
    return null;
  }

  return { entry, locale, slug };
}

function sortByDateDesc<T extends { entry: PostEntry }>(a: T, b: T) {
  return b.entry.data.date.getTime() - a.entry.data.date.getTime();
}

function getTaxonomyTerms(entry: PostEntry, taxonomy: TaxonomyKey): string[] {
  return entry.data[taxonomy];
}

function getLocaleTaxonomyMap(posts: PostRouteEntry[], taxonomy: TaxonomyKey) {
  const entries = new Map<string, PostRouteEntry[]>();

  for (const post of posts) {
    for (const term of getTaxonomyTerms(post.entry, taxonomy)) {
      const termPosts = entries.get(term);

      if (termPosts) {
        termPosts.push(post);
      } else {
        entries.set(term, [post]);
      }
    }
  }

  return entries;
}

export function getTaxonomyTermParam(term: string) {
  return encodeURIComponent(term);
}

export function decodeTaxonomyTermParam(term: string) {
  return decodeURIComponent(term);
}

export function getTaxonomyTermHref(locale: Locale, taxonomy: TaxonomyKey, term: string) {
  return `/${locale}/${taxonomy}/${getTaxonomyTermParam(term)}/`;
}

export async function getPostRouteEntries(): Promise<PostRouteEntry[]> {
  const posts = await getCollection('posts', (entry: PostEntry) => !entry.data.draft);

  return posts
    .map(getPostRouteEntry)
    .filter((entry: PostRouteEntry | null): entry is PostRouteEntry => entry !== null);
}

export async function getLocalePosts(locale: Locale): Promise<PostRouteEntry[]> {
  return (await getPostRouteEntries())
    .filter((entry) => entry.locale === locale)
    .sort(sortByDateDesc);
}

// The Source Post of a slug is the author-written version; any Translated Posts
// share the slug in other Locales and carry autoTranslated. We fall back to the
// default Locale, then any entry, so listings stay resilient when a slug's
// Translation State is incomplete or no version is marked as the source.
function getSourcePost(group: PostRouteEntry[]): PostRouteEntry {
  return (
    group.find((entry) => !entry.entry.data.autoTranslated) ??
    group.find((entry) => entry.locale === defaultLocale) ??
    group[0]
  );
}

export async function getLocalePostListItems(locale: Locale): Promise<LocalePostListItem[]> {
  const routeEntries = await getPostRouteEntries();

  // Group every Post by its shared slug so each logical Post is considered once,
  // regardless of which Locales it has been written or translated into.
  const postsBySlug = new Map<string, PostRouteEntry[]>();
  for (const entry of routeEntries) {
    const group = postsBySlug.get(entry.slug);

    if (group) {
      group.push(entry);
    } else {
      postsBySlug.set(entry.slug, [entry]);
    }
  }

  const items: LocalePostListItem[] = [];

  for (const group of postsBySlug.values()) {
    const localized = group.find((entry) => entry.locale === locale);

    if (localized) {
      // A version exists in this Locale (Source or Translated): link to it directly.
      items.push({
        kind: 'post',
        entry: localized.entry,
        locale,
        slug: localized.slug,
        sourceLocale: localized.locale,
      });
      continue;
    }

    // No version here yet: show a Source Post Placeholder that points readers to
    // the Source Post in its original Locale, whichever Locale that is.
    const source = getSourcePost(group);
    items.push({
      kind: 'placeholder',
      entry: source.entry,
      locale,
      slug: source.slug,
      sourceLocale: source.locale,
    });
  }

  return items.sort(sortByDateDesc);
}

export async function getLocaleTaxonomyTerms(
  locale: Locale,
  taxonomy: TaxonomyKey,
): Promise<TaxonomyTermListItem[]> {
  const posts = await getLocalePosts(locale);
  const taxonomyMap = getLocaleTaxonomyMap(posts, taxonomy);

  return Array.from(taxonomyMap.entries())
    .map(([term, termPosts]) => ({ term, param: getTaxonomyTermParam(term), count: termPosts.length }))
    .sort((a, b) => a.term.localeCompare(b.term));
}

export async function getLocaleTaxonomyPosts(
  locale: Locale,
  taxonomy: TaxonomyKey,
  term: string,
): Promise<PostRouteEntry[]> {
  const posts = await getLocalePosts(locale);
  const taxonomyMap = getLocaleTaxonomyMap(posts, taxonomy);

  return taxonomyMap.get(term) ?? [];
}

export async function getAdjacentPosts(
  locale: Locale,
  slug: string,
): Promise<{ newer: PostRouteEntry | null; older: PostRouteEntry | null }> {
  const posts = await getLocalePosts(locale);
  const idx = posts.findIndex((p) => p.slug === slug);

  if (idx === -1) {
    return { newer: null, older: null };
  }

  return {
    newer: idx > 0 ? posts[idx - 1] : null,
    older: idx < posts.length - 1 ? posts[idx + 1] : null,
  };
}

export async function getTaxonomyRouteEntries(taxonomy: TaxonomyKey): Promise<TaxonomyRouteEntry[]> {
  const entries: TaxonomyRouteEntry[] = [];

  for (const locale of locales) {
    const posts = await getLocalePosts(locale);
    const taxonomyMap = getLocaleTaxonomyMap(posts, taxonomy);

    for (const [term, termPosts] of taxonomyMap.entries()) {
      entries.push({
        locale,
        term,
        param: getTaxonomyTermParam(term),
        posts: termPosts,
      });
    }
  }

  return entries.sort((a, b) => {
    if (a.locale !== b.locale) {
      return a.locale.localeCompare(b.locale);
    }

    return a.term.localeCompare(b.term);
  });
}
