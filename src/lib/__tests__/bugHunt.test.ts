import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vercel from '../../../vercel.json';
import missingAsset from '../../../api/missing-asset';
import { isChunkLoadError, reloadOnce } from '@/lib/chunkReload';

const src = (p: string) => readFileSync(resolve(__dirname, '../../..', p), 'utf8');
type VercelJson = { rewrites: { source: string; destination: string }[]; headers: { source: string; headers: { key: string; value: string }[] }[]; functions?: Record<string, { maxDuration?: number }> };
const v = vercel as unknown as VercelJson;

function memoryStorage() {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, val: string) => { m.set(k, val); } };
}

describe('bug hunt S1: stale chunks after a redeploy', () => {
  it('recognises chunk-load errors from Chrome, Safari and Firefox, and nothing else', () => {
    expect(isChunkLoadError(new TypeError('Failed to fetch dynamically imported module: https://www.rugbycampus.org/assets/Colleges-abc123.js'))).toBe(true);
    expect(isChunkLoadError(new TypeError('Importing a module script failed.'))).toBe(true);
    expect(isChunkLoadError(new TypeError('error loading dynamically imported module'))).toBe(true);
    expect(isChunkLoadError(new Error('Unable to preload CSS for /assets/index-abc.css'))).toBe(true);
    expect(isChunkLoadError(new TypeError("Cannot read properties of undefined (reading 'map')"))).toBe(false);
    expect(isChunkLoadError(null)).toBe(false);
  });

  it('reloads once, then not again within 30 seconds, then again later', () => {
    const store = memoryStorage(); let reloads = 0; const reload = () => { reloads++; };
    expect(reloadOnce(store, reload, 1_000_000)).toBe(true);
    expect(reloadOnce(store, reload, 1_010_000)).toBe(false);
    expect(reloads).toBe(1);
    expect(reloadOnce(store, reload, 1_040_000)).toBe(true);
    expect(reloads).toBe(2);
  });

  it('never reloads when storage is blocked (no guard means a possible loop)', () => {
    let reloads = 0;
    const blocked = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } };
    expect(reloadOnce(blocked, () => { reloads++; })).toBe(false);
    expect(reloads).toBe(0);
  });

  it('every lazy page goes through the reload wrapper, inside an error boundary', () => {
    const app = src('src/App.tsx');
    expect(app).toContain("import { lazyWithReload as lazy } from '@/lib/chunkReload'");
    expect(app).not.toMatch(/import \{[^}]*\blazy\b[^}]*\} from 'react'/);
    expect(app).toMatch(/<ErrorBoundary resetKey=\{location\}>\s*<Suspense/);
    const main = src('src/main.tsx');
    expect(main).toContain("'vite:preloadError'");
    expect(main).toMatch(/<ErrorBoundary>\s*<App \/>/);
  });

  it('missing /assets/* get a plain-text 404, and the rewrite never points at index.html', () => {
    const r = v.rewrites.find((x) => x.source === '/assets/:path*');
    expect(r?.destination).toBe('/api/missing-asset');
    expect(v.rewrites.some((x) => x.destination === '/index.html')).toBe(false);
    const out: { status?: number; headers: Record<string, string>; body?: string } = { headers: {} };
    missingAsset({}, { set statusCode(n: number) { out.status = n; }, get statusCode() { return out.status ?? 200; }, setHeader: (k, val) => { out.headers[k] = val; }, end: (b) => { out.body = b; } });
    expect(out.status).toBe(404);
    expect(out.headers['Content-Type']).toMatch(/^text\/plain/);
    expect(out.headers['Cache-Control']).toBe('no-store');
    expect(out.body).not.toMatch(/<html/i);
  });
});
