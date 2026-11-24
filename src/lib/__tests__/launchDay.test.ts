import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { colleges, TIER_LABELS } from '@/data/colleges';
import { articles } from '@/data/articles';
import factsFile from '@/data/collegeSearchFacts.json';
import { SITE_URL } from '@/config';
import type { FactsFile } from '@/lib/search/facts';
import { emptyFilters, parseFilters } from '@/lib/search/filters';
import { describeFilters, search } from '@/lib/search/match';
import { costText } from '@/lib/search/cost';
import { profileFactRows } from '@/components/ProfileFacts';
import CoachEmailUnlock from '@/components/CoachEmailUnlock';
import { collegeMetaDescription } from '@/pages/CollegeDetail';
import { hasExactAlias, matchesCollegeQuery } from '@/lib/collegeAliases';
import { COLLEGE_NAMES } from '../../../api/_lib/collegeNames';
import vercel from '../../../vercel.json';

const F = (factsFile as unknown as FactsFile).colleges;
const src = (p: string) => readFileSync(new URL(`../../../${p}`, import.meta.url), 'utf8');
const bySlug = (s: string) => colleges.find((c) => c.slug === s)!;
const base = (o: Record<string, unknown>) => parseFilters({ ...emptyFilters(), ...o })!;
const ACADEMIES = ['united-states-naval-academy', 'united-states-military-academy-army', 'united-states-air-force-academy'];

describe('launch day, 20 Nov 2026: tiers', () => {
  it('tiers display as Tier 1 to Tier 4 and no old soft name is left in visible copy', () => {
    expect(Object.values(TIER_LABELS)).toEqual(['Tier 1', 'Tier 2', 'Tier 3', 'Tier 4']);
    const visible = [src('src/lib/search/match.ts'), src('scripts/prerender.mjs'), src('public/llms.txt'), src('src/pages/CollegeDetail.tsx'), articles.map((a) => a.content).join('\n')].join('\n');
    for (const old of ['Often near the top', 'Playoff calibre', 'Playoff caliber', 'A real season', 'Room to play', 'often near the top', 'playoff-caliber']) {
      expect(visible.includes(old), old).toBe(false);
    }
  });
  it('no tier moved: counts per tier match the facts file', () => {
    for (const c of colleges) expect(F[c.slug].rugby_tier, c.slug).toBe(c.tier);
    const count = (t: string) => colleges.filter((c) => c.tier === t).length;
    expect([count('championship'), count('playoff'), count('competitive'), count('emerging')]).toEqual([8, 14, 13, 15]);
  });
  it('college meta descriptions are 160 characters or fewer, guide metas too', () => {
    for (const c of colleges) expect(collegeMetaDescription(c).length, c.slug).toBeLessThanOrEqual(160);
    for (const a of articles) expect(a.metaDescription.length, a.slug).toBeLessThanOrEqual(160);
  });
});

describe('launch day: data in all three places', () => {
  it('Indiana is Brad Tucker with no email, and Luke Gross is gone from every copy', () => {
    expect(bySlug('indiana-university').coachName).toBe('Brad Tucker');
    expect(bySlug('indiana-university').coachEmail).toBe('');
    for (const p of ['src/data/colleges.ts', 'supabase-setup.sql', 'supabase-full-sync-2026-11-06.sql', 'supabase/manual/2026-11-20-launch-fixes.sql']) {
      expect(src(p).includes('coachgrossusa'), p).toBe(false);
    }
  });
  it('the bulk sync generator never writes coach fields over the table', () => {
    const gen = src('scripts/gen-supabase-full-sync.ts');
    expect(gen).toContain("dbOwned = new Set(['coach_name', 'coach_email'])");
    expect(gen).not.toMatch(/EXCLUDED\.coach_/);
  });
  it('Air Force is a club with John Cullen, the team inbox and the club site', () => {
    const af = bySlug('united-states-air-force-academy');
    expect([af.programType, af.coachName, af.coachEmail, af.rugbyProgramUrl]).toEqual(['Club', 'John Cullen', 'ZoomieMensRugby@gmail.com', 'https://zoomierugby.com/mens-team']);
    expect(F[af.slug].mens_rugby_program_type).toBe('club');
    expect(af.description).not.toMatch(/was not named|when this was checked/);
    const sql = src('supabase/manual/2026-11-20-launch-fixes.sql');
    expect(sql).toContain("program_type = 'Club', coach_name = 'John Cullen', coach_email = 'ZoomieMensRugby@gmail.com'");
  });
  it('Ohio State is Big Ten in the bundle and the SQL', () => {
    expect(bySlug('the-ohio-state-university').conference).toBe('Big Ten');
    expect(bySlug('the-ohio-state-university').description).not.toMatch(/Midwest/);
    expect(src('supabase/manual/2026-11-20-launch-fixes.sql')).toContain("SET conference = 'Big Ten' WHERE slug = 'the-ohio-state-university'");
  });
  it('the six Supabase-only coaches are in the bundle; owner-approved coaches are filled', () => {
    const want: Record<string, string> = { 'dartmouth-college': 'Kyle Sumsion', 'marian-university': 'John Harley', 'santa-clara-university': 'Paul Keeler', 'southern-nazarene-university': 'Aric Gilliland', 'university-of-michigan': 'Christian Mentzer', 'university-of-san-diego': '', 'university-of-california-santa-cruz': 'Jeremy Sanford' };
    for (const [s, n] of Object.entries(want)) expect(bySlug(s).coachName, s).toBe(n);
    for (const [s, n] of [['university-of-utah', 'Cam Diloreto'], ['western-washington-university', 'Adam Roberts'], ['the-ohio-state-university', 'Pete Malcolm']]) expect(bySlug(s).coachName, s).toBe(n);
    const sql = src('supabase/manual/2026-11-20-fact-fixes.sql');
    for (const s of ['university-of-utah', 'western-washington-university', 'the-ohio-state-university']) expect(sql, s).toMatch(new RegExp(`SET coach_name = '[^']+' WHERE slug = '${s}'`));
    expect(sql).not.toMatch(/coach_email\s*=/);
    for (const s of ['kutztown-university', 'mckendree-university', 'university-of-san-diego']) expect(bySlug(s).coachEmail, s).toBe('');
  });
  it('academies share one citizenship line in the bundle and the facts', () => {
    for (const s of ACADEMIES) {
      expect(bySlug(s).description, s).toMatch(/^You need U\.S\. citizenship to attend, apart from a small number of students nominated by their own government\./);
      expect(F[s].intl_admission_route, s).toBe('nomination_only');
    }
  });
  it('no description reads like a research note', () => {
    for (const c of colleges) expect(c.description, c.slug).not.toMatch(/when (this|the athletics site) was checked|does not say whether|not confirmed when/);
    expect(bySlug('wingate-university').playerCountNote).toBe('22 players (2026–27 roster)');
  });
  it('the shortlist email uses real names for every college', () => {
    expect(Object.keys(COLLEGE_NAMES).sort()).toEqual(colleges.map((c) => c.slug).sort());
    for (const c of colleges) expect(COLLEGE_NAMES[c.slug], c.slug).toBe(c.name);
    expect(src('api/shortlist-email.ts')).not.toMatch(/toUpperCase\(\) \+ w\.slice/);
  });
});

describe('launch day: sentence search', () => {
  it('"international" shows a chip and academies are not fits', () => {
    const f = base({ residency: 'international', max_cost_usd_per_year: 40000 });
    expect(describeFilters(f).map((c) => c.label)).toContain('International student');
    const r = search(F, f);
    for (const s of ACADEMIES) expect(r.fitsAll.map((x) => x.slug), s).not.toContain(s);
    expect(r.results.length).toBe(50);
    expect(r.fitsAll.length).toBeGreaterThan(0);
  });
  it('an unverified answer is never a full fit', () => {
    const r = search(F, base({ division: ['d3'] }));
    expect(r.fitsAll.every((x) => x.checks.every((c) => c.status === 'match' || ['rugby_aid', 'very_hot'].includes(c.key)))).toBe(true);
  });
  it('a Catholic search no longer puts Air Force first', () => {
    const r = search(F, base({ religion: 'catholic', climate: ['cold_winters'], max_cost_usd_per_year: 50000 }));
    expect(r.fitsAll.map((x) => x.slug)).not.toContain('united-states-air-force-academy');
    expect(F['united-states-air-force-academy'].religion_group).toBe('none');
    expect(F['university-of-california-santa-cruz'].religion_group).toBe('none');
  });
  it('"competitive rugby" is Tier 1-2 and never the Tier 3 key; "championship" is Tier 1', () => {
    const prompt = src('api/_lib/prompt.ts');
    expect(prompt).toContain('"top/best/good/strong/competitive rugby" -> championship, playoff');
    expect(prompt).toContain('never use it just because the user wrote the word "competitive"');
    expect(prompt).toMatch(/"championship\/title-winning\/national champions\/tier 1" -> championship;/);
  });
  it('tuition-only and resident-only costs are labelled', () => {
    expect(costText(F['brigham-young-university']).headline).toMatch(/tuition only/);
    expect(costText(F['pennsylvania-state-university']).headline).toMatch(/tuition only/);
    expect(costText(F['university-of-rio-grande']).headline).toMatch(/in-state residents/);
    expect(costText(F['university-of-rio-grande']).sub).toContain("Before scholarships. Ask the coach what's available.");
    expect(costText(F['pennsylvania-state-university'], 'international').headline).toBe('$44,574 (out-of-state rate, tuition only)');
    expect(costText(F['brigham-young-university']).headline).toBe('$14,192 (tuition only)');
    expect(costText(F['university-of-california-santa-cruz']).sub).not.toMatch(/Scorecard/);
  });
});

describe('launch day: profile and coach box', () => {
  it('unconfirmed facts are hidden, never "Not confirmed" or "TBC"', () => {
    for (const c of colleges) {
      for (const [, v] of profileFactRows(c)) expect(v, c.slug).not.toMatch(/Not confirmed|TBC/);
    }
    expect(profileFactRows(bySlug('arkansas-state-university')).some(([k]) => k === 'Coach')).toBe(false);
    expect(profileFactRows(bySlug('united-states-naval-academy')).find(([k]) => k === 'International players')?.[1]).toBe('Only via home-government nomination');
  });
  it('the coach box has no fake address and never offers an unlock without an email', () => {
    for (const c of colleges) {
      const html = renderToStaticMarkup(createElement(CoachEmailUnlock, { coachName: c.coachName, coachEmail: c.coachEmail, collegeName: c.name, rugbyProgramUrl: c.rugbyProgramUrl }));
      expect(html, c.slug).not.toContain('coach@university.edu');
      expect(html.includes('Unlock coach email'), c.slug).toBe(!!c.coachEmail);
      expect(html, c.slug).not.toContain('Coach: TBC');
    }
    const smc = bySlug('saint-mary-s-college-of-california');
    const html = renderToStaticMarkup(createElement(CoachEmailUnlock, { coachName: smc.coachName, coachEmail: smc.coachEmail, collegeName: smc.name, rugbyProgramUrl: smc.rugbyProgramUrl }));
    expect(html).toContain('program page');
  });
  it('the unlock dialog is accessible and portalled above the nav', () => {
    const c = src('src/components/CoachEmailUnlock.tsx');
    for (const s of ['createPortal', 'role="dialog"', 'aria-modal="true"', "'Escape'", "body.style.overflow = 'hidden'", 'text-[16px]', 'trigger.current?.focus()']) expect(c, s).toContain(s);
  });
});

describe('launch day: Colleges name search', () => {
  const find = (q: string) => { const exact = hasExactAlias(colleges, q); return colleges.filter((c) => matchesCollegeQuery(c, q, exact)).map((c) => c.slug); };
  it.each([
    ['Navy', 'united-states-naval-academy'], ['army', 'united-states-military-academy-army'], ['Air Force', 'united-states-air-force-academy'],
    ['USAFA', 'united-states-air-force-academy'], ['BYU', 'brigham-young-university'], ['Penn State', 'pennsylvania-state-university'],
    ['Cal', 'university-of-california-berkeley'], ['UCLA', 'university-of-california-los-angeles-ucla'], ['UCSC', 'university-of-california-santa-cruz'],
    ['St Mary', 'saint-mary-s-college-of-california'], ["St. Mary's", 'saint-mary-s-college-of-california'], ['ND', 'university-of-notre-dame'],
    ['KU', 'kutztown-university'], ['MSM', 'mount-st-mary-s-university'], ['SVU', 'southern-virginia-university'], ['CSU', 'colorado-state-university'],
    ['CSULB', 'california-state-university-long-beach'], ['long beach', 'california-state-university-long-beach'], ['st bonaventure', 'st-bonaventure-university'],
  ])('"%s" finds %s', (q, slug) => { expect(find(q)).toContain(slug); });
  it('short exact aliases return just that college', () => {
    expect(find('Cal')).toEqual(['university-of-california-berkeley']);
    expect(find('ND')).toEqual(['university-of-notre-dame']);
  });
});

describe('launch day: domain, 404 and hosts', () => {
  it('canonical domain is www everywhere', () => {
    expect(SITE_URL).toBe('https://www.rugbycampus.org');
    expect(src('public/robots.txt')).toContain('Sitemap: https://www.rugbycampus.org/sitemap.xml');
    expect(src('public/robots.txt')).toMatch(/User-agent: \*\nAllow: \//);
    expect(src('public/llms.txt')).not.toMatch(/https:\/\/rugbycampus\.org/);
  });
  it('vercel.json: no catch-all, /work-with-me redirects, vercel.app redirects, other hosts noindex', () => {
    const v = vercel as unknown as { redirects: { source: string; destination: string; has?: { value: string }[] }[]; rewrites: { destination: string }[]; headers: { missing?: { value: string }[]; headers: { key: string; value: string }[] }[] };
    expect(v.rewrites.some((r) => r.destination === '/index.html')).toBe(false);
    expect(v.redirects.find((r) => r.source === '/work-with-me')?.destination).toBe('/about');
    expect(v.redirects.find((r) => r.has?.[0]?.value === 'rugby-campus\\.vercel\\.app')?.destination).toBe('https://www.rugbycampus.org/:path*');
    const noindex = v.headers.find((h) => h.missing?.[0]?.value === 'www\\.rugbycampus\\.org');
    expect(noindex?.headers[0]).toEqual({ key: 'X-Robots-Tag', value: 'noindex' });
  });
  it('prerender writes a noindex 404 page and keeps /work-with-me out of the sitemap', () => {
    const p = src('scripts/prerender.mjs');
    expect(p).toContain("file: '404.html', noindex: true");
    expect(p).not.toContain("'/work-with-me'");
  });
});
