---
name: add-legacy-redirect
description: |
  Wire up a redirect from an old URL to a new one in
  `LEGACY_REDIRECTS`, so users with bookmarks and external links to
  the old URL aren't stranded after a route rename or
  restructure. Use this whenever the user asks to "rename this
  URL", "move this page", "redirect /old to /new", "restructure
  the routes", or when a route changes as part of a hub conversion
  / refactor. Also use it whenever any commit changes the `path`
  of an existing `ROUTES` entry without removing the old URL from
  use. Covers the LEGACY_REDIRECTS array shape, the sitemap rule
  (new URL only, never the old), the commit-message convention
  that names the rename, and the limits of the mechanism (static
  paths only, no dynamic params). Do NOT use this for adding a
  brand-new route that has no predecessor (just add to `ROUTES`),
  for external redirects (out of scope), or for redirects from a
  removed feature (link to home, don't redirect — the user
  shouldn't land somewhere unexpected).
---

# add-legacy-redirect

When a URL changes, the old URL needs to keep working. Bookmarks,
Discord messages, README links, search-engine indexes — they all
point at the old URL and will keep pointing at it long after the
rename. A one-line entry in `LEGACY_REDIRECTS` makes the old URL
resolve to the new one transparently.

## When to add a redirect

Add one when **any of these** is true:

- An existing `ROUTES.<key>` constant's `path` is changing.
- A page is being moved to a different parent (e.g. `/resources`
  → `/inventory/resources` during the Inventory hub conversion).
- An external doc / README / sitemap was pointing at a URL that
  no longer resolves.
- A user explicitly mentions a known-bookmarked URL that's about
  to break.

Don't add one when:

- The route is **net new**. No predecessor, no redirect needed.
- The feature is being **removed entirely** with no successor.
  Letting the route 404 (and fall through to the home redirect)
  is correct — silently sending users to a different feature
  surprises them.
- The "rename" is just a cosmetic change to the registry key, not
  the URL path.

## The mechanism

`src/routes.js` exports a `LEGACY_REDIRECTS` array:

```js
export const LEGACY_REDIRECTS = [
  { from: '/resources', to: ROUTES.inventoryResources },
  { from: '/speedups', to: ROUTES.inventorySpeedups },
];
```

`App.jsx` reads it and renders a `<Route path={from} element={<Navigate
to={to} replace />} />` for each entry. The `replace` flag means the
old URL is replaced in browser history, so back-button doesn't
loop back to the redirecting URL.

To add a redirect:

```js
export const LEGACY_REDIRECTS = [
  { from: '/resources', to: ROUTES.inventoryResources },
  { from: '/speedups', to: ROUTES.inventorySpeedups },
  { from: '/old-url', to: ROUTES.newUrlKey },  // new entry
];
```

That's it. No App.jsx change, no separate config.

### Limits

- **Static paths only.** `from` must be a literal path like
  `/old-url`. React Router's `Navigate` doesn't run path-param
  substitution; if the old URL had dynamic segments, you can't
  redirect generically. Add per-instance redirects or accept the
  breakage for old dynamic URLs.
- **Internal only.** This is for redirects within the SPA. External
  redirects (e.g. an old GitHub Pages URL → a new domain) would
  be handled at the hosting layer, not here.
- **Single hop.** Don't redirect from a redirected URL. If
  `/a` → `/b` and you later move `/b` → `/c`, update the `/a`
  entry to point at `/c` directly, not chain them.

## Sitemap rule

`public/sitemap.xml` lists **only the current URL**, never the
old one. Two reasons:

- The old URL no longer corresponds to a canonical page. Listing
  it confuses crawlers and can cause duplicate-content scoring
  penalties.
- The redirect handles discovery for any crawler that finds the
  old URL via an external link.

So when adding a redirect:

1. Add the entry to `LEGACY_REDIRECTS`.
2. If the new URL isn't already in `public/sitemap.xml`, add it.
3. If the old URL was in `public/sitemap.xml`, remove it.

## Commit shape

Name the rename in the subject:

```
Redirect /resources to /inventory/resources
```

Body explains the why (the restructure / hub conversion / rename
context) and confirms the sitemap was updated:

```
Redirect /resources to /inventory/resources

Resources moved under the Inventory hub. Old URL kept resolving
via LEGACY_REDIRECTS so external links from the README / Discord
threads / GSC index don't 404. Sitemap updated to list only the
new URL.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```

If multiple URLs are renamed in one batch (e.g. a hub conversion
renames `/resources` and `/speedups` together), one commit
covering both is fine — they're the same logical change.

## Pitfalls

- **Forgetting the redirect after a rename.** The new URL works,
  the old URL 404s, bookmarks break silently. Always pair a URL
  change with a redirect entry.
- **Leaving the old URL in the sitemap.** Confuses crawlers,
  potential SEO penalty. The redirect makes the old URL
  unnecessary in the sitemap; remove it.
- **Adding a redirect for a renamed `key` only.** If the registry
  key changes but the URL path doesn't, no redirect is needed —
  users never see the key.
- **Chaining redirects.** If `/a` → `/b` and later `/b` → `/c`,
  update `/a`'s entry to point at `/c`. Two-hop redirects are
  slow and the user briefly sees an in-between URL.
- **Redirecting after a feature removal.** If the feature is
  gone, the right answer is usually 404 → home (via the existing
  wildcard route), not a redirect to a similar-but-different
  page. Silently landing somewhere else surprises the user.

## After the edits

- Hit the old URL in dev (`http://localhost:5173/palmon-tools/<old>`)
  and confirm it redirects to the new one.
- Check that browser history doesn't loop — clicking back from
  the new page should go to the prior history entry, not back
  to the old URL.
- Update any README / CONTRIBUTING references that mention the
  old URL.
- Ship with the **ship-it** skill. Prefix `chore/` for a
  pure-redirect change, or fold into the broader refactor
  commit if the redirect is part of a hub conversion (use
  `refactor/` then).
