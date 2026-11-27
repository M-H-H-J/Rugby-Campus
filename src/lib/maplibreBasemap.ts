// Loaded on demand by LeafletMap. MapLibre finds its web worker next to its own script, which a bundler moves,
// so point it at the bundled copy of the worker explicitly.
import { setWorkerUrl } from 'maplibre-gl';
import type { Map as GLMap, ErrorEvent as GLErrorEvent } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import { MaplibreGL } from '@maplibre/maplibre-gl-leaflet';
import type L from 'leaflet';

setWorkerUrl(workerUrl);

// If the MapLibre constructor throws inside onAdd, Leaflet has already wired the layer's move/zoom handlers and the
// plugin's onRemove would call remove() on a map that was never made. This lets removeLayer clean that state up.
const SafeMaplibreGL: typeof MaplibreGL = MaplibreGL.extend({
  onRemove(this: { _glMap?: GLMap | null; _container?: HTMLElement }, map: L.Map) {
    if (this._glMap) return MaplibreGL.prototype.onRemove.call(this, map);
    this._container?.remove();
  },
});

export interface VectorBasemapOptions {
  style: string;
  /** How long to wait for the style and first tiles before giving up. */
  timeoutMs: number;
  /** Called if the basemap fails after it has loaded (e.g. the WebGL context is lost and not restored). */
  onLateFailure: (reason: string) => void;
}

/**
 * Adds the MapLibre layer and resolves once it has drawn. Rejects (after removing the layer) if MapLibre throws,
 * the style or worker fails, or nothing loads in time, so the caller can fall back to raster tiles.
 */
export function addVectorBasemap(map: L.Map, { style, timeoutMs, onLateFailure }: VectorBasemapOptions): Promise<void> {
  const layer = new SafeMaplibreGL({ style, attributionControl: false });
  const remove = () => { if (map.hasLayer(layer)) map.removeLayer(layer); };
  try {
    layer.addTo(map);
  } catch (err) {
    remove();
    return Promise.reject(err);
  }
  const gl = layer.getMaplibreMap();
  if (!gl) { remove(); return Promise.reject(new Error('MapLibre map was not created')); }

  return new Promise<void>((resolve, reject) => {
    let loaded = false;
    const fail = (err: unknown) => {
      if (loaded) return;
      loaded = true;
      clearTimeout(timer);
      remove();
      reject(err instanceof Error ? err : new Error(String(err)));
    };
    const timer = setTimeout(() => fail(new Error(`basemap did not load within ${timeoutMs}ms`)), timeoutMs);
    gl.once('load', () => { if (loaded) return; loaded = true; clearTimeout(timer); resolve(); });
    // Tile errors are recoverable (a retry or the next pan fixes them); a style, sprite or worker error is not.
    gl.on('error', (e: GLErrorEvent & { tile?: unknown; sourceId?: string }) => {
      if (e.tile || e.sourceId) { console.warn('[map] basemap tile failed to load', e.error); return; }
      if (!loaded) fail(e.error);
      else console.warn('[map] basemap error', e.error);
    });
    let restoreTimer: ReturnType<typeof setTimeout> | undefined;
    gl.on('webglcontextlost', () => {
      clearTimeout(restoreTimer);
      restoreTimer = setTimeout(() => {
        if (!map.hasLayer(layer)) return;
        remove();
        onLateFailure('WebGL context lost and not restored');
      }, 5000);
    });
    gl.on('webglcontextrestored', () => clearTimeout(restoreTimer));
  });
}
