# CLAUDE.md

Orientation for Claude Code sessions opening palmon-tools. Read this
first, then consult the relevant skill in `.claude/skills/` for any
specific task. CONTRIBUTING.md covers the human-facing process;
MEMORY.md is the per-session notes file.

## What this is

A React 19 + Vite + Tailwind 4 fan-site of calculators and trackers
for *Palmon: Survival*. Deployed to GitHub Pages at
`https://aeiti.github.io/palmon-tools/`. All user data lives in
`localStorage` under the key `palmon-tools:v1` — nothing is sent to
a server.

Single author, single-environment, GitHub Pages deploy on every
merge to `main` via `.github/workflows/release.yml` (CalVer tag
`vYYYY.MM.DD.N.B`, footer shows the four-segment `vYYYY.MM.DD.N`).

## Skills index

Project-scoped skills live under `.claude/skills/`. Reach for these
before improvising — each one captures patterns that have specific
gotchas worth honoring.

**Workflow & process**
- `ship-it` — branch → edit → commit → push → PR → merge → sync.
- `plan-feature` — pre-implementation pass for non-trivial features.
- `review-changes` — pre-merge convention check against this repo's
  invariants.
- `release-verify` — post-deploy sanity check on the live site.

**Routing & structure**
- `add-tool` — add a new routable destination (top-level / hub child
  / hidden deep-link), wires `src/routes.js` + `src/tools.js` +
  `src/pages/`.
- `convert-to-hub` — convert an existing top-level tool into a
  hub-with-children (the Inventory pattern).
- `add-legacy-redirect` — URL renames via `LEGACY_REDIRECTS`.

**State & storage**
- `extend-profile-schema` — add a new per-profile field to
  `useProfiles.js` with CRUD ops.

**UI organization**
- `extract-shared-component` — when/where to extract a primitive
  (Tailwind utility / `components/ui/` / `components/<feature>/`).

**Testing**
- `add-lib-tests` — Vitest patterns for pure `src/lib/` helpers.

**Domain data**
- `add-palmon-species` — new entry in `src/lib/data/palmon.js`.
- `transcribe-palmon-skill` — screenshot → `PALMON_SKILLS` entry.
- `correct-palmon-data` — fix existing data (typo / wrong capture /
  game patch).

## Always

These rules apply regardless of which skill is active. Breaking
them either creates bad history, destroys work, or surprises the
user.

- **Branch first.** Never edit on `main`. Create a `feat/` / `fix/` /
  `refactor/` / `chore/` / `docs/` branch off a freshly-pulled main.
- **Merge with `--merge`, not `--squash`.** Per-commit history is
  preserved on main. Per-commit messages need to read independently
  — no `wip` or `fixup` commits.
- **Always `git -C <absolute-path>`** when running git. Bash cwd
  drifts in practice; explicit paths prevent cross-repo mistakes.
- **Never `--no-verify`, never `--amend`, never destructive ops**
  (`reset --hard`, `push --force`, `clean -f`, `branch -D`) without
  explicit user authorization. Recovery from destructive mistakes
  uses `branch -f` and `reflog`, not more force.
- **Never push to `main` directly.** PRs only.
- **Stage specific paths**, never `git add -A` or `git add .`.
- **Alphabetize tool lists** (home cards, nav dropdown, footer,
  README). The registry's `toolsInSection()` handles this for free
  — don't hand-order entries in `TOOLS`.

## Where things live

| Concern | Location |
| --- | --- |
| Routing / nav / tool registry | `src/tools.js` + `src/routes.js` |
| Per-profile state + CRUD | `src/hooks/useProfiles.js` |
| Pure logic helpers | `src/lib/` |
| Static catalog data | `src/lib/data/` |
| Shared UI primitives | `src/components/ui/` |
| Feature-scoped UI | `src/components/<feature>/` |
| Layout / nav / footer | `src/components/layout/` |
| SEO meta wiring | `src/hooks/useDocumentMeta.js` (called via `ToolPageHeader`) |
| Storage envelope + backup | `src/lib/storage.js` |
| Tests | `src/lib/__tests__/` |
| Reusable Tailwind utilities | `src/index.css` |

## Architectural invariants

These are load-bearing. Violating them produces silent breakage
that's expensive to fix later.

- **Tools are registry-driven.** Adding a new page means editing
  `src/tools.js` + `src/routes.js` + `src/pages/<Name>.jsx`. Never
  import pages directly in `App.jsx` — the route table is built
  from `TOOLS`. Pages are `lazy()`-imported.
- **Profile state round-trips through `normalize`.** Any new
  per-profile field must be added to both `makeProfile()` and
  `normalize()` in `useProfiles.js`, with a permissive
  `normalize<Field>()` helper from the field's lib module.
- **Permissive runtime normalize, strict load-time normalize.**
  `updateX` calls a per-entity normalizer that must accept partial
  edits (with `|| existing` fallback). `normalize<Fields>` at load
  prunes empties / dedupes / scrubs dead refs. The two passes have
  different jobs; getting them backwards causes silent data loss.
- **Storage shape is additive only.** `palmon-tools:v1` is
  effectively immutable. New fields are added via permissive
  normalize handling; never renamed or removed in a way that breaks
  loading older state. The backup envelope (`replaceAllProfiles` →
  `normalize`) handles new fields for free if normalize handles them.
- **`profile.level` mirrors `profile.buildings.camp[0].level`** via
  `applyCampLevel` / `syncProfileCampLevel`. Don't add new mirrored
  fields unless unavoidable; if you must, follow that pattern.
- **SEO meta flows from `ToolPageHeader`.** Passing a string
  `subtitle` auto-fills the SEO description. JSX subtitles need an
  explicit `description` prop. Custom-header pages call
  `useDocumentMeta` directly, unconditionally (compute args before
  any early return).
- **No tests on components, hooks, or pages.** This is deliberate
  — see `add-lib-tests`. Test the pure lib functions those layers
  call instead.

## Common starting points

If the user asks to … → invoke …

- "add a new tool / page" → `add-tool` (and `extend-profile-schema`
  if profile-scoped)
- "track X per profile" → `extend-profile-schema`
- "add a new Palmon" → `add-palmon-species` (then
  `transcribe-palmon-skill` for the skill data)
- "this value is wrong" → `correct-palmon-data`
- "split this page into sub-pages" → `convert-to-hub`
- "extract this into a reusable component" → `extract-shared-component`
- "rename this URL" → `add-legacy-redirect`
- "add tests for X" → `add-lib-tests`
- "review this diff" / "is this ready to merge" → `review-changes`
- "design this feature" / "what would it take" → `plan-feature`
- "ship this" / "open a PR" → `ship-it`
- "verify the deploy" / "is it live" → `release-verify`

For substantial features, `plan-feature` first — it identifies
which doing-skills to chain.

## What gets deployed and when

Every push to `main` triggers `.github/workflows/release.yml`,
which tags, builds, and deploys. There is no separate deploy
step. Implications:

- **Every merge to main is a release.** Bundle changes
  accordingly.
- **Don't push to main directly.** PRs only.
- **After a merge, the live site updates in 1–5 minutes.** See
  `release-verify` for the verification checklist.

## Footer

- `CONTRIBUTING.md` — human-facing process (branching, commits,
  PRs).
- `MEMORY.md` — session-derived notes; consult before re-deriving
  established preferences.
- `README.md` — public-facing project overview, tools list.
- `.claude/skills/<name>/SKILL.md` — codified workflows; consult
  the relevant one before any non-trivial task.
