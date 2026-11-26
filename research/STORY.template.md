<!--
Plantilla de STORY.md. Ningún dígito fuera de marcadores: lo controla scripts/lib/render.ts.
Solo se usan hechos APROBADOS o REFORMULADOS por el verifier (evidence/audit-eventos.md) y redacción auditada en la pasada 2 (research/audit.md).
Las cifras propias de los hechos (ingresos de Nvidia, PCE, etc.) no se escriben: están en events.md con su fuente.
-->
<!-- assert
# Condiciones de los datos que el texto da por ciertas. Si los datos cambian (por ejemplo, al llegar el 25/11) y alguna deja de cumplirse, el render falla.
# Salen de la lista "qué volver a comprobar" del verifier (pasadas 2 y 3).
# Lo que no está acá lo controla otra pieza: datos completos al 25/11, cantidad de ruedas y tabla sin "s/d" → validate.ts (render no corre si no pasa);
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
# Dos semanas en rojo: la bolsa de EE.UU. bajó, las tecnológicas fueron las que más cayeron y un día de fuerte rebote no alcanzó para compensar

_Del {{meta.period_start|date}} al {{meta.period_end|date}}, comparado con el cierre del {{meta.base_date|dow}}. Lectura: 3 minutos._

## En medio minuto

- **Los tres grandes índices terminaron abajo.** S&P 500 {{sp500.cum_pct|pct}}, Nasdaq {{nasdaq.cum_pct|pct}}, Dow Jones {{dow.cum_pct|pct}}.
- **Según la prensa financiera, las caídas más fuertes fueron las de empresas ligadas a la inteligencia artificial**, en dos semanas marcadas por la salida y la vuelta del CEO de Nvidia.
- **La volatilidad esperada se disparó y después se calmó a medias**: el VIX pasó de {{vix.base.value|num}} a un máximo de {{vix.high.value|num}}.

## Hallazgos

### Más días malos que buenos, y el Nasdaq fue el que más perdió

De {{sp500.trading_days|int}} ruedas, el S&P 500 cerró en baja {{sp500.down_days|int}} y en alta {{sp500.up_days|int}}. El Nasdaq, el índice con más peso de empresas tecnológicas, perdió {{nasdaq.cum_pct|abspct}}; el Dow, más cargado de empresas tradicionales, {{dow.cum_pct|abspct}}.

**En criollo:** si alguien tenía ahorros en un fondo que copia al S&P 500, en dos semanas su inversión valía alrededor de {{sp500.cum_pct|abspct}} menos. Y en el peor momento, la caída desde el cierre más alto del período llegó a {{sp500.max_drawdown_pct|abspct}}.

### El peor día fue el {{sp500.worst_day.date|dow}}, y no encontramos un anuncio puntual que lo explique

Ese día el S&P 500 cayó {{sp500.worst_day.pct|abspct}} y el Nasdaq {{nasdaq.worst_day.pct|abspct}}. Para el Dow, el peor día fue otro: el {{dow.worst_day.date|dow}} ({{dow.worst_day.pct|pct}}).

**Qué coincidió:** no encontramos un dato económico ni un anuncio oficial ese día. La prensa describió una venta fuerte de acciones de IA y chips: [UPI](https://www.upi.com/Top_News/US/2026/11/20/Dow-SP-500-enter-correction-as-Nasdaq-plunges-in-AI-stock-sell-off/1061795214998/) la atribuyó a dudas sobre el costo y el retorno de las inversiones en IA, y [Yahoo Finance](https://finance.yahoo.com/markets/stocks/articles/stock-market-today-futures-plunge-131303598.html) al temor a que estalle una burbuja. Un analista de Interactive Brokers, citado por CNBC, dijo que la caída "pareció desatarse una vez pasado el gran evento"; [Yahoo Finance](https://finance.yahoo.com/markets/stocks/articles/stock-market-today-futures-plunge-131303598.html) pone esa frase justo después de mencionar la salida a bolsa de Anthropic del {{d:2026-11-19}} ([AP](https://www.ajc.com/news/2026/11/wall-street-tumbles-to-its-longest-losing-streak-since-2024-as-the-dow-drops-1100-points/)). Dos días antes, después del cierre del {{d:2026-11-17}}, Nvidia había publicado resultados por encima de lo esperado ([TheStreet](https://pro.thestreet.com/stock-market-today/nvidia-clears-the-bar-in-its-first-report-without-huang)). Es la explicación de la prensa, no una causa demostrada.

### El mejor día coincidió con la vuelta del CEO de Nvidia

El {{sp500.best_day.date|dow}} el S&P 500 subió {{sp500.best_day.pct|abspct}} y el Nasdaq {{nasdaq.best_day.pct|abspct}}, la mayor suba del período para los tres índices.

**Qué coincidió:** esa mañana, antes de la apertura, Nvidia anunció que Jensen Huang volvía como CEO ([comunicado de Nvidia a la SEC](https://www.sec.gov/Archives/edgar/data/0001045810/000104581026000090/nov23pressrelease.htm); [TechCrunch](https://techcrunch.com/2026/11/23/nvidia-reverses-course-and-brings-jensen-huang-back-as-ceo/)). Había renunciado "con efecto inmediato" el {{d:2026-11-12}} ([comunicado de Nvidia a la SEC](https://www.sec.gov/Archives/edgar/data/0001045810/000104581026000082/nvidiaannouncesceotransiti.htm)). Reuters informó que la vuelta se dio tras una intervención del presidente Trump ([Reuters vía Investing.com](https://www.investing.com/news/stock-market-news/huang-returns-as-nvidia-ceo-after-trump-intervention-in-abrupt-board-reversal-5049490)); Nvidia solo habló de información recibida de "altos niveles del gobierno de EE.UU.".

Aun con ese salto, el rebote no alcanzó: al cierre del {{sp500.end.date|dow}} el S&P 500 seguía {{sp500.cum_pct|abspct}} abajo del punto de partida.

### El VIX: cuánto movimiento espera el mercado

El VIX suele llamarse "índice del miedo", pero mide algo más concreto: **cuánto espera el mercado que se muevan las acciones del S&P 500 en los próximos 30 días**, calculado a partir de lo que se paga por protegerse de esos movimientos. No dice si van a subir o bajar; dice cuánto se espera que se sacudan.

Empezó en {{vix.base.value|num}}, tocó su máximo de {{vix.high.value|num}} el {{vix.high.date|dow}} (el mismo día de la peor caída) y al {{vix.end.date|dow}} estaba en {{vix.end.value|num}}. La mayor baja en un día fue el {{vix.biggest_daily_drop.date|dow}}, el día del rebote. **En criollo:** el mercado pasó a esperar muchos más sacudones que al principio, y al final del período seguía esperando más movimiento que al inicio.

### La tasa a 10 años subió, bajó y terminó cerca de donde empezó

La tasa que paga el gobierno de EE.UU. por pedir prestado a 10 años es una referencia del costo del dinero a largo plazo: influye en hipotecas y en préstamos a empresas. Pasó de {{us10y.base.value|rate}} a {{us10y.end.value|rate}} ({{us10y.change_bp|bp}}; un punto básico es la centésima parte de un punto porcentual). En el camino llegó a {{us10y.high.value|rate}}, el {{us10y.high.date|dow}}.

**Contexto:** el {{d:2026-11-18}} la Reserva Federal publicó las minutas de su última reunión, donde casi todos los participantes consideraron que probablemente sería apropiado volver a subir la tasa de interés ([Fed](https://federalreserve.gov/monetarypolicy/fomcminutes20261028.htm)). En estas dos semanas, la tasa larga terminó cerca de donde empezó.

## Día por día

Variación de cada índice contra el cierre anterior.

{{table:daily}}

El último día, {{d:2026-11-25}}, se publicaron antes de la apertura el PIB del tercer trimestre ([BEA](https://www.bea.gov/news/2026/gdp-second-estimate-and-corporate-profits-3rd-quarter-2026)) y la inflación de octubre medida por el índice PCE ([BEA](https://www.bea.gov/news/2026/personal-income-and-outlays-october-2026)), y el gobierno propuso nuevos aranceles a varios socios comerciales ([USTR](https://ustr.gov/about/policy-offices/press-office/press-releases/2026/november/ustr-makes-determinations-and-proposes-actions-14-section-301-investigations-relating-structural); [Reuters vía Investing.com](https://www.investing.com/news/world-news/us-proposes-new-tariffs-on-14-trading-partners-to-fight-excess-factory-capacity-5050714)).

## Qué no dice este análisis

- **No predice nada.** Que haya caído no dice si va a seguir cayendo.
- **No recomienda comprar ni vender.**
- **"Coincidió con" no es "fue por".** Las causas que aparecen son las que atribuyó la prensa; no las probamos.
- **Mira solo dos semanas**: no dice si los índices están caros o baratos ni cómo vienen en el año.

## Fuentes y método

- **Números:** [FRED](https://fred.stlouisfed.org/) (Reserva Federal de St. Louis), series {{sp500.source.series_id|id}}, {{nasdaq.source.series_id|id}}, {{dow.source.series_id|id}}, {{vix.source.series_id|id}} y {{us10y.source.series_id|id}}. Se calculan con `scripts/compute.ts`; ninguna cifra de mercado de este texto fue escrita a mano.
- **Control:** los cierres se compararon con Yahoo Finance, solo para validar (`data/processed/cross-check.json`). S&P 500, Nasdaq, Dow y VIX coinciden dentro del margen; la tasa a 10 años difiere apenas, dentro de la tolerancia del control, porque Yahoo toma otra fuente (el índice que publica Cboe, la bolsa de opciones de Chicago), no la serie que usa FRED. Yahoo trae un valor de tasa el día del feriado de bonos (Veterans Day), que no se usa.
- **Hechos:** `research/events.md`, cada uno con fecha y link, auditado por un agente verificador que rechazó los que tenían una sola fuente, fechas dudosas o causas sin evidencia (hechos: `evidence/audit-eventos.md`; borrador: `research/audit.md`).
- **Proceso completo:** `research/PROCESS.md`.
