// Per-route document title + meta tags + canonical, plus the GA page_view
// ping. Folding the analytics event in here (rather than the old
// PageTracker) is deliberate: PageTracker fired on `location.pathname`
// change and read `document.title` immediately, which beats the page
// component's own effect that sets the title. Result was every page_view
// reporting the previous page's title. Now we fire the event in the same
// effect that sets the title — they can't drift.
//
// The site-wide defaults from index.html (description, OG, Twitter) still
// apply as a fallback for any route that doesn't call this hook (e.g. an
// unmounted Suspense fallback).

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_NAME = 'Palmon Tools';
const SITE_ORIGIN = 'https://aeiti.github.io';

// vite.config.js base is '/palmon-tools/'. Strip the trailing slash so we
// can concatenate with a router pathname (which always starts with '/').
const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, '');

// Build a `<title>` that includes the site name as a suffix, unless the
// caller passed the site name itself (avoid "Palmon Tools · Palmon Tools").
export function formatPageTitle(name) {
  if (!name || name === SITE_NAME) return SITE_NAME;
  return `${name} · ${SITE_NAME}`;
}

export function useDocumentMeta({ title, description }) {
  const { pathname, search } = useLocation();

  useEffect(() => {
    if (title) {
      document.title = title;
      setMetaContent('property', 'og:title', title);
      setMetaContent('name', 'twitter:title', title);
    }

    if (description) {
      setMetaContent('name', 'description', description);
      setMetaContent('property', 'og:description', description);
      setMetaContent('name', 'twitter:description', description);
    }

    const canonical = `${SITE_ORIGIN}${BASE_PATH}${pathname}`;
    setLinkHref('canonical', canonical);
    setMetaContent('property', 'og:url', canonical);

    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_path: pathname + search,
        page_location: window.location.href,
        page_title: title || document.title,
      });
    }
  }, [title, description, pathname, search]);
}

function setMetaContent(attr, key, value) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}

function setLinkHref(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}
