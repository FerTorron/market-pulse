// Controla los datos y los cálculos. Sale con código 1 si hay errores.
// - Integridad: hash de los raw contra el manifest.
// - Fechas: faltantes, sobrantes (fines de semana / feriados), duplicadas.
// - Nulos: solo se aceptan los feriados de bonos documentados.
// - Cálculos: recalcula de forma INDEPENDIENTE (no usa lib/metrics.ts) y compara con market-data.json.
// - Validación cruzada con Yahoo: las diferencias se documentan en cross-check.json; nunca se mezclan datos.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { BASE_DATE, BOND_MARKET_HOLIDAYS, PATHS, PERIOD_END, SERIES, expectedDaysFor } from './lib/config.ts';

type Level = 'error' | 'warning' | 'info';
const findings: { level: Level; series?: string; check: string; detail: string }[] = [];
const add = (level: Level, check: string, detail: string, series?: string) => findings.push({ level, check, detail, ...(series ? { series } : {}) });

const TOL = 1e-6;
const CROSS_TOL_PCT = 0.05; // índices y VIX: diferencia de cierre aceptable entre FRED y Yahoo, en %
// Tasas: DGS10 (Tesoro, curva constante) y ^TNX (CBOE) se calculan distinto y DGS10 viene redondeado a 0,01.
// Una tolerancia relativa no tiene sentido ahí: se usa una absoluta en puntos básicos.
const CROSS_TOL_BP = 2;

const manifest = JSON.parse(readFileSync(PATHS.manifest, 'utf8')) as {
  entries: { source: string; role: string; series: string; file?: string; sha256?: string; error?: string }[];
};
const md = JSON.parse(readFileSync(PATHS.marketData, 'utf8')) as Record<string, any>;

// ---------- Integridad de los raw ----------
for (const e of manifest.entries) {
  if (!e.file || !e.sha256) continue;
  const h = createHash('sha256').update(readFileSync(e.file, 'utf8')).digest('hex');
  if (h !== e.sha256) add('error', 'raw-integrity', `${e.file} cambió después de descargarse`, e.series);
}

// Parser mínimo independiente.
const readRaw = (id: string) =>
  readFileSync(join(PATHS.raw, `${id}.csv`), 'utf8')
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((l) => {
      const [d, v] = l.split(',');
      const t = (v ?? '').trim();
      return { date: (d ?? '').trim(), v: t === '' || t === '.' ? null : parseFloat(t) };
    });

const isWeekend = (d: string) => [0, 6].includes(new Date(`${d}T12:00:00Z`).getUTCDay());
const close = (a: number, b: number) => Math.abs(a - b) <= TOL * Math.max(1, Math.abs(a));
const cross: Record<string, unknown> = {};

for (const s of SERIES) {
  const rows = readRaw(s.fredId);
  const inPeriod = rows.filter((r) => r.date >= BASE_DATE && r.date <= PERIOD_END);
  const expected = new Set([BASE_DATE, ...expectedDaysFor(s)]);

  // ---------- Duplicados ----------
  const seen = new Set<string>();
  for (const r of rows) {
    if (seen.has(r.date)) add('error', 'duplicates', `fecha duplicada ${r.date}`, s.fredId);
    seen.add(r.date);
  }

  // ---------- Nulos ----------
  for (const r of inPeriod.filter((r) => r.v === null)) {
    const expectedNull = s.kind === 'yield' && (BOND_MARKET_HOLIDAYS as readonly string[]).includes(r.date);
    add(expectedNull ? 'info' : 'error', 'nulls', `${r.date} sin valor${expectedNull ? ' (feriado de bonos, esperado)' : ''}`, s.fredId);
  }

  // ---------- Fechas faltantes / sobrantes ----------
  const withValue = new Set(inPeriod.filter((r) => r.v !== null).map((r) => r.date));
  const lacking = [...expected].filter((d) => !withValue.has(d));
  if (lacking.length) add('error', 'missing-dates', `faltan: ${lacking.join(', ')}`, s.fredId);
  for (const d of withValue) {
    if (!expected.has(d)) add('error', 'unexpected-dates', `dato en día no hábil esperado: ${d}${isWeekend(d) ? ' (fin de semana)' : ''}`, s.fredId);
  }

  // ---------- Recalcular de forma independiente ----------
  const m = md[s.key];
  if (!m) {
    add('error', 'recompute', 'no está en market-data.json', s.fredId);
    continue;
  }
  const pts = inPeriod.filter((r): r is { date: string; v: number } => r.v !== null).sort((a, b) => (a.date < b.date ? -1 : 1));
  const base = pts.find((p) => p.date === BASE_DATE);
  const last = pts.at(-1);
  if (!base || !last) {
    add('error', 'recompute', 'no hay base o fin para recalcular', s.fredId);
    continue;
  }
  const chk = (label: string, mine: number, theirs: unknown) => {
    if (typeof theirs !== 'number' || !close(mine, theirs)) add('error', 'recompute', `${label}: recalculado=${mine} json=${String(theirs)}`, s.fredId);
  };
  chk('base', base.v, m.base?.value);
  chk('fin', last.v, m.end?.value);
  if (m.end?.date !== last.date) add('error', 'recompute', `fecha fin: recalculada=${last.date} json=${m.end?.date}`, s.fredId);

  const dailyPct: { date: string; pct: number; chg: number }[] = [];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]!, b = pts[i]!;
    dailyPct.push({ date: b.date, pct: ((b.v - a.v) / a.v) * 100, chg: b.v - a.v });
  }
  if (dailyPct.length !== m.daily?.length) add('error', 'recompute', `cantidad de ruedas: recalculada=${dailyPct.length} json=${m.daily?.length}`, s.fredId);
  dailyPct.forEach((d, i) => {
    const j = m.daily?.[i];
    if (!j || j.date !== d.date) add('error', 'recompute', `rueda ${i}: fecha ${d.date} vs ${j?.date}`, s.fredId);
    else if (s.kind === 'index') chk(`pct ${d.date}`, d.pct, j.pct);
    else chk(`cambio ${d.date}`, d.chg, j.change);
  });

  if (s.kind === 'index') {
    chk('variación acumulada %', ((last.v - base.v) / base.v) * 100, m.cum_pct);
    const worst = dailyPct.reduce((a, b) => (b.pct < a.pct ? b : a));
    chk('peor rueda %', worst.pct, m.worst_day?.pct);
    if (worst.date !== m.worst_day?.date) add('error', 'recompute', `peor rueda: ${worst.date} vs ${m.worst_day?.date}`, s.fredId);
  } else {
    const hi = pts.filter((p) => p.date !== BASE_DATE).reduce((a, b) => (b.v > a.v ? b : a));
    chk('máximo', hi.v, m.high?.value);
    if (hi.date !== m.high?.date) add('error', 'recompute', `fecha del máximo: ${hi.date} vs ${m.high?.date}`, s.fredId);
    chk('cambio total', last.v - base.v, m.change);
    if (s.kind === 'yield') chk('cambio en pb', (last.v - base.v) * 100, m.change_bp);
  }

  // ---------- Validación cruzada con Yahoo (solo control) ----------
  const yEntry = manifest.entries.find((e) => e.source === 'Yahoo Finance' && e.series === s.fredId);
  if (!yEntry?.file || !existsSync(yEntry.file)) {
    add('warning', 'cross-check', `Yahoo no disponible (${yEntry?.error ?? 'sin archivo'}); validación cruzada no realizada`, s.fredId);
    continue;
  }
  try {
    const y = JSON.parse(readFileSync(yEntry.file, 'utf8')).chart.result[0];
    const off: number = y.meta.gmtoffset;
    const closes: (number | null)[] = y.indicators.quote[0].close;
    const yMap = new Map<string, number>();
    (y.timestamp as number[]).forEach((t, i) => {
      const c = closes[i];
      if (c != null) yMap.set(new Date((t + off) * 1000).toISOString().slice(0, 10), c);
    });
    const rowsCross = pts.map((p) => {
      const yv = yMap.get(p.date);
      if (yv === undefined) return { date: p.date, fred: p.v, yahoo: null, diff_pct: null, flag: 'falta en Yahoo' };
      const diffPct = ((yv - p.v) / p.v) * 100;
      const diffBp = (yv - p.v) * 100;
      const off = s.kind === 'yield' ? Math.abs(diffBp) > CROSS_TOL_BP : Math.abs(diffPct) > CROSS_TOL_PCT;
      return { date: p.date, fred: p.v, yahoo: Math.round(yv * 1e4) / 1e4, diff_pct: Math.round(diffPct * 1e4) / 1e4, ...(s.kind === 'yield' ? { diff_bp: Math.round(diffBp * 100) / 100 } : {}), flag: off ? 'difiere' : 'ok' };
    });
    const extraInYahoo = [...yMap.keys()].filter((d) => d >= BASE_DATE && d <= PERIOD_END && !pts.some((p) => p.date === d));
    const flagged = rowsCross.filter((r) => r.flag !== 'ok');
    const tol = s.kind === 'yield' ? `±${CROSS_TOL_BP} pb` : `±${CROSS_TOL_PCT}%`;
    cross[s.fredId] = { yahoo_symbol: s.yahooSymbol, tolerance: tol, rows: rowsCross, dates_only_in_yahoo: extraInYahoo, flagged: flagged.length };
    if (flagged.length) add('warning', 'cross-check', `${flagged.length} fechas difieren o faltan vs Yahoo ${s.yahooSymbol}: ${flagged.map((r) => `${r.date}(${r.flag}${r.diff_pct !== null ? ` ${r.diff_pct}%` : ''})`).join(', ')}`, s.fredId);
    if (extraInYahoo.length) add('warning', 'cross-check', `Yahoo tiene fechas que FRED no: ${extraInYahoo.join(', ')} (no se usan)`, s.fredId);
    if (!flagged.length && !extraInYahoo.length) add('info', 'cross-check', `coincide con Yahoo ${s.yahooSymbol} dentro de ${tol}`, s.fredId);
  } catch (err) {
    add('warning', 'cross-check', `respuesta de Yahoo ilegible: ${String(err)}`, s.fredId);
  }
}

if (md.meta?.complete !== true) add('error', 'completeness', `market-data.json marcado incompleto: ${JSON.stringify(md.meta?.missing)}`);

const errors = findings.filter((f) => f.level === 'error');
const warnings = findings.filter((f) => f.level === 'warning');
const report = { validated_at: new Date().toISOString(), status: errors.length ? 'FAIL' : 'PASS', errors: errors.length, warnings: warnings.length, findings };
writeFileSync(PATHS.validation, JSON.stringify(report, null, 2) + '\n');
writeFileSync(PATHS.crossCheck, JSON.stringify({ generated_at: report.validated_at, note: 'Yahoo Finance se usa SOLO como control. Ningún valor de Yahoo entra en market-data.json.', series: cross }, null, 2) + '\n');

for (const f of findings) console.log(`[${f.level.toUpperCase().padEnd(7)}] ${(f.series ?? '-').padEnd(10)} ${f.check.padEnd(16)} ${f.detail}`);
console.log(`\nValidación: ${report.status} · ${errors.length} errores · ${warnings.length} advertencias`);
process.exit(errors.length ? 1 : 0);
