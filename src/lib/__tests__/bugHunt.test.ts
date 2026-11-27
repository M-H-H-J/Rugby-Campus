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
import { absImageUrl, canonicalFor } from '@/lib/usePageMeta';
import { hasEmailUnlock, hasTrainingUnlock, rememberEmailUnlock, rememberTrainingUnlock, TRAINING_EMAIL_PARAM } from '@/lib/unlock';
import { welcomeCopy } from '../../../api/welcome-email';
import { existsSync } from 'node:fs';
import { inAppPath } from '@/lib/inAppLink';
import { escHtml } from '@/lib/escHtml';

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
    // Vercel: a function's Cache-Control overrides vercel.json, so the /assets immutable rule can't reach this 404 (L3).
    expect(out.headers['Cache-Control']).toBe('no-store');
    expect(out.headers['CDN-Cache-Control']).toBe('no-store');
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

  it('a home state never hides behind another residency (M1)', () => {
    expect(parseFilters({ ...emptyFilters(), residency: 'out_of_state', home_state: 'OH' })!.home_state).toBeNull();
    expect(parseFilters({ ...emptyFilters(), residency: 'international', home_state: 'OH' })!.home_state).toBeNull();
    expect(parseFilters({ ...emptyFilters(), residency: null, home_state: 'OH' })!.residency).toBe('in_state');
    expect(parseFilters({ ...emptyFilters(), residency: 'in_state', home_state: 'OH' })!.home_state).toBe('OH');
    expect(src('src/components/search/FilterPanel.tsx')).toContain("home_state: next === 'in_state' ? filters.home_state : null");
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

describe('bug hunt S9: share tags follow in-app navigation', () => {
  it('canonical and og:url use the current path on the www domain (fixed in #13)', () => {
    expect(canonicalFor('/')).toBe('https://www.rugbycampus.org/');
    expect(canonicalFor('/colleges/brown-university/')).toBe('https://www.rugbycampus.org/colleges/brown-university');
  });
  it('og:image is reset per page: the college photo, else the route\'s 1200×630 card (Wave 2: no more logo)', () => {
    expect(absImageUrl('/college-images/brown-university.jpg')).toBe('https://www.rugbycampus.org/college-images/brown-university.jpg');
    expect(absImageUrl(undefined)).toBe('https://www.rugbycampus.org/og/rugby-campus.jpg');
    expect(absImageUrl('https://upload.wikimedia.org/x.jpg')).toBe('https://upload.wikimedia.org/x.jpg');
    const meta = src('src/lib/usePageMeta.ts');
    expect(meta).toContain("setMeta('meta[property=\"og:image\"]', 'property', 'og:image', shareImage)");
    expect(meta).toContain('absImageUrl(image ?? card?.file)');
    expect(meta).toContain("setMeta('meta[property=\"og:url\"]'");
    expect(src('src/pages/CollegeDetail.tsx')).toContain('college?.imageUrl,');
    expect(src('src/pages/About.tsx')).not.toContain('headshot-og.jpg'); // About uses /og/about.jpg, which shows the headshot
  });
});

describe('bug hunt S8: the Training unlock survives a reload, and the email link opens it', () => {
  it('a training unlock is remembered; the email-link unlock opens training but not coach emails', () => {
    const viaLink = memoryStorage();
    rememberTrainingUnlock(viaLink);
    expect(hasTrainingUnlock(viaLink)).toBe(true);
    expect(hasEmailUnlock(viaLink)).toBe(false);
    const viaCoachBox = memoryStorage();
    rememberEmailUnlock(viaCoachBox);
    expect(hasTrainingUnlock(viaCoachBox)).toBe(true);
    expect(hasTrainingUnlock(memoryStorage())).toBe(false);
  });

  it('the training welcome email links to the unlocked page', () => {
    expect(TRAINING_EMAIL_PARAM).toBe('unlocked');
    expect(welcomeCopy('training_program').text).toContain('https://www.rugbycampus.org/training?unlocked=1');
  });

  it('Training reads the stored unlock and the link parameter, and stores both unlocks on submit', () => {
    const t = src('src/pages/Training.tsx');
    expect(t).toContain('useState(() => hasTrainingUnlock() || readParam(TRAINING_EMAIL_PARAM) === \'1\')');
    expect(t).toMatch(/rememberTrainingUnlock\(\);\s*rememberEmailUnlock\(\);/);
    expect(src('src/components/CoachEmailUnlock.tsx')).toContain('hasEmailUnlock()');
  });

  it('the dead second unlock module is gone (N12)', () => {
    expect(existsSync(resolve(__dirname, '../email-store.ts'))).toBe(false);
  });
});

describe('bug hunt S10: replaceable images are not cached as immutable', () => {
  const rule = (path: string) => {
    // Vercel applies every matching rule in order; a later rule overrides the same header.
    let value = '';
    for (const h of v.headers) {
      if (!new RegExp('^' + h.source.replace(/\\\./g, '\\.') + '$').test(path)) continue;
      const cc = h.headers.find((x) => x.key === 'Cache-Control');
      if (cc) value = cc.value;
    }
    return value;
  };
  it('college photos, the logo, Hugh photos and the favicon get one day plus stale-while-revalidate', () => {
    for (const p of ['/college-images/brown-university.jpg', '/logo.png', '/logo-white.png', '/favicon.ico', '/images/hugh/hugh-johnston-headshot-og.jpg']) {
      expect(rule(p), p).toBe('public, max-age=86400, stale-while-revalidate=604800');
    }
  });
  it('hashed Vite assets stay immutable for a year', () => {
    expect(rule('/assets/index-abc123.js')).toBe('public, max-age=31536000, immutable');
    expect(rule('/assets/logo-abc123.png')).toBe('public, max-age=31536000, immutable');
  });
});

describe('bug hunt nitpicks (site)', () => {
  it('N4: same-site links in guide text route in-app; external, new-tab and modified clicks do not', () => {
    expect(inAppPath('/map')).toBe('/map');
    expect(inAppPath('/learn/how-to-play-college-rugby')).toBe('/learn/how-to-play-college-rugby');
    expect(inAppPath('https://www.ncr.rugby')).toBeNull();
    expect(inAppPath('//evil.example/x')).toBeNull();
    expect(inAppPath('mailto:hello@rugbycampus.org')).toBeNull();
    expect(inAppPath('/map', { target: '_blank' })).toBeNull();
    expect(inAppPath('/map', { modifier: true })).toBeNull();
    expect(inAppPath('/map', { button: 1 })).toBeNull();
    expect(src('src/pages/ArticlePage.tsx')).toContain('onClick={routeInAppClicks(navigate)}');
  });

  it('N5: crawler HTML for guides renders *italic* and numbered lists like the page does', () => {
    const p = src('scripts/prerender.mjs');
    expect(p).toContain(".replace(/\\*(.+?)\\*/g, '<em>$1</em>')");
    expect(p).toMatch(/kind === 'ol'/);
  });

  it('N7: map popups escape text from Supabase', () => {
    expect(escHtml('<img src=x onerror=alert(1)> & "Saint" Mary\'s')).toBe('&lt;img src=x onerror=alert(1)&gt; &amp; &quot;Saint&quot; Mary&#39;s');
    const m = src('src/lib/mapMarkup.ts');
    for (const f of ['c.affiliation', 'c.name', 'c.location', 'c.slug']) expect(m, f).toContain(`\${escHtml(${f})}`);
    expect(m).not.toMatch(/>\$\{c\.(name|location|affiliation)\}</);
  });

  it('N8: skip link to #main, and inline About links are underlined', () => {
    const app = src('src/App.tsx');
    expect(app).toContain('<a href="#main"');
    expect(app).toContain('<main id="main"');
    expect(app.indexOf('href="#main"')).toBeLessThan(app.indexOf('<Navigation />'));
    expect(src('src/pages/About.tsx')).toMatch(/href="https:\/\/www\.niche\.com"[^>]*underline/);
  });

  it('N9: the Home finder explains a too-short entry instead of doing nothing', () => {
    const h = src('src/pages/Home.tsx');
    expect(h).toContain('setFindHint(true)');
    expect(h).toContain('id="home-find-hint"');
  });

  it('S12: abuse limits are proposed as SQL for Hugh to run, not run here', () => {
    const sql = src('supabase/manual/2026-11-20-abuse-limits.sql');
    expect(sql).toMatch(/PROPOSAL ONLY\. Not run by the PR/);
    expect(sql).toContain('CREATE UNIQUE INDEX IF NOT EXISTS email_subscribers_email_source_key');
    expect(sql).toContain('NOT VALID');
    expect(sql).toMatch(/^BEGIN;$/m);
    expect(sql).toMatch(/^COMMIT;$/m);
  });

  it('S12 (review M2): no client created_at, per-address brake, reversible de-dup, safe to re-run', () => {
    const sql = src('supabase/manual/2026-11-20-abuse-limits.sql');
    const body = sql.split('\n').filter((l) => !l.trim().startsWith('--')).join('\n');
    expect(body).toContain('NEW.created_at := now();');
    expect(body).toMatch(/WHERE lower\(email\) = lower\(\$1\)/);
    expect(body).not.toMatch(/WHERE created_at > now\(\) - interval ''1 minute''/);
    const backup = body.indexOf('CREATE TABLE IF NOT EXISTS public.email_subscribers_backup_20261120 AS TABLE public.email_subscribers');
    expect(backup).toBeGreaterThan(-1);
    expect(backup).toBeLessThan(body.indexOf('DELETE FROM public.email_subscribers'));
    for (const name of ['email_subscribers_email_shape', 'email_subscribers_source_known', 'contacts_sizes']) {
      expect(body.indexOf(`DROP CONSTRAINT IF EXISTS ${name}`), name).toBeLessThan(body.indexOf(`ADD CONSTRAINT ${name}`));
    }
    expect(sql).toMatch(/-- INSERT INTO public\.email_subscribers .*OVERRIDING SYSTEM VALUE/);
    const form = src('src/components/ContactForm.tsx');
    expect(form).toContain('maxLength={5000}');
    expect(form).toContain('maxLength={200}');
  });
});
