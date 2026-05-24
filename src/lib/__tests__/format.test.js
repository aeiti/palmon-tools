import { describe, expect, it } from 'vitest';
import { formatCompact, formatCompactFull } from '../format.js';

describe('formatCompact', () => {
  it('returns "0" for 0', () => {
    expect(formatCompact(0)).toBe('0');
  });

  it('returns "0" for invalid numbers', () => {
    expect(formatCompact(NaN)).toBe('0');
    expect(formatCompact(Infinity)).toBe('0');
    expect(formatCompact(-Infinity)).toBe('0');
  });

  it('shows plain integer for 0–999', () => {
    expect(formatCompact(1)).toBe('1');
    expect(formatCompact(99)).toBe('99');
    expect(formatCompact(500)).toBe('500');
    expect(formatCompact(999)).toBe('999');
  });

  it('truncates fractional input under 1,000', () => {
    expect(formatCompact(99.7)).toBe('99');
  });

  it('switches to K at 1,000', () => {
    expect(formatCompact(1_000)).toBe('1K');
    expect(formatCompact(1_500)).toBe('1.5K');
  });

  it('shows 1 decimal under 100 in unit', () => {
    expect(formatCompact(9_500)).toBe('9.5K');
    expect(formatCompact(99_900)).toBe('99.9K');
  });

  it('drops decimals at 100+ in unit', () => {
    expect(formatCompact(100_000)).toBe('100K');
    expect(formatCompact(999_000)).toBe('999K');
  });

  it('never rounds up to the next bucket', () => {
    // 999,999 / 1000 = 999.999 — rounded would be 1000K (wrong)
    expect(formatCompact(999_999)).toBe('999K');
  });

  it('switches to M at 1,000,000', () => {
    expect(formatCompact(1_000_000)).toBe('1M');
    expect(formatCompact(1_500_000)).toBe('1.5M');
    expect(formatCompact(5_400_000)).toBe('5.4M');
  });

  it('switches to B at 1,000,000,000', () => {
    expect(formatCompact(1_000_000_000)).toBe('1B');
    expect(formatCompact(2_500_000_000)).toBe('2.5B');
  });

  it('drops trailing .0', () => {
    expect(formatCompact(2_000_000)).toBe('2M');
    expect(formatCompact(10_000)).toBe('10K');
  });

  it('formats negatives with the same rules', () => {
    expect(formatCompact(-1_500)).toBe('-1.5K');
    expect(formatCompact(-100_000)).toBe('-100K');
  });
});

describe('formatCompactFull', () => {
  it('uses comma-grouped digits', () => {
    expect(formatCompactFull(1_234_567)).toBe('1,234,567');
  });

  it('handles 0 and nullish', () => {
    expect(formatCompactFull(0)).toBe('0');
    expect(formatCompactFull(null)).toBe('0');
    expect(formatCompactFull(undefined)).toBe('0');
  });
});
