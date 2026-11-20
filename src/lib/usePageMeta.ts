import { useEffect } from 'react';
import { SITE_NAME, SITE_URL } from '@/config';

const HOME_TITLE = `${SITE_NAME} | Best Rugby Colleges in America, Mapped`;

function setMeta(selector: string, attr: 'name' | 'property', key: string, value: string) {
  let el = document.querySelector(selector) as HTMLMetaElement | null;
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
  el.content = value;
}

/** Same rule as scripts/prerender.mjs: social apps need a full address, and the logo is the default. */
export function absImageUrl(u?: string): string {
  if (!u) return `${SITE_URL}/logo.png`;
  return /^https?:\/\//i.test(u) ? u : `${SITE_URL}${u.startsWith('/') ? '' : '/'}${u}`;
}

/** The canonical address for a path: www domain, no trailing slash except the homepage. */
export function canonicalFor(pathname: string): string {
  return `${SITE_URL}${pathname === '/' ? '/' : pathname.replace(/\/$/, '')}`;
}

/**
 * Sets the title, description, og tags and canonical for the current route.
 * `fullTitle` is used as the whole <title> (guides pass their metaTitle); otherwise " | Rugby Campus" is added.
 * `image` is the share image (the logo when omitted), so a page reached in-app never keeps the previous page's.
 */
export function usePageMeta(title: string, description?: string, fullTitle?: string, image?: string) {
  useEffect(() => {
    const t = fullTitle ?? (title ? `${title} | ${SITE_NAME}` : HOME_TITLE);
    document.title = t;
    if (description) {
      setMeta('meta[name="description"]', 'name', 'description', description);
      setMeta('meta[property="og:description"]', 'property', 'og:description', description);
    }
    setMeta('meta[property="og:title"]', 'property', 'og:title', t);
    const url = canonicalFor(window.location.pathname);
    setMeta('meta[property="og:url"]', 'property', 'og:url', url);
    setMeta('meta[property="og:image"]', 'property', 'og:image', absImageUrl(image));
    const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (canonical) canonical.href = url;
  }, [title, description, fullTitle, image]);
}

/** Adds <meta name="robots" content="noindex"> and removes the canonical while active (not-found pages). */
export function useNoindex(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const el = document.createElement('meta');
    el.name = 'robots';
    el.content = 'noindex';
    document.head.appendChild(el);
    const canonical = document.querySelector('link[rel="canonical"]');
    const parent = canonical?.parentNode ?? null;
    canonical?.remove();
    return () => { el.remove(); if (canonical && parent) parent.appendChild(canonical); };
  }, [active]);
}
