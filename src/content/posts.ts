import { getCollection, type CollectionEntry } from 'astro:content';

import { defaultLocale, locales, type Locale } from '../config/site';

export type PostEntry = CollectionEntry<'posts'>;
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

  return items.sort((a, b) => b.entry.data.date.getTime() - a.entry.data.date.getTime());
}
