import { getCollection, type CollectionEntry } from 'astro:content';

import { locales, type Locale } from '../config/site';

export type PostEntry = CollectionEntry<'posts'>;
export type PostRouteEntry = {
  entry: PostEntry;
  locale: Locale;
  slug: string;
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

export async function getPostRouteEntries(): Promise<PostRouteEntry[]> {
  const posts = await getCollection('posts', (entry: PostEntry) => !entry.data.draft);

  return posts
    .map(getPostRouteEntry)
    .filter((entry: PostRouteEntry | null): entry is PostRouteEntry => entry !== null);
}
