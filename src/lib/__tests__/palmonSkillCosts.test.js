import { describe, expect, it } from 'vitest';
import {
  PALMON_SKILL_UPGRADE_COST_BY_LEVEL,
  PALMON_SKILL_UPGRADE_COST_OBSERVATIONS,
  skillUpgradeCost,
} from '../data/palmonSkillCosts.js';

describe('skill upgrade cost is universal', () => {
  // The load-bearing test. The file used to claim cost was per-(species, slot),
  // which implied a 6,728-cell table that was 2.2% filled. It is really a
  // 29-entry lookup on the source level alone. If a future capture genuinely
  // contradicts that, this fails and the claim gets re-examined — rather than
  // the per-species model quietly coming back.
  it('every source level has exactly one cost, across all species and slots', () => {
    const byLevel = new Map();
    for (const row of PALMON_SKILL_UPGRADE_COST_OBSERVATIONS) {
      if (!byLevel.has(row.fromLevel)) byLevel.set(row.fromLevel, new Map());
      byLevel.get(row.fromLevel).set(row.cost, row);
    }
    const conflicts = [...byLevel.entries()]
      .filter(([, costs]) => costs.size > 1)
      .map(([level, costs]) => ({ level, rows: [...costs.values()] }));
    expect(conflicts).toEqual([]);
  });

  it('observations span more than one species and slot at a shared level', () => {
    // Guards the test above from being vacuous: an invariant over one row per
    // level would hold trivially. Level 1 is the densest, so assert it really
    // does cover many species and more than one slot.
    const atLevelOne = PALMON_SKILL_UPGRADE_COST_OBSERVATIONS.filter(
      (r) => r.fromLevel === 1,
    );
    expect(new Set(atLevelOne.map((r) => r.species)).size).toBeGreaterThan(20);
    expect(new Set(atLevelOne.map((r) => r.slot)).size).toBeGreaterThan(1);
  });

  it('the derived table agrees with every observation', () => {
    for (const row of PALMON_SKILL_UPGRADE_COST_OBSERVATIONS) {
      expect(skillUpgradeCost(row.fromLevel)).toBe(row.cost);
    }
  });
});

describe('skillUpgradeCost', () => {
  it('returns the cost for a captured step', () => {
    expect(skillUpgradeCost(1)).toBe(100);
    expect(skillUpgradeCost(3)).toBe(300);
    expect(skillUpgradeCost(25)).toBe(7000);
  });

  it('covers every step from 1 to 29 with no gaps', () => {
    // The table was 16 of 29 steps until the in-game cost table closed the
    // rest. A gap would mean unknown; returning 0 would read as "free".
    const missing = Array.from({ length: 29 }, (_, i) => i + 1).filter(
      (level) => skillUpgradeCost(level) === null,
    );
    expect(missing).toEqual([]);
  });

  it('returns null outside the level range rather than guessing', () => {
    // 30 is the max skill level, so there is no step out of it.
    expect(skillUpgradeCost(30)).toBeNull();
    expect(skillUpgradeCost(0)).toBeNull();
    expect(skillUpgradeCost(999)).toBeNull();
  });

  it('cost rises monotonically across the captured steps', () => {
    const levels = Object.keys(PALMON_SKILL_UPGRADE_COST_BY_LEVEL)
      .map(Number)
      .sort((a, b) => a - b);
    for (let i = 1; i < levels.length; i += 1) {
      expect(PALMON_SKILL_UPGRADE_COST_BY_LEVEL[levels[i]]).toBeGreaterThan(
        PALMON_SKILL_UPGRADE_COST_BY_LEVEL[levels[i - 1]],
      );
    }
  });
});
