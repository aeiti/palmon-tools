---
name: correct-palmon-data
description: |
  Fix existing entries in `src/lib/data/palmonSkills.js` (or `palmon.js`)
  — typo in a skill name, wrong value at a level, ascension effect that
  doesn't match the in-game text, a value that shifted in a game
  patch. Use this whenever the user says "this is wrong", "the value
  for X is actually Y", "the skill name should be Z", "the game
  updated the values", "I made a typo in", or shares a screenshot
  that contradicts what's in the data file. Sister to
  transcribe-palmon-skill, which is for adding new data — this is for
  changing data that already exists. Different vigilance: the
  existing value is presumed correct unless the new evidence is
  unambiguous. Different commit style: "Correct" or "Update" (after a
  patch) rather than "Capture". Covers verify-before-changing, the
  multi-species patch case, when to add a regression test, and how
  the commit message should explain the source of truth. Do NOT use
  this for adding new entries (that's transcribe-palmon-skill or
  add-palmon-species) or for renderer/page bugs (those aren't data).
---

# correct-palmon-data

Fix data that's already in `src/lib/data/palmonSkills.js` or
`src/lib/data/palmon.js`. Different mindset than transcription: the
existing value was captured deliberately, so the bar to change it is
higher than the bar to add a new value.

## Verify before changing

The existing entry was put there by someone (you, the user, or
earlier-you) reading a screenshot. Treat it as ground truth until
the new evidence is unambiguous. Three sources of "this needs to
change":

| Trigger | What to verify |
| --- | --- |
| User says "X is wrong" | Ask for the in-game screenshot if not provided. Confirm the species, skill name, and level before changing. |
| Screenshot contradicts file | Confirm the screenshot is current (game version may have changed). Compare both values explicitly in the chat before editing. |
| Game patch notes mention a change | Confirm which entries are affected. Patch notes often miss exact numeric changes; treat them as a prompt to re-check, not a complete list. |

If you can't reproduce the discrepancy from a fresh look at the
source material, **don't change it**. Ask. A wrong correction is
worse than the original (the existing value at least came from a
deliberate capture; a wrong correction destroys that signal).

## Decide the kind of change

Three shapes, each with a different commit style:

### a) Typo / cosmetic — "Fix"

Skill name typo, ascension effect text doesn't match in-game string,
template placeholder named badly. The value was captured correctly,
the surrounding text was wrong.

Commit subject: `Fix <species> <skill> <thing>` (e.g. "Fix
Bruiseberry Berry Bash skill name spelling").

### b) Wrong capture — "Correct"

The value was captured wrong — most likely the lvl-pill-vs-current-level
pitfall, decimal truncation, or wrong skill slot. The game value
hasn't changed; the file just disagrees with the screenshot.

Commit subject: `Correct <species> <skill> <var> at L<level>`
(e.g. "Correct Auktyke Princely Peck damage at L2: 80.82 (was
80.81)").

Body explains the source of truth and what was misread:

```
Correct Auktyke Princely Peck damage at L2

The captured value was 80.81 — the screenshot shows 80.82. Likely
an off-by-one decimal-rounding mistake during the original
transcription. New screenshot at <date> confirms the correct value.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```

### c) Game patch — "Update"

The game changed the value. The old capture was correct at the
time; the new value is correct now. This is the most disruptive
case because it can cascade across many species.

Commit subject: `Update <species> <skill> values for game patch
<version>` if the patch is identified, or `Update <species>
<skill> values (game patch)` if not.

Body explicitly names the patch and the source:

```
Update Bruiseberry Fiery Warm-Up values for game patch 2.3

Patch 2.3 rebalanced Armigo Hut training-speed bonuses. New
values from the patch's skill panel:
- L20 speed: 43.11 → 48.5
- L21 speed: 43.8 → 49.3

Ascension effects unchanged.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```

## Multi-species patches

A game patch usually touches multiple species. Per the per-palmon
commit convention from **transcribe-palmon-skill**, each species
gets its own commit. Don't bundle "patch 2.3 changes" into one
giant commit — future bisects need per-species granularity.

If the patch touched 12 species, that's 12 commits. Subjects can
share the patch reference for searchability:

```
Update Auktyke values for game patch 2.3
Update Bruiseberry values for game patch 2.3
Update Cerverdant values for game patch 2.3
...
```

## Skill catalog corrections (palmon.js, not palmonSkills.js)

Rare — element, rarity, mythical flag changes are usually a
game-side rebalance, not a transcription error. Same three
categories (Fix / Correct / Update) apply.

Be extra careful changing the `key`. The species `key` is the
identifier used everywhere — `PALMON_SKILLS[key]`, `BUILDINGS`
references, `URL params`, `localStorage` persistence. Renaming a
key requires a coordinated change across all those, plus a
migration in `normalize` to translate old localStorage entries.
If you find yourself wanting to change a key, stop and ask the
user — it's almost always wrong.

## When to add a regression test

For "Correct" changes (b), if the misread is the kind that could
happen again (decimal rounding, wrong level), add a test in
`src/lib/__tests__/palmonSkills.test.js` (creating it if needed)
that asserts the value renders correctly via `renderSkillEffect`.
Pattern, following the **add-lib-tests** skill:

```js
describe('renderSkillEffect for Auktyke Princely Peck', () => {
  it('renders 80.82 at L2', () => {
    const skill = PALMON_SKILLS.auktyke[0];
    expect(renderSkillEffect(skill, 2)).toBe(
      'Deals 80.82% damage to a single enemy.',
    );
  });
});
```

For "Fix" (a) and "Update" (c) changes, no regression test —
they don't represent a recurring failure mode.

## Pitfalls

- **Changing values without a fresh screenshot.** Memory of "I
  think it was X" is not evidence. If the screenshot isn't on
  hand, ask.
- **Bundling unrelated changes.** A "while I'm in there"
  correction to a different skill / species belongs in its own
  commit. Per-palmon granularity exists for a reason.
- **Changing existing levels without checking the renderer.**
  `effectValues` uses exact equality in the renderer. A value
  edit (80.81 → 80.82) is fine; restructuring the keys (e.g.
  renaming a variable from `damage` to `dmg`) breaks
  `effectTemplate` substitution and renders as "TBD".
- **Renaming a species `key`** — see "Skill catalog corrections"
  above. Almost always the wrong move.
- **Quiet patch updates.** When the game patches, ascension
  effects might also change. Check those too, even if the patch
  notes only call out values.

## After the edits

- Run `npm test` to confirm renderer tests still pass.
- If the change is visible (e.g. a stat that's prominently shown
  on the species detail page), spot-check `/palmon/species/<key>`
  in dev to confirm it renders right.
- Ship with the **ship-it** skill (or, when in skills-batch
  mode, merge into the staging branch directly). Branch prefix:
  `fix/` for typo + correction cases, `chore/` for game-patch
  updates.
