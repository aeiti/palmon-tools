---
name: add-tool
description: |
  Add a new routable destination (top-level tool, hub sub-page, or hidden
  deep-link route) to the palmon-tools app. Use this whenever the user
  asks to "add a new tool", "add a page for X", "wire up a route", "make
  a Buildings sub-page", or describes a new feature that's clearly its
  own page/destination. Also use it when extending an existing hub with
  children (e.g. the planned Buildings/Palmon/Squads sub-pages mirroring
  Inventory's Other/Resources/Speedups). Covers the three coordinated
  edits (`src/pages/`, `src/tools.js`, `src/routes.js`), the section
  taxonomy, the optional CHILD_SECTIONS wiring for hubs, and the
  ToolPageHeader-driven SEO meta path. Do NOT use this for editing an
  existing page's behavior, adding a component that isn't its own route,
  or refactoring how the registry works.
---

# add-tool

Add a new routable destination to the app. Every page in palmon-tools
lives behind three coordinated edits — page file, registry entry, route
constant — and the registry then drives the route table, nav, footer,
and dashboard grid automatically. Get the three in sync and the rest is
free.

This skill exists because the registry pattern makes the work look
trivial ("just add an entry") but skipping any of the three edits leaves
the app in a half-wired state: a page with no route, a route with no
page, or a nav link that 404s. The skill walks through the decisions
and the wiring so nothing gets missed.

## The three (sometimes four) edits

1. **`src/routes.js`** — add a `ROUTES.<key>` constant for the URL path.
2. **`src/tools.js`** — append a `TOOLS` entry pointing at the route and
   a lazy-loaded page.
3. **`src/pages/<Name>.jsx`** — create the page component, ideally using
   `ToolPageHeader` so SEO meta is wired automatically.
4. **(Hubs only)** — if this tool is a hub with children, add a new
   `SECTIONS.<HUB>` value, mark the children with `section:
   SECTIONS.<HUB>`, and register the parent→section mapping in
   `CHILD_SECTIONS`.

App.jsx, Layout's nav and footer, and the Dashboard tool grid are all
driven off `TOOLS` — none of them need to be touched.

## Decide first

Before writing any code, pin down four things. They determine which
template to use and where the entry lands.

### 1. Which section does this belong to?

| Section | Use for | Shows up in |
| --- | --- | --- |
| `TOP` | Top-level destinations (Dashboard, About) | Top nav as a direct link |
| `PROFILE` | Profile-scoped tools (most things) | Tools dropdown, footer, dashboard grid |
| `INVENTORY` | Children of the Inventory hub | Sub-items under Inventory in the dropdown/footer |
| `HIDDEN` | Routable but absent from nav | Deep links only (e.g. `/palmon/species/:speciesKey`) |

Most new things are `PROFILE`. Sub-pages of an existing hub go under that
hub's section. Deep-link-only routes (detail pages, share targets) go
under `HIDDEN`. Net-new hub with children? Add a new section value.

### 2. What's the URL path?

Keep it short, lowercase, kebab-case if multi-word. Hub children nest
under the hub (e.g. `/inventory/resources`, not `/resources`). If the
route has dynamic segments, use the `:param` syntax and add a
`<name>Url(...)` helper next to `ROUTES` so call sites don't build path
strings inline.

If you're replacing a previously-shipped URL, add the old URL to
`LEGACY_REDIRECTS` so bookmarks don't break.

### 3. What's the registry key?

Short camelCase, unique across `TOOLS`. Used as the React key, the
lookup parameter to `findTool()`, and (for hubs) the lookup into
`CHILD_SECTIONS`. Convention: match the route segment in camelCase —
`/inventory/other` → `inventoryOther`, `/notes` → `notes`.

### 4. What's the description?

`PROFILE`-section tools need a `description` field — it shows on the
dashboard tile and in the footer column. One sentence, present tense,
states what the tool does. `TOP`, `INVENTORY`, and `HIDDEN` entries
don't need a description.

## Edit 1: routes.js

Add a constant to `ROUTES`:

```js
export const ROUTES = {
  // ...existing...
  notes: '/notes',
};
```

For dynamic routes, add a URL helper alongside it:

```js
palmonSpecies: '/palmon/species/:speciesKey',
// ...
export function palmonSpeciesUrl(speciesKey) {
  return `/palmon/species/${speciesKey}`;
}
```

Keep the `ROUTES` object alphabetized — it makes diffs cleaner and
matches the existing convention.

## Edit 2: tools.js

Append a `TOOLS` entry. Order inside the array doesn't matter — Layout,
the footer, and Dashboard re-sort alphabetically by `label` via
`toolsInSection()`. Add the entry near other entries in the same
section for readability.

### Top-level / PROFILE tool

```js
{
  key: 'notes',
  path: ROUTES.notes,
  label: 'Notes',
  description:
    'Jot down anything: other players, events, items, palmon, buildings — categorized and per-profile.',
  section: SECTIONS.PROFILE,
  page: lazy(() => import('./pages/Notes.jsx')),
},
```

### Hub sub-page (INVENTORY-style)

```js
{
  key: 'inventoryOther',
  path: ROUTES.inventoryOther,
  label: 'Other Inventory',
  section: SECTIONS.INVENTORY,
  page: lazy(() => import('./pages/Other.jsx')),
},
```

No `description` field — sub-pages don't appear on the dashboard grid.

### Hidden deep-link route

```js
{
  key: 'palmonSpecies',
  path: ROUTES.palmonSpecies,
  label: 'Palmon species detail',
  section: SECTIONS.HIDDEN,
  page: lazy(() => import('./pages/PalmonSpecies.jsx')),
},
```

The `label` is used by `findTool()` and for any back-link UI, but it
won't appear in nav.

### Index (home) tool — only Dashboard

```js
{
  key: 'dashboard',
  path: ROUTES.home,
  label: 'Dashboard',
  section: SECTIONS.TOP,
  index: true,  // mounts at the layout's index route
  end: true,    // NavLink end-match
  page: lazy(() => import('./pages/Dashboard.jsx')),
},
```

You won't be adding new index tools — there can only be one.

## Edit 3: the page file

Create `src/pages/<Name>.jsx`. The minimal shape:

```jsx
import ToolPageHeader from '../components/ui/ToolPageHeader.jsx';

export default function Notes() {
  return (
    <div className="flex flex-col gap-6">
      <ToolPageHeader
        title="Notes"
        subtitle="Short, declarative description shown under the heading and reused as the SEO description."
      />
      {/* page content */}
    </div>
  );
}
```

`ToolPageHeader` calls `useDocumentMeta` under the hood: passing a
string `subtitle` automatically sets the SEO description and the OG /
Twitter mirrors. Setting `title` formats the document title as
`<title> · Palmon Tools` and updates the canonical link to the current
route.

### When subtitle isn't a plain string

If the subtitle contains JSX (links, formatting), pass an explicit
`description` prop so SEO meta still gets set:

```jsx
<ToolPageHeader
  title="Squads"
  description="See each squad and the Palmon assigned to it. Each squad holds up to 5 Palmon; there are 6 squads in total."
  subtitle={
    <>Each squad holds up to {MAX_PALMON_PER_SQUAD} Palmon. Assign squad on the <Link to={ROUTES.palmon} className="link-inline">Palmon page</Link>.</>
  }
/>
```

### Sub-pages get a Back link

Add `backTo={ROUTES.<hub>}` so the header renders the "← Back" button:

```jsx
<ToolPageHeader
  title="Other Inventory"
  subtitle="Track miscellaneous items like Skillfruit, Evolution Essence, Opus Pearls, and more."
  backTo={ROUTES.inventory}
/>
```

### Custom headers (rare)

If the page can't use `ToolPageHeader` (e.g. `PalmonSpecies` builds a
header with dynamic badges next to the title), call the meta hook
directly:

```jsx
import { formatPageTitle, useDocumentMeta } from '../hooks/useDocumentMeta.js';

useDocumentMeta({
  title: formatPageTitle(species.name),
  description: `${species.name} — ${capitalize(species.element)} ${species.rarity.toUpperCase()} Palmon. Skills, ascension effects, and Lv 30 values.`,
});
```

Call the hook unconditionally — if there's an early-return branch
(species not found), compute the title/description for that branch first
and pass them, rather than putting the hook call inside the conditional.
React requires hook calls in a stable order across renders.

### Profile-scoped state

If the tool reads or writes user data, wire it through `useProfiles()`:

```jsx
import { useProfiles } from '../hooks/useProfiles.js';
import ProfilePicker from '../components/ui/ProfilePicker.jsx';

const { activeProfile, addNote, updateNote, deleteNote, resetActiveNotes } = useProfiles();
```

The hook handles localStorage persistence and the per-profile namespace.
Extend the profile schema and CRUD ops in `src/hooks/useProfiles.js` if
the new tool tracks novel state — see how Notes added `addNote`,
`updateNote`, `deleteNote`, and `resetActiveNotes` for the pattern.

Render `<ProfilePicker />` near the top of the page so the user can see
and switch which profile they're editing.

## Edit 4 (hubs only): SECTIONS + CHILD_SECTIONS

If the new tool is a *hub* with children — i.e. the dropdown/footer
should show its children indented under it — three additional changes
on top of the regular three edits:

1. **Add a section value** at the top of `src/tools.js`:

   ```js
   export const SECTIONS = {
     TOP: 'top',
     PROFILE: 'profile',
     INVENTORY: 'inventory',
     BUILDINGS: 'buildings',  // new
     HIDDEN: 'hidden',
   };
   ```

2. **Tag the children** with that section in their `TOOLS` entries:

   ```js
   { key: 'buildingsOverview', section: SECTIONS.BUILDINGS, ... },
   { key: 'buildingsAssign',   section: SECTIONS.BUILDINGS, ... },
   ```

3. **Map parent → section** in `CHILD_SECTIONS` (lower in the same file):

   ```js
   const CHILD_SECTIONS = {
     inventory: SECTIONS.INVENTORY,
     buildings: SECTIONS.BUILDINGS,  // new
   };
   ```

That's the whole nested-children pattern. `Layout`'s nav and footer
both call `childrenOf(toolKey)` which reads `CHILD_SECTIONS` and
returns the alphabetically sorted children. The hub page itself is
unchanged — it routes the same as any other tool.

## Pitfalls

- **Forgetting one of the three edits.** Page-with-no-route 404s.
  Route-with-no-page errors at lazy-load time. Registry-without-route
  doesn't render. Run through all three before moving on.
- **Adding the page but importing it directly in `App.jsx`.** The route
  table is built from `TOOLS`. Direct imports break the registry
  invariant — don't do it.
- **Sorting tool lists by hand.** Don't — `toolsInSection()` sorts by
  `label` for free. Manually ordering them in source diverges from the
  rendered order and creates confusion.
- **`description` on non-PROFILE tools.** Harmless but inert. Leave it
  out so it's clear at a glance what each section uses.
- **Calling `useDocumentMeta` inside a conditional.** Hooks need a
  stable call order. Compute the args first, call the hook
  unconditionally, then branch on rendering.
- **JSX subtitle without an explicit `description`.** SEO description
  silently falls back to the site-wide default, which is fine but
  almost certainly not what the page wants. Pass `description=` when
  `subtitle` isn't a string.
- **Forgetting `backTo` on a sub-page.** Users get stranded. Every
  hub-child page should pass `backTo={ROUTES.<hub>}`.
- **Routes that overlap.** React Router matches greedily — `/inventory`
  and `/inventory/other` coexist fine, but `/foo` and `/foo/:id` need
  thought. Test that the parent route doesn't swallow the child.

## After the edits

- Update `public/sitemap.xml` with the new public URL(s). The sitemap
  is hand-maintained (small list, easier to read than a generator).
  Skip this for `HIDDEN` routes — they're deep-link-only.
- If the new tool is publicly relevant, update `README.md`'s Tools
  list. Keep the list alphabetical.
- Ship with the **ship-it** skill — branch first, prefix `feat/` for a
  new tool or `feat/` for a new hub sub-page set, one PR.
