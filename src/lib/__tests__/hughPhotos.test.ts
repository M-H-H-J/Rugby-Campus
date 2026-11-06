import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { HUGH_PHOTOS, HEADSHOT_OG_PATH, photoSrc } from '@/lib/hughPhotos';
import HughPhoto from '@/components/HughPhoto';

const root = new URL('../../../', import.meta.url);
const pub = (p: string) => new URL(`public${p}`, root);
const src = (p: string) => readFileSync(new URL(p, root), 'utf8');
const MAX = 250 * 1024;

describe("Hugh's photos", () => {
  const photos = Object.values(HUGH_PHOTOS);

  it('every photo has a small and a large web file, under 250 KB', () => {
    expect(photos).toHaveLength(4);
    for (const p of photos) {
      for (const size of ['sm', 'lg'] as const) {
        const url = pub(photoSrc(p, size));
        expect(existsSync(url), `${photoSrc(p, size)} is missing; run scripts/optimize-hugh-photos.mjs`).toBe(true);
        expect(statSync(url).size).toBeGreaterThan(1000);
        expect(statSync(url).size).toBeLessThanOrEqual(MAX);
      }
      expect(p.width).toBeGreaterThan(0);
      expect(p.height).toBeGreaterThan(0);
      expect(p.width).toBeLessThanOrEqual(1600);
    }
  });

  it('the link-preview JPG of the headshot exists', () => {
    expect(existsSync(pub(HEADSHOT_OG_PATH))).toBe(true);
    expect(statSync(pub(HEADSHOT_OG_PATH)).size).toBeLessThanOrEqual(MAX);
  });

  it('alt text is real and names Hugh, with no invented years or names', () => {
    for (const p of photos) {
      expect(p.alt.length).toBeGreaterThan(30);
      expect(p.alt).toContain('Hugh Johnston');
      expect(p.alt).not.toMatch(/\b(19|20)\d{2}\b/);
    }
  });

  it('component sets width, height, srcset and lazy-loads unless eager', () => {
    const lazy = renderToStaticMarkup(createElement(HughPhoto, { photo: 'westPoint', sizes: '100vw' }));
    const p = HUGH_PHOTOS.westPoint;
    expect(lazy).toContain(`width="${p.width}"`);
    expect(lazy).toContain(`height="${p.height}"`);
    expect(lazy).toContain('loading="lazy"');
    expect(lazy).toContain('srcSet=');
    const eager = renderToStaticMarkup(createElement(HughPhoto, { photo: 'headshot', sizes: '128px', eager: true }));
    expect(eager).toContain('loading="eager"');
  });

  it('placements: headshot + coach shirt on About, huddle on Home, cap on Training; About link preview uses the headshot', () => {
    const about = src('src/pages/About.tsx');
    expect(about).toMatch(/photo="headshot"[^>]*eager/);
    expect(about).toContain('photo="coachShirt"');
    expect(src('src/pages/Home.tsx')).toContain('photo="westPoint"');
    expect(HUGH_PHOTOS.westPoint.caption).toBe('NDC vs Army · 9–9 · 30 Sep 2023');
    expect(src('src/pages/Training.tsx')).toContain('photo="coachCap"');
    expect(src('scripts/prerender.mjs')).toContain('/images/hugh/hugh-johnston-headshot-og.jpg');
    // Only the About headshot is eager
    expect(src('src/pages/Home.tsx')).not.toMatch(/eager/);
    expect(src('src/pages/Training.tsx')).not.toMatch(/eager/);
  });
});
