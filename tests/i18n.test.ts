// The site's copy follows the same rule as the story: no digit written by hand.
// Numbers reach the page only through {placeholders} filled from market-data.json.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { findHandwrittenNumbers, type Locale } from '../scripts/lib/render.ts';

const load = (l: Locale) => JSON.parse(readFileSync(`site/src/i18n/locales/${l}.json`, 'utf8')) as unknown;

const strings = (o: unknown, path = ''): [string, string][] =>
  typeof o === 'string' ? [[path, o]] : o && typeof o === 'object' ? Object.entries(o).flatMap(([k, v]) => strings(v, path ? `${path}.${k}` : k)) : [];
const keys = (o: unknown) => strings(o).map(([k]) => k).sort();

describe('site locales', () => {
  for (const l of ['es', 'en'] as Locale[]) {
    it(`${l}.json has no hand-written digits`, () => {
      const bad = strings(load(l)).flatMap(([k, v]) => findHandwrittenNumbers(v, l).map((m) => `${k}: ${m}`));
      expect(bad).toEqual([]);
    });
  }
  it('es.json and en.json have the same keys', () => {
    expect(keys(load('en'))).toEqual(keys(load('es')));
  });
});
