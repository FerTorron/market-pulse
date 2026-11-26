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
