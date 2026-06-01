---
name: release-verify
description: |
  Post-deploy sanity check after a merge to main reaches GitHub
  Pages. Use this whenever the user asks to "verify the deploy",
  "check the live site", "is it live yet", "did the release go
  out", or after merging anything user-visible to main. Also use
  it proactively after any merge that touches the index.html,
  routing, or a public-facing page — the failure modes (broken
  base path, mis-cached assets, sitemap missing) are silent on
  the dev server and only show up in production. Walks through
  the version-tag check (does the footer pill match the expected
  CalVer tag), route smoke tests (homepage + 2-3 representative
  pages), static asset checks (sitemap.xml, robots.txt,
  verification files), and how to interpret GitHub Pages's lag.
  Do NOT use this for pre-deploy QA (test locally before
  merging), for verifying the CI run itself (use `gh run view`),
  or for debugging deeper production issues (start from the
  symptoms, not this skill).
---

# release-verify

After merging to main, GitHub's release workflow tags the commit
(`vYYYY.MM.DD.N.B`), builds with `VITE_APP_VERSION` injected, and
deploys to GitHub Pages. Most of the time this is invisible —
push, wait a couple minutes, the new version is live. When it
isn't, the failure modes are silent: the dev server keeps
serving the old version, the cached production index keeps
serving the old version, and the only signal is "users are
seeing yesterday's version."

This skill is the post-deploy gate to catch those silent
failures while they're still easy to debug.

## When to run

- After any merge to main that touches user-visible behavior.
- After any merge that adds or removes a public route.
- After any merge that changes `index.html`, `vite.config.js`,
  or files in `public/`.
- After the user asks ("is it live yet?", "did the deploy go
  out?").

Don't run for:

- Local-only or docs-only changes that don't reach the
  user-visible site.
- Skills-batch work that isn't pushed to origin (the entire
  point of the batch mode is to *not* deploy).

## The release pipeline

A push to main triggers `.github/workflows/release.yml`, which:

1. Computes a CalVer tag (`vYYYY.MM.DD.N`) from the existing
   tags — N is the day's sequential count.
2. Computes a build tag (`vYYYY.MM.DD.N.B`) — B is the GitHub
   Actions run_number, used internally; the footer shows only
   the four-segment CalVer.
3. Builds with `VITE_APP_VERSION` set to the CalVer.
4. Creates a GitHub Release pinned at the deployed sha.
5. Deploys `dist/` to GitHub Pages.

Two practical consequences:

- **Every merge to main is a release.** No separate deploy step.
- **The version pill in the footer is the canonical signal** that
  the new code is live. If the pill matches the new tag, the
  user is on the new build.

## Verification checklist

In order, cheapest first. Stop at the first failure.

### 1. The CI run succeeded

```sh
gh run list --branch main --limit 3
```

Look at the most recent run. If it's still in progress, wait —
GitHub Pages doesn't deploy until the workflow finishes. If it
failed, the deploy didn't happen; diagnose the failure with
`gh run view <id> --log-failed` instead of proceeding.

### 2. The new tag exists

```sh
git -C /Users/adam/GitHub/palmon-tools fetch --tags origin
git -C /Users/adam/GitHub/palmon-tools tag --sort=-creatordate | head -3
```

The newest tag should match what the workflow computed. Format:
`vYYYY.MM.DD.N.B`. If the newest tag is yesterday's (or
older), the new run didn't tag — usually means it's still in
progress or failed.

### 3. The site responds

```sh
curl -sI https://aeiti.github.io/palmon-tools/ | head -5
```

Expect `HTTP/2 200`. Also `last-modified` should be recent.

### 4. The version pill matches

Either:

- Hit the site in a browser, scroll to the footer, read the
  version pill (`vYYYY.MM.DD.N`).
- Or curl + grep:

```sh
curl -s https://aeiti.github.io/palmon-tools/ | grep -o "v20[0-9]\{2\}\.[0-9]\{2\}\.[0-9]\{2\}\.[0-9]\+"
```

The footer shows the four-segment CalVer (no `.B` build
number). If it matches the new tag's CalVer portion, the
deploy is live.

If it shows the old version after a successful CI run, give
it 1–5 more minutes — GitHub Pages can lag. If 10 minutes
later it's still old, there's a cache issue worth digging
into (CDN cache, browser cache, or the deploy step actually
failed silently).

### 5. Route smoke tests

Hit the homepage and 2–3 representative routes — pick one
each from the categories of work that just shipped. For a
SEO-related change: also hit `/sitemap.xml` and `/robots.txt`.
For a new page: hit that page's URL.

```sh
for path in / about notes palmon/species/abuzzinian; do
  curl -sI "https://aeiti.github.io/palmon-tools/$path" | head -1
done
```

All should be `HTTP/2 200`. Dynamic routes (`/palmon/species/<key>`)
work because of the SPA 404 fallback (`public/404.html`); they
serve `index.html` and the React Router takes over client-side.

### 6. Static assets

For changes that touched anything in `public/`:

```sh
curl -sI https://aeiti.github.io/palmon-tools/sitemap.xml | head -3
curl -sI https://aeiti.github.io/palmon-tools/robots.txt | head -3
```

Expect `200` and the right content-type
(`application/xml`, `text/plain`). For verification files
(Google / Bing), confirm they serve at the right path.

### 7. Spot-check the new functionality

If the merge added something specific, exercise it. Don't
script this — actually click around. The CI/smoke checks
above catch wiring failures; clicking catches behavior bugs
that snuck past local testing.

## Interpreting GitHub Pages lag

After a successful workflow run, the typical lag is:

- **0–60 seconds**: the deploy step's "publish" action runs.
- **1–3 minutes**: GitHub Pages's edge cache picks up the new
  bundle.
- **Up to 5 minutes** in unlucky cases.

Past 5 minutes with no update, suspect one of:

- The workflow didn't actually push the build to Pages.
  Re-check the run logs.
- Your browser has the old assets cached. Try a private
  window or `curl` to confirm.
- An edge cache is being stubborn. Usually resolves on its
  own; can force a refresh by triggering another build.

If a release looks "stuck" past 10 minutes after a successful
workflow run, escalate: re-run the workflow, or push a
no-op commit to trigger a fresh build.

## Pitfalls

- **Reading the dev server.** `localhost:5173` shows whatever's
  on disk. It doesn't tell you if the live deploy is updated.
  Always check the live URL.
- **Trusting browser cache.** If you've had the site open in a
  tab, you may be looking at cached assets. Use a private
  window or `curl` for ground truth.
- **Skipping the route smoke tests on big changes.** A single
  route can break (typo in registry, lazy import failure) while
  the homepage looks fine. For changes that touched routing,
  hit every changed route.
- **Verifying right after the merge.** The workflow takes 2–4
  minutes to run, then deploys. Wait for the workflow to
  finish before checking the live URL.
- **Confusing the four-segment footer version with the
  five-segment internal tag.** Footer shows `vYYYY.MM.DD.N`.
  The full tag is `vYYYY.MM.DD.N.B`. Matching either's CalVer
  portion is what you want.

## After verification

- If everything passed, say so explicitly so the user has a
  clear signal. "Live, version v2026.06.01.7, all routes 200."
- If something failed, report the specific failure and what's
  next — don't speculate broadly. ("Sitemap returns 404 —
  likely the file wasn't in `public/` when the build ran.
  Confirm `git -C <repo> show <merge-sha>:public/sitemap.xml`
  has content.")
- For SEO-significant deploys, this is also the moment to
  request indexing in Search Console for any new URLs.
