import type { Locale } from '@pipeline/render.ts';

export type { Locale };
export const LOCALES: Locale[] = ['es', 'en'];
export const DEFAULT_LOCALE: Locale = 'es';

/** Route of the home page for each locale. Spanish is the default and has no prefix. */
export const homePath = (locale: Locale) => (locale === DEFAULT_LOCALE ? '/' : `/${locale}/`);

export const isLocale = (value: string | undefined): value is Locale => LOCALES.includes(value as Locale);
