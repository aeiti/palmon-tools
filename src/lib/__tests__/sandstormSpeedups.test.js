import { describe, expect, it } from 'vitest';
import {
  emptySandstormSpeedups,
  hasAnySandstormSpeedups,
  normalizeSandstormSpeedups,
  totalHealingMinutes,
  totalMarchCount,
} from '../sandstormSpeedups.js';

describe('emptySandstormSpeedups', () => {
  it('returns every catalog key at 0', () => {
    const state = emptySandstormSpeedups();
    expect(state['pep-pep-step']).toBe(0);
    expect(state['pep-step']).toBe(0);
    expect(state['sandstorm-healing-1h']).toBe(0);
    expect(state['sandstorm-healing-5m']).toBe(0);
  });
});

describe('normalizeSandstormSpeedups', () => {
  it('returns empty state for null / undefined / non-objects', () => {
    expect(normalizeSandstormSpeedups(null)).toEqual(emptySandstormSpeedups());
    expect(normalizeSandstormSpeedups(undefined)).toEqual(
      emptySandstormSpeedups(),
    );
    expect(normalizeSandstormSpeedups('nope')).toEqual(
      emptySandstormSpeedups(),
    );
  });

  it('passes through known keys with positive integer counts', () => {
    const state = normalizeSandstormSpeedups({
      'pep-pep-step': 3,
      'sandstorm-healing-1h': 7,
    });
    expect(state['pep-pep-step']).toBe(3);
    expect(state['sandstorm-healing-1h']).toBe(7);
    expect(state['pep-step']).toBe(0);
    expect(state['sandstorm-healing-5m']).toBe(0);
  });

  it('floors fractional counts', () => {
    expect(normalizeSandstormSpeedups({ 'pep-step': 2.9 })['pep-step']).toBe(2);
  });

  it('coerces string counts and zeros non-numeric values', () => {
    const state = normalizeSandstormSpeedups({
      'pep-step': '5',
      'pep-pep-step': 'abc',
    });
    expect(state['pep-step']).toBe(5);
    expect(state['pep-pep-step']).toBe(0);
  });

  it('zeros negative counts', () => {
    expect(
      normalizeSandstormSpeedups({ 'pep-step': -3 })['pep-step'],
    ).toBe(0);
  });

  it('drops unknown keys', () => {
    const state = normalizeSandstormSpeedups({
      'pep-step': 1,
      'not-a-real-key': 999,
    });
    expect(state['pep-step']).toBe(1);
    expect(state['not-a-real-key']).toBeUndefined();
  });

  it('round-trips empty state', () => {
    const empty = emptySandstormSpeedups();
    expect(normalizeSandstormSpeedups(empty)).toEqual(empty);
  });
});

describe('totalHealingMinutes', () => {
  it('returns 0 for null / undefined / empty', () => {
    expect(totalHealingMinutes(null)).toBe(0);
    expect(totalHealingMinutes(undefined)).toBe(0);
    expect(totalHealingMinutes(emptySandstormSpeedups())).toBe(0);
  });

  it('sums 60 minutes per 1h entry and 5 minutes per 5m entry', () => {
    expect(
      totalHealingMinutes({
        'sandstorm-healing-1h': 2,
        'sandstorm-healing-5m': 4,
      }),
    ).toBe(120 + 20);
  });

  it('ignores march-percent entries', () => {
    expect(
      totalHealingMinutes({ 'pep-pep-step': 100, 'pep-step': 200 }),
    ).toBe(0);
  });

  it('coerces string counts', () => {
    expect(totalHealingMinutes({ 'sandstorm-healing-1h': '3' })).toBe(180);
  });
});

describe('totalMarchCount', () => {
  it('returns 0 for null / undefined / empty', () => {
    expect(totalMarchCount(null)).toBe(0);
    expect(totalMarchCount(undefined)).toBe(0);
    expect(totalMarchCount(emptySandstormSpeedups())).toBe(0);
  });

  it('sums march-percent counts regardless of denomination', () => {
    expect(
      totalMarchCount({ 'pep-pep-step': 114, 'pep-step': 53 }),
    ).toBe(167);
  });

  it('ignores healing-time entries', () => {
    expect(
      totalMarchCount({
        'sandstorm-healing-1h': 48,
        'sandstorm-healing-5m': 383,
      }),
    ).toBe(0);
  });
});

describe('hasAnySandstormSpeedups', () => {
  it('returns false for null / undefined / empty', () => {
    expect(hasAnySandstormSpeedups(null)).toBe(false);
    expect(hasAnySandstormSpeedups(undefined)).toBe(false);
    expect(hasAnySandstormSpeedups(emptySandstormSpeedups())).toBe(false);
  });

  it('returns true for any positive march or healing entry', () => {
    expect(hasAnySandstormSpeedups({ 'pep-step': 1 })).toBe(true);
    expect(
      hasAnySandstormSpeedups({ 'sandstorm-healing-5m': 1 }),
    ).toBe(true);
  });
});
