import type { Locale } from '../config/site';

export type SiteDictionary = {
  home: string;
  intro: string;
  footer: string;
  themeLabel: string;
  themeLight: string;
  themeDark: string;
  themeSystem: string;
  searchLabel: string;
  searchPlaceholder: string;
  searchToggleLabel: string;
};

export const dictionaries: Record<Locale, SiteDictionary> = {
  en: {
    home: 'Home',
    intro: 'Essays, notes, and selected work.',
    footer: 'Writing across locales.',
    themeLabel: 'Theme',
    themeLight: 'Light',
    themeDark: 'Dark',
    themeSystem: 'System',
    searchLabel: 'Search',
    searchPlaceholder: 'Search…',
    searchToggleLabel: 'Toggle search',
  },
  zh: {
    home: '首页',
    intro: '这里发布文章、笔记与作品。',
    footer: '跨语言写作。',
    themeLabel: '主题',
    themeLight: '浅色',
    themeDark: '深色',
    themeSystem: '跟随系统',
    searchLabel: '搜索',
    searchPlaceholder: '搜索…',
    searchToggleLabel: '展开搜索',
  },
  ja: {
    home: 'ホーム',
    intro: 'エッセイ、ノート、作品を掲載します。',
    footer: '複数ロケールで書くサイトです。',
    themeLabel: 'テーマ',
    themeLight: 'ライト',
    themeDark: 'ダーク',
    themeSystem: 'システム',
    searchLabel: '検索',
    searchPlaceholder: '検索…',
    searchToggleLabel: '検索を表示',
  },
};
