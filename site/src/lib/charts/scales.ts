// Pure geometry for the charts. Positions are percentages of the plot box, so the same
// numbers drive the SVG (stretched, with non-scaling strokes) and the HTML labels on top of it.

export interface Domain {
  min: number;
  max: number;
}

/** Domain that covers the values (and zero, if asked), padded so lines don't touch the edges. */
export function domainOf(values: number[], { includeZero = false, pad = 0.08 } = {}): Domain {
  let min = Math.min(...values, ...(includeZero ? [0] : []));
  let max = Math.max(...values, ...(includeZero ? [0] : []));
  if (min === max) {
    min -= 1;
    max += 1;
  }
  const span = max - min;
  return { min: min - span * pad, max: max + span * pad };
}

/** "Nice" tick values (1, 2, 2.5 or 5 times a power of ten) inside the domain. */
export function niceTicks({ min, max }: Domain, target = 5): number[] {
  const raw = (max - min) / target;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s >= raw) ?? 10 * pow;
  const ticks: number[] = [];
  for (let v = Math.ceil(min / step) * step; v <= max + 1e-9; v += step) ticks.push(Math.round(v / step) * step);
  return ticks;
}

export const xPct = (i: number, n: number) => (n <= 1 ? 50 : (i / (n - 1)) * 100);
export const yPct = (v: number, { min, max }: Domain) => ((max - v) / (max - min)) * 100;

/** SVG path in a 0–100 × 0–100 box. Points with null values break the line. */
export function linePath(values: (number | null)[], domain: Domain): string {
  let d = '';
  let pen = false;
  values.forEach((v, i) => {
    if (v === null) {
      pen = false;
      return;
    }
    d += `${pen ? 'L' : 'M'}${xPct(i, values.length).toFixed(3)},${yPct(v, domain).toFixed(3)}`;
    pen = true;
  });
  return d;
}

/** Spreads label positions (in %) so no two are closer than `gap`, keeping their order. */
export function spreadLabels(positions: number[], gap: number): number[] {
  const order = positions.map((p, i) => ({ p, i })).sort((a, b) => a.p - b.p);
  for (let k = 1; k < order.length; k++) {
    if (order[k]!.p - order[k - 1]!.p < gap) order[k]!.p = order[k - 1]!.p + gap;
  }
  const out = new Array<number>(positions.length);
  for (const { p, i } of order) out[i] = p;
  return out;
}
