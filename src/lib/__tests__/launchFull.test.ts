import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { colleges } from '@/data/colleges';
import { compareColleges } from '@/lib/collegeOrder';
import CoachEmailUnlock from '@/components/CoachEmailUnlock';

const src = (p: string) => readFileSync(new URL(`../../../${p}`, import.meta.url), 'utf8');

describe('launch batch, 6 Nov 2026', () => {
  it('unlock only renders when there is a real coach email, and Notre Dame (Indiana) is not a Gmail', () => {
    const nd = colleges.find((c) => c.slug === 'university-of-notre-dame')!;
    expect(nd.coachEmail).toBe('jhickey3@nd.edu');
    expect(nd.coachEmail.toLowerCase()).not.toContain('gmail');
    for (const c of colleges) {
      const html = renderToStaticMarkup(createElement(CoachEmailUnlock, {
        coachName: c.coachName, coachEmail: c.coachEmail, collegeName: c.name,
      }));
      if (!c.coachEmail) expect(html, c.slug).not.toContain('Unlock coach email');
      else expect(html, c.slug).toContain('Unlock coach email');
    }
  });

  it('the college list order is stable', () => {
    const once = [...colleges].sort(compareColleges).map((c) => c.slug);
    const twice = [...colleges].reverse().sort(compareColleges).map((c) => c.slug);
    expect(twice).toEqual(once);
    expect(once[0]).toBe('university-of-california-berkeley');
    expect(once.filter((_, i) => colleges.find((c) => c.slug === once[i])!.tier === 'championship').slice(0, 4)).toEqual([
      'university-of-california-berkeley',
      'united-states-naval-academy',
      'life-university',
      'saint-mary-s-college-of-california',
    ]);
  });

  it('Walsh photos are only referenced from the Walsh profile and About', () => {
    const files = readdirSync(new URL('../../../public/images/walsh', import.meta.url));
    expect(files.length).toBeGreaterThan(0);
    for (const file of ['src/pages/Home.tsx', 'src/pages/Training.tsx', 'src/pages/Colleges.tsx', 'src/pages/MapPage.tsx', 'src/data/colleges.ts']) {
      expect(src(file), file).not.toContain('/images/walsh/');
    }
    expect(src('src/pages/CollegeDetail.tsx')).toContain("college.slug === 'walsh-university'");
    expect(src('src/pages/About.tsx')).toContain('NDC_ABOUT_PHOTO');
    expect(src('src/data/walshPhotos.ts')).toContain('/images/walsh/');
  });
});
