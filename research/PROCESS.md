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
