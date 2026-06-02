---
name: add-event-inventory
description: |
  Add an event-scoped inventory (items tied to a single in-game event,
  like Sandstorm Scuffle) where the entries don't fit the existing
  time-based speedup model — typically a mix of percentage-based and
  time-based items, or any other non-homogeneous unit set. Use this
  whenever the user shares screenshots of items tagged for a specific
  event and asks to track them, mentions "event speedups", "Sandstorm
  items", "Brawl currency", "<event name> rewards", or describes a
  feature where the in-game tab groups items that don't share the
  speedups DENOMINATIONS shape. Codifies the five-touchpoint pattern
  established by the Sandstorm work (PR #140): a flat typed-entry
  data file, lib helpers with per-type totals, profile field with
  permissive normalize, UI section rendered alongside (not inside)
  the existing surface. Do NOT use this for adding more denominations
  to an existing time-based category (just edit `src/lib/data/speedups.js`),
  for a fully separate new top-level tool (use `add-tool`), or for
  homogeneous items that DO fit the existing speedup or other-inventory
  models.
---

# add-event-inventory

Add an event-scoped item inventory to the app — a set of items tied
to one in-game event whose entries don't share unit semantics with
any existing inventory (e.g. percentage-based march boosts side by
side with time-based healing speedups, all gated to a single event).

The defining characteristic: **the existing speedups data shape
(`DENOMINATIONS` × `CATEGORIES`) doesn't fit**, because at least one
entry isn't a time quantity, or the entries collectively scope to a
single event the user shouldn't be able to spend elsewhere.

The pattern below was established by the Sandstorm work (PR #140 / issue
#135). Use it whenever a new event ships with similar mixed-shape items.

## When the existing shapes already fit

If your new items are **all** time-based denominations slotted into
an existing category (e.g. a new 8h speedup type for the existing
Healing category), just edit `src/lib/data/speedups.js` — that's a
two-line change, no new file needed. Use this skill only when the
new items break the time/denomination model.

If your new items are non-time but are **homogeneous** (e.g. a set
of new collectibles that are just `count`s), `OTHER_ITEMS` in
`src/lib/data/other.js` already handles that — add them there and
skip this skill. This skill is for the multi-shape case.

## The five touchpoints

A new event inventory means coordinated edits in five places. They
naturally form three commits (data → state → UI) for the PR.

### 1. The data file (`src/lib/data/<event>.js`)

Flat array of entries with a `type` discriminator. Each entry carries
the value relevant to its type — `minutes` for time entries, `percent`
for percentage entries, plain `count` semantics for unitless ones.
Include a human-readable `tag` so the in-game labeling survives on the
UI (the Sandstorm catalog preserves "Sandstorm" vs "Desert" per-row
even though both are under the same section).

```js
export const SANDSTORM_SPEEDUPS = [
  {
    key: 'pep-pep-step',
    label: 'Pep-Pep Step',
    tag: 'Sandstorm',
    type: 'march-percent',
    percent: 50,
    description: 'Reduces march time by 50% (Sandstorm Scuffle only).',
  },
  {
    key: 'sandstorm-healing-1h',
    label: '1h Healing Speedup',
    tag: 'Desert',
    type: 'healing-time',
    minutes: 60,
    description: 'Reduces Sandstorm Scuffle healing queue by 1h.',
  },
  // ...
];
```

Rules:

- **Flat array, not a `CATEGORIES`-style grid.** The grid model assumes
  every row has the same denominations; here it doesn't.
- **Keys are append-only.** A key in use becomes effectively permanent —
  load-time normalize zeroes any key not in this array, so renaming
  strands user data. Pick names you won't want to change later.
- **Order matches in-game grid order.** Easier to verify from
  screenshots. Don't sort alphabetically here — the user's mental model
  is the in-game tab.
- **`type` is a single string discriminator.** `'march-percent'`,
  `'healing-time'`, whatever names the event uses. Lib helpers filter
  on this field for per-type totals.

### 2. The lib helpers (`src/lib/<event>.js`)

Mirrors `src/lib/other.js` / `src/lib/speedups.js` in shape — but the
totals are **per type**, not a single global sum:

```js
import { SANDSTORM_SPEEDUPS } from './data/sandstormSpeedups.js';

const KEYS = new Set(SANDSTORM_SPEEDUPS.map((s) => s.key));

export function emptySandstormSpeedups() { /* { [key]: 0 } */ }

export function normalizeSandstormSpeedups(raw) {
  // Strict: drop unknown keys, zero negatives, floor fractions.
  // Permissive only in input type (accept object | null | non-object).
}

export function totalHealingMinutes(state) {
  // Sum minutes over entries where type === 'healing-time'.
}

export function totalMarchCount(state) {
  // Sum counts over entries where type === 'march-percent'.
  // No attempt to convert percent to minutes.
}

export function hasAnySandstormSpeedups(state) { /* boolean */ }
```

One total function per `type` value. **Never aggregate across types
into a single number** — that's the trap this whole pattern exists to
avoid (percent and minutes don't compose).

### 3. Tests (`src/lib/__tests__/<event>.test.js`)

Use the `add-lib-tests` skill for shape. Specifically cover:

- `empty<Event>` returns every catalog key at 0.
- `normalize<Event>` round-trips empty state and drops unknown keys.
- Each `total<Type>` ignores the **other** type's entries (a march
  total fed only healing entries returns 0, and vice versa). This is
  the regression test for "we accidentally summed across types."
- Negative / fractional / string-coerced counts behave like the
  rest of the inventory normalizers in this repo.
- `hasAny<Event>` flips to true for either type.

### 4. Profile state (`src/hooks/useProfiles.js`)

Use the `extend-profile-schema` skill for the mechanics — the five
edits there apply unchanged. Specifically:

- Import `empty<Event>` and `normalize<Event>` from the new lib.
- Add the field to `makeProfile()` and `normalize()`.
- Add CRUD: `update<Event>Item(itemKey, value)` and
  `resetActive<Event>()`. Match the existing `updateCount` /
  `resetActiveInventory` shape.
- Export both from the hook return.

Slot the new ops next to the most related existing inventory ops in
the export list (the Sandstorm work placed them right after
`updateCount` / `resetActiveInventory`, since the surface lives on
the same page).

### 5. The UI

Two placement options. **Decide first**, because the choice changes
where the component lives and whether you need new routing.

#### (a) Section on an existing page (default)

If the in-game tab groups these items together with another
inventory you already render — Sandstorm sits in the in-game
Speedups tab alongside the regular speedups — render the new section
**on the existing page**, as a sibling block below the original.

- Component in `src/components/<existing-feature>/<Event>.jsx`.
- Imported and rendered as a new `<section>` in the existing page
  file. Pass `state` and `onChange` from the hook.
- Give it its own `<ResetButton>` — the existing reset shouldn't
  blow away event state, and vice versa.
- Display per-type totals at the bottom of the section (compact
  footer, label : value pairs), not as a separate Totals card.

No `add-tool` / `convert-to-hub` needed. No route changes. No
sitemap edits.

#### (b) New sub-page under an existing hub

If the in-game UI gives the event its own tab, **and** the entries
would clutter an existing page, use `add-tool` to wire a new
Inventory child page (e.g. `Inventory/<Event>`). Then this skill
just covers the contents of that page, not the routing.

Reach for (b) only when (a) makes the parent page feel crowded.
Sandstorm went with (a) because the in-game grouping argued for it
and four entries didn't overload the host page.

#### Tag chips

Preserve the per-entry tag (`Sandstorm` / `Desert`) on display — even
when several tags share one section. A small `<TagChip>` next to the
label is enough; pick a color per tag and stick with it.

## Storage invariants

- The profile field is **additive**. Old saves load with all counts
  at zero via `normalize<Event>`. This is the same invariant called
  out in `extend-profile-schema` and CLAUDE.md.
- **Don't try to migrate from a different shape.** If you started by
  cramming the items into the existing speedups grid and want to
  move them out, treat that as a separate cleanup — add the new
  surface first, then in a later commit/PR zero out the old slots.
  Mixing the migration into the introduction makes the diff hostile.

## Commit shape

Three commits per PR, matching the touchpoint grouping:

1. `Add <Event> ... catalog and helpers` — data file + lib + tests.
2. `Wire <event>... into the profile schema` — `useProfiles.js`.
3. `Render <Event> section on the <existing> page` — component + page wiring.

Use a true merge (`gh pr merge --merge --delete-branch`), per the
repo convention. Per-commit messages survive on main.

The third commit closes the issue (`Closes #<n>`), since the feature
isn't user-observable until the UI lands.

## Pitfalls

- **Reusing `DENOMINATIONS` or `CATEGORIES`.** Doesn't work for non-
  time entries. Don't add a `{ minutes: 0 }` shim to fake it — that
  poisons every consumer of the time-based totals.
- **One global total.** Forcing a single number across types throws
  away the only thing that distinguishes them. Keep the totals
  separate. UI can show them side by side.
- **Renaming entry keys mid-development.** Once a key is committed to
  main, treat it as permanent. Pick a name you'd ship.
- **Skipping the unknown-key dedicated test.** The healing/march
  cross-ignore test (each total ignores the other type's entries) is
  the regression that catches "we accidentally summed everything."
  Always include it.
- **Forgetting the tag chip.** The in-game labeling carries
  information (e.g. "Desert" vs "Sandstorm" on items that otherwise
  look identical). Strip it and the user loses context.
- **Bundling the data + state + UI in one commit.** Works but makes
  review and revert harder. Three commits per the shape above.

## Sister skills

- `extend-profile-schema` — covers touchpoint #4 in detail. This
  skill points at it rather than re-deriving the mechanics.
- `add-lib-tests` — touchpoint #3. Same conventions, plus the
  per-type cross-ignore tests called out here.
- `add-tool` — only needed if you go with placement option (b).
- `ship-it` — closes the loop (branch, commit, PR, merge, sync).
- `review-changes` — before merging, scan the diff against this
  skill's invariants (keys append-only, totals per type, no
  homogeneous-shim hack).

## Worked example

The Sandstorm work in PR #140 / issue #135 is the canonical
example. Read those files together to see all five touchpoints in
one PR:

- `src/lib/data/sandstormSpeedups.js` — flat catalog with `type`
  discriminator.
- `src/lib/sandstormSpeedups.js` — `totalHealingMinutes` and
  `totalMarchCount` as separate per-type sums.
- `src/lib/__tests__/sandstormSpeedups.test.js` — including the
  cross-ignore regression cases.
- `src/hooks/useProfiles.js` — `sandstormSpeedups` field,
  `updateSandstormSpeedup`, `resetActiveSandstormSpeedups`.
- `src/components/speedups/SandstormSpeedups.jsx` +
  `src/pages/Speedups.jsx` — UI section embedded in the existing
  Speedups page (placement option a).
