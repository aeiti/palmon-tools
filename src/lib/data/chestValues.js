// Per-chest reward amounts. Pure data — edit this file when in-game values
// change. The math that turns these into totals lives in resourceTotals.js.

// ---- Standard chests (do not scale with player level) -----------------------
// A single standard chest gives the tier amount of whichever resource it is
// (e.g. a standard UR Gold chest = 3M Gold; a standard UR XP chest = 3M XP).
const STANDARD_TIER_AMOUNT = {
  gold:   3_000_000, // UR
  purple: 1_000_000, // SSR
  blue:     100_000, // SR
  green:     10_000, // R
};

function flatTier(amount) {
  return {
    xp: amount,
    electricity: amount,
    gold: amount,
    lumber: amount,
    steel: amount,
  };
}

export const STANDARD_CHEST_VALUES = {
  gold:   flatTier(STANDARD_TIER_AMOUNT.gold),
  purple: flatTier(STANDARD_TIER_AMOUNT.purple),
  blue:   flatTier(STANDARD_TIER_AMOUNT.blue),
  green:  flatTier(STANDARD_TIER_AMOUNT.green),
};

// ---- Leveled chests ---------------------------------------------------------
// Per-resource value of a single leveled chest at the anchor player level,
// broken out per tier. Levels below the anchor are interpolated against the
// L1 floor (and the L26 mid-anchor where data exists); levels above reuse the
// anchor row until real data lands.
export const LEVELED_ANCHOR_LEVEL = 30;
export const LEVELED_MIN_LEVEL = 1;

// Floor of the linear taper applied to levels < anchor (level 1 = this %).
export const LEVELED_MIN_LEVEL_SCALE = 0.5;

export const LEVELED_BASE_BY_TIER = {
  gold: { // UR
    xp: 5_400_000,
    electricity: 1_000_000,
    gold: 4_200_000,
    lumber: 4_200_000,
    steel: 4_200_000,
  },
  purple: { // SSR
    xp: 1_800_000,
    electricity: 340_000,
    gold: 1_400_000,
    lumber: 1_400_000,
    steel: 1_400_000,
  },
  blue: { // SR
    xp: 225_000,
    electricity: 43_700,
    gold: 175_000,
    lumber: 175_000,
    steel: 175_000,
  },
};

// Optional mid-curve anchor: known values at a player level between L1 and the
// main anchor. Where a (tier, resource) entry exists here, the scaling becomes
// piecewise linear (L1 floor → L26 → L30) instead of the single-segment taper.
// Only resources with real in-game data should appear here.
export const LEVELED_SECONDARY_ANCHOR_LEVEL = 26;

export const LEVELED_SECONDARY_ANCHORS_BY_TIER = {
  gold: { // UR
    xp: 4_600_000,
    electricity: 940_000,
  },
  purple: { // SSR
    xp: 1_500_000,
    electricity: 310_000,
  },
  blue: { // SR
    xp: 195_000,
    electricity: 39_100,
  },
};
