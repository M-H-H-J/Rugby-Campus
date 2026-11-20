import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vercel from '../../../vercel.json';
import missingAsset from '../../../api/missing-asset';
import { isChunkLoadError, reloadOnce } from '@/lib/chunkReload';
import facts from '@/data/collegeSearchFacts.json';
import type { FactsFile } from '@/lib/search/facts';
import { costFor, costText } from '@/lib/search/cost';
import { emptyFilters, parseFilters } from '@/lib/search/filters';
import { search as searchColleges } from '@/lib/search/match';
import { readParam } from '@/lib/search/urlState';
import { hasExactAlias, matchesCollegeQuery } from '@/lib/collegeAliases';
import { colleges } from '@/data/colleges';
import { remoteCoachField } from '@/lib/useColleges';

const F = (facts as unknown as FactsFile).colleges;

const src = (p: string) => readFileSync(resolve(__dirname, '../../..', p), 'utf8');
type VercelJson = { rewrites: { source: string; destination: string }[]; headers: { source: string; headers: { key: string; value: string }[] }[]; functions?: Record<string, { maxDuration?: number }> };
const v = vercel as unknown as VercelJson;

function memoryStorage() {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, val: string) => { m.set(k, val); } };
}

describe('bug hunt S1: stale chunks after a redeploy', () => {
  it('recognises chunk-load errors from Chrome, Safari and Firefox, and nothing else', () => {
    expect(isChunkLoadError(new TypeError('Failed to fetch dynamically imported module: https://www.rugbycampus.org/assets/Colleges-abc123.js'))).toBe(true);
    expect(isChunkLoadError(new TypeError('Importing a module script failed.'))).toBe(true);
    expect(isChunkLoadError(new TypeError('error loading dynamically imported module'))).toBe(true);
    expect(isChunkLoadError(new Error('Unable to preload CSS for /assets/index-abc.css'))).toBe(true);
    expect(isChunkLoadError(new TypeError("Cannot read properties of undefined (reading 'map')"))).toBe(false);
    expect(isChunkLoadError(null)).toBe(false);
  });

  it('reloads once, then not again within 30 seconds, then again later', () => {
    const store = memoryStorage(); let reloads = 0; const reload = () => { reloads++; };
    expect(reloadOnce(store, reload, 1_000_000)).toBe(true);
    expect(reloadOnce(store, reload, 1_010_000)).toBe(false);
    expect(reloads).toBe(1);
    expect(reloadOnce(store, reload, 1_040_000)).toBe(true);
    expect(reloads).toBe(2);
  });

  it('never reloads when storage is blocked (no guard means a possible loop)', () => {
    let reloads = 0;
    const blocked = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } };
    expect(reloadOnce(blocked, () => { reloads++; })).toBe(false);
    expect(reloads).toBe(0);
  });

  it('every lazy page goes through the reload wrapper, inside an error boundary', () => {
    const app = src('src/App.tsx');
    expect(app).toContain("import { lazyWithReload as lazy } from '@/lib/chunkReload'");
    expect(app).not.toMatch(/import \{[^}]*\blazy\b[^}]*\} from 'react'/);
    expect(app).toMatch(/<ErrorBoundary resetKey=\{location\}>\s*<Suspense/);
    const main = src('src/main.tsx');
    expect(main).toContain("'vite:preloadError'");
    expect(main).toMatch(/<ErrorBoundary>\s*<App \/>/);
  });

  it('missing /assets/* get a plain-text 404, and the rewrite never points at index.html', () => {
    const r = v.rewrites.find((x) => x.source === '/assets/:path*');
    expect(r?.destination).toBe('/api/missing-asset');
    expect(v.rewrites.some((x) => x.destination === '/index.html')).toBe(false);
    const out: { status?: number; headers: Record<string, string>; body?: string } = { headers: {} };
    missingAsset({}, { set statusCode(n: number) { out.status = n; }, get statusCode() { return out.status ?? 200; }, setHeader: (k, val) => { out.headers[k] = val; }, end: (b) => { out.body = b; } });
    expect(out.status).toBe(404);
    expect(out.headers['Content-Type']).toMatch(/^text\/plain/);
    expect(out.headers['Cache-Control']).toBe('no-store');
    expect(out.body).not.toMatch(/<html/i);
  });
});

describe('bug hunt S3: "I live in <state>" pricing', () => {
  const ohio = parseFilters({ ...emptyFilters(), residency: 'in_state', home_state: 'OH', max_cost_usd_per_year: 50000 })!;

  it('an Ohio family pays out-of-state at Michigan, Arizona and Berkeley', () => {
    for (const s of ['university-of-michigan', 'university-of-arizona', 'university-of-california-berkeley']) {
      const v = costFor(F[s], 'in_state', 'OH');
      expect(v.rate, s).toBe('out_of_state');
      expect(v.amount, s).toBe(F[s].total_cost_out_of_state);
      expect(costText(F[s], 'in_state', 'OH').headline, s).toContain('out-of-state rate');
    }
  });

  it('the same family pays in-state at Ohio State', () => {
    const v = costFor(F['the-ohio-state-university'], 'in_state', 'OH');
    expect(v).toMatchObject({ rate: 'in_state', amount: F['the-ohio-state-university'].total_cost_in_state, assumed: false });
  });

  it('"US in-state" with no state picked assumes out-of-state, and says it assumed', () => {
    const v = costFor(F['university-of-michigan'], 'in_state', null);
    expect(v).toMatchObject({ rate: 'out_of_state', assumed: true });
  });

  it('Michigan, Arizona and Berkeley are no longer within a $50k budget for an Ohio family', () => {
    const out = searchColleges(F, ohio);
    const fits = new Set(out.fitsAll.map((r) => r.slug));
    for (const s of ['university-of-michigan', 'university-of-arizona', 'university-of-california-berkeley']) expect(fits.has(s), s).toBe(false);
  });

  it('the filter panel asks for a home state when "US in-state" is picked', () => {
    const p = src('src/components/search/FilterPanel.tsx');
    expect(p).toContain('aria-label="Your home state"');
    expect(p).toContain('home_state: (e.target.value || null)');
  });
});

describe('bug hunt S2 (fixed in #13, locked here): /colleges?q= parsing', () => {
  afterEach(() => vi.unstubAllGlobals());
  const at = (search: string) => vi.stubGlobal('window', { location: { search } });

  it('a stray % never throws', () => {
    for (const q of ['?q=%', '?q=100%', '?q=%E0%A4%A']) { at(q); expect(() => readParam('q')).not.toThrow(); }
    at('?q=%'); expect(readParam('q')).toBe('%');
  });

  it('+ and %20 both mean a space, and "Notre Dame" finds Notre Dame', () => {
    at('?q=Notre+Dame'); const plus = readParam('q');
    at('?q=Notre%20Dame'); const enc = readParam('q');
    expect(plus).toBe('Notre Dame'); expect(enc).toBe('Notre Dame');
    const exact = hasExactAlias(colleges, plus);
    expect(colleges.filter((c) => matchesCollegeQuery(c, plus, exact)).map((c) => c.slug)).toContain('university-of-notre-dame');
  });

  it('Colleges reads q through readParam, never a raw decodeURIComponent', () => {
    const p = src('src/pages/Colleges.tsx');
    expect(p).toContain("readParam('q')");
    expect(p).not.toContain('decodeURIComponent');
  });
});

describe('bug hunt S11: a coach cleared in Supabase stays cleared', () => {
  it('an empty or null DB value wins over the bundle when the row has the column', () => {
    expect(remoteCoachField({ coach_email: '' }, 'coach_email', 'coachEmail', 'departed@old.example')).toBe('');
    expect(remoteCoachField({ coach_email: null }, 'coach_email', 'coachEmail', 'departed@old.example')).toBe('');
    expect(remoteCoachField({ coach_name: '  Brad Tucker ' }, 'coach_name', 'coachName', 'Luke Gross')).toBe('Brad Tucker');
    expect(remoteCoachField({ coachName: '' }, 'coach_name', 'coachName', 'Luke Gross')).toBe('');
  });
  it('the bundle is used only when the row has no coach column at all', () => {
    expect(remoteCoachField({ slug: 'x' }, 'coach_name', 'coachName', 'Bundled Coach')).toBe('Bundled Coach');
  });
  it('useColleges uses it for both coach fields', () => {
    const u = src('src/lib/useColleges.ts');
    expect(u).toContain("coachName: remoteCoachField(r, 'coach_name', 'coachName'");
    expect(u).toContain("coachEmail: remoteCoachField(r, 'coach_email', 'coachEmail'");
  });
});
