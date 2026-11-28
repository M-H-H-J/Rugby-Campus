// /map basemap regression (27 Nov 2026): MapLibre GL 5+ needs WebGL2, but the old check also accepted WebGL1,
// and a bare `catch {}` hid the throw, so WebGL1-only browsers got a grey rectangle with pins and no console error.
import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { hasWebGL2, mountBasemap, visibleTimeout, type BasemapDeps } from '@/lib/basemap';

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
  const calls = { raster: 0, vector: 0, warnings: [] as string[], reasons: [] as string[] };
  const d: BasemapDeps = {
    hasWebGL2: () => true,
    addVector: async () => { calls.vector++; },
    addRaster: (reason) => { calls.raster++; calls.reasons.push(reason); },
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
    expect(calls).toEqual({ raster: 0, vector: 1, warnings: [], reasons: [] });
  });

  it('passes the reason, including the error message, to the fallback', async () => {
    const { d, calls } = deps({ addVector: async () => { throw new Error('style did not load'); } });
    await mountBasemap(d);
    expect(calls.reasons).toEqual(['MapLibre failed to load: style did not load']);
    expect(calls.warnings[0]).toContain('style did not load');
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

describe('visibleTimeout', () => {
  function fakeVisibility(initial: DocumentVisibilityState) {
    let listener: (() => void) | undefined;
    const doc = {
      visibilityState: initial,
      addEventListener: (_: string, l: () => void) => { listener = l; },
      removeEventListener: () => { listener = undefined; },
    };
    const set = (s: DocumentVisibilityState) => { doc.visibilityState = s; listener?.(); };
    return { doc: doc as unknown as Document, set, listening: () => listener !== undefined };
  }

  it('does not count time while the tab is hidden (the MacBook Air fallback)', () => {
    vi.useFakeTimers();
    const fired = vi.fn();
    const v = fakeVisibility('hidden');
    visibleTimeout(15000, fired, v.doc);
    vi.advanceTimersByTime(60000);
    expect(fired).not.toHaveBeenCalled();
    v.set('visible');
    vi.advanceTimersByTime(14999);
    expect(fired).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(fired).toHaveBeenCalledTimes(1);
    expect(v.listening()).toBe(false);
    vi.useRealTimers();
  });

  it('keeps the visible time already used when the tab is hidden and shown again', () => {
    vi.useFakeTimers();
    const fired = vi.fn();
    const v = fakeVisibility('visible');
    visibleTimeout(15000, fired, v.doc);
    vi.advanceTimersByTime(10000);
    v.set('hidden');
    vi.advanceTimersByTime(30000);
    v.set('visible');
    vi.advanceTimersByTime(4999);
    expect(fired).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(fired).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('cancel stops it and removes the listener', () => {
    vi.useFakeTimers();
    const fired = vi.fn();
    const v = fakeVisibility('visible');
    const cancel = visibleTimeout(1000, fired, v.doc);
    cancel();
    vi.advanceTimersByTime(5000);
    expect(fired).not.toHaveBeenCalled();
    expect(v.listening()).toBe(false);
    vi.useRealTimers();
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
  });
  it('uses a bright basemap on both paths, never a dark or greyed one (Hugh, 27 Nov 2026)', () => {
    expect(markup).toContain("BASEMAP_STYLE = 'https://tiles.openfreemap.org/styles/bright'");
    // Topo has state names, towns and roads at every zoom; hydro alone (PR #23) showed only water at the national view.
    expect(markup).toContain("RASTER_TILES = 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/");
    expect(markup).not.toContain('USGSHydroCached/');
    const urls = markup.match(/'https:\/\/[^']+'/g) ?? [];
    expect(urls.length).toBeGreaterThan(0);
    for (const u of urls) expect(u).not.toMatch(/positron|arcgisonline|tile\.openstreetmap|cartocdn/i);
    expect(markup).toContain('OpenFreeMap</a>');
    expect(markup).toContain('OpenMapTiles</a>');
    expect(markup).toContain('OpenStreetMap</a>');
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
  it('a hidden tab or slow tiles never trigger the fallback (Hugh, 27 Nov 2026: Chrome on a MacBook Air)', () => {
    // The timeout counts visible time only, readiness is style + first frame (not every tile), and a context loss
    // before the first draw gets the same restore window as after it.
    expect(vector).toContain('visibleTimeout(timeoutMs,');
    expect(vector).not.toMatch(/setTimeout\(/);
    expect(vector).not.toContain("map.once('load'");
    expect(vector).toContain("map.on('render', onRender)");
    expect(vector).toContain('map.isStyleLoaded()');
    expect(vector).not.toContain('WebGL context lost while loading');
  });
  it('exposes the engine and the fallback reason on the map container', () => {
    expect(map).toContain("container.dataset.basemap = 'loading'");
    expect(map).toContain("container.dataset.basemap = 'raster'");
    expect(map).toContain('container.dataset.basemapReason = reason');
    expect(map).toContain("container.dataset.basemap = 'vector'");
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
  it('the raster tiles are lightened by one brightness filter: never greyscale, never a chain', () => {
    const css = src('src/index.css');
    const rule = css.match(/\.basemap-raster\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(rule.trim()).toMatch(/^filter: brightness\([\d.]+\);$/);
    expect(css.match(/\.basemap-raster\s*\{/g)).toHaveLength(1);
  });
});
