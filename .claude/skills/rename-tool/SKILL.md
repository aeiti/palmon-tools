---
name: rename-tool
description: |
  Rename an existing palmon-tools tool — change its visible label,
  URL slug, and page file/component name in one coordinated sweep,
  while keeping bookmarks alive via LEGACY_REDIRECTS. Use this
  whenever the user asks to "rename X to Y", "this tool should be
  called Z", "change /old to /new", or when a hub conversion / IA
  reshuffle changes a tool's identity. Sister to `add-tool` (which
  creates net-new destinations) and `add-legacy-redirect` (which
  handles URL renames in isolation) — this skill is the supersetting
  workflow when *both* the label and the URL move together. Codifies
  the seven-touchpoint pattern from PR #156 (Palmon → Roster):
  routes.js, tools.js, page file rename + component rename, the
  hardcoded ToolPageHeader title inside the page, internal Link refs
  pointing at the old ROUTES.<name>, sitemap, README — plus the
  legacy redirect itself. Do NOT use this for label-only tweaks (one
  line in tools.js, no URL change), for URL-only renames where the
  tool name stays put (use `add-legacy-redirect` alone), for renaming
  a species/building/skill in catalog data (those have their own
  skills), or for adding a brand-new tool (that's `add-tool`).
---

# rename-tool

Rename an existing tool: change its label, URL, page file, and the
hardcoded title inside the page — without breaking bookmarks or
internal cross-links.

This skill exists because a rename touches more places than it looks
like it should. Touching only `tools.js` + `routes.js` leaves the
page heading saying the old name, breaks any `<Link to={ROUTES.old}>`
in sibling pages, strands the old URL in the sitemap, and silently
breaks external bookmarks. PR #156 (Palmon → Roster) shipped only
because the verification step caught the hardcoded `ToolPageHeader
title=`. The skill exists so the checklist isn't reconstructed each
time.

## When to use

Use this skill when **both** the label and the URL move:

- `Palmon` → `Roster`, URL `/palmon` → `/roster`.
- `Speedups` → `Time Items`, URL `/inventory/speedups` →
  `/inventory/time-items`.
- A hub-conversion side-effect where the parent tool's identity
  shifts (e.g. converting a leaf to a hub and renaming it at the
  same time).

Don't use this skill for:

- **Label-only tweaks.** Editing one string in `tools.js` is a
  one-file change — just do it. (But also update README + any
  user-visible references in sibling pages.)
- **URL-only renames where the label stays.** Use
  `add-legacy-redirect` alone — no page file rename, no component
  rename, no page-heading edit.
- **Catalog data renames** (species, buildings, skills). Those have
  their own skills.
- **Brand-new tools.** That's `add-tool`.

## The seven touchpoints

Work through them in order. Each step depends on the previous one
being right.

### 1. `src/routes.js`

Two edits:

- Rename the `ROUTES` entry: `oldName: '/old'` → `newName: '/new'`.
  Keep the file alphabetized.
- Append a `LEGACY_REDIRECTS` entry: `{ from: '/old', to:
  ROUTES.newName }`. This is what keeps bookmarks alive.

If there's a related URL helper (e.g. `palmonSpeciesUrl()`),
consider whether it also needs renaming — but separate sub-paths
(`/palmon/species/:key`) can stay where they are; the legacy
redirect is exact-match on path and won't catch them.

### 2. `src/tools.js`

The tool registry entry:

- `key: 'oldName'` → `key: 'newName'`.
- `path: ROUTES.oldName` → `path: ROUTES.newName`.
- `label: 'Old'` → `label: 'New'`.
- `page: lazy(() => import('./pages/Old.jsx'))` → `lazy(() =>
  import('./pages/New.jsx'))`.
- `description` — usually stays, but update if the rename implies
  a meaning shift.

### 3. Rename the page file

```sh
git -C <path> mv src/pages/Old.jsx src/pages/New.jsx
```

Using `git mv` preserves history (the merge commit will show
`renamed: src/pages/Old.jsx -> src/pages/New.jsx` rather than a
delete + add pair).

### 4. Rename the page's default export

Inside the renamed file:

```js
export default function Old() { ... }
//                       ^^^ rename to New
```

### 5. **The easy-to-miss one: `<ToolPageHeader title="..." />`**

The page heading is hardcoded as a string inside the page file —
**it does not come from the tool registry.** Renaming the `label`
in `tools.js` updates the nav, footer, and dashboard grid, but the
H1 on the page itself stays "Old" until you edit
`<ToolPageHeader title="..." />` here too.

If the subtitle string also says the old name, update that. If
nothing else, this is the single most common rename miss — verify
with a browser snapshot before declaring done.

### 6. Internal cross-links

Grep for `ROUTES.oldName` across `src/`:

```sh
grep -rnE "ROUTES\.oldName\b" /Users/adam/GitHub/palmon-tools/src
```

For each hit, decide:

- **`<Link to={ROUTES.oldName}>` in a sibling page** — update to
  `ROUTES.newName`. Also check the link's visible text — it
  probably says the old label too (e.g. `"Open Palmon"` → `"Open
  Roster"`).
- **`findTool('oldName')` calls** — update the key.

Don't blind-replace. The string `'palmon'` appears in several
unrelated contexts (note-link type, building-assigned palmon field,
inventory "Palmon Acquisition" category). Only the tool-key /
tool-label references move.

### 7. Sitemap + README

- `public/sitemap.xml` — replace the `<loc>` for `/old` with `/new`.
  Per `add-legacy-redirect`, list only the new URL, never the old.
- `README.md` — update the tool list entry. Re-alphabetize if the
  new name sorts differently. While you're there, double-check
  every tool currently in the registry appears in the README (it's
  a common oversight from prior add-tool PRs).

## Verify before shipping

A rename is a layout-touching change, so verification is required:

1. Navigate to `/new` — title and H1 say the new name.
2. Navigate to `/old` — redirects to `/new`.
3. If a sub-path like `/old/sub/:param` exists, navigate to a real
   instance — it still resolves and any "Back" link points to the
   new URL.
4. Check the Tools dropdown, footer, dashboard grid — the new
   label appears in the right alphabetical position.
5. `npm test` — the test suite should still pass (a rename touches
   no pure-lib helpers, but it's the cheap sanity check).

## Commit message

A rename is best as a single commit — the registry edit, page
rename, link updates, and legacy redirect all describe the same
change. Branch prefix `refactor/` (no behavior change beyond the
URL surface). Subject like `Rename Palmon tool to Roster`. Body
should mention:

- What renamed (label + URL).
- That `LEGACY_REDIRECTS` covers the old URL.
- Any sub-paths that intentionally stayed put.
- README / sitemap caught up.

## Pitfalls

- **Forgetting the hardcoded `ToolPageHeader title`.** The most
  common rename miss. The label in `tools.js` doesn't propagate to
  the page H1. Always verify in the browser.
- **Blind global rename.** `'palmon'` is also a Notes link type, a
  building field name, an inventory category — those are unrelated
  and must stay. Search specifically for `ROUTES.oldName` and the
  tool's `key`.
- **Skipping the legacy redirect.** External bookmarks and search
  results point at the old URL. Without `LEGACY_REDIRECTS`, they
  land on the 404→home wildcard, which is silently bad.
- **Putting the old URL in the sitemap.** The sitemap is for
  current URLs only. Add the new path; remove the old.
- **Wrong commit prefix.** A user-facing URL/label change is
  `refactor/` (restructuring an existing thing). Not `feat/` (no
  new capability) and not `chore/` (this is observable behavior).
- **Renaming a hub parent without thinking about children.** If
  the renamed tool is a hub (e.g. `Inventory` had children
  `Other`/`Resources`/`Speedups`), the child URLs nested under the
  parent need a decision: move with the parent (more redirects,
  cleaner end state) or stay under the old prefix (simpler, less
  consistent). Resolve before editing.

## After the rename

- Ship with the `ship-it` skill. Branch prefix `refactor/`.
- After merge, the legacy redirect is the safety net — but if any
  external surface (Google Search Console, social links, the
  README links in `aeiti.github.io`) references the old URL,
  consider whether to update those too.
