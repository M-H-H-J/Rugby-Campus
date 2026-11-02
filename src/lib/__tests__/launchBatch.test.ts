import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { colleges, TIER_COLORS, TIER_GUIDE_NOTE, TIER_LABELS, TIER_SUBLINE } from '@/data/colleges';
import { articles } from '@/data/articles';
import { MONEY_LINE } from '@/config';
import { mlrSummary, SAFETY_TEXT, visibleBadges } from '@/lib/search/display';
import { pickTopPrograms } from '@/lib/topPrograms';
import { COACH_EMAIL_TIPS, coachEmailBody, coachEmailSubject } from '@/data/coachEmailTemplate';
import FeaturedBadge from '@/components/FeaturedBadge';

const src = (p: string) => readFileSync(new URL(`../../../${p}`, import.meta.url), 'utf8');
/** File text without comments, so a dash in a code comment does not count. */
const copyOf = (p: string) => src(p).replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/^\s*\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');

describe('launch fixes, 3 Nov 2026', () => {
  it('Colleges: pop-up is gone, replaced by a one-line note; no "More programs worth a look"', () => {
    expect(TIER_GUIDE_NOTE).toBe('Tiers are a guide, based on recent seasons. Every program has strong years and quieter ones.');
    const page = src('src/pages/Colleges.tsx');
    expect(page).toContain('TIER_GUIDE_NOTE');
    expect(page).not.toMatch(/TierNotice|I understand|More programs worth a look/);
    expect(existsSync(new URL('../../components/TierNoticeModal.tsx', import.meta.url))).toBe(false);
  });

  it('tier 4 wording and a clear pin colour', () => {
    expect(TIER_LABELS.emerging).toBe('Rounding out the best');
    expect(TIER_SUBLINE.emerging).toBe('Earlier game time, and a say in where the program goes.');
    const colours = Object.values(TIER_COLORS);
    expect(new Set(colours).size).toBe(4);
    expect(TIER_COLORS.emerging.toLowerCase()).not.toBe('#8b98a8'); // the old grey
  });

  it('Home top programs come from tier 1: Cal, Brown, Navy, Army, and refill if one leaves', () => {
    const names = pickTopPrograms(colleges).map((c) => c.slug);
    expect(names).toEqual(['university-of-california-berkeley', 'brown-university', 'united-states-naval-academy', 'united-states-military-academy-army']);
    expect(names).not.toContain('queens-university-of-charlotte');
    const without = colleges.map((c) => (c.slug === 'brown-university' ? { ...c, tier: 'playoff' as const } : c));
    const refilled = pickTopPrograms(without);
    expect(refilled).toHaveLength(4);
    expect(refilled.every((c) => c.tier === 'championship')).toBe(true);
    expect(refilled.map((c) => c.slug)).not.toContain('brown-university');
  });

  it('Home: credential line, free message, de-duplicated steps, new headings', () => {
    const home = copyOf('src/pages/Home.tsx');
    expect(home).toContain("Free. You don't need an agency.");
    expect(home).toContain('Hugh Johnston');
    expect(home).toContain('2023 NCR D1 national championship coach.');
    expect(home).not.toMatch(/Stay across it|Honest Guides|How it works|Stay Connected/);
    expect(home).toContain('Get new guides.');
  });

  it('About: Hugh paragraph untouched, "I reply personally" gone, one "Email me", national champions on the row', () => {
    const about = copyOf('src/pages/About.tsx');
    expect(about).toContain('Being on both sides of recruiting calls, I was conscious that the decision potential athletes were about to make was a crucial one in their life. I was honest, upfront about Notre Dame College. We were a no-name college, without the best facilities, but we had a tight-knit group of boys from all across the world who all wanted to win. That honesty is some of the gap this site tries to fill.');
    expect(about).toContain('I never visited before I committed though, and it\'s okay if you can\'t.');
    expect(about).toContain('2023 NCR D1 national champions');
    expect(about).not.toMatch(/reply personally|Agencies vary/);
    expect((about.match(/Email me/g) ?? []).length).toBe(1);
    expect(src('scripts/prerender.mjs')).not.toContain('I reply personally');
  });

  it('For Coaches: no recruit pipeline, no unverified claims', () => {
    const fc = copyOf('src/pages/ForCoaches.tsx');
    expect(fc).not.toMatch(/Recruit pipeline|No fee to the player|every week|where international players|Three ways/i);
    expect(fc).toContain('Two ways to work with Rugby Campus');
    expect(fc).toContain('always labelled Featured');
  });

  it('Training: new opener, coaching aimed at high-schoolers, no invented prices', () => {
    const t = copyOf('src/pages/Training.tsx');
    expect(t).toContain('College rugby is a step up physically. Turn up ready.');
    expect(t).toContain('high-school players');
    expect(t).not.toMatch(/\$\s?\d/);
  });

  it('College page: facts are said once', () => {
    expect(SAFETY_TEXT).toBe('See the official campus safety report');
    const detail = copyOf('src/pages/CollegeDetail.tsx');
    expect(detail).not.toMatch(/Popular majors|\['State'|\['Region'|Not confirmed either way/);
    expect(copyOf('src/components/search/CollegeFactsSection.tsx')).not.toMatch(/Largest programs|Official report/);
    for (const c of colleges) {
      const m = mlrSummary(c);
      const text = [visibleBadges(c.badges).join(' '), m.playedText, m.breakdown].join(' | ');
      expect((text.match(/not confirmed|none confirmed/gi) ?? []).length, c.slug).toBeLessThanOrEqual(1);
    }
    expect(visibleBadges(['2025 NCR D1 Finalists', '4 drafted into MLR · none confirmed played'])).toEqual(['2025 NCR D1 Finalists']);
  });

  it('writing pass: no sentence dashes in guides or site copy; "honest" trimmed', () => {
    for (const a of articles) {
      const all = [a.title, a.metaTitle, a.metaDescription, a.excerpt, a.category, a.content].join('\n');
      expect(all, a.slug).not.toContain('—');
      expect(all, a.slug).not.toMatch(/\bhonest\b/i);
    }
    for (const p of ['src/pages/Home.tsx', 'src/pages/About.tsx', 'src/pages/ForCoaches.tsx', 'src/pages/Learn.tsx', 'src/components/Footer.tsx', 'src/components/CoachEmailUnlock.tsx', 'src/components/ContactForm.tsx']) {
      expect(copyOf(p), p).not.toContain('—');
    }
    // Training: only the exercise list (lines with "×") may keep a dash.
    const trainingCopy = copyOf('src/pages/Training.tsx').split('\n').filter((l) => l.includes('—') && !l.includes('×'));
    expect(trainingCopy).toEqual([]);
  });

  it('articles keep the facts and the personal paragraph', () => {
    const lies = articles.find((a) => a.slug === 'why-college-rugby-rankings-lie')!.content;
    expect(lies).toContain('Two years later that same program went 1-7');
    expect(lies).toContain('We only lost one game that year, to Navy.');
    expect(lies).toContain('by the time they were juniors they were all much better players');
    expect(articles.find((a) => a.slug === 'best-rugby-colleges-usa')!.content).toContain('### UC Berkeley (Cal)');
  });

  it('coach unlock: recruitment form first, plain template with no invented facts', () => {
    const c = copyOf('src/components/CoachEmailUnlock.tsx');
    expect(c.indexOf('recruitmentFormUrl &&')).toBeLessThan(c.indexOf('unlocked ? ('));
    const body = coachEmailBody('Brown University');
    expect(body).toContain('Brown University');
    expect(body).toMatch(/\[your name\]/);
    expect(coachEmailSubject('Brown University')).toContain('Brown University rugby');
    expect([body, ...COACH_EMAIL_TIPS].join('\n')).not.toContain('—');
    expect(copyOf('src/pages/CollegeDetail.tsx')).toContain('recruitmentFormUrl={college.recruitmentFormUrl}');
  });

  it('money line and Featured label', () => {
    expect(MONEY_LINE).toBe('How the site makes money: free for players. Colleges may pay for a featured listing, and it will always be labelled Featured.');
    expect(copyOf('src/components/Footer.tsx')).toContain('MONEY_LINE');
    expect(renderToStaticMarkup(createElement(FeaturedBadge))).toContain('Featured');
    // Not used anywhere yet.
    for (const p of ['src/pages/Home.tsx', 'src/pages/Colleges.tsx', 'src/pages/CollegeDetail.tsx', 'src/components/CollegeCard.tsx']) {
      expect(src(p)).not.toContain('FeaturedBadge');
    }
  });

  it('analytics and lazy loading are wired in', () => {
    expect(JSON.parse(src('package.json')).dependencies['@vercel/analytics']).toBeTruthy();
    const app = src('src/App.tsx');
    expect(app).toContain("from '@vercel/analytics/react'");
    expect(app).toContain('<Analytics />');
    for (const page of ['MapPage', 'Colleges', 'CollegeDetail', 'Learn', 'ArticlePage', 'Training', 'About', 'ForCoaches']) {
      expect(app).toContain(`const ${page} = lazy(`);
    }
    expect(src('src/pages/Colleges.tsx')).toContain("lazy(() => import('@/components/search/CollegeSearch'))");
  });

  it('link previews use full addresses (checked on the built pages when dist exists)', () => {
    expect(src('index.html')).toContain('content="https://rugbycampus.org/logo.png"');
    const p = new URL('../../../dist/colleges/wheeling-university/index.html', import.meta.url);
    if (!existsSync(p)) return;
    const html = readFileSync(p, 'utf8');
    expect(html).toMatch(/<meta property="og:image" content="https:\/\/rugbycampus\.org\/college-images\//);
    expect(readFileSync(new URL('../../../dist/about/index.html', import.meta.url), 'utf8')).not.toContain('reply personally');
  });
});
