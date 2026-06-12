// Single source of truth for rarity tier colors. Every badge or label
// representing UR / SSR / SR / R / N should resolve its classes through
// the helpers here so the palette stays consistent across the app.
//
// Tier keys are always uppercase: 'UR', 'SSR', 'SR', 'R', 'N'.

export const RARITY_TIERS = ['UR', 'SSR', 'SR', 'R', 'N'];

export const RARITY_BADGE_CLASS = {
  UR: 'bg-amber-500/15 text-amber-300 ring-amber-500/30',
  SSR: 'bg-purple-500/15 text-purple-300 ring-purple-500/30',
  SR: 'bg-sky-500/15 text-sky-300 ring-sky-500/30',
  R: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
  N: 'bg-slate-500/15 text-slate-300 ring-slate-500/30',
};

export const RARITY_TEXT_CLASS = {
  UR: 'text-amber-300',
  SSR: 'text-purple-300',
  SR: 'text-sky-300',
  R: 'text-emerald-300',
  N: 'text-slate-300',
};

const FALLBACK_BADGE = 'bg-slate-700 text-slate-300 ring-slate-500/30';
const FALLBACK_TEXT = 'text-slate-300';

export function rarityBadgeClass(tier) {
  return RARITY_BADGE_CLASS[tier] || FALLBACK_BADGE;
}

export function rarityTextClass(tier) {
  return RARITY_TEXT_CLASS[tier] || FALLBACK_TEXT;
}
