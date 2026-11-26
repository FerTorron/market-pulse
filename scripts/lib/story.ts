// Arma la historia de un idioma a partir de su plantilla y market-data.json.
// La usan scripts/render-story.ts (genera research/STORY*.md) y el sitio (site/), así los dos
// pasan por los mismos controles: dígitos a mano, marcadores, aserciones, validación y cross-check.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { PATHS } from './config.ts';
import { render, type Locale } from './render.ts';

/** Raíz del repo. Por defecto se resuelve desde este archivo; cuando el código se empaqueta
 *  (el build del sitio lo mueve a dist/), quien empaqueta la fija con MARKET_PULSE_ROOT. */
export const REPO_ROOT = process.env.MARKET_PULSE_ROOT ?? fileURLToPath(new URL('../../', import.meta.url));
const read = (rel: string) => readFileSync(join(REPO_ROOT, rel), 'utf8');
export const readJson = <T>(rel: string): T => JSON.parse(read(rel)) as T;

export interface DataStatus {
  validationPassed: boolean;
  complete: boolean;
  missing: { series: string; dates: string[] }[];
  errors: string[];
  crossCheckFlagged: string[];
  downloadedAt: string;
}

export function getDataStatus(): DataStatus {
  const validation = readJson<{ status: string; findings: { level: string; series?: string; detail: string }[] }>(PATHS.validation);
  const data = readJson<{ meta: { complete: boolean; missing: DataStatus['missing']; data_downloaded_at: string } }>(PATHS.marketData);
  const cross = readJson<{ series: Record<string, { flagged: number }> }>(PATHS.crossCheck);
  return {
    validationPassed: validation.status === 'PASS',
    complete: data.meta.complete,
    missing: data.meta.missing,
    errors: validation.findings.filter((f) => f.level === 'error').map((f) => `${f.series ?? '-'}: ${f.detail}`),
    crossCheckFlagged: Object.entries(cross.series).filter(([, v]) => v.flagged > 0).map(([k, v]) => `${k} (${v.flagged})`),
    downloadedAt: data.meta.data_downloaded_at,
  };
}

export const readMarketData = <T = unknown>() => readJson<T>(PATHS.marketData);
export const readTemplate = (locale: Locale) => read(PATHS.storyTemplate[locale]);

/** Devuelve el markdown de la historia. Lanza si la plantilla no pasa los controles. No mira la validación:
 *  quien llama decide qué hacer si los datos están incompletos (ver getDataStatus). */
export function buildStory(locale: Locale): string {
  return render(readTemplate(locale), readMarketData(), locale);
}

/** Extrae el bloque de aserciones (para comprobar que es idéntico entre idiomas). */
export const assertBlock = (template: string) => template.match(/<!--\s*assert\b[\s\S]*?-->/)?.[0] ?? '';
