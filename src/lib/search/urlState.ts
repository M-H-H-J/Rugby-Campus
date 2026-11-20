/** Read and write query-string state with history.replaceState, so Back and refresh keep filters. */
export function readParam(name: string): string {
  if (typeof window === 'undefined') return '';
  try { return new URLSearchParams(window.location.search).get(name) ?? ''; } catch { return ''; }
}

export function writeParams(updates: Record<string, string | null | undefined>): void {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  for (const [k, v] of Object.entries(updates)) {
    if (v == null || v === '') params.delete(k); else params.set(k, v);
  }
  const qs = params.toString();
  const next = window.location.pathname + (qs ? `?${qs}` : '') + window.location.hash;
  if (next !== window.location.pathname + window.location.search + window.location.hash) {
    window.history.replaceState(window.history.state, '', next);
  }
}

const SHORTLIST_KEY = 'rc_shortlist';

export function loadShortlist(): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(SHORTLIST_KEY) ?? '[]');
    return Array.isArray(raw) ? raw.filter((s): s is string => typeof s === 'string').slice(0, 12) : [];
  } catch { return []; }
}

export function saveShortlist(slugs: string[]): void {
  try { localStorage.setItem(SHORTLIST_KEY, JSON.stringify(slugs.slice(0, 12))); } catch { /* private mode */ }
}
