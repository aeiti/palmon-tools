---
name: review-changes
description: |
  Review a pending diff against the palmon-tools repo's conventions
  before commit, push, or merge. Use this whenever the user asks to
  "review this", "check this over", "look at the diff", "is this
  ready to merge", "anything wrong with this PR", or after a
  substantial set of edits is staged but not yet committed. Also use
  it proactively right before invoking the ship-it skill on a large
  diff — catching convention drift here is cheaper than catching it
  in a follow-up PR. Walks through registry invariants, profile
  state round-tripping, SEO/meta wiring, alphabetization,
  ToolPageHeader integration, sitemap maintenance, the load-time vs
  runtime normalize split, and the workflow rules (branch, prefix,
  no --no-verify, no destructive ops). Returns a structured report
  with severity (must-fix / should-fix / nit) grouped by file. Do
  NOT use this for designing a new feature (use add-tool /
  extend-profile-schema), for executing the merge itself (that's
  ship-it), or for adding new tests (that's add-lib-tests).
---

# review-changes

A repo-specific code review. The conventions in palmon-tools are
small in number but load-bearing — getting them right keeps the
codebase coherent; getting them wrong creates drift that's
expensive to fix later. This skill walks a pending diff through
the conventions, in priority order, and produces a punch-list.

The other skills in this repo (`add-tool`, `extend-profile-schema`,
`transcribe-palmon-skill`, `add-lib-tests`) define *how* to do
things. This skill checks that they *were* done.

## What "the diff" means

Apply the checks to whatever's about to leave your hands:

| Situation | What to review |
| --- | --- |
| Pre-commit | `git -C <repo> diff` (unstaged) + `git -C <repo> diff --staged` |
| Pre-merge on a branch | `git -C <repo> diff main...HEAD` (everything the branch adds vs. main) |
| Reviewing a remote PR | `gh pr diff <number>` |
| Just-merged retrospective | `git -C <repo> show <merge-commit>` |

Read the full diff once before reacting. Skimming and commenting in
flight produces shallow reviews; understanding the whole change
first lets you catch things that only show up across files (e.g. a
new profile field that's added to `makeProfile` but missing from
`normalize`).

## The checklist, in priority order

Work top to bottom. Higher items more often produce bugs;
lower items are stylistic.

### 1. Registry invariants (must-fix when violated)

- **New routable page** → did `src/tools.js` get a new `TOOLS` entry
  AND `src/routes.js` get a new `ROUTES.<key>` constant AND the page
  file appear under `src/pages/`? Missing one of the three means the
  page is half-wired.
- **No direct page imports in `App.jsx`.** The route table is built
  from `TOOLS`. A direct `import Foo from './pages/Foo.jsx'` in
  `App.jsx` breaks the registry invariant.
- **`lazy(() => import('./pages/<Name>.jsx'))`** for every page in
  `TOOLS`. Static imports defeat the code-splitting that's already
  baked in.
- **Hub children registered correctly.** If the diff adds a sub-page
  to an existing hub, the child's `section: SECTIONS.<HUB>` must
  match an entry in `CHILD_SECTIONS`. If it adds a brand-new hub
  with children, all three things must land together: the new
  `SECTIONS.<HUB>` value, children tagged with it, and a
  `CHILD_SECTIONS[<hub-key>] = SECTIONS.<HUB>` entry.

### 2. Profile state round-trip (must-fix when violated)

A new per-profile field must round-trip through localStorage cleanly.
For any diff touching `src/hooks/useProfiles.js`:

- **`makeProfile()` extended** with the new field's empty value (use the
  `empty<Field>()` helper from the lib module, not an inline `[]` /
  `{}`).
- **`normalize()` extended** with `<field>: normalize<Field>(p.<field>)`.
  This is the load-time pass; missing it means the field disappears on
  next page load.
- **Runtime normalize is permissive.** `updateX` should call a
  per-entity normalizer that accepts partial shapes (`normalizeX(merged)
  || existing`). If the runtime normalizer returns null on a partial
  edit, the user's edit silently vanishes — bad UX.
- **Cross-field scrubbing.** If the new field references ids from
  another field (palmon ids, building ids), the scrub function is
  called from `normalize`, `deleteOtherField`, and
  `resetActiveOtherField`. Three call sites; missing one leaves
  dangling refs in some flows.
- **Each new CRUD op exported** at the bottom of `useProfiles()`.
  Forgetting the export means consumers can't see the function — the
  file compiles fine.

### 3. SEO / meta wiring (should-fix when violated)

- **New page uses `ToolPageHeader`** when its header is a standard
  title + subtitle. ToolPageHeader handles `useDocumentMeta`
  automatically.
- **String subtitles auto-fill the SEO description.** If the subtitle
  is JSX, an explicit `description` prop is passed instead.
- **Custom-headered pages call `useDocumentMeta` directly** with
  `formatPageTitle(...)`. The hook must be called *unconditionally* —
  if there's an early-return branch, compute the args first.
- **`public/sitemap.xml` updated** for any new non-`HIDDEN` route.
  Hidden deep-link routes (e.g. `/palmon/species/:speciesKey`) stay
  out of the sitemap.
- **`README.md`'s Tools list updated** if the new tool is in the
  `PROFILE` section, alphabetized.

### 4. Storage shape evolution (must-fix when violated)

- **Additive only.** Old fields can't be renamed or removed without a
  migration path through `normalize`. Users have data in their
  browsers from previous sessions.
- **`palmon-tools:v1` key unchanged.** The version is effectively
  immutable; backwards-compatible additions live in `normalize`.
- **Backup envelope handled by `replaceAllProfiles` → `normalize`.**
  No separate backup schema to update if normalize handles the new
  field.

### 5. Alphabetization (must-fix when violated)

- **Tool lists, nav surfaces, footer columns:** all sorted by visible
  name. The registry handles this for free via `toolsInSection()` — a
  diff that hand-orders tools in `TOOLS` to control display order is
  fighting the system. Display order = alphabetical, period.
- **`ROUTES` constants:** alphabetized by key inside the object
  literal. Diff-readability convention.
- **`README.md` Tools list:** alphabetized by display name.

### 6. Tests (should-fix when violated)

- **New non-trivial lib helper** has a colocated test in
  `src/lib/__tests__/<name>.test.js`. Normalizers, parsers,
  formatters, computed reducers all qualify.
- **No tests on components / hooks / pages.** This repo doesn't test
  those — see the `add-lib-tests` skill. A new
  `Notes.test.jsx` is almost certainly fighting the convention.
- **Bug fixes** have a regression test that would have caught the
  bug.

### 7. Component organization (nit unless egregious)

- **Shared primitives in `src/components/ui/`.** Used by 2+ features.
- **Feature-scoped components in `src/components/<feature>/`.** Used
  by one feature, but extracted for size or testability.
- **Reusable Tailwind class compositions in `index.css`** (e.g.
  `.h-page`, `.h-section`, `.link-inline`). Not as one-off
  className strings sprinkled across files.

### 8. Workflow (must-fix when violated)

These checks apply to the *git state* of the change, not the
file contents:

- **Branch is off the right base.** Default: a fresh `main`.
  Override: the staging branch (e.g. `chore/claude-skills`) when in
  batch mode.
- **Branch name prefix matches the change.** `feat/` / `fix/` /
  `refactor/` / `chore/` / `docs/`.
- **Commits are clean and self-contained.** No `wip` or `fixup`
  messages. Per-commit messages survive into main via merge commits
  — they need to read independently.
- **No `--no-verify`, no `--amend`, no destructive resets** without
  explicit user authorization.
- **Files staged explicitly** (`git add path/to/file`), not via
  `git add -A` or `git add .`.

## How to report findings

Group by severity, then by file. Be specific about the line and
the fix:

```
Must-fix:
  src/hooks/useProfiles.js
    - normalize() missing the new `journal` field — will be dropped on
      page reload. Add `journal: normalizeJournal(p.journal)` to the
      object literal returned at lines 132-152.

Should-fix:
  src/pages/Journal.jsx
    - Custom header bypasses ToolPageHeader; useDocumentMeta is not
      called, so the route has no per-page title. Either switch to
      ToolPageHeader or add a useDocumentMeta call.

Nits:
  public/sitemap.xml
    - URLs are not in any particular order. Existing entries are
      roughly alphabetical; the new /journal entry should slot
      between /inventory/speedups and /notes.
```

A few delivery rules:

- **Lead with the must-fixes.** If the diff has any, the
  should-fixes and nits can wait until those are addressed.
- **Quote line numbers and exact paths.** "Around line 50" is
  weak; "line 47-52 in `src/hooks/useProfiles.js`" is actionable.
- **Suggest the fix, don't just flag the problem.** "Missing
  alphabetical sort — see how `toolsInSection()` already handles
  this" beats "this isn't sorted."
- **Skip categories with nothing to report.** Don't pad a clean
  review with "Storage: OK." Empty sections suggest the reviewer
  didn't check; a tight punch list with "Nothing flagged on
  storage or alphabetization" at the end suggests they did.

## Pitfalls in reviewing

- **Over-noting nits.** A review that's 80% nits buries the real
  problems. If something is genuinely subjective preference, skip
  it. The reviewer's job is to catch drift and bugs, not to enforce
  taste.
- **Missing the load-bearing change.** Diffs often have one or two
  decisions that determine whether the change works at all
  (registry wiring, normalize updates, ToolPageHeader integration)
  surrounded by routine fluff. Find the load-bearing change first;
  everything else is context.
- **Suggesting fixes that fight conventions.** "Add a test for
  Journal.jsx" violates the no-component-tests rule. "Manually
  order the TOOLS entries" violates the alphabetization rule.
  Re-read the relevant skill if unsure.
- **Reviewing in isolation.** Diff context matters — a single-file
  diff might look clean while breaking an invariant in another file
  the diff doesn't touch (e.g. adding `notes` to `makeProfile`
  without extending `normalize`). Read the whole diff before
  commenting.
- **Confusing structural problems with style.** A missing
  `normalize()` extension is a bug; an awkwardly-named variable is
  a nit. Don't grade them with the same intensity.

## After the review

- If the diff is clean, say so explicitly. "Reviewed: nothing to
  flag" is a useful signal.
- If the diff has must-fixes, list them and offer to apply the
  fixes (don't auto-apply unless asked).
- If the change is ready to ship, hand off to the **ship-it**
  skill.
