---
name: ship-it
description: |
  The end-to-end branch → edit → commit → push → PR → merge → sync workflow
  for the palmon-tools repo. Use this whenever the user asks to "ship",
  "open a PR", "merge this", "branch this off", "commit and PR it", or makes
  a substantive code change they'll obviously want shipped. Also use it when
  the user describes a feature/fix/refactor without saying the word "ship" —
  the workflow still applies. Encodes the repo's policies: branch off fresh
  main, branch prefix matches change type, clean per-commit messages (merge
  commits preserve them), no --no-verify, no amend, no destructive resets
  without explicit user ask, and `gh pr merge --merge --delete-branch`. Do
  NOT use this for read-only investigation, code review, exploration, or
  when the user explicitly says "just edit, don't commit yet".
---

# ship-it

The canonical workflow for landing a change in palmon-tools. Follow the
six steps in order. The hard rules at the end apply in every step.

This skill exists because the workflow has a lot of small policies
attached — branch first, specific prefix, no squash, no `--no-verify`,
`git -C` for paths — and missing one of them either creates bad history
or, worse, destroys work. The skill is the single source of truth so
those policies don't have to be reconstructed from CLAUDE.md each session.

## The six steps

1. **Pre-flight: branch off fresh main** before touching any files.
2. **Edit** to accomplish the task.
3. **Commit** in logical chunks with imperative-mood messages.
4. **Push + open a PR** with `gh pr create`.
5. **Merge** with `gh pr merge <num> --merge --delete-branch`.
6. **Sync** local main with `git checkout main && git pull`.

## 1. Pre-flight: branch first

Before editing **any** file, check where HEAD is and what's in the working tree:

```sh
git -C /Users/adam/GitHub/palmon-tools status
git -C /Users/adam/GitHub/palmon-tools branch --show-current
```

Then decide based on what you see:

| State | What to do |
| --- | --- |
| On `main`, clean tree | Pull main (`git -C … pull`), then `git checkout -b <prefix>/<kebab-name>`. |
| On `main`, dirty tree | Stop. Stash or commit the in-flight work elsewhere first, or branch and bring the changes along — but only after confirming with the user that those changes belong with the new task. |
| On a non-`main` branch, clean tree | Ask the user: continue on this branch, or start fresh off main? Don't silently inherit someone else's WIP branch. |
| On a non-`main` branch, dirty tree | Same as above — ask first. Inheriting dirty WIP branches is how unrelated changes get bundled into a PR. |

Skipping this step is the single most common way the workflow goes wrong.
Editing-then-noticing-you're-on-the-wrong-branch is recoverable but creates
friction. Editing-then-committing-to-main is recoverable too (via
`git branch -f main origin/main` from a saved branch — see Recovery) but
it's avoidable and embarrassing.

### Branch naming

Prefix matches the *nature* of the change. Pick by what the diff actually does:

| Prefix | Use for |
| --- | --- |
| `feat/` | New behavior or features |
| `fix/` | Bug fixes |
| `refactor/` | Internal change with no behavior change |
| `chore/` | Deps, config, tooling, non-code housekeeping |
| `docs/` | Documentation only |

After the prefix, use kebab-case and keep it short and specific:
`feat/notes-page`, `fix/inventory-grid-overflow`, `docs/notes-readme`.

## 2. Edit

Standard editing work. Two things specific to this repo:

- **Tools are registry-driven.** Adding a new page means editing
  `src/tools.js` + `src/routes.js` + creating the page in `src/pages/`.
  Don't touch `App.jsx` directly — it builds the route table from the
  registry.
- **Alphabetical ordering.** Tool lists (home cards, nav dropdown, footer)
  must be sorted by visible name. The registry handles this via
  `toolsInSection()` — adding an entry alphabetically is enforced for free.

## 3. Commit

One logical change per commit. If the message contains "and", it's
probably two commits. Every commit on the branch survives into `main`
when the PR merges (the repo uses `--merge`, not `--squash`), so messages
need to stand on their own.

### Commit message format

- Imperative present tense in the subject: "Add", "Fix", "Switch", "Remove".
  Not "Added" or "Adds" or "Adding".
- Subject line under ~72 chars, no trailing period.
- Body explains the *why*, wrapped at ~72 chars. Skip the body for
  truly trivial commits.
- End with the Claude co-author trailer when Claude wrote the change:

  ```
  Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
  ```

  (The Kato.8 repos have a different policy — no Claude trailers. That
  doesn't apply here.)

### Staging

Stage by file path, never `git add -A` or `git add .`. Those will pull in
build artifacts, editor scratch files, or unrelated WIP. Explicit paths
keep accidents from happening:

```sh
git -C /Users/adam/GitHub/palmon-tools add src/lib/notes.js src/pages/Notes.jsx
```

### Multi-line messages

Always pass multi-line messages through a heredoc — this is the only
reliable way to get proper newlines through the shell:

```sh
git -C /Users/adam/GitHub/palmon-tools commit -m "$(cat <<'EOF'
Subject in imperative mood

Body paragraph explaining the why, wrapped at about 72 characters.
Multiple paragraphs are fine when justified.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

## 4. Push and open a PR

```sh
git -C /Users/adam/GitHub/palmon-tools push -u origin <branch-name>
```

Then:

```sh
gh pr create --title "<short imperative title>" --body "$(cat <<'EOF'
## Summary
- 1–3 bullet points covering what changed and why.

## Test plan
- [ ] Concrete things a reviewer (or you on a clean checkout) should do.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Keep PR titles under 70 chars and in the same imperative style as commits.
Details go in the body, not the title.

When the PR scope grows mid-branch (e.g., you added a Bing verification
file to a Google-verification PR), update the title and body to match
with `gh pr edit <num> --title ... --body ...`. Don't open a second PR
for closely-related work that hasn't merged yet.

## 5. Merge

```sh
gh pr merge <num> --merge --delete-branch
```

**Always `--merge`, never `--squash`.** This repo's policy is to preserve
per-commit history on `main` — that's the whole reason commit messages
need to be clean. `--delete-branch` deletes the remote branch after
merge.

**Stacked PRs — watch the auto-close trap.** If PR B's base is PR A's
head branch (e.g. you opened B off `feat/foo` while A was still open
against `main`), merging A with `--delete-branch` deletes the branch B
is targeting, and GitHub then *auto-closes* B rather than retargeting
it to `main`. The head commits survive but the PR is dead; you can't
reopen a closed-by-base-deletion PR (`gh pr reopen` fails with a
GraphQL error), so you have to open a fresh replacement PR from the
same head branch. Two ways to avoid this:

- **Preferred:** don't stack PRs in this repo. Merge each PR to main
  first, then rebase the next branch on the new main before opening
  its PR. Cleaner per-commit history on main, no surprises.
- **If you must stack:** merge the bottom PR with `--merge` *without*
  `--delete-branch`, then `gh pr edit <next> --base main` to retarget
  the dependent PR before merging it. Clean up the leftover branches
  at the end with `git push origin --delete <branch>`. `gh pr edit
  --base` only works on *open* PRs — once a dependent PR is auto-closed,
  it cannot be reopened.

Do **not** push to `main` directly, even for "small" changes. CONTRIBUTING.md
calls out a few exceptions (typo fixes in docs/comments, version bumps,
lockfile updates, reverting a known-bad commit), but the default answer
is always "go through a PR."

## 6. Sync

```sh
git -C /Users/adam/GitHub/palmon-tools checkout main
git -C /Users/adam/GitHub/palmon-tools pull
```

The release workflow on `main` tags every push (`vYYYY.MM.DD.N.B`), so
pulling also fetches those tags. That's expected.

The local branch is usually already deleted by `--delete-branch` if you
ran the merge from a different branch (gh deletes both remote and local
when you're not standing on the doomed branch). If gh didn't delete it,
clean it up with `git branch -d <branch-name>` once main is synced.

## Hard rules

These apply at every step. Breaking them either creates bad history,
destroys work, or surprises the user.

- **Never `--no-verify`** on `git commit` or `git push`. If a hook fails,
  fix the underlying issue. The hook exists for a reason.
- **Never `--amend`** unless the user explicitly asks for it. Amending
  changes a commit that may already be pushed, which rewrites history
  others might depend on. Create a new commit instead.
- **Never destructive operations without explicit user ask.** No
  `git reset --hard`, `git push --force`, `git checkout -- <file>`,
  `git clean -f`, `git branch -D <branch>`. The exception is recovering
  from a known-safe state — and even then, prefer non-destructive
  alternatives (see Recovery).
- **Never push to `main`** directly. Always through a PR.
- **Always `git -C <absolute-path>`** when running git commands. Bash
  cwd appears to persist but drifts in practice — a misdirected
  `git push origin --delete <branch>` in the wrong repo silently deletes
  the wrong branch. `-C` is cheap insurance.
- **Always stage specific paths.** `git add -A` or `git add .` are
  banned. They will eventually catch a `.env` or build artifact.
- **Never commit files that look like secrets** (`.env*`,
  `credentials.json`, `*.pem`). If the user explicitly asks, warn them
  loudly first.

## Recovery

Two situations have come up in practice; both are recoverable without
destructive commands.

### Committed to main by mistake (haven't pushed)

You realized after a few commits that you forgot to branch first. Don't
`git reset --hard`. Instead:

```sh
git -C <path> checkout -b <prefix>/<kebab-name>   # save the work on a branch
git -C <path> branch -f main origin/main          # rewind the main pointer
```

`branch -f` is a pointer-move, not a working-tree operation, so nothing
gets lost. The commits are now on the new branch; main is back where it
was.

### Deleted the wrong remote branch

The reflog still has the tip sha of the deleted branch. Recreate the
branch locally from that sha, then push it back to origin:

```sh
git -C <path> reflog                              # find the sha
git -C <path> branch <name> <sha>                 # recreate locally
git -C <path> push origin <name>                  # restore the remote
```

## Quick reference

End-to-end from a clean main:

```sh
# 1. Pre-flight
git -C /Users/adam/GitHub/palmon-tools status
git -C /Users/adam/GitHub/palmon-tools checkout main
git -C /Users/adam/GitHub/palmon-tools pull
git -C /Users/adam/GitHub/palmon-tools checkout -b feat/short-name

# 2. Edit (use the regular editing tools)

# 3. Commit
git -C /Users/adam/GitHub/palmon-tools add path/to/file1 path/to/file2
git -C /Users/adam/GitHub/palmon-tools commit -m "$(cat <<'EOF'
Imperative subject

Why, wrapped at 72.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"

# 4. Push + PR
git -C /Users/adam/GitHub/palmon-tools push -u origin feat/short-name
gh pr create --title "Short imperative title" --body "$(cat <<'EOF'
## Summary
- What changed and why.

## Test plan
- [ ] Concrete checks.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"

# 5. Merge
gh pr merge <num> --merge --delete-branch

# 6. Sync
git -C /Users/adam/GitHub/palmon-tools checkout main
git -C /Users/adam/GitHub/palmon-tools pull
```
