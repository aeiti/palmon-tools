import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useProfiles } from '../hooks/useProfiles.js';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import ProfilePicker from '../components/ui/ProfilePicker.jsx';
import ResetButton from '../components/ui/ResetButton.jsx';
import ToolPageHeader from '../components/ui/ToolPageHeader.jsx';
import { ROUTES, palmonSpeciesUrl } from '../routes.js';
import { findPalmonBuildingAssignment } from '../lib/buildings.js';
import {
  EQUIPMENT_SLOTS,
} from '../lib/data/equipment.js';
import {
  MAX_EVOLUTION_STAGE,
  MAX_PALMON_LEVEL,
  MAX_SKILL_LEVEL,
  PALMON_SPECIES,
  PALMON_SPECIES_BY_KEY,
  RARITY_BY_KEY,
  SQUAD_COUNT,
  placeholderSkillName,
  placeholderTraitName,
} from '../lib/data/palmon.js';
import { PALMON_SKILLS } from '../lib/data/palmonSkills.js';
import {
  palmonDisplayName,
  speciesEvolvedName,
  speciesHasEvolution,
  squadIsFull,
} from '../lib/palmon.js';
import {
  ElementBadge,
  EvolvedBadge,
  MythicalBadge,
  RarityBadge,
} from '../components/palmon/Badges.jsx';
import EquipmentSlotPicker from '../components/palmon/EquipmentSlotPicker.jsx';
import StarPicker from '../components/palmon/StarPicker.jsx';
import SelectField from '../components/ui/SelectField.jsx';
import { TRAIT_PICKER_GROUPS } from '../lib/palmonTraits.js';

const TRAIT_NONE_OPTIONS = [{ value: '', label: '— None —' }];

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
        className="input-compact"
      />
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
        className="select-compact"
      />
    </label>
  );
}

function buildSquadOptions(palmon, allPalmons) {
  return [
    { value: '', label: 'None' },
    ...Array.from({ length: SQUAD_COUNT }, (_, i) => {
      const n = i + 1;
      const full = squadIsFull(allPalmons, n, palmon.id);
      return {
        value: String(n),
        label: full ? `Squad ${n} (full)` : `Squad ${n}`,
        disabled: full,
      };
    }),
  ];
}

function PalmonCard({
  palmon,
  allPalmons,
  buildings,
  equipment,
  onChange,
  onDelete,
  onAssignEquipment,
}) {
  const species = PALMON_SPECIES_BY_KEY[palmon.speciesKey];
  const cardRef = useRef(null);
  const { hash } = useLocation();
  const anchorId = `palmon-${palmon.id}`;
  // Auto-expand if the card is the URL hash target on mount. Effect below
  // handles scrollIntoView; once expanded, the user can collapse normally.
  const [expanded, setExpanded] = useState(() => hash === `#${anchorId}`);
  const displayName = palmonDisplayName(palmon, allPalmons);
  const squadOptions = buildSquadOptions(palmon, allPalmons);
  const buildingAssignment = findPalmonBuildingAssignment(palmon.id, buildings);
  const canEvolve = speciesHasEvolution(palmon.speciesKey);
  const evolvedName =
    canEvolve && palmon.evolutionStage === MAX_EVOLUTION_STAGE
      ? speciesEvolvedName(palmon.speciesKey)
      : '';

  useEffect(() => {
    if (hash === `#${anchorId}`) {
      cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [hash, anchorId]);

  return (
    <div ref={cardRef} id={anchorId} className="panel">
      <div className="flex items-stretch bg-slate-800/80 transition-colors hover:bg-slate-800">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex flex-1 items-center justify-between gap-2 px-3 py-2 text-left"
          aria-expanded={expanded}
        >
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-sm font-semibold text-slate-100">
              {displayName}
            </span>
            {species && <ElementBadge element={species.element} />}
            {species?.rarity && <RarityBadge rarity={species.rarity} />}
            {species?.mythical && <MythicalBadge />}
            {evolvedName && <EvolvedBadge name={evolvedName} />}
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
        </button>
        <div className="flex shrink-0 items-center gap-2 pr-3 text-xs tabular-nums">
          {buildingAssignment && (
            <Link
              to={ROUTES.buildings}
              className="rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-emerald-300 ring-1 ring-emerald-500/30 transition-colors hover:bg-emerald-500/25"
              aria-label={`Assigned to ${buildingAssignment.label}`}
            >
              {buildingAssignment.label}
            </Link>
          )}
          {palmon.squad && (
            <Link
              to={`/squads#squad-${palmon.squad}`}
              className="rounded-md bg-indigo-500/15 px-1.5 py-0.5 text-indigo-300 ring-1 ring-indigo-500/30 transition-colors hover:bg-indigo-500/25"
              aria-label={`Go to Squad ${palmon.squad}`}
            >
              Squad {palmon.squad}
            </Link>
          )}
        </div>
      </div>

      {expanded && (
        <div className="panel-body flex flex-col gap-4 px-3 py-3">
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
              options={squadOptions}
              ariaLabel={`${displayName} squad`}
            />
            <StarPicker
              star={palmon.star}
              subStar={palmon.subStar}
              onChange={(patch) => onChange(palmon.id, patch)}
              displayName={displayName}
            />
            {canEvolve && (
              <NumberField
                label={`Evolution stage (max ${MAX_EVOLUTION_STAGE})`}
                value={palmon.evolutionStage}
                max={MAX_EVOLUTION_STAGE}
                onChange={(v) =>
                  onChange(palmon.id, { evolutionStage: v })
                }
                ariaLabel={`${displayName} evolution stage`}
              />
            )}
          </div>

          <div>
            <div className="mb-2 flex items-baseline justify-between gap-2">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Skills
              </h4>
              {species && (
                <Link
                  to={palmonSpeciesUrl(species.key)}
                  className="link-inline text-xs"
                >
                  View details
                </Link>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {palmon.skills.map((skill, i) => {
                const catalogName = PALMON_SKILLS[species?.key]?.[i]?.name;
                const skillName = catalogName || placeholderSkillName(i);
                return (
                  <NumberField
                    key={i}
                    label={`${skillName} (max ${MAX_SKILL_LEVEL})`}
                    value={skill.level}
                    max={MAX_SKILL_LEVEL}
                    onChange={(v) => {
                      const skills = palmon.skills.map((s, idx) =>
                        idx === i ? { ...s, level: v } : s,
                      );
                      onChange(palmon.id, { skills });
                    }}
                    ariaLabel={`${displayName} ${skillName} level`}
                  />
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Traits
            </h4>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {palmon.traits.map((trait, i) => (
                <SelectField
                  key={i}
                  label={placeholderTraitName(i)}
                  value={trait}
                  onChange={(v) => {
                    const traits = palmon.traits.map((t, idx) =>
                      idx === i ? v : t,
                    );
                    onChange(palmon.id, { traits });
                  }}
                  options={TRAIT_NONE_OPTIONS}
                  groups={TRAIT_PICKER_GROUPS}
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
              {Array.from({ length: EQUIPMENT_SLOTS }, (_, i) => {
                const slot = i + 1;
                const currentEquipmentId = palmon.equipment[i] || '';
                return (
                  <EquipmentSlotPicker
                    key={slot}
                    slot={slot}
                    palmonId={palmon.id}
                    currentEquipmentId={currentEquipmentId}
                    allEquipment={equipment}
                    onAssign={(newId) => {
                      // newId is the picked equipment-instance id, or
                      // null when "— None —". Unassign → clear the
                      // current occupant; assign → assignEquipment
                      // auto-swaps any prior occupant of this slot.
                      if (newId) {
                        onAssignEquipment(newId, palmon.id);
                      } else if (currentEquipmentId) {
                        onAssignEquipment(currentEquipmentId, null);
                      }
                    }}
                    ariaLabel={`${displayName} equipment slot ${slot}`}
                  />
                );
              })}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => onDelete(palmon)}
              className="btn-ghost"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const TIER_ORDER = ['ur', 'ssr', 'sr'];

const SPECIES_PLACEHOLDER = [{ value: '', label: 'Select species…' }];

const SPECIES_GROUPS = TIER_ORDER.map((tier) => {
  const meta = RARITY_BY_KEY[tier];
  return {
    label: meta?.label || tier.toUpperCase(),
    options: PALMON_SPECIES.filter((s) => s.rarity === tier)
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((s) => ({ value: s.key, label: s.name })),
  };
}).filter((g) => g.options.length > 0);

export default function Roster() {
  const {
    activeProfile,
    createPalmon,
    updatePalmon,
    deletePalmon,
    resetActivePalmons,
    assignEquipment,
  } = useProfiles();

  const [pendingSpecies, setPendingSpecies] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);

  const palmons = activeProfile.palmons;

  function handleAdd() {
    if (!pendingSpecies) return;
    createPalmon(pendingSpecies);
    setPendingSpecies('');
  }

  return (
    <div className="flex flex-col gap-6">
      <ToolPageHeader
        title="Roster"
        subtitle={`Track your Palmon roster: level (max ${MAX_PALMON_LEVEL}), star tier, squad, equipment, skills, and traits.`}
      />

      <ProfilePicker />

      <div className="toolbar justify-between text-sm text-slate-300">
        <span>
          <span className="text-slate-400">Roster:</span>{' '}
          <span className="tabular-nums text-slate-100">{palmons.length}</span>
        </span>
        <ResetButton
          onReset={resetActivePalmons}
          disabled={palmons.length === 0}
          confirmTitle="Reset Palmon roster?"
          confirmMessage={`Delete all Palmon for "${activeProfile.name}". This also clears any building assignments.`}
        />
      </div>

      <div className="flex flex-wrap items-end gap-2 rounded-lg bg-slate-800/60 p-3 ring-1 ring-slate-700/80">
        <SelectField
          label="Add Palmon"
          value={pendingSpecies}
          onChange={setPendingSpecies}
          options={SPECIES_PLACEHOLDER}
          groups={SPECIES_GROUPS}
          ariaLabel="Species to add"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!pendingSpecies}
          className="btn-primary h-8 py-0"
        >
          Add
        </button>
      </div>

      {palmons.length === 0 ? (
        <p className="rounded-lg bg-slate-800/40 p-6 text-center text-sm text-slate-400 ring-1 ring-slate-700/80">
          No Palmon yet. Pick a species above to add your first one.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {palmons.map((pm) => (
            <PalmonCard
              key={pm.id}
              palmon={pm}
              allPalmons={palmons}
              buildings={activeProfile.buildings}
              equipment={activeProfile.equipment || []}
              onChange={updatePalmon}
              onDelete={setPendingDelete}
              onAssignEquipment={assignEquipment}
            />
          ))}
        </div>
      )}

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
