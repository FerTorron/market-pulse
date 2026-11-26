// Lee data/raw/*.csv (FRED) y genera data/processed/market-data.json.
// Es el ÚNICO lugar de donde salen los números del proyecto.
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { BASE_DATE, PATHS, PERIOD_END, PERIOD_START, SERIES, expectedDaysFor } from './lib/config.ts';
import { parseFredCsv } from './lib/csv.ts';
import { summarizeIndex, summarizeLevel, window } from './lib/metrics.ts';

const manifest = JSON.parse(readFileSync(PATHS.manifest, 'utf8')) as { downloaded_at: string };

const out: Record<string, unknown> = {};
const missing: { series: string; dates: string[] }[] = [];

for (const s of SERIES) {
  const raw = readFileSync(join(PATHS.raw, `${s.fredId}.csv`), 'utf8');
  const obs = parseFredCsv(raw);
  const points = window(obs, BASE_DATE, PERIOD_END);
  const have = new Set(points.map((p) => p.date));
  const lacking = expectedDaysFor(s).filter((d) => !have.has(d));
  if (lacking.length) missing.push({ series: s.fredId, dates: lacking });

  const summary =
    s.kind === 'index' ? summarizeIndex(points, BASE_DATE) : summarizeLevel(points, BASE_DATE, s.kind === 'yield');

  out[s.key] = {
    name: s.name,
    source: { provider: 'FRED', series_id: s.fredId, url: `https://fred.stlouisfed.org/series/${s.fredId}`, raw_sha256: createHash('sha256').update(raw).digest('hex') },
    ...summary,
  };
}

// Comparaciones entre índices (para "quién cayó más"), calculadas, no redactadas.
const idx = SERIES.filter((s) => s.kind === 'index').map((s) => ({ key: s.key, name: s.name, cum_pct: (out[s.key] as { cum_pct: number }).cum_pct }));
const ranked = [...idx].sort((a, b) => a.cum_pct - b.cum_pct);

const data = {
  meta: {
    generated_at: new Date().toISOString(),
    data_downloaded_at: manifest.downloaded_at,
    base_date: BASE_DATE,
    period_start: PERIOD_START,
    period_end: PERIOD_END,
    complete: missing.length === 0,
    missing,
    notes: [
      'DGS10 no tiene dato el 2026-11-11 (Veterans Day: cierra el mercado de bonos, no la bolsa). Esperado.',
      'Variaciones de índices: cierre contra cierre. VIX y tasa: cambios absolutos (puntos y puntos básicos).',
    ],
  },
  ...out,
  comparisons: {
    worst_index: ranked[0],
    best_index: ranked.at(-1),
  },
};

mkdirSync(dirname(PATHS.marketData), { recursive: true });
writeFileSync(PATHS.marketData, JSON.stringify(data, null, 2) + '\n');
console.log(`OK ${PATHS.marketData} · completo=${data.meta.complete}`);
for (const m of missing) console.warn(`  FALTA ${m.series}: ${m.dates.join(', ')}`);
