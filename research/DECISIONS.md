# Decisiones

## Registro

| # | Fecha | Decisión | Por qué | Alternativa descartada |
|---|---|---|---|---|
| D1 | 2026-11-26 | FRED como única fuente de datos; Yahoo solo para validar | FRED es oficial, estable y no pide clave | Mezclar fuentes para completar huecos |
| D2 | 2026-11-26 | DGS10 con 10 observaciones (11/11 Veterans Day) es esperado | El mercado de bonos cierra ese día | Rellenar con el valor del día anterior |
| D3 | 2026-11-26 | STORY.md se genera desde una plantilla con marcadores | Hace cumplir por código que ningún número esté escrito a mano | Confiar en que el modelo copie bien los números |
| D4 | 2026-11-26 | Causas como "coincidió con" salvo evidencia fuerte | Una nota de prensa que atribuye un movimiento no prueba causalidad | Atribuir causas directamente |
| D5 | 2026-11-26 | Validación cruzada de la tasa con tolerancia absoluta (±2 pb) en vez de relativa | DGS10 (Tesoro) y ^TNX (CBOE) se calculan distinto y DGS10 viene redondeado a 0,01; un 0,05 % relativo equivale a menos de medio punto básico | Mantener ±0,05 % y tener 8 alertas que no indican ningún problema real |
| D6 | 2026-11-26 | Si FRED no publicó el 25/11, no se completa con Yahoo ni con el 24 | Mezclar fuentes o fechas de cierre distintas haría incomparables los índices | Rellenar con Yahoo |

## What Claude got wrong and what I changed

Solo errores reales, con evidencia.

| # | Qué hizo mal Claude | Cómo se detectó | Qué se cambió |
|---|---|---|---|
| E1 | Nombró el script `fetch` en `package.json`. `pnpm fetch` es un comando propio de pnpm (precarga paquetes), así que el script nunca corrió y `compute` falló por falta del manifest. | La primera corrida del pipeline falló con `ENOENT manifest.json` | Scripts renombrados a `data:fetch`, `data:compute`, `data:validate` |
| E2 | Aplicó la misma tolerancia relativa (±0,05 %) a índices y a la tasa a 10 años, lo que generó 8 alertas falsas en DGS10 vs ^TNX. | Al leer el reporte: las diferencias eran de 0,3 a 1,2 puntos básicos | Tolerancia en puntos básicos para tasas (D5). Las diferencias siguen registradas en `cross-check.json` |
