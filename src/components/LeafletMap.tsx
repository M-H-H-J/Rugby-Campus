import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { College } from '@/data/colleges';

const navy = '#00458c';
const gold = '#f2b600';

function makePin(color: string, size = 30) {
  const h = size * 1.3;
  return L.divIcon({
    className: '',
    html: `<svg width="${size}" height="${h}" viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22s14-11.5 14-22c0-7.732-6.268-14-14-14z" fill="${color}" stroke="white" stroke-width="1.5"/>
      <circle cx="14" cy="14" r="5" fill="white"/>
    </svg>`,
    iconSize: [size, h],
    iconAnchor: [size / 2, h],
    popupAnchor: [0, -h + 4],
  });
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
  onSelectRef.current = onSelect;

  // Init map once
  useEffect(() => {
    if (!ref.current || mapRef.current) return;

    const map = L.map(ref.current, {
      center: [39.5, -98.35],
      zoom: 4,
      minZoom: 3,
      maxZoom: 18,
      scrollWheelZoom: true,
      worldCopyJump: true,
    });

    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);
    let tileErrors = 0;
    osm.on('tileerror', () => {
      tileErrors += 1;
      if (tileErrors === 4) {
        map.removeLayer(osm);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
          maxZoom: 19,
          subdomains: 'abcd',
        }).addTo(map);
      }
    });

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
        icon: makePin(c.tier === 'championship' ? gold : navy, c.tier === 'championship' ? 32 : 28),
      });

      const popupHtml = `
        <div style="font-family:'Libre Franklin',sans-serif;min-width:190px">
          <p style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.12em;color:#00458c;margin:0 0 4px">${c.affiliation}</p>
          <p style="font-family:'Newsreader',Georgia,serif;font-weight:600;font-size:14px;color:#071B33;line-height:1.25;margin:0 0 2px">${c.name}</p>
          <p style="font-size:11px;color:#5b6b7d;margin:0 0 10px">${c.location}</p>
          <button data-slug="${c.slug}" style="width:100%;text-align:center;font-size:13px;font-weight:600;background:${navy};color:white;padding:9px 12px;border-radius:6px;border:none;cursor:pointer;font-family:inherit">View profile · Coach contact</button>
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

    if (colleges.length > 0) {
      const bounds = L.latLngBounds(colleges.map((c) => [c.lat, c.lng] as [number, number]));
      map.fitBounds(bounds.pad(0.12), { maxZoom: 6, animate: false });
    }
  }, [colleges]);

  return <div ref={ref} style={{ width: '100%', height, minHeight: 400, background: '#f3f4f6' }} />;
}
