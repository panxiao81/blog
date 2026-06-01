export const locales = ['en', 'zh', 'ja'] as const;

export type Locale = (typeof locales)[number];

export const siteConfig = {
  title: 'Xiao Pan',
  description: 'Plain multilingual writing.',
} as const;
