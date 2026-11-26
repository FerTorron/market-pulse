import { describe, expect, it } from 'vitest';
import { findHandwrittenNumbers, render } from '../scripts/lib/render.ts';

const data = {
  sp500: { name: 'S&P 500', cum_pct: -4.25, worst_day: { date: '2026-11-20', pct: -3.7 }, daily: [{ date: '2026-11-11', pct: 1.3 }] },
  nasdaq: { name: 'Nasdaq', daily: [{ date: '2026-11-11', pct: 0.5 }] },
  dow: { name: 'Dow', daily: [{ date: '2026-11-11', pct: -0.25 }] },
  us10y: { change_bp: -7 },
};

describe('findHandwrittenNumbers', () => {
  it('acepta marcadores, links, frases permitidas y comentarios', () => {
    const t = '# El S&P 500 en {{sp500.cum_pct|pct}}\nVer [nota](https://x.com/2026/11/20).\n<!-- escribir 3 hallazgos -->\nLa tasa a 10 años.';
    expect(findHandwrittenNumbers(t)).toEqual([]);
  });
  it('detecta un número suelto', () => {
    expect(findHandwrittenNumbers('El S&P 500 cayó 4,2 % el jueves.')).toHaveLength(1);
  });
  it('detecta una fecha escrita a mano', () => {
    expect(findHandwrittenNumbers('El 20 de noviembre fue el peor día.')).toHaveLength(1);
  });
});

describe('render', () => {
  it('formatea en español con signo', () => {
    expect(render('{{sp500.cum_pct|pct}} · {{us10y.change_bp|bp}} · {{sp500.worst_day.date|dow}}', data)).toBe('−4,25 % · −7 pb · viernes 20 de noviembre');
  });
  it('acepta fechas de hechos solo si son ruedas del período', () => {
    expect(render('{{d:2026-11-20}}', data)).toBe('viernes 20 de noviembre');
    expect(() => render('{{d:2026-11-22}}', data)).toThrow(/no es una rueda/);
  });
  it('falla con rutas inexistentes o formatos desconocidos', () => {
    expect(() => render('{{sp500.nada|pct}}', data)).toThrow(/no existe/);
    expect(() => render('{{sp500.cum_pct|xyz}}', data)).toThrow(/formato desconocido/);
  });
  it('falla si el formato no coincide con el tipo', () => {
    expect(() => render('{{sp500.name|pct}}', data)).toThrow(/número/);
  });
  it('arma la tabla diaria', () => {
    expect(render('{{table:daily}}', data)).toContain('| miércoles 11 de noviembre | +1,30 % | +0,50 % | −0,25 % |');
  });
});

describe('checkAssertions', () => {
  const d = { a: { x: -1, d: '2026-11-20' }, b: { d: '2026-11-20' }, c: { d: '2026-11-19' } };
  it('pasa cuando se cumplen y falla con detalle cuando no', async () => {
    const { checkAssertions } = await import('../scripts/lib/render.ts');
    expect(checkAssertions("<!-- assert\n# comentario\na.x < 0\na.d == b.d\na.d != c.d\na.d == '2026-11-20'\n-->", d)).toEqual([]);
    const f = checkAssertions('<!-- assert\na.x > 0\na.d == c.d\n-->', d);
    expect(f).toHaveLength(2);
    expect(f[0]).toContain('izquierda=-1');
  });
  it('render falla si una aserción no se cumple', () => {
    expect(() => render('<!-- assert\nsp500.cum_pct > 0\n-->\nTexto', data)).toThrow(/Aserciones/);
  });
  it('la tabla diaria no pierde filas si a una serie le falta una rueda', () => {
    const partial = { ...data, nasdaq: { name: 'Nasdaq', daily: [{ date: '2026-11-11', pct: 0.5 }, { date: '2026-11-12', pct: 1 }] } };
    const t = render('{{table:daily}}', partial);
    expect(t).toContain('| jueves 12 de noviembre | s/d | +1,00 % | s/d |');
  });
});
