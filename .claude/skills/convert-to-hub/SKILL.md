---
name: convert-to-hub
description: |
  Convert an existing top-level palmon-tools tool into a hub with
  sub-pages, mirroring how Inventory was split into Other / Resources
  / Speedups. Use this whenever the user asks to "add sub-pages to
  X", "split the Buildings page", "give Palmon nested children",
  "make this a hub", "decompose this tool", or when an existing tool
  has grown too crowded and the user wants to break it up. Walks
  through the four-stage decomposition: decide the split, add the
  routing/registry plumbing, redistribute the page content, and
  reshape the parent into a hub index. Covers the SECTIONS /
  CHILD_SECTIONS dance, the URL nesting convention, what stays on
  the parent vs moves to children, how to preserve deep-link
  compatibility via LEGACY_REDIRECTS, and the sitemap update. Do
  NOT use this for adding a brand-new tool with children from
  scratch (that's add-tool's "hub" variant), for adding a single
  net-new page (add-tool), or for non-routing restructuring (component
  extraction).
---

# convert-to-hub

Take an existing single-page tool and split it into a parent + N
children, the way Inventory was split. The conversion has four
stages and they need to happen in roughly this order — designing
the split, then plumbing the routes, then redistributing the
content, then reshaping the parent. Mixing the order produces
half-converted state where some children live on the old URL and
some on the new one.

This skill exists because the add-tool skill covers the *steady-state*
shape of a hub-with-children, but doesn't address the migration:
what to move where, how to keep old URLs working, what stays on the
parent. Those decisions are what take most of the time.

## Use Inventory as the reference

Inventory is the only existing hub-with-children in the repo. Read
these files before drafting your conversion plan:

- `src/pages/Inventory.jsx` — the hub index. Three tiles, each
  linking to a child page, plus a profile picker. No heavy logic.
- `src/pages/Other.jsx`, `Resources.jsx`, `Speedups.jsx` — the
  children. Each uses `ToolPageHeader` with `backTo={ROUTES.inventory}`.
- `src/tools.js` — entries showing how children are tagged with
  `section: SECTIONS.INVENTORY` and how `CHILD_SECTIONS` maps the
  parent's key to the child section.
- `src/routes.js` — the URL nesting: `/inventory`, `/inventory/other`,
  `/inventory/resources`, `/inventory/speedups`. Plus
  `LEGACY_REDIRECTS` showing how the pre-split URLs (`/resources`,
  `/speedups`) still resolve.

Match the shape unless you have a strong reason to diverge.

## Stage 1: Decide the split

Before touching code, answer four questions. Write the answers
down (in the PR description or chat); they're load-bearing for
the rest of the work.

### 1. What are the children?

What conceptually-distinct sub-tools live inside the existing page?
Don't split by UI region (don't make a "top half" and "bottom half"
page); split by use case. Inventory split into Other / Resources /
Speedups because those are three things a user opens for three
different reasons.

Aim for 2–5 children. One child is a non-split (just keep it on the
parent). More than 5 suggests a different decomposition is needed.

### 2. What stays on the parent?

The parent route still resolves to something — `/buildings` doesn't
404 just because children exist. Inventory's parent is a hub index
with one tile per child. Some other patterns:

- **Hub index only** — tiles linking to children, no extra content.
  Cleanest. Use this unless something compels otherwise.
- **Hub index + summary** — tiles plus a small overview (counts,
  status). The parent becomes the dashboard for the hub.
- **Hub index + common controls** — tiles plus controls that apply
  across all children (e.g. a profile picker, a reset-all button).

Avoid making the parent a full-content page that *also* has child
links. Either it's a hub (mostly navigation) or it's a content page
(don't give it children).

### 3. What moves to each child?

For each child, list the UI sections and state that move from the
old monolithic page. Be explicit so nothing falls through the
cracks. Example:

| Child | UI moved | State touched |
| --- | --- | --- |
| `/buildings/camp` | Camp building rows, level inputs | `profile.buildings.camp` |
| `/buildings/training` | Training building rows, palmon picker | `profile.buildings.training`, `profile.palmons` |
| `/buildings/utility` | Storage, recycling, etc. | `profile.buildings.*` (the rest) |

If a piece of state is touched by multiple children, that's a
warning sign — either the split is wrong or there's a shared
control that should stay on the parent.

### 4. Do old URLs need to keep working?

If the original page had its own URL (`/buildings`) and now becomes a
hub at the same URL, the old URL still works — no redirect needed.

If you're moving the conceptual *content* of `/buildings` to a child
URL (e.g. `/buildings/camp` becomes "the default" buildings view),
the old URL should redirect. Add a `LEGACY_REDIRECTS` entry:

```js
export const LEGACY_REDIRECTS = [
  { from: '/buildings', to: ROUTES.buildingsCamp },
  // ...
];
```

But the recommended pattern is the parent stays as the hub index at
the original URL — no redirect needed, no broken bookmarks. Reserve
LEGACY_REDIRECTS for cases where the parent URL conceptually moves.

## Stage 2: Plumb the routes

With the split designed, wire up the registry. Apply the **add-tool**
skill's rules for each new entry; the additions specific to a hub
conversion are below.

### Edit `src/tools.js`

Add the new section value:

```js
export const SECTIONS = {
  TOP: 'top',
  PROFILE: 'profile',
  INVENTORY: 'inventory',
  BUILDINGS: 'buildings',  // new
  HIDDEN: 'hidden',
};
```

Add child entries with the new section. No `description` field —
children don't show on the dashboard grid.

```js
{
  key: 'buildingsCamp',
  path: ROUTES.buildingsCamp,
  label: 'Camp Buildings',
  section: SECTIONS.BUILDINGS,
  page: lazy(() => import('./pages/BuildingsCamp.jsx')),
},
```

Wire the parent → section mapping:

```js
const CHILD_SECTIONS = {
  inventory: SECTIONS.INVENTORY,
  buildings: SECTIONS.BUILDINGS,  // new
};
```

The existing parent entry (e.g. `key: 'buildings'`) stays — it's
still a routable destination, just one that now has children
appearing under it in the nav and footer.

### Edit `src/routes.js`

URLs nest under the parent. Match Inventory's pattern:

```js
buildings: '/buildings',
buildingsCamp: '/buildings/camp',
buildingsTraining: '/buildings/training',
buildingsUtility: '/buildings/utility',
```

Keep `ROUTES` alphabetized.

### Edit `public/sitemap.xml`

Add the new child URLs. Hub parent URL stays as-is. Keep the
roughly-alphabetical order if there is one.

## Stage 3: Redistribute the content

Now move the actual UI. Three sub-steps, in order:

### 3a. Create child page files first

Create `src/pages/BuildingsCamp.jsx` (etc.) with the standard shape
— ToolPageHeader, `backTo={ROUTES.buildings}`, ProfilePicker if the
content is profile-scoped, and the moved content.

Do this before changing the parent — the children need to compile
and load on their own URLs before you tear down the old monolithic
page.

Verify each child works in isolation by hitting its URL in the dev
server.

### 3b. Move the JSX, don't rewrite

Lift the relevant JSX out of the monolithic parent page directly
into each child. Resist the urge to refactor on the way. The split
itself is the change; layering refactors on top makes the diff
harder to review and harder to revert if the split needs adjusting.

If something *clearly* deserves cleanup (a copy-pasted block that
becomes a component, a hook that's no longer used), file that as a
follow-up rather than smuggling it into the split commit.

### 3c. Update imports and hooks

Each child re-imports whatever the monolithic page used —
useProfiles destructures, data imports, components. Drop unused
imports from the now-shrunken parent.

State that was profile-scoped continues to be profile-scoped via
`useProfiles()` — the children all read/write the same profile
state. Don't shard the localStorage shape just because the UI
splits.

## Stage 4: Reshape the parent into a hub

The parent route still resolves — to a hub index page. The minimum
shape (matching Inventory):

```jsx
import { Link } from 'react-router-dom';
import ToolPageHeader from '../components/ui/ToolPageHeader.jsx';
import { ROUTES } from '../routes.js';

export default function Buildings() {
  return (
    <div className="flex flex-col gap-6">
      <ToolPageHeader
        title="Buildings"
        subtitle="Track the level and assigned palmon for each building in your camp."
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <Link to={ROUTES.buildingsCamp} className="…tile classes…">
          <h2 className="…">Camp</h2>
          <p className="…">…</p>
        </Link>
        {/* …one tile per child… */}
      </div>
    </div>
  );
}
```

If the hub gets a summary or common controls, add them between the
header and the tile grid. Don't intermix tile links with content —
either the page is a hub or it's a content page.

## Commit shape

The conversion is one logical change but probably three to five
commits, in this order:

1. Add the new routes/registry entries and empty/stub child pages
   so the URLs resolve.
2. (One commit per child.) Move the UI for that child into its
   own page.
3. Reshape the parent into a hub index.
4. Update `public/sitemap.xml`.

Per-commit messages survive into main, so each one needs to read
on its own. The first commit message should explicitly call out
that this is a multi-commit split: "Wire up `/buildings/camp`
route as part of converting Buildings to a hub. UI move follows
in the next commit."

## Pitfalls

- **Wiring registry first, content second.** Tempting to move
  the UI first, but the URLs need to resolve before you can
  navigate to verify the split looks right. Stub child pages
  with `return <ToolPageHeader title="..." />` until the move.
- **Forgetting to drop the old UI from the parent.** A common
  mistake: child page works, but the same UI is *also* still
  rendering on the parent's URL. The parent page should be
  visibly different after the conversion.
- **Refactoring during the move.** Lift JSX wholesale; defer
  cleanup. Otherwise the diff becomes "split + rename + extract"
  and is unreviewable.
- **Splitting state along with UI.** The localStorage shape
  stays the same; only the UI splits. Don't shard
  `profile.buildings` into `profile.buildingsCamp` +
  `profile.buildingsTraining` just because the page split — it
  breaks backups and adds migration complexity.
- **Missing the sitemap.** Child URLs are public routes, they
  belong in `public/sitemap.xml`.
- **Skipping the LEGACY_REDIRECTS check.** If any of the new
  child URLs would have made sense as a deep link before the
  split (e.g. if `/buildings#camp` was used in any documentation
  or bookmarks), add a redirect — even one user with a stale
  bookmark is worth a one-line redirect.
- **Hub index that's secretly still a content page.** If the
  parent's hub page is rendering 500 lines of UI, the split
  isn't done.

## After the conversion

- Run the dev server and click through every URL (parent +
  every child). The parent should look like a hub index, each
  child should render its slice, navigation should work, the
  Back link on each child should return to the parent.
- Run `npm test` to confirm no lib helpers broke.
- Run `npm run build` to confirm production build succeeds and
  routes lazy-load correctly.
- Update `README.md` if the description of the original tool is
  no longer accurate (e.g. "Track the level and assigned Palmon
  for each building" might shift to a higher-level summary now
  that the work is split across children).
- Ship with the **ship-it** skill. Branch prefix is `refactor/`
  if the user-visible behavior stays the same, `feat/` if the
  split also adds new functionality on one of the children.
