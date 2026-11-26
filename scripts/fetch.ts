// Baja los CSV de FRED (fuente única de datos) y, por separado, las series de Yahoo Finance
// (solo para validación cruzada). Guarda los archivos tal cual llegan y un manifest con
// URL, fecha de descarga y hash, para poder probar que nadie los tocó después.
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { FETCH_FROM, PATHS, PERIOD_END, SERIES } from './lib/config.ts';
import { parseFredCsv } from './lib/csv.ts';

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');
const UA = 'Mozilla/5.0 (compatible; market-pulse/1.0)';

async function get(url: string): Promise<string> {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} en ${url}`);
  return res.text();
}

const toUnix = (isoDate: string) => Math.floor(Date.parse(`${isoDate}T00:00:00Z`) / 1000);

async function main() {
  mkdirSync(PATHS.raw, { recursive: true });
  mkdirSync(PATHS.rawYahoo, { recursive: true });
  const downloadedAt = new Date().toISOString();
  const entries: unknown[] = [];

  for (const s of SERIES) {
    const url = `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${s.fredId}&cosd=${FETCH_FROM}&coed=${PERIOD_END}`;
    const text = await get(url);
    const file = join(PATHS.raw, `${s.fredId}.csv`).replaceAll('\\', '/');
    writeFileSync(file, text);
    const obs = parseFredCsv(text);
    const lastWithValue = [...obs].reverse().find((o) => o.value !== null)?.date ?? null;
    entries.push({ source: 'FRED', role: 'data', series: s.fredId, url, file, sha256: sha256(text), rows: obs.length, last_date_with_value: lastWithValue });
    console.log(`FRED  ${s.fredId.padEnd(10)} filas=${obs.length} último dato=${lastWithValue}`);
  }

  // Yahoo: SOLO validación. Si falla, se registra y se sigue: no bloquea el pipeline.
  const p1 = toUnix(FETCH_FROM);
  const p2 = toUnix(PERIOD_END) + 2 * 86400;
  for (const s of SERIES) {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(s.yahooSymbol)}?period1=${p1}&period2=${p2}&interval=1d`;
    const file = join(PATHS.rawYahoo, `${s.fredId}.json`).replaceAll('\\', '/');
    try {
      const text = await get(url);
      writeFileSync(file, text);
      entries.push({ source: 'Yahoo Finance', role: 'validation-only', series: s.fredId, symbol: s.yahooSymbol, url, file, sha256: sha256(text) });
      console.log(`Yahoo ${s.yahooSymbol.padEnd(10)} ok (solo validación)`);
    } catch (err) {
      entries.push({ source: 'Yahoo Finance', role: 'validation-only', series: s.fredId, symbol: s.yahooSymbol, url, error: String(err) });
      console.warn(`Yahoo ${s.yahooSymbol.padEnd(10)} FALLÓ: ${String(err)}`);
    }
  }

  writeFileSync(PATHS.manifest, JSON.stringify({ downloaded_at: downloadedAt, period_end_requested: PERIOD_END, entries }, null, 2) + '\n');
  console.log(`Manifest: ${PATHS.manifest} (descargado ${downloadedAt})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
