// Motor de la plantilla de STORY. Puro, testeable.
//
// Marcadores:
//   {{ruta.al.valor|formato}}  → valor de market-data.json (formatos abajo)
//   {{d:AAAA-MM-DD}}           → fecha de un hecho (events.md). Debe ser una rueda del período o la base.
//   {{table:daily}}            → tabla de variaciones diarias de los tres índices
//
// Regla: después de sacar marcadores, links y frases permitidas, NO puede quedar ningún dígito.
import { BASE_DATE, EQUITY_TRADING_DAYS } from './config.ts';

/** Nombres propios con dígitos que no son datos. Lista corta y explícita a propósito. */
export const ALLOWED_PHRASES = ['S&P 500', '10 años', '30 días', '3 minutos'];

const LOCALE = 'es-AR';
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const DAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

const n = (x: number, dec: number) => x.toLocaleString(LOCALE, { minimumFractionDigits: dec, maximumFractionDigits: dec });
const signed = (x: number, dec: number) => (x > 0 ? '+' : x < 0 ? '−' : '') + n(Math.abs(x), dec);
const parts = (iso: string) => {
  const d = new Date(`${iso}T12:00:00Z`);
  return { day: d.getUTCDate(), month: MONTHS[d.getUTCMonth()]!, dow: DAYS[d.getUTCDay()]! };
};

export const FORMATS: Record<string, (v: unknown) => string> = {
  pct: (v) => `${signed(num(v), 2)} %`,
  pct1: (v) => `${signed(num(v), 1)} %`,
  abspct: (v) => `${n(Math.abs(num(v)), 2)} %`,
  abspct1: (v) => `${n(Math.abs(num(v)), 1)} %`,
  num: (v) => n(num(v), 2),
  num0: (v) => n(num(v), 0),
  pts: (v) => signed(num(v), 2),
  pts0: (v) => signed(num(v), 0),
  rate: (v) => `${n(num(v), 2)} %`,
  bp: (v) => `${signed(num(v), 0)} pb`,
  absbp: (v) => `${n(Math.abs(num(v)), 0)} pb`,
  int: (v) => n(num(v), 0),
  date: (v) => { const p = parts(str(v)); return `${p.day} de ${p.month}`; },
  dow: (v) => { const p = parts(str(v)); return `${p.dow} ${p.day} de ${p.month}`; },
  /** Identificadores (p. ej. el ID de una serie de FRED). Solo strings. */
  id: (v) => { if (typeof v !== 'string') throw new Error(`se esperaba un identificador y llegó ${JSON.stringify(v)}`); return v; },
};

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

function dailyTable(data: unknown): string {
  const keys = ['sp500', 'nasdaq', 'dow'] as const;
  const series = keys.map((k) => lookup(data, `${k}.daily`) as DailyRow[]);
  const names = keys.map((k) => String(lookup(data, `${k}.name`)));
  const head = `| Día | ${names.join(' | ')} |\n|---|${keys.map(() => '---:').join('|')}|`;
  // Unión de fechas de los tres índices: si a una serie le falta una rueda, la fila aparece con "s/d"
  // (antes se tomaban las fechas del S&P 500 y una rueda faltante desaparecía de toda la tabla).
  const dates = [...new Set(series.flatMap((s) => s.map((r) => r.date)))].sort();
  const rows = dates.map((date) => `| ${FORMATS.dow!(date)} | ${series.map((s) => { const r = s.find((x) => x.date === date); return r?.pct != null ? FORMATS.pct!(r.pct) : 's/d'; }).join(' | ')} |`);
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
export function findHandwrittenNumbers(template: string): string[] {
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
    for (const p of ALLOWED_PHRASES) l = l.split(p).join('');
    const m = l.match(/\d[\d.,]*/g);
    if (m) bad.push(`línea ${i + 1}: ${m.join(', ')}  ←  "${line.trim()}"`);
  });
  return bad;
}

export function render(template: string, data: unknown): string {
  const handwritten = findHandwrittenNumbers(template);
  if (handwritten.length) throw new Error(`Números escritos a mano en la plantilla:\n  ${handwritten.join('\n  ')}`);
  const failed = checkAssertions(template, data);
  if (failed.length) throw new Error(`Aserciones que no se cumplen con estos datos (el texto diría algo falso):\n  ${failed.join('\n  ')}`);

  const errors: string[] = [];
  const out = template
    .replace(/<!--[\s\S]*?-->\n?/g, '')
    .replace(MARKER, (_, body: string) => {
      try {
        if (body === 'table:daily') return dailyTable(data);
        if (body.startsWith('d:')) {
          const d = body.slice(2).trim();
          if (!VALID_EVENT_DATES.has(d)) throw new Error(`la fecha ${d} no es una rueda del período`);
          return FORMATS.dow!(d);
        }
        const [path, fmt = 'num'] = body.split('|').map((s) => s.trim());
        const f = FORMATS[fmt];
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
