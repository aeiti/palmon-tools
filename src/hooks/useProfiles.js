import { useEffect, useState, useCallback } from 'react';
import { emptyInventory } from '../lib/speedups.js';
import { emptyChests, normalizeChests } from '../lib/chests.js';
import { emptyOther, normalizeOther } from '../lib/other.js';
import {
  BUILDINGS,
  MAX_BUILDING_LEVEL,
  emptyBuildings,
  normalizeBuildings,
} from '../lib/buildings.js';
import { loadState, saveState } from '../lib/storage.js';

function makeId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function emptyDetails() {
  return { ign: '', server: null, guild: '', level: null, power: null };
}

function parseNonNegativeInt(value) {
  if (value === null || value === undefined) return null;
  const cleaned = String(value).replace(/[\s,_#]/g, '');
  if (cleaned === '') return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.floor(n);
}

function makeProfile(name) {
  return {
    id: makeId(),
    name,
    ...emptyDetails(),
    inventory: emptyInventory(),
    chests: emptyChests(),
    other: emptyOther(),
    buildings: emptyBuildings(),
  };
}

function defaultState() {
  const p = makeProfile('Main');
  return { activeProfileId: p.id, profiles: [p] };
}

function normalize(state) {
  if (!state || !Array.isArray(state.profiles) || state.profiles.length === 0) {
    return defaultState();
  }
  const profiles = state.profiles.map((p) => ({
    id: p.id || makeId(),
    name: p.name || 'Untitled',
    ign: typeof p.ign === 'string' ? p.ign : '',
    server: parseNonNegativeInt(p.server),
    guild: typeof p.guild === 'string' ? p.guild : '',
    level: parseNonNegativeInt(p.level),
    power: parseNonNegativeInt(p.power),
    inventory: { ...emptyInventory(), ...(p.inventory || {}) },
    chests: normalizeChests(p.chests),
    other: normalizeOther(p.other),
    buildings: normalizeBuildings(p.buildings),
  }));
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
    for (const key of ['server', 'level', 'power']) {
      if (key in details) clean[key] = parseNonNegativeInt(details[key]);
    }
    setState((s) => ({
      ...s,
      profiles: s.profiles.map((p) => (p.id === id ? { ...p, ...clean } : p)),
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
        p.id !== s.activeProfileId ? p : { ...p, other: emptyOther() },
      ),
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
      setState((s) => ({
        ...s,
        profiles: s.profiles.map((p) => {
          if (p.id !== s.activeProfileId) return p;
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
        p.id !== s.activeProfileId ? p : { ...p, buildings: emptyBuildings() },
      ),
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
    updateChestCount,
    resetActiveChests,
    updateOtherCount,
    resetActiveOther,
    updateBuildingInstance,
    resetActiveBuildings,
  };
}
