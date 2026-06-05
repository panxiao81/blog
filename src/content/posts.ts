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

export async function getLocalePostListItems(locale: Locale): Promise<LocalePostListItem[]> {
  const routeEntries = await getPostRouteEntries();
  const localeEntries = routeEntries.filter((entry) => entry.locale === locale);

  const items: LocalePostListItem[] = localeEntries.map(({ entry, locale: entryLocale, slug }) => ({
    kind: 'post',
    entry,
    locale: entryLocale,
    slug,
    sourceLocale: entryLocale,
  }));

  if (locale !== defaultLocale) {
    const sourceEntries = routeEntries.filter((entry) => entry.locale === defaultLocale);

    for (const sourceEntry of sourceEntries) {
      const hasTranslation = routeEntries.some(
        (entry) => entry.locale === locale && entry.slug === sourceEntry.slug,
      );

      if (!hasTranslation) {
        items.push({
          kind: 'placeholder',
          entry: sourceEntry.entry,
          locale,
          slug: sourceEntry.slug,
          sourceLocale: sourceEntry.locale,
        });
      }
    }
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
