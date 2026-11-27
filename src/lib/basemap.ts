// Basemap selection for /map, kept free of Leaflet and MapLibre so it can be unit-tested.

/**
 * MapLibre GL 5+ needs WebGL2 and throws without it. A WebGL1-only browser (older iOS/Safari, some Android GPUs,
 * blocklisted drivers) must go straight to the raster fallback. Asks for the same context attributes MapLibre does,
 * then releases the context so it doesn't count against the browser's per-page limit.
 */
export function hasWebGL2(doc: Pick<Document, 'createElement'> = document): boolean {
  try {
    const canvas = doc.createElement('canvas');
    const gl = canvas.getContext('webgl2', { alpha: true, depth: true, stencil: true, premultipliedAlpha: true });
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export interface BasemapDeps {
  hasWebGL2: () => boolean;
  /** Mounts the vector basemap; resolves once drawn, rejects (having cleaned up) on any failure. */
  addVector: (onLateFailure: (reason: string) => void) => Promise<void>;
  addRaster: () => void;
  alive: () => boolean;
  warn?: (message: string, err?: unknown) => void;
}

export type BasemapResult = 'vector' | 'raster' | 'unmounted';

/** Vector first; raster on any failure, at most once, and never after the map has been unmounted. */
export async function mountBasemap({ hasWebGL2, addVector, addRaster, alive, warn = console.warn }: BasemapDeps): Promise<BasemapResult> {
  let fellBack = false;
  const fallBack = (reason: string, err?: unknown) => {
    if (fellBack || !alive()) return;
    fellBack = true;
    const message = `[map] Vector basemap unavailable (${reason}); using raster tiles instead.`;
    if (err === undefined) warn(message); else warn(message, err);
    addRaster();
  };

  if (!hasWebGL2()) { fallBack('WebGL2 not supported'); return 'raster'; }
  try {
    await addVector((reason) => fallBack(reason));
  } catch (err) {
    if (!alive()) return 'unmounted';
    fallBack('MapLibre failed to load', err);
  }
  if (!alive()) return 'unmounted';
  return fellBack ? 'raster' : 'vector';
}
