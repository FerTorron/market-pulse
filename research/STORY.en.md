

# Two weeks in the red: US stocks fell, the Nasdaq, the index with the most tech companies, fell the most, and one day of sharp rebound wasn't enough to make up for it

_From November 11 to November 24, compared with the close on Tuesday, November 10. Reading time: 3 minutes._

## In half a minute

- **All three major indexes ended lower.** S&P 500 −4.25%, Nasdaq −5.32%, Dow Jones −4.24%.
- **According to the financial press, the steepest drops were in companies tied to artificial intelligence**, in two weeks marked by the exit and return of Nvidia's CEO.
- **Expected volatility spiked and then only partly calmed down**: the VIX went from 19.46 to a peak of 35.89.

## Findings

### More bad days than good ones, and the Nasdaq lost the most

Out of 10 trading days, the S&P 500 closed lower on 8 and higher on 2. The Nasdaq, the index most weighted toward tech companies, lost 5.32%; the Dow, heavier on traditional companies, 4.24%.

**In plain terms:** if someone had savings in a fund that tracks the S&P 500, after two weeks their investment was worth about 4.25% less. And at the worst point, the drop from the period's highest close reached 9.31%.

### The worst day was Friday, November 20, and we found no specific announcement that explains it

That day the S&P 500 fell 3.70% and the Nasdaq 5.28%. For the Dow, the worst day was a different one: Thursday, November 19 (−2.19%).

**What coincided:** we found no economic data release or official announcement that day. The press described a heavy sell-off in AI and chip stocks: [UPI](https://www.upi.com/Top_News/US/2026/11/20/Dow-SP-500-enter-correction-as-Nasdaq-plunges-in-AI-stock-sell-off/1061795214998/) attributed it to doubts about the cost and return of AI investment, and [Yahoo Finance](https://finance.yahoo.com/markets/stocks/articles/stock-market-today-futures-plunge-131303598.html) to fears of a bubble bursting. An Interactive Brokers analyst, quoted by CNBC, said that "the dam seemed to break once the big event was behind us"; [Yahoo Finance](https://finance.yahoo.com/markets/stocks/articles/stock-market-today-futures-plunge-131303598.html) places that quote right after mentioning Anthropic's stock market debut on Thursday, November 19 ([AP (via AJC)](https://www.ajc.com/news/2026/11/wall-street-tumbles-to-its-longest-losing-streak-since-2024-as-the-dow-drops-1100-points/)). On Tuesday, November 17, after the close, Nvidia had reported results above expectations ([TheStreet](https://pro.thestreet.com/stock-market-today/nvidia-clears-the-bar-in-its-first-report-without-huang)). This is the press's explanation, not a proven cause.

### The best day coincided with the return of Nvidia's CEO

On Monday, November 23 the S&P 500 rose 4.73% and the Nasdaq 6.51%, the biggest gain of the period for all three indexes.

**What coincided:** that morning, before the open, Nvidia announced that Jensen Huang was returning as CEO ([Nvidia filing with the SEC](https://www.sec.gov/Archives/edgar/data/0001045810/000104581026000090/nov23pressrelease.htm); [TechCrunch](https://techcrunch.com/2026/11/23/nvidia-reverses-course-and-brings-jensen-huang-back-as-ceo/)). He had resigned "effective immediately" on Thursday, November 12 ([Nvidia filing with the SEC](https://www.sec.gov/Archives/edgar/data/0001045810/000104581026000082/nvidiaannouncesceotransiti.htm)). Reuters reported that his return followed an intervention by President Trump ([Reuters via Investing.com](https://www.investing.com/news/stock-market-news/huang-returns-as-nvidia-ceo-after-trump-intervention-in-abrupt-board-reversal-5049490)); Nvidia only referred to input received from "senior levels of the United States government".

Even with that jump, the rebound fell short: at the close on Tuesday, November 24 the S&P 500 was still 4.25% below where it started.

### The VIX: how much movement the market expects

The VIX is often called the "fear index", but it measures something more specific: **how much the market expects S&P 500 stocks to move over the next 30 days**, calculated from what investors pay to protect themselves against those moves. It doesn't say whether stocks will go up or down; it says how much shaking is expected.

It started at 19.46, hit its peak of 35.89 on Friday, November 20 (the same day as the worst drop for the S&P 500 and the Nasdaq) and on Tuesday, November 24 stood at 26.36. Its biggest one-day fall was on Monday, November 23, the day of the rebound. **In plain terms:** the market came to expect much more shaking than at the start, and at the end of the period it still expected more movement than at the beginning.

### The 10-year rate rose, fell and ended close to where it started

The rate the US government pays to borrow for ten years is a benchmark for the long-term cost of money: it affects mortgages and business loans. It went from 4.98% to 4.91% (−7 bp; a basis point is one hundredth of a percentage point). Along the way it reached 5.15%, on Friday, November 13.

**Context:** on Wednesday, November 18 the Federal Reserve published the minutes of its latest meeting, where almost all participants judged that raising interest rates again would likely be appropriate ([Fed](https://federalreserve.gov/monetarypolicy/fomcminutes20261028.htm)). Over these two weeks, the long-term rate ended close to where it started.

## Day by day

Change in each index versus the previous close.

| Day | S&P 500 | Nasdaq Composite | Dow Jones Industrial Average |
|---|---:|---:|---:|
| Wednesday, November 11 | +1.31% | +1.60% | +0.49% |
| Thursday, November 12 | −0.35% | −0.39% | −0.36% |
| Friday, November 13 | −0.40% | −0.91% | +0.10% |
| Monday, November 16 | −1.92% | −2.49% | −1.41% |
| Tuesday, November 17 | −1.03% | −0.74% | −1.64% |
| Wednesday, November 18 | −0.23% | +0.42% | −1.11% |
| Thursday, November 19 | −2.02% | −2.25% | −2.19% |
| Friday, November 20 | −3.70% | −5.28% | −1.93% |
| Monday, November 23 | +4.73% | +6.51% | +3.01% |
| Tuesday, November 24 | −0.50% | −1.48% | +0.85% |

## What this analysis doesn't say

- **It doesn't predict anything.** A fall doesn't tell you whether it will keep falling.
- **It doesn't recommend buying or selling.**
- **"Coincided with" is not "was caused by".** The causes mentioned are the ones the press attributed; we didn't prove them.
- **It only covers two weeks**: it doesn't say whether the indexes are expensive or cheap, or how they've done this year.

## Sources and method

- **Numbers:** [FRED](https://fred.stlouisfed.org/) (Federal Reserve Bank of St. Louis), series SP500, NASDAQCOM, DJIA, VIXCLS and DGS10. Calculated with `scripts/compute.ts`; no market figure in this text was written by hand.
- **Control:** closes were compared with Yahoo Finance, for validation only (`data/processed/cross-check.json`). S&P 500, Nasdaq, Dow and VIX match within the margin; the 10-year rate differs slightly, within the control's tolerance, because Yahoo uses another source (the index published by Cboe, the Chicago options exchange), not the series FRED uses. Yahoo has a rate value on the bond-market holiday (Veterans Day), which is not used.
- **Facts:** `research/events.md`, each with a date and a link, audited by a verifier agent that rejected those with a single source, doubtful dates or causes without evidence (facts: `evidence/audit-eventos.md`; draft: `research/audit.md`).
- **Period:** it ends on Tuesday, November 24. At the time of delivery, FRED had not yet published the next day's close for the S&P 500, the VIX or the 10-year rate (it had for the Nasdaq and the Dow). So that every figure covers the same days, the period stops at the last day with data for all five series.
- **Full process:** `research/PROCESS.md`.


---
<sub>Generated by `scripts/render-story.ts` from `data/processed/market-data.json` (data downloaded 2026-11-27T12:26:13.602Z). No market figure in this document was written by hand.</sub>
