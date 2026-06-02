// Sandstorm-event speedup catalog data. Pure facts about the four event-
// scoped items — edit this file when the in-game catalog changes. State
// helpers (totals, normalize) live in src/lib/sandstormSpeedups.js.
//
// These items render as a distinct section on the Speedups page but use
// a different shape from src/lib/data/speedups.js. The march entries are
// percentage-based (no time component at all); the healing entries are
// time-based but scoped to a single event (Sandstorm Scuffle), so they
// can't be folded into the general Healing totals without misleading the
// user about what's spendable where.
//
// Keys are append-only — once a key is in use, renaming it strands user
// data (load-time normalize zeroes out any key not listed here).

export const SANDSTORM_SPEEDUPS = [
  {
    key: 'pep-pep-step',
    label: 'Pep-Pep Step',
    tag: 'Sandstorm',
    type: 'march-percent',
    percent: 50,
    description: 'Reduces march time by 50% (Sandstorm Scuffle only).',
  },
  {
    key: 'pep-step',
    label: 'Pep Step',
    tag: 'Sandstorm',
    type: 'march-percent',
    percent: 25,
    description: 'Reduces march time by 25% (Sandstorm Scuffle only).',
  },
  {
    key: 'sandstorm-healing-1h',
    label: '1h Healing Speedup',
    tag: 'Desert',
    type: 'healing-time',
    minutes: 60,
    description: 'Reduces Sandstorm Scuffle healing queue by 1h.',
  },
  {
    key: 'sandstorm-healing-5m',
    label: '5 min Healing Speedup',
    tag: 'Desert',
    type: 'healing-time',
    minutes: 5,
    description: 'Reduces Sandstorm Scuffle healing queue by 5 min.',
  },
];
