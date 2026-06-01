---
name: add-lib-tests
description: |
  Write or extend Vitest tests for a pure-JS helper in `src/lib/`. Use
  this whenever the user asks to "add tests for X", "test this", "add
  coverage for the new normalize function", or whenever you add a
  non-trivial lib helper (normalizer, parser, formatter, computed
  reducer) that doesn't yet have tests. Also use it when fixing a bug
  in a lib helper — write a failing test first that captures the bug,
  then make it pass. Covers the colocated `__tests__` convention,
  Vitest's `describe`/`it`/`expect` style as used in this repo, the
  categories of edge case worth covering (empty / nullish / negative /
  malformed / round-trip), how to structure inputs, and explicitly
  notes what is NOT tested in this repo (React components, hooks,
  pages) so you don't try to write tests that won't fit the setup. Do
  NOT use this for adding tests to React components, hooks, or page
  files — they're not part of this repo's testing surface.
---

# add-lib-tests

This repo tests pure-JS helpers in `src/lib/` with Vitest. Components,
hooks, and pages are intentionally untested — the rationale is that
they're either thin wrappers around lib functions (in which case
testing the lib gives you the coverage) or they depend on state/IO
that's painful to mock in JS-only tests. So the rule is simple: any
non-trivial pure function in `src/lib/` should have a test next to
it. Anything else is exercised by running the app.

## When to add a test

Add tests for:

- **Normalizers** — `normalizeNote`, `normalizeChests`, anything that
  takes raw localStorage shape and returns a clean version. Edge cases
  are the point.
- **Parsers** — anything that turns user input or external data into
  internal shape (`parseImport`, `parseNonNegativeInt`, time parsers).
- **Formatters** — display helpers like `formatDHM`, `formatProfileValue`,
  `formatServer`. Tiny, but the test surface catches format drift.
- **Computed reducers** — `buildingsSummary`, `resourceTotals`, helpers
  that fold profile state into a derived view. Catches off-by-one and
  empty-input regressions.
- **Bug fixes** — when fixing a bug in a lib function, write a failing
  test that captures the bug first, then make it pass. The test then
  guards against regression.

Skip tests for:

- **Trivial pass-throughs** — a one-liner like `nowIso()` that wraps a
  standard library call isn't worth a test.
- **React components, hooks, pages** — see "What is NOT tested" below.
- **Static data files** — `palmon.js` species rows, `buildings.js`
  catalog. Test the helpers that consume them, not the data itself.

## Where tests live

| Helper file | Test file |
| --- | --- |
| `src/lib/notes.js` | `src/lib/__tests__/notes.test.js` |
| `src/lib/buildings.js` | `src/lib/__tests__/buildings.test.js` |
| `src/lib/<name>.js` | `src/lib/__tests__/<name>.test.js` |

Single colocated `__tests__/` subdirectory under `src/lib/`. Vitest's
default discovery (`*.test.js`) picks them up — no test config file in
the repo, package.json has the standard `"test": "vitest run"` and
`"test:watch": "vitest"` scripts.

Subdirectory tests (e.g. `src/lib/data/`) currently don't have a
`__tests__/` subdir of their own — data files are pure constants, no
logic to test. If you find yourself wanting one, prefer testing the
consumer instead.

## The test file template

Every test file follows the same skeleton:

```js
import { describe, expect, it } from 'vitest';
import {
  someFunction,
  anotherFunction,
} from '../<module>.js';

describe('someFunction', () => {
  it('returns X for Y', () => {
    expect(someFunction(input)).toBe(expected);
  });

  it('handles edge case Z', () => {
    expect(someFunction(edgeInput)).toEqual(complexExpected);
  });
});

describe('anotherFunction', () => {
  // ...
});
```

Conventions used across the existing test files:

- **One `describe` per top-level exported function** under test.
  Internal helpers stay private — test through the exported surface.
- **Test names complete a sentence** that starts with the function
  name. "`formatDHM` returns 0m for 0" → `it('returns "0m" for 0', ...)`.
- **`expect(x).toBe(y)` for primitives, `toEqual(y)` for objects/arrays.**
  `toBe` uses `Object.is`, `toEqual` does deep equality.
- **`expect(() => fn()).toThrow(/pattern/)` for error cases.** Match the
  message with a regex, not the whole string — keeps the test loose
  enough to survive cosmetic message changes.
- **Inline literals for simple inputs.** For shared or non-trivial
  inputs, hoist a `const SAMPLE_X = { ... }` at the top of the file
  and reuse it across tests.

### Example: edge cases for a normalizer

The `formatDHM` test in `src/lib/__tests__/time.test.js` is a good
reference. It walks the edge cases systematically:

```js
describe('formatDHM', () => {
  it('returns "0m" for 0', () => { ... });
  it('clamps negatives to 0m', () => { ... });
  it('floors fractional minutes', () => { ... });
  it('formats minutes only', () => { ... });
  it('formats hours + minutes', () => { ... });
  it('omits minutes when they are zero', () => { ... });
  it('formats days + hours + minutes', () => { ... });
  it('omits hours when zero but keeps days + minutes', () => { ... });
  it('shows minutes when nonzero and other units are present', () => { ... });
});
```

The pattern: enumerate the *behaviors*, not the *inputs*. Each `it` block
asserts one behavior. Reach for the existing tests as templates when
the function you're testing has a similar shape.

## What to cover

For each function, work through this checklist:

1. **The happy path.** One or two cases that exercise the main use.
2. **Empty / nullish input.** What does `fn(null)` / `fn(undefined)` /
   `fn('')` / `fn([])` / `fn({})` do? Should be deterministic and
   documented by the test.
3. **Negative / out-of-range input.** Numbers < 0, dates in the past,
   strings that don't match expected format.
4. **Type coercion.** If the function accepts string-or-number,
   exercise both. `parseNonNegativeInt('42')` and
   `parseNonNegativeInt(42)` should agree.
5. **Round trips.** If there's a `serialize` → `parse` pair, test that
   the round trip preserves data. See `buildExport` /
   `parseImport` in `storage.test.js` for the pattern.
6. **Specific bug regressions.** When fixing a bug, add a test that
   would have caught it.

Don't over-cover. You're not aiming for 100% — you're aiming for
"every behavior the code promises has an assertion." Five well-chosen
`it` blocks usually beat fifteen redundant ones.

## What is NOT tested

This repo intentionally has no tests for:

- **React components** (`src/components/`). They're presentational and
  thin; testing them requires a renderer and a lot of setup that
  hasn't paid off. Visual changes get caught at `npm run dev`.
- **Hooks** (`src/hooks/useProfiles.js`). React hooks are hard to
  exercise without a renderer, and most of the logic worth testing
  lives in the lib normalizers that the hook calls. Test those
  instead.
- **Pages** (`src/pages/`). Same reasoning — they're thin compositions
  of components and hooks.

If a piece of behavior in a component/hook/page seems important to
test, the right move is almost always to *extract* the logic into a
pure lib helper and test that. Don't fight the convention by pulling
in a renderer just to test one thing.

## Running tests

```sh
npm test          # one-shot, used in CI / pre-merge checks
npm run test:watch  # watch mode for tight feedback loops
```

`npm test` runs Vitest in run-once mode and exits with the number of
failures. Use it before opening a PR or merging.

For a single file:

```sh
npx vitest run src/lib/__tests__/notes.test.js
```

For a single test by name (uses substring match on `it` strings):

```sh
npx vitest run -t "clamps negatives"
```

## Pitfalls

- **Asserting on whole error messages.** Use regex matches
  (`toThrow(/Palmon Tools backup file/)`) instead of full-string equality.
  Messages are user-facing text and they drift; the test shouldn't
  break on cosmetic changes.
- **`toBe` vs `toEqual`.** `toBe` for primitives and identity, `toEqual`
  for value equality on objects/arrays. Mixing them up produces
  confusing failures.
- **Snapshot tests.** Not used in this repo — no `toMatchSnapshot` calls
  anywhere. Don't introduce them; they obscure intent and create
  high-noise diffs.
- **Time-dependent tests.** If a function uses `Date.now()` or `new
  Date()`, either inject the time or assert structurally (`Number.isFinite(Date.parse(x))`)
  rather than asserting on an exact value. See `buildExport`'s
  `exportedAt` test for the pattern.
- **Testing the data, not the code.** A test that asserts
  `PALMON_SPECIES.length === 51` will break the next time a species is
  added and tells you nothing useful. Test logic that consumes the
  data instead.
- **Shared mutable state between tests.** Vitest doesn't reset module
  state between `it` blocks. If your SUT has module-level state (rare
  in this codebase), be explicit about resetting it in each test.

## After the edits

- Run `npm test` and confirm the new tests pass and nothing else
  broke.
- If a test you added captures a bug fix, the original bug-fixing
  commit and the test commit can land together — the test serves as
  the proof the fix works.
- Ship with the **ship-it** skill. Branch prefix `feat/` if the tests
  cover a new feature you're adding in the same PR, `chore/` if
  you're backfilling tests on existing code, or `fix/` if you're
  testing a bug fix.
