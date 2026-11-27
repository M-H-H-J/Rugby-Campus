// UI polish (27 Nov 2026): heading rhythm, tabular figures, map pin feedback, transition timing and keyboard focus.
// Checks on the built stylesheet run when dist/ exists (after npm run build).
import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'node:fs';

const root = new URL('../../../', import.meta.url);
const file = (p: string) => new URL(p, root);
const src = (p: string) => readFileSync(file(p), 'utf8');
const css = src('src/index.css');
const reducedMotion = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'));
const builtCss = existsSync(file('dist/assets'))
  ? readdirSync(file('dist/assets')).filter((f) => f.endsWith('.css')).map((f) => src(`dist/assets/${f}`)).join('\n')
  : '';

describe('headings are tight and editorial', () => {
  it('h1, h2 and h3 set their own line-height instead of inheriting the body 1.55', () => {
    expect(css).toMatch(/h1 \{ line-height: 1\.1; letter-spacing: -0\.02em; \}/);
    expect(css).toMatch(/h2 \{ line-height: 1\.15; letter-spacing: -0\.015em; \}/);
    expect(css).toMatch(/h3 \{ line-height: 1\.25; \}/);
  });
  it('large display headings no longer use leading-tight (1.25)', () => {
    expect(src('src/pages/Training.tsx')).toContain('text-[34px] md:text-[40px] leading-[1.1]');
    expect(src('src/pages/Training.tsx')).toContain('text-[28px] md:text-[32px] text-white leading-[1.15]');
    expect(src('src/pages/ForCoaches.tsx')).toContain('text-[28px] text-white leading-[1.15]');
    expect(src('src/pages/Home.tsx')).toContain('text-[32px] leading-[1.15]');
    expect(src('src/pages/ArticlePage.tsx')).toContain('text-[27px] text-ink mt-12 mb-4 leading-[1.2]');
  });
  it('headings keep the brand fonts', () => {
    expect(css).toContain("font-family: 'Newsreader', Georgia, serif;");
    expect(css).toContain("font-family: 'Libre Franklin'");
  });
});

describe('numbers use tabular figures', () => {
  it('stat rows, counts and tables carry tabular-nums', () => {
    const cases: [string, string][] = [
      ['src/components/RuleTable.tsx', '<table className="w-full min-w-[540px] border-collapse text-left font-body text-[14px] leading-snug tabular-nums">'],
      ['src/pages/CollegeDetail.tsx', '<table className="w-full text-[12px] border-t border-line tabular-nums">'],
      ['src/pages/CollegeDetail.tsx', '<dl className="border-t border-ink tabular-nums">'],
      ['src/components/ProfileFacts.tsx', '<dl className="border-t border-ink tabular-nums">'],
      ['src/components/search/CollegeFactsSection.tsx', '<dl className="tabular-nums">'],
      ['src/components/search/SearchResultCard.tsx', 'leading-snug tabular-nums'],
      ['src/pages/Colleges.tsx', '<span className="text-faint tabular-nums">{plural(count'],
      ['src/pages/Home.tsx', 'text-muted tabular-nums">{colleges.length}'],
      ['src/pages/Home.tsx', '<span className="tabular-nums">All {colleges.length} programs</span>'],
      ['src/pages/MapPage.tsx', 'whitespace-nowrap tabular-nums"><span className="font-semibold text-ink">{filtered.length}'],
    ];
    for (const [path, needle] of cases) expect(src(path), path).toContain(needle);
  });
  it('plain tables (the prerendered guide tables) get tabular figures from the base stylesheet', () => {
    expect(css).toMatch(/table \{ font-variant-numeric: tabular-nums; \}/);
  });
  it.runIf(builtCss)('the built stylesheet ships the tabular-nums utility', () => {
    expect(builtCss).toMatch(/\.tabular-nums\{[^}]*tabular-nums/);
  });
});

describe('map pins press and lift without moving off their anchor', () => {
  const markup = src('src/lib/mapMarkup.ts');
  it('the pin svg sits inside an inner span; the map engine positions the outer .rc-pin from its tip', () => {
    expect(markup).toMatch(/html: `<span class="rc-pin-inner"><svg [^`]*<\/svg><\/span>`/);
    const vector = src('src/lib/vectorMap.ts');
    expect(vector).toContain("el.className = 'rc-pin'");
    expect(vector).toContain("new Marker({ element: el, anchor: 'bottom' })");
    expect(vector).toMatch(/\.addTo\(map\)\.setPopup\(popup\)/);
    const raster = src('src/lib/rasterMap.ts');
    expect(raster).toContain("className: 'rc-pin'");
    expect(raster).toContain('iconAnchor: [width / 2, height]');
  });
  it('scale is applied to the inner span only, from the pin tip, with short ease-out timing', () => {
    expect(css).toMatch(/\.rc-pin-inner \{[^}]*transform-origin: 50% 100%;[^}]*transition: transform 120ms var\(--rc-ease-out\);/);
    expect(css).toMatch(/\.rc-pin:hover \.rc-pin-inner, \.rc-pin:focus-visible \.rc-pin-inner \{ transform: scale\(1\.12\); \}/);
    expect(css).toMatch(/\.rc-pin:active \.rc-pin-inner \{ transform: scale\(0\.94\); transition-duration: 80ms; \}/);
    expect(css).not.toMatch(/\.rc-pin(:hover|:active|:focus-visible)? \{[^}]*transform/);
  });
  it('reduced motion turns the pin scale and its transition off', () => {
    expect(reducedMotion).toContain('.rc-pin-inner, .rc-pin:hover .rc-pin-inner, .rc-pin:focus-visible .rc-pin-inner, .rc-pin:active .rc-pin-inner { transform: none; transition: none; }');
  });
  it('a keyboard-focused pin gets the navy ring', () => {
    expect(css).toMatch(/\.rc-pin:focus-visible \{ outline: 2px solid var\(--rc-navy\);/);
  });
});

describe('transitions are short and ease out', () => {
  it('shared timing tokens: 140ms ease-out', () => {
    expect(css).toContain('--rc-ease-out: cubic-bezier(0.2, 0, 0, 1);');
    expect(css).toContain('--rc-fast: 140ms;');
  });
  it('buttons, pills, cards and card images use 120-160ms, never the old 450ms zoom or plain ease', () => {
    expect(css).toMatch(/\.btn \{\s*transition: background-color var\(--rc-fast\) var\(--rc-ease-out\)/);
    expect(css).toMatch(/\.press, \.press-card \{ transition: color var\(--rc-fast\) var\(--rc-ease-out\)/);
    expect(css).toMatch(/\.card-img \{ transition: transform 160ms var\(--rc-ease-out\); \}/);
    expect(css).not.toMatch(/450ms|0\.3s|\b150ms ease\b/);
    for (const ms of css.matchAll(/(?<![\d.])(\d+)ms/g)) {
      const n = Number(ms[1]);
      expect(n === 80 || (n >= 120 && n <= 160), `${n}ms`).toBe(true);
    }
  });
  it('Tailwind transition utilities default to 140ms ease-out', () => {
    const tw = src('tailwind.config.js');
    expect(tw).toMatch(/transitionDuration: \{\s*DEFAULT: '140ms',\s*\}/);
    expect(tw).toMatch(/transitionTimingFunction: \{\s*DEFAULT: 'cubic-bezier\(0\.2, 0, 0, 1\)',\s*\}/);
  });
  it('no bouncy or spring easing anywhere in the styles', () => {
    for (const m of css.matchAll(/cubic-bezier\(([^)]*)\)/g)) {
      for (const v of m[1].split(',').map(Number)) expect(v >= 0 && v <= 1, m[0]).toBe(true);
    }
  });
});

describe('keyboard focus is one consistent ring', () => {
  it('links, buttons and focusable widgets get a 2px navy focus-visible outline at low specificity', () => {
    expect(css).toMatch(/:where\(a, button, summary, \[role="button"\], \[tabindex\]:not\(\[tabindex="-1"\]\)\):focus-visible \{\s*outline: 2px solid var\(--rc-navy\);\s*outline-offset: 2px;\s*\}/);
  });
  it('inputs get a soft ring on top of their navy border, beating outline-none', () => {
    expect(css).toMatch(/input:focus-visible, select:focus-visible, textarea:focus-visible \{\s*outline: 2px solid rgba\(0, 69, 140, 0\.3\);/);
    expect(css).toMatch(/input\[type="checkbox"\]:focus-visible, input\[type="radio"\]:focus-visible \{ outline: 2px solid var\(--rc-navy\);/);
  });
  it('card links get a rounded ring clear of the photo; dark sections switch to white', () => {
    expect(css).toMatch(/a:has\(> \.press-card\):focus-visible, a\.group:focus-visible \{ outline-offset: 4px; border-radius: 10px; \}/);
    expect(css).toMatch(/\.bg-dark :focus-visible \{ outline-color: #fff; \}/);
  });
  it('focus rings use the brand navy token, never a hex outside the palette', () => {
    const focusRules = css.match(/[^{}]*:focus-visible[^{}]*\{[^}]*\}/g) ?? [];
    expect(focusRules.length).toBeGreaterThanOrEqual(5);
    for (const r of focusRules) expect(r).not.toMatch(/#(?!fff\b)[0-9a-f]{3,6}/i);
  });
});
