// Single entry point for the data the page uses. Everything comes from the pipeline's files.
import { buildStory, getDataStatus, readMarketData, type DataStatus } from '@pipeline/story.ts';
import type { Locale } from '@/i18n/config.ts';
import type { MarketData } from '@/types/market.ts';

export interface SiteData {
  market: MarketData;
  status: DataStatus;
  storyMarkdown: string;
}

/** A production build with incomplete data fails, unless ALLOW_INCOMPLETE=1 is set on purpose
 *  (the page then shows a visible "incomplete data" notice). Dev always builds, with the notice. */
function assertPublishable(status: DataStatus) {
  const allowIncomplete = process.env.ALLOW_INCOMPLETE === '1';
  if (status.crossCheckFlagged.length) {
    throw new Error(`cross-check.json has differences outside tolerance: ${status.crossCheckFlagged.join(', ')}`);
  }
  if (!status.validationPassed && import.meta.env.PROD && !allowIncomplete) {
    throw new Error(`Validation did not pass (${status.errors.join(' | ')}). Refusing to build. Set ALLOW_INCOMPLETE=1 to build a draft.`);
  }
}

export function loadSiteData(locale: Locale): SiteData {
  const status = getDataStatus();
  assertPublishable(status);
  return { market: readMarketData<MarketData>(), status, storyMarkdown: buildStory(locale) };
}
