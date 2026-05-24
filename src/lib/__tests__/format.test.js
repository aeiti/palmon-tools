import { describe, expect, it } from 'vitest';
import {
  formatCompact,
  formatCompactFull,
  parseCompact,
} from '../format.js';

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

describe('parseCompact', () => {
  it('parses plain integers', () => {
    expect(parseCompact('0')).toBe(0);
    expect(parseCompact('99')).toBe(99);
    expect(parseCompact('1500000')).toBe(1_500_000);
  });

  it('parses K / M / B suffixes (case-insensitive)', () => {
    expect(parseCompact('1K')).toBe(1_000);
    expect(parseCompact('1.5K')).toBe(1_500);
    expect(parseCompact('100k')).toBe(100_000);
    expect(parseCompact('1.5M')).toBe(1_500_000);
    expect(parseCompact('5.4m')).toBe(5_400_000);
    expect(parseCompact('2.5B')).toBe(2_500_000_000);
    expect(parseCompact('1b')).toBe(1_000_000_000);
  });

  it('parses fractional unit values like 0.1K', () => {
    expect(parseCompact('0.1K')).toBe(100);
    expect(parseCompact('0.5M')).toBe(500_000);
  });

  it('strips commas, underscores, and whitespace', () => {
    expect(parseCompact('1,500,000')).toBe(1_500_000);
    expect(parseCompact('1_500_000')).toBe(1_500_000);
    expect(parseCompact('  1.5 M  ')).toBe(1_500_000);
  });

  it('treats empty / whitespace-only input as 0', () => {
    expect(parseCompact('')).toBe(0);
    expect(parseCompact('   ')).toBe(0);
  });

  it('truncates fractional amounts that would round to a fraction', () => {
    // 1.5K = 1500 exactly. But 0.001K → 1, not 0.001.
    expect(parseCompact('0.001K')).toBe(1);
  });

  it('returns null for unparseable input', () => {
    expect(parseCompact('abc')).toBeNull();
    expect(parseCompact('1.5X')).toBeNull();
    expect(parseCompact('--5')).toBeNull();
    expect(parseCompact(null)).toBeNull();
    expect(parseCompact(undefined)).toBeNull();
  });

  it('handles negatives', () => {
    expect(parseCompact('-1.5M')).toBe(-1_500_000);
    expect(parseCompact('-500')).toBe(-500);
  });

  it('round-trips with formatCompact for typical values', () => {
    const values = [0, 99, 1_000, 1_500, 99_900, 100_000, 5_400_000];
    for (const v of values) {
      expect(parseCompact(formatCompact(v))).toBe(v);
    }
  });
});
