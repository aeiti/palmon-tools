import { describe, expect, it } from 'vitest';
import {
  COOLDOWN_KEYS,
  emptyPlanner,
  HOSPITAL_CAP,
  normalizePlanner,
  normalizeQueueItem,
  nudgeFireTimestamp,
  QUEUE_SLOTS,
} from '../plannerState.js';

describe('emptyPlanner', () => {
  it('has all ten queue slots, three cooldowns, and defaults', () => {
    const p = emptyPlanner();
    expect(Object.keys(p.queues)).toHaveLength(10);
    expect(QUEUE_SLOTS.every((s) => p.queues[s.key])).toBe(true);
    expect(Object.keys(p.cooldowns)).toEqual(COOLDOWN_KEYS);
    expect(p.hospitalFill).toBe(0);
    expect(p.weighting).toBe(50);
  });
});

describe('normalizeQueueItem', () => {
  it('caps the name but does not trim (so spaces survive typing)', () => {
    // Internal spaces and an in-progress trailing space are preserved — the
    // runtime pass must not eat the space between words as you type.
    expect(normalizeQueueItem({ name: 'Barracks Lv 12' }).name).toBe(
      'Barracks Lv 12',
    );
    expect(normalizeQueueItem({ name: 'Barracks ' }).name).toBe('Barracks ');
    expect(normalizeQueueItem({ name: 'x'.repeat(200) }).name).toHaveLength(80);
  });

  it('keeps a valid ISO completesAt, nulls anything else', () => {
    expect(
      normalizeQueueItem({ completesAt: '2026-08-10T00:00:00Z' }).completesAt,
    ).toBe('2026-08-10T00:00:00Z');
    expect(normalizeQueueItem({ completesAt: 'not-a-date' }).completesAt).toBeNull();
    expect(normalizeQueueItem({}).completesAt).toBeNull();
  });

  it('never rejects a partial edit (permissive runtime normalize)', () => {
    expect(normalizeQueueItem({ name: 'WIP' })).toEqual({
      name: 'WIP',
      completesAt: null,
    });
  });
});

describe('normalizePlanner', () => {
  it('fills all slots/cooldowns from empty/garbage input', () => {
    const p = normalizePlanner(undefined);
    expect(Object.keys(p.queues)).toHaveLength(10);
    expect(p.cooldowns).toEqual({
      instabuild: null,
      'instant-build': null,
      'instant-research': null,
    });
  });

  it('clamps hospitalFill into [0, cap] and weighting into [0, 100]', () => {
    expect(normalizePlanner({ hospitalFill: -5 }).hospitalFill).toBe(0);
    expect(normalizePlanner({ hospitalFill: 999999 }).hospitalFill).toBe(
      HOSPITAL_CAP,
    );
    expect(normalizePlanner({ weighting: 250 }).weighting).toBe(100);
    expect(normalizePlanner({ weighting: 'abc' }).weighting).toBe(50);
  });

  it('drops unknown queue keys and preserves known ones', () => {
    const p = normalizePlanner({
      queues: {
        B1: { name: 'Wall', completesAt: '2026-08-10T00:00:00Z' },
        BOGUS: { name: 'ignored' },
      },
    });
    expect(p.queues.B1.name).toBe('Wall');
    expect(p.queues.BOGUS).toBeUndefined();
    expect(p.queues.T4).toEqual({ name: '', completesAt: null });
  });

  it('trims queue names at load, preserving internal spaces', () => {
    const p = normalizePlanner({
      queues: { B1: { name: '  Barracks Lv 12  ' } },
    });
    expect(p.queues.B1.name).toBe('Barracks Lv 12');
  });

  it('round-trips: normalize(normalize(x)) === normalize(x)', () => {
    const once = normalizePlanner({
      queues: { B1: { name: 'Wall', completesAt: '2026-08-10T00:00:00Z' } },
      cooldowns: { instabuild: '2026-08-09T12:00:00Z' },
      hospitalFill: 5000,
      weighting: 30,
    });
    expect(normalizePlanner(once)).toEqual(once);
  });
});

describe('nudgeFireTimestamp', () => {
  const NOW = Date.parse('2026-08-11T12:00:00Z');

  it('shifts an existing timestamp earlier or later', () => {
    const t = '2026-08-11T10:00:00Z';
    expect(nudgeFireTimestamp(t, -60, NOW)).toBe(
      new Date(Date.parse(t) - 3600000).toISOString(),
    );
    expect(nudgeFireTimestamp(t, 30, NOW)).toBe(
      new Date(Date.parse(t) + 1800000).toISOString(),
    );
  });

  it('clamps to now — a fire time can’t be in the future', () => {
    const t = '2026-08-11T11:50:00Z'; // +60m would overshoot now
    expect(nudgeFireTimestamp(t, 60, NOW)).toBe(new Date(NOW).toISOString());
  });

  it('falls back to now when there is no timestamp (−1h = fired an hour ago)', () => {
    expect(nudgeFireTimestamp(null, -60, NOW)).toBe(
      new Date(NOW - 3600000).toISOString(),
    );
  });
});
