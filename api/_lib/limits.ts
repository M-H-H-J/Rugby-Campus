import { clientIp, hashed, type Req } from './http.js';
import { getStore, memoryStore, type Store } from './store.js';

/** Without Upstash/KV each warm function instance keeps its own counters, so the fallback is stricter. */
export const FALLBACK_ALL_PER_HOUR = 30;
let warned = false;
export function resetLimitWarning() { warned = false; }

function limitStore(): { store: Store; fallback: boolean } {
  const store = getStore();
  if (store) return { store, fallback: false };
  if (!warned) {
    warned = true;
    console.warn('RATE_LIMIT_FALLBACK: no Upstash/KV store configured (UPSTASH_REDIS_REST_URL / KV_REST_API_URL). '
      + 'Email endpoints are using in-memory limits per function instance. Add Upstash Redis in Vercel to make them reliable.');
  }
  return { store: memoryStore, fallback: true };
}

/** Per-IP hourly limit. Uses Upstash when configured, otherwise a stricter in-memory limit plus an hourly cap for all mail. */
export async function overLimit(req: Req, prefix: string, perHour: number): Promise<boolean> {
  const { store, fallback } = limitStore();
  const hour = new Date().toISOString().slice(0, 13);
  const n = await store.incr(`${prefix}:ip:${hashed(clientIp(req))}:${hour}`, 1, 3700).catch(() => 0);
  if (!fallback) return n > perHour;
  if (n > Math.max(1, Math.floor(perHour / 2))) return true;
  // Only requests within their own IP limit count toward the shared hourly cap.
  const all = await store.incr(`mail:all:${hour}`, 1, 3700).catch(() => 0);
  return all > FALLBACK_ALL_PER_HOUR;
}
/** True when `markDone(key)` ran in the last few days (used so one address gets one thank-you per source). */
export async function alreadyDone(key: string): Promise<boolean> {
  const { store } = limitStore();
  return (await store.get(key).catch(() => 0)) > 0;
}
export async function markDone(key: string, days: number): Promise<void> {
  const { store } = limitStore();
  await store.incr(key, 1, days * 86400).catch(() => 0);
}
