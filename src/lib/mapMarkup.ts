// Pin and popup markup shared by both /map engines (native MapLibre GL and the Leaflet raster fallback).
// Kept free of either library so the component can choose one at runtime and load only that one.
import { escHtml } from '@/lib/escHtml';
import type { College } from '@/data/colleges';
import { TIER_COLORS, TIER_HOLLOW } from '@/data/colleges';

/**
 * Basemap: OpenFreeMap vector tiles (free, no API key, no usage limits; OSM data via OpenMapTiles), drawn by native
 * MapLibre GL. Not OpenStreetMap's own tile servers (not for app traffic), and not CARTO's basemaps (they now need an
 * API key). The credit below is OpenFreeMap's required attribution. The Bright style is used because Positron read as
 * dark grey behind the pins; Liberty is busier (dense green landcover, darker ocean).
 *
 * MapLibre GL 5+ needs WebGL2. Without it, or if the chunk, worker or style fails, the map falls back to Leaflet with
 * USGS National Map tiles (US public domain, no key, no watermark, fine on a commercial site): the hydrography layer
 * (white land, blue water, national borders) for the national view, then the topo layer from RASTER_DETAIL_MIN_ZOOM,
 * where it is white with towns and roads. Zoomed out, topo is dark shaded relief. Not Esri's server.arcgisonline.com
 * tiles: without an ArcGIS subscription they aren't licensed for commercial use. Every fallback logs a console
 * warning saying why.
 */
export const BASEMAP_STYLE = 'https://tiles.openfreemap.org/styles/bright';
// Byte-for-byte the attribution in OpenFreeMap's TileJSON, so MapLibre shows the credit once instead of twice.
export const BASEMAP_ATTRIBUTION = '<a href="https://openfreemap.org" target="_blank">OpenFreeMap</a> <a href="https://www.openmaptiles.org/" target="_blank">&copy; OpenMapTiles</a> Data from <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>';
export const RASTER_TILES = 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSHydroCached/MapServer/tile/{z}/{y}/{x}';
export const RASTER_DETAIL_TILES = 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}';
export const RASTER_DETAIL_MIN_ZOOM = 7;
export const RASTER_ATTRIBUTION = 'Tiles: <a href="https://www.usgs.gov/programs/national-geospatial-program/national-map" target="_blank" rel="noopener noreferrer">USGS The National Map</a>';

/** Centre of the contiguous US, as [lat, lng]. */
export const US_CENTER: [number, number] = [39.5, -98.35];

const navy = TIER_COLORS.playoff;

export interface PinSpec {
  html: string;
  width: number;
  height: number;
}

export function pinSpec(c: Pick<College, 'tier'>): PinSpec {
  const size = c.tier === 'championship' ? 32 : 28;
  const color = TIER_COLORS[c.tier];
  const h = size * 1.3;
  const mark = TIER_HOLLOW[c.tier]
    ? `<path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22s14-11.5 14-22c0-7.732-6.268-14-14-14z" fill="#fff" stroke="${color}" stroke-width="2.5"/>`
    : `<path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22s14-11.5 14-22c0-7.732-6.268-14-14-14z" fill="${color}" stroke="white" stroke-width="1.5"/><circle cx="14" cy="14" r="5" fill="white"/>`;
  return {
    // The map engine positions the outer .rc-pin; hover/press scale goes on the inner span so the pin stays on its anchor.
    html: `<span class="rc-pin-inner"><svg width="${size}" height="${h}" viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg">${mark}</svg></span>`,
    width: size,
    height: h,
  };
}

/** Popup body with its button already wired to `onSelect`. */
export function popupNode(c: College, onSelect: (slug: string) => void): HTMLElement {
  const node = document.createElement('div');
  // Name, location and affiliation come from Supabase rows: escape them before they go into HTML.
  node.innerHTML = `
    <div style="font-family:'Libre Franklin',sans-serif;min-width:190px">
      <p style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.12em;color:#00458c;margin:0 0 4px">${escHtml(c.affiliation)}</p>
      <p style="font-family:'Newsreader',Georgia,serif;font-weight:600;font-size:14px;color:#071B33;line-height:1.25;margin:0 0 2px">${escHtml(c.name)}</p>
      <p style="font-size:11px;color:#5b6b7d;margin:0 0 10px">${escHtml(c.location)}</p>
      <button type="button" data-slug="${escHtml(c.slug)}" style="width:100%;text-align:center;font-size:13px;font-weight:600;background:${navy};color:white;padding:9px 12px;border-radius:6px;border:none;cursor:pointer;font-family:inherit">View profile · Coach contact</button>
    </div>
  `;
  const btn = node.querySelector<HTMLButtonElement>('[data-slug]');
  if (btn) btn.onclick = () => onSelect(c.slug);
  return node;
}

/** [[south, west], [north, east]] around the pins. */
export function pinBounds(colleges: Pick<College, 'lat' | 'lng'>[]): [[number, number], [number, number]] {
  const lats = colleges.map((c) => c.lat);
  const lngs = colleges.map((c) => c.lng);
  return [[Math.min(...lats), Math.min(...lngs)], [Math.max(...lats), Math.max(...lngs)]];
}

/** Where the visitor is looking, in Leaflet zoom units (MapLibre's 512px tiles are one level lower). */
export interface MapView {
  center: [number, number];
  zoom: number;
}

/** What the React component needs from either engine. */
export interface MapHandle {
  setColleges(colleges: College[]): void;
  fit(colleges: College[]): void;
  setView(view: MapView): void;
  getView(): MapView | null;
  destroy(): void;
}
