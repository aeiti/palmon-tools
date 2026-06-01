---
name: extend-profile-schema
description: |
  Add a new per-profile state field to `src/hooks/useProfiles.js` with
  CRUD operations and localStorage persistence. Use this whenever the
  user asks to "add state for X", "track X per profile", "wire up Y
  storage", "add CRUD for Z", or describes a new profile-scoped tool
  that needs to read/write user data. Also use this when an existing
  tool grows a new piece of state (a new sub-field on palmons, a new
  inventory category, a new top-level array). Covers the five
  touchpoints — `makeProfile`, `normalize`, the CRUD ops, the export
  list, and any cross-field scrubbing — plus the permissive normalize
  rule, the runtime-vs-load-time normalize split, the active-profile
  state pattern, and the localStorage / backup invariants. Do NOT use
  this for adding *global* (non-per-profile) state, editing the profile
  schema's identity fields (id, name, ign, etc.) which already exist,
  or for the page UI itself (that's the add-tool skill's territory).
---

# extend-profile-schema

Add a new field to the per-profile state and wire it into the CRUD
surface that the rest of the app uses. The pattern is consistent
across the existing fields (notes, palmons, buildings, inventory) and
the consistency is load-bearing — the localStorage shape, backup
import/export, and reset-this-tool flows all rely on the same five
touchpoints being present.

## The five touchpoints

For every new per-profile field, edit:

1. **`makeProfile(name)`** — add the field to the initial profile shape
   with its empty value.
2. **`normalize(state)`** — add the field to the per-profile object
   literal, wrapping the raw value with a permissive `normalize<Field>`
   from your tool's lib file.
3. **CRUD `useCallback`s** inside `useProfiles()` — one per operation
   the page needs (add / update / delete / reset / replace, as
   applicable).
4. **The returned object** at the bottom of `useProfiles()` — list each
   new callback so pages can destructure it.
5. **(Sometimes) cross-field scrubbing** — if the new field references
   another field's ids (the way `buildings` references palmon ids), add
   the cleanup pass so deletes on one side don't leave dangling refs
   on the other.

App.jsx, the storage helpers, and the backup envelope are all schema-
agnostic — they don't need to be touched as long as the five
touchpoints are right.

## Decide first

Before editing `useProfiles.js`, pin down two things:

### 1. What's the field's shape?

| Shape | Use for | Example |
| --- | --- | --- |
| Array of objects with ids | Lists of user-created items (notes, palmons) | `notes: []` |
| Object keyed by catalog key | Per-entity counters or assignments (inventory, buildings) | `inventory: { skillfruit: 0, ... }` |
| Scalar | Single value (a flag, a count, a string) | `level: null` |

Most new fields are arrays or keyed objects. Scalars are usually
already covered by the identity fields (`ign`, `server`, `level`, etc.)
— think hard before adding a new one.

### 2. What's the lib module for this field?

Per the repo's convention, every non-trivial profile field has a
companion `src/lib/<name>.js` module that owns the schema-level helpers:

- `empty<Field>()` — returns the field's empty value, used by
  `makeProfile`.
- `normalize<Field>(raw)` — load-time normalizer that takes whatever's
  in localStorage and returns a clean shape. Permissive on raw shape,
  strict on output.
- Optionally: `normalize<Field>One(raw)` — runtime normalizer for a
  single entity, used by `updateX` (see the runtime-vs-load-time split
  below).

Create or extend this lib module before touching `useProfiles.js`.

## Touchpoint 1: makeProfile

Add the field to the initial shape with its empty value:

```js
function makeProfile(name) {
  return {
    id: makeId(),
    name,
    ...emptyDetails(),
    // ...existing fields...
    notes: [],
    journal: emptyJournal(),  // new
  };
}
```

Use the `empty<Field>()` helper from the lib module rather than
hardcoding `[]` or `{}` — keeps the empty-value contract in one place.

## Touchpoint 2: normalize

Add the field to the object literal returned from `normalize(state)`:

```js
function normalize(state) {
  // ...
  const profiles = state.profiles.map((p) => {
    // ...
    return syncProfileCampLevel({
      // ...existing fields...
      notes: normalizeNotes(p.notes),
      journal: normalizeJournal(p.journal),  // new
    });
  });
  // ...
}
```

`normalize` runs on every load and on every backup-restore. It is the
single point where unknown / corrupt / partial / outdated data gets
cleaned up. The full state has to round-trip cleanly: passing
`normalize(state)` through `normalize()` again must produce the same
result. Test this mentally before shipping.

## Permissive at runtime, strict at load

This is the most subtle rule in the file. Two layers, two different
strictness levels:

### Load-time `normalize<Field>` (strict-ish, prunes garbage)

Runs on initial load and on backup-restore. Filters out entirely-empty
entries, drops references to missing ids, dedupes by id. Examples:

- `normalizeNotes` drops notes with no title, body, or link.
- `scrubBuildingPalmonRefs` clears assignments referencing palmons
  that no longer exist.

### Runtime `normalize<Field>One` (permissive, returns the input on bad shape)

Used inside `updateX` to validate a partial edit. Must be permissive —
the user might pick a link type before typing a title, and dropping
the half-edited entity would feel like a bug ("I picked a link and it
vanished"). Pattern:

```js
const updateNote = useCallback((noteId, patch) => {
  setState((s) => ({
    ...s,
    profiles: s.profiles.map((p) => {
      if (p.id !== s.activeProfileId) return p;
      const notes = p.notes.map((n) => {
        if (n.id !== noteId) return n;
        const merged = {
          ...n,
          ...patch,
          id: n.id,                                 // immutable
          createdAt: n.createdAt,                   // immutable
          updatedAt: new Date().toISOString(),      // bumped
        };
        return normalizeNote(merged) || n;          // fallback to old
      });
      return { ...p, notes };
    }),
  }));
}, []);
```

The `|| n` fallback is the runtime safety net — even if `normalizeNote`
decides the merged shape is invalid for some reason, the user's
existing note isn't destroyed. The load-time `normalizeNotes` pass
will prune it later if it stayed empty.

This split is why Notes added a permissive `normalizeNote` and a
load-time `normalizeNotes` that filters empties — the two pass-types
have different jobs.

## Touchpoint 3: CRUD ops

All CRUD ops on per-profile fields follow the same shape: scope to the
active profile, return the updated state from a `setState((s) => ...)`
callback, and use `useCallback` so the function identity is stable for
React.

### add<Entity>() — creates and returns the new id

```js
const addNote = useCallback(() => {
  const note = emptyNote();
  setState((s) => ({
    ...s,
    profiles: s.profiles.map((p) =>
      p.id !== s.activeProfileId ? p : { ...p, notes: [note, ...p.notes] },
    ),
  }));
  return note.id;
}, []);
```

**Return the new id.** Pages call `addX()` and then immediately expand
or focus the new entity — they need its id. Prepend to the array so
new entries appear at the top of the unsorted list (sort happens at
render time, but pre-sort placement still affects scroll-into-view).

### update<Entity>(id, patch) — partial edit with immutable fields

See the example in "Permissive at runtime" above. Things to preserve
in the merge:

- `id` — always immutable.
- Any "created at" or origin timestamp.
- Any field set at creation that shouldn't be patchable from the UI.

Things to bump:
- `updatedAt` to `new Date().toISOString()`.

### delete<Entity>(id) — filter by id

```js
const deleteNote = useCallback((noteId) => {
  setState((s) => ({
    ...s,
    profiles: s.profiles.map((p) =>
      p.id !== s.activeProfileId
        ? p
        : { ...p, notes: p.notes.filter((n) => n.id !== noteId) },
    ),
  }));
}, []);
```

If this field is referenced by another field's ids, also call the
cross-field scrubbing pass — see touchpoint 5.

### resetActive<Field>() — wipes the field

```js
const resetActiveNotes = useCallback(() => {
  setState((s) => ({
    ...s,
    profiles: s.profiles.map((p) =>
      p.id !== s.activeProfileId ? p : { ...p, notes: [] },
    ),
  }));
}, []);
```

Used by the Reset button on the tool page. The empty shape should
match `emptyJournal()` (or whatever the lib helper returns), not be
inlined as `[]` if the field is non-trivial.

## Touchpoint 4: export the callbacks

At the bottom of `useProfiles()`, add each new callback to the return
object:

```js
return {
  profiles: state.profiles,
  activeProfile,
  // ...existing...
  addNote,
  updateNote,
  deleteNote,
  resetActiveNotes,
  // new:
  addJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  resetActiveJournal,
};
```

Order them so a tool's ops cluster together (all the Notes ops, then
all the Journal ops). Pages destructure what they need:

```js
const { activeProfile, addJournalEntry, updateJournalEntry } = useProfiles();
```

## Touchpoint 5: cross-field scrubbing (when applicable)

If the new field's entities reference ids from another field, deletes
on the referenced side need to clean up the references. The existing
pattern is `scrubBuildingPalmonRefs(buildings, validIds)` — called
from:

- `normalize` (after `normalizePalmonList` produces the valid id set).
- `deletePalmon` (when a palmon is removed mid-session).
- `resetActivePalmons` (when all palmons are wiped).

For a new field that references palmons (or any other field), add the
same three call sites:

```js
function scrubJournalPalmonRefs(journal, validPalmonIds) {
  return journal.map((entry) =>
    entry.palmonRef && !validPalmonIds.has(entry.palmonRef)
      ? { ...entry, palmonRef: null }
      : entry,
  );
}
```

Wire it into the three places above. The invariant: at any consistent
state, no field contains a reference to an id that doesn't exist
elsewhere in the profile.

## Storage invariants

The hook persists everything to localStorage under the key
`palmon-tools:v1`. Things that follow from this:

- **Schema version is `v1` and effectively immutable.** New fields are
  *added* with permissive normalize handling, never *renamed* or
  *removed* in a way that breaks loading older state. Users have data
  in their browsers from previous sessions, and the load-time
  `normalize` is the bridge.
- **Backup envelope is loose-validated.** When the user imports a
  backup file, the whole state goes through `replaceAllProfiles`,
  which calls `normalize`. As long as your new field's
  `normalize<Field>` is permissive about missing/old shapes, backup
  import works automatically — no separate backup schema to edit.
- **Two profile fields are mirrored** — `profile.level` and
  `profile.buildings.camp[0].level`. They're kept in sync via
  `applyCampLevel` and `syncProfileCampLevel`. Don't introduce more
  mirrored fields unless absolutely necessary, and if you must,
  follow that exact pattern.

## Pitfalls

- **Forgetting `normalize`.** The new field works in the current
  session but disappears on next page load — silently. Always extend
  both `makeProfile` and `normalize`.
- **Forgetting the return statement.** The hook's consumers can't see
  the new callback. Easy to miss because the function compiles fine.
- **Strict runtime normalize.** If `normalizeX` returns null on a
  partial edit, `updateX`'s fallback (`|| existing`) silently drops
  the edit — the UI looks like a bug ("I clicked but nothing changed").
  Keep runtime normalize permissive; let the load-time pass prune.
- **Mutating profile state.** Always spread (`{ ...p, field: next }`),
  never mutate. React equality checks need new references to
  re-render.
- **Scoping to the wrong profile.** All per-profile ops must filter on
  `p.id !== s.activeProfileId`. Forgetting the guard mutates *all*
  profiles' state — easy to write a one-line bug here.
- **Deps array on `useCallback`.** Leave it `[]` for these — the
  callbacks only close over `setState`, which is stable. Including
  `state` will recreate the callback every render and break referential
  equality for any `React.memo` or `useEffect` consumer.
- **Forgetting cross-field scrubbing on reset.** `resetActivePalmons`
  remembers to scrub building refs; new analogous resets need the
  same care.
- **Adding tests for `useProfiles.js` directly.** It's a React hook —
  hard to test without a renderer. Test the pure `normalize<Field>`
  helpers in the lib module instead (most of them have colocated
  tests in `src/lib/__tests__/`).

## After the edits

- Verify the round-trip mentally: data in → save → reload → same data
  out. If you can't trace it cleanly, run `npm run dev` and exercise
  the create / edit / refresh flow once.
- If the new field needs a lib helper or normalizer with non-trivial
  logic, add a colocated test in `src/lib/__tests__/<field>.test.js`.
- Ship with the **ship-it** skill. Prefix `feat/` for a new field
  serving a new tool, `chore/` for storage plumbing.
