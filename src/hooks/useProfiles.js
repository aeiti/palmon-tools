import { useEffect, useState, useCallback } from 'react';
import { emptyInventory } from '../lib/speedups.js';
import { emptyChests, normalizeChests } from '../lib/chests.js';
import {
  emptyLeveledOverrides,
  emptyOnHand,
  LEVELED_OVERRIDE_FIELDS,
  LEVELED_OVERRIDE_TIERS,
  normalizeLeveledOverrides,
  normalizeOnHand,
} from '../lib/resourceTotals.js';
import { CHEST_RESOURCES } from '../lib/data/chests.js';
import {
  customItemKey,
  emptyCustomOther,
  emptyOther,
  normalizeCustomOther,
  normalizeOther,
} from '../lib/other.js';
import { BUILDINGS, MAX_BUILDING_LEVEL } from '../lib/data/buildings.js';
import { emptyBuildings, normalizeBuildings } from '../lib/buildings.js';
import {
  emptyMounts,
  normalizeMountEntry,
  normalizeMounts,
} from '../lib/mounts.js';
import { MOUNTS_BY_KEY } from '../lib/data/mounts.js';
import {
  applyEquipmentAssignment,
  emptyEquipmentItem,
  normalizeEquipmentItem,
  normalizeEquipmentList,
  syncEquipmentAssignments,
} from '../lib/equipment.js';
import { EQUIPMENT_CATALOG_BY_KEY } from '../lib/data/equipment.js';
import { emptyNote, normalizeNote, normalizeNotes } from '../lib/notes.js';
import {
  emptySandstormSpeedups,
  normalizeSandstormSpeedups,
} from '../lib/sandstormSpeedups.js';
import { PALMON_SPECIES_BY_KEY } from '../lib/data/palmon.js';
import {
  emptyPalmon,
  normalizePalmon,
  normalizePalmonList,
  squadIsFull,
} from '../lib/palmon.js';
import { loadState, saveState } from '../lib/storage.js';
import { parseCompact } from '../lib/format.js';
import {
  emptyPlanner,
  HOSPITAL_CAP,
  isCooldownKey,
  isQueueSlotKey,
  normalizePlanner,
  normalizeQueueItem,
  nudgeFireTimestamp,
} from '../lib/plannerState.js';

function makeId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function emptyDetails() {
  return {
    ign: '',
    server: null,
    guild: '',
    level: null,
    vip: null,
    power: null,
    kills: null,
  };
}

function parseNonNegativeInt(value) {
  if (value === null || value === undefined) return null;
  // Strip the leading "#" some users type for server numbers, then delegate
  // to parseCompact so K / M / B suffixes ("1.5M", "400k") work the same way
  // they do in the inventory inputs. Empty string means "not set" — distinct
  // from 0 — so we short-circuit before parseCompact, which treats "" as 0.
  const cleaned = String(value).replace(/#/g, '').trim();
  if (cleaned === '') return null;
  const parsed = parseCompact(cleaned);
  if (parsed === null || parsed < 0) return null;
  return Math.floor(parsed);
}

function makeProfile(name) {
  return {
    id: makeId(),
    name,
    ...emptyDetails(),
    inventory: emptyInventory(),
    sandstormSpeedups: emptySandstormSpeedups(),
    chests: emptyChests(),
    leveledChestOverrides: emptyLeveledOverrides(),
    onHand: emptyOnHand(),
    other: emptyOther(),
    customOther: emptyCustomOther(),
    buildings: emptyBuildings(),
    mounts: emptyMounts(),
    palmons: [],
    equipment: [],
    notes: [],
    planner: emptyPlanner(),
  };
}

// Rebuild the bidirectional palmon-side / equipment-side link from the
// equipment list. Call this from any mutation that touches either side.
function applyEquipmentSync(profile) {
  const { equipment, palmons } = syncEquipmentAssignments(
    profile.equipment,
    profile.palmons,
  );
  return { ...profile, equipment, palmons };
}

function scrubBuildingPalmonRefs(buildings, validIds) {
  const out = {};
  for (const key of Object.keys(buildings)) {
    out[key] = buildings[key].map((inst) =>
      inst.palmon && !validIds.has(inst.palmon)
        ? { ...inst, palmon: '' }
        : inst,
    );
  }
  return out;
}

function defaultState() {
  const p = makeProfile('Main');
  return { activeProfileId: p.id, profiles: [p] };
}

// Mutate the active profile's planner field via `mutate(planner)`, always
// through the empty-planner fallback so a profile saved before the field
// existed is safe. Module-scoped so the CRUD callbacks can keep empty deps.
function mutatePlanner(s, mutate) {
  return {
    ...s,
    profiles: s.profiles.map((p) =>
      p.id !== s.activeProfileId
        ? p
        : { ...p, planner: mutate(p.planner || emptyPlanner()) },
    ),
  };
}

function clampCampLevel(n) {
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(MAX_BUILDING_LEVEL, Math.floor(n));
}

function applyCampLevel(profile, level) {
  const lvl = clampCampLevel(level);
  return {
    ...profile,
    level: lvl === 0 ? null : lvl,
    buildings: {
      ...profile.buildings,
      camp: profile.buildings.camp.map((inst, i) =>
        i === 0 ? { ...inst, level: lvl } : inst,
      ),
    },
  };
}

function syncProfileCampLevel(profile) {
  const profLvl = profile.level ?? 0;
  const campLvl = profile.buildings?.camp?.[0]?.level ?? 0;
  return applyCampLevel(profile, Math.max(profLvl, campLvl));
}

function normalize(state) {
  if (!state || !Array.isArray(state.profiles) || state.profiles.length === 0) {
    return defaultState();
  }
  const profiles = state.profiles.map((p) => {
    const palmons0 = normalizePalmonList(p.palmons);
    const palmonIds = new Set(palmons0.map((pm) => pm.id));
    const buildings = scrubBuildingPalmonRefs(
      normalizeBuildings(p.buildings),
      palmonIds,
    );
    const { equipment, palmons } = syncEquipmentAssignments(
      normalizeEquipmentList(p.equipment),
      palmons0,
    );
    return syncProfileCampLevel({
      id: p.id || makeId(),
      name: p.name || 'Untitled',
      ign: typeof p.ign === 'string' ? p.ign : '',
      server: parseNonNegativeInt(p.server),
      guild: typeof p.guild === 'string' ? p.guild : '',
      level: parseNonNegativeInt(p.level),
      vip: parseNonNegativeInt(p.vip),
      power: parseNonNegativeInt(p.power),
      kills: parseNonNegativeInt(p.kills),
      inventory: { ...emptyInventory(), ...(p.inventory || {}) },
      sandstormSpeedups: normalizeSandstormSpeedups(p.sandstormSpeedups),
      chests: normalizeChests(p.chests),
      leveledChestOverrides: normalizeLeveledOverrides(p.leveledChestOverrides),
      onHand: normalizeOnHand(p.onHand),
      customOther: normalizeCustomOther(p.customOther),
      other: normalizeOther(p.other, normalizeCustomOther(p.customOther)),
      buildings,
      mounts: normalizeMounts(p.mounts),
      palmons,
      equipment,
      notes: normalizeNotes(p.notes),
      planner: normalizePlanner(p.planner),
    });
  });
  const activeProfileId = profiles.find((p) => p.id === state.activeProfileId)
    ? state.activeProfileId
    : profiles[0].id;
  return { activeProfileId, profiles };
}

export function useProfiles() {
  const [state, setState] = useState(() => normalize(loadState()));

  useEffect(() => {
    saveState(state);
  }, [state]);

  const activeProfile =
    state.profiles.find((p) => p.id === state.activeProfileId) ||
    state.profiles[0];

  const setActiveProfile = useCallback((id) => {
    setState((s) =>
      s.profiles.some((p) => p.id === id) ? { ...s, activeProfileId: id } : s,
    );
  }, []);

  const createProfile = useCallback((name) => {
    const trimmed = (name || '').trim() || 'New profile';
    const p = makeProfile(trimmed);
    setState((s) => ({
      activeProfileId: p.id,
      profiles: [...s.profiles, p],
    }));
  }, []);

  const updateProfileDetails = useCallback((id, details) => {
    const clean = {};
    for (const key of ['ign', 'guild']) {
      if (key in details) clean[key] = String(details[key] ?? '').trim();
    }
    for (const key of ['server', 'vip', 'power', 'kills']) {
      if (key in details) clean[key] = parseNonNegativeInt(details[key]);
    }
    const hasLevel = 'level' in details;
    const newLevel = hasLevel ? parseNonNegativeInt(details.level) : null;
    setState((s) => ({
      ...s,
      profiles: s.profiles.map((p) => {
        if (p.id !== id) return p;
        const merged = { ...p, ...clean };
        return hasLevel ? applyCampLevel(merged, newLevel) : merged;
      }),
    }));
  }, []);

  const renameProfile = useCallback((id, name) => {
    const trimmed = (name || '').trim();
    if (!trimmed) return;
    setState((s) => ({
      ...s,
      profiles: s.profiles.map((p) =>
        p.id === id ? { ...p, name: trimmed } : p,
      ),
    }));
  }, []);

  const deleteProfile = useCallback((id) => {
    setState((s) => {
      if (s.profiles.length <= 1) return s;
      const profiles = s.profiles.filter((p) => p.id !== id);
      const activeProfileId =
        s.activeProfileId === id ? profiles[0].id : s.activeProfileId;
      return { activeProfileId, profiles };
    });
  }, []);

  const updateCount = useCallback((categoryKey, denomKey, value) => {
    const v = Math.max(0, Math.floor(Number(value) || 0));
    setState((s) => ({
      ...s,
      profiles: s.profiles.map((p) =>
        p.id !== s.activeProfileId
          ? p
          : {
              ...p,
              inventory: {
                ...p.inventory,
                [categoryKey]: {
                  ...p.inventory[categoryKey],
                  [denomKey]: v,
                },
              },
            },
      ),
    }));
  }, []);

  const resetActiveInventory = useCallback(() => {
    setState((s) => ({
      ...s,
      profiles: s.profiles.map((p) =>
        p.id !== s.activeProfileId ? p : { ...p, inventory: emptyInventory() },
      ),
    }));
  }, []);

  const updateSandstormSpeedup = useCallback((itemKey, value) => {
    const v = Math.max(0, Math.floor(Number(value) || 0));
    setState((s) => ({
      ...s,
      profiles: s.profiles.map((p) =>
        p.id !== s.activeProfileId
          ? p
          : {
              ...p,
              sandstormSpeedups: {
                ...(p.sandstormSpeedups || emptySandstormSpeedups()),
                [itemKey]: v,
              },
            },
      ),
    }));
  }, []);

  const resetActiveSandstormSpeedups = useCallback(() => {
    setState((s) => ({
      ...s,
      profiles: s.profiles.map((p) =>
        p.id !== s.activeProfileId
          ? p
          : { ...p, sandstormSpeedups: emptySandstormSpeedups() },
      ),
    }));
  }, []);

  const updateChestCount = useCallback(
    (typeKey, tierKey, resourceKey, value) => {
      const v = Math.max(0, Math.floor(Number(value) || 0));
      setState((s) => ({
        ...s,
        profiles: s.profiles.map((p) =>
          p.id !== s.activeProfileId
            ? p
            : {
                ...p,
                chests: {
                  ...p.chests,
                  [typeKey]: {
                    ...p.chests[typeKey],
                    [tierKey]: {
                      ...p.chests[typeKey][tierKey],
                      [resourceKey]: v,
                    },
                  },
                },
              },
        ),
      }));
    },
    [],
  );

  const resetActiveChests = useCallback(() => {
    setState((s) => ({
      ...s,
      profiles: s.profiles.map((p) =>
        p.id !== s.activeProfileId ? p : { ...p, chests: emptyChests() },
      ),
    }));
  }, []);

  const updateLeveledChestOverride = useCallback(
    (tierKey, fieldKey, value) => {
      if (!LEVELED_OVERRIDE_TIERS.includes(tierKey)) return;
      if (!LEVELED_OVERRIDE_FIELDS.includes(fieldKey)) return;
      const v = Math.max(0, Math.floor(Number(value) || 0));
      setState((s) => ({
        ...s,
        profiles: s.profiles.map((p) => {
          if (p.id !== s.activeProfileId) return p;
          const current = p.leveledChestOverrides || emptyLeveledOverrides();
          return {
            ...p,
            leveledChestOverrides: {
              ...current,
              [tierKey]: {
                ...(current[tierKey] || {}),
                [fieldKey]: v,
              },
            },
          };
        }),
      }));
    },
    [],
  );

  const resetActiveLeveledChestOverrides = useCallback(() => {
    setState((s) => ({
      ...s,
      profiles: s.profiles.map((p) =>
        p.id !== s.activeProfileId
          ? p
          : { ...p, leveledChestOverrides: emptyLeveledOverrides() },
      ),
    }));
  }, []);

  const updateOnHand = useCallback((resourceKey, value) => {
    const knownKeys = new Set(CHEST_RESOURCES.map((r) => r.key));
    if (!knownKeys.has(resourceKey)) return;
    const v = Math.max(0, Math.floor(Number(value) || 0));
    setState((s) => ({
      ...s,
      profiles: s.profiles.map((p) =>
        p.id !== s.activeProfileId
          ? p
          : { ...p, onHand: { ...p.onHand, [resourceKey]: v } },
      ),
    }));
  }, []);

  const resetActiveOnHand = useCallback(() => {
    setState((s) => ({
      ...s,
      profiles: s.profiles.map((p) =>
        p.id !== s.activeProfileId ? p : { ...p, onHand: emptyOnHand() },
      ),
    }));
  }, []);

  const updateOtherCount = useCallback((itemKey, value) => {
    const v = Math.max(0, Math.floor(Number(value) || 0));
    setState((s) => ({
      ...s,
      profiles: s.profiles.map((p) =>
        p.id !== s.activeProfileId
          ? p
          : { ...p, other: { ...p.other, [itemKey]: v } },
      ),
    }));
  }, []);

  const resetActiveOther = useCallback(() => {
    setState((s) => ({
      ...s,
      profiles: s.profiles.map((p) =>
        p.id !== s.activeProfileId
          ? p
          : { ...p, other: emptyOther(p.customOther) },
      ),
    }));
  }, []);

  const addCustomOther = useCallback(({ label, group }) => {
    const trimmed = String(label || '').trim().slice(0, 80);
    if (!trimmed) return;
    const id = makeId();
    setState((s) => ({
      ...s,
      profiles: s.profiles.map((p) => {
        if (p.id !== s.activeProfileId) return p;
        const item = { id, label: trimmed, group };
        const nextCustom = [...(p.customOther || []), item];
        return {
          ...p,
          customOther: nextCustom,
          other: { ...p.other, [customItemKey(id)]: 0 },
        };
      }),
    }));
  }, []);

  const updateCustomOther = useCallback((id, patch) => {
    setState((s) => ({
      ...s,
      profiles: s.profiles.map((p) => {
        if (p.id !== s.activeProfileId) return p;
        const nextCustom = (p.customOther || []).map((c) => {
          if (c.id !== id) return c;
          const merged = { ...c };
          if ('label' in patch) {
            const trimmed = String(patch.label || '').trim().slice(0, 80);
            if (trimmed) merged.label = trimmed;
          }
          if ('group' in patch && typeof patch.group === 'string') {
            merged.group = patch.group;
          }
          return merged;
        });
        return { ...p, customOther: nextCustom };
      }),
    }));
  }, []);

  const removeCustomOther = useCallback((id) => {
    setState((s) => ({
      ...s,
      profiles: s.profiles.map((p) => {
        if (p.id !== s.activeProfileId) return p;
        const nextCustom = (p.customOther || []).filter((c) => c.id !== id);
        const nextOther = { ...p.other };
        delete nextOther[customItemKey(id)];
        return { ...p, customOther: nextCustom, other: nextOther };
      }),
    }));
  }, []);

  const updateBuildingInstance = useCallback(
    (buildingKey, index, field, value) => {
      const building = BUILDINGS.find((b) => b.key === buildingKey);
      if (!building || index < 0 || index >= building.count) return;
      let clean;
      if (field === 'level') {
        const n = Number(value);
        if (!Number.isFinite(n) || n <= 0) clean = 0;
        else clean = Math.min(MAX_BUILDING_LEVEL, Math.floor(n));
      } else if (field === 'palmon') {
        clean = typeof value === 'string' ? value : '';
      } else {
        return;
      }
      const isCampLevel =
        buildingKey === 'camp' && index === 0 && field === 'level';
      setState((s) => ({
        ...s,
        profiles: s.profiles.map((p) => {
          if (p.id !== s.activeProfileId) return p;
          if (isCampLevel) return applyCampLevel(p, clean);
          const instances = p.buildings[buildingKey].map((inst, i) =>
            i === index ? { ...inst, [field]: clean } : inst,
          );
          return {
            ...p,
            buildings: { ...p.buildings, [buildingKey]: instances },
          };
        }),
      }));
    },
    [],
  );

  const resetActiveBuildings = useCallback(() => {
    setState((s) => ({
      ...s,
      profiles: s.profiles.map((p) =>
        p.id !== s.activeProfileId
          ? p
          : applyCampLevel(
              { ...p, buildings: emptyBuildings() },
              p.level ?? 0,
            ),
      ),
    }));
  }, []);

  const createPalmon = useCallback((speciesKey) => {
    if (!PALMON_SPECIES_BY_KEY[speciesKey]) return;
    setState((s) => ({
      ...s,
      profiles: s.profiles.map((p) =>
        p.id !== s.activeProfileId
          ? p
          : { ...p, palmons: [...p.palmons, emptyPalmon(speciesKey)] },
      ),
    }));
  }, []);

  const updatePalmon = useCallback((palmonId, patch) => {
    setState((s) => ({
      ...s,
      profiles: s.profiles.map((p) => {
        if (p.id !== s.activeProfileId) return p;
        const palmons = p.palmons.map((pm) => {
          if (pm.id !== palmonId) return pm;
          const merged = { ...pm, ...patch };
          if (
            'squad' in patch &&
            patch.squad &&
            patch.squad !== pm.squad &&
            squadIsFull(p.palmons, patch.squad, palmonId)
          ) {
            merged.squad = pm.squad;
          }
          return normalizePalmon(merged) || pm;
        });
        return { ...p, palmons };
      }),
    }));
  }, []);

  const deletePalmon = useCallback((palmonId) => {
    setState((s) => ({
      ...s,
      profiles: s.profiles.map((p) => {
        if (p.id !== s.activeProfileId) return p;
        const palmons = p.palmons.filter((pm) => pm.id !== palmonId);
        const validIds = new Set(palmons.map((pm) => pm.id));
        const buildings = scrubBuildingPalmonRefs(p.buildings, validIds);
        return applyEquipmentSync({ ...p, palmons, buildings });
      }),
    }));
  }, []);

  const updateMount = useCallback((mountKey, patch) => {
    if (!MOUNTS_BY_KEY[mountKey]) return;
    setState((s) => ({
      ...s,
      profiles: s.profiles.map((p) => {
        if (p.id !== s.activeProfileId) return p;
        const current = p.mounts?.[mountKey] || { level: 0, power: 0 };
        const merged = { ...current, ...patch };
        const next = normalizeMountEntry(merged) || current;
        return { ...p, mounts: { ...p.mounts, [mountKey]: next } };
      }),
    }));
  }, []);

  const resetActiveMounts = useCallback(() => {
    setState((s) => ({
      ...s,
      profiles: s.profiles.map((p) =>
        p.id !== s.activeProfileId ? p : { ...p, mounts: emptyMounts() },
      ),
    }));
  }, []);

  const addNote = useCallback(() => {
    const note = emptyNote();
    setState((s) => ({
      ...s,
      profiles: s.profiles.map((p) =>
        p.id !== s.activeProfileId ? p : { ...p, notes: [note, ...p.notes] },
      ),
    }));
    return note.id;
  }, []);

  const updateNote = useCallback((noteId, patch) => {
    setState((s) => ({
      ...s,
      profiles: s.profiles.map((p) => {
        if (p.id !== s.activeProfileId) return p;
        const notes = p.notes.map((n) => {
          if (n.id !== noteId) return n;
          // Preserve id + createdAt; bump updatedAt on any change.
          const merged = {
            ...n,
            ...patch,
            id: n.id,
            createdAt: n.createdAt,
            updatedAt: new Date().toISOString(),
          };
          return normalizeNote(merged) || n;
        });
        return { ...p, notes };
      }),
    }));
  }, []);

  const deleteNote = useCallback((noteId) => {
    setState((s) => ({
      ...s,
      profiles: s.profiles.map((p) =>
        p.id !== s.activeProfileId
          ? p
          : { ...p, notes: p.notes.filter((n) => n.id !== noteId) },
      ),
    }));
  }, []);

  const resetActiveNotes = useCallback(() => {
    setState((s) => ({
      ...s,
      profiles: s.profiles.map((p) =>
        p.id !== s.activeProfileId ? p : { ...p, notes: [] },
      ),
    }));
  }, []);

  const addEquipment = useCallback((itemKey, initial = {}) => {
    if (!EQUIPMENT_CATALOG_BY_KEY[itemKey]) return null;
    // Build the instance via the permissive normalizer so the initial
    // levels are clamped just like any other write. assignedPalmonId
    // is applied separately to get the auto-swap behavior.
    const candidate = normalizeEquipmentItem({
      ...emptyEquipmentItem(itemKey),
      itemKey,
      ascendLevel: initial.ascendLevel,
      enhanceLevel: initial.enhanceLevel,
      assignedPalmonId: null,
    });
    if (!candidate) return null;
    const initialPalmonId =
      typeof initial.assignedPalmonId === 'string' && initial.assignedPalmonId
        ? initial.assignedPalmonId
        : null;
    setState((s) => ({
      ...s,
      profiles: s.profiles.map((p) => {
        if (p.id !== s.activeProfileId) return p;
        const palmonIds = new Set(p.palmons.map((pm) => pm.id));
        let equipment = [...(p.equipment || []), candidate];
        if (initialPalmonId && palmonIds.has(initialPalmonId)) {
          equipment = applyEquipmentAssignment(
            equipment,
            candidate.id,
            initialPalmonId,
          );
        }
        return applyEquipmentSync({ ...p, equipment });
      }),
    }));
    return candidate.id;
  }, []);

  const updateEquipment = useCallback((equipmentId, patch) => {
    setState((s) => ({
      ...s,
      profiles: s.profiles.map((p) => {
        if (p.id !== s.activeProfileId) return p;
        // Patch everything except assignedPalmonId directly; route the
        // assignment change through applyEquipmentAssignment so it
        // auto-swaps any prior occupant of the same (palmon, slot).
        const { assignedPalmonId: _ignored, ...rest } = patch;
        let equipment = (p.equipment || []).map((e) => {
          if (e.id !== equipmentId) return e;
          const merged = { ...e, ...rest, id: e.id };
          return normalizeEquipmentItem(merged) || e;
        });
        if ('assignedPalmonId' in patch) {
          const palmonIds = new Set(p.palmons.map((pm) => pm.id));
          const target =
            patch.assignedPalmonId && palmonIds.has(patch.assignedPalmonId)
              ? patch.assignedPalmonId
              : null;
          equipment = applyEquipmentAssignment(equipment, equipmentId, target);
        }
        return applyEquipmentSync({ ...p, equipment });
      }),
    }));
  }, []);

  const deleteEquipment = useCallback((equipmentId) => {
    setState((s) => ({
      ...s,
      profiles: s.profiles.map((p) => {
        if (p.id !== s.activeProfileId) return p;
        const equipment = (p.equipment || []).filter(
          (e) => e.id !== equipmentId,
        );
        return applyEquipmentSync({ ...p, equipment });
      }),
    }));
  }, []);

  const assignEquipment = useCallback((equipmentId, palmonId) => {
    setState((s) => ({
      ...s,
      profiles: s.profiles.map((p) => {
        if (p.id !== s.activeProfileId) return p;
        const palmonIds = new Set(p.palmons.map((pm) => pm.id));
        const target = palmonId && palmonIds.has(palmonId) ? palmonId : null;
        const equipment = applyEquipmentAssignment(
          p.equipment || [],
          equipmentId,
          target,
        );
        return applyEquipmentSync({ ...p, equipment });
      }),
    }));
  }, []);

  const resetActiveEquipment = useCallback(() => {
    setState((s) => ({
      ...s,
      profiles: s.profiles.map((p) =>
        p.id !== s.activeProfileId
          ? p
          : applyEquipmentSync({ ...p, equipment: [] }),
      ),
    }));
  }, []);

  // --- Planner ---------------------------------------------------------

  const updatePlannerQueue = useCallback((slotKey, patch) => {
    if (!isQueueSlotKey(slotKey)) return;
    setState((s) =>
      mutatePlanner(s, (planner) => {
        const current = planner.queues[slotKey] || {
          name: '',
          completesAt: null,
        };
        return {
          ...planner,
          queues: {
            ...planner.queues,
            [slotKey]: normalizeQueueItem({ ...current, ...patch }),
          },
        };
      }),
    );
  }, []);

  const clearPlannerQueueSlot = useCallback((slotKey) => {
    if (!isQueueSlotKey(slotKey)) return;
    setState((s) =>
      mutatePlanner(s, (planner) => ({
        ...planner,
        queues: {
          ...planner.queues,
          [slotKey]: { name: '', completesAt: null },
        },
      })),
    );
  }, []);

  // iso: an ISO string (e.g. "fire now" -> new Date().toISOString()) or null
  // to clear the last-fired timestamp.
  const updatePlannerCooldown = useCallback((key, iso) => {
    if (!isCooldownKey(key)) return;
    const ts =
      typeof iso === 'string' && !Number.isNaN(Date.parse(iso)) ? iso : null;
    setState((s) =>
      mutatePlanner(s, (planner) => ({
        ...planner,
        cooldowns: { ...planner.cooldowns, [key]: ts },
      })),
    );
  }, []);

  // Shift a cooldown's recorded fire time by deltaMinutes (negative = earlier),
  // for correcting a pop that was logged late. Clamped to <= now.
  const adjustPlannerCooldown = useCallback((key, deltaMinutes) => {
    if (!isCooldownKey(key)) return;
    setState((s) =>
      mutatePlanner(s, (planner) => ({
        ...planner,
        cooldowns: {
          ...planner.cooldowns,
          [key]: nudgeFireTimestamp(
            planner.cooldowns[key],
            deltaMinutes,
            Date.now(),
          ),
        },
      })),
    );
  }, []);

  const updatePlannerHospital = useCallback((value) => {
    const v = Math.min(HOSPITAL_CAP, Math.max(0, Math.floor(Number(value) || 0)));
    setState((s) =>
      mutatePlanner(s, (planner) => ({ ...planner, hospitalFill: v })),
    );
  }, []);

  const updatePlannerWeighting = useCallback((value) => {
    const v = Math.min(100, Math.max(0, Math.floor(Number(value) || 0)));
    setState((s) =>
      mutatePlanner(s, (planner) => ({ ...planner, weighting: v })),
    );
  }, []);

  const resetActivePlanner = useCallback(() => {
    setState((s) => mutatePlanner(s, () => emptyPlanner()));
  }, []);

  const replaceAllProfiles = useCallback((nextState) => {
    setState(normalize(nextState));
  }, []);

  const resetActivePalmons = useCallback(() => {
    setState((s) => ({
      ...s,
      profiles: s.profiles.map((p) => {
        if (p.id !== s.activeProfileId) return p;
        const buildings = scrubBuildingPalmonRefs(p.buildings, new Set());
        return applyEquipmentSync({ ...p, palmons: [], buildings });
      }),
    }));
  }, []);

  return {
    profiles: state.profiles,
    activeProfile,
    setActiveProfile,
    createProfile,
    renameProfile,
    updateProfileDetails,
    deleteProfile,
    updateCount,
    resetActiveInventory,
    updateSandstormSpeedup,
    resetActiveSandstormSpeedups,
    updateChestCount,
    resetActiveChests,
    updateLeveledChestOverride,
    resetActiveLeveledChestOverrides,
    updateOnHand,
    resetActiveOnHand,
    updateOtherCount,
    resetActiveOther,
    addCustomOther,
    updateCustomOther,
    removeCustomOther,
    updateBuildingInstance,
    resetActiveBuildings,
    createPalmon,
    updatePalmon,
    deletePalmon,
    resetActivePalmons,
    updateMount,
    resetActiveMounts,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    assignEquipment,
    resetActiveEquipment,
    addNote,
    updateNote,
    deleteNote,
    resetActiveNotes,
    updatePlannerQueue,
    clearPlannerQueueSlot,
    updatePlannerCooldown,
    adjustPlannerCooldown,
    updatePlannerHospital,
    updatePlannerWeighting,
    resetActivePlanner,
    replaceAllProfiles,
  };
}
