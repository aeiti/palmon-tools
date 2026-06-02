import { describe, expect, it } from 'vitest';
import {
  emptyMountEntry,
  emptyMounts,
  normalizeMountEntry,
  normalizeMounts,
} from '../mounts.js';
import {
  MAX_MOUNT_LEVEL,
  MOUNTS,
  mountSkillLevelFor,
} from '../data/mounts.js';

describe('emptyMounts / emptyMountEntry', () => {
  it('emptyMountEntry returns zeroed shape', () => {
    expect(emptyMountEntry()).toEqual({ level: 0, power: 0 });
  });

  it('emptyMounts returns all 7 catalog keys with zeroed entries', () => {
    const empty = emptyMounts();
    expect(Object.keys(empty).sort()).toEqual(
      MOUNTS.map((m) => m.key).sort(),
    );
    for (const key of Object.keys(empty)) {
      expect(empty[key]).toEqual({ level: 0, power: 0 });
    }
  });
});

describe('normalizeMountEntry', () => {
  it('returns empty entry for non-object input', () => {
    expect(normalizeMountEntry(null)).toEqual({ level: 0, power: 0 });
    expect(normalizeMountEntry(undefined)).toEqual({ level: 0, power: 0 });
    expect(normalizeMountEntry('garbage')).toEqual({ level: 0, power: 0 });
  });

  it('clamps level to [0, MAX_MOUNT_LEVEL]', () => {
    expect(normalizeMountEntry({ level: -5 })).toEqual({ level: 0, power: 0 });
    expect(normalizeMountEntry({ level: 0 })).toEqual({ level: 0, power: 0 });
    expect(normalizeMountEntry({ level: 50 })).toEqual({
      level: 50,
      power: 0,
    });
    expect(normalizeMountEntry({ level: MAX_MOUNT_LEVEL + 999 })).toEqual({
      level: MAX_MOUNT_LEVEL,
      power: 0,
    });
  });

  it('floors fractional levels', () => {
    expect(normalizeMountEntry({ level: 70.9 })).toEqual({
      level: 70,
      power: 0,
    });
  });

  it('drops negative / non-finite power, floors fractional power', () => {
    expect(normalizeMountEntry({ power: -100 })).toEqual({
      level: 0,
      power: 0,
    });
    expect(normalizeMountEntry({ power: Number.NaN })).toEqual({
      level: 0,
      power: 0,
    });
    expect(normalizeMountEntry({ power: 6_543_000.7 })).toEqual({
      level: 0,
      power: 6_543_000,
    });
  });

  it('returns a clean entry from partial input', () => {
    expect(normalizeMountEntry({ level: 70 })).toEqual({
      level: 70,
      power: 0,
    });
    expect(normalizeMountEntry({ power: 8700 })).toEqual({
      level: 0,
      power: 8700,
    });
  });
});

describe('normalizeMounts', () => {
  it('returns the empty shape for null / non-object input', () => {
    expect(normalizeMounts(null)).toEqual(emptyMounts());
    expect(normalizeMounts(undefined)).toEqual(emptyMounts());
    expect(normalizeMounts('garbage')).toEqual(emptyMounts());
  });

  it('fills missing keys with empties', () => {
    const out = normalizeMounts({ skyboundPatrol: { level: 70, power: 8700 } });
    expect(out.skyboundPatrol).toEqual({ level: 70, power: 8700 });
    expect(out.amourphibian).toEqual({ level: 0, power: 0 });
    expect(Object.keys(out)).toHaveLength(MOUNTS.length);
  });

  it('drops unknown keys (catalog churn safety)', () => {
    const out = normalizeMounts({
      skyboundPatrol: { level: 50, power: 1000 },
      retiredMount: { level: 99, power: 9999 },
    });
    expect(out).not.toHaveProperty('retiredMount');
    expect(out.skyboundPatrol).toEqual({ level: 50, power: 1000 });
  });

  it('clamps and floors per-entry', () => {
    const out = normalizeMounts({
      skyboundPatrol: { level: 999, power: -1 },
      narfoal: { level: 35.7, power: 4200.9 },
    });
    expect(out.skyboundPatrol).toEqual({
      level: MAX_MOUNT_LEVEL,
      power: 0,
    });
    expect(out.narfoal).toEqual({ level: 35, power: 4200 });
  });

  it('round-trips cleanly (normalize(normalize(x)) === normalize(x))', () => {
    const raw = {
      skyboundPatrol: { level: 70, power: 8700 },
      amourphibian: { level: 35, power: 4200 },
      swiftger: { level: 999, power: 1_000_000 }, // gets clamped
    };
    const first = normalizeMounts(raw);
    expect(normalizeMounts(first)).toEqual(first);
  });
});

describe('mountSkillLevelFor', () => {
  it('returns 0 below the L1 threshold', () => {
    expect(mountSkillLevelFor(0)).toBe(0);
    expect(mountSkillLevelFor(9)).toBe(0);
  });

  it('returns the right level at each threshold', () => {
    expect(mountSkillLevelFor(10)).toBe(1);
    expect(mountSkillLevelFor(30)).toBe(2);
    expect(mountSkillLevelFor(50)).toBe(3);
    expect(mountSkillLevelFor(70)).toBe(4);
    expect(mountSkillLevelFor(100)).toBe(5);
  });

  it('returns the active level between thresholds', () => {
    expect(mountSkillLevelFor(29)).toBe(1);
    expect(mountSkillLevelFor(49)).toBe(2);
    expect(mountSkillLevelFor(99)).toBe(4);
  });

  it('caps at 5 above the L5 threshold (catalog defends against off-by-one)', () => {
    expect(mountSkillLevelFor(101)).toBe(5);
    expect(mountSkillLevelFor(9999)).toBe(5);
  });
});
