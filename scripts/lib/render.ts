// Motor de la plantilla de STORY. Puro, testeable.
//
// Marcadores:
//   {{ruta.al.valor|formato}}  → valor de market-data.json (formatos abajo)
//   {{d:AAAA-MM-DD}}           → fecha de un hecho (events.md). Debe ser una rueda del período o la base.
//   {{table:daily}}            → tabla de variaciones diarias de los tres índices
//
// Idiomas: 'es' (por defecto) y 'en'. Cada idioma tiene su plantilla y su lista de frases permitidas.
//
// Regla: después de sacar marcadores, links y frases permitidas, NO puede quedar ningún dígito.
import { BASE_DATE, EQUITY_TRADING_DAYS } from './config.ts';

export type Locale = 'es' | 'en';
export const LOCALES: Locale[] = ['es', 'en'];

/** Nombres propios con dígitos que no son datos, por idioma. Lista corta y explícita a propósito. */
export const ALLOWED_PHRASES: Record<Locale, string[]> = {
  es: ['S&P 500', '10 años', '30 días', '3 minutos'],
  en: ['S&P 500', '10-year', '30 days', '3 minutes'],
};

/** Espacio duro (no separable), para que el % o "pb" no queden solos en otra línea. */
export const NBSP = String.fromCharCode(0xa0);

interface LocaleSpec {
  intl: string;
  months: string[];
  days: string[];
  pctSep: string; // espacio entre número y % ("4,25 %" en es, "4.25%" en en)
  bp: string;
  date: (p: { day: number; month: string; dow: string }) => string;
  dow: (p: { day: number; month: string; dow: string }) => string;
  dayHeader: string;
  noData: string;
}

const SPECS: Record<Locale, LocaleSpec> = {
  es: {
    intl: 'es-AR',
    months: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
    days: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
    pctSep: NBSP, // espacio duro: el % no queda solo en otra línea
    bp: 'pb',
    date: (p) => `${p.day} de ${p.month}`,
    dow: (p) => `${p.dow} ${p.day} de ${p.month}`,
    dayHeader: 'Día',
    noData: 's/d',
  },
  en: {
    intl: 'en-US',
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    pctSep: '',
    bp: 'bp',
    date: (p) => `${p.month} ${p.day}`,
    dow: (p) => `${p.dow}, ${p.month} ${p.day}`,
    dayHeader: 'Day',
    noData: 'n/a',
  },
};

export type Formatter = (v: unknown) => string;

/** Formatos de los marcadores, por idioma. También los usa el sitio. */
export function getFormats(locale: Locale): Record<string, Formatter> {
  const L = SPECS[locale];
  const n = (x: number, dec: number) => x.toLocaleString(L.intl, { minimumFractionDigits: dec, maximumFractionDigits: dec });
  const signed = (x: number, dec: number) => (x > 0 ? '+' : x < 0 ? '−' : '') + n(Math.abs(x), dec);
  const parts = (iso: string) => {
    const d = new Date(`${iso}T12:00:00Z`);
    return { day: d.getUTCDate(), month: L.months[d.getUTCMonth()]!, dow: L.days[d.getUTCDay()]! };
  };
  const pct = (s: string) => `${s}${L.pctSep}%`;
  return {
    pct: (v) => pct(signed(num(v), 2)),
    pct1: (v) => pct(signed(num(v), 1)),
    pct0: (v) => pct(signed(num(v), 0)),
    abspct: (v) => pct(n(Math.abs(num(v)), 2)),
    abspct1: (v) => pct(n(Math.abs(num(v)), 1)),
    num: (v) => n(num(v), 2),
    num0: (v) => n(num(v), 0),
    pts: (v) => signed(num(v), 2),
    pts0: (v) => signed(num(v), 0),
    rate: (v) => pct(n(num(v), 2)),
    bp: (v) => `${signed(num(v), 0)}${NBSP}${L.bp}`,
    absbp: (v) => `${n(Math.abs(num(v)), 0)}${NBSP}${L.bp}`,
    int: (v) => n(num(v), 0),
    date: (v) => L.date(parts(str(v))),
    dow: (v) => L.dow(parts(str(v))),
    /** Solo el número de día del mes (ejes de gráficos). */
    dayNum: (v) => String(parts(str(v)).day),
    /** Día de la semana abreviado (ejes de gráficos). */
    dowShort: (v) => parts(str(v)).dow.slice(0, 3),
    /** Identificadores (p. ej. el ID de una serie de FRED). Solo strings. */
    id: (v) => { if (typeof v !== 'string') throw new Error(`se esperaba un identificador y llegó ${JSON.stringify(v)}`); return v; },
  };
}

/** Formatos en español (compatibilidad). */
export const FORMATS = getFormats('es');

function num(v: unknown): number {
  if (typeof v !== 'number' || !Number.isFinite(v)) throw new Error(`se esperaba un número y llegó ${JSON.stringify(v)}`);
  return v;
}
function str(v: unknown): string {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) throw new Error(`se esperaba una fecha ISO y llegó ${JSON.stringify(v)}`);
  return v;
}

export function lookup(data: unknown, path: string): unknown {
  let cur: unknown = data;
  for (const k of path.split('.')) {
    if (cur === null || typeof cur !== 'object' || !(k in cur)) throw new Error(`no existe "${path}" en market-data.json`);
    cur = (cur as Record<string, unknown>)[k];
  }
  return cur;
}

const VALID_EVENT_DATES = new Set<string>([BASE_DATE, ...EQUITY_TRADING_DAYS]);

interface DailyRow { date: string; pct: number | null }

function dailyTable(data: unknown, locale: Locale): string {
  const F = getFormats(locale);
  const L = SPECS[locale];
  const keys = ['sp500', 'nasdaq', 'dow'] as const;
  const series = keys.map((k) => lookup(data, `${k}.daily`) as DailyRow[]);
  const names = keys.map((k) => String(lookup(data, `${k}.name`)));
  const head = `| ${L.dayHeader} | ${names.join(' | ')} |\n|---|${keys.map(() => '---:').join('|')}|`;
  // Unión de fechas de los tres índices: si a una serie le falta una rueda, la fila aparece con "s/d"
  // (antes se tomaban las fechas del S&P 500 y una rueda faltante desaparecía de toda la tabla).
  const dates = [...new Set(series.flatMap((s) => s.map((r) => r.date)))].sort();
  const rows = dates.map((date) => `| ${F.dow!(date)} | ${series.map((s) => { const r = s.find((x) => x.date === date); return r?.pct != null ? F.pct!(r.pct) : L.noData; }).join(' | ')} |`);
  return [head, ...rows].join('\n');
}

/** Aserciones declaradas en la plantilla dentro de `<!-- assert ... -->`, una por línea:
 *  `ruta op valor`, con op en < <= > >= == != y valor = número, 'texto' o otra ruta.
 *  Garantizan que lo que el texto afirma (signos, fechas que coinciden) siga siendo cierto con los datos. */
export function checkAssertions(template: string, data: unknown): string[] {
  const failures: string[] = [];
  for (const block of template.matchAll(/<!--\s*assert\b([\s\S]*?)-->/g)) {
    for (const raw of block[1]!.split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith('#')) continue;
      const m = line.match(/^(\S+)\s*(<=|>=|==|!=|<|>)\s*(.+)$/);
      if (!m) { failures.push(`aserción mal formada: "${line}"`); continue; }
      const [, lhsPath, op, rhsRaw] = m as unknown as [string, string, string, string];
      try {
        const lhs = lookup(data, lhsPath);
        const rhs = /^'.*'$/.test(rhsRaw) ? rhsRaw.slice(1, -1)
          : /^-?\d+(\.\d+)?$/.test(rhsRaw) ? Number(rhsRaw)
          : rhsRaw === 'true' || rhsRaw === 'false' ? rhsRaw === 'true'
          : lookup(data, rhsRaw);
        const ok = op === '==' ? lhs === rhs : op === '!=' ? lhs !== rhs
          : typeof lhs === 'number' && typeof rhs === 'number'
            ? (op === '<' ? lhs < rhs : op === '<=' ? lhs <= rhs : op === '>' ? lhs > rhs : lhs >= rhs)
            : false;
        if (!ok) failures.push(`${line}  (izquierda=${JSON.stringify(lhs)}, derecha=${JSON.stringify(rhs)})`);
      } catch (e) {
        failures.push(`${line}: ${(e as Error).message}`);
      }
    }
  }
  return failures;
}

const MARKER = /\{\{\s*([^}]+?)\s*\}\}/g;

/** Verifica que la plantilla no tenga números escritos a mano. Devuelve los hallazgos. */
export function findHandwrittenNumbers(template: string, locale: Locale = 'es'): string[] {
  const lines = template.split(/\r?\n/);
  const bad: string[] = [];
  let inComment = false;
  lines.forEach((line, i) => {
    let l = line;
    // Comentarios HTML (instrucciones para el redactor) no se publican.
    if (inComment) { if (!l.includes('-->')) return; l = l.slice(l.indexOf('-->') + 3); inComment = false; }
    l = l.replace(/<!--.*?-->/g, '');
    if (l.includes('<!--')) { l = l.slice(0, l.indexOf('<!--')); inComment = true; }
    l = l
      .replace(MARKER, '')
      .replace(/\]\([^)]*\)/g, ']') // destinos de links
      .replace(/https?:\/\/\S+/g, '')
      .replace(/^#{1,6}\s/, ''); // niveles de título
    for (const p of ALLOWED_PHRASES[locale]) l = l.split(p).join('');
    const m = l.match(/\d[\d.,]*/g);
    if (m) bad.push(`línea ${i + 1}: ${m.join(', ')}  ←  "${line.trim()}"`);
  });
  return bad;
}

export function render(template: string, data: unknown, locale: Locale = 'es'): string {
  const F = getFormats(locale);
  const handwritten = findHandwrittenNumbers(template, locale);
  if (handwritten.length) throw new Error(`Números escritos a mano en la plantilla:\n  ${handwritten.join('\n  ')}`);
  const failed = checkAssertions(template, data);
  if (failed.length) throw new Error(`Aserciones que no se cumplen con estos datos (el texto diría algo falso):\n  ${failed.join('\n  ')}`);

  const errors: string[] = [];
  const out = template
    .replace(/<!--[\s\S]*?-->\n?/g, '')
    .replace(MARKER, (_, body: string) => {
      try {
        if (body === 'table:daily') return dailyTable(data, locale);
        if (body.startsWith('d:')) {
          const d = body.slice(2).trim();
          if (!VALID_EVENT_DATES.has(d)) throw new Error(`la fecha ${d} no es una rueda del período`);
          return F.dow!(d);
        }
        const [path, fmt = 'num'] = body.split('|').map((s) => s.trim());
        const f = F[fmt];
        if (!f) throw new Error(`formato desconocido "${fmt}"`);
        return f(lookup(data, path!));
      } catch (e) {
        errors.push(`{{${body}}}: ${(e as Error).message}`);
        return '⟦ERROR⟧';
      }
    });
  if (errors.length) throw new Error(`Marcadores inválidos:\n  ${errors.join('\n  ')}`);
  return out;
}
