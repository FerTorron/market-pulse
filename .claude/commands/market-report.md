---
description: Orquesta datos, eventos y verificación, y arma el borrador de research/STORY.md (1 conclusión + 3 a 5 hallazgos).
---

Corré el reporte de market-pulse. Leé `CLAUDE.md` y `BRIEF.md` primero. Seguí estos pasos en orden y no te saltees ninguno.

## 1. Datos y eventos en paralelo

En **un solo mensaje**, lanzá con la herramienta Agent:
- `data-agent`: "Corré el pipeline de datos y reportá en el formato de tu definición."
- `events-agent`: "Armá research/events.md para el período definido en scripts/lib/config.ts."

Esperá a los dos.

## 2. Estado de los datos

- Si data-agent reporta **FAIL** por datos faltantes (por ejemplo, FRED todavía no publicó la última rueda): **no rellenes nada**. Seguí con los pasos 3 a 5 (las conclusiones sobre las series afectadas quedan bloqueadas) y en el paso 6 **no generes** `STORY.md`: avisale al usuario qué falta y preguntale si espera a FRED o genera un borrador con `pnpm render --allow-incomplete`.
- Si falla por otro motivo (hash, duplicados, recálculo): pará y reportá. No sigas.

## 3. Verificación de eventos (verifier, pasada 1)

Lanzá `verifier`: "Pasada 1: auditá research/events.md contra los datos. Todavía no hay borrador."
Desde acá, solo podés usar hechos **APROBADOS** o **REFORMULADOS** (con la reformulación aplicada).

## 4. Borrador: `research/STORY.template.md`

Escribilo vos. Audiencia: alguien sin conocimientos financieros con 3 minutos. Tono: claro, concreto, sin jerga; si un término es inevitable, se explica en la misma oración.

**Reglas de la plantilla** (las hace cumplir `scripts/lib/render.ts`):
- **Ningún dígito escrito a mano.** Cada número es un marcador `{{ruta|formato}}` contra `data/processed/market-data.json`. Formatos: `pct`, `pct1`, `abspct`, `abspct1`, `num`, `num0`, `pts`, `pts0`, `rate`, `bp`, `absbp`, `int`, `date`, `dow`.
- Fechas de hechos: `{{d:AAAA-MM-DD}}`. Tabla diaria: `{{table:daily}}`.
- Frases con dígitos permitidas: "S&P 500", "10 años", "30 días", "3 minutos". Nada más.
- Los textos de los links no pueden tener dígitos.
- Leé `market-data.json` para elegir las rutas; no inventes rutas.

**Estructura:**
1. `# ` Título = la **conclusión principal** en una frase.
2. **En 30 segundos**: 3 viñetas.
3. **Hallazgos** (3 a 5). Cada uno: qué pasó (dato con marcador) → qué significa en criollo → qué coincidió (hecho con fecha y link, "coincidió con", nunca "por" salvo que el verifier lo haya aprobado como causa).
4. **El VIX, explicado**: la volatilidad que el mercado espera para los próximos 30 días, no solo "índice del miedo".
5. **Día por día**: `{{table:daily}}`.
6. **Qué no dice este análisis**: sin predicciones, sin recomendaciones, límites de los datos.
7. **Fuentes y método**: FRED (series), Yahoo solo como control, diferencias de `cross-check.json` contadas, link a `research/audit.md` y `research/PROCESS.md`.

Después corré `pnpm render --check` y corregí hasta que pase.

## 5. Verificación del borrador (verifier, pasada 2)

Lanzá `verifier`: "Pasada 2: auditá research/STORY.template.md (resolvé cada marcador contra market-data.json) y los eventos que usa."
Aplicá todos los RECHAZADOS (sacar) y REFORMULAR (reescribir). Si cambiaste algo, una **única** pasada más del verifier. Si sigue habiendo rechazos, sacá esas afirmaciones.

## 6. Render

- Datos PASS: `pnpm render`. Debe generar `research/STORY.md`.
- Datos FAIL: ver paso 2.

Guardá la salida de `pnpm render --check` y de `pnpm render` en `evidence/market-report-render.txt`.

## 7. Bitácora

- Agregá a `research/PROCESS.md` la fase de esta corrida: qué hizo cada agente, cuántos hechos, qué rechazó el verifier y por qué, estado de los datos.
- Si Claude (cualquier agente, o vos) se equivocó en algo **real** y quedó evidencia, agregalo a "What Claude got wrong and what I changed" en `research/DECISIONS.md`. Un rechazo del verifier sobre un borrador de Claude **es** un error real de Claude: registralo.
- Reportá al usuario: estado de los datos, conclusión principal, hallazgos, rechazos del verifier y qué quedó pendiente.
