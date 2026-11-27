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

describe('CollegeMap wiring', () => {
  const map = src('src/components/CollegeMap.tsx');
  const markup = src('src/lib/mapMarkup.ts');
  const vector = src('src/lib/vectorMap.ts');
  const raster = src('src/lib/rasterMap.ts');
  it('never swallows basemap errors silently, and has a no-key raster fallback', () => {
    for (const f of [map, vector, raster]) expect(f).not.toMatch(/catch\s*\{\s*\/\*/);
    expect(map).toContain('mountBasemap(');
    expect(markup).toContain("RASTER_TILES = 'https://basemap.nationalmap.gov/");
    expect(markup).toContain('USGS The National Map');
    expect(src('src/index.css')).toMatch(/\.basemap-raster\s*\{[^}]*grayscale/);
  });
  it('loads each engine only when it runs: MapLibre for WebGL2, Leaflet for the fallback', () => {
    expect(map).toContain("import('@/lib/vectorMap')");
    expect(map).toContain("import('@/lib/rasterMap')");
    expect(map).not.toMatch(/from 'leaflet'|from 'maplibre-gl'/);
    expect(markup).not.toMatch(/from 'leaflet'|from 'maplibre-gl'/);
    expect(vector).not.toMatch(/from 'leaflet'/);
    expect(src('src/pages/MapPage.tsx')).not.toMatch(/leaflet|maplibre/i);
  });
  it('uses native MapLibre, not the Leaflet plugin', () => {
    expect(vector).toContain('new GLMap(');
    expect(vector).toContain('new NavigationControl(');
    expect(vector).not.toContain('maplibre-gl-leaflet');
    expect(JSON.parse(src('package.json')).dependencies).not.toHaveProperty('@maplibre/maplibre-gl-leaflet');
  });
  it('the vector map is destroyed before the fallback mounts in its container', () => {
    const fail = vector.slice(vector.indexOf('const fail = '));
    expect(fail.indexOf('handle.destroy()')).toBeLessThan(fail.indexOf('reject('));
    const addRaster = map.slice(map.indexOf('const addRaster = '));
    expect(addRaster.indexOf('handleRef.current?.destroy()')).toBeLessThan(addRaster.indexOf("import('@/lib/rasterMap')"));
  });
  it('fits the pins once, then keeps the visitor\'s pan and zoom across tab changes', () => {
    expect(map.match(/fitted\.current = true/g)).toHaveLength(2);
    expect(map).toContain('if (!fitted.current && colleges.length > 0)');
  });
  it('the WebGL check matches what the installed MapLibre needs', () => {
    const major = Number(JSON.parse(src('node_modules/maplibre-gl/package.json')).version.split('.')[0]);
    if (major >= 5) expect(src('src/lib/basemap.ts')).not.toMatch(/getContext\('webgl'\)/);
  });
});

describe('Leaflet fallback zooms in whole steps and fetches tiles once the zoom settles', () => {
  // Leaflet needs a DOM, so read the options from source rather than importing the module.
  const raster = src('src/lib/rasterMap.ts');
  it('map options', () => {
    for (const opt of ['zoomSnap: 1,', 'zoomDelta: 1,', 'wheelPxPerZoomLevel: 120,', 'wheelDebounceTime: 60,']) expect(raster).toContain(opt);
  });
  it('tile options', () => {
    for (const opt of ['updateWhenZooming: false,', 'updateWhenIdle: true,', 'keepBuffer: 4,']) expect(raster).toContain(opt);
  });
  it('the raster grey is a single filter, not a chain', () => {
    const rule = src('src/index.css').match(/\.basemap-raster\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(rule).toMatch(/filter: grayscale\(1\);/);
    expect(rule).not.toMatch(/brightness|contrast/);
  });
});
