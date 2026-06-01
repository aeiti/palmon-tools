// Single source of truth for in-app route paths. Always prefer ROUTES.<name>
// over a string literal — that way rename refactors stay grep-able and
// autocomplete works at every call site.

export const ROUTES = {
  home: '/',
  about: '/about',
  buildings: '/buildings',
  inventory: '/inventory',
  inventoryOther: '/inventory/other',
  inventoryResources: '/inventory/resources',
  inventorySpeedups: '/inventory/speedups',
  notes: '/notes',
  palmon: '/palmon',
  palmonSpecies: '/palmon/species/:speciesKey',
  squads: '/squads',
};

export function palmonSpeciesUrl(speciesKey) {
  return `/palmon/species/${speciesKey}`;
}

// Old top-level URLs we keep redirecting from. Add new aliases here as the
// site grows so bookmarks don't break.
export const LEGACY_REDIRECTS = [
  { from: '/resources', to: ROUTES.inventoryResources },
  { from: '/speedups', to: ROUTES.inventorySpeedups },
];
