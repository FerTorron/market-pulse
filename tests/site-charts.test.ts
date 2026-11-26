import { describe, expect, it } from 'vitest';
import { domainOf, linePath, niceTicks, spreadLabels, xPct, yPct } from '../site/src/lib/charts/scales.ts';

describe('chart scales', () => {
  it('domain includes zero when asked', () => {
    expect(domainOf([-5, -1], { includeZero: true, pad: 0 })).toEqual({ min: -5, max: 0 });
  });
  it('nice ticks', () => {
    expect(niceTicks({ min: -10.4, max: 1.2 }, 5)).toEqual([-10, -7.5, -5, -2.5, 0]);
  });
  it('positions in percent', () => {
    expect(xPct(0, 11)).toBe(0);
    expect(xPct(10, 11)).toBe(100);
    expect(yPct(0, { min: -10, max: 10 })).toBe(50);
  });
  it('line path breaks on nulls', () => {
    expect(linePath([0, null, 1], { min: 0, max: 1 })).toBe('M0.000,100.000M100.000,0.000');
  });
  it('spreads labels keeping order', () => {
    expect(spreadLabels([50, 52, 10], 6)).toEqual([50, 56, 10]);
  });
});
