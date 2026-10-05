import { describe, expect, it } from 'vitest';
import { linearScale, niceTicks, timeTicks } from '../chartScale.js';

describe('linearScale', () => {
  it('maps the domain onto the range, including inverted ranges', () => {
    const y = linearScale([0, 100], [200, 0]);
    expect(y(0)).toBe(200);
    expect(y(25)).toBe(150);
    expect(y(100)).toBe(0);
  });

  it('maps a zero-width domain to the middle', () => {
    expect(linearScale([5, 5], [0, 10])(5)).toBe(5);
  });
});

describe('niceTicks', () => {
  it('uses 1/2/5 steps and expands to the outer ticks', () => {
    const { ticks, min, max } = niceTicks(0, 1_900_000_000, 4);
    expect(ticks).toEqual([
      0, 500_000_000, 1_000_000_000, 1_500_000_000, 2_000_000_000,
    ]);
    expect(min).toBe(0);
    expect(max).toBe(2_000_000_000);
  });

  it('handles a flat series', () => {
    expect(niceTicks(0, 0).ticks).toEqual([0, 1]);
    const { min, max } = niceTicks(50, 50);
    expect(min).toBeLessThan(50);
    expect(max).toBeGreaterThan(50);
  });
});

describe('timeTicks', () => {
  it('lands on local midnights inside the range', () => {
    const start = new Date(2026, 9, 2, 21, 30).getTime();
    const end = new Date(2026, 9, 5, 11, 0).getTime();
    const ticks = timeTicks(start, end, 5);
    expect(ticks.map((t) => new Date(t).getDate())).toEqual([3, 4, 5]);
    for (const t of ticks) expect(new Date(t).getHours()).toBe(0);
  });

  it('widens the step to stay near the requested count', () => {
    const start = new Date(2026, 9, 1).getTime();
    const end = new Date(2027, 9, 1).getTime();
    expect(timeTicks(start, end, 5).length).toBeLessThanOrEqual(6);
  });

  it('is empty for an empty range', () => {
    expect(timeTicks(10, 10)).toEqual([]);
  });
});
