# Proceso

Bitácora desde el principio. Cada fase: qué se hizo, qué se decidió, por qué, y la evidencia en `evidence/`.

---

## Fase 0 — Análisis de la consigna y del puesto

_A cargar por Fernando._

**Evidencia sugerida:** captura de la conversación con Claude donde se analizó la consigna y se tomaron las decisiones de período, audiencia y métricas.

---

## Fase 1 — Plan y estructura

**Qué se hizo.** Se le pasó a Claude Code la consigna con las decisiones ya tomadas y se le pidió planificar antes de construir. Claude propuso un plan en 5 fases y esperó aprobación. Después creó la estructura del repo (`CLAUDE.md`, `BRIEF.md`, `README.md`, `research/`), `package.json` y el repo git.

**Qué se decidió y por qué.**
- **Veterans Day (11/11).** Al planificar, Claude detectó que el 11/11 la bolsa abre pero el mercado de bonos cierra: DGS10 tiene 10 observaciones en vez de 11. Se trata como excepción esperada en `validate.ts`, no como dato faltante.
- **FRED sin clave.** Se usa el CSV público `fredgraph.csv`; no hay secretos en el repo.
- **Plantilla + render** (propuesta de Claude, aprobada): la regla "ningún número a mano" se hace cumplir por código, no por disciplina del modelo.
- **Un commit por fase**, para que el historial de git también sea evidencia.

**Evidencia sugerida:** captura del plan propuesto y del mensaje de aprobación.

---

## Fase 2 — Pipeline de datos

**Qué se hizo.** Claude escribió `scripts/fetch.ts`, `compute.ts`, `validate.ts` y una librería de funciones puras (`scripts/lib/metrics.ts`) con 8 tests (`tests/metrics.test.ts`). Se corrió el pipeline contra FRED y Yahoo.

**Qué se decidió y por qué.**
- **`fetch.ts` guarda los archivos tal cual llegan** más un `manifest.json` con URL, fecha de descarga y SHA-256. `validate.ts` verifica los hashes: si alguien edita un CSV a mano, falla.
- **`validate.ts` recalcula de forma independiente**, sin importar `metrics.ts`, para que un bug en la librería no se valide a sí mismo.
- **El calendario de ruedas está escrito en `config.ts`**, no se deduce de los datos: así se detectan tanto fechas faltantes como sobrantes.
- **Yahoo solo como control.** Sus valores van a `cross-check.json` y nunca entran en `market-data.json`.
- **Tolerancias de la validación cruzada:** ±0,05 % para índices y VIX; ±2 pb para la tasa a 10 años (ver D5 y E2 en DECISIONS).

**Resultado de la primera corrida** (`evidence/fase2-pipeline-run1.txt`): FRED todavía no había publicado el cierre del 25/11 para SP500, VIXCLS y DGS10 (sí para NASDAQCOM y DJIA). `validate` falló como estaba previsto y no se rellenó nada. Nasdaq y Dow coinciden con Yahoo dentro de ±0,05 %. Yahoo trae `^TNX` el 11/11 (el CBOE opera en Veterans Day); se registra y no se usa.

**Evidencia:** `evidence/fase2-pipeline-run1.txt`, `data/processed/validation-report.json`, `data/processed/cross-check.json`.

---

## Fase 3 — Plantilla y render: "ningún número a mano" como código

**Qué se hizo.** `scripts/lib/render.ts` y `scripts/render-story.ts`, con 8 tests (`tests/render.test.ts`).

**Cómo funciona.**
- La historia se escribe en `research/STORY.template.md` con marcadores: `{{sp500.cum_pct|pct}}` (dato), `{{d:2026-11-20}}` (fecha de un hecho, que tiene que ser una rueda del período) y `{{table:daily}}`.
- Antes de reemplazar marcadores, el render saca marcadores, links y una lista corta de frases permitidas ("S&P 500", "10 años", "30 días", "3 minutos"). Si queda **un solo dígito**, falla y muestra la línea.
- Un marcador con ruta inexistente, formato desconocido o tipo equivocado también hace fallar el render.
- Si `validate` no pasó, `render` no genera `STORY.md`. Con `--allow-incomplete` lo genera con un aviso visible arriba.
- Formato en español (es-AR): coma decimal, signo menos tipográfico, días de la semana.

**Por qué.** La regla "ningún número escrito a mano por el modelo" no puede depender de que el modelo la respete: tiene que fallar si no se cumple.

---

## Fase 4 — Agentes y comando

**Qué se hizo.** Tres subagentes en `.claude/agents/` y el comando `.claude/commands/market-report.md`.

| Agente | Rol | Herramientas | Modelo | Límite clave |
|---|---|---|---|---|
| data-agent | Corre `pnpm data` y reporta | Bash, Read | haiku | No interpreta, no edita datos ni scripts, no rellena huecos |
| events-agent | Qué pasó en cada rueda → `research/events.md` | WebSearch, WebFetch, Read, Write | sonnet | Hecho ≠ causa; abre cada link; fuentes que copian el mismo cable cuentan como una |
| verifier | Audita y puede rechazar → `research/audit.md` | Read, Grep, Glob, WebFetch, Write | opus | Códigos de rechazo: CAUSA, UNA-FUENTE, COPIA, FECHA, EXCESO, NUMERO, MARCADOR, FUERA, LINK |

**Flujo de `/market-report`:** data-agent ∥ events-agent → verifier (pasada 1: eventos) → borrador de la plantilla → `render --check` → verifier (pasada 2: borrador) → correcciones (una sola pasada extra) → `render`.

**Qué se decidió y por qué.**
- **Dos pasadas del verifier** en vez de una: la primera filtra qué hechos se pueden usar; la segunda controla lo que más falla en textos generados: conclusiones que exceden los datos y adjetivos que no coinciden con la magnitud ("se desplomó" para un −0,3 %).
- **Modelo por rol:** el más barato para correr scripts, el más fuerte para verificar, porque es donde un error cuesta más.
- **Si faltan datos, el comando no decide solo:** sigue con eventos y verificación, pero pregunta antes de generar un borrador incompleto.

---

## Fase 5 — Primera corrida de `/market-report`

**Cómo se corrió.** Los subagentes de `.claude/agents/` se crearon en la misma sesión y Claude Code todavía no los registraba como tipos propios. Por eso se lanzaron como agentes generales que leen su definición del archivo, con el modelo de cada rol (haiku, sonnet, opus). En una sesión nueva se cargan como tipos propios.

**1. data-agent ∥ events-agent (en paralelo).**
- data-agent: **FAIL** esperado. FRED todavía no publicó el 25/11 de SP500, VIXCLS y DGS10; NASDAQCOM y DJIA sí. No se rellenó nada (`evidence/data-agent-run.txt`).
- events-agent: 23 hechos (7 con confianza alta, 9 media, 7 baja) y 11 atribuciones de prensa (`research/events.md`).

**2. verifier, pasada 1: eventos** (`evidence/audit-eventos.md`). Quedaron 14 aprobadas, 12 para reformular y 8 rechazadas.
- Rechazó, entre otras: la investigación a Huang con fecha y link equivocados, los dichos de Trump sobre Irán (una sola fuente con dos versiones distintas de la frase), un resumen automático que contradice los datos de DGS10, y notas de AP contadas dos veces.
- Encontró fuentes primarias que el events-agent no tenía: census.gov, BEA (que el events-agent había dado por inaccesible) y USTR.

**3. Borrador** (`research/STORY.template.md`), escrito por Claude con solo hechos aprobados o reformulados. El primer `render --check` **lo frenó**: había dígitos escritos a mano ("30 segundos", títulos numerados, IDs de series y un nombre de archivo). Se corrigió sin agregar excepciones.

**4. verifier, pasada 2: borrador.** Quedaron 28 aprobadas, 13 para reformular y 1 rechazada.
- Rechazada: Claude había atribuido el "gran evento" de una cita a los resultados de Nvidia, cuando la fuente se refería a la salida a bolsa de Anthropic.
- Para reformular: causas implícitas ("el golpe vino de"), adjetivos sin fuente ("sorpresiva", "calma"), un título que escondía un movimiento ("la tasa casi no se movió"), una valoración propia ("el dinero sigue caro"), un número escrito en palabras que el control no detecta ("dos puntos básicos") y una afirmación falsa al pie de la letra en el pie ("ningún número fue escrito a mano").
- Detectó un **bug** en `render.ts`: la tabla diaria perdía la fila de una rueda si al S&P le faltaba ese dato.

**5. Correcciones.**
- Se aplicaron todos los cambios y se arregló el bug, con test.
- La lista "qué volver a comprobar cuando lleguen los datos del 25/11" del verifier se convirtió en **aserciones** dentro de la plantilla (`<!-- assert ... -->`). El render las evalúa y falla si los datos nuevos contradicen el texto (por ejemplo, si el peor día deja de ser el mismo para el S&P y el Nasdaq). Son 19 tests en total.

**6. verifier, pasada 3: correcciones** (la última que permite el comando). 41 de 42 correcciones bien aplicadas, 2 para reformular y 0 rechazadas.
- C43: la corrección de C16 seguía exagerando la cita; el error venía de la sugerencia del propio verifier en la pasada 2.
- C44: el pie que agrega `render-story.ts` repetía el error E8.
- Señaló huecos en las aserciones. Se agregaron dos: el orden "subió, bajó" de la tasa y que hubo un cierre por encima de la base. También se corrigió el comentario del umbral.
- `render-story.ts` ahora falla si `cross-check.json` tiene diferencias fuera de tolerancia, porque la historia dice que las series coinciden.
- Se aplicaron sin otra revisión, como define el comando.

**7. Render.** `render --check` pasa. `render` se niega a generar `STORY.md` porque la validación es FAIL. Queda pendiente de los datos del 25/11 o de la decisión de generar un borrador marcado como incompleto.

**Evidencia:** `evidence/data-agent-run.txt`, `evidence/audit-eventos.md`, `evidence/market-report-render.txt`, `research/audit.md`.

---

## Fase 6 — Sitio

**Qué se hizo.** Una página estática y bilingüe en `site/`, hecha con Astro: español por defecto y English en `/en/`. Tiene la historia, un gráfico de la variación acumulada de los tres índices, otro del VIX, las cifras del período, la línea de tiempo "Cómo lo hice" y un pie con link al portfolio.

**Qué se decidió y por qué.**
- **Astro en vez de Next.js** (D10). El sitio es contenido estático que sale del repo. Al navegador solo llega el JavaScript del tooltip.
- **El sitio no copia nada** (D11). Arma la historia en el build con el mismo `render.ts` del pipeline, así que un dígito a mano, una aserción que falla o datos sin validar frenan el build. Con `ALLOW_INCOMPLETE=1` sale un borrador con un aviso visible.
- **Inglés con los mismos controles** (D12). Hay una plantilla en inglés con el bloque de aserciones idéntico, controlado por un test. El render pasó a soportar los dos idiomas (formatos `es-AR` y `en-US`).
- **Estructura pedida por Fernando** (D13): `pages`, `views`, `containers`, `components/{ui,charts,layout}`, `lib`, `scripts`, `config`, `styles`, `types`. Los textos van en un archivo por idioma (`i18n/locales`), también controlados contra dígitos a mano.
- **Gráficos:** la paleta se validó con un script, no a ojo. El SVG solo dibuja las líneas; los textos son HTML, así se leen bien en el celular. Hay tooltip con mouse, toque y teclado, y una tabla con los mismos datos.
- **`compute.ts` ahora también calcula la serie acumulada por día** (`path`), que es lo que dibuja el gráfico. `validate.ts` la recalcula. El navegador no hace cuentas.

**Errores encontrados en la revisión visual y el build:** E12 a E14 en DECISIONS.

**verifier, pasada 4: inglés y textos del sitio** (`research/audit.md`; la pasada 3 quedó en `evidence/audit-borrador.md`). 36 aprobadas, 12 para reformular y 0 rechazadas.
- Dos citas en inglés no eran textuales y una minuta de la Fed se había parafraseado de más. Ese error venía del español ya aprobado (C33) y lo arrastraba el inglés.
- Los textos de "Cómo lo hice" exageraban el control ("un sistema que no le cree a la IA", "el código frena lo que está mal") y repetían el error de "ningún número escrito a mano".
- "Peor día" en el gráfico no aplicaba al Dow, y la cifra "Tasa a 10 años" mostraba un cambio, no una tasa.
- Se aplicó todo menos un punto: el verifier pidió sacar "Hecha por mí, con Claude" de la fase 0 porque PROCESS.md todavía no la documenta. Se mantuvo porque lo afirma Fernando en su consigna, pero queda pendiente que cargue la Fase 0 con su captura.

**Evidencia:** `site/`, `tests/i18n.test.ts`, `tests/site-charts.test.ts`.

---

## Fase 7 — Corte al 24/11 para la entrega

**Qué pasó.** El primer deploy en Netlify falló porque el build se negó a publicar con datos incompletos: FRED seguía sin el 25/11 de SP500, VIXCLS y DGS10. No había forma de saber cuándo lo iba a publicar, y la entrega no podía esperar (log del deploy: `evidence/netlify-deploy-fallido.txt`).

**Qué se decidió (D15).** Fernando decidió entregar con datos hasta el 24/11. Claude propuso cortar el período para **todas** las series en esa fecha, en vez de publicar un borrador con fechas mezcladas, así los índices siguen siendo comparables y la validación pasa sin desactivar controles. Cambiaron `PERIOD_END` y el calendario en `config.ts`, se sacó de la historia el párrafo del 25/11 (quedó fuera del período) y se agregó una nota explícita del corte en "Fuentes y método".

**Resultado.** Validación PASS. Todas las aserciones de la plantilla se cumplen con los datos nuevos. Se generan `STORY.md` y `STORY.en.md` y el build de producción del sitio pasa sin `ALLOW_INCOMPLETE` (`evidence/render-corte-24.txt`).

**verifier, pasada 5: el corte** (`research/audit.md`; la pasada 4 quedó en `evidence/audit-sitio.md`). La historia aguanta el corte: ninguna frase quedó falsa con los datos nuevos. Quedaron 36 aprobadas, 6 para reformular y 2 rechazadas.
- La nota del corte atribuía la demora a Thanksgiving sin fuente, cuando FRED sí había publicado el Dow y el Nasdaq.
- CLAUDE.md decía que DGS10 tiene 10 observaciones; tras el corte son 9.
- La D15 se citaba antes de existir (se agregó mientras corría la pasada).
- Un texto del sitio decía "el último día", que ahora se podía leer como el 24.
- Se aplicó todo, incluidas dos observaciones no bloqueantes.
