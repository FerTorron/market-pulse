// Configuración única del período, series y calendario.
// Cambiar el período = cambiar este archivo. Nada más.

export const BASE_DATE = '2026-11-10';
export const PERIOD_START = '2026-11-11';
export const PERIOD_END = '2026-11-25';
/** Margen hacia atrás para asegurarnos de tener el cierre base. */
export const FETCH_FROM = '2026-11-03';

/** Ruedas de NYSE del período (11/11 al 25/11/2026). Escrito a mano a propósito:
 *  validate.ts compara contra esto para detectar fechas faltantes o sobrantes. */
export const EQUITY_TRADING_DAYS = [
  '2026-11-11', '2026-11-12', '2026-11-13',
  '2026-11-16', '2026-11-17', '2026-11-18', '2026-11-19', '2026-11-20',
  '2026-11-23', '2026-11-24', '2026-11-25',
] as const;

/** Días en que la bolsa abre pero el mercado de bonos cierra (SIFMA). */
export const BOND_MARKET_HOLIDAYS = ['2026-11-11'] as const; // Veterans Day

export const BOND_TRADING_DAYS = EQUITY_TRADING_DAYS.filter(
  (d) => !(BOND_MARKET_HOLIDAYS as readonly string[]).includes(d),
);

export type SeriesKind = 'index' | 'volatility' | 'yield';

export interface SeriesDef {
  key: 'sp500' | 'nasdaq' | 'dow' | 'vix' | 'us10y';
  fredId: string;
  name: string;
  kind: SeriesKind;
  /** Símbolo de Yahoo Finance, SOLO para validación cruzada. */
  yahooSymbol: string;
}

export const SERIES: SeriesDef[] = [
  { key: 'sp500', fredId: 'SP500', name: 'S&P 500', kind: 'index', yahooSymbol: '^GSPC' },
  { key: 'nasdaq', fredId: 'NASDAQCOM', name: 'Nasdaq Composite', kind: 'index', yahooSymbol: '^IXIC' },
  { key: 'dow', fredId: 'DJIA', name: 'Dow Jones Industrial Average', kind: 'index', yahooSymbol: '^DJI' },
  { key: 'vix', fredId: 'VIXCLS', name: 'VIX (CBOE Volatility Index)', kind: 'volatility', yahooSymbol: '^VIX' },
  { key: 'us10y', fredId: 'DGS10', name: 'Tasa del Tesoro a 10 años', kind: 'yield', yahooSymbol: '^TNX' },
];

export const expectedDaysFor = (s: SeriesDef): readonly string[] =>
  s.kind === 'yield' ? BOND_TRADING_DAYS : EQUITY_TRADING_DAYS;

export const PATHS = {
  raw: 'data/raw',
  rawYahoo: 'data/raw/yahoo',
  manifest: 'data/raw/manifest.json',
  marketData: 'data/processed/market-data.json',
  validation: 'data/processed/validation-report.json',
  crossCheck: 'data/processed/cross-check.json',
  storyTemplate: 'research/STORY.template.md',
  story: 'research/STORY.md',
} as const;
