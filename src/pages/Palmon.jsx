import { useState } from 'react';
import { useProfiles } from '../hooks/useProfiles.js';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { profileLabel } from '../lib/profile.js';
import {
  ELEMENT_BY_KEY,
  EQUIPMENT_SLOTS,
  MAX_PALMON_LEVEL,
  MAX_SKILL_LEVEL,
  PALMON_SPECIES,
  PALMON_SPECIES_BY_KEY,
  SKILL_SLOTS,
  SQUAD_COUNT,
  STAR_LEVELS,
  SUB_STAR_LEVELS,
  TRAIT_SLOTS,
  palmonDisplayName,
  placeholderEquipmentName,
  placeholderSkillName,
  placeholderTraitName,
} from '../lib/palmon.js';

const ELEMENT_BADGE_CLASS = {
  fire: 'bg-red-500/15 text-red-300 ring-red-500/30',
  water: 'bg-sky-500/15 text-sky-300 ring-sky-500/30',
  earth: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
  electric: 'bg-amber-500/15 text-amber-300 ring-amber-500/30',
};

function ElementBadge({ element }) {
  const meta = ELEMENT_BY_KEY[element];
  if (!meta) return null;
  const cls = ELEMENT_BADGE_CLASS[element] || 'bg-slate-700 text-slate-300';
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ring-1 ${cls}`}
    >
      {meta.label}
    </span>
  );
}

function NumberField({ label, value, max, onChange, ariaLabel }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <input
        type="number"
        inputMode="numeric"
        min="0"
        max={max}
        value={value || ''}
        placeholder="0"
        onChange={(e) => onChange(e.target.value)}
        onFocus={(e) => e.target.select()}
        aria-label={ariaLabel || label}
        className="h-8 w-full rounded bg-slate-800 px-2 text-center tabular-nums text-sm text-slate-100 ring-1 ring-slate-700 focus:outline-none focus:ring-indigo-400"
      />
    </label>
  );
}

function SelectField({ label, value, onChange, options, ariaLabel }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <select
        value={value === null || value === undefined ? '' : value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel || label}
        className="h-8 w-full rounded bg-slate-800 px-2 text-sm text-slate-100 ring-1 ring-slate-700 focus:outline-none focus:ring-indigo-400"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextField({ label, value, onChange, placeholder, ariaLabel }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <input
        type="text"
        value={value || ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel || label}
        className="h-8 w-full rounded bg-slate-800 px-2 text-sm text-slate-100 ring-1 ring-slate-700 focus:outline-none focus:ring-indigo-400"
      />
    </label>
  );
}

const STAR_OPTIONS = Array.from({ length: STAR_LEVELS }, (_, i) => ({
  value: String(i + 1),
  label: String(i + 1),
}));
const SUB_STAR_OPTIONS = Array.from({ length: SUB_STAR_LEVELS }, (_, i) => ({
  value: String(i + 1),
  label: String(i + 1),
}));
const SQUAD_OPTIONS = [
  { value: '', label: 'None' },
  ...Array.from({ length: SQUAD_COUNT }, (_, i) => ({
    value: String(i + 1),
    label: `Squad ${i + 1}`,
  })),
];

function PalmonCard({ palmon, allPalmons, onChange, onDelete }) {
  const species = PALMON_SPECIES_BY_KEY[palmon.speciesKey];
  const [expanded, setExpanded] = useState(false);
  const displayName = palmonDisplayName(palmon, allPalmons);

  return (
    <div className="rounded-lg ring-1 ring-slate-700">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-2 bg-slate-800/80 px-3 py-2 text-left hover:bg-slate-800"
        aria-expanded={expanded}
      >
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm font-semibold text-slate-100">
            {displayName}
          </span>
          {species && <ElementBadge element={species.element} />}
        </div>
        <div className="flex shrink-0 items-center gap-3 text-xs text-slate-400 tabular-nums">
          <span>
            <span className="text-slate-500">Lv</span> {palmon.level || 0}
          </span>
          <span>
            <span className="text-slate-500">★</span> {palmon.star}-
            {palmon.subStar}
          </span>
          {palmon.squad && (
            <span className="rounded bg-indigo-500/15 px-1.5 py-0.5 text-indigo-300 ring-1 ring-indigo-500/30">
              Squad {palmon.squad}
            </span>
          )}
        </div>
      </button>

      {expanded && (
        <div className="flex flex-col gap-4 bg-slate-900/40 px-3 py-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <TextField
              label="Nickname"
              value={palmon.nickname}
              onChange={(v) => onChange(palmon.id, { nickname: v })}
              placeholder={species?.name || ''}
            />
            <NumberField
              label={`Level (max ${MAX_PALMON_LEVEL})`}
              value={palmon.level}
              max={MAX_PALMON_LEVEL}
              onChange={(v) => onChange(palmon.id, { level: v })}
              ariaLabel={`${displayName} level`}
            />
            <SelectField
              label="Squad"
              value={palmon.squad === null ? '' : String(palmon.squad)}
              onChange={(v) =>
                onChange(palmon.id, { squad: v === '' ? null : Number(v) })
              }
              options={SQUAD_OPTIONS}
              ariaLabel={`${displayName} squad`}
            />
            <SelectField
              label="Star"
              value={String(palmon.star)}
              onChange={(v) => onChange(palmon.id, { star: Number(v) })}
              options={STAR_OPTIONS}
              ariaLabel={`${displayName} star`}
            />
            <SelectField
              label="Sub-star"
              value={String(palmon.subStar)}
              onChange={(v) => onChange(palmon.id, { subStar: Number(v) })}
              options={SUB_STAR_OPTIONS}
              ariaLabel={`${displayName} sub-star`}
            />
          </div>

          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Skills
            </h4>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {palmon.skills.map((skill, i) => (
                <NumberField
                  key={i}
                  label={`${placeholderSkillName(i)} (max ${MAX_SKILL_LEVEL})`}
                  value={skill.level}
                  max={MAX_SKILL_LEVEL}
                  onChange={(v) => {
                    const skills = palmon.skills.map((s, idx) =>
                      idx === i ? { ...s, level: v } : s,
                    );
                    onChange(palmon.id, { skills });
                  }}
                  ariaLabel={`${displayName} ${placeholderSkillName(i)} level`}
                />
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Traits
            </h4>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {palmon.traits.map((trait, i) => (
                <TextField
                  key={i}
                  label={placeholderTraitName(i)}
                  value={trait}
                  placeholder="—"
                  onChange={(v) => {
                    const traits = palmon.traits.map((t, idx) =>
                      idx === i ? v : t,
                    );
                    onChange(palmon.id, { traits });
                  }}
                  ariaLabel={`${displayName} ${placeholderTraitName(i)}`}
                />
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Equipment
            </h4>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {palmon.equipment.map((item, i) => (
                <TextField
                  key={i}
                  label={placeholderEquipmentName(i)}
                  value={item}
                  placeholder="—"
                  onChange={(v) => {
                    const equipment = palmon.equipment.map((e, idx) =>
                      idx === i ? v : e,
                    );
                    onChange(palmon.id, { equipment });
                  }}
                  ariaLabel={`${displayName} ${placeholderEquipmentName(i)}`}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => onDelete(palmon)}
              className="rounded bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-200 ring-1 ring-slate-700 hover:bg-red-700 hover:text-white"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const SPECIES_OPTIONS = [
  { value: '', label: 'Select species…' },
  ...PALMON_SPECIES.map((s) => ({ value: s.key, label: s.name })),
];

export default function Palmon() {
  const {
    profiles,
    activeProfile,
    setActiveProfile,
    createPalmon,
    updatePalmon,
    deletePalmon,
    resetActivePalmons,
  } = useProfiles();

  const [pendingSpecies, setPendingSpecies] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const palmons = activeProfile.palmons;

  function handleAdd() {
    if (!pendingSpecies) return;
    createPalmon(pendingSpecies);
    setPendingSpecies('');
  }

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-xl font-semibold text-slate-100 sm:text-2xl">
          Palmon
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Track your Palmon roster: level (max {MAX_PALMON_LEVEL}), star tier,
          squad, equipment, skills, and traits.
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

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-800/60 p-3 text-sm text-slate-300 ring-1 ring-slate-700">
        <span>
          <span className="text-slate-400">Roster:</span>{' '}
          <span className="tabular-nums text-slate-100">{palmons.length}</span>
        </span>
        <button
          type="button"
          onClick={() => setConfirmReset(true)}
          disabled={palmons.length === 0}
          className="rounded bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-200 ring-1 ring-slate-700 hover:bg-red-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-slate-800 disabled:hover:text-slate-200"
        >
          Reset
        </button>
      </div>

      <div className="flex flex-wrap items-end gap-2 rounded-lg bg-slate-800/60 p-3 ring-1 ring-slate-700">
        <SelectField
          label="Add Palmon"
          value={pendingSpecies}
          onChange={setPendingSpecies}
          options={SPECIES_OPTIONS}
          ariaLabel="Species to add"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!pendingSpecies}
          className="h-8 rounded bg-indigo-600 px-3 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-indigo-600"
        >
          Add
        </button>
      </div>

      {palmons.length === 0 ? (
        <p className="rounded-lg bg-slate-800/40 p-6 text-center text-sm text-slate-400 ring-1 ring-slate-700">
          No Palmon yet. Pick a species above to add your first one.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {palmons.map((pm) => (
            <PalmonCard
              key={pm.id}
              palmon={pm}
              allPalmons={palmons}
              onChange={updatePalmon}
              onDelete={setPendingDelete}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirmReset}
        title="Reset Palmon roster?"
        message={`Delete all Palmon for "${activeProfile.name}". This also clears any building assignments.`}
        confirmLabel="Reset"
        danger
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          resetActivePalmons();
          setConfirmReset(false);
        }}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete Palmon?"
        message={
          pendingDelete
            ? `Delete "${palmonDisplayName(pendingDelete, palmons)}" and clear any building assignments.`
            : ''
        }
        confirmLabel="Delete"
        danger
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) deletePalmon(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
