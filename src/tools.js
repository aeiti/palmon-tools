// Single source of truth for the app's tools and pages. Every routable
// destination lives here. App.jsx builds the route table from it, Layout
// builds the nav + footer from it, Home builds its tool grid from it.
//
// To add a new tool: append one entry. Sort happens automatically by label
// within each section, so alphabetical ordering is enforced for free.

import { lazy } from 'react';
import { ROUTES } from './routes.js';

// IA sections. Each value drives which nav surfaces a tool appears on.
export const SECTIONS = {
  TOP: 'top', // top-level nav links (Home, About)
  PROFILE: 'profile', // the Profile dropdown, footer column, home tool grid
  INVENTORY: 'inventory', // sub-pages of the Inventory hub
  STANDALONE: 'standalone', // routed pages with no nav surface (just Profile for now)
};

// All routable destinations. Order doesn't matter — consumers re-sort by label.
export const TOOLS = [
  // Top-level
  {
    key: 'home',
    path: ROUTES.home,
    label: 'Home',
    section: SECTIONS.TOP,
    index: true, // mounts at the layout's index route
    end: true, // NavLink end-match
    page: lazy(() => import('./pages/Home.jsx')),
  },
  {
    key: 'about',
    path: ROUTES.about,
    label: 'About',
    section: SECTIONS.TOP,
    page: lazy(() => import('./pages/About.jsx')),
  },

  // Standalone (has a route, but renders its own nav surface)
  {
    key: 'profile',
    path: ROUTES.profile,
    label: 'Profile',
    section: SECTIONS.STANDALONE,
    page: lazy(() => import('./pages/Profile.jsx')),
  },

  // Profile-section tools (dropdown + footer column + home grid)
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
