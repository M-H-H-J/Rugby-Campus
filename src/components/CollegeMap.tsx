import { useEffect, useRef } from 'react';
import { hasWebGL2, mountBasemap } from '@/lib/basemap';
import { BASEMAP_STYLE, type MapHandle, type MapView } from '@/lib/mapMarkup';
import type { College } from '@/data/colleges';

const VECTOR_TIMEOUT_MS = 15000;

interface Props {
  colleges: College[];
  onSelect: (slug: string) => void;
  height?: number | string;
}

/**
 * /map. Native MapLibre GL (OpenFreeMap Positron) when WebGL2 works; otherwise Leaflet with USGS raster tiles.
 * Each engine is its own chunk, so a visitor downloads only the one that runs.
 */
export default function CollegeMap({ colleges, onSelect, height = 560 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const handleRef = useRef<MapHandle | null>(null);
  const collegesRef = useRef(colleges);
  const onSelectRef = useRef(onSelect);
  // Fit the pins once; after that a tab change or data refresh keeps the visitor's zoom and pan.
  const fitted = useRef(false);
  collegesRef.current = colleges;
  onSelectRef.current = onSelect;

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    let alive = true;
    const select = (slug: string) => onSelectRef.current(slug);

    const attach = (handle: MapHandle, view: MapView | null) => {
      handleRef.current = handle;
      handle.setColleges(collegesRef.current);
      if (view) handle.setView(view);
      else if (collegesRef.current.length > 0) { handle.fit(collegesRef.current); fitted.current = true; }
    };

    const addRaster = () => {
      const view = handleRef.current?.getView() ?? null;
      handleRef.current?.destroy();
      handleRef.current = null;
      import('@/lib/rasterMap')
        .then(({ mountRasterMap }) => { if (alive) attach(mountRasterMap(container, { onSelect: select }), view); })
        .catch((err) => { if (alive) console.error('[map] Raster fallback failed to load', err); });
    };

    void mountBasemap({
      hasWebGL2,
      alive: () => alive,
      addRaster,
      addVector: async (onLateFailure) => {
        const { mountVectorMap } = await import('@/lib/vectorMap');
        if (!alive) return;
        await mountVectorMap(container, {
          style: BASEMAP_STYLE,
          timeoutMs: VECTOR_TIMEOUT_MS,
          onSelect: select,
          onCreated: (handle) => attach(handle, null),
          onLateFailure,
        });
      },
    });

    return () => {
      alive = false;
      handleRef.current?.destroy();
      handleRef.current = null;
    };
  }, []);

  useEffect(() => {
    const handle = handleRef.current;
    if (!handle) return;
    handle.setColleges(colleges);
    if (!fitted.current && colleges.length > 0) { handle.fit(colleges); fitted.current = true; }
  }, [colleges]);

  return <div ref={ref} style={{ width: '100%', height, minHeight: 400, background: '#f3f4f6' }} />;
}
