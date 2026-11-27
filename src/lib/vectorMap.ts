// Loaded on demand by CollegeMap when WebGL2 is available. MapLibre finds its web worker next to its own script,
// which a bundler moves, so point it at the bundled copy of the worker explicitly.
import { Map as GLMap, Marker, Popup, NavigationControl, AttributionControl, setWorkerUrl } from 'maplibre-gl';
import type { ErrorEvent as GLErrorEvent, PopupOptions } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { College } from '@/data/colleges';
import { BASEMAP_ATTRIBUTION, US_CENTER, pinBounds, pinSpec, popupNode, type MapHandle, type MapView } from '@/lib/mapMarkup';

setWorkerUrl(workerUrl);

export interface VectorMapOptions {
  style: string;
  onSelect: (slug: string) => void;
  /** How long to wait for the style and first tiles before giving up. */
  timeoutMs: number;
  /** Receives the map as soon as it exists, so pins show while the style loads. */
  onCreated: (handle: MapHandle) => void;
  /** Called if the map fails after it has loaded (e.g. the WebGL context is lost and not restored). */
  onLateFailure: (reason: string) => void;
}

// MapLibre tiles are 512px, Leaflet's 256px: the same view is one zoom level lower here.
const ZOOM_OFFSET = 1;

function popupOffset(width: number, height: number): PopupOptions['offset'] {
  const above: [number, number] = [0, -height + 4];
  return {
    center: [0, -height / 2], top: [0, 0], 'top-left': [0, 0], 'top-right': [0, 0],
    bottom: above, 'bottom-left': above, 'bottom-right': above,
    left: [width / 2, -height / 2], right: [-width / 2, -height / 2],
  };
}

function pinElement(c: College) {
  const spec = pinSpec(c);
  const el = document.createElement('div');
  el.className = 'rc-pin';
  el.innerHTML = spec.html;
  el.style.width = `${spec.width}px`;
  el.style.height = `${spec.height}px`;
  el.title = c.name;
  el.setAttribute('aria-label', c.name);
  return { el, spec };
}

/** A constructor that throws can leave MapLibre's classes and children behind; Leaflet needs a clean container. */
function clearContainer(container: HTMLElement) {
  container.replaceChildren();
  for (const cls of [...container.classList]) if (cls.startsWith('maplibregl-')) container.classList.remove(cls);
}

/**
 * Mounts a native MapLibre map and resolves once it has drawn. Rejects (after destroying the map) if MapLibre throws,
 * the style or worker fails, or nothing loads in time, so the caller can fall back to Leaflet raster tiles.
 */
export function mountVectorMap(container: HTMLElement, { style, onSelect, timeoutMs, onCreated, onLateFailure }: VectorMapOptions): Promise<void> {
  let map: GLMap;
  try {
    map = new GLMap({
      container,
      style,
      center: [US_CENTER[1], US_CENTER[0]],
      zoom: 4 - ZOOM_OFFSET,
      minZoom: 3 - ZOOM_OFFSET,
      maxZoom: 18 - ZOOM_OFFSET,
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false,
    });
  } catch (err) {
    clearContainer(container);
    return Promise.reject(err);
  }
  map.touchZoomRotate.disableRotation();
  map.keyboard.disableRotation();
  map.addControl(new NavigationControl({ showCompass: false }), 'top-left');
  map.addControl(new AttributionControl({ customAttribution: BASEMAP_ATTRIBUTION }), 'bottom-right');

  let markers: Marker[] = [];
  let destroyed = false;
  const handle: MapHandle = {
    setColleges(colleges) {
      if (destroyed) return;
      markers.forEach((m) => m.remove());
      markers = colleges.map((c) => {
        const { el, spec } = pinElement(c);
        // MapLibre's own focusAfterOpen runs before the popup is positioned (scrolling the page) and rings the button
        // on every tap; move focus only when the pin was opened from the keyboard.
        const popup = new Popup({ maxWidth: '260px', closeButton: true, focusAfterOpen: false, offset: popupOffset(spec.width, spec.height) })
          .setDOMContent(popupNode(c, onSelect));
        popup.on('open', () => {
          if (el.matches(':focus-visible')) popup.getElement()?.querySelector<HTMLElement>('[data-slug]')?.focus({ preventScroll: true });
        });
        // addTo() first: it calls remove(), which drops the Enter/Space listener setPopup() adds.
        return new Marker({ element: el, anchor: 'bottom' }).setLngLat([c.lng, c.lat]).addTo(map).setPopup(popup);
      });
    },
    fit(colleges) {
      if (destroyed || colleges.length === 0) return;
      const [[s, w], [n, e]] = pinBounds(colleges);
      map.fitBounds([[w, s], [e, n]], { padding: 40, maxZoom: 6 - ZOOM_OFFSET, animate: false });
    },
    setView({ center, zoom }: MapView) {
      if (!destroyed) map.jumpTo({ center: [center[1], center[0]], zoom: zoom - ZOOM_OFFSET });
    },
    getView() {
      if (destroyed) return null;
      const c = map.getCenter();
      return { center: [c.lat, c.lng], zoom: map.getZoom() + ZOOM_OFFSET };
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      markers.forEach((m) => m.remove());
      markers = [];
      try { map.remove(); } catch (err) { console.warn('[map] MapLibre did not tear down cleanly', err); }
      clearContainer(container);
    },
  };
  onCreated(handle);

  return new Promise<void>((resolve, reject) => {
    let settled = false;
    const fail = (err: unknown) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      handle.destroy();
      reject(err instanceof Error ? err : new Error(String(err)));
    };
    const timer = setTimeout(() => fail(new Error(`basemap did not load within ${timeoutMs}ms`)), timeoutMs);
    map.once('load', () => { if (settled) return; settled = true; clearTimeout(timer); resolve(); });
    // Tile errors are recoverable (a retry or the next pan fixes them); a style, sprite or worker error is not.
    map.on('error', (e: GLErrorEvent & { tile?: unknown; sourceId?: string }) => {
      if (e.tile || e.sourceId) { console.warn('[map] basemap tile failed to load', e.error); return; }
      if (!settled) fail(e.error);
      else console.warn('[map] basemap error', e.error);
    });
    let restoreTimer: ReturnType<typeof setTimeout> | undefined;
    map.on('webglcontextlost', () => {
      if (!settled) { fail(new Error('WebGL context lost while loading')); return; }
      clearTimeout(restoreTimer);
      restoreTimer = setTimeout(() => { if (!destroyed) onLateFailure('WebGL context lost and not restored'); }, 5000);
    });
    map.on('webglcontextrestored', () => clearTimeout(restoreTimer));
  });
}
