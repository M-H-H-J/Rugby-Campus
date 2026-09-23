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
    <div style={{ position: 'relative', width: '100%', height, background: '#f8fafc', overflow: 'hidden' }}>
      <svg viewBox="0 0 960 600" style={{ width: '100%', height: '100%', display: 'block' }} preserveAspectRatio="xMidYMid meet">
        {/* Ocean / background */}
        <rect width="960" height="600" fill="#f8fafc" />

        {/* Nation fill */}
        <path d={US_NATION_PATH} fill="#ffffff" stroke="none" />

        {/* State borders */}
        <path d={US_BORDERS_PATH} fill="none" stroke="#e2e5ea" strokeWidth={0.7} strokeLinejoin="round" />

        {/* Nation outline */}
        <path d={US_NATION_PATH} fill="none" stroke="#cdd3db" strokeWidth={1} strokeLinejoin="round" />

        {/* Pins — larger for visibility */}
        {colleges.map((c) => {
          if (c.mapX == null || c.mapY == null) return null;
          const isHover = hover?.id === c.id;
          const r = c.tier === 'championship' ? 9 : 7;
          return (
            <g
              key={c.id}
              style={{ cursor: interactive ? 'pointer' : 'default' }}
              onMouseEnter={(e) => { if (!interactive) return; setHover(c); const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect(); setPos({ x: ((c.mapX! / 960) * rect.width), y: ((c.mapY! / 600) * rect.height) }); }}
              onMouseLeave={() => interactive && setHover(null)}
              onClick={() => interactive && onSelect(c.slug)}
            >
              {isHover && <circle cx={c.mapX} cy={c.mapY} r={r + 6} fill={c.tier === 'championship' ? gold : navy} opacity={0.2} />}
              <circle cx={c.mapX} cy={c.mapY} r={r} fill={c.tier === 'championship' ? gold : navy} stroke="#fff" strokeWidth={2} opacity={isHover ? 1 : 0.9} />
              <circle cx={c.mapX} cy={c.mapY} r={r * 0.35} fill="#fff" opacity={0.95} />
            </g>
          );
        })}
      </svg>

      {/* Hover tooltip — hairline card, no shadow */}
      {hover && interactive && (
        <div style={{
          position: 'absolute', left: pos.x, top: pos.y, transform: 'translate(-50%, calc(-100% - 14px))',
          background: 'white', borderRadius: 8, border: '1px solid #e5e9ef',
          padding: '10px 12px', pointerEvents: 'none', whiteSpace: 'nowrap', zIndex: 20,
        }}>
          <div style={{ fontFamily: 'Newsreader, Georgia, serif', fontWeight: 600, fontSize: 12, color: '#071B33' }}>{hover.name}</div>
          <div style={{ fontSize: 11, color: '#5b6b7d', marginTop: 2 }}>{hover.location}</div>
          <div style={{ fontSize: 10, color: '#8b98a8', marginTop: 4 }}>{hover.affiliation}</div>
        </div>
      )}
    </div>
  );
}
