// Single source of truth for the app's tools and pages. Every routable
// destination lives here. App.jsx builds the route table from it, Layout
// builds the nav + footer from it, the Dashboard builds its tool grid from it.
//
// To add a new tool: append one entry. Sort happens automatically by label
// within each section, so alphabetical ordering is enforced for free.

import { lazy } from 'react';
import { ROUTES } from './routes.js';

// IA sections. Each value drives which nav surfaces a tool appears on.
export const SECTIONS = {
  TOP: 'top', // top-level nav links (Dashboard, About)
  PROFILE: 'profile', // the Tools dropdown, footer column, dashboard tool grid
  INVENTORY: 'inventory', // sub-pages of the Inventory hub
  HIDDEN: 'hidden', // routable but absent from nav (deep links only)
};

// All routable destinations. Order doesn't matter — consumers re-sort by label.
export const TOOLS = [
  // Top-level
  {
    key: 'dashboard',
    path: ROUTES.home,
    label: 'Dashboard',
    section: SECTIONS.TOP,
    index: true, // mounts at the layout's index route
    end: true, // NavLink end-match
    page: lazy(() => import('./pages/Dashboard.jsx')),
  },
  {
    key: 'about',
    path: ROUTES.about,
    label: 'About',
    section: SECTIONS.TOP,
    page: lazy(() => import('./pages/About.jsx')),
  },

  // Profile-section tools (dropdown + footer column + dashboard grid)
  {
    key: 'buildings',
    path: ROUTES.buildings,
    label: 'Buildings',
    description:
      'Track the level and assigned palmon for each building in your camp.',
    section: SECTIONS.PROFILE,
    page: lazy(() => import('./pages/Buildings.jsx')),
  },
  {
    key: 'inventory',
    path: ROUTES.inventory,
    label: 'Inventory',
    description:
      'Track everything in your bag: miscellaneous items, resource chests, and speedups.',
    section: SECTIONS.PROFILE,
    page: lazy(() => import('./pages/Inventory.jsx')),
  },
  {
    key: 'mounts',
    path: ROUTES.mounts,
    label: 'Mounts',
    description:
      'Track each mount’s level and see its skill effects at every tier.',
    section: SECTIONS.PROFILE,
    page: lazy(() => import('./pages/Mounts.jsx')),
  },
  {
    key: 'notes',
    path: ROUTES.notes,
    label: 'Notes',
    description:
      'Jot down anything: other players, events, items, palmon, buildings — categorized and per-profile.',
    section: SECTIONS.PROFILE,
    page: lazy(() => import('./pages/Notes.jsx')),
  },
  {
    key: 'palmon',
    path: ROUTES.palmon,
    label: 'Palmon',
    description:
      'Track your Palmon roster: level, stars, squad, equipment, skills, and traits.',
    section: SECTIONS.PROFILE,
    page: lazy(() => import('./pages/Palmon.jsx')),
  },
  {
    key: 'squads',
    path: ROUTES.squads,
    label: 'Squads',
    description: 'See each squad and the Palmon assigned to it.',
    section: SECTIONS.PROFILE,
    page: lazy(() => import('./pages/Squads.jsx')),
  },
  {
    key: 'traits',
    path: ROUTES.traits,
    label: 'Traits',
    description:
      'Browse every breeding trait: Combat and Work, grouped by grade with effects.',
    section: SECTIONS.PROFILE,
    page: lazy(() => import('./pages/Traits.jsx')),
  },

  // Inventory sub-pages
  {
    key: 'inventoryOther',
    path: ROUTES.inventoryOther,
    label: 'Other Inventory',
    section: SECTIONS.INVENTORY,
    page: lazy(() => import('./pages/Other.jsx')),
  },
  {
    key: 'inventoryResources',
    path: ROUTES.inventoryResources,
    label: 'Resource Inventory',
    section: SECTIONS.INVENTORY,
    page: lazy(() => import('./pages/Resources.jsx')),
  },
  {
    key: 'inventorySpeedups',
    path: ROUTES.inventorySpeedups,
    label: 'Speedup Inventory',
    section: SECTIONS.INVENTORY,
    page: lazy(() => import('./pages/Speedups.jsx')),
  },

  // Hidden deep-link routes
  {
    key: 'palmonSpecies',
    path: ROUTES.palmonSpecies,
    label: 'Palmon species detail',
    section: SECTIONS.HIDDEN,
    page: lazy(() => import('./pages/PalmonSpecies.jsx')),
  },
];

// All tools in a section, sorted alphabetically by label.
export function toolsInSection(section) {
  return TOOLS.filter((t) => t.section === section).sort((a, b) =>
    a.label.localeCompare(b.label),
  );
}

export function findTool(key) {
  return TOOLS.find((t) => t.key === key);
}

// Maps a parent tool key to the section whose tools render as its children
// in nav surfaces (dropdown, footer). Adding a new nested hub means adding
// one section here — everything else stays declarative.
const CHILD_SECTIONS = {
  inventory: SECTIONS.INVENTORY,
};

// Children of a tool in nav surfaces. Returns the same shape as TOOLS,
// sorted alphabetically. Empty for leaf tools.
export function childrenOf(toolKey) {
  const section = CHILD_SECTIONS[toolKey];
  return section ? toolsInSection(section) : [];
}
