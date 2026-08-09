import { describe, expect, it } from 'vitest';
import {
  anchorExpired,
  doubleDipWindows,
  duelThemeAt,
  fotpSlotAt,
  fotpSlotIndexAt,
  fotpSlots,
  nowStrip,
  serverParts,
} from '../planner.js';
import realSchedule from '../../../public/schedule.json';

// Self-contained fixture so these tests don't move when the real schedule.json
// is re-anchored. Mirrors the real shape: -2 offset, 5-stage rotation, the
// August anchor (Day 1 = Fri Aug 7 00:00 UTC-2, opening on Spend AP).
const S = {
  gameClock: { utcOffsetHours: -2 },
  duel: {
    days: [
      { weekday: 0, key: 'sun', theme: 'Rest day', off: true, tags: [] },
      { weekday: 1, key: 'mon', theme: 'Complete Intel Quests', tags: ['intel'] },
      { weekday: 2, key: 'tue', theme: 'Build Up Your Camp', tags: ['building'] },
      { weekday: 3, key: 'wed', theme: 'Research Techs', tags: ['tech'] },
      { weekday: 4, key: 'thu', theme: 'Upgrade Palmon', tags: ['palmon'] },
      {
        weekday: 5,
        key: 'fri',
        theme: 'Prepare for Battle',
        tags: ['building', 'tech', 'training', 'healing'],
      },
      {
        weekday: 6,
        key: 'sat',
        theme: 'Defeat Enemies',
        tags: ['building', 'tech', 'training', 'healing', 'combat'],
      },
    ],
  },
  fotp: {
    rotation: {
      order: [
        'upgrade-palmon',
        'upgrade-buildings',
        'train-armigo',
        'research-techs',
        'spend-ap',
      ],
      slotHours: 4,
      slotsPerDay: 6,
    },
    anchor: {
      day1DateTime: '2026-08-07T00:00:00-02:00',
      day1StartStage: 'spend-ap',
      expires: '2026-08-21T00:00:00-02:00',
    },
    stages: {
      'upgrade-palmon': { label: 'Upgrade Palmon', tags: ['palmon'], source: 'verified' },
      'upgrade-buildings': { label: 'Upgrade Buildings', tags: ['building'], source: 'verified' },
      'train-armigo': { label: 'Train Armigo', tags: ['training'], source: 'estimated' },
      'research-techs': { label: 'Research Techs', tags: ['tech'], source: 'estimated' },
      'spend-ap': { label: 'Spend AP', tags: ['ap'], source: 'verified' },
    },
  },
};

const ANCHOR = new Date('2026-08-07T00:00:00-02:00'); // 02:00 UTC
const HOUR = 3600 * 1000;

describe('serverParts', () => {
  it('recovers server-local weekday at the anchor (Fri Aug 7)', () => {
    expect(serverParts(S, ANCHOR).weekday).toBe(5);
    expect(serverParts(S, ANCHOR).hour).toBe(0);
  });

  it('applies the -2 offset (23:00 UTC is 21:00 server, same day)', () => {
    const d = new Date('2026-08-07T23:00:00Z'); // 21:00 server Aug 7 (Fri)
    expect(serverParts(S, d)).toMatchObject({ weekday: 5, hour: 21 });
  });

  it('rolls the server weekday back across the UTC-2 boundary', () => {
    const d = new Date('2026-08-08T01:00:00Z'); // 23:00 server Aug 7 (still Fri)
    expect(serverParts(S, d)).toMatchObject({ weekday: 5, hour: 23 });
  });
});

describe('duelThemeAt', () => {
  it('returns Friday theme at the anchor', () => {
    expect(duelThemeAt(S, ANCHOR).key).toBe('fri');
  });

  it('returns the off day on Sunday', () => {
    const sun = new Date(ANCHOR.getTime() + 2 * 24 * HOUR); // Aug 9 = Sunday
    expect(duelThemeAt(S, sun)).toMatchObject({ key: 'sun', off: true });
  });
});

describe('fotpSlotIndexAt / fotpSlotAt', () => {
  it('is slot 0 at the anchor and opens on the anchor stage', () => {
    expect(fotpSlotIndexAt(S, ANCHOR)).toBe(0);
    expect(fotpSlotAt(S, ANCHOR).stageKey).toBe('spend-ap');
  });

  it('advances one stage per 4h slot', () => {
    expect(fotpSlotAt(S, new Date(ANCHOR.getTime() + 4 * HOUR)).stageKey).toBe(
      'upgrade-palmon',
    );
    expect(fotpSlotAt(S, new Date(ANCHOR.getTime() + 8 * HOUR)).stageKey).toBe(
      'upgrade-buildings',
    );
  });

  it('advances one stage per day (6 slots later, +1 in the cycle)', () => {
    const nextDay = new Date(ANCHOR.getTime() + 24 * HOUR);
    expect(fotpSlotIndexAt(S, nextDay)).toBe(6);
    // Day 1 opened on spend-ap (index 4); day 2 opens on upgrade-palmon (index 0).
    expect(fotpSlotAt(S, nextDay).stageKey).toBe('upgrade-palmon');
  });

  it('handles instants before the anchor via periodic wrap', () => {
    const before = new Date(ANCHOR.getTime() - 1 * HOUR);
    expect(fotpSlotIndexAt(S, before)).toBe(-1);
    // slot -1 = order[(4 - 1) mod 5] = research-techs
    expect(fotpSlotAt(S, before).stageKey).toBe('research-techs');
  });

  it('reports slot start/end aligned to the 4h grid', () => {
    const mid = new Date(ANCHOR.getTime() + 5 * HOUR); // inside slot 1
    const slot = fotpSlotAt(S, mid);
    expect(slot.index).toBe(1);
    expect(slot.start.getTime()).toBe(ANCHOR.getTime() + 4 * HOUR);
    expect(slot.end.getTime()).toBe(ANCHOR.getTime() + 8 * HOUR);
  });
});

describe('fotpSlots', () => {
  it('returns count consecutive slots starting from the containing slot', () => {
    const slots = fotpSlots(S, new Date(ANCHOR.getTime() + 5 * HOUR), 3);
    expect(slots.map((s) => s.index)).toEqual([1, 2, 3]);
    expect(slots.map((s) => s.stageKey)).toEqual([
      'upgrade-palmon',
      'upgrade-buildings',
      'train-armigo',
    ]);
  });
});

describe('doubleDipWindows', () => {
  const windows = doubleDipWindows(S, ANCHOR, 7);

  it('only returns windows with a real tag overlap on a scoring day', () => {
    expect(windows.length).toBeGreaterThan(0);
    for (const w of windows) {
      expect(w.tags.length).toBeGreaterThan(0);
      expect(w.duelKey).not.toBe('sun');
    }
  });

  it('never surfaces Spend AP (no Duel day scores AP)', () => {
    expect(windows.some((w) => w.stageKey === 'spend-ap')).toBe(false);
  });

  it('surfaces an Upgrade Buildings slot on a building-scoring Duel day', () => {
    const ub = windows.filter((w) => w.stageKey === 'upgrade-buildings');
    expect(ub.length).toBeGreaterThan(0);
    for (const w of ub) {
      expect(['tue', 'fri', 'sat']).toContain(w.duelKey);
      expect(w.tags).toContain('building');
    }
  });

  it('carries the stage source flag through for UI flagging', () => {
    const armigo = windows.find((w) => w.stageKey === 'train-armigo');
    if (armigo) expect(armigo.stageSource).toBe('estimated');
  });
});

describe('anchorExpired', () => {
  it('is false before the expiry and true at/after it', () => {
    expect(anchorExpired(S, ANCHOR)).toBe(false);
    expect(anchorExpired(S, new Date('2026-08-22T00:00:00-02:00'))).toBe(true);
  });
});

describe('nowStrip', () => {
  it('bundles the live FotP slot, Duel theme, and expiry flag', () => {
    const strip = nowStrip(S, ANCHOR);
    expect(strip.fotp.stageKey).toBe('spend-ap');
    expect(strip.duel.key).toBe('fri');
    expect(strip.anchorExpired).toBe(false);
  });
});

describe('real schedule.json integration', () => {
  it('parses and exposes the required top-level shape', () => {
    expect(realSchedule.gameClock.utcOffsetHours).toBe(-2);
    expect(realSchedule.fotp.rotation.order).toHaveLength(5);
    expect(realSchedule.duel.days).toHaveLength(7);
  });

  it('anchor stage is a member of the rotation order', () => {
    expect(realSchedule.fotp.rotation.order).toContain(
      realSchedule.fotp.anchor.day1StartStage,
    );
  });

  it('every rotation stage has a defined stage block', () => {
    for (const key of realSchedule.fotp.rotation.order) {
      expect(realSchedule.fotp.stages[key]).toBeDefined();
    }
  });
});
