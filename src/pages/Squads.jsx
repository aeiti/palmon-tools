import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useProfiles } from '../hooks/useProfiles.js';
import { profileLabel } from '../lib/profile.js';
import {
  ELEMENT_BY_KEY,
  MAX_PALMON_PER_SQUAD,
  PALMON_SPECIES_BY_KEY,
  RARITY_BY_KEY,
  SQUAD_COUNT,
  palmonDisplayName,
  palmonsInSquad,
} from '../lib/palmon.js';

const ELEMENT_BADGE_CLASS = {
  fire: 'bg-red-500/15 text-red-300 ring-red-500/30',
  water: 'bg-sky-500/15 text-sky-300 ring-sky-500/30',
  earth: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
  electric: 'bg-amber-500/15 text-amber-300 ring-amber-500/30',
};

const RARITY_BADGE_CLASS = {
  common: 'bg-slate-500/15 text-slate-300 ring-slate-500/30',
  rare: 'bg-blue-500/15 text-blue-300 ring-blue-500/30',
  epic: 'bg-purple-500/15 text-purple-300 ring-purple-500/30',
  legendary: 'bg-orange-500/15 text-orange-300 ring-orange-500/30',
  mythical: 'bg-fuchsia-500/15 text-fuchsia-300 ring-fuchsia-500/30',
};

function Badge({ cls, label }) {
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ring-1 ${cls}`}
    >
      {label}
    </span>
  );
}

function PalmonRow({ palmon, allPalmons }) {
  const species = PALMON_SPECIES_BY_KEY[palmon.speciesKey];
  const elementMeta = species ? ELEMENT_BY_KEY[species.element] : null;
  const rarityMeta = species?.rarity ? RARITY_BY_KEY[species.rarity] : null;
  const displayName = palmonDisplayName(palmon, allPalmons);

  return (
    <Link
      to={`/palmon#palmon-${palmon.id}`}
      className="flex items-center justify-between gap-2 rounded bg-slate-800/60 px-3 py-2 ring-1 ring-slate-700 hover:bg-slate-800 hover:ring-indigo-400"
    >
      <div className="flex min-w-0 items-center gap-2">
        <span className="truncate text-sm font-medium text-slate-100">
          {displayName}
        </span>
        {elementMeta && (
          <Badge
            cls={ELEMENT_BADGE_CLASS[species.element]}
            label={elementMeta.label}
          />
        )}
        {rarityMeta && (
          <Badge
            cls={RARITY_BADGE_CLASS[species.rarity]}
            label={rarityMeta.label}
          />
        )}
      </div>
      <div className="flex shrink-0 items-center gap-3 text-xs text-slate-400 tabular-nums">
        <span>
          <span className="text-slate-500">Lv</span> {palmon.level || 0}
        </span>
        <span>
          <span className="text-slate-500">★</span> {palmon.star}-
          {palmon.subStar}
        </span>
      </div>
    </Link>
  );
}

function SquadCard({ squadNumber, palmons, hashTarget }) {
  const members = palmonsInSquad(palmons, squadNumber);
  const cardRef = useRef(null);
  const anchorId = `squad-${squadNumber}`;
  const emptySlots = Math.max(0, MAX_PALMON_PER_SQUAD - members.length);

  useEffect(() => {
    if (hashTarget === anchorId) {
      cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [hashTarget, anchorId]);

  return (
    <section
      ref={cardRef}
      id={anchorId}
      className="rounded-lg ring-1 ring-slate-700"
    >
      <header className="flex items-center justify-between gap-2 bg-slate-800/80 px-3 py-2">
        <h2 className="text-sm font-semibold text-slate-100">
          Squad {squadNumber}
        </h2>
        <span
          className={`tabular-nums text-xs ${
            members.length >= MAX_PALMON_PER_SQUAD
              ? 'text-amber-300'
              : 'text-slate-400'
          }`}
        >
          {members.length} / {MAX_PALMON_PER_SQUAD}
        </span>
      </header>
      <div className="flex flex-col gap-1.5 bg-slate-900/40 px-3 py-3">
        {members.length === 0 ? (
          <p className="text-center text-sm text-slate-500">
            No Palmon assigned. Open{' '}
            <Link to="/palmon" className="text-indigo-300 underline hover:text-indigo-200">
              Palmon
            </Link>{' '}
            and set a squad on one of your Palmon.
          </p>
        ) : (
          <>
            {members.map((pm) => (
              <PalmonRow key={pm.id} palmon={pm} allPalmons={palmons} />
            ))}
            {Array.from({ length: emptySlots }, (_, i) => (
              <div
                key={`empty-${i}`}
                className="flex items-center justify-center rounded bg-slate-800/30 px-3 py-2 text-xs text-slate-600 ring-1 ring-dashed ring-slate-800"
              >
                Empty slot
              </div>
            ))}
          </>
        )}
      </div>
    </section>
  );
}

export default function Squads() {
  const { profiles, activeProfile, setActiveProfile } = useProfiles();
  const { hash } = useLocation();
  const hashTarget = hash.startsWith('#') ? hash.slice(1) : '';

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-xl font-semibold text-slate-100 sm:text-2xl">
          Squads
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Each squad holds up to {MAX_PALMON_PER_SQUAD} Palmon. Assign squad on
          the{' '}
          <Link to="/palmon" className="text-indigo-300 underline hover:text-indigo-200">
            Palmon page
          </Link>
          .
        </p>
      </header>

      {profiles.length > 1 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg bg-slate-800/60 p-3 ring-1 ring-slate-700">
          <label className="text-sm text-slate-300">Profile</label>
          <select
            value={activeProfile.id}
            onChange={(e) => setActiveProfile(e.target.value)}
            className="min-w-0 flex-1 rounded bg-slate-700 px-2 py-1.5 text-sm text-slate-100 ring-1 ring-slate-600 focus:outline-none focus:ring-indigo-400 sm:flex-none"
          >
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {profileLabel(p)}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: SQUAD_COUNT }, (_, i) => (
          <SquadCard
            key={i + 1}
            squadNumber={i + 1}
            palmons={activeProfile.palmons}
            hashTarget={hashTarget}
          />
        ))}
      </div>
    </div>
  );
}
