// Turns market-data.json into what a line chart needs. Every value shown is formatted here
// from the data with the pipeline's own formatters; the browser never computes or formats numbers.
import type { Formatter } from '@pipeline/render.ts';
import type { IndexKey, MarketData } from '@/types/market.ts';
import { domainOf, niceTicks, type Domain } from './scales.ts';

type Formats = Record<string, Formatter>;
const fmt = (F: Formats, name: string): Formatter => {
  const f = F[name];
  if (!f) throw new Error(`Unknown format "${name}"`);
  return f;
};

export interface LineSeries {
  key: string;
  name: string;
  color: string;
  values: (number | null)[];
  endLabel: string;
}

export interface LineChartModel {
  dates: string[];
  xTicks: { top: string; bottom: string }[];
  series: LineSeries[];
  domain: Domain;
  yTicks: { value: number; label: string }[];
  zeroLine: boolean;
  annotations: { index: number; label: string }[];
  tooltip: { heading: string; rows: { name: string; value: string; color: string }[] }[];
  table: { columns: string[]; rows: string[][] };
}

const INDEXES: { key: IndexKey; color: string }[] = [
  { key: 'sp500', color: 'var(--series-1)' },
  { key: 'nasdaq', color: 'var(--series-2)' },
  { key: 'dow', color: 'var(--series-3)' },
];

const lastValue = (values: (number | null)[]) => [...values].reverse().find((v): v is number => v !== null);

function ticksFor(domain: Domain, F: Formats, kind: 'pct' | 'level') {
  const ticks = niceTicks(domain, 5);
  const integer = ticks.every((v) => Number.isInteger(v));
  const f = kind === 'pct' ? fmt(F, integer ? 'pct0' : 'pct1') : fmt(F, integer ? 'num0' : 'num');
  return ticks.map((value) => ({ value, label: f(value) }));
}

const xTicks = (dates: string[], F: Formats) => dates.map((d) => ({ top: fmt(F, 'dowShort')(d), bottom: fmt(F, 'dayNum')(d) }));

interface Labels {
  worstDay: string;
  bestDay: string;
  dateColumn: string;
  noData: string;
}

/** Cumulative change of the three indexes since the base close. */
export function cumulativeModel(market: MarketData, F: Formats, labels: Labels): LineChartModel {
  const dates = [...new Set(INDEXES.flatMap(({ key }) => market[key].path.map((p) => p.date)))].sort();
  const series: LineSeries[] = INDEXES.map(({ key, color }) => {
    const byDate = new Map(market[key].path.map((p) => [p.date, p.cum_pct]));
    const values = dates.map((d) => byDate.get(d) ?? null);
    return { key, name: market[key].name, color, values, endLabel: fmt(F, 'pct')(lastValue(values)!) };
  });
  const domain = domainOf(series.flatMap((s) => s.values.filter((v): v is number => v !== null)), { includeZero: true });
  const pct = fmt(F, 'pct');
  const dow = fmt(F, 'dow');
  const shortNames: Record<IndexKey, string> = { sp500: 'S&P 500', nasdaq: 'Nasdaq', dow: 'Dow Jones' };
  for (const s of series) s.name = shortNames[s.key as IndexKey];
  return {
    dates,
    xTicks: xTicks(dates, F),
    series,
    domain,
    yTicks: ticksFor(domain, F, 'pct'),
    zeroLine: true,
    annotations: [
      { index: dates.indexOf(market.sp500.worst_day!.date), label: labels.worstDay },
      { index: dates.indexOf(market.sp500.best_day!.date), label: labels.bestDay },
    ].filter((a) => a.index >= 0),
    tooltip: dates.map((d, i) => ({
      heading: dow(d),
      rows: series.map((s) => ({ name: s.name, color: s.color, value: s.values[i] === null ? labels.noData : pct(s.values[i]) })),
    })),
    table: {
      columns: [labels.dateColumn, ...series.map((s) => s.name)],
      rows: dates.map((d, i) => [dow(d), ...series.map((s) => (s.values[i] === null ? labels.noData : pct(s.values[i])))]),
    },
  };
}

/** VIX level each day, starting at the base. */
export function vixModel(market: MarketData, F: Formats, labels: Labels): LineChartModel {
  const points = [market.vix.base, ...market.vix.daily];
  const dates = points.map((p) => p.date);
  const values = points.map((p) => p.value);
  const num = fmt(F, 'num');
  const dow = fmt(F, 'dow');
  const series: LineSeries[] = [{ key: 'vix', name: 'VIX', color: 'var(--ink-2)', values, endLabel: num(values.at(-1)!) }];
  const domain = domainOf(values, { pad: 0.12 });
  return {
    dates,
    xTicks: xTicks(dates, F),
    series,
    domain,
    yTicks: ticksFor(domain, F, 'level'),
    zeroLine: false,
    annotations: [],
    tooltip: dates.map((d, i) => ({ heading: dow(d), rows: [{ name: 'VIX', color: series[0]!.color, value: num(values[i]) }] })),
    table: { columns: [labels.dateColumn, 'VIX'], rows: dates.map((d, i) => [dow(d), num(values[i])]) },
  };
}
