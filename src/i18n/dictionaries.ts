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
  more: string;
  privacy: string;
  homeKicker: string;
  intro: string;
  footer: string;
  emptyTaxonomy: string;
  placeholderNotice: string;
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
  prevPage: string;
  nextPage: string;
  paginationLabel: string;
  licenseLabel: string;
  rssLabel: string;
  privacySettings: string;
  consentMessage: string;
  consentAccept: string;
  consentDecline: string;
  chineseOnly: string;
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
    more: 'More',
    privacy: 'Privacy',
    homeKicker: 'Source first',
    intro: 'Essays, notes, and work that stay close to their source language.',
    footer: 'I publish each piece where it begins, then bring it into other locales when that version is ready.',
    emptyTaxonomy: 'Nothing here yet.',
    placeholderNotice: 'Not in this locale yet.',
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
    prevPage: 'Newer',
    nextPage: 'Older',
    paginationLabel: 'Pagination',
    licenseLabel: 'CC BY-SA 4.0',
    rssLabel: 'RSS',
    privacySettings: 'Privacy Settings',
    consentMessage: 'This site uses cookies for analytics and advertising.',
    consentAccept: 'Accept',
    consentDecline: 'Decline',
    chineseOnly: 'Chinese only',
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
    more: '更多',
    privacy: '隐私',
    homeKicker: '原文优先',
    intro: '这里发布从原始写作语言出发的文章、笔记与作品。',
    footer: '我会先在作品开始写作的语言中发布，再在其他语种版本准备好后补上。',
    emptyTaxonomy: '这里还没有内容。',
    placeholderNotice: '当前语言版本尚未提供。',
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
    prevPage: '更新',
    nextPage: '更早',
    paginationLabel: '分页',
    licenseLabel: 'CC BY-SA 4.0',
    rssLabel: 'RSS',
    privacySettings: '隐私设置',
    consentMessage: '本站使用 Cookie 用于分析和广告。',
    consentAccept: '接受',
    consentDecline: '拒绝',
    chineseOnly: '仅中文',
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
    more: 'その他',
    privacy: 'プライバシー',
    homeKicker: '原文から',
    intro: 'エッセイ、ノート、作品を、書き始めた言語に近いかたちで届けます。',
    footer: '各記事はまず元の言語で公開し、ほかのロケール版は準備ができしだい追加します。',
    emptyTaxonomy: 'まだ項目はありません。',
    placeholderNotice: 'このロケールではまだ読めません。',
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
    prevPage: '新しい',
    nextPage: '古い',
    paginationLabel: 'ページ送り',
    licenseLabel: 'CC BY-SA 4.0',
    rssLabel: 'RSS',
    privacySettings: 'プライバシー設定',
    consentMessage: 'このサイトはアナリティクスと広告のためにCookieを使用しています。',
    consentAccept: '同意する',
    consentDecline: '断る',
    chineseOnly: '中国語のみ',
  },
};
