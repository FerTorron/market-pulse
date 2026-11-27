<!--
English version of research/STORY.template.md. It must say the same thing, claim by claim: the verifier checks equivalence.
No digits outside markers (enforced by scripts/lib/render.ts with the English allowed phrases).
The assert block below must be identical to the Spanish template (enforced by a test).
-->
<!-- assert
# Condiciones de los datos que el texto da por ciertas. Si los datos cambian (por ejemplo, si se vuelven a bajar) y alguna deja de cumplirse, el render falla.
# Salen de la lista "qué volver a comprobar" del verifier (pasadas 2 y 3).
# Lo que no está acá lo controla otra pieza: datos completos al cierre del período, cantidad de ruedas y tabla sin "s/d" → validate.ts (render no corre si no pasa);
# "coinciden dentro del margen" con Yahoo → render-story.ts falla si cross-check.json tiene diferencias marcadas.
sp500.cum_pct < 0
nasdaq.cum_pct < 0
dow.cum_pct < 0
comparisons.worst_index.key == 'nasdaq'
sp500.down_days > sp500.up_days
sp500.worst_day.date == '2026-11-20'
nasdaq.worst_day.date == sp500.worst_day.date
vix.high.date == sp500.worst_day.date
dow.worst_day.date != sp500.worst_day.date
sp500.best_day.date == '2026-11-23'
nasdaq.best_day.date == '2026-11-23'
dow.best_day.date == '2026-11-23'
vix.biggest_daily_drop.date == sp500.best_day.date
vix.end.value > vix.base.value
vix.end.value < vix.high.value
us10y.high.value > us10y.base.value
us10y.low.value < us10y.base.value
# "subió, bajó": el máximo fue antes que el final, el 13/11
us10y.high.date == '2026-11-13'
# "desde el cierre más alto del período": hubo un cierre por encima de la base
sp500.high.value > sp500.base.value
# "terminó cerca de donde empezó": menos de 10 pb en valor absoluto (umbral fijado en DECISIONS D8).
us10y.change_bp > -10
us10y.change_bp < 10
-->
# Two weeks in the red: US stocks fell, tech fell the most, and one day of sharp rebound wasn't enough to make up for it

_From {{meta.period_start|date}} to {{meta.period_end|date}}, compared with the close on {{meta.base_date|dow}}. Reading time: 3 minutes._

## In half a minute

- **All three major indexes ended lower.** S&P 500 {{sp500.cum_pct|pct}}, Nasdaq {{nasdaq.cum_pct|pct}}, Dow Jones {{dow.cum_pct|pct}}.
- **According to the financial press, the steepest drops were in companies tied to artificial intelligence**, in two weeks marked by the exit and return of Nvidia's CEO.
- **Expected volatility spiked and then only partly calmed down**: the VIX went from {{vix.base.value|num}} to a peak of {{vix.high.value|num}}.

## Findings

### More bad days than good ones, and the Nasdaq lost the most

Out of {{sp500.trading_days|int}} trading days, the S&P 500 closed lower on {{sp500.down_days|int}} and higher on {{sp500.up_days|int}}. The Nasdaq, the index most weighted toward tech companies, lost {{nasdaq.cum_pct|abspct}}; the Dow, heavier on traditional companies, {{dow.cum_pct|abspct}}.

**In plain terms:** if someone had savings in a fund that tracks the S&P 500, after two weeks their investment was worth about {{sp500.cum_pct|abspct}} less. And at the worst point, the drop from the period's highest close reached {{sp500.max_drawdown_pct|abspct}}.

### The worst day was {{sp500.worst_day.date|dow}}, and we found no specific announcement that explains it

That day the S&P 500 fell {{sp500.worst_day.pct|abspct}} and the Nasdaq {{nasdaq.worst_day.pct|abspct}}. For the Dow, the worst day was a different one: {{dow.worst_day.date|dow}} ({{dow.worst_day.pct|pct}}).

**What coincided:** we found no economic data release or official announcement that day. The press described a heavy sell-off in AI and chip stocks: [UPI](https://www.upi.com/Top_News/US/2026/11/20/Dow-SP-500-enter-correction-as-Nasdaq-plunges-in-AI-stock-sell-off/1061795214998/) attributed it to doubts about the cost and return of AI investment, and [Yahoo Finance](https://finance.yahoo.com/markets/stocks/articles/stock-market-today-futures-plunge-131303598.html) to fears of a bubble bursting. An Interactive Brokers analyst, quoted by CNBC, said that "the dam seemed to break once the big event was behind us"; [Yahoo Finance](https://finance.yahoo.com/markets/stocks/articles/stock-market-today-futures-plunge-131303598.html) places that quote right after mentioning Anthropic's stock market debut on {{d:2026-11-19}} ([AP](https://www.ajc.com/news/2026/11/wall-street-tumbles-to-its-longest-losing-streak-since-2024-as-the-dow-drops-1100-points/)). Two days earlier, after the close on {{d:2026-11-17}}, Nvidia had reported results above expectations ([TheStreet](https://pro.thestreet.com/stock-market-today/nvidia-clears-the-bar-in-its-first-report-without-huang)). This is the press's explanation, not a proven cause.

### The best day coincided with the return of Nvidia's CEO

On {{sp500.best_day.date|dow}} the S&P 500 rose {{sp500.best_day.pct|abspct}} and the Nasdaq {{nasdaq.best_day.pct|abspct}}, the biggest gain of the period for all three indexes.

**What coincided:** that morning, before the open, Nvidia announced that Jensen Huang was returning as CEO ([Nvidia filing with the SEC](https://www.sec.gov/Archives/edgar/data/0001045810/000104581026000090/nov23pressrelease.htm); [TechCrunch](https://techcrunch.com/2026/11/23/nvidia-reverses-course-and-brings-jensen-huang-back-as-ceo/)). He had resigned "effective immediately" on {{d:2026-11-12}} ([Nvidia filing with the SEC](https://www.sec.gov/Archives/edgar/data/0001045810/000104581026000082/nvidiaannouncesceotransiti.htm)). Reuters reported that his return followed an intervention by President Trump ([Reuters via Investing.com](https://www.investing.com/news/stock-market-news/huang-returns-as-nvidia-ceo-after-trump-intervention-in-abrupt-board-reversal-5049490)); Nvidia only referred to input received from "senior levels of the United States government".

Even with that jump, the rebound fell short: at the close on {{sp500.end.date|dow}} the S&P 500 was still {{sp500.cum_pct|abspct}} below where it started.

### The VIX: how much movement the market expects

The VIX is often called the "fear index", but it measures something more specific: **how much the market expects S&P 500 stocks to move over the next 30 days**, calculated from what investors pay to protect themselves against those moves. It doesn't say whether stocks will go up or down; it says how much shaking is expected.

It started at {{vix.base.value|num}}, hit its peak of {{vix.high.value|num}} on {{vix.high.date|dow}} (the same day as the worst drop for the S&P 500 and the Nasdaq) and on {{vix.end.date|dow}} stood at {{vix.end.value|num}}. Its biggest one-day fall was on {{vix.biggest_daily_drop.date|dow}}, the day of the rebound. **In plain terms:** the market came to expect much more shaking than at the start, and at the end of the period it still expected more movement than at the beginning.

### The 10-year rate rose, fell and ended close to where it started

The rate the US government pays to borrow for ten years is a benchmark for the long-term cost of money: it affects mortgages and business loans. It went from {{us10y.base.value|rate}} to {{us10y.end.value|rate}} ({{us10y.change_bp|bp}}; a basis point is one hundredth of a percentage point). Along the way it reached {{us10y.high.value|rate}}, on {{us10y.high.date|dow}}.

**Context:** on {{d:2026-11-18}} the Federal Reserve published the minutes of its latest meeting, where almost all participants judged that raising interest rates again would likely be appropriate ([Fed](https://federalreserve.gov/monetarypolicy/fomcminutes20261028.htm)). Over these two weeks, the long-term rate ended close to where it started.

## Day by day

Change in each index versus the previous close.

{{table:daily}}

## What this analysis doesn't say

- **It doesn't predict anything.** A fall doesn't tell you whether it will keep falling.
- **It doesn't recommend buying or selling.**
- **"Coincided with" is not "was caused by".** The causes mentioned are the ones the press attributed; we didn't prove them.
- **It only looks at two weeks**: it doesn't say whether the indexes are expensive or cheap, or how they've done this year.

## Sources and method

- **Numbers:** [FRED](https://fred.stlouisfed.org/) (Federal Reserve Bank of St. Louis), series {{sp500.source.series_id|id}}, {{nasdaq.source.series_id|id}}, {{dow.source.series_id|id}}, {{vix.source.series_id|id}} and {{us10y.source.series_id|id}}. Calculated with `scripts/compute.ts`; no market figure in this text was written by hand.
- **Control:** closes were compared with Yahoo Finance, for validation only (`data/processed/cross-check.json`). S&P 500, Nasdaq, Dow and VIX match within the margin; the 10-year rate differs slightly, within the control's tolerance, because Yahoo uses another source (the index published by Cboe, the Chicago options exchange), not the series FRED uses. Yahoo has a rate value on the bond-market holiday (Veterans Day), which is not used.
- **Facts:** `research/events.md`, each with a date and a link, audited by a verifier agent that rejected those with a single source, doubtful dates or causes without evidence (facts: `evidence/audit-eventos.md`; draft: `research/audit.md`).
- **Period:** it ends on {{meta.period_end|dow}}. At the time of delivery, FRED had not yet published the next day's close for the S&P 500, the VIX or the 10-year rate (it had for the Nasdaq and the Dow). So that every figure covers the same days, the period stops at the last day with data for all five series.
- **Full process:** `research/PROCESS.md`.
