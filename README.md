# Palmon Tools

[![Release and Deploy](https://github.com/aeiti/palmon-tools/actions/workflows/release.yml/badge.svg)](https://github.com/aeiti/palmon-tools/actions/workflows/release.yml)
[![Latest release](https://img.shields.io/github/v/release/aeiti/palmon-tools?label=release)](https://github.com/aeiti/palmon-tools/releases)

Calculators and trackers for [Palmon: Survival](https://palmonsurvival.com/) players.

Live at **<https://aeiti.github.io/palmon-tools/>**.

Everything you enter is saved to your browser's `localStorage`. Nothing is sent to a server.

## Tools

- **Dashboard** — landing page with a tile per tool.
- **About** — what this is, disclaimer, feedback link.
- **Buildings** — track the level and assigned Palmon for each building in your camp.
- **Inventory** — hub page for everything in your bag:
  - **Other Inventory** — miscellaneous items.
  - **Resource Inventory** — resource chests and on-hand resources.
  - **Speedup Inventory** — speedups by category (Universal, Construction, Research, Training, Healing) with a target-time checker.
- **Mounts** — reference for the seven mounts in the Stable: skill effects at every tier (1–5), with thresholds at mount levels 10 / 30 / 50 / 70 / 100.
- **Notes** — per-profile free-form journal entries, categorized (player / event / item / palmon / building / other) with an optional link to a Palmon species or building.
- **Roster** — your Palmon roster: level, stars, squad, equipment, skills, traits.
- **Squads** — see each squad and the Palmon assigned to it.
- **Traits** — reference for every breeding trait, grouped by Combat / Work and grade (S / A / B / C).

## Tech stack

- [Vite](https://vite.dev/) + [React 19](https://react.dev/) (JavaScript, no TypeScript)
- [React Router](https://reactrouter.com/) (BrowserRouter with `basename`)
- [Tailwind CSS 4](https://tailwindcss.com/) via `@tailwindcss/vite`
- [Zod](https://zod.dev/) for backup-file validation
- [Vitest](https://vitest.dev/) for unit tests

## Local development

```sh
npm install
npm run dev        # http://localhost:5173/palmon-tools/
npm run lint
npm run test       # one-shot
npm run test:watch # watch mode
npm run build      # production build to dist/
npm run preview    # serve the built dist/
```

The dev URL has the `/palmon-tools/` base path because that's where the site is hosted on GitHub Pages — see `base` in `vite.config.js`.

## Project structure

```
src/
  App.jsx              # builds routes from src/tools.js + src/routes.js
  routes.js            # ROUTES constants + LEGACY_REDIRECTS
  tools.js             # TOOLS registry — single source of truth for pages/nav
  pages/               # one file per routable destination
  components/
    inventory/         # feature-specific components
    speedups/
    buildings/
    profile/
    ui/                # shared primitives (ToolPageHeader, ProfilePicker, ...)
    layout/            # Layout shell, PageTracker
  hooks/useProfiles.js # profile state + localStorage persistence
  lib/                 # logic (normalize, compute, format)
    data/              # static game data (chests, palmon species, buildings, ...)
    __tests__/         # colocated tests
  index.css            # Tailwind import + reusable component classes
public/
  404.html             # spa-github-pages SPA fallback for deep-link refresh
```

**Adding a new tool**: create the page in `src/pages/`, append an entry to `TOOLS` in `src/tools.js` (with `React.lazy(() => import(...))`), and add a `ROUTES.<key>` constant. App.jsx, the nav, and the dashboard pick it up automatically.

## Deployment

Every push to `main` triggers `.github/workflows/release.yml`, which:

1. Computes a CalVer tag `vYYYY.MM.DD.N` from this repo's existing tags.
2. Builds with `VITE_APP_VERSION` set (rendered in the footer).
3. Creates a GitHub Release with the build tarball attached.
4. Deploys `dist/` to GitHub Pages.

Each merge to `main` is therefore a release — bundle changes accordingly. There is no separate "deploy" workflow; everything happens in `release.yml`.

## Changelog

User-facing changes are summarized in [`CHANGELOG.md`](CHANGELOG.md). Full per-release notes (auto-generated on every push to `main`) are on the [GitHub Releases page](https://github.com/aeiti/palmon-tools/releases).

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for branching, commit, and PR conventions. Short version: short-lived `feat/` / `fix/` / `refactor/` / `chore/` / `docs/` branches off `main`, one PR per change, merged with a true merge commit so per-commit history is preserved.

Bug reports and feature ideas: open an issue at <https://github.com/aeiti/palmon-tools/issues>.

## Disclaimer

This is a fan-made project. It is not affiliated with, endorsed by, or sponsored by the publisher or developers of *Palmon: Survival*. All game names and assets belong to their respective owners.
