import { describe, expect, it } from 'vitest';
import {
  RARITY_BADGE_CLASS,
  RARITY_TEXT_CLASS,
  RARITY_TIERS,
  rarityBadgeClass,
  rarityTextClass,
} from '../data/rarity.js';

describe('RARITY_TIERS', () => {
  it('lists all five tiers in power-descending order', () => {
    expect(RARITY_TIERS).toEqual(['UR', 'SSR', 'SR', 'R', 'N']);
  });
});

describe('rarityBadgeClass', () => {
  it('returns the badge triple for each known tier', () => {
    expect(rarityBadgeClass('UR')).toBe(
      'bg-amber-500/15 text-amber-300 ring-amber-500/30',
    );
    expect(rarityBadgeClass('SSR')).toBe(
      'bg-purple-500/15 text-purple-300 ring-purple-500/30',
    );
    expect(rarityBadgeClass('SR')).toBe(
      'bg-sky-500/15 text-sky-300 ring-sky-500/30',
    );
    expect(rarityBadgeClass('R')).toBe(
      'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
    );
    expect(rarityBadgeClass('N')).toBe(
      'bg-slate-500/15 text-slate-300 ring-slate-500/30',
    );
  });

  it('returns a slate fallback for unknown tiers', () => {
    const fallback = 'bg-slate-700 text-slate-300 ring-slate-500/30';
    expect(rarityBadgeClass('XR')).toBe(fallback);
    expect(rarityBadgeClass('')).toBe(fallback);
    expect(rarityBadgeClass(null)).toBe(fallback);
    expect(rarityBadgeClass(undefined)).toBe(fallback);
  });

  it('is case-sensitive (canonical keys are uppercase)', () => {
    const fallback = 'bg-slate-700 text-slate-300 ring-slate-500/30';
    expect(rarityBadgeClass('ur')).toBe(fallback);
    expect(rarityBadgeClass('ssr')).toBe(fallback);
  });
});

describe('rarityTextClass', () => {
  it('returns the text-only class for each known tier', () => {
    expect(rarityTextClass('UR')).toBe('text-amber-300');
    expect(rarityTextClass('SSR')).toBe('text-purple-300');
    expect(rarityTextClass('SR')).toBe('text-sky-300');
    expect(rarityTextClass('R')).toBe('text-emerald-300');
    expect(rarityTextClass('N')).toBe('text-slate-300');
  });

  it('returns a slate fallback for unknown tiers', () => {
    expect(rarityTextClass('XR')).toBe('text-slate-300');
    expect(rarityTextClass(null)).toBe('text-slate-300');
  });
});

describe('exported maps', () => {
  it('cover every tier listed in RARITY_TIERS', () => {
    for (const tier of RARITY_TIERS) {
      expect(RARITY_BADGE_CLASS[tier]).toBeTruthy();
      expect(RARITY_TEXT_CLASS[tier]).toBeTruthy();
    }
  });
});
