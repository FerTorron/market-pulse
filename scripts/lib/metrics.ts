// Funciones puras. Sin I/O. Toda la aritmética del proyecto vive acá.
import type { Observation } from './csv.ts';

export interface Point { date: string; value: number }
export interface DailyPoint extends Point {
  /** Variación porcentual vs. la rueda anterior con dato (índices). */
  pct: number | null;
  /** Variación absoluta vs. la rueda anterior con dato (puntos, o puntos porcentuales en tasas). */
  change: number | null;
}

const round = (x: number, d = 6) => Math.round(x * 10 ** d) / 10 ** d;

export const pctChange = (from: number, to: number) => round(((to - from) / from) * 100);

/** Toma las observaciones con valor entre base (incluida) y fin (incluido), ordenadas. */
export function window(obs: Observation[], base: string, end: string): Point[] {
  return obs
    .filter((o): o is Point => o.value !== null && o.date >= base && o.date <= end)
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** Serie diaria del período (excluye la base) con cambio contra la rueda anterior. */
export function daily(points: Point[], base: string): DailyPoint[] {
  const out: DailyPoint[] = [];
  for (let i = 0; i < points.length; i++) {
    const p = points[i]!;
    if (p.date <= base) continue;
    const prev = points[i - 1];
    out.push({
      date: p.date,
      value: p.value,
      pct: prev ? pctChange(prev.value, p.value) : null,
      change: prev ? round(p.value - prev.value) : null,
    });
  }
  return out;
}

export function extreme<T extends Point>(points: T[], by: (p: T) => number | null, pick: 'max' | 'min'): T | null {
  let best: T | null = null;
  let bestV = 0;
  for (const p of points) {
    const v = by(p);
    if (v === null) continue;
    if (best === null || (pick === 'max' ? v > bestV : v < bestV)) {
      best = p;
      bestV = v;
    }
  }
  return best;
}

export interface IndexSummary {
  base: Point;
  end: Point;
  cum_pct: number;
  cum_points: number;
  daily: DailyPoint[];
  worst_day: DailyPoint | null;
  best_day: DailyPoint | null;
  high: Point | null;
  low: Point | null;
  up_days: number;
  down_days: number;
  trading_days: number;
  /** Caída desde el máximo del período hasta el mínimo posterior. */
  max_drawdown_pct: number | null;
  /** Variación acumulada contra la base en cada rueda (la base vale 0). Para gráficos. */
  path: { date: string; cum_pct: number }[];
}

export function summarizeIndex(points: Point[], base: string): IndexSummary {
  const b = points.find((p) => p.date === base);
  if (!b) throw new Error(`Falta el cierre base ${base}`);
  const d = daily(points, base);
  const last = d.at(-1);
  if (!last) throw new Error('No hay ruedas en el período');
  // Drawdown: para cada punto, la caída contra el máximo previo (incluye la base).
  let peak = b.value;
  let mdd: number | null = null;
  for (const p of d) {
    peak = Math.max(peak, p.value);
    const dd = pctChange(peak, p.value);
    if (mdd === null || dd < mdd) mdd = dd;
  }
  return {
    base: b,
    end: { date: last.date, value: last.value },
    cum_pct: pctChange(b.value, last.value),
    cum_points: round(last.value - b.value),
    daily: d,
    worst_day: extreme(d, (p) => p.pct, 'min'),
    best_day: extreme(d, (p) => p.pct, 'max'),
    high: extreme(d, (p) => p.value, 'max'),
    low: extreme(d, (p) => p.value, 'min'),
    up_days: d.filter((p) => (p.pct ?? 0) > 0).length,
    down_days: d.filter((p) => (p.pct ?? 0) < 0).length,
    trading_days: d.length,
    max_drawdown_pct: mdd,
    path: [{ date: b.date, cum_pct: 0 }, ...d.map((p) => ({ date: p.date, cum_pct: pctChange(b.value, p.value) }))],
  };
}

export interface LevelSummary {
  base: Point;
  end: Point;
  /** Cambio absoluto fin - base (en tasas: puntos porcentuales). */
  change: number;
  /** Solo para tasas: cambio en puntos básicos. */
  change_bp?: number;
  daily: DailyPoint[];
  high: Point | null;
  low: Point | null;
  biggest_daily_rise: DailyPoint | null;
  biggest_daily_drop: DailyPoint | null;
  observations: number;
}

/** Para VIX y tasas: importan los niveles y cambios absolutos, no tanto el %. */
export function summarizeLevel(points: Point[], base: string, asBasisPoints = false): LevelSummary {
  const b = points.find((p) => p.date === base);
  if (!b) throw new Error(`Falta el valor base ${base}`);
  const d = daily(points, base);
  const last = d.at(-1);
  if (!last) throw new Error('No hay observaciones en el período');
  const change = round(last.value - b.value);
  return {
    base: b,
    end: { date: last.date, value: last.value },
    change,
    ...(asBasisPoints ? { change_bp: round(change * 100, 4) } : {}),
    daily: d,
    high: extreme(d, (p) => p.value, 'max'),
    low: extreme(d, (p) => p.value, 'min'),
    biggest_daily_rise: extreme(d, (p) => p.change, 'max'),
    biggest_daily_drop: extreme(d, (p) => p.change, 'min'),
    observations: d.length,
  };
}
