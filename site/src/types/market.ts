import type { IndexSummary, LevelSummary } from '@pipeline/metrics.ts';

export type IndexKey = 'sp500' | 'nasdaq' | 'dow';

interface Source {
  name: string;
  source: { provider: string; series_id: string; url: string };
}

export interface MarketData {
  meta: {
    base_date: string;
    period_start: string;
    period_end: string;
    complete: boolean;
    missing: { series: string; dates: string[] }[];
    data_downloaded_at: string;
  };
  sp500: IndexSummary & Source;
  nasdaq: IndexSummary & Source;
  dow: IndexSummary & Source;
  vix: LevelSummary & Source;
  us10y: LevelSummary & Source;
}
