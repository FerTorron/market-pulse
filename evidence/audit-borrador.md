# Auditoría — 2026-11-26 (datos de las 16:45 UTC, sin cambios desde la pasada 2) — pasada 3: borrador corregido

Pasada 1 (eventos) archivada en `evidence/audit-eventos.md`. La pasada 2 está en este mismo archivo, reemplazada por esta: sus veredictos se conservan en la tabla, con la columna nueva "Estado en pasada 3". Es la última pasada que permite `/market-report`: lo que quede RECHAZADO se saca. Lo que quede en REFORMULAR se aplica con el texto exacto de la columna "Qué cambiar", sin que lo vuelva a revisar nadie.

**Estado de los datos:** FAIL (de `validation-report.json`: 4 errores, 3 avisos). Sin cambios desde la pasada 2: FRED todavía no publicó el 2026-11-25 para `SP500`, `VIXCLS` y `DGS10`, y `market-data.json` sigue con `complete: false`. `scripts/render-story.ts` se niega a generar `STORY.md` mientras la validación no dé PASS, salvo con `--allow-incomplete`, que agrega el aviso de borrador.

**Regla de render (`findHandwrittenNumbers`):** pasa. El bloque `<!-- assert … -->` está dentro de un comentario HTML: sus dígitos no cuentan y no se publica. En el texto nuevo no hay dígitos fuera de marcadores, destinos de links o frases permitidas. Los textos de los links (USTR, BEA, Reuters vía Investing.com, etc.) no tienen dígitos. "Dos puntos básicos" ya no está (C40). Queda un número en palabras, "Dos días antes": sale de dos fechas de hechos (17/11 y 19/11), no de los datos de mercado, y es correcto.

**Aserciones (`checkAssertions`):** las 19 aserciones se cumplen con los datos de hoy. Las 19 corresponden a algo que el texto afirma. **No cubren toda la lista** de la pasada 2 (puntos 1, 2, 9, 10 y 11, y en parte el 8). Detalle en "Revisión del bloque assert".

## Veredictos

Valores resueltos a mano con los datos de hoy (iguales a los de la pasada 2).

| # | Afirmación (textual, pasada 2) | Origen | Veredicto pasada 2 | Código | Motivo | Qué cambiar | Estado en pasada 3 |
|---|---|---|---|---|---|---|---|
| C1 | "Dos semanas en rojo: la bolsa de EE.UU. bajó, las tecnológicas fueron las que más cayeron y un día de fuerte rebote no alcanzó para compensar" | Título | APROBADA | — | `comparisons.worst_index` = nasdaq (−5,90 %). Los tres acumulados son negativos. Mejor día: 23/11. | Volver a comprobar `worst_index` con el 25/11 del S&P. | APLICADA: sin cambios. Lo cubren las aserciones `comparisons.worst_index.key == 'nasdaq'` y los tres `cum_pct < 0`. |
| C2 | "Del {{meta.period_start\|date}} al {{meta.period_end\|date}}, comparado con el cierre del {{meta.base_date\|dow}}" | l. 32 | APROBADA | — | Resuelve a "Del 11 de noviembre al 25 de noviembre, comparado con el cierre del martes 10 de noviembre". | Bloqueada: hoy S&P, VIX y tasa terminan el 24/11. | APLICADA: sin cambios. No la cubre ninguna aserción. La cubre la validación de `render-story.ts` (sin PASS no hay `STORY.md`). Ver punto 1. |
| C3 | "Los tres grandes índices terminaron abajo. S&P 500 {{sp500.cum_pct\|pct}}, Nasdaq…, Dow Jones…" | l. 36 | APROBADA | — | −4,25 % (al 24/11), −5,90 %, −3,92 %. | Bloqueada. Volver a comprobar que `sp500.cum_pct` < 0. | APLICADA: aserciones `sp500/nasdaq/dow.cum_pct < 0`. |
| C4 | "**El golpe vino de las empresas ligadas a la inteligencia artificial**, según la prensa financiera" | l. 37 | REFORMULAR | CAUSA | "El golpe vino de" afirma una causa. | "**Según la prensa financiera, las caídas más fuertes fueron las de empresas ligadas a la inteligencia artificial**, en dos semanas marcadas por la salida y la vuelta del CEO de Nvidia." | APLICADA: texto idéntico al pedido. |
| C5 | "La volatilidad esperada se disparó y después se calmó a medias: el VIX pasó de {{vix.base.value\|num}} a un máximo de {{vix.high.value\|num}}" | l. 38 | APROBADA | — | 19,46 → 35,89. `vix.end` (26,36) entre base y máximo. | Volver a comprobar: base < end < high. | APLICADA: aserciones `vix.end.value > vix.base.value` y `vix.end.value < vix.high.value`. |
| C6 | "Más días malos que buenos, y el Nasdaq fue el que más perdió" | l. 42 | APROBADA | — | S&P 8/2 (al 24/11); Nasdaq 8/3; Dow 6/5. | Volver a comprobar `down_days` > `up_days` y `worst_index`. | APLICADA: aserciones `sp500.down_days > sp500.up_days` y `worst_index`. |
| C7 | "De {{sp500.trading_days\|int}} ruedas, el S&P 500 cerró en baja {{sp500.down_days\|int}} y en alta {{sp500.up_days\|int}}." | l. 44 | APROBADA | — | Hoy resuelve a 10 ruedas, frente a las 11 del período. | Bloqueada: 11 ruedas y up + down = 11. | APLICADA en parte. Las 11 ruedas las garantiza solo la validación, no una aserción. "up + down = trading_days" no se puede escribir en el lenguaje de aserciones (no suma). Un día con variación exacta de 0,00 % quedaría sin contar. Es poco probable, pero hay que mirarlo al renderizar. |
| C8 | "El Nasdaq… perdió {{nasdaq.cum_pct\|abspct}}; el Dow… {{dow.cum_pct\|abspct}}" | l. 44 | APROBADA | — | 5,90 % y 3,92 %, ambos negativos. | — | APLICADA: aserciones `nasdaq/dow.cum_pct < 0`. |
| C9 | "…en dos semanas su inversión valía {{sp500.cum_pct\|abspct}} menos" | l. 46 | REFORMULAR | EXCESO (menor) | La serie es de precio, sin dividendos ni comisiones. | "…su inversión valía alrededor de {{sp500.cum_pct\|abspct}} menos." Comprobar `sp500.cum_pct` < 0. | APLICADA: "alrededor de" y aserción `sp500.cum_pct < 0`. |
| C10 | "…la caída desde el punto más alto llegó a {{sp500.max_drawdown_pct\|abspct}}" | l. 46 | REFORMULAR | EXCESO (ambigüedad) | 9,31 %, del 11/11 al 20/11. "El punto más alto" se lee como máximo histórico. | "…la caída desde el cierre más alto del período llegó a…" | APLICADA en el texto. **No la cubre ninguna aserción** (punto 9). `metrics.ts` arranca el pico en la base (10/11). Si el máximo fuera la base, "del período" sería falso sin que el render falle. Ver aserciones propuestas. |
| C11 | "El peor día fue el {{sp500.worst_day.date\|dow}}, sin un anuncio puntual que lo explique" | l. 48 | REFORMULAR | EXCESO | Afirma que el anuncio no existió. | "…y no encontramos un anuncio puntual que lo explique" | APLICADA: texto idéntico. |
| C12 | "Ese día el S&P 500 cayó {{sp500.worst_day.pct\|abspct}} y el Nasdaq {{nasdaq.worst_day.pct\|abspct}}." | l. 50 | APROBADA | — | Ambos el 20/11. | Comprobar `nasdaq.worst_day.date` == `sp500.worst_day.date`. | APLICADA: aserción `nasdaq.worst_day.date == sp500.worst_day.date`. |
| C13 | "Para el Dow, el peor día fue otro: el {{dow.worst_day.date\|dow}} ({{dow.worst_day.pct\|pct}})." | l. 50 | APROBADA | — | Jueves 19/11, −2,19 %. | Comprobar que sea distinto de `sp500.worst_day.date`. | APLICADA: aserción `dow.worst_day.date != sp500.worst_day.date`. |
| C14 | "no encontramos un dato económico ni un anuncio oficial ese día" | l. 52 | APROBADA | — | A16. | — | APLICADA: sin cambios. La aserción `sp500.worst_day.date == '2026-11-20'` la ata al día que se investigó. |
| C15 | "La prensa describió una venta fuerte… y la atribuyó al temor a una burbuja ([UPI]; [Yahoo Finance])" | l. 52 | REFORMULAR | LINK | UPI no habla de burbuja. | UPI: costo y retorno de las inversiones en IA; Yahoo: burbuja. | APLICADA: cada atribución lleva su link. |
| C16 | "Ese "gran evento" fueron los resultados de Nvidia… y la salida a bolsa de Anthropic" | l. 52 | RECHAZADA | LINK, EXCESO | Yahoo no liga el "big event" a Nvidia. | Texto de reemplazo propuesto en la pasada 2. | **NUEVO PROBLEMA.** Lo rechazado se sacó: Nvidia ya no aparece ligada al "gran evento". Pero el reemplazo, que en parte sale de la propia sugerencia de la pasada 2, exagera la fuente. Ver C43. |
| C17 | Resultados de Nvidia "después del cierre del {{d:2026-11-17}} y por encima de lo esperado" | l. 52 | APROBADA | — | A9. | Mantener en la versión de C16. | APLICADA: "Dos días antes, después del cierre del {{d:2026-11-17}}…" ([TheStreet]). "Dos días antes" del 19/11 es el 17/11: correcto. |
| C18 | "Es la explicación de la prensa, no una causa demostrada." | l. 52 | APROBADA | — | — | — | APLICADA: sin cambios. |
| C19 | "El mejor día coincidió con la vuelta del CEO de Nvidia" | l. 54 | APROBADA | — | B9 y A17. | — | APLICADA: la aserción `sp500.best_day.date == '2026-11-23'` la ata al día del anuncio. |
| C20 | "…la mayor suba del período para los tres índices." | l. 56 | APROBADA | — | Los tres `best_day.date` = 23/11. | Comprobar que los tres sean iguales. Sugerencia: agregar el marcador del Dow. | APLICADA: aserciones de las tres fechas = 23/11. La sugerencia opcional del marcador del Dow no se aplicó; no hace falta, porque la aserción lo controla. |
| C21 | "esa mañana, antes de la apertura, Nvidia anunció que Jensen Huang volvía como CEO" | l. 58 | APROBADA | — | A17. | — | APLICADA: sin cambios. |
| C22 | "Había renunciado de forma sorpresiva el {{d:2026-11-12}}" | l. 58 | REFORMULAR | EXCESO | "Sorpresiva" no sale de ninguna fuente. | "Había renunciado "con efecto inmediato" el {{d:2026-11-12}}" | APLICADA: texto idéntico, y ahora con el link al 8-K. |
| C23 | "Reuters informó que la vuelta se dio tras una intervención del presidente Trump…" | l. 58 | APROBADA | — | A18. | — | APLICADA: sin cambios. |
| C24 | "al cierre del {{sp500.end.date\|dow}} el S&P 500 seguía {{sp500.cum_pct\|abspct}} abajo" | l. 60 | APROBADA | — | Hoy martes 24/11, 4,25 %. | Bloqueada: `end.date` = 25/11 y `cum_pct` < 0. | APLICADA: aserción `sp500.cum_pct < 0`. La fecha del 25/11 la garantiza la validación, no una aserción. |
| C25 | Definición del VIX | l. 64 | APROBADA | — | Simplificación correcta. | Opcional. | APLICADA: sin cambios; la mejora era opcional. |
| C26 | "tocó su máximo… el {{vix.high.date\|dow}} (el mismo día de la peor caída)" | l. 66 | APROBADA | — | 20/11 = peor día del S&P y del Nasdaq; para el Dow fue otro día. | Comprobar `vix.high.date` == `sp500.worst_day.date`. Sugerencia: "(…del S&P 500 y del Nasdaq)". | APLICADA: aserción `vix.high.date == sp500.worst_day.date`. La sugerencia opcional no se aplicó. Sigue la ambigüedad menor con el Dow; no se rechaza. |
| C27 | "y al {{vix.end.date\|dow}} estaba en {{vix.end.value\|num}}" | l. 66 | APROBADA | — | Hoy 24/11, 26,36. | Bloqueada: 25/11. | APLICADA. La fecha la garantiza la validación, no una aserción. |
| C28 | "La mayor baja en un día fue el {{vix.biggest_daily_drop.date\|dow}}, el día del rebote." | l. 66 | APROBADA | — | 23/11 = `sp500.best_day.date`. | Comprobar la igualdad. | APLICADA: aserción `vix.biggest_daily_drop.date == sp500.best_day.date`. |
| C29 | "el mercado pasó de esperar calma a esperar sacudones…" | l. 66 | REFORMULAR | EXCESO | "Calma" no tiene respaldo. | "el mercado pasó a esperar muchos más sacudones que al principio, y al final del período seguía esperando más movimiento que al inicio". Comprobar `vix.end.value` > `vix.base.value`. | APLICADA: texto idéntico y aserción `vix.end.value > vix.base.value`. |
| C30 | "La tasa a 10 años casi no se movió" | l. 68 | REFORMULAR | EXCESO | Escondía la subida y la bajada. | "La tasa a 10 años subió, bajó y terminó cerca de donde empezó" | APLICADA en el texto. Las aserciones `high > base`, `low < base` y `−10 < change_bp < 10` cubren "subió", "bajó" y "cerca". **No controlan el orden** (que haya subido antes de bajar). El comentario del umbral no coincide con el umbral. Ver "Revisión del bloque assert". |
| C31 | "Pasó de {{us10y.base.value\|rate}} a {{us10y.end.value\|rate}}… Su máximo fue…, el {{us10y.high.date\|dow}}." | l. 70 | APROBADA | — | 4,98 % → 4,91 %; máximo 5,15 % el 13/11. | Bloqueada: `us10y.end` del 25/11. | APLICADA ("En el camino llegó a…" en lugar de "Su máximo fue…"; mismo marcador). El 25/11 lo garantiza la validación. |
| C32 | "referencia del costo del dinero a largo plazo: influye en hipotecas y en préstamos a empresas" | l. 70 | APROBADA | — | — | — | APLICADA: sin cambios. |
| C33 | "…casi todos sus miembros veían apropiado seguir subiendo la tasa de interés" | l. 72 | REFORMULAR | LINK (precisión) | Las minutas dicen "almost all participants". | "…donde casi todos los participantes veían apropiado volver a subir la tasa de interés" | APLICADA: texto idéntico. |
| C34 | "El dinero sigue caro, aunque en estas dos semanas la tasa larga no reflejó un cambio grande." | l. 72 | REFORMULAR | EXCESO | Valoración propia. | Quitar "El dinero sigue caro". Dejar: "En estas dos semanas, la tasa larga terminó cerca de donde empezó." | APLICADA: texto idéntico. Lo cubre la aserción de `change_bp`. |
| C35 | "Variación de cada índice contra el cierre anterior." + `{{table:daily}}` | l. 76–78 | APROBADA | — | `dailyTable` perdía la fila del 25/11. | Bloqueada: 11 filas sin "s/d". Avisar del comportamiento de `dailyTable`. | APLICADA: `dailyTable` ahora une las fechas y marca "s/d" (DECISIONS E9). Que no quede ningún "s/d" lo garantiza solo la validación, no una aserción. |
| C36 | "El último día, {{d:2026-11-25}}, se publicaron antes de la apertura el PIB… y la inflación de octubre… (PCE)" | l. 80 | APROBADA | — | A22. | — | APLICADA: sin cambios. |
| C37 | "y el gobierno propuso nuevos aranceles a varios socios comerciales ([USTR]; [Reuters vía Investing.com])" | l. 80 | APROBADA | — | Comunicado del USTR del 25/11. | Recomendado: link directo al comunicado. Opcional: "y ese mismo día". | APLICADA: link directo al comunicado del USTR, reabierto en esta pasada (ver Links). La opción "ese mismo día" no se aplicó; era opcional. |
| C38 | "No predice nada… No recomienda… "Coincidió con" no es "fue por"… Mira solo dos semanas" | l. 84–87 | APROBADA | — | — | — | APLICADA: sin cambios. |
| C39 | "…ningún número de este texto fue escrito a mano." | l. 91 | REFORMULAR | EXCESO | Falso al pie de la letra. | "…ninguna cifra de mercado de este texto fue escrita a mano." | APLICADA en la plantilla. **NUEVO PROBLEMA fuera de la plantilla:** `render-story.ts` agrega al pie de `STORY.md` la misma frase falsa. Ver C44. |
| C40 | "Nasdaq, Dow y VIX coinciden dentro del margen; la tasa… difiere en menos de dos puntos básicos porque Yahoo usa un índice del mercado de opciones…" | l. 92 | REFORMULAR | NUMERO, CAUSA | Faltaba el S&P; "dos" en palabras; descripción de ^TNX. | Texto propuesto en la pasada 2. | APLICADA: S&P incluido, sin número en palabras, "dentro de la tolerancia del control", Cboe bien descripto (se quitó "^TNX"; no cambia el sentido). Hoy es correcto: `cross-check.json` tiene 0 filas marcadas en las cinco series. **Queda un hueco:** que siga siendo cierto el 25/11 no lo controla nada que haga fallar el render (ver "Revisión del bloque assert", punto 10). |
| C41 | "auditado por un agente verificador (`research/audit.md`)…" | l. 93 | REFORMULAR | LINK | La auditoría de hechos está en otro archivo. | "(hechos: `evidence/audit-eventos.md`; borrador: `research/audit.md`)" | APLICADA: los dos archivos existen. |
| C42 | "Proceso completo: `research/PROCESS.md`." | l. 94 | APROBADA | — | El archivo existe. | — | APLICADA: sin cambios. |

### Afirmaciones nuevas

| # | Afirmación (textual) | Origen | Veredicto | Código | Motivo | Qué cambiar |
|---|---|---|---|---|---|---|
| C43 | "Un analista de Interactive Brokers citado por Yahoo dijo que la caída llegó "una vez pasado el gran evento", en referencia a la salida a bolsa de Anthropic del {{d:2026-11-19}} ([AP](…ajc…))" | Plantilla, l. 52 (reemplazo de C16) | REFORMULAR | LINK, EXCESO | Yahoo se reabrió en esta pasada. Es una reproducción de una nota de Investopedia. La cita textual es "The dam seemed to break once the big event was behind us" (Steve Sosnick, a **CNBC**). (1) "La caída llegó" quita el "pareció" de la fuente. (2) **La cita no nombra a Anthropic**: la nota la pone justo después de "Thursday's record debut for Anthropic". "En referencia a" convierte en hecho lo que es una lectura por proximidad. La pasada 2 cometió el mismo error en su propia sugerencia: se corrige acá. (3) El único link de la oración es el de AP, así que el lector puede entender que la cita sale de AP. El debut del 19/11 sí está en AP. | "Un analista de Interactive Brokers, citado por CNBC, dijo que la caída "pareció desatarse una vez pasado el gran evento"; [Yahoo Finance](https://finance.yahoo.com/markets/stocks/articles/stock-market-today-futures-plunge-131303598.html) pone esa frase justo después de mencionar la salida a bolsa de Anthropic del {{d:2026-11-19}} ([AP](https://www.ajc.com/news/2026/11/wall-street-tumbles-to-its-longest-losing-streak-since-2024-as-the-dow-drops-1100-points/))." Si se prefiere acortar, se puede sacar toda la oración: no sostiene ningún dato. |
| C44 | "Ningún número de este documento fue escrito a mano." | `scripts/render-story.ts` l. 30 (pie que se agrega a `STORY.md`) | REFORMULAR | EXCESO | Es el mismo error de C39 (DECISIONS E8), pero en el código del render en vez de la plantilla, así que la corrección de la plantilla no lo alcanzó. `STORY.md` contiene "3 minutos", "30 días", "10 años", "dos semanas" y "Dos días antes", escritos a mano. Además, el pie quedaría justo debajo de la frase corregida, contradiciéndola. | "Ninguna cifra de mercado de este documento fue escrita a mano." |
| C45 | "Dos días antes, después del cierre del {{d:2026-11-17}}, Nvidia había publicado resultados por encima de lo esperado" | Plantilla, l. 52 | APROBADA | — | Es la versión de C16/C17. Del 17/11 al 19/11 hay dos días. Respeta A9 (después del cierre, sin consenso). | — |
| C46 | "…y el gobierno propuso nuevos aranceles a varios socios comerciales ([USTR](…/ustr-makes-determinations-and-proposes-actions-14-section-301-investigations-relating-structural); …)" | Plantilla, l. 80 (link nuevo) | APROBADA | — | Abierto en esta pasada: comunicado del 25/11/2026: "the U.S. Trade Representative has proposed additional tariffs on the following investigated economies" (14 economías, entre ellas China, la Unión Europea, Japón e India). "Varios socios comerciales" es fiel y no da cifra (D7). | — |

## Revisión del bloque `<!-- assert -->`

**Mecánica (`checkAssertions`):** correcta para lo que se usa. El regex del bloque no toma el primer comentario de la plantilla. Las líneas con `#` se ignoran. El lado derecho se resuelve como texto entre comillas, número o ruta. Las 19 rutas existen en `market-data.json`. Si una ruta falta, la aserción falla, y una comparación `<`/`>` entre textos también falla (falla cerrada). El render evalúa las aserciones antes de resolver marcadores, y también con `--check`. **Con los datos de hoy se cumplen las 19.**

**Cada aserción corresponde a algo que el texto afirma:** sí, las 19.

- `*.cum_pct < 0` → "terminaron abajo", "perdió", "seguía… abajo", "valía… menos".
- `worst_index.key == 'nasdaq'` → "el Nasdaq fue el que más perdió", "las tecnológicas fueron las que más cayeron".
- `sp500.down_days > sp500.up_days` → "Más días malos que buenos".
- Fechas fijas 20/11 y 23/11 → los párrafos "Qué coincidió" hablan de hechos de esos días. Fijarlas está justificado.
- Igualdades de fechas → "Ese día", "fue otro", "para los tres índices", "el mismo día de la peor caída", "el día del rebote".
- VIX → "se calmó a medias", "seguía esperando más movimiento".
- Tasa → "subió, bajó y terminó cerca".

**Problemas:**

1. **El comentario del umbral de la tasa no coincide con el umbral.** Dice "menos de la mitad del recorrido hasta el máximo del período". El recorrido hasta el máximo es 5,15 − 4,98 = 17 pb, así que la mitad es 8,5 pb. Pero la aserción deja pasar hasta ±9 pb. D8 fija ±10 pb sin esa justificación. Hay que hacer una de dos: corregir el comentario ("umbral fijo de ±10 pb, DECISIONS D8") o bajar el umbral a `> -9` / `< 9`. Las dos se cumplen hoy (−7 pb). No cambia el texto publicado.
2. **"Subió, bajó" afirma un orden que ninguna aserción controla.** `high > base` y `low < base` se cumplen también si primero bajó y después subió. El lenguaje no compara fechas con `<`. Hay que agregar `us10y.high.date == '2026-11-13'`. Antes del 13/11 el único dato es el 12/11 (5,10 %, arriba de la base), así que el mínimo queda necesariamente después del máximo.
3. **Falta el punto 9 (C10).** Hay que agregar:
   - `sp500.high.date == '2026-11-11'`
   - `sp500.low.date == '2026-11-20'`
   - `sp500.high.value > sp500.base.value`

   Con el máximo del período antes del mínimo y por encima de la base, `max_drawdown_pct` es exactamente la caída del 11/11 al 20/11 y "desde el cierre más alto del período" es cierto.
4. **Puntos 1, 2 y 11 (25/11, 11 ruedas, tabla sin "s/d") no están como aserciones.** Los cubre la validación de `render-story.ts`: sin PASS no se genera `STORY.md`, y la validación exige `complete: true` y todas las ruedas. Es una cobertura aceptable, pero el comentario del bloque dice que las aserciones "salen de la lista": hay que aclarar que esos puntos los controla la validación. Si se los quiere como aserción: `sp500.end.date == meta.period_end`, `vix.end.date == meta.period_end`, `us10y.end.date == meta.period_end`, `sp500.trading_days == nasdaq.trading_days`. Ojo: esas cuatro fallan hoy, así que también bloquearían el borrador con `--allow-incomplete`. Es una decisión del orquestador, no un error.
5. **El punto 10 (C40, "coinciden dentro del margen") no lo controla nada que haga fallar el render.** `checkAssertions` solo lee `market-data.json`, no `cross-check.json`. Además, en `validate.ts` una fila fuera de tolerancia es un **aviso**, no un error, así que la validación puede dar PASS con una diferencia el 25/11 y el texto quedaría falso. Hay dos opciones: que `render-story.ts` (o `validate.ts`) falle si algún `flagged` > 0, o comprobar a mano `cross-check.json` antes del render final.
6. **"Up + down = ruedas" (C7)** no se puede expresar porque el lenguaje no suma. Queda como comprobación manual. El riesgo es bajo.
7. **Opcional:** el título "Más días malos que buenos" no dice de qué índice. Hoy se cumple para los tres (Dow 6/5). `nasdaq.down_days > nasdaq.up_days` y `dow.down_days > dow.up_days` lo protegerían ante una revisión de datos.

## Links verificados

| Link | Abierto | Coincide fecha | Coincide contenido |
|---|---|---|---|
| https://ustr.gov/about/policy-offices/press-office/press-releases/2026/november/ustr-makes-determinations-and-proposes-actions-14-section-301-investigations-relating-structural (nuevo en la plantilla) | sí, pasada 3 | sí (25/11/2026) | sí: "has proposed additional tariffs" a 14 economías (C46) |
| https://finance.yahoo.com/markets/stocks/articles/stock-market-today-futures-plunge-131303598.html (reabierto) | sí, pasada 3 | sí (20/11) | burbuja sí. Cita: "The dam **seemed** to break once the big event was behind us" (Sosnick a CNBC). **No nombra a Anthropic**: la nota la pone después del "record debut" (C43) |
| https://www.upi.com/Top_News/US/2026/11/20/Dow-SP-500-enter-correction-as-Nasdaq-plunges-in-AI-stock-sell-off/1061795214998/ | pasada 2 | sí | costo y retorno de la IA, sin "burbuja" (C15 aplicada) |
| https://www.ajc.com/news/2026/11/wall-street-tumbles-to-its-longest-losing-streak-since-2024-as-the-dow-drops-1100-points/ | pasada 1 | sí (19/11) | sí (debut de Anthropic) |
| https://pro.thestreet.com/stock-market-today/nvidia-clears-the-bar-in-its-first-report-without-huang | pasada 1 | sí | sí |
| https://www.sec.gov/Archives/edgar/data/0001045810/000104581026000090/nov23pressrelease.htm | pasada 1 | sí | sí |
| https://techcrunch.com/2026/11/23/nvidia-reverses-course-and-brings-jensen-huang-back-as-ceo/ | pasada 1 | sí | sí |
| https://www.sec.gov/Archives/edgar/data/0001045810/000104581026000082/nvidiaannouncesceotransiti.htm | pasada 1 y 2 | sí | sí ("con efecto inmediato", C22) |
| https://www.investing.com/news/stock-market-news/huang-returns-as-nvidia-ceo-after-trump-intervention-in-abrupt-board-reversal-5049490 | pasada 1 | sí | sí |
| https://federalreserve.gov/monetarypolicy/fomcminutes20261028.htm | pasada 2 | 18/11 | sí ("almost all participants", C33) |
| https://www.bea.gov/news/2026/gdp-second-estimate-and-corporate-profits-3rd-quarter-2026 | pasada 1 | sí | sí |
| https://www.bea.gov/news/2026/personal-income-and-outlays-october-2026 | pasada 1 | sí | sí |
| https://www.investing.com/news/world-news/us-proposes-new-tariffs-on-14-trading-partners-to-fight-excess-factory-capacity-5050714 | pasada 2 | 25/11 | sí |
| https://fred.stlouisfed.org/ | pasada 2 | n/a | sí |

## Diferencias entre fuentes que hay que contar

- **"Gran evento" (20/11):** la cita es de Sosnick a CNBC, reproducida por Investopedia/Yahoo. La nota la pone junto al debut de Anthropic, pero la cita no lo nombra. El texto tiene que decir eso y no "en referencia a" (C43).
- **Atribución de la caída del 20/11:** UPI habla de costo y retorno; Yahoo habla de burbuja. Ya está contado en el texto (C15).
- **USTR:** el comunicado directo confirma los aranceles con fuente primaria. A21 ya no depende solo de Reuters.
- **FRED vs Yahoo:** 0 filas marcadas en las cinco series con los datos de hoy. La tasa difiere ≤ 1,2 pb (tolerancia ±2 pb). Yahoo trae el 11/11 (feriado de bonos) y el 25/11, que no se usan. El texto lo cuenta bien (C40).

## Qué volver a comprobar cuando FRED publique el 25/11

Con `pnpm render` (sin `--allow-incomplete`), la validación bloquea los puntos 1, 2 y 11, y las aserciones bloquean los puntos 3 a 8. Lo que **no** hace fallar nada y hay que mirar a mano, salvo que se agreguen las aserciones o el control propuestos:

- C10: máximo del S&P el 11/11, mínimo el 20/11 y máximo por encima de la base (o agregar las tres aserciones).
- C30: máximo de la tasa el 13/11 (o agregar la aserción).
- C40: `cross-check.json` con `flagged: 0` en las cinco series, también el 25/11.
- C7: `sp500.up_days + sp500.down_days` = `sp500.trading_days`.

## Resumen

Pasada 2: 41 de 42 veredictos aplicados correctamente: las 13 REFORMULAR, todas las APROBADAS con sus condiciones y la RECHAZADA (C16) sacada. C16 queda como NUEVO PROBLEMA porque su reemplazo (C43) exagera la fuente. C39 está aplicada en la plantilla, pero el mismo error reaparece en el pie que agrega `render-story.ts` (C44).

Afirmaciones nuevas: APROBADAS: 2 (C45, C46) · REFORMULAR: 2 (C43, C44) · RECHAZADAS: 0.

Total pasada 3 (C1–C46): APROBADAS / APLICADAS sin observaciones: 42 · REFORMULAR pendientes: 2 (C43, C44) · RECHAZADAS: 0.

- REFORMULAR: C43 (cita del "gran evento": "pareció", sin "en referencia a", link a Yahoo junto a la cita), C44 (pie de `render-story.ts`).
- Bloque assert: hay que corregir el comentario del umbral de la tasa. Faltan aserciones para C10 y para el orden en C30. C40 (cross-check del 25/11) no lo controla nada.
- Sigue bloqueado por datos: no se genera `STORY.md` final hasta que `validation-report.json` dé PASS.
