import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { College } from '@/data/colleges';

const navy = '#00458c';
const gold = '#ffb700';

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

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

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

    // Fix sizing after mount
    setTimeout(() => map.invalidateSize(), 100);

    return () => { map.remove(); mapRef.current = null; };
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
        <div style="font-family:Inter,sans-serif;min-width:200px;padding:4px 2px">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:4px">
            <span style="font-family:Montserrat,sans-serif;font-weight:600;font-size:13px;color:#0b1026;line-height:1.25">${c.name}</span>
            
          </div>
          <div style="font-size:11px;color:#9ca3af;margin-bottom:8px">${c.location}</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">
            <span style="font-size:10px;font-weight:600;background:#f3f4f6;color:#4b5563;padding:2px 7px;border-radius:5px">${c.affiliation}</span>
            ${c.draftPicks > 0 ? `<span style="font-size:10px;font-weight:700;background:rgba(255,183,0,0.15);color:#9a6e00;padding:2px 7px;border-radius:5px">${c.draftPicks} MLR picks</span>` : ''}
          </div>
          <button data-slug="${c.slug}" style="width:100%;text-align:center;font-size:12px;font-weight:600;background:${navy};color:white;padding:8px;border-radius:8px;border:none;cursor:pointer">View Full Profile →</button>
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
  }, [colleges]);

  return <div ref={ref} style={{ width: '100%', height, background: '#e8edf2' }} />;
}
