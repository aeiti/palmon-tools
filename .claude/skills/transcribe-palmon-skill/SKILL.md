---
name: transcribe-palmon-skill
description: |
  Transcribe Palmon skill data from in-game screenshots into
  `src/lib/data/palmonSkills.js`. Use this whenever the user shares a
  screenshot of a Palmon's skill UI, asks to "add skill data for X",
  "update skills for X", "capture L30 values for X", "log ascension
  effects for X", or pastes a skill-detail screen and asks to write it
  up. Also use it when the user shares a roster portrait grid and asks
  to fill in skill data for one of the species shown. Covers the
  effectTemplate + effectValues + ascensionEffects schema, the four-skill
  UI ordering, the level-pill misinterpretation pitfall, the per-palmon
  commit convention, and what to do when a screenshot shows a
  skillfruit upgrade cost (which the current schema doesn't have a field
  for yet). Do NOT use this for non-skill catalog data (species rarity,
  building levels, inventory items) or for editing skill render logic.
---

# transcribe-palmon-skill

Transcribe what's on a Palmon skill screenshot into the data file. The
schema is simple but the in-game UI is easy to misread — most of this
skill is about correctly mapping what you see on screen to the right
field at the right level.

## Where the data lives

| What | Where |
| --- | --- |
| Species roster (key, name, element, rarity) | `src/lib/data/palmon.js` → `PALMON_SPECIES` |
| Skill data (4 skills per species, with level values) | `src/lib/data/palmonSkills.js` → `PALMON_SKILLS[<speciesKey>]` |
| Renderer (template substitution + "fully known" check) | `src/lib/palmonSkills.js` (don't touch when transcribing) |
| Detail page that displays the data | `src/pages/PalmonSpecies.jsx` (don't touch when transcribing) |

The species `key` is the lowercase identifier used everywhere — confirm
the spelling against `PALMON_SPECIES` in `palmon.js` before adding a
new entry. Don't guess from the displayed name (e.g. it's `auktyke`,
not `aukteyke`).

## The schema

Each species maps to an array of up to **4 skills**, in the order the
in-game skill panel shows them: **top-left, top-right, lower-left,
"Max" (right / 4th)**. Each skill entry:

```js
{
  name: 'Princely Peck',
  effectTemplate: 'Deals {damage}% damage to a single enemy.',
  effectValues: {
    damage: { 1: 80, 2: 80.82, 30: /* TBD */ },
  },
  ascensionEffects: [
    'Damage +15%',  // ★
    'Damage +35%',  // ★★
    'Damage +50%',  // ★★★
    'Damage +75%',  // ★★★★
    'Damage +100%', // ★★★★★
  ],
},
```

Key fields:

- **`name`** — the skill name verbatim. Match capitalization and
  spacing exactly as shown in-game.
- **`effectTemplate`** — the effect sentence with `{var}` placeholders
  for numbers that change with level. One template covers all levels.
  Pick variable names that describe the stat (`damage`, `hp`, `speed`,
  `boost`, `chance`, `duration`) — these names show up in screenshots
  and in the rendered output if substitution fails.
- **`effectValues`** — sparse map of `{ variableName: { level: value } }`.
  Levels are 1-30. Add only the levels you can read from the
  screenshot. Don't extrapolate or interpolate — missing levels render
  as `"TBD"` and that's correct.
- **`ascensionEffects`** — array of 0 or 5 strings, one per star tier
  (1★ to 5★). The 4th "Max" skill typically has `[]`. Other skills
  have all 5; if you can only see some, leave the array shorter and
  flag the rest as not yet captured (don't pad with empty strings).

## Read the UI correctly

The skill panel has two number widgets that are easy to confuse:

- **Current skill level** — small icon-badge number layered on the
  skill icon around the portrait. This is the level whose value you're
  about to record.
- **Lvl pill** — a pill button that says e.g. "Lv +3" or "Lv 25 → 30".
  This is the **upgrade button** showing how many levels you'd buy.
  It is **not** the current level. Misreading the pill as the current
  level is the most common transcription error — the captured value
  ends up filed under the wrong level and silently corrupts the data.

When in doubt, the small badge on the skill icon is the source of
truth. If only the pill is visible, ask the user what level the skill
is currently at before recording.

### Star pips for ascensionEffects

Each star tier is unlocked by ascending the skill. In the UI the pip
row reads left to right (1★ → 5★). The effect text next to each
pip is the entry for that index in `ascensionEffects`:

| Pip count | Array index |
| --- | --- |
| ★ | `ascensionEffects[0]` |
| ★★ | `ascensionEffects[1]` |
| ★★★ | `ascensionEffects[2]` |
| ★★★★ | `ascensionEffects[3]` |
| ★★★★★ | `ascensionEffects[4]` |

If the screenshot is showing only the currently-active tiers, the
later entries may not be visible. Don't invent them — leave the array
shorter and ask for a higher-tier screenshot when needed.

## Per-screenshot workflow

For each skill visible in the screenshot:

1. **Identify the species.** Confirm the species `key` against
   `PALMON_SPECIES` in `src/lib/data/palmon.js`.
2. **Identify the skill slot.** Top-left = index 0, top-right = 1,
   lower-left = 2, "Max"/4th = 3. If the species doesn't exist yet in
   `PALMON_SKILLS`, create the array with placeholders for the slots
   you can't see (`{ name: '...', effectTemplate: '...' }` is fine —
   `effectValues` can be `{}` and `ascensionEffects` can be `[]`).
3. **Read the current level** from the small badge on the skill icon.
   Not the Lv pill.
4. **Record the value(s)** under `effectValues[<var>][<level>]`. Match
   the decimal precision shown (e.g. `80.82`, not `80.8` or `81`).
5. **Read ascension effects** from the star tier rows. Capture all
   tiers visible; leave missing tiers off the end of the array.
6. **Note the skillfruit cost** if shown (see "Schema gap" below).
7. **Sanity check existing values.** If a value already exists at that
   level for that variable, confirm it matches the screenshot before
   moving on. A mismatch means either the previous capture was wrong
   or the in-game value changed — flag it to the user.

## The 4th "Max" skill

The fourth slot is a passive stat boost, usually only meaningful at
L30. Almost always:

```js
{
  name: 'Sturdy',  // or whatever the species' passive is named
  effectTemplate: 'Gains +{boost}% Total Attack, Defense, and HP.',
  effectValues: {
    boost: { 30: 10 },  // single value, only at level 30
  },
  ascensionEffects: [],  // empty
},
```

If a screenshot only shows the L30 value for the passive, capturing
just `{ 30: <value> }` is correct — don't backfill earlier levels with
extrapolated math.

## Evolution skills are a different schema in a different file

When a screenshot shows a Palmon at evolution stage 4, the 5th
skill (the "evolution skill" — e.g. Cinder Feast, Forest
Awakening, Absolute Zero) is **not** part of `palmonSkills.js`.
It belongs in `src/lib/data/palmonEvolutionSkills.js` with a
flat shape, distinct from the base 4-skill schema above:

```js
export const PALMON_EVOLUTION_SKILLS = {
  glacewing: {
    name: 'Absolute Zero',
    effect: 'Enemies take 500% damage when Deep Freeze ends.',
  },
  // ...
};
```

Key differences from the base-skill schema:

- **No `effectTemplate` + `effectValues`** — the effect text is
  flat. Evolution skills have only a Lv 10 / max value; there's
  no level curve to capture, so the template-with-substitution
  shape would be over-engineered.
- **No `ascensionEffects`** — evolution skills don't ascend in
  the same way base skills do. Don't add a placeholder array.
- **No level pill, no skillfruit cost** — capture the effect
  text verbatim and move on.

Evolution skills are keyed by the **base species** key (not the
evolved name) — Cryovern's skill lives under `glacewing`, since
`PALMON_EVOLUTIONS[glacewing] = { name: 'Cryovern' }`.

Species without an evolution (currently `oleana`, `spookaboo`)
have no entry in `palmonEvolutionSkills.js`.

## Schema gap: skillfruit upgrade cost

The skill panel shows the skillfruit cost for the next upgrade
("Required: 35 Skillfruit"). The current schema has **no field for
this** — it isn't captured in `palmonSkills.js`.

When a screenshot shows a skillfruit cost:

- **Mention it in the commit body** so the data lands in git history
  even before the schema is extended. Example: "Skillfruit cost for
  L24→L25 on Princely Peck: 28."
- **Flag it to the user** if this is the first non-maxed skill UI
  you've seen in this session — ask whether to add a schema field
  (e.g. `upgradeCost: { 25: 28 }`) before transcription gets too deep.

When the field eventually exists, the commit-body notes are a usable
starting point for a backfill pass.

## Per-palmon commit convention

**One commit per species.** Even if the screenshot covers multiple
skills, the diff is small enough to fit in one commit, and the
per-palmon granularity means future bisects and reviews can target a
single species cleanly.

Commit subject style:

```
Capture <species name> skill data (L<level>)
```

Or, if a single skill is being updated:

```
Capture <species name> <skill name> L<level> values
```

Body explains what's now known and what's still TBD. Example:

```
Capture Bruiseberry L20-21 Fiery Warm-Up values

Recorded `speed` at L20 (43.11) and L21 (43.8) from the in-game
skill panel. Ascension effects already captured in a prior pass.
L1-19 and L22-30 still TBD.

Skillfruit cost for L21→L22 on Fiery Warm-Up: 42. (No schema field
for this yet — preserving in history for a future backfill.)

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```

## Pitfalls

- **Misreading the Lv pill as the current level.** See "Read the UI
  correctly" — the pill is the upgrade button. If unsure, ask.
- **Truncating decimals.** Match the precision shown exactly. `80.82`,
  not `80.8`. Floats compare exactly in the renderer.
- **Extrapolating missing levels.** If a level isn't visible, leave it
  out. Renders as "TBD" which is correct. Don't compute from
  growth rates.
- **Padding `ascensionEffects` with empty strings.** Leave the array
  shorter instead. An empty string is a valid effect (it'd render as
  nothing), so it's indistinguishable from "captured but blank."
- **Wrong species key.** The displayed name and the data key can
  diverge (e.g. "Aukteyke" displayed → `auktyke` in the data). Always
  verify against `PALMON_SPECIES` before committing.
- **Wrong skill slot.** Top-left / top-right / lower-left / "Max" maps
  to array indices 0 / 1 / 2 / 3 in that exact order. Adding a skill
  to the wrong index silently mis-attributes its data.
- **Multi-variable skills** — some skills have more than one variable
  in the template (e.g. `'Deals {damage}% damage with {chance}% chance
  to crit.'`). Make sure both variables get their per-level entries
  under the right key.
- **Updating in place vs creating new.** If `PALMON_SKILLS[<key>]`
  already exists, update the right indices rather than re-adding the
  species. The renderer dedupes by index, not by name.

## After the edits

- No tests to add — the data is exercised by `PalmonSpecies.jsx` via
  the renderer. Verify visually by running `npm run dev` and
  navigating to `/palmon/species/<key>` if a sanity check is wanted.
- Don't update `sitemap.xml` — species pages are `SECTIONS.HIDDEN`,
  intentionally deep-link-only.
- Ship via the **ship-it** skill. Branch prefix `chore/` (data-only
  edit, no behavior change) or `feat/` (adds new species to the
  catalog for the first time).
