# market-pulse

Análisis de la bolsa de EE.UU. del 11 al 25 de noviembre de 2026, hecho exclusivamente con Claude, con un proceso reproducible y documentado.

- Qué y para quién: [`BRIEF.md`](BRIEF.md)
- Cómo se hizo, fase por fase: [`research/PROCESS.md`](research/PROCESS.md)
- Decisiones y errores de Claude: [`research/DECISIONS.md`](research/DECISIONS.md)
- Resultado: [`research/STORY.md`](research/STORY.md)

## Cómo funciona

```
FRED (CSV público) ──fetch.ts──▶ data/raw/*.csv + manifest.json
                                        │
                                   compute.ts
                                        ▼
                        data/processed/market-data.json ◀── única fuente de números
                                        │
                     validate.ts (fechas, nulos, duplicados, recálculo, Yahoo como control)
                                        │
        STORY.template.md ──render-story.ts──▶ research/STORY.md
```

Agentes (`.claude/agents/`):

- **data-agent**: corre los scripts y reporta. No interpreta.
- **events-agent**: qué pasó en cada rueda, con fuente, link y nivel de confianza → `research/events.md`.
- **verifier**: puede rechazar afirmaciones (causalidad sin evidencia, una sola fuente, fuentes que se copian, fechas mal, conclusiones que exceden los datos) → `research/audit.md`.

El comando `/market-report` corre data-agent y events-agent en paralelo, después verifier, y arma `STORY.md`.

## Cómo correrlo

Requisitos: Node 22+, pnpm.

```bash
pnpm install
pnpm pipeline      # fetch + compute + validate + render
pnpm test          # tests de compute
```

En Claude Code: `/market-report`.

No usa claves: FRED se baja por `fredgraph.csv`, Yahoo por su endpoint público de gráficos (solo para validar).
