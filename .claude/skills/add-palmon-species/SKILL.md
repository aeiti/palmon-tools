---
name: add-palmon-species
description: |
  Add a new species to `src/lib/data/palmon.js` — the basic catalog
  row that's the prerequisite for everything else (roster pages,
  skill data, building assignments, deep-link URLs). Use this
  whenever the user mentions "a new Palmon", "add <name> to the
  catalog", "the game added <name>", or shares a screenshot of a
  brand-new species not yet in `PALMON_SPECIES`. Also use it before
  invoking transcribe-palmon-skill on a species that isn't in the
  catalog yet — skill data requires the species to exist. Covers
  the schema (key / name / element / rarity / optional mythical),
  key conventions, alphabetization rule, and what falls into place
  automatically vs what needs separate work (skill data is a
  separate commit via transcribe-palmon-skill). Do NOT use this for
  adding skill data (use transcribe-palmon-skill), for non-Palmon
  catalog entries (buildings, etc.), or for renaming an existing
  species key (which is almost always the wrong move — see
  correct-palmon-data).
---

# add-palmon-species

Add a new entry to `PALMON_SPECIES` in `src/lib/data/palmon.js`.
Small, well-defined work — one line in one array. The decisions
that matter are picking the `key` and confirming the rarity /
element classification.

## The schema

Each species is a one-line object:

```js
{ key: 'abuzzinian', name: 'Abuzzinian', element: 'electric', rarity: 'ur' }
```

With an optional `mythical: true` for mythical species:

```js
{ key: 'glacewing', name: 'Glacewing', element: 'water', rarity: 'ur', mythical: true }
```

Four required fields, one optional. No other fields — anything else
(skills, traits, breeding pairings, etc.) lives in other files keyed
by `key`.

## Decide first

### 1. The `key`

The `key` is the identifier used everywhere — `PALMON_SKILLS[key]`,
URL params (`/palmon/species/<key>`), localStorage references in
profile state, breeding pairings, building assignments. It's
effectively permanent — see "Don't rename keys" below.

Conventions:

- **Lowercase, ASCII letters only.** No spaces, hyphens, or
  numbers unless the species name itself contains a number (rare).
- **Matches the species name closely** but normalized. "Abuzzinian"
  → `abuzzinian`. "St. Cerverdant" → `stcerverdant`.
- **Distinct from every other key in `PALMON_SPECIES`.** Check
  before adding — duplicate keys silently break the
  `PALMON_SPECIES_BY_KEY` lookup map.

When the display name and the key would be identical after
lowercasing, the key is just the lowercased name. When they'd
diverge (punctuation, special characters), prefer the simplest
ASCII form that's still readable.

### 2. The `element`

One of: `fire`, `water`, `earth`, `electric`. Defined in `ELEMENTS`
at the top of the same file. New elements are extremely rare; if
the screenshot shows an element not in `ELEMENTS`, stop and
confirm with the user before proceeding — adding an element is a
separate change.

### 2. The `rarity`

One of: `sr`, `ssr`, `ur`. Defined in `RARITIES`. Same rule as
elements — new rarity tiers are a separate change.

### 3. Mythical?

The `mythical: true` flag is added only when the species is
explicitly marked mythical in-game. It's separate from rarity —
mythicals are a subset of UR. If unsure, omit the flag; it can be
added later if confirmed.

## Where it goes

Append the entry to the `PALMON_SPECIES` array in
`src/lib/data/palmon.js`. **Maintain alphabetical order by `key`** —
the existing entries are sorted that way, and it makes diffs
readable. Find the alphabetic slot and insert; don't append blindly
to the end.

```js
export const PALMON_SPECIES = [
  // ...existing alphabetical...
  { key: 'newspecies', name: 'New Species', element: 'fire', rarity: 'ur' },
  // ...continued alphabetical...
];
```

That's the only file edit. The downstream lookup maps
(`PALMON_SPECIES_BY_KEY`, `ELEMENT_BY_KEY`, `RARITY_BY_KEY`) are
derived automatically.

## What lands for free

Adding the row instantly enables:

- The species shows up in pickers across the app (Palmon roster
  add-form, breeding selector, building palmon-assignment
  dropdown).
- `/palmon/species/<key>` resolves and renders the species detail
  page (with badges, no skill data yet).
- `transcribe-palmon-skill` can now add an entry under
  `PALMON_SKILLS[key]` for the four skills.
- `PALMON_SPECIES_BY_KEY[key]` returns the row for any consumer
  that needs it.

## What doesn't land for free

These need separate work and separate commits:

- **Skill data.** A new species has no `PALMON_SKILLS[key]` entry
  until you transcribe one — see `transcribe-palmon-skill`.
- **Breeding pairings.** If the breeding data file exists and is
  keyed by species, it needs its own entry.
- **Building palmon-icon art.** None lives in this repo; the in-game
  icons aren't bundled.

## Don't rename keys

A species `key` is effectively permanent. Renaming it requires:

- Editing the row in `PALMON_SPECIES`.
- Updating the corresponding key in `PALMON_SKILLS`.
- Migrating any profile state in `normalize` that references the
  old key (palmon roster entries, building assignments).
- Communicating the rename so users with bookmarks to
  `/palmon/species/<old-key>` aren't stranded.

If a typo exists in an existing key, **stop and ask the user** —
the cleanup is more involved than the rename suggests. The
correct-palmon-data skill calls this out too.

## Commit shape

One species per commit:

```
Add <species name> to species catalog
```

Body optionally notes the source (screenshot date, patch version):

```
Add Mammolith to species catalog

Mythical water-element UR introduced in patch 2.4. Skill data
will follow in a separate commit.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```

If a patch added multiple species, separate commits per species
(matching the per-palmon commit convention from
transcribe-palmon-skill / correct-palmon-data).

## Pitfalls

- **Inserting non-alphabetically.** Breaks the diff-readability
  invariant. Find the right slot.
- **Guessing the rarity / mythical flag.** Confirm from a
  screenshot or in-game UI. Wrong rarity ripples into trait
  calculations, breeding outcomes, anywhere rarity is consumed.
- **Duplicate key.** Will silently overwrite the older entry in
  `PALMON_SPECIES_BY_KEY` (last-write-wins via `reduce`). Grep
  for the key before committing.
- **Adding skill data in the same commit.** Two-line catalog
  entry + 100-line skill data block in one commit makes the
  per-palmon-commit convention harder to honor later. Split.
- **Calling this for a rename.** It's not — see "Don't rename
  keys" above.

## After the edits

- Visit `/palmon/species/<new-key>` in dev to confirm the page
  loads with the right badges (element + rarity + mythical).
  Skill section will show "No skill data yet" — expected.
- No tests to add; `PALMON_SPECIES` is data.
- No sitemap update; species pages are `SECTIONS.HIDDEN`.
- Ship with the **ship-it** skill. Prefix `feat/` (new species
  is a content addition).
