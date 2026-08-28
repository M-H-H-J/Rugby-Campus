import { useState } from 'react';
import { US_NATION_PATH, US_BORDERS_PATH } from '@/data/us-map';
import type { College } from '@/data/colleges';

const navy = '#00458c';
const gold = '#ffb700';

interface Props {
  colleges: College[];
  onSelect: (slug: string) => void;
  height?: number | string;
  interactive?: boolean;
}

export default function USMap({ colleges, onSelect, height = 560, interactive = true }: Props) {
  const [hover, setHover] = useState<College | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  return (
    <div style={{ position: 'relative', width: '100%', height, background: '#f8fafc', borderRadius: 16, overflow: 'hidden' }}>
      <svg viewBox="0 0 960 600" style={{ width: '100%', height: '100%', display: 'block' }} preserveAspectRatio="xMidYMid meet">
        {/* Ocean / background */}
        <rect width="960" height="600" fill="#f8fafc" />

        {/* Nation fill */}
        <path d={US_NATION_PATH} fill="#ffffff" stroke="none" />

        {/* State borders */}
        <path d={US_BORDERS_PATH} fill="none" stroke="#e5e7eb" strokeWidth={0.8} strokeLinejoin="round" />

        {/* Nation outline */}
        <path d={US_NATION_PATH} fill="none" stroke="#d1d5db" strokeWidth={1.2} strokeLinejoin="round" />

        {/* Pins */}
        {colleges.map((c) => {
          if (c.mapX == null || c.mapY == null) return null;
          const isHover = hover?.id === c.id;
          const r = c.tier === 'championship' ? 7 : 5.5;
          return (
            <g
              key={c.id}
              style={{ cursor: interactive ? 'pointer' : 'default' }}
              onMouseEnter={(e) => { if (!interactive) return; setHover(c); const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect(); setPos({ x: ((c.mapX! / 960) * rect.width), y: ((c.mapY! / 600) * rect.height) }); }}
              onMouseLeave={() => interactive && setHover(null)}
              onClick={() => interactive && onSelect(c.slug)}
            >
              {/* Halo on hover */}
              {isHover && <circle cx={c.mapX} cy={c.mapY} r={r + 5} fill={c.tier === 'championship' ? gold : navy} opacity={0.2} />}
              <circle cx={c.mapX} cy={c.mapY} r={r} fill={c.tier === 'championship' ? gold : navy} stroke="#fff" strokeWidth={1.5} opacity={isHover ? 1 : 0.85} />
              <circle cx={c.mapX} cy={c.mapY} r={r * 0.4} fill="#fff" opacity={0.9} />
            </g>
          );
        })}
      </svg>

      {/* Hover tooltip */}
      {hover && interactive && (
        <div style={{
          position: 'absolute', left: pos.x, top: pos.y, transform: 'translate(-50%, calc(-100% - 14px))',
          background: 'white', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.14)', border: '1px solid #f3f4f6',
          padding: '10px 12px', pointerEvents: 'none', whiteSpace: 'nowrap', zIndex: 20,
        }}>
          <div style={{ fontFamily: 'Newsreader, Georgia, serif', fontWeight: 600, fontSize: 12, color: '#071B33' }}>{hover.name}</div>
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{hover.location}</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 600, background: '#f3f4f6', color: '#4b5563', padding: '2px 7px', borderRadius: 5 }}>{hover.affiliation}</span>
            
          </div>
        </div>
      )}
    </div>
  );
}
