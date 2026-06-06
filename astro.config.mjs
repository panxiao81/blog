import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: process.env.SITE,
  output: 'static',
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'zh',
        locales: { en: 'en', zh: 'zh', ja: 'ja' },
      },
    }),
  ],
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
    }),
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
