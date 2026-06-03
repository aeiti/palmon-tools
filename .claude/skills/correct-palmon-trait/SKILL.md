---
name: correct-palmon-trait
description: |
  Fix existing entries in `src/lib/data/palmonTraits.js` — wrong
  grade (S/A/B/C), wrong effect text, wrong category (combat vs
  work), or a typo in a trait name. Use this whenever the user says
  "this trait is wrong", "X should be S not A", "the effect for Y
  is actually Z", "the game updated the trait values", or shares a
  screenshot of the Trait Filter that contradicts the file. Sister
  to `correct-palmon-data` but for the breeding-trait catalog,
  which has its own schema rules: combat trait names are unique to
  a single grade, work trait names reuse across S/A/B, a single
  `(category, grade)` bucket can hold multiple traits hitting the
  same stat at different magnitudes (e.g. S Crit Damage holds both
  Ruthless +8% and Heartless +15%), and C-grade traits are
  exclusively debuffs (negative effects). Do NOT use this for
  adding new traits (that pattern doesn't have a skill yet — extend
  the file directly and update the header note if needed), for
  systematic audits of the whole catalog (use
  `audit-data-against-screenshots`), or for non-trait data (those
  have their own skills).
---

# correct-palmon-trait

Fix data that's already in `src/lib/data/palmonTraits.js`. Same
posture as `correct-palmon-data`: the existing value was captured
deliberately, so the bar to change it is higher than the bar to add
a new value. Verify against a fresh screenshot before editing.

## The trait schema, briefly

Each entry is keyed by camelCase identifier:

```js
heartless: {
  name: 'Heartless',
  category: 'combat',
  grades: {
    S: 'Crit Damage +15%',
  },
},
```

- **`name`** — display string as it appears in-game.
- **`category`** — `'combat'` or `'work'`. Drives which tab the
  Trait Filter shows the trait under.
- **`grades`** — only the grades that exist for this trait. A
  trait can appear at one grade (most combat traits), or several
  (most multi-tier work traits like Caffeinated S/A/B).

## Schema rules that bit me before

These rules are load-bearing. Misreading them produces audits that
look correct but ship the wrong data.

- **Combat trait names are unique to a single grade.** "Heartless"
  appears in S only; it does not also appear in A. If you see a
  combat trait you'd expect at one grade showing up at another,
  trust the screenshot.
- **Work trait names reuse across S/A/B.** "Caffeinated" exists at
  S (50% slower), A (25%), and B (10%). All three live under the
  same key with all three grades populated.
- **A single (category, grade) bucket can hold multiple traits
  hitting the same stat at different magnitudes.** S-grade Crit
  Damage has both Ruthless +8% and Heartless +15%. S-grade Crit
  Damage Reduction has Steel Skull +8% and Diamond Skull +15%.
  This is the rule that caused issue #138 — eight traits were
  mis-graded because the original capture assumed "one trait per
  (stat, grade)".
- **C-grade traits are exclusively debuffs.** Every C entry is a
  negative effect (e.g. Softie: Crit Damage -3%, Sluggard: Move
  Speed -10%). If you see a C-grade trait with a `+` effect,
  something's wrong with the capture.
- **Stun Resist has a missing grade.** Screenshots show no B-tier
  Stun Resist trait — the gap is real, not a missing capture.
  Don't invent one to fill the slot.

## Verify before changing

| Trigger | What to verify |
| --- | --- |
| User says "X is wrong" | Ask for an in-game screenshot if not provided. Confirm the trait name, category (combat/work), and the badge color (S gold / A purple / B blue / C grey). |
| Screenshot contradicts file | Confirm the screenshot is from the current game version. Read the badge carefully — A purple and B blue are visually similar at small sizes. |
| Game patch notes mention a change | Confirm which entries are affected. Patch notes usually don't enumerate trait reshuffles. |

If you can't reproduce the discrepancy from the source material,
don't change it. Ask.

## Decide the kind of change

### a) Grade flip — "Correct" or "Re-grade"

The trait's effect is right, but it's at the wrong grade. This is
the most common correction (it's what issue #138 was).

Commit subject: `Correct <trait> grade from <old> to <new>`
(e.g. "Correct Heartless grade from A to S"). For a sweep that
touches several traits, summarize: "Correct grade of N combat
traits from A to S" — body lists each.

### b) Effect text — "Fix" or "Correct"

The trait is at the right grade, but the effect string is wrong
(typo, wrong magnitude, wrong stat). Commit subject:
`Fix <trait> effect text` for typos, `Correct <trait> <stat> at
<grade>` for value changes.

### c) Category flip — "Correct"

Trait was tagged `combat` but it's a work trait, or vice versa.
Rare; double-check the tab the screenshot was taken on.

### d) Game patch — "Update"

The game changed trait values. Commit subject: `Update trait
values for game patch <version>`.

## When to update the header note

The file's leading comment describes the schema rules above. If
your correction reveals that a rule was misstated (as happened in
PR #153 — the prior note said "each (combat, grade) slot has a
unique name" which was misread as "one trait per (stat, grade)"),
update the comment alongside the data fix in the same commit.

A precise header note is the main defense against future
mis-corrections. Keep it tight, but accurate.

## Pitfalls

- **Reading the badge color wrong.** A is purple, B is blue. At
  small sizes they're easy to confuse. Zoom the screenshot.
- **"Fixing" a screenshot that's actually stale.** If the user
  shares a screenshot from a prior game version, the data may have
  been updated correctly in a later patch. Confirm the screenshot
  date.
- **Assuming the rule from one stat applies to another.** Stun
  Resist has no B-grade trait; that doesn't mean Tenacity is also
  missing a grade. Each stat's grade coverage is independent.
- **Promoting a single trait without checking siblings.** If you're
  about to flip one A→S because it has a high magnitude, scan the
  rest of the file for siblings at the same magnitude — they may
  all need the same flip. (The pattern in issue #138 was eight
  combat traits, not one.)
- **Bundling unrelated corrections.** Per-correction or
  per-related-batch commits. Don't mix a grade flip with a typo
  fix in another trait.

## After the edits

- Run `npm test` and `npm run lint`.
- The Breeding tool reads from this file directly — spot-check
  the affected grades in dev if the change is observable (a trait
  moving from A to S will change which Palmon-rarity rows it
  shows up under, depending on the page's filtering logic).
- Ship with **ship-it**. Branch prefix `fix/` for grade/effect
  corrections, `chore/` for game-patch updates.

## See also

- `audit-data-against-screenshots` — when the user shares a full
  set of Trait Filter screenshots and wants a systematic
  cross-check rather than per-trait corrections.
- `correct-palmon-data` — same posture, different file
  (`palmonSkills.js` / `palmon.js`).
