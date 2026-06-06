import rss from '@astrojs/rss';
import type { APIRoute, GetStaticPaths } from 'astro';

import { locales, siteConfig, type Locale } from '../../config/site';
import { getLocalePosts } from '../../content/posts';

export const getStaticPaths: GetStaticPaths = () =>
  locales.map((locale) => ({ params: { locale } }));

export const GET: APIRoute = async (context) => {
  const locale = context.params.locale as Locale;
  const posts = await getLocalePosts(locale);

  return rss({
    title: siteConfig.title,
    description: siteConfig.description,
    site: context.site ?? new URL('https://example.com'),
    items: posts.map((p) => ({
      title: p.entry.data.title,
      pubDate: p.entry.data.date,
      description: p.entry.data.description,
      link: `/${locale}/posts/${p.slug}/`,
    })),
    customData: `<language>${locale}</language>`,
  });
};
