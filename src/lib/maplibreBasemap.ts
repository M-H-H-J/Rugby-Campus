// Loaded on demand by LeafletMap. MapLibre finds its web worker next to its own script, which a bundler moves,
// so point it at the bundled copy of the worker explicitly.
import { setWorkerUrl } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';

setWorkerUrl(workerUrl);
export { maplibreGL } from '@maplibre/maplibre-gl-leaflet';
