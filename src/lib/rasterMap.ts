// Leaflet + USGS raster tiles. Loaded on demand by CollegeMap only when native MapLibre can't run, so WebGL2
// visitors never download Leaflet.
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { College } from '@/data/colleges';
import { RASTER_ATTRIBUTION, RASTER_TILES, US_CENTER, pinBounds, pinSpec, popupNode, type MapHandle } from '@/lib/mapMarkup';

/** Integer zoom and a slow, debounced wheel: raster tiles scale with CSS transforms instead of blurring at
 * fractional levels and refetching on every trackpad tick. */
export const RASTER_MAP_OPTIONS: L.MapOptions = {
  center: US_CENTER,
  zoom: 4,
  minZoom: 3,
  maxZoom: 18,
  zoomSnap: 1,
  zoomDelta: 1,
  wheelPxPerZoomLevel: 120,
  wheelDebounceTime: 60,
  scrollWheelZoom: true,
  worldCopyJump: true,
};

/** Fetch tiles once the zoom settles and keep a ring of neighbours in memory so panning back doesn't refetch. */
export const RASTER_TILE_OPTIONS: L.TileLayerOptions = {
  attribution: RASTER_ATTRIBUTION,
  className: 'basemap-raster',
  maxNativeZoom: 16,
  maxZoom: 18,
  updateWhenZooming: false,
  updateWhenIdle: true,
  keepBuffer: 4,
};

function pinIcon(c: College) {
  const { html, width, height } = pinSpec(c);
  return L.divIcon({
    className: 'rc-pin',
    html,
    iconSize: [width, height],
    iconAnchor: [width / 2, height],
    popupAnchor: [0, -height + 4],
  });
}

export function mountRasterMap(container: HTMLElement, { onSelect }: { onSelect: (slug: string) => void }): MapHandle {
  const map = L.map(container, RASTER_MAP_OPTIONS);
  L.tileLayer(RASTER_TILES, RASTER_TILE_OPTIONS).addTo(map);
  const layer = L.layerGroup().addTo(map);

  // Leaflet only watches the window; this also catches layout shifts and rotation.
  const ro = new ResizeObserver(() => map.invalidateSize());
  ro.observe(container);

  let destroyed = false;
  return {
    setColleges(colleges) {
      if (destroyed) return;
      layer.clearLayers();
      for (const c of colleges) {
        L.marker([c.lat, c.lng], { title: c.name, alt: c.name, icon: pinIcon(c) })
          // autoPan keeps edge popups fully on-screen
          .bindPopup(popupNode(c, onSelect), { maxWidth: 260, autoPan: true, autoPanPadding: L.point(40, 60), keepInView: true, closeButton: true })
          .addTo(layer);
      }
    },
    fit(colleges) {
      if (destroyed || colleges.length === 0) return;
      map.fitBounds(L.latLngBounds(pinBounds(colleges)).pad(0.04), { maxZoom: 6, animate: false });
    },
    setView({ center, zoom }) {
      if (!destroyed) map.setView(center, Math.round(zoom), { animate: false });
    },
    getView() {
      if (destroyed) return null;
      const c = map.getCenter();
      return { center: [c.lat, c.lng], zoom: map.getZoom() };
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      ro.disconnect();
      map.remove();
    },
  };
}
