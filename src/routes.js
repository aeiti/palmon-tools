// Single source of truth for in-app route paths. Always prefer ROUTES.<name>
// over a string literal — that way rename refactors stay grep-able and
// autocomplete works at every call site.

export const ROUTES = {
  home: '/',
  about: '/about',
  buildings: '/buildings',
  inventory: '/inventory',
  inventoryEquipment: '/inventory/equipment',
  inventoryOther: '/inventory/other',
  inventoryResources: '/inventory/resources',
  inventorySpeedups: '/inventory/speedups',
  mounts: '/mounts',
  notes: '/notes',
  palmonSpecies: '/palmon/species/:speciesKey',
  roster: '/roster',
  squads: '/squads',
  traits: '/traits',
};

export function palmonSpeciesUrl(speciesKey) {
  return `/palmon/species/${speciesKey}`;
}

// Old top-level URLs we keep redirecting from. Add new aliases here as the
// site grows so bookmarks don't break.
export const LEGACY_REDIRECTS = [
  { from: '/palmon', to: ROUTES.roster },
  { from: '/resources', to: ROUTES.inventoryResources },
  { from: '/speedups', to: ROUTES.inventorySpeedups },
];
