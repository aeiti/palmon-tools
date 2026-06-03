---
name: audit-data-against-screenshots
description: |
  Systematically cross-check an entire dataset in `src/lib/data/`
  against a batch of in-game screenshots, surface every
  discrepancy, get user verification, and ship one corrective
  commit. Use this whenever the user asks to "audit X", "check
  all the X entries against the game", "cross-check this whole
  file", "verify the catalog", or shares multiple screenshots
  that together cover an entire in-game filter/category (e.g. all
  four grades of the Trait Filter, the whole Inventory tab, every
  building level). Sister to the per-row correction skills
  (`correct-palmon-data`, `correct-palmon-trait`) — those are
  point fixes; this is the sweep. Codifies the four-stage pattern
  from PR #153 (issue #138): transcribe master list → diff vs
  current → present structured review → ship one commit. Do NOT
  use this for fixing a single known-wrong entry (those are point
  fixes), for adding net-new data (that's transcription, not
  audit), or for audits the user hasn't asked for.
---

# audit-data-against-screenshots

A dataset audit isn't a correction — it's a *sweep*. You don't
know in advance what's wrong; you find out by comparing every row
to ground truth. The output is a structured review the user can
verify in one pass, followed by a single corrective commit.

## When this fires

The user shares **multiple screenshots that together cover an
in-game tab/filter/category in full**, and asks for a review of
the corresponding data file. Examples:

- "Audit the S/A traits against screenshots" → all four grades of
  the Trait Filter, both tabs.
- "Cross-check every Palmon's element" → species-list screenshots
  covering the full roster.
- "Verify the building level data is right" → screenshots of each
  building's level table.

If the user shares only one screenshot of one row, that's a point
fix — use `correct-palmon-trait` / `correct-palmon-data` instead.

## The four stages

### Stage 1 — Transcribe a master list

Read every screenshot. Build a normalized list of every visible
row, keyed by whatever identifier the data file uses (trait key,
species key, building key + level, etc.). Capture:

- Identifier
- Every field the screenshot shows (effect text, category, grade,
  values, etc.)
- The screenshot it came from (for later reference)

Use plain code (`node -e ...` or a JS array) — don't try to hold
the list in prose. Holding 47+ rows in your head reliably is not
realistic; a structured list is.

### Stage 2 — Diff against the current data

For each row in the master list:

- **Match by key.** Is there an existing entry? If not → addition
  candidate.
- **Compare every field.** Note every difference — grade flips,
  effect text changes, category changes, value differences.

For each entry in the current data NOT in the master list:

- **Is it missing from the screenshots, or removed from the
  game?** A missing screenshot is not the same as a removed
  trait. If you're not sure, ask the user.

Output of this stage is a structured diff: additions, removals,
and changes-per-row.

### Stage 3 — Present the review list

This is the critical step. Do NOT skip to editing.

Build a markdown document with:

- **Headline counts** (total rows in screenshots, matching keys
  in data, number of discrepancies).
- **One table per (category, grade or section).** Each row shows
  the trait/entry, the in-game value, and the current data value
  side by side. Differences highlighted (bold the changed cell).
- **A "Proposed correction" section** at the end — the concrete
  list of edits to make, in a form the user can scan in one pass.

Export the document to `/Users/adam/Desktop/tmp/<topic>-audit.md`
(create the dir with `mkdir -p` if needed) and surface it via
`SendUserFile` so the user can read it independently of the chat.
The chat itself can show the same content inline.

Then **wait for verification**. The user reads the export and
either says "looks good", "fix X first", or "this one is actually
right, skip it". Apply their feedback and re-export if material
changes.

### Stage 4 — Ship one corrective commit

Once verified, apply all the edits in a single commit. Audit-fix
commits aggregate by nature — the value is the *systematic
sweep*, not each individual flip. Per-trait commits would obscure
that.

Commit subject names the scope: "Correct grade of N combat traits
from A to S" (PR #153's pattern). Body summarizes:

- What was audited and against what source.
- Why each change is being made (one paragraph or a list).
- Any schema-rule misreading that caused the original bug (so the
  fix doesn't recur).
- Optionally: a note that the remaining N-M rows match in-game
  (so reviewers know the sweep was exhaustive).

Update the file's header comment if the audit revealed that a
documented rule was misstated. A precise header note is the main
defense against the same audit being needed again later.

Close the issue in the commit message and PR body.

## What the diff actually looks like

Concrete example, from PR #153:

```
| Trait | Effect | Current grade |
|---|---|---|
| Blessed | Crit Rate +8% | **A → S** |
| Clear-Headed | Stun Resist +7% | S ✓ |
| Deadeye | Accuracy +8% | **A → S** |
| ...
```

Two-column current vs. proposed is enough; a third "in-game"
column is redundant when the master list IS the in-game source.
Bold the changed entries; mark unchanged ones with ✓ so the user
can see at a glance that they were checked, not skipped.

## Pitfalls

- **Skipping the review export.** Going straight from diff to
  commit feels efficient but is how mass-misreads ship. The
  review step is cheap; the post-merge un-revert isn't.
- **Conflating "missing from screenshots" with "removed from
  game".** If a row exists in current data but not in any
  screenshot, it might just be on a screen you weren't shown.
  Flag it for the user — don't delete unilaterally.
- **Bundling additions with corrections.** If the screenshots
  include net-new rows not in the data, that's a *transcription*
  task (closer to `transcribe-palmon-skill`). Audits clean up
  existing data; additions are a separate concern. Ship the
  audit commit first, then propose transcription as a follow-up.
- **Trusting one badge color over another in low-res
  screenshots.** A purple and B blue read similarly when the
  badge is small. Zoom in, or ask the user to confirm any close
  calls.
- **Doing this without being asked.** A full audit is expensive
  in user attention. Don't proactively audit a dataset just
  because you noticed it could be wrong — surface the suspicion
  in a few lines and let the user decide whether to commission
  the sweep.

## See also

- `correct-palmon-data` — per-row corrections for skill / species
  data.
- `correct-palmon-trait` — per-row corrections for breeding
  traits (includes the schema rules an audit needs to know).
- `transcribe-palmon-skill` — for ADDING new data from
  screenshots; the inverse direction of this skill.
- `ship-it` — the merge workflow this skill hands off to in
  stage 4.
