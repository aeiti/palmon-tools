---
name: extract-shared-component
description: |
  Pull a piece of UI out of a page or component file and into a
  reusable component (or a Tailwind utility class) at the right
  location in the component tree. Use this whenever the user asks
  to "extract this", "make this reusable", "this should be a
  component", "pull this into a primitive", or you notice the same
  JSX block appearing in two or more places. Also use it
  proactively when a page file grows past ~300 lines and has
  internal sub-components that have started to crowd it. Covers
  the three-way decision tree (Tailwind utility in `index.css` /
  shared primitive in `components/ui/` / feature-scoped component
  in `components/<feature>/`), the "extract when used 2+ times"
  threshold, the API shape rules (props match data, not layout),
  and what NOT to extract. Do NOT use this for extracting hooks
  (different file convention), for extracting helper functions
  (those go in `src/lib/`), or for one-off compositions that don't
  warrant a separate file.
---

# extract-shared-component

Decide where a piece of UI belongs and pull it there cleanly. The
repo has a three-way split — Tailwind utility class, shared
primitive, feature-scoped component — and the cost of putting
something in the wrong slot compounds: a utility that should've
been a component grows into a 30-class monster, a primitive that
should've been feature-scoped accumulates feature-specific props,
a feature component that should've been a primitive gets
duplicated.

## When to extract

Extract when one or more is true:

- **Used in 2+ places already**, or about to be (the second use is
  imminent).
- **Used once but the wrapper is meaty** (50+ lines, multiple
  pieces of state) and the parent file has gotten hard to read
  because of it.
- **Used once but tested** — pulling it into a separate file makes
  it testable as a unit. (Rare in this repo; we don't test
  components, see `add-lib-tests`.)

Don't extract when:

- It's a one-off composition with no foreseeable reuse.
- The "component" is a 3-line div with one prop — that's an
  abstraction, not an extraction.
- You're fighting Tailwind by wrapping every utility class into a
  component named after the styling rather than the meaning.

## The three-way decision

Use this order — Tailwind utility first (cheapest), then shared
primitive, then feature-scoped:

### 1. Tailwind utility in `src/index.css`

For a **repeated class composition** with no behavior. The repo's
existing utilities are good examples — `h-page`, `h-section`,
`h-eyebrow`, `text-subtle`, `card`, `panel`, etc. Pattern:

```css
@utility link-inline {
  @apply text-indigo-300 underline-offset-2 hover:underline focus:underline;
}
```

Use when:

- You're repeating the same `className="..."` string in 2+
  places.
- The composition is purely stylistic — no state, no event
  handlers, no children logic.
- The name describes the *role* of the element (`h-page`,
  `link-inline`), not the styles themselves (`text-2xl-bold-slate`).

Don't use when:

- The composition needs conditional classes (`isActive ? "..." :
  "..."`). That's a component.
- The styles are one-off and not actually reused.

### 2. Shared primitive in `src/components/ui/`

For a **stateful or behavior-bearing piece** that's used (or about
to be) by 2+ unrelated feature areas. Examples already in the
repo: `SelectField`, `CompactInput`, `ConfirmDialog`,
`ProfilePicker`, `ResetButton`, `SectionCard`, `ToolPageHeader`,
`CardColumns`.

Use when:

- Multiple feature areas need it (Inventory + Buildings + Notes,
  not just "two places inside Buildings").
- The component has its own concerns — internal state, keyboard
  behavior, ARIA wiring, hidden details — that the call sites
  shouldn't reinvent.
- The API is small and centered on the *meaning* of the input,
  not the layout (`<SelectField label value onChange options />`,
  not `<DropdownWithLabelAbove />`).

Don't use when:

- Only one feature area needs it. Premature genericization makes
  the primitive accumulate one-off props that don't generalize.

### 3. Feature-scoped component in `src/components/<feature>/`

For **moderately complex UI scoped to one feature**, extracted
for readability or because the parent page got too crowded.
Existing folders: `buildings/`, `inventory/`, `palmon/`,
`profile/`, `speedups/`, `layout/`.

Use when:

- Only one feature uses it.
- The parent page or component would otherwise be the wrong
  size.
- The internal logic is feature-specific (e.g. building rules,
  palmon-only star math).

Don't use when:

- It's tiny (3 lines, one prop). Inline it.
- It's actually shared across features — promote to
  `components/ui/` instead.

## API shape rules

Once you've picked the location, design the API. Heuristics:

- **Props match the data, not the layout.** Pass `value`, `options`,
  `onChange` — not `widthClass`, `labelMarginTop`. The latter is
  the parent's problem.
- **Use `children` for flexible content** (cards, panels, dialogs).
  Use explicit props for structured inputs (selects, inputs).
- **Optional props default sensibly.** A `<SelectField label
  value onChange options />` should work; `<SelectField
  ariaLabel="..." />` should be the override when there's no
  visible label.
- **One default export per file** for components. Don't bundle
  multiple unrelated components in one file just because they
  share a feature.
- **Naming is PascalCase, descriptive.** `SelectField` (not
  `Dropdown`), `ResetButton` (not `Btn`), `ProfilePicker` (not
  `ProfileSelectThing`).
- **No magic.** A primitive shouldn't read context the call site
  doesn't know about, shouldn't side-effect localStorage,
  shouldn't fetch. Behavior happens at the call site;
  primitives render.

## Migrating call sites

When extracting:

1. **Create the new file** with the extracted component.
2. **Import it in the original location** and replace the
   inline JSX with the component invocation. Confirm the page
   still renders identically.
3. **Migrate other call sites** if any exist, one at a time.
   Each call site might have different prop usage — that's
   fine, it's exactly the value the abstraction is providing.
4. **Remove dead code** from the original file (state,
   helpers that only existed for the extracted UI).

Each step can be its own commit if the migration is touching a
lot of files. Otherwise one commit per logical extraction is
fine.

## Pitfalls

- **Extracting prematurely.** A pattern with one use is a
  pattern with one use. Wait for the second.
- **Naming after styling.** `<TwoColumnGrid>` ages badly when
  you want three columns. `<CardColumns>` reads better and
  doesn't constrain the layout.
- **Props that mirror the JSX.** If the primitive takes
  `headerClass`, `bodyClass`, `footerClass`, you've inverted the
  abstraction — the caller is now describing the rendering
  instead of the data. Use `children` or composition slots
  instead.
- **Extracting a feature-scoped component into `ui/`.** If only
  Buildings uses `<BuildingTracker>`, it lives in
  `components/buildings/`, not `components/ui/`. The reverse —
  generalizing too soon — is the more common mistake.
- **Forgetting to remove dead code in the parent.** State and
  helpers that only existed for the extracted UI should leave
  with it.
- **Wrapping for the sake of wrapping.** If the "component" is
  one prop and three lines, inline is fine. The bar for a new
  file is "this earns its own file."

## After the edits

- No tests (components aren't tested in this repo — see
  `add-lib-tests`). Visual check via `npm run dev`.
- If the extraction introduces a new shared primitive worth
  knowing about, no formal doc — `src/components/ui/` is small
  enough to be its own index.
- Ship with the **ship-it** skill. Prefix `refactor/` (no
  behavior change) most of the time; `feat/` if the extraction
  is a side-effect of new functionality.
