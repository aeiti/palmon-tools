# Contributing

This repo follows **GitHub Flow**: short-lived branches off `main`, one PR per change, merged with a true merge commit so per-commit history is preserved on `main`.

## Branching

- `main` is always deployable. Don't push broken code to it.
- Cut a branch for anything more than a one-line tweak or that touches multiple files.
- Branch directly off the latest `main`:
  ```sh
  git checkout main && git pull
  git checkout -b feat/short-description
  ```

### Branch naming

| Prefix      | Use for                                     |
| ----------- | ------------------------------------------- |
| `feat/`     | New behavior or features                    |
| `fix/`      | Bug fixes                                   |
| `refactor/` | Internal change, no behavior change         |
| `chore/`    | Deps, config, tooling, non-code housekeeping |
| `docs/`     | Documentation only                          |

Use kebab-case after the prefix: `feat/compact-inputs-everywhere`, `fix/inventory-grid-overflow`.

## Committing

- One logical change per commit. If you can describe it as "X and Y," it's probably two commits.
- Commit when each step works — don't wait until the whole branch is done.
- Imperative mood, present tense: "Switch ChestInventory inputs to CompactInput", not "Switched" or "Switches".
- Every commit survives into `main` after merge, so keep messages clean and self-contained. Avoid `wip`/`fixup`-style commits on a PR branch — squash or rebase them out before merging.

## Pull requests

- Open a PR as soon as the branch's stated goal is done.
- Title: same style as a commit message — short, imperative.
- Body: what changed and why. Link any related issue.
- **Merge with a true merge commit** so individual commits stay legible in `main`'s history (`gh pr merge <num> --merge --delete-branch`). Do not squash.
- Delete the branch after merge (the `--delete-branch` flag above handles it).

### What can skip a PR?

Direct commits to `main` are OK for:

- Typo fixes in docs/comments
- Version bumps and lockfile updates
- Reverting a known-bad commit

Everything else goes through a branch + PR, even if you'll merge it yourself a minute later. The PR is the review checkpoint and a record of intent.

## Keeping branches current

If `main` moves while your branch is open, rebase rather than merge `main` in:

```sh
git fetch origin
git rebase origin/main
```

This keeps history clean. Force-push your branch after rebasing (`git push --force-with-lease`) — never force-push `main`.
