import type { Locale } from '../config/site';

export type SiteDictionary = {
  home: string;
  archive: string;
  tags: string;
  categories: string;
  series: string;
  tagLabel: string;
  categoryLabel: string;
  seriesLabel: string;
  about: string;
  links: string;
  privacy: string;
  intro: string;
  footer: string;
  emptyTaxonomy: string;
  themeLabel: string;
  themeLight: string;
  themeDark: string;
  themeSystem: string;
  searchLabel: string;
  searchPlaceholder: string;
  searchToggleLabel: string;
  tocHeading: string;
  tocToggleLabel: string;
  translationNotice: string;
  newerPost: string;
  olderPost: string;
  licenseLabel: string;
  rssLabel: string;
  privacySettings: string;
};

export const dictionaries: Record<Locale, SiteDictionary> = {
  en: {
    home: 'Home',
    archive: 'Archive',
    tags: 'Tags',
    categories: 'Categories',
    series: 'Series',
    tagLabel: 'Tag',
    categoryLabel: 'Category',
    seriesLabel: 'Series',
    about: 'About',
    links: 'Links',
    privacy: 'Privacy',
    intro: 'Essays, notes, and selected work.',
    footer: 'Writing across locales.',
    emptyTaxonomy: 'Nothing here yet.',
    themeLabel: 'Theme',
    themeLight: 'Light',
    themeDark: 'Dark',
    themeSystem: 'System',
    searchLabel: 'Search',
    searchPlaceholder: 'Search…',
    searchToggleLabel: 'Toggle search',
    tocHeading: 'Contents',
    tocToggleLabel: 'Toggle table of contents',
    translationNotice: 'This post was automatically translated.',
    newerPost: 'Newer',
    olderPost: 'Older',
    licenseLabel: 'CC BY-SA 4.0',
    rssLabel: 'RSS',
    privacySettings: 'Privacy Settings',
  },
  zh: {
    home: '首页',
    archive: '归档',
    tags: '标签',
    categories: '分类',
    series: '系列',
    tagLabel: '标签',
    categoryLabel: '分类',
    seriesLabel: '系列',
    about: '关于',
    links: '链接',
    privacy: '隐私',
    intro: '这里发布文章、笔记与作品。',
    footer: '跨语言写作。',
    emptyTaxonomy: '这里还没有内容。',
    themeLabel: '主题',
    themeLight: '浅色',
    themeDark: '深色',
    themeSystem: '跟随系统',
    searchLabel: '搜索',
    searchPlaceholder: '搜索…',
    searchToggleLabel: '展开搜索',
    tocHeading: '目录',
    tocToggleLabel: '切换目录',
    translationNotice: '本文由机器翻译生成。',
    newerPost: '更新',
    olderPost: '更早',
    licenseLabel: 'CC BY-SA 4.0',
    rssLabel: 'RSS',
    privacySettings: '隐私设置',
  },
  ja: {
    home: 'ホーム',
    archive: 'アーカイブ',
    tags: 'タグ',
    categories: 'カテゴリー',
    series: 'シリーズ',
    tagLabel: 'タグ',
    categoryLabel: 'カテゴリー',
    seriesLabel: 'シリーズ',
    about: 'このサイトについて',
    links: 'リンク',
    privacy: 'プライバシー',
    intro: 'エッセイ、ノート、作品を掲載します。',
    footer: '複数ロケールで書くサイトです。',
    emptyTaxonomy: 'まだ項目はありません。',
    themeLabel: 'テーマ',
    themeLight: 'ライト',
    themeDark: 'ダーク',
    themeSystem: 'システム',
    searchLabel: '検索',
    searchPlaceholder: '検索…',
    searchToggleLabel: '検索を表示',
    tocHeading: '目次',
    tocToggleLabel: '目次を切り替える',
    translationNotice: 'この記事は自動翻訳されています。',
    newerPost: '新しい',
    olderPost: '古い',
    licenseLabel: 'CC BY-SA 4.0',
    rssLabel: 'RSS',
    privacySettings: 'プライバシー設定',
  },
};
