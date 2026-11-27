// Wave 3 polish (27 Nov 2026): /work-with-me is a permanent redirect only, guide breadcrumbs,
// guide takeaways in llms.txt / llms-full.txt, press feedback and prefers-reduced-motion.
// Checks on built pages run when dist/ exists (after npm run build).
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import vercel from '../../../vercel.json';
import { articles } from '@/data/articles';
import { GUIDE_TAKEAWAYS } from '@/data/siteFacts';
import { TIER_LABELS, TIER_ORDER } from '@/data/colleges';
import { HUGH_TITLE, SITE_URL } from '@/config';

const root = new URL('../../../', import.meta.url);
const file = (p: string) => new URL(p, root);
const src = (p: string) => readFileSync(file(p), 'utf8');
const hasDist = existsSync(file('dist/index.html'));
const dist = (p: string) => readFileSync(file(`dist/${p}`), 'utf8');
type Node = { '@type': string; [k: string]: unknown };
const graph = (html: string): Node[] => JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/)![1])['@graph'];
const isFull = (a: { content: string }) => !a.content.startsWith('Coming soon');

describe('/work-with-me is a permanent redirect to /about, never a page', () => {
  const v = vercel as unknown as { redirects: { source: string; destination: string; permanent?: boolean }[]; rewrites: { source: string }[] };
  it('both /work-with-me and /work-with-me/ redirect permanently to /about', () => {
    for (const source of ['/work-with-me', '/work-with-me/']) {
      const r = v.redirects.find((x) => x.source === source);
      expect(r, source).toBeDefined();
      expect(r!.destination).toBe('/about');
      expect(r!.permanent).toBe(true);
    }
  });
  it('no rewrite serves a /work-with-me page', () => {
    expect(v.rewrites.some((r) => r.source.includes('work-with-me'))).toBe(false);
  });
  it('the client route only redirects (replacing history), and the old page component is gone', () => {
    expect(src('src/App.tsx')).toContain('<Route path="/work-with-me">{() => <Redirect to="/about" replace />}</Route>');
    expect(existsSync(file('src/pages/WorkWithMe.tsx'))).toBe(false);
    expect(src('src/App.tsx')).not.toMatch(/import\(['"]@\/pages\/WorkWithMe['"]\)/);
  });
  it.runIf(hasDist)('the build writes no /work-with-me page and the sitemap omits it', () => {
    expect(existsSync(file('dist/work-with-me/index.html'))).toBe(false);
    expect(dist('sitemap.xml')).not.toContain('work-with-me');
  });
});

describe('guide pages carry a BreadcrumbList: Home, Learn, guide title', () => {
  it('the prerender adds the breadcrumb next to the Article schema', () => {
    const p = src('scripts/prerender.mjs');
    expect(p).toMatch(/name: 'Home', item: `\$\{SITE_URL\}\/`/);
    expect(p).toMatch(/name: 'Learn', item: `\$\{SITE_URL\}\/learn`/);
    expect(p).toMatch(/name: a\.title, item: `\$\{SITE_URL\}\/learn\/\$\{a\.slug\}`/);
  });
  it.runIf(hasDist)('every built /learn/<slug> page has a valid three-item BreadcrumbList, and keeps Article', () => {
    for (const a of articles) {
      const g = graph(dist(`learn/${a.slug}/index.html`));
      const crumbs = g.filter((n) => n['@type'] === 'BreadcrumbList');
      expect(crumbs, a.slug).toHaveLength(1);
      expect(crumbs[0].itemListElement).toEqual([
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Learn', item: `${SITE_URL}/learn` },
        { '@type': 'ListItem', position: 3, name: a.title, item: `${SITE_URL}/learn/${a.slug}` },
      ]);
      const art = g.find((n) => n['@type'] === 'Article');
      expect(art?.headline, a.slug).toBe(a.title);
      expect(art?.mainEntityOfPage).toBe(`${SITE_URL}/learn/${a.slug}`);
    }
  });
  it.runIf(hasDist)('the FAQPage schema survives on the guides that have one', () => {
    const g = graph(dist('learn/best-rugby-colleges-usa/index.html'));
    const faq = g.find((n) => n['@type'] === 'FAQPage') as { mainEntity: unknown[] } | undefined;
    expect(faq?.mainEntity.length).toBeGreaterThan(0);
  });
  it.runIf(hasDist)('non-guide pages do not get a guide breadcrumb', () => {
    for (const p of ['index.html', 'learn/index.html', 'about/index.html']) {
      expect(graph(dist(p)).some((n) => n['@type'] === 'BreadcrumbList'), p).toBe(false);
    }
  });
});

describe('llms.txt and llms-full.txt carry the guide takeaways', () => {
  const llms = src('public/llms.txt');
  it('covers tiers, CRAA D1A vs NCR D1, recruitment timeline and scholarships, each linked to a real guide', () => {
    const topics = GUIDE_TAKEAWAYS.map((t) => t.topic);
    for (const t of ['Tiers', 'CRAA D1A vs NCR D1', 'Recruitment timeline', 'Scholarships']) expect(topics).toContain(t);
    const slugs = new Set(articles.filter(isFull).map((a) => `/learn/${a.slug}`));
    for (const t of GUIDE_TAKEAWAYS) expect(slugs.has(t.path), t.path).toBe(true);
  });
  it('the tier takeaway uses plain Tier 1 to Tier 4, strongest first', () => {
    const tiers = GUIDE_TAKEAWAYS.find((t) => t.topic === 'Tiers')!.text;
    expect(tiers).toContain('Tier 1 (strongest) to Tier 4');
    let at = -1;
    for (const t of TIER_ORDER) { const i = tiers.indexOf(`${TIER_LABELS[t]}:`); expect(i).toBeGreaterThan(at); at = i; }
  });
  it('public/llms.txt states every takeaway word for word with its guide link, plus /ai-info and Hugh\'s credential', () => {
    for (const t of GUIDE_TAKEAWAYS) {
      expect(llms).toContain(`- **${t.topic}.** ${t.text} [Guide](${SITE_URL}${t.path})`);
    }
    expect(llms).toContain(`(${SITE_URL}/ai-info)`);
    expect(llms).toContain(HUGH_TITLE);
  });
  it('the takeaways respect the standing locks', () => {
    const all = [llms, ...GUIDE_TAKEAWAYS.map((t) => t.text)].join('\n');
    expect(all).not.toMatch(/goff|niche/i);
    expect(all).not.toMatch(/full scholarship|full ride|guarantee/i);
    expect(all).not.toMatch(/agenc(y|ies) (are|is) (a )?(scam|waste|rip)/i);
    expect(all).not.toMatch(/#\s?1\b|ranked (first|number one)/i);
    expect(all).not.toMatch(/!/);
  });
  it.runIf(hasDist)('built llms.txt and llms-full.txt include the takeaways', () => {
    expect(dist('llms.txt')).toBe(llms);
    const full = dist('llms-full.txt');
    expect(full).toContain('## Key takeaways from the guides');
    for (const t of GUIDE_TAKEAWAYS) expect(full).toContain(`- ${t.topic}: ${t.text} ${SITE_URL}${t.path}`);
    expect(full).toContain(`${SITE_URL}/ai-info`);
    expect(full).toContain(HUGH_TITLE);
  });
});

describe('press feedback and prefers-reduced-motion', () => {
  const css = src('src/index.css');
  it('buttons, pills and cards press in with a small scale, transform only', () => {
    expect(css).toMatch(/\.btn:active \{ transform: translateY\(0\) scale\(0\.98\)/);
    expect(css).toMatch(/\.press:active \{ transform: scale\(0\.98\)/);
    expect(css).toMatch(/\.press-card:active \{ transform: scale\(0\.99\)/);
    expect(src('src/components/search/FilterPanel.tsx')).toContain('className={`press ');
    for (const p of ['src/pages/Colleges.tsx', 'src/pages/MapPage.tsx']) expect(src(p), p).toContain('className={`press ');
    for (const p of ['src/components/CollegeCard.tsx', 'src/components/ArticleCard.tsx']) expect(src(p), p).toContain('group press-card');
  });
  it('a global reduced-motion rule turns off transitions, animations, smooth scroll and hover/press transforms', () => {
    const block = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'));
    expect(block.length).toBeGreaterThan(0);
    expect(block).toMatch(/\*, \*::before, \*::after \{/);
    expect(block).toContain('transition-duration: 0.01ms !important');
    expect(block).toContain('animation-duration: 0.01ms !important');
    expect(block).toContain('scroll-behavior: auto');
    expect(block).toMatch(/\.btn:hover, \.btn:active, \.press:active, \.press-card:active, \.group:hover \.card-img \{ transform: none; \}/);
  });
});
