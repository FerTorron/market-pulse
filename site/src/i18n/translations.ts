// One file per language in ./locales. The site has a single page, so each file holds that page's copy.
// If more pages are added, split each language into one file per page (locales/<lang>/<page>.json).
import es from './locales/es.json';
import en from './locales/en.json';
import type { Locale } from './config.ts';

export type Messages = typeof es;

const MESSAGES: Record<Locale, Messages> = { es, en };

export const getMessages = (locale: Locale): Messages => MESSAGES[locale];

/** Replaces {name} placeholders with values that come from the data, never from the copy itself. */
export const fill = (text: string, values: Record<string, string>) =>
  text.replace(/\{(\w+)\}/g, (_, key: string) => {
    if (!(key in values)) throw new Error(`Missing value for placeholder {${key}} in "${text}"`);
    return values[key]!;
  });
