---
name: plan-feature
description: |
  Walk a non-trivial feature request through a structured
  pre-implementation pass before writing any code. Use this whenever
  the user says "I'd like to add X", "let's design Y", "what would
  it take to Z", "I want a new tool that does W", or describes a
  feature that's clearly bigger than a one-line tweak. Also use it
  proactively when handed a request that touches multiple files,
  has unanswered design questions, or could be approached several
  different ways. Produces a structured plan: files to touch,
  which other skills apply, what to ask the user before writing,
  and a phased implementation order. Catches design problems while
  they're still cheap. Do NOT use this for tiny edits (just do
  them), well-defined data entry (use the data skills directly),
  or when the user has already described the implementation
  approach in detail (they don't need a plan — they need
  execution).
---

# plan-feature

Stop and think before writing. For anything that's larger than a
one-file tweak, the cost of fixing a bad design choice after the
code lands is much higher than the cost of asking one or two
clarifying questions up front.

This skill exists because palmon-tools has accumulated several
overlapping conventions — registry-driven routing,
permissive-then-strict normalize, ToolPageHeader-driven SEO
meta, per-profile state — and a request like "add a journal
tool" intersects all of them. A 5-minute planning pass surfaces
the intersections so the implementation goes once.

## The four passes

Work through these in order. Don't write any code until pass 4.

### Pass 1: Understand the request

What is the user actually asking for? Three questions:

- **What's the user-visible behavior?** State it in one
  sentence. If you can't, ask before continuing.
- **Who uses it and when?** Frequency matters — a one-off
  developer tool gets a different treatment than a feature
  every profile sees.
- **What's the success criterion?** "It works" isn't one. "I can
  add a note, see it on the list, and refresh without losing
  it" is.

This sounds basic but it's where most misunderstandings live.
"Add a journal" could mean a new page, a new section of an
existing page, or a free-form text field on the profile — three
different implementations.

### Pass 2: Map onto the repo

Read enough of the existing code to understand where the
feature lives. The big-picture inventory:

| Concern | Where it lives |
| --- | --- |
| Routing / nav / tool registry | `src/tools.js` + `src/routes.js` |
| Per-profile state + CRUD | `src/hooks/useProfiles.js` |
| Static catalog data | `src/lib/data/` (palmon.js, buildings.js, etc.) |
| Pure logic helpers | `src/lib/` |
| Shared UI primitives | `src/components/ui/` |
| Feature-scoped UI | `src/components/<feature>/` |
| Layout, nav, footer | `src/components/layout/` |
| SEO meta wiring | `src/hooks/useDocumentMeta.js` (called via `ToolPageHeader`) |
| Storage envelope + backup | `src/lib/storage.js` |
| Tests | `src/lib/__tests__/` |

For the feature in front of you, identify which boxes get
touched. Skim the existing files in those boxes — what's the
shape of similar work that's already been done?

For a new tool: read at least one existing page (Notes is a
recent profile-scoped example) end to end. For new profile
state: read the Notes CRUD ops in `useProfiles.js`. For a UI
extraction: read what's already in `components/ui/`.

### Pass 3: Identify which skills apply

Map the feature onto the existing skills. Common combinations:

| Feature shape | Skills involved |
| --- | --- |
| New profile-scoped tool with its own page | `add-tool` + `extend-profile-schema` |
| New tool that doesn't track state | `add-tool` only |
| New child page under existing hub | `add-tool` (hub child variant) |
| Convert existing tool to a hub | `convert-to-hub` |
| New static catalog entry (species, building) | `add-palmon-species` (or similar) |
| New skill data for an existing species | `transcribe-palmon-skill` |
| Correction to existing data | `correct-palmon-data` |
| Pull repeated UI into a primitive | `extract-shared-component` |
| URL rename / restructure | `add-legacy-redirect` (and `convert-to-hub` if also splitting) |
| Add tests for a lib helper | `add-lib-tests` |

For each applicable skill, note which decisions you'll need to
make when you invoke it (e.g. "for add-tool: which section,
which URL slug, what description text").

### Pass 4: Surface decisions and ask the user

By now you have a structured plan and a list of decisions. Some
you can make yourself (alphabetical sort is mechanical, lib
file path follows convention). Others need the user:

- **Naming and copy.** Tool labels, descriptions, button text,
  toast messages.
- **UX choices** with multiple defensible answers (sort order,
  default filter state, how empty states read).
- **Scope choices.** "Should this also support X?" Asking is
  cheaper than building X and finding out it wasn't wanted.
- **Data shape decisions** that have schema implications. New
  field on profile? Optional reference to another field?

Use the `AskUserQuestion` tool for choices with 2–4 distinct
options. Phrase questions concretely — "Should the list sort
newest-first or alphabetically?" beats "Any sort preferences?"

If everything's clear and there are no open decisions, skip the
question step and proceed.

## What the plan looks like

Output a structured plan in the chat before writing code. The
shape is roughly:

```
## Plan: <one-line feature summary>

### What lands
- File path: what it contains
- File path: what it contains
...

### Skills involved
- skill-name: what it covers in this work
- skill-name: ...

### Open questions
1. Decision A — your recommendation + one-sentence reasoning
2. Decision B — ...

### Phased order
1. First commit: ...
2. Second commit: ...
```

Keep it tight — half a page, not three pages. The plan is a
hand-off to your future self (and the user). Anything longer
suggests the feature should be split.

## Phased order matters

When the plan involves multiple commits, sequence them so each
commit lands in a working state. The repo merges with true
merge commits (not squashes), so per-commit messages survive
and each commit should make sense on its own.

Common safe orderings:

- **Registry / routing first**, then content. URLs need to
  resolve before you can navigate to verify the UI.
- **Data / state shape before UI** that consumes it.
- **Permissive normalizers before strict consumers.**
- **Extract reusable pieces first**, then use them in the new
  feature — keeps the new feature commit clean.

When in doubt, ask: "if I stopped after this commit, would
main still work?" If no, reorder.

## Pitfalls

- **Planning past the point of usefulness.** A 10-line tweak
  doesn't need a plan. Use judgement; this skill is for
  non-trivial features.
- **Asking too many questions.** 1–3 well-chosen questions
  often suffice. 8 questions reads like stalling and frustrates
  the user.
- **Designing in isolation from existing code.** "Here's how I
  think it should work" without reading the comparable feature
  is how you reinvent a pattern that already exists. Always
  read at least one analogue.
- **Phantom requirements.** Don't plan for "future flexibility"
  that hasn't been requested. YAGNI applies double in a small
  app like this.
- **Skipping the user check.** If you've made any non-trivial
  decision, surface it before coding. Surprising the user with
  an opinionated implementation creates friction.

## After the plan

- If the user signs off, hand control to the appropriate
  doing-skills in the phased order from the plan.
- If the user pushes back on the plan, revise and re-present
  — don't argue. Their context exceeds yours.
- If the plan reveals the feature is larger than expected,
  surface that explicitly ("this is bigger than it sounded —
  we could split it into A and B") rather than silently
  expanding scope.
