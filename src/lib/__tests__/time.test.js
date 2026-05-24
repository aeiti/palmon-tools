import { describe, expect, it } from 'vitest';
import {
  dhmToMinutes,
  formatDHM,
  formatDecimalHours,
} from '../time.js';

describe('formatDHM', () => {
  it('returns "0m" for 0', () => {
    expect(formatDHM(0)).toBe('0m');
  });

  it('clamps negatives to 0m', () => {
    expect(formatDHM(-30)).toBe('0m');
  });

  it('floors fractional minutes', () => {
    expect(formatDHM(59.9)).toBe('59m');
  });

  it('formats minutes only', () => {
    expect(formatDHM(45)).toBe('45m');
  });

  it('formats hours + minutes', () => {
    expect(formatDHM(65)).toBe('1h 5m');
  });

  it('omits minutes when they are zero', () => {
    expect(formatDHM(120)).toBe('2h');
  });

  it('formats days + hours + minutes', () => {
    expect(formatDHM(1440 + 60 + 5)).toBe('1d 1h 5m');
  });

  it('omits hours when zero but keeps days + minutes', () => {
    expect(formatDHM(1440 + 5)).toBe('1d 5m');
  });

  it('shows minutes when nonzero and other units are present', () => {
    expect(formatDHM(2 * 1440 + 3 * 60 + 7)).toBe('2d 3h 7m');
  });
});

describe('formatDecimalHours', () => {
  it('formats whole hours', () => {
    expect(formatDecimalHours(120)).toBe('2.00 h');
  });

  it('formats fractional hours', () => {
    expect(formatDecimalHours(90)).toBe('1.50 h');
  });
});

describe('dhmToMinutes', () => {
  it('combines days, hours, and minutes', () => {
    expect(dhmToMinutes({ days: 1, hours: 2, minutes: 3 })).toBe(
      1440 + 120 + 3,
    );
  });

  it('treats missing fields as zero', () => {
    expect(dhmToMinutes({ hours: 5 })).toBe(300);
    expect(dhmToMinutes({})).toBe(0);
  });

  it('coerces string inputs', () => {
    expect(dhmToMinutes({ days: '1', hours: '0', minutes: '30' })).toBe(
      1440 + 30,
    );
  });

  it('treats non-numeric strings as zero', () => {
    expect(dhmToMinutes({ days: 'abc', hours: 1 })).toBe(60);
  });
});
