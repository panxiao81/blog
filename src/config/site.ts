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

export const postsPerPage = 2 as const;

export const siteUrl: string = import.meta.env.SITE || '';

export const utterancesRepo = 'panxiao81/blog' as const;
export const defaultLicenseUrl = 'https://creativecommons.org/licenses/by-sa/4.0/' as const;
