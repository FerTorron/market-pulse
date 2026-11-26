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
| D7 | 2026-11-26 | Las cifras propias de los hechos (ingresos de Nvidia, PCE, aranceles) no van en la historia; están en events.md con su fuente | Mantener la regla "ningún dígito a mano" sin excepciones; la historia es sobre el mercado | Agregar una lista de excepciones al render |
| D8 | 2026-11-26 | Aserciones en la plantilla: lo que el texto da por cierto (signos, fechas que coinciden, "terminó cerca", con un umbral de ±10 pb) se evalúa contra los datos en cada render | El texto se escribió con datos parciales; cuando lleguen los del 25/11 los números cambian solos, pero las frases no | Revisar a mano el texto cada vez que cambian los datos |
| D9 | 2026-11-26 | Los subagentes se corrieron como agentes generales que leen su definición | Se crearon en la misma sesión y todavía no estaban registrados como tipos | Esperar a una sesión nueva |
| D10 | 2026-11-26 | Sitio con Astro en vez de Next.js (el plan original decía Next) | El sitio es contenido estático que se lee del repo en el build; Astro lo hace sin configuración extra y manda al navegador solo el JS del tooltip. Next se descartó por más pesado sin beneficio acá; Vite (SPA) porque el texto no estaría en el HTML | Next.js con export estático |
| D11 | 2026-11-26 | El sitio reutiliza el código del pipeline (`render.ts`, `story.ts`) en vez de copiar STORY.md | Así el sitio pasa por los mismos controles (dígitos, marcadores, aserciones, validación, cross-check) y no puede divergir del texto auditado | Leer research/STORY.md ya generado |
| D12 | 2026-11-26 | Plantilla en inglés con el mismo bloque de aserciones, controlado por un test | Los números en inglés también tienen que salir de los datos, y lo que el texto afirma tiene que valer igual en los dos idiomas | Traducir STORY.md a mano |
| D13 | 2026-11-26 | Textos del sitio en un archivo por idioma (`site/src/i18n/locales/`), también controlados contra dígitos a mano | Pedido de Fernando, y la regla de "ningún número a mano" aplica a toda la página | Textos dentro de los componentes |
| D14 | 2026-11-26 | Astro fijado en 7.4.1 y TypeScript 6 en el sitio | Las versiones posteriores de Astro piden Node ≥ 22.23.4 (la máquina tiene 22.23.2) y `astro check` no soporta TypeScript 7 | Actualizar Node en la máquina de Fernando sin pedírselo |

## What Claude got wrong and what was changed

Solo errores reales, con evidencia.

| # | Qué hizo mal Claude | Cómo se detectó | Qué se cambió |
|---|---|---|---|
| E1 | Nombró el script `fetch` en `package.json`. `pnpm fetch` es un comando propio de pnpm (precarga paquetes), así que el script nunca corrió y `compute` falló por falta del manifest. | La primera corrida del pipeline falló con `ENOENT manifest.json` | Scripts renombrados a `data:fetch`, `data:compute`, `data:validate` |
| E2 | Aplicó la misma tolerancia relativa (±0,05 %) a índices y a la tasa a 10 años, lo que generó 8 alertas falsas en DGS10 vs ^TNX. | Al leer el reporte: las diferencias eran de 0,3 a 1,2 puntos básicos | Tolerancia en puntos básicos para tasas (D5). Las diferencias siguen registradas en `cross-check.json` |
| E3 | events-agent dio por inaccesible el comunicado del BEA (PIB y PCE) y por eso bajó la confianza del hecho; además le asignó al 11/11 una nota sobre la investigación a Huang que en realidad era del 9/11. | verifier, pasada 1 (`evidence/audit-eventos.md`: A2, A22) | A2 rechazada; A22 sube a alta con los links del BEA |
| E4 | events-agent contó como fuentes distintas notas que eran el mismo cable de AP (TJX/Target, Trump-Irán) | verifier, pasada 1 (A4, A13) | Rechazadas por COPIA/UNA-FUENTE |
| E5 | Claude escribió dígitos a mano en el primer borrador ("30 segundos", títulos numerados, IDs de series, nombre de archivo) | `render --check` falló (`evidence/market-report-render.txt`) | Se reescribió sin dígitos; IDs con el formato `id` desde market-data.json; el archivo se renombró. No se agregaron excepciones |
| E6 | Claude atribuyó la cita "una vez pasado el gran evento" a los resultados de Nvidia; la fuente la pone junto a la salida a bolsa de Anthropic | verifier, pasada 2 (C16, RECHAZADA) | Reescrito según la fuente |
| E7 | Claude usó causas y adjetivos sin respaldo en el borrador ("el golpe vino de", "sorpresiva", "calma", "el dinero sigue caro", "casi no se movió") | verifier, pasada 2 (C4, C22, C29, C30, C34) | Reformulados |
| E8 | Claude escribió en el pie "ningún número de este texto fue escrito a mano", falso al pie de la letra ("3 minutos", "30 días") | verifier, pasada 2 (C39) | "ninguna cifra de mercado" |
| E9 | Bug de Claude en `render.ts`: la tabla diaria tomaba las fechas del S&P 500 y perdía filas enteras si a esa serie le faltaba una rueda | verifier, pasada 2 | Unión de fechas con "s/d" y test |
| E10 | El verifier, en la pasada 2, propuso una reformulación que exageraba la fuente: escribió "llegó" donde la cita dice "pareció" y dijo "en referencia a Anthropic" aunque la cita no la nombra | verifier, pasada 3 (C43), al releer la fuente | Texto que cita a CNBC vía Yahoo y solo dice dónde ubica Yahoo la frase |
| E11 | Claude corrigió E8 en la plantilla pero no en el pie que agrega `render-story.ts` | verifier, pasada 3 (C44) | Pie corregido |
| E12 | `story.ts` resolvía la raíz del repo desde su propia ubicación; al empaquetarse en el build del sitio quedaba dentro de `dist/` y no encontraba los datos | El primer `astro build` falló con ENOENT | `MARKET_PULSE_ROOT`, que fija el config de Astro |
| E13 | El desvanecido del fondo de la portada (mask) se aplicó a toda la sección y apagaba el texto de "En medio minuto" | Revisión visual en el navegador | La grilla pasó a un pseudo-elemento |
| E14 | En español, el "%" quedaba solo en otra línea ("6,51" / "%") porque el formato usaba un espacio común | Revisión visual en el navegador | Espacio duro (`NBSP`) en el formato; afecta también a STORY.md |
| E15 | Claude parafraseó de más las minutas de la Fed ("veían apropiado" donde dicen "would likely be appropriate") y el verifier lo aprobó en la pasada 2 (C33); el inglés lo arrastró. También recortó dos citas en inglés | verifier, pasada 4 (T10, T14, T19), al abrir las fuentes | Citas textuales y "probablemente sería apropiado" en los dos idiomas |
| E16 | Claude escribió en el sitio afirmaciones sobre el proceso que exageraban los controles ("un sistema que no le cree a la IA", "el código frena lo que está mal") y etiquetas que no coincidían con el dato ("Peor día" para los tres índices, "Tasa a 10 años" sobre un cambio en pb) | verifier, pasada 4 (S5, S6, S10, S11, G1, G5) | Reformuladas |

**Límite conocido del control:** `render.ts` detecta dígitos, no números escritos en palabras ("dos puntos básicos"). Eso lo cubre el verifier (C40), no el código.
