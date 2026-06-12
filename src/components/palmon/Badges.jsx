import { ELEMENT_BY_KEY, RARITY_BY_KEY } from '../../lib/data/palmon.js';
import { rarityBadgeClass } from '../../lib/data/rarity.js';

const ELEMENT_BADGE_CLASS = {
  fire: 'bg-red-500/15 text-red-300 ring-red-500/30',
  water: 'bg-sky-500/15 text-sky-300 ring-sky-500/30',
  earth: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
  electric: 'bg-amber-500/15 text-amber-300 ring-amber-500/30',
};

const MYTHICAL_BADGE_CLASS =
  'bg-fuchsia-500/15 text-fuchsia-300 ring-fuchsia-500/30';

const EVOLVED_BADGE_CLASS =
  'bg-rose-500/15 text-rose-300 ring-rose-500/30';

export function ElementBadge({ element }) {
  const meta = ELEMENT_BY_KEY[element];
  if (!meta) return null;
  const cls = ELEMENT_BADGE_CLASS[element] || 'bg-slate-700 text-slate-300';
  return <span className={`badge ${cls}`}>{meta.label}</span>;
}

export function RarityBadge({ rarity }) {
  const meta = RARITY_BY_KEY[rarity];
  if (!meta) return null;
  return <span className={`badge ${rarityBadgeClass(rarity)}`}>{meta.label}</span>;
}

export function MythicalBadge() {
  return <span className={`badge ${MYTHICAL_BADGE_CLASS}`}>Mythical</span>;
}

export function EvolvedBadge({ name }) {
  if (!name) return null;
  return <span className={`badge ${EVOLVED_BADGE_CLASS}`}>→ {name}</span>;
}
