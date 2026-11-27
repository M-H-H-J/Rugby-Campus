// /map basemap regression (27 Nov 2026): MapLibre GL 5+ needs WebGL2, but the old check also accepted WebGL1,
// and a bare `catch {}` hid the throw, so WebGL1-only browsers got a grey rectangle with pins and no console error.
import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { hasWebGL2, mountBasemap, type BasemapDeps } from '@/lib/basemap';

const root = new URL('../../../', import.meta.url);
const src = (p: string) => readFileSync(new URL(p, root), 'utf8');

function fakeDoc(contexts: Record<string, boolean>) {
  const asked: string[] = [];
  const doc = {
    createElement: () => ({
      getContext: (type: string) => {
        asked.push(type);
        return contexts[type] ? { getExtension: () => ({ loseContext: () => {} }) } : null;
      },
    }),
  } as unknown as Pick<Document, 'createElement'>;
  return { doc, asked };
}

function deps(over: Partial<BasemapDeps> = {}) {
  const calls = { raster: 0, vector: 0, warnings: [] as string[] };
  const d: BasemapDeps = {
    hasWebGL2: () => true,
    addVector: async () => { calls.vector++; },
    addRaster: () => { calls.raster++; },
    alive: () => true,
    warn: (m) => { calls.warnings.push(m); },
    ...over,
  };
  return { d, calls };
}

describe('hasWebGL2', () => {
  it('is false on a WebGL1-only browser (the production bug)', () => {
    const { doc, asked } = fakeDoc({ webgl: true, webgl2: false });
    expect(hasWebGL2(doc)).toBe(false);
    expect(asked).toEqual(['webgl2']);
  });
  it('is true with WebGL2 and false when canvas throws', () => {
    expect(hasWebGL2(fakeDoc({ webgl2: true }).doc)).toBe(true);
    expect(hasWebGL2({ createElement: () => { throw new Error('no canvas'); } } as unknown as Document)).toBe(false);
  });
});

describe('mountBasemap', () => {
  it('uses the vector basemap when WebGL2 works', async () => {
    const { d, calls } = deps();
    expect(await mountBasemap(d)).toBe('vector');
    expect(calls).toEqual({ raster: 0, vector: 1, warnings: [] });
  });

  it('falls back to raster, with a warning, when WebGL2 is missing', async () => {
    const addVector = vi.fn(async () => {});
    const { d, calls } = deps({ hasWebGL2: () => false, addVector });
    expect(await mountBasemap(d)).toBe('raster');
    expect(addVector).not.toHaveBeenCalled();
    expect(calls.raster).toBe(1);
    expect(calls.warnings[0]).toMatch(/WebGL2 not supported/);
  });

  it('falls back to raster, with a warning, when MapLibre throws or the style fails', async () => {
    const { d, calls } = deps({ addVector: async () => { throw new Error('WebGL2 is required to display this map'); } });
    expect(await mountBasemap(d)).toBe('raster');
    expect(calls.raster).toBe(1);
    expect(calls.warnings).toHaveLength(1);
  });

  it('falls back once when the vector map fails after loading (context lost)', async () => {
    let late: (r: string) => void = () => {};
    const { d, calls } = deps({ addVector: async (onLate) => { late = onLate; } });
    expect(await mountBasemap(d)).toBe('vector');
    late('WebGL context lost and not restored');
    late('again');
    expect(calls.raster).toBe(1);
  });

  it('does nothing once the map has unmounted', async () => {
    const { d, calls } = deps({ alive: () => false, addVector: async () => { throw new Error('x'); } });
    expect(await mountBasemap(d)).toBe('unmounted');
    expect(calls.raster).toBe(0);
  });
});

describe('LeafletMap wiring', () => {
  const map = src('src/components/LeafletMap.tsx');
  it('never swallows basemap errors silently, and has a no-key raster fallback', () => {
    expect(map).not.toMatch(/catch\s*\{\s*\/\*/);
    expect(map).toContain('mountBasemap(');
    expect(map).toContain("RASTER_TILES = 'https://basemap.nationalmap.gov/");
    expect(map).toContain('USGS The National Map');
    expect(src('src/index.css')).toMatch(/\.basemap-raster\s*\{[^}]*grayscale/);
  });
  it('starts the basemap only after mapRef is set, so alive() is true on the synchronous fallback', () => {
    const body = map.slice(map.indexOf('const map = L.map('));
    expect(body.indexOf('mapRef.current = map;')).toBeGreaterThan(-1);
    expect(body.indexOf('mapRef.current = map;')).toBeLessThan(body.indexOf('void addBasemap('));
  });
  it('the WebGL check matches what the installed MapLibre needs', () => {
    const major = Number(JSON.parse(src('node_modules/maplibre-gl/package.json')).version.split('.')[0]);
    if (major >= 5) expect(src('src/lib/basemap.ts')).not.toMatch(/getContext\('webgl'\)/);
  });
});
