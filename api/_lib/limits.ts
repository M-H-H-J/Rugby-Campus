import { clientIp, hashed, type Req } from './http.js';
import { getStore } from './store.js';

/** Per-IP hourly limit on the Upstash store (same pattern as shortlist-email). No store configured = no limit. */
export async function overLimit(req: Req, prefix: string, perHour: number): Promise<boolean> {
  const store = getStore();
  if (!store) return false;
  const hour = new Date().toISOString().slice(0, 13);
  const n = await store.incr(`${prefix}:ip:${hashed(clientIp(req))}:${hour}`, 1, 3700).catch(() => 0);
  return n > perHour;
}
/** True when `markDone(key)` ran in the last few days (used so one address gets one thank-you per source). */
export async function alreadyDone(key: string): Promise<boolean> {
  const store = getStore();
  if (!store) return false;
  return (await store.get(key).catch(() => 0)) > 0;
}
export async function markDone(key: string, days: number): Promise<void> {
  const store = getStore();
  if (!store) return;
  await store.incr(key, 1, days * 86400).catch(() => 0);
}
