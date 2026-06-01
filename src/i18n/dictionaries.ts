import type { Locale } from '../config/site';

export type SiteDictionary = {
  home: string;
  intro: string;
  footer: string;
};

export const dictionaries: Record<Locale, SiteDictionary> = {
  en: {
    home: 'Home',
    intro: 'Essays, notes, and selected work.',
    footer: 'Writing across locales.',
  },
  zh: {
    home: '首页',
    intro: '这里发布文章、笔记与作品。',
    footer: '跨语言写作。',
  },
  ja: {
    home: 'ホーム',
    intro: 'エッセイ、ノート、作品を掲載します。',
    footer: '複数ロケールで書くサイトです。',
  },
};
