import { describe, expect, it } from 'vitest';
import { parseFredCsv } from '../scripts/lib/csv.ts';
import { daily, pctChange, summarizeIndex, summarizeLevel, window } from '../scripts/lib/metrics.ts';

const csv = `observation_date,X
2026-11-09,90
2026-11-10,100
2026-11-11,
2026-11-12,110
2026-11-13,99
2026-11-16,.
2026-11-17,104.5`;

describe('parseFredCsv', () => {
  it('lee vacíos y "." como null sin descartar filas', () => {
    const obs = parseFredCsv(csv);
    expect(obs).toHaveLength(7);
    expect(obs.filter((o) => o.value === null).map((o) => o.date)).toEqual(['2026-11-11', '2026-11-16']);
  });
  it('rechaza un encabezado inesperado', () => {
    expect(() => parseFredCsv('date,X\n2026-11-10,1')).toThrow();
  });
});

describe('metrics', () => {
  const pts = window(parseFredCsv(csv), '2026-11-10', '2026-11-25');

  it('window filtra nulos y fechas fuera de rango', () => {
    expect(pts.map((p) => p.date)).toEqual(['2026-11-10', '2026-11-12', '2026-11-13', '2026-11-17']);
  });

  it('pctChange', () => {
    expect(pctChange(100, 110)).toBe(10);
    expect(pctChange(110, 99)).toBe(-10);
  });

  it('daily compara contra la rueda anterior CON dato, saltando nulos', () => {
    const d = daily(pts, '2026-11-10');
    expect(d.map((x) => [x.date, x.pct])).toEqual([
      ['2026-11-12', 10],
      ['2026-11-13', -10],
      ['2026-11-17', 5.555556],
    ]);
  });

  it('summarizeIndex: acumulada, peor y mejor rueda, drawdown', () => {
    const s = summarizeIndex(pts, '2026-11-10');
    expect(s.cum_pct).toBe(4.5);
    expect(s.cum_points).toBe(4.5);
    expect(s.worst_day?.date).toBe('2026-11-13');
    expect(s.best_day?.date).toBe('2026-11-12');
    expect(s.high).toEqual({ date: '2026-11-12', value: 110, pct: 10, change: 10 });
    expect(s.up_days).toBe(2);
    expect(s.down_days).toBe(1);
    expect(s.max_drawdown_pct).toBe(-10);
  });

  it('summarizeIndex falla si falta la base', () => {
    expect(() => summarizeIndex(pts, '2026-11-09')).toThrow(/base/);
  });

  it('summarizeLevel en puntos básicos para tasas', () => {
    const rates = window(parseFredCsv('observation_date,DGS10\n2026-11-10,4.98\n2026-11-11,\n2026-11-12,5.10\n2026-11-13,4.91'), '2026-11-10', '2026-11-25');
    const s = summarizeLevel(rates, '2026-11-10', true);
    expect(s.change).toBe(-0.07);
    expect(s.change_bp).toBe(-7);
    expect(s.high?.value).toBe(5.1);
    expect(s.biggest_daily_drop?.date).toBe('2026-11-13');
    expect(s.observations).toBe(2);
  });
});
