import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { escHtml } from '@/lib/escHtml';
import 'leaflet/dist/leaflet.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { College } from '@/data/colleges';
import { TIER_COLORS, TIER_HOLLOW } from '@/data/colleges';

const navy = TIER_COLORS.playoff;

function makePin(color: string, size = 30, hollow = false) {
  const h = size * 1.3;
  const mark = hollow
    ? `<path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22s14-11.5 14-22c0-7.732-6.268-14-14-14z" fill="#fff" stroke="${color}" stroke-width="2.5"/>`
    : `<path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22s14-11.5 14-22c0-7.732-6.268-14-14-14z" fill="${color}" stroke="white" stroke-width="1.5"/><circle cx="14" cy="14" r="5" fill="white"/>`;
  return L.divIcon({
    className: '',
    html: `<svg width="${size}" height="${h}" viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg">${mark}</svg>`,
    iconSize: [size, h],
    iconAnchor: [size / 2, h],
    popupAnchor: [0, -h + 4],
  });
}

/**
 * Basemap: OpenFreeMap vector tiles (free, no API key, no usage limits; OSM data via OpenMapTiles), drawn by MapLibre GL
 * inside Leaflet so the pins, popups and fit-to-bounds stay as they were. Not OpenStreetMap's own tile servers (not for app traffic),
 * and not CARTO's basemaps (they now need an API key). The credit below is OpenFreeMap's required attribution.
 * MapLibre loads after the map mounts, so pins show at once and the WebGL library stays out of every other page.
 * Without WebGL the pins still work on the plain background.
 */
export const BASEMAP_STYLE = 'https://tiles.openfreemap.org/styles/positron';
export const BASEMAP_ATTRIBUTION = '<a href="https://openfreemap.org" target="_blank" rel="noopener noreferrer">OpenFreeMap</a> <a href="https://www.openmaptiles.org/" target="_blank" rel="noopener noreferrer">&copy; OpenMapTiles</a> Data from <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>';

function hasWebGL(): boolean {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; }
}

async function addBasemap(map: L.Map, alive: () => boolean) {
  map.attributionControl.addAttribution(BASEMAP_ATTRIBUTION);
  if (!hasWebGL()) return;
  try {
    const { maplibreGL } = await import('@/lib/maplibreBasemap');
    if (!alive()) return;
    maplibreGL({ style: BASEMAP_STYLE, attributionControl: false }).addTo(map);
  } catch { /* chunk or style failed: pins still work on the plain background */ }
}

interface Props {
  colleges: College[];
  onSelect: (slug: string) => void;
  height?: number | string;
}

export default function LeafletMap({ colleges, onSelect, height = 560 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const onSelectRef = useRef(onSelect);
  // Fit the pins once; after that a tab change or data refresh keeps the visitor's zoom and pan.
  const fitted = useRef(false);
  onSelectRef.current = onSelect;

  // Init map once
  useEffect(() => {
    if (!ref.current || mapRef.current) return;

    const map = L.map(ref.current, {
      center: [39.5, -98.35],
      zoom: 4,
      minZoom: 3,
      maxZoom: 18,
      zoomSnap: 0.25,
      zoomDelta: 0.5,
      scrollWheelZoom: true,
      worldCopyJump: true,
    });

    void addBasemap(map, () => mapRef.current === map);

    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    // Wire popup buttons to navigation via event delegation
    map.on('popupopen', (e: L.PopupEvent) => {
      const node = (e.popup as L.Popup).getElement();
      const btn = node?.querySelector('[data-slug]') as HTMLElement | null;
      if (btn) {
        btn.onclick = () => onSelectRef.current(btn.getAttribute('data-slug') || '');
      }
    });

    // Keep sizing correct after mount and whenever the container resizes (rotation, layout shifts)
    setTimeout(() => map.invalidateSize(), 100);
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(ref.current);

    return () => { ro.disconnect(); map.remove(); mapRef.current = null; };
  }, []);

  // Update markers when colleges change
  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    colleges.forEach((c) => {
      const marker = L.marker([c.lat, c.lng], {
        title: c.name,
        alt: c.name,
        icon: makePin(TIER_COLORS[c.tier], c.tier === 'championship' ? 32 : 28, TIER_HOLLOW[c.tier]),
      });

      // Name, location and affiliation come from Supabase rows: escape them before they go into HTML.
      const popupHtml = `
        <div style="font-family:'Libre Franklin',sans-serif;min-width:190px">
          <p style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.12em;color:#00458c;margin:0 0 4px">${escHtml(c.affiliation)}</p>
          <p style="font-family:'Newsreader',Georgia,serif;font-weight:600;font-size:14px;color:#071B33;line-height:1.25;margin:0 0 2px">${escHtml(c.name)}</p>
          <p style="font-size:11px;color:#5b6b7d;margin:0 0 10px">${escHtml(c.location)}</p>
          <button data-slug="${escHtml(c.slug)}" style="width:100%;text-align:center;font-size:13px;font-weight:600;background:${navy};color:white;padding:9px 12px;border-radius:6px;border:none;cursor:pointer;font-family:inherit">View profile · Coach contact</button>
        </div>
      `;

      // autoPan keeps edge popups fully on-screen
      marker.bindPopup(popupHtml, {
        maxWidth: 260,
        autoPan: true,
        autoPanPadding: L.point(40, 60),
        keepInView: true,
        closeButton: true,
      });

      marker.addTo(layer);
    });

    if (colleges.length > 0 && !fitted.current) {
      fitted.current = true;
      const bounds = L.latLngBounds(colleges.map((c) => [c.lat, c.lng] as [number, number]));
      map.fitBounds(bounds.pad(0.04), { maxZoom: 6, animate: false });
    }
  }, [colleges]);

  return <div ref={ref} style={{ width: '100%', height, minHeight: 400, background: '#f3f4f6' }} />;
}
