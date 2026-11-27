# market-pulse — reglas para Claude

Proyecto: análisis de la bolsa de EE.UU. del 11 al 24 de noviembre de 2026 para alguien sin conocimientos financieros que tiene 3 minutos. Ver `BRIEF.md`.

## Reglas duras

1. **Ningún número escrito a mano por el modelo.** Todo valor (precio, %, puntos, fecha de máximo/mínimo) sale de `data/processed/market-data.json`, generado por `scripts/compute.ts`. En textos se usan marcadores `{{ruta.al.valor}}` en `research/STORY.template.md` y `scripts/render-story.ts` los reemplaza. Un número suelto en la plantilla hace fallar el render.
2. **Cada hecho con fecha y link.** Nada en `research/events.md` sin fuente enlazada.
3. **Las diferencias entre fuentes se documentan, no se esconden.** FRED es la fuente única de datos. Yahoo Finance solo sirve para validar (`data/processed/cross-check.json`); nunca se mezclan valores.
4. **Sin claves ni datos sensibles en el repo.** FRED se consume por el CSV público (`fredgraph.csv`), sin API key.
5. **Fuera de alcance:** predicciones y recomendaciones de inversión.
6. **Causalidad:** "coincidió con", no "por", salvo evidencia explícita y de varias fuentes independientes. El `verifier` tiene la última palabra.

## Período y calendario

- Base: cierre del 10/11/2026. Período: 11/11 al 24/11/2026 (10 ruedas de acciones). Se cortó al 24 porque FRED no había publicado el 25 de SP500, VIXCLS y DGS10 a tiempo para la entrega (DECISIONS D15).
- 11/11 es Veterans Day: la bolsa abre, el mercado de bonos cierra → DGS10 tiene 9 observaciones (una menos que las 10 ruedas de acciones). Esperado, no es un error.
- 26/11 Thanksgiving (cerrado), 27/11 media rueda: fuera del período.

## Cómo trabajar

- Pipeline: `pnpm data:fetch` → `pnpm data:compute` → `pnpm data:validate` → `pnpm render` (los tres primeros juntos: `pnpm data`). Todo junto: `pnpm pipeline`.
- Orquestación: `/market-report` (ver `.claude/commands/market-report.md`).
- Al terminar cada fase: actualizar `research/PROCESS.md` y, si Claude se equivocó en algo real, `research/DECISIONS.md`.
- Salida de corridas que sirve como evidencia → `evidence/`. Logs de trabajo descartables → fuera del repo.
