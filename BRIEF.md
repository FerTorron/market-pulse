# Brief

## Consigna

> "Hacé un análisis de los movimientos de la bolsa de EE.UU. en los últimos 15 días, usando exclusivamente Claude. Explicado de forma dinámica, práctica y fácil de entender. Formato libre. Los conocimientos financieros no son parte del puesto: es una excusa para ver cómo trabajás con IA y cómo comunicás."

## Problema

Contar qué hizo la bolsa de EE.UU. en dos semanas sin que el lector necesite saber de finanzas, y que cada afirmación se pueda rastrear hasta un dato o una fuente.

## Audiencia

Una persona sin conocimientos financieros que tiene **3 minutos**.

## Período

- **11 al 25 de noviembre de 2026** (15 días corridos, 11 ruedas).
- Base de comparación: cierre del **10/11/2026**.
- Datos congelados al 25/11: el 26 no hubo mercado (Thanksgiving) y el 27 fue media rueda.

## Métricas

| Métrica | Serie FRED | Para qué |
|---|---|---|
| Variación acumulada y diaria del S&P 500 | `SP500` | El "mercado" en general |
| Variación acumulada y diaria del Nasdaq Composite | `NASDAQCOM` | Tecnológicas |
| Variación acumulada y diaria del Dow Jones | `DJIA` | Grandes empresas tradicionales |
| Mayor caída diaria (por índice) | — | El peor día |
| Máximo del VIX | `VIXCLS` | Cuánta volatilidad espera el mercado para los próximos 30 días (no solo "índice del miedo") |
| Tasa del bono a 10 años | `DGS10` | El costo del dinero a largo plazo |

Sectores: solo si explican un movimiento clave.

## Fuera de alcance

Predicciones. Recomendaciones de inversión.

## Criterios de éxito

1. Se entiende en 3 minutos sin saber de finanzas.
2. Todo número sale de un script (`market-data.json`); ninguno escrito a mano.
3. Todo hecho tiene fecha y link; las causas están respaldadas o marcadas como coincidencia.
4. El proceso es reproducible: clonar, `pnpm install`, `pnpm pipeline`.
5. Las diferencias entre fuentes y los errores de Claude están documentados.
