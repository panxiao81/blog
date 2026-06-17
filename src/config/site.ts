export const locales = ['en', 'zh', 'ja'] as const;
export const defaultLocale = 'zh' as const;
export const localePreferenceStorageKey = 'preferred-locale' as const;
export const themePreferenceStorageKey = 'theme-preference' as const;
export const themes = ['light', 'dark', 'system'] as const;
export type Theme = (typeof themes)[number];

export type Locale = (typeof locales)[number];

export const localeLabels: Record<Locale, string> = {
  en: 'EN',
  zh: '中文',
  ja: '日本語',
};

export const siteConfig = {
  title: 'Xiao Pan',
  description: 'Plain multilingual writing.',
} as const;

export type ExternalMenuLink = {
  label: string;
  href: string;
  chineseOnly?: boolean;
};

export const externalMenuLinks: ExternalMenuLink[] = [
  { label: 'Debian 快速入门指南', href: 'https://blog.ddupan.top/Chinaskills-Debian', chineseOnly: true },
  { label: 'TLPI 笔记', href: 'https://panxiao81.github.io/learn-tlpi/', chineseOnly: true },
  { label: 'CS:APP 笔记', href: 'https://panxiao81.github.io/learn-csapp', chineseOnly: true },
  { label: 'Gitea', href: 'https://git.ddupan.top/panxiao81/' },
  { label: 'GitHub', href: 'https://github.com/panxiao81/new-blog' },
  { label: 'E5自动更新', href: 'https://e5renew.ddupan.top', chineseOnly: true },
];

export const postsPerPage = 10 as const;

export const siteUrl: string = import.meta.env.SITE || '';

// Comments live in the legacy repo's GitHub issues (created by Utterances on the
// old site), so existing threads stay attached. The Comment Key below matches
// the old issue-term format: `posts/{slug}/`, no leading slash, locale-agnostic.
export const utterancesRepo = 'panxiao81/new-blog' as const;
export const defaultLicenseUrl = 'https://creativecommons.org/licenses/by-sa/4.0/' as const;
export const siteFoundingYear = 2024 as const;

export const gtagId: string = import.meta.env.GTAG_ID || '';
export const adsenseId: string = import.meta.env.ADSENSE_ID || '';
export const adsenseListSlot: string = import.meta.env.ADSENSE_LIST_SLOT || '';
export const adsensePostSlot: string = import.meta.env.ADSENSE_POST_SLOT || '';
export const consentStorageKey = 'consent-choice' as const;
