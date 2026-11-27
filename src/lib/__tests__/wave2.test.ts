// Post-launch Wave 2 (27 Nov 2026): campus photo WebP, map tiles, 1200×630 share cards, guide tables, /ai-info,
// and the optional "How did you find us?" answer. Checks on built pages run when dist/ exists (after npm run build).
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { colleges, TIER_ORDER } from '@/data/colleges';
import { articles } from '@/data/articles';
import { HUGH_SOURCES, HUGH_TITLE } from '@/config';
import { campusSources, CAMPUS_SIZES } from '@/lib/campusImage';
import variants from '@/data/collegeImageVariants.json';
import { PAGE_CARDS, guideCard, shareCardFor, OG_WIDTH, OG_HEIGHT } from '@/data/shareImages';
import { startsTable, readTable, tablesIn } from '@/lib/markdownTable';
import { KEY_FACTS } from '@/data/siteFacts';
import { FOUND_US_CHANNEL_IDS, FOUND_US_CONTEXTS, foundUsDone, markFoundUsDone, newAnswerId } from '@/lib/foundUs';
import { CHANNELS, CONTEXTS } from '../../../api/found-us';
import { GUIDE_BLOCKS, varsityCount, clubCount, shortCost } from '../../../scripts/guide-tables';
import { CITE_TABLE } from '@/pages/AiInfo';
import factsFile from '@/data/collegeSearchFacts.json';
import type { FactsFile } from '@/lib/search/facts';

const FACTS = (factsFile as unknown as FactsFile).colleges;

const root = new URL('../../../', import.meta.url);
const file = (p: string) => new URL(p, root);
const src = (p: string) => readFileSync(file(p), 'utf8');
const hasDist = existsSync(file('dist/index.html'));
const dist = (p: string) => readFileSync(file(`dist/${p}`), 'utf8');
const article = (s: string) => articles.find((a) => a.slug === s)!;
const memory = () => { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) }; };

/** Width and height from a baseline or progressive JPEG's SOF marker. */
function jpegSize(path: URL): { width: number; height: number } {
  const b = readFileSync(path);
  for (let i = 2; i < b.length;) {
    if (b[i] !== 0xff) { i++; continue; }
    const m = b[i + 1];
    if (m >= 0xc0 && m <= 0xc3) return { height: b.readUInt16BE(i + 5), width: b.readUInt16BE(i + 7) };
    i += 2 + b.readUInt16BE(i + 2);
  }
  throw new Error(`no SOF in ${path}`);
}

describe('campus photos: WebP at the right size, .jpg kept for Supabase paths', () => {
  const V = variants as Record<string, { widths: number[]; ratio: number }>;
  it('every college photo has WebP copies on disk, and its original .jpg still exists', () => {
    for (const c of colleges) {
      const s = campusSources(c.imageUrl);
      expect(s, c.slug).not.toBeNull();
      expect(existsSync(file(`public${c.imageUrl}`)), c.imageUrl).toBe(true);
      for (const part of s!.srcSet.split(', ')) {
        const [path, w] = part.split(' ');
        expect(existsSync(file(`public${path}`)), path).toBe(true);
        expect(w).toMatch(/^\d+w$/);
      }
    }
  });
  it('the manifest lists only files that exist, and no stray WebP sits in the folder', () => {
    const listed = new Set(Object.entries(V).flatMap(([stem, v]) => v.widths.map((w) => `${stem}-${w}.webp`)));
    const onDisk = readdirSync(file('public/college-images/')).filter((f) => f.endsWith('.webp'));
    expect(new Set(onDisk)).toEqual(listed);
  });
  it('profile heroes average under 180 KB and directory cards are far smaller than the originals', () => {
    let hero = 0, card = 0, jpg = 0;
    for (const [stem, v] of Object.entries(V)) {
      const size = (w: number) => statSync(file(`public/college-images/${stem}-${w}.webp`)).size;
      hero += size(v.widths.at(-1)!);
      card += size(v.widths[0]);
      jpg += statSync(file(`public/college-images/${stem}.jpg`)).size;
      expect(size(v.widths.at(-1)!), stem).toBeLessThan(280 * 1024);
      expect(size(v.widths[0]), stem).toBeLessThanOrEqual(40 * 1024);
    }
    const n = Object.keys(V).length;
    expect(hero / n).toBeLessThan(180 * 1024);
    expect(card / n).toBeLessThan(40 * 1024);
    expect(hero).toBeLessThan(jpg * 0.4);
  });
  it('derives WebP only from a local /college-images/<slug>.jpg it has copies for', () => {
    expect(campusSources('/college-images/walsh-university.jpg')!.srcSet).toMatch(/^\/college-images\/walsh-university-480\.webp 480w, /);
    expect(campusSources('/college-images/WALSH-UNIVERSITY.JPG')).not.toBeNull();
    expect(campusSources(' /college-images/walsh-university.jpg ')).not.toBeNull();
    for (const u of ['', undefined, null, '/college-images/not-a-college.jpg', 'https://upload.wikimedia.org/x.jpg', '/images/walsh/scrum.webp', '/college-images/walsh-university.png']) {
      expect(campusSources(u), String(u)).toBeNull();
    }
  });
  it('every campus photo on cards, the homepage and profiles goes through CampusPhoto (a <picture> with the .jpg fallback)', () => {
    for (const p of ['src/components/CollegeCard.tsx', 'src/pages/Colleges.tsx', 'src/pages/Home.tsx', 'src/pages/CollegeDetail.tsx']) {
      expect(src(p), p).toContain('<CampusPhoto');
      expect(src(p), p).not.toMatch(/<img[^>]*imageUrl/);
    }
    const photo = src('src/components/CampusPhoto.tsx');
    expect(photo).toContain('<source type="image/webp"');
    expect(photo).toContain('src={src}');
    expect(src('src/pages/CollegeDetail.tsx')).toMatch(/<CampusPhoto[^>]*size="hero"[^>]*eager/);
    expect(Object.keys(CAMPUS_SIZES)).toEqual(['hero', 'card', 'lead']);
  });
  it('Supabase image_url values stay .jpg (no DB change needed)', () => {
    for (const c of colleges) expect(c.imageUrl).toMatch(/^\/college-images\/[a-z0-9-]+\.jpg$/);
    expect(src('src/lib/useColleges.ts')).toContain('imageUrl: remoteText(r.image_url ?? r.imageUrl');
  });
});

describe('map tiles', () => {
  const map = src('src/components/LeafletMap.tsx');
  it('never requests tiles from OpenStreetMap\'s own servers', () => {
    expect(map).not.toMatch(/tile\.openstreetmap\.org/);
  });
  it('uses OpenFreeMap vector tiles (no key) through MapLibre GL, with the required credit', () => {
    expect(map).toContain("BASEMAP_STYLE = 'https://tiles.openfreemap.org/styles/positron'");
    expect(map).toContain("import('@/lib/maplibreBasemap')");
    expect(src('src/lib/maplibreBasemap.ts')).toContain("setWorkerUrl(workerUrl)");
    for (const credit of ['href="https://openfreemap.org"', '&copy; OpenMapTiles', 'href="https://www.openstreetmap.org/copyright"']) expect(map).toContain(credit);
    expect(map).toContain('map.attributionControl.addAttribution(BASEMAP_ATTRIBUTION)');
    expect(map).not.toMatch(/basemaps\.cartocdn\.com/);
  });
});

describe('1200×630 share cards', () => {
  const cards = [...PAGE_CARDS.map((c) => c.file), ...articles.map((a) => guideCard(a).file)];
  it('every card file exists, is exactly 1200×630, and is small', () => {
    for (const f of cards) {
      const u = file(`public${f}`);
      expect(existsSync(u), f).toBe(true);
      expect(jpegSize(u), f).toEqual({ width: OG_WIDTH, height: OG_HEIGHT });
      expect(statSync(u).size, f).toBeLessThan(120 * 1024);
    }
  });
  it('covers Home, Learn, Training, For coaches, About, Privacy, /ai-info, Map and Colleges; anything else gets the site card', () => {
    const want: Record<string, string> = { '/': 'rugby-campus', '/learn': 'learn', '/training': 'training', '/for-coaches': 'for-coaches', '/about': 'about',
      '/privacy': 'privacy', '/ai-info': 'ai-info', '/map': 'map', '/colleges': 'colleges' };
    for (const [p, name] of Object.entries(want)) expect(shareCardFor(p).file, p).toBe(`/og/${name}.jpg`);
    expect(shareCardFor('/learn/').file).toBe('/og/learn.jpg');
    expect(shareCardFor('/nope').file).toBe('/og/rugby-campus.jpg');
    expect(guideCard({ slug: 'x', title: 'T' })).toEqual({ file: '/og/learn-x.jpg', alt: 'Rugby Campus guide: T' });
  });
  it('the client sets og:image, twitter:image, size and alt; the static template defaults to the site card', () => {
    const meta = src('src/lib/usePageMeta.ts');
    for (const k of ['twitter:image', 'og:image:width', 'og:image:height', 'og:image:alt']) expect(meta).toContain(k);
    expect(src('index.html')).toContain('https://www.rugbycampus.org/og/rugby-campus.jpg');
    expect(src('src/pages/ArticlePage.tsx')).toContain('guideCard(article).file');
  });
  it.runIf(hasDist)('built pages: every non-college page shares a 1200×630 card, never the 480×179 logo', () => {
    const pages = [['index.html', '/og/rugby-campus.jpg'], ['learn/index.html', '/og/learn.jpg'], ['training/index.html', '/og/training.jpg'], ['for-coaches/index.html', '/og/for-coaches.jpg'],
      ['about/index.html', '/og/about.jpg'], ['privacy/index.html', '/og/privacy.jpg'], ['ai-info/index.html', '/og/ai-info.jpg'], ['map/index.html', '/og/map.jpg'], ['colleges/index.html', '/og/colleges.jpg'],
      ...articles.map((a) => [`learn/${a.slug}/index.html`, guideCard(a).file])];
    for (const [p, img] of pages) {
      const html = dist(p);
      expect(html, p).toContain(`<meta property="og:image" content="https://www.rugbycampus.org${img}" />`);
      expect(html, p).toContain(`<meta name="twitter:image" content="https://www.rugbycampus.org${img}" />`);
      expect(html, p).toContain('<meta property="og:image:width" content="1200" />');
      expect(html, p).toContain('<meta property="og:image:height" content="630" />');
      expect(html, p).toMatch(/<meta property="og:image:alt" content="[^"]+" \/>/);
      expect((html.match(/property="og:image"/g) ?? []).length, p).toBe(1);
      expect(html, p).not.toMatch(/og:image" content="[^"]*logo\.png/);
    }
  });
  it.runIf(hasDist)('built college pages keep the campus .jpg for previews and preload the WebP hero', () => {
    const html = dist('colleges/walsh-university/index.html');
    expect(html).toContain('<meta property="og:image" content="https://www.rugbycampus.org/college-images/walsh-university.jpg" />');
    expect(html).not.toContain('og:image:width');
    expect(html).toMatch(/<link rel="preload" as="image" type="image\/webp" imagesrcset="\/college-images\/walsh-university-480\.webp 480w, [^"]+" imagesizes="\(min-width: 1200px\) 1152px, 100vw" fetchpriority="high" \/>/);
  });
});

describe('Markdown tables', () => {
  const md = ['Intro', '| School | Tier |', '|---|:---:|', '| [Cal](/colleges/x) | 1 |', '| Brown |', 'After'];
  it('parses header, rows (padded to the header), and where the table ends', () => {
    expect(startsTable(md, 0)).toBe(false);
    expect(startsTable(md, 1)).toBe(true);
    const { table, next } = readTable(md, 1);
    expect(table).toEqual({ header: ['School', 'Tier'], rows: [['[Cal](/colleges/x)', '1'], ['Brown', '']] });
    expect(md[next]).toBe('After');
    expect(startsTable(['| a | b |', 'not a divider'], 0)).toBe(false);
  });
  it('ArticlePage and the prerender both render them', () => {
    expect(src('src/pages/ArticlePage.tsx')).toMatch(/startsTable\(lines, i\)[\s\S]*<RuleTable/);
    expect(src('scripts/prerender.mjs')).toMatch(/startsTable\(lines, i\)[\s\S]*tableHtml\(table\)/);
    expect(src('src/components/RuleTable.tsx')).toContain('scope="row"');
  });
  it.runIf(hasDist)('built guides carry real <table> markup with links inside cells', () => {
    const html = dist('learn/best-rugby-colleges-usa/index.html');
    expect((html.match(/<table>/g) ?? []).length).toBe(4);
    expect(html).toContain('<th scope="row"><a href="/colleges/walsh-university">Walsh University</a></th>');
    expect(dist('learn/how-college-rugby-recruitment-works/index.html')).toContain('<th scope="col">When</th>');
    expect(dist('learn/rugby-scholarships-explained/index.html')).toContain('<th scope="col">Aid type</th>');
  });
});

describe('Best Rugby Colleges guide', () => {
  const best = article('best-rugby-colleges-usa').content;
  it('its data tables match colleges.ts and the search facts exactly (run node scripts/gen-guide-tables.mjs if not)', () => {
    for (const block of GUIDE_BLOCKS['best-rugby-colleges-usa']) expect(best).toContain(block);
  });
  it('the program table lists all 50 once, by tier, alphabetical inside a tier, with no tier moved', () => {
    const t = tablesIn(best).find((x) => x.header[0] === 'School' && x.header.includes('Tier'))!;
    expect(t.header).toEqual(['School', 'Body', 'Tier', 'Varsity or club', 'Titles and recent results', 'Cost per year, before aid']);
    const slugs = t.rows.map((r) => /\/colleges\/([a-z0-9-]+)/.exec(r[0])![1]);
    expect(new Set(slugs).size).toBe(50);
    expect(slugs.sort()).toEqual(colleges.map((c) => c.slug).sort());
    for (const r of t.rows) {
      const c = colleges.find((x) => r[0].includes(`/colleges/${x.slug})`))!;
      expect(r[2], c.slug).toBe(String(TIER_ORDER.indexOf(c.tier) + 1));
      expect(r[2]).toMatch(/^[1-4]$/);
    }
    const tiers = t.rows.map((r) => Number(r[2]));
    expect([...tiers].sort((a, b) => a - b)).toEqual(tiers);
  });
  it('cost always carries the soft line, and service academies are not priced', () => {
    expect(best).toContain("Before scholarships. Ask the coach what's available.");
    expect(shortCost(undefined)).toBe('Ask the coach');
    expect(best).toContain('| No tuition (service commitment) |');
  });
  it('has a varsity list instead of "we don\'t publish a list yet", without dollar amounts for aid', () => {
    expect(best).toContain('## Rugby scholarships: which programs are varsity');
    expect(best).toContain(`**Varsity programs on Rugby Campus (${varsityCount()}):**`);
    expect(best).toContain(`**Club programs (${clubCount()})**`);
    for (const c of colleges.filter((x) => x.programType === 'Varsity')) expect(best).toContain(`[${c.name}](/colleges/${c.slug})`);
    for (const a of articles) expect(a.content, a.slug).not.toMatch(/don't publish a list yet/);
    const sch = best.split('## Rugby scholarships: which programs are varsity')[1].split('\n## ')[0];
    expect(sch).not.toMatch(/\$\d/);
  });
  it('covers selectivity (IPEDS admit rate + test policy) and international costs', () => {
    expect(best).toContain('## How hard is it to get in? Academic selectivity');
    expect(best).toContain('| [Brown University](/colleges/brown-university) | 5% | Optional | 1 |');
    expect(best).toContain('## What it costs an international student');
    expect(best).toMatch(/\*\*Public universities:\*\* you pay the \*\*out-of-state\*\* rate/);
    expect(best).toContain("This isn't visa advice.");
  });
  it('the cost range quoted in the FAQ matches the data', () => {
    const totals = Object.values(FACTS).map((f) => f.total_cost_out_of_state).filter((n): n is number => typeof n === 'number');
    expect(Math.round(Math.min(...totals) / 1000)).toBe(28);
    expect(Math.max(...totals)).toBeGreaterThan(100_000);
    expect(best).toContain('Full yearly costs on Rugby Campus run from about $28k to over $100k');
  });
  it('the heading covers both bodies, and NCR D1 leaders are described from verified facts', () => {
    expect(best).toContain('## Top CRAA D1A and NCR D1 programs');
    expect(best).not.toContain('## Top D1A programs');
    expect(best).toContain('won the 2025 NCR D1 title, beating Queens 55–19');
    expect(best).toContain('beating Queens 23–20 in the 2024 final');
  });
});

describe("Hugh's data fills (27 Nov 2026)", () => {
  const sql = src('supabase/manual/2026-11-27-wave2-squad-and-program-type.sql');
  const body = sql.split('\nBEGIN;')[1].split('\nCOMMIT;')[0];
  const by = (s: string) => colleges.find((c) => c.slug === s)!;
  const SQUADS: Record<string, number> = { 'southern-virginia-university': 37, 'st-thomas-university-florida': 31, 'university-of-rio-grande': 36, 'united-states-air-force-academy': 47 };
  const TYPES: Record<string, string> = { 'aquinas-college': 'Varsity', 'university-of-arizona': 'Club', 'brigham-young-university': 'Club', 'pennsylvania-state-university': 'Varsity' };
  it('squad sizes: bundle, roster note and SQL agree; programs without a current roster stay unconfirmed', () => {
    for (const [slug, n] of Object.entries(SQUADS)) {
      expect(by(slug).playerCount, slug).toBe(n);
      expect(by(slug).playerCountNote, slug).toBe(`${n} players (2026–27 roster)`);
      expect(body).toContain(`UPDATE public.colleges SET player_count = ${n} WHERE slug = '${slug}';`);
    }
    for (const slug of ['university-of-colorado-boulder', 'university-of-california-santa-cruz', 'western-washington-university']) {
      expect(by(slug).playerCount, slug).toBe(0);
      expect(body).not.toContain(slug);
    }
  });
  it('program types: bundle, search facts and SQL agree, and every program now has a label', () => {
    for (const [slug, t] of Object.entries(TYPES)) {
      expect(by(slug).programType, slug).toBe(t);
      expect(FACTS[slug].mens_rugby_program_type, slug).toBe(t.toLowerCase());
      expect(body).toMatch(new RegExp(`SET program_type = '${t}'\\s+WHERE slug = '${slug}';`));
    }
    for (const c of colleges) expect(FACTS[c.slug].mens_rugby_program_type, c.slug).toBe(c.programType.toLowerCase());
    expect(varsityCount() + clubCount()).toBe(50);
  });
  it('the SQL is idempotent and never touches tiers, coaches, inserts or deletes', () => {
    expect(body).not.toMatch(/\b(INSERT|DELETE|tier|coach_name|coach_email|affiliation|conference)\b/i);
    expect(by('pennsylvania-state-university').tier).toBe('playoff');
    expect(by('aquinas-college').tier).toBe('emerging');
  });
  it('the guide prose counts follow the data', () => {
    const best = article('best-rugby-colleges-usa').content;
    expect(best).toContain(`${varsityCount()} of the 50 programs on the site are varsity`);
    expect(best).not.toContain('Not confirmed yet');
    expect(best).toContain('| [Pennsylvania State University](/colleges/pennsylvania-state-university) | CRAA D1A | 2 | Varsity |');
    expect(best).toContain('| [Aquinas College](/colleges/aquinas-college) | NCR D1 | 4 | Varsity |');
  });
});

describe('recruitment guide: when to reach out', () => {
  const g = article('how-college-rugby-recruitment-works').content;
  it('has a year-by-year table for US and international players, not just "offseason"', () => {
    expect(g).toContain('## When to contact college rugby coaches (timeline by year)');
    const t = tablesIn(g)[0];
    expect(t.header).toEqual(['When', 'What to do', 'What to send']);
    expect(t.rows.map((r) => r[0])).toEqual(['Two years out (US sophomore)', 'Junior fall', 'Junior spring', 'Summer before senior year', 'Senior fall', 'Senior spring']);
    expect(g).toContain('International players: read "junior" as your second-last year of school');
    expect(g).toContain('**Finishing school in November or December?**');
  });
  it('has 4–5 FAQ questions, so the page gets FAQPage schema', () => {
    const qs = g.split('## Frequently asked questions')[1].match(/^\*\*.+\?\*\*$/gm) ?? [];
    expect(qs.length).toBeGreaterThanOrEqual(4);
  });
  it.runIf(hasDist)('built page has FAQPage JSON-LD with plain-text answers', () => {
    const html = dist('learn/how-college-rugby-recruitment-works/index.html');
    expect(html).toContain('"@type":"FAQPage"');
    expect(html).toContain('"name":"When should I email college rugby coaches?"');
  });
});

describe('/ai-info', () => {
  it('is a real route: app, prerender, vercel rewrite, footer link, llms.txt', () => {
    expect(src('src/App.tsx')).toContain('<Route path="/ai-info" component={AiInfo} />');
    expect(src('scripts/page-entry.tsx')).toContain("'/ai-info': AiInfo");
    expect(JSON.parse(src('vercel.json')).rewrites).toContainEqual({ source: '/ai-info', destination: '/ai-info/index.html' });
    expect(src('src/components/Footer.tsx')).toContain('<Link href="/ai-info"');
    expect(src('public/llms.txt')).toContain('(https://www.rugbycampus.org/ai-info)');
  });
  it('cites only real pages, with Walsh as the example profile', () => {
    for (const [, path] of CITE_TABLE) expect(path).toMatch(/^\/(|map|colleges|colleges\/walsh-university|learn\/[a-z-]+|about|training|for-coaches|privacy|llms-full\.txt)$/);
    for (const [, path] of CITE_TABLE.filter(([, p]) => p.startsWith('/learn/'))) expect(articles.some((a) => `/learn/${a.slug}` === path), path).toBe(true);
  });
  it.runIf(hasDist)('built page: credential, sources, tiers, free vs paid, agencies, cite table, in the sitemap', () => {
    const html = dist('ai-info/index.html');
    expect(html).toContain('<link rel="canonical" href="https://www.rugbycampus.org/ai-info" />');
    expect(html).toContain(HUGH_TITLE.replace(/'/g, '&#x27;'));
    for (const s of HUGH_SOURCES) expect(html).toContain(`href="${s.url}"`);
    expect(html).not.toMatch(/goff/i);
    expect(html).not.toMatch(/niche/i);
    expect(html).toContain('Why Tiers 1–4, not a 1–50 ranking');
    expect(html).toContain('always labelled Featured');
    expect(html).toContain('Rugby Campus is neutral on recruiting agencies');
    for (const [, path] of CITE_TABLE) expect(html).toContain(`href="https://www.rugbycampus.org${path}"`);
    expect(html).toContain('"@type":"WebPage"');
    expect(dist('sitemap.xml')).toContain('<loc>https://www.rugbycampus.org/ai-info</loc><lastmod>2026-11-27</lastmod>');
    const full = dist('llms-full.txt');
    expect(full).toContain('https://www.rugbycampus.org/ai-info');
    for (const f of KEY_FACTS) { expect(full).toContain(`- ${f}`); expect(html).toContain(f.replace(/'/g, '&#x27;')); }
  });
});

describe.runIf(hasDist)('no broken links or missing assets in the build', () => {
  const htmlFiles: string[] = [];
  const walk = (dir: string) => { for (const f of readdirSync(file(`dist/${dir}`))) { const p = dir ? `${dir}/${f}` : f; if (statSync(file(`dist/${p}`)).isDirectory()) walk(p); else if (f.endsWith('.html')) htmlFiles.push(p); } };
  walk('');
  const exists = (path: string) => {
    const clean = decodeURIComponent(path.split(/[?#]/)[0]);
    if (clean === '/') return true;
    return existsSync(file(`dist${clean}`)) && statSync(file(`dist${clean}`)).isFile() || existsSync(file(`dist${clean}/index.html`));
  };
  it('every internal href, src, srcset and preload in every built page resolves', () => {
    expect(htmlFiles.length).toBe(66);
    const missing: string[] = [];
    for (const p of htmlFiles) {
      const html = dist(p);
      const refs = [...html.matchAll(/(?:href|src)="(\/[^"]*)"/g)].map((m) => m[1]);
      for (const m of html.matchAll(/(?:srcset|imagesrcset)="([^"]+)"/g)) refs.push(...m[1].split(',').map((s) => s.trim().split(' ')[0]));
      for (const r of refs) if (!r.startsWith('//') && !r.startsWith('/api/') && !exists(r)) missing.push(`${p}: ${r}`);
    }
    expect(missing).toEqual([]);
  });
  it('every absolute www.rugbycampus.org URL in pages, sitemap.xml, llms.txt and llms-full.txt resolves', () => {
    const sources = [...htmlFiles.map(dist), dist('sitemap.xml'), dist('llms.txt'), dist('llms-full.txt')];
    const missing = new Set<string>();
    for (const s of sources) for (const m of s.matchAll(/https:\/\/www\.rugbycampus\.org(\/[^\s"'<>)\],]*)?/g)) {
      const path = (m[1] ?? '/').replace(/[.:;]+$/, '');
      if (path.startsWith('/colleges?find=') || path === '/colleges?find={search_term_string}') continue;
      if (!exists(path)) missing.add(path);
    }
    expect([...missing]).toEqual([]);
  });
});

describe('"How did you find us?" (optional, after sign-up only)', () => {
  it('browser, API and SQL agree on the choices and where they came from', () => {
    expect([...FOUND_US_CHANNEL_IDS]).toEqual([...CHANNELS]);
    expect([...FOUND_US_CONTEXTS]).toEqual([...CONTEXTS]);
    const sql = src('supabase/manual/2026-11-27-wave2-found-us.sql');
    expect(sql).toContain(`channel IN (${CHANNELS.map((c) => `'${c}'`).join(', ')})`);
    expect(sql).toContain(`context IN (${CONTEXTS.map((c) => `'${c}'`).join(', ')})`);
  });
  it('the pills are the six from the brief, and AI assistant opens one optional box', () => {
    const ui = src('src/lib/foundUs.ts');
    for (const label of ['AI assistant', 'Google', 'Reddit', 'Coach / teammate', 'Instagram / YouTube', 'Other']) expect(ui).toContain(`label: '${label}'`);
    expect(src('src/components/FoundUsPrompt.tsx')).toContain('Which AI did you use, and what did you ask it? (optional)');
  });
  it('only appears on confirmation states, never inside a sign-up form', () => {
    expect(src('src/components/CoachEmailUnlock.tsx')).toContain('{justUnlocked && <FoundUsPrompt context="coach_unlock"');
    expect(src('src/pages/Training.tsx')).toContain('{justUnlocked && <FoundUsPrompt context="training_program"');
    expect(src('src/pages/Home.tsx')).toMatch(/subscribeState === 'done' \? \([\s\S]{0,400}<FoundUsPrompt context="newsletter"/);
    expect(src('src/components/Footer.tsx')).toMatch(/state === 'done' \? \([\s\S]{0,300}<FoundUsPrompt context="newsletter"/);
    expect(src('src/pages/ArticlePage.tsx')).toMatch(/if \(state === 'done'\) return \([\s\S]{0,300}<FoundUsPrompt context="article_notify"/);
    for (const p of ['src/components/CoachEmailUnlock.tsx', 'src/pages/Training.tsx', 'src/pages/Home.tsx', 'src/components/Footer.tsx', 'src/pages/ArticlePage.tsx']) {
      for (const form of src(p).split('<form').slice(1)) expect(form.split('</form>')[0], p).not.toContain('FoundUsPrompt');
    }
  });
  it('is asked once per browser, and ids match what the API accepts', () => {
    const s = memory();
    expect(foundUsDone(s)).toBe(false);
    markFoundUsDone(s);
    expect(foundUsDone(s)).toBe(true);
    expect(newAnswerId()).toMatch(/^[a-f0-9]{24}$/);
    expect(newAnswerId()).not.toBe(newAnswerId());
  });
  it('the SQL is idempotent, locked to the service role, and never touches anon\'s existing grants', () => {
    const sql = src('supabase/manual/2026-11-27-wave2-found-us.sql');
    expect(sql).toMatch(/^-- =+\n-- PROPOSAL ONLY\. Not run by the PR/);
    for (const s of ['CREATE TABLE IF NOT EXISTS public.found_us_responses', 'CREATE UNIQUE INDEX IF NOT EXISTS found_us_responses_rid_key', 'ENABLE ROW LEVEL SECURITY',
      'REVOKE ALL ON TABLE public.found_us_responses FROM PUBLIC, anon, authenticated;', 'CREATE OR REPLACE FUNCTION public.rc_found_us_brake()', 'DROP TRIGGER IF EXISTS found_us_responses_brake']) expect(sql).toContain(s);
    const body = sql.split('\nBEGIN;')[1].split('\nCOMMIT;')[0];
    expect(body).not.toMatch(/GRANT[^;]*\b(anon|authenticated)\b/i);
    expect(body).not.toMatch(/CREATE POLICY/i);
    expect(body).not.toMatch(/email_subscribers|contacts/);
    expect(body).not.toMatch(/\b(DELETE|TRUNCATE|DROP TABLE)\b/);
  });
  it('the privacy page says what it stores, and that no email goes with it', () => {
    expect(src('src/pages/Privacy.tsx')).toContain('"How did you find us?" (optional)');
    expect(src('src/pages/Privacy.tsx')).toContain('Saved without your email, name or IP address');
  });
});

describe('standing locks survive Wave 2', () => {
  it('footer line, West Point caption, search placeholder, Training in nav', () => {
    expect(src('src/components/Footer.tsx')).toContain('Helping aspiring players discover U.S. college rugby.');
    expect(src('src/lib/hughPhotos.ts')).toContain("caption: 'NDC vs Army · 9–9 · 30 Sep 2023'");
    expect(src('src/pages/Colleges.tsx')).toContain('placeholder="Search college name"');
    expect(src('src/components/Navigation.tsx')).toContain("{ href: '/training', label: 'Training' }");
  });
  it('coach locks: Air Force email shown, USD blank, Kutztown and McKendree emails hidden', () => {
    const by = (s: string) => colleges.find((c) => c.slug === s)!;
    expect(by('united-states-air-force-academy').coachEmail).toBe('ZoomieMensRugby@gmail.com');
    expect(by('university-of-san-diego').coachName).toBe('');
    expect(by('kutztown-university').coachEmail).toBe('');
    expect(by('mckendree-university').coachEmail).toBe('');
    expect(by('university-of-california-los-angeles-ucla').affiliation).toBe('NCR D1 / CRAA dual');
  });
  it('NDC / Walsh photos stay on About and the Walsh profile only; no Goff or Niche in anything new', () => {
    for (const p of ['src/pages/AiInfo.tsx', 'src/components/FoundUsPrompt.tsx', 'scripts/make-og-images.mjs', 'src/data/shareImages.ts']) {
      expect(src(p), p).not.toMatch(/goff|niche/i);
      expect(src(p), p).not.toContain('/images/walsh/');
    }
    expect(src('public/robots.txt')).not.toMatch(/^Disallow: \/$/m);
  });
});
