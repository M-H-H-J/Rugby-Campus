// Post-launch audit, Wave 1 (27 Nov 2026): data, copy, routing and crawler fixes.
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { colleges, collegeUpdated, TIER_SUBLINE } from '@/data/colleges';
import { articles, formatGuideDate } from '@/data/articles';
import { HOME_HEADLINE, MONEY_LINE, CONTACT_EMAIL, homeDescription } from '@/config';

const root = new URL('../../../', import.meta.url);
const src = (p: string) => readFileSync(new URL(p, root), 'utf8');
const dist = (p: string) => { const u = new URL(`dist/${p}`, root); return existsSync(u) ? readFileSync(u, 'utf8') : null; };
const bySlug = (s: string) => colleges.find((c) => c.slug === s)!;
const article = (s: string) => articles.find((a) => a.slug === s)!;
const SQL = 'supabase/manual/2026-11-27-wave1-history-and-photo.sql';

describe('championship and finals history', () => {
  it('Navy: 2023 champions over Cal 28–22, 2024 and 2026 finalists', () => {
    const c = bySlug('united-states-naval-academy');
    expect(c.achievements).toContain('2023 D1A National Champions (beat Cal 28–22 in the final)');
    expect(c.achievements).toEqual(expect.arrayContaining(['2024 D1A Finalists', '2026 D1A Finalists']));
    expect(c.description).toMatch(/2023 D1A national title, beating Cal 28–22/);
  });
  it("Army: 2022 champions over Saint Mary's 20–8", () => {
    expect(bySlug('united-states-military-academy-army').achievements).toContain("2022 D1A National Champions (beat Saint Mary's 20–8 in the final)");
  });
  it('Brown: 2022 and 2024 NCR D1 champions, Queens beaten 23–20 in 2024', () => {
    const c = bySlug('brown-university');
    expect(c.achievements).toEqual(['2024 NCR D1 National Champions (beat Queens 23–20 in the final)', '2022 NCR D1 National Champions']);
  });
  it('Queens: 2024 and 2025 NCR D1 finalists', () => {
    const c = bySlug('queens-university-of-charlotte');
    expect(c.badges).toEqual(expect.arrayContaining(['2025 NCR D1 Finalists', '2024 NCR D1 Finalists']));
    expect(c.achievements).toContain('2024 NCR D1 Finalists (lost 23–20 to Brown)');
  });
  it('Life: four D1A titles and the 2025 final', () => {
    const c = bySlug('life-university');
    expect(c.achievements).toEqual(['4× D1A National Champions (2013, 2016, 2018, 2019)', '2025 D1A Finalists (lost to Cal)']);
    expect(c.description).toMatch(/2013, 2016, 2018 and 2019/);
  });
  it('no tier moved (Tier 1–4 counts unchanged)', () => {
    const count = (t: string) => colleges.filter((c) => c.tier === t).length;
    expect([count('championship'), count('playoff'), count('competitive'), count('emerging')]).toEqual([8, 14, 13, 15]);
  });
});

describe('Supabase sync file', () => {
  const sql = src(SQL);
  const block = (slug: string) => {
    const m = sql.match(new RegExp(`UPDATE public\\.colleges SET ([\\s\\S]*?)\\n WHERE slug = '${slug}';`));
    expect(m, slug).toBeTruthy();
    return m![1];
  };
  it.each(['united-states-naval-academy', 'united-states-military-academy-army', 'brown-university', 'queens-university-of-charlotte', 'life-university'])('%s matches colleges.ts exactly', (slug) => {
    const b = block(slug); const c = bySlug(slug);
    expect(b).toContain(`description = $d$${c.description}$d$`);
    expect(b).toContain(`badges = $j$${JSON.stringify(c.badges)}$j$::jsonb`);
    expect(b).toContain(`achievements = $j$${JSON.stringify(c.achievements)}$j$::jsonb`);
  });
  it('Southern Virginia image fields match colleges.ts', () => {
    const b = block('southern-virginia-university'); const c = bySlug('southern-virginia-university');
    expect(b).toContain(`image_url = '${c.imageUrl}'`);
    expect(b).toContain(`image_credit = $d$${c.imageCredit}$d$`);
    expect(b).toContain(`image_source_page = '${c.imageSourcePage}'`);
  });
  it('is idempotent and never touches tiers, coaches, inserts or deletes', () => {
    const body = sql.split('\nBEGIN;')[1].split('\nCOMMIT;')[0];
    expect(body).not.toMatch(/\b(INSERT|DELETE|DROP|TRUNCATE|ALTER)\b/i);
    expect(body).not.toMatch(/\b(tier|coach_name|coach_email)\s*=/);
    expect(sql).toMatch(/\nBEGIN;[\s\S]*\nCOMMIT;/);
  });
});

describe('images', () => {
  it('Southern Virginia has a real, attributed campus photo', () => {
    const c = bySlug('southern-virginia-university');
    expect(c.imageUrl).toBe('/college-images/southern-virginia-university.jpg');
    expect(c.imageCredit).toMatch(/public domain/);
    expect(src('docs/ATTRIBUTIONS-college-images.md')).toContain('southern-virginia-university.jpg');
  });
  it('every college image path points at a file in public/', () => {
    for (const c of colleges) {
      expect(c.imageUrl, c.slug).toMatch(/^\/college-images\/[a-z0-9-]+\.jpg$/);
      expect(existsSync(new URL(`public${c.imageUrl}`, root)), c.imageUrl).toBe(true);
    }
  });
});

describe('short URLs (vercel.json)', () => {
  const v = JSON.parse(src('vercel.json'));
  const shorts = (v.redirects as { source: string; destination: string; permanent: boolean }[]).filter((r) => r.source.startsWith('/{colleges/}?'));
  const slugs = new Set(colleges.map((c) => c.slug));
  it('covers the audit list (Harvard is not one of the 50, so it has no redirect)', () => {
    const names = shorts.map((r) => r.source.slice('/{colleges/}?'.length, -'{/}?'.length));
    for (const n of ['ucla', 'ohio-state', 'ohio-state-university', 'air-force', 'air-force-academy', 'navy', 'army', 'cal', 'byu', 'penn-state', 'notre-dame', 'st-bonaventure', 'saint-marys', 'life', 'lindenwood', 'walsh', 'usd', 'san-diego', 'grand-canyon', 'gcu', 'utah', 'arizona', 'indiana', 'michigan', 'brown', 'dartmouth', 'queens', 'mount-st-marys', 'belmont-abbey', 'davenport', 'mckendree', 'marian', 'wwu', 'ucsc', 'santa-clara', 'st-thomas', 'thomas-more']) expect(names, n).toContain(n);
    expect(names).not.toContain('harvard');
    for (const n of names) {
      expect(slugs.has(n), `${n} collides with a canonical slug`).toBe(false);
      expect(['map', 'colleges', 'learn', 'training', 'about', 'for-coaches', 'privacy', 'work-with-me', 'api', 'assets']).not.toContain(n);
    }
  });
  it('every short URL is a permanent redirect to a real profile, before the host redirect', () => {
    for (const r of shorts) {
      expect(r.permanent).toBe(true);
      expect(slugs.has(r.destination.replace('/colleges/', '')), r.destination).toBe(true);
    }
    expect(v.redirects.at(-1).has).toBeTruthy();
  });
  it('/privacy is rewritten to its prerendered page', () => {
    expect(v.rewrites).toContainEqual({ source: '/privacy', destination: '/privacy/index.html' });
    expect(src('src/App.tsx')).toContain('<Route path="/privacy" component={Privacy} />');
  });
});

describe('robots.txt', () => {
  const robots = src('public/robots.txt');
  const groups = robots.split(/\n\s*\n/).filter((g) => /User-agent:/i.test(g));
  it('every named bot group repeats Disallow: /api/', () => {
    const agents = ['*', 'GPTBot', 'ChatGPT-User', 'OAI-SearchBot', 'ClaudeBot', 'anthropic-ai', 'PerplexityBot', 'Google-Extended', 'Bingbot'];
    for (const a of agents) {
      const g = groups.find((x) => x.includes(`User-agent: ${a}\n`));
      expect(g, a).toBeTruthy();
      expect(g, a).toContain('Allow: /\n');
      expect(g, a).toContain('Disallow: /api/');
    }
  });
  it('stays public with the sitemap listed', () => {
    expect(robots).not.toMatch(/Disallow: \/\s*$/m);
    expect(robots).toContain('Sitemap: https://www.rugbycampus.org/sitemap.xml');
  });
});

describe("NCAA fact and men's clarity", () => {
  const allGuides = articles.map((a) => a.content).join('\n');
  it('never says rugby "isn\'t an NCAA sport at most schools"', () => {
    for (const p of ['src/data/articles.ts', 'public/llms.txt', 'scripts/prerender.mjs']) expect(src(p)).not.toMatch(/NCAA sport at most schools|Most college rugby isn't an NCAA sport/);
    expect(allGuides).toContain("Men's rugby isn't an NCAA sport anywhere (the NCAA lists varsity women's rugby as an Emerging Sport for Women)");
  });
  it("says men's on the homepage, the flagship guide and llms.txt", () => {
    expect(homeDescription(50)).toContain("men's college rugby");
    expect(src('src/pages/Home.tsx')).toContain("men's programs across CRAA D1A and NCR D1");
    const best = article('best-rugby-colleges-usa');
    expect(best.content).toContain("This guide is about **men's 15s**");
    expect(best.metaDescription).toContain("men's");
    expect(src('public/llms.txt')).toMatch(/men's college rugby programs/);
  });
});

describe('guide copy', () => {
  const best = article('best-rugby-colleges-usa').content;
  it('"Other strong D1A names" names real programs that are on the site', () => {
    const section = best.split('### Other strong D1A names worth exploring')[1].split('\n## ')[0];
    const links = [...section.matchAll(/\]\(\/colleges\/([a-z0-9-]+)\)/g)].map((m) => m[1]);
    expect(links.length).toBeGreaterThanOrEqual(4);
    for (const s of links) expect(colleges.some((c) => c.slug === s), s).toBe(true);
  });
  it('the scholarship callout is not inside the Life section, and the awkward lines are gone', () => {
    const life = best.split('### Life University')[1].split('\n### ')[0];
    expect(life).not.toMatch(/Scholarships/);
    expect(best).not.toMatch(/develops faster" on which bench|anti-agency/);
  });
  it('"When programs die" counts three programs and says Quinnipiac is women\'s', () => {
    const a = article('when-college-rugby-programs-die');
    expect(a.excerpt).toMatch(/^Three programs/);
    expect(a.excerpt).not.toMatch(/Two programs/);
    expect(a.content).toMatch(/Quinnipiac's was a \*\*women's varsity\*\* program/);
  });
  it('Tier 4 is described plainly', () => {
    expect(TIER_SUBLINE.emerging).toBe('Programs with fewer playoff runs in recent seasons.');
  });
  it('every guide has a real updated date, never before it was published, shown as a byline', () => {
    for (const a of articles) {
      expect(a.updatedDate, a.slug).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(a.updatedDate >= a.publishedDate, a.slug).toBe(true);
    }
    expect(formatGuideDate('2026-11-27')).toBe('27 November 2026');
    const page = src('src/pages/ArticlePage.tsx');
    expect(page).toContain('Hugh Johnston</Link>');
    expect(page).toContain('formatGuideDate(article.updatedDate)');
  });
  it('all guide meta descriptions fit in 160 characters', () => {
    for (const a of articles) expect(a.metaDescription.length, a.slug).toBeLessThanOrEqual(160);
  });
});

describe('privacy', () => {
  const page = src('src/pages/Privacy.tsx');
  it('covers what the audit asked for, in plain English', () => {
    for (const s of ['New guides by email', 'Unlock coach emails', 'Training program', 'Contact and coaching forms', 'college search', 'High-school students', 'never sold', 'Delete my details']) expect(page, s).toContain(s);
    expect(page).toContain('CONTACT_EMAIL');
    expect(CONTACT_EMAIL).toBe('hello@rugbycampus.org');
  });
  it('is linked from the footer and beside every email form', () => {
    expect(src('src/components/Footer.tsx')).toContain('href="/privacy"');
    for (const p of ['src/components/Footer.tsx', 'src/pages/Home.tsx', 'src/components/CoachEmailUnlock.tsx', 'src/pages/Training.tsx', 'src/components/ContactForm.tsx', 'src/components/CoachingEnquiry.tsx', 'src/pages/ArticlePage.tsx', 'src/components/search/ShortlistEmail.tsx']) {
      expect(src(p), p).toContain('<PrivacyNote');
    }
    expect(src('src/components/PrivacyNote.tsx')).toContain('href="/privacy"');
  });
});

describe('crawler parity and technical SEO', () => {
  const pre = src('scripts/prerender.mjs');
  it('SearchAction uses ?find=, the parameter the colleges page reads', () => {
    expect(pre).toContain('/colleges?find={search_term_string}');
    expect(pre).not.toContain('/colleges?q=');
    expect(src('src/pages/Home.tsx')).toContain("'/colleges?find='");
  });
  it('homepage H1 is one shared string', () => {
    expect(src('src/pages/Home.tsx')).toContain('{HOME_HEADLINE}');
    expect(pre).toContain('<h1>${esc(HOME_HEADLINE)}</h1>');
  });
  it('sitemap lastmod comes from content dates, not the build date', () => {
    expect(pre).not.toMatch(/new Date\(\)\.toISOString\(\)/);
    expect(collegeUpdated('united-states-naval-academy')).toBe('2026-11-27');
    expect(collegeUpdated('university-of-california-berkeley')).toBe('2026-11-20');
  });
  it('revenue disclosure is the same line in the footer and llms.txt, and coach emails need a signup', () => {
    expect(src('src/components/Footer.tsx')).toContain('{MONEY_LINE}');
    expect(src('public/llms.txt')).toContain(MONEY_LINE);
    expect(src('public/llms.txt')).toMatch(/coach email addresses are shown after a free one-time email signup/);
    expect(homeDescription(50)).toContain('free with an email signup');
  });

  // Built output (checked when dist exists, i.e. after npm run build).
  it('built pages carry the full first-hand content', () => {
    const about = dist('about/index.html'); if (!about) return;
    expect(about).toContain('Being on both sides of recruiting calls');
    expect(dist('training/index.html')).toContain('Day 1: Upper');
    expect(dist('for-coaches/index.html')).toContain('Verify your profile (free)');
    const learn = dist('learn/index.html')!;
    for (const a of articles) expect(learn, a.slug).toContain(a.excerpt.replace(/&/g, '&amp;').replace(/'/g, '&#x27;').replace(/"/g, '&quot;'));
    expect(dist('privacy/index.html')).toContain('Privacy, in plain English');
    expect(dist('index.html')).toContain(`<h1>${HOME_HEADLINE}</h1>`);
  });
  it('built sitemap lists /privacy and uses content dates', () => {
    const sm = dist('sitemap.xml'); if (!sm) return;
    expect(sm).toContain('<loc>https://www.rugbycampus.org/privacy</loc><lastmod>2026-11-27</lastmod>');
    expect(sm).toContain('<loc>https://www.rugbycampus.org/learn/why-college-rugby-rankings-lie</loc><lastmod>2026-06-20</lastmod>');
    expect(sm).toContain('<loc>https://www.rugbycampus.org/colleges/university-of-california-berkeley</loc><lastmod>2026-11-20</lastmod>');
    expect((sm.match(/<url>/g) ?? []).length).toBe(64);
  });
  it('built llms-full.txt states the MLR numbers once per program and includes the title history', () => {
    const txt = dist('llms-full.txt'); if (!txt) return;
    for (const line of txt.split('\n').filter((l) => l.startsWith('- ') && l.includes('/colleges/'))) {
      expect((line.match(/drafted/g) ?? []).length, line.slice(0, 60)).toBeLessThanOrEqual(1);
    }
    expect(txt).toContain('2023 D1A National Champions (beat Cal 28–22 in the final)');
    expect(txt).toContain('2024 NCR D1 Finalists (lost 23–20 to Brown)');
  });
});

describe("Hugh's credential and verifiable sources", () => {
  it('uses the exact title and the three public sources, with no Goff link', async () => {
    const { HUGH_TITLE, HUGH_SOURCES } = await import('@/config');
    expect(HUGH_TITLE).toBe("Men's Rugby Head Coach, Notre Dame College (2023 NCR D1 National Champions)");
    expect(HUGH_SOURCES.map((s) => s.url)).toEqual([
      'https://notredamefalcons.com/news/2023/12/10/mens-rugby-mens-rugby-wins-2023-national-championship.aspx',
      'https://notredamefalcons.com/sports/mens-rugby/coaches',
      'https://www.linkedin.com/in/hugh-johnston-au',
    ]);
    const about = src('src/pages/About.tsx');
    expect(about).toContain('HUGH_SOURCES.map');
    expect(about).toContain("['Coach', HUGH_TITLE]");
    for (const p of ['src/pages/About.tsx', 'scripts/prerender.mjs', 'public/llms.txt']) expect(src(p), p).not.toMatch(/goffrugbyreport\.com|href="[^"]*goff/i);
  });
  it('built pages carry Person sameAs on every page and ProfilePage on /about', () => {
    const about = dist('about/index.html'); if (!about) return;
    const ld = (html: string) => JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/)![1])['@graph'];
    for (const p of ['about/index.html', 'index.html', 'colleges/walsh-university/index.html', 'learn/best-rugby-colleges-usa/index.html']) {
      const person = ld(dist(p)!).find((x: { '@type': string }) => x['@type'] === 'Person');
      expect(person.sameAs, p).toContain('https://www.linkedin.com/in/hugh-johnston-au');
      expect(person.description, p).toContain("Men's Rugby Head Coach");
    }
    const profile = ld(about).find((x: { '@type': string }) => x['@type'] === 'ProfilePage');
    expect(profile.mainEntity['@id']).toBe('https://www.rugbycampus.org/about#hugh');
    expect(about).toContain('https://notredamefalcons.com/sports/mens-rugby/coaches');
  });
});

describe('live QA catches', () => {
  it('the Tier fact row is "Tier" + "2", never "Tier Tier 2"', async () => {
    const { tierNumber } = await import('@/data/colleges');
    expect(tierNumber('playoff')).toBe('2');
    expect(src('src/pages/CollegeDetail.tsx')).toContain("['Tier', tierNumber(college.tier)]");
    const html = dist('colleges/brigham-young-university/index.html'); if (!html) return;
    expect(html).toContain('<dt><strong>Tier</strong></dt><dd>2</dd>');
    expect(html).not.toMatch(/<dt><strong>Tier<\/strong><\/dt><dd>Tier/);
  });
  it('service academies read "US service academy", not "uS"', () => {
    for (const s of ['united-states-military-academy-army', 'united-states-naval-academy', 'united-states-air-force-academy']) {
      const html = dist(`colleges/${s}/index.html`); if (!html) return;
      expect(html, s).toContain('US service academy');
      expect(html, s).not.toContain('uS service academy');
    }
  });
  it('FAQPage answers are plain text, without Markdown links or bold', () => {
    for (const s of ['best-rugby-colleges-usa', 'how-to-play-rugby-college-usa']) {
      const html = dist(`learn/${s}/index.html`); if (!html) return;
      const faq = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/)![1])['@graph'].find((x: { '@type': string }) => x['@type'] === 'FAQPage');
      expect(faq.mainEntity.length, s).toBeGreaterThan(2);
      for (const q of faq.mainEntity) expect(q.name + q.acceptedAnswer.text, s).not.toMatch(/\]\(|\*\*/);
    }
  });
  it('San Diego keeps a blank coach, and its page still shows the coach block', () => {
    expect(bySlug('university-of-san-diego').coachName).toBe('');
    const html = dist('colleges/university-of-san-diego/index.html'); if (!html) return;
    expect(html).toContain('<h2>Head coach</h2><p>Head coach not confirmed yet. To be confirmed.</p>');
  });
});

describe('security cleanups', () => {
  it('every page sends X-Frame-Options and Permissions-Policy alongside the existing headers', () => {
    const all = JSON.parse(src('vercel.json')).headers.find((h: { source: string; headers: { key: string }[] }) => h.source === '/(.*)' && h.headers.some((x) => x.key === 'X-Content-Type-Options'));
    expect(all.headers).toEqual(expect.arrayContaining([
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ]));
  });
  it('.env files are ignored', () => {
    const lines = src('.gitignore').split('\n');
    expect(lines).toEqual(expect.arrayContaining(['.env', '.env.local']));
  });
});
