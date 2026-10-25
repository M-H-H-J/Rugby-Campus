// Tiny counter store used for rate limits and the monthly spend cap.
// production: Upstash Redis REST (works with Vercel's Upstash/KV integration). dev/tests: memory.
export interface Store {
  kind: 'upstash' | 'memory';
  /** increment by n, set expiry (seconds) on first create; returns the new value */
  incr(key: string, n: number, ttlSeconds: number): Promise<number>;
  get(key: string): Promise<number>;
}

const mem = new Map<string, { v: number; exp: number }>();
export const memoryStore: Store = {
  kind: 'memory',
  async incr(key, n, ttl) {
    const now = Date.now(); const cur = mem.get(key);
    if (!cur || cur.exp < now) { mem.set(key, { v: n, exp: now + ttl * 1000 }); return n; }
    cur.v += n; return cur.v;
  },
  async get(key) { const c = mem.get(key); return c && c.exp >= Date.now() ? c.v : 0; },
};
export function resetMemoryStore() { mem.clear(); }

function upstash(url: string, token: string): Store {
  const call = async (cmds: (string | number)[][]) => {
    const r = await fetch(url.replace(/\/$/, '') + '/pipeline', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(cmds), signal: AbortSignal.timeout(3000) });
    if (!r.ok) throw new Error('store ' + r.status);
    return (await r.json()) as { result: unknown }[];
  };
  return {
    kind: 'upstash',
    async incr(key, n, ttl) {
      const out = await call([['INCRBY', key, n], ['EXPIRE', key, ttl, 'NX']]);
      return Number(out[0].result);
    },
    async get(key) { const out = await call([['GET', key]]); return Number(out[0].result ?? 0); },
  };
}

/** null = no persistent store configured (search AI stays off, unless SEARCH_ALLOW_MEMORY_STORE=true) */
export function getStore(): Store | null {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (url && token) return upstash(url, token);
  if (process.env.SEARCH_ALLOW_MEMORY_STORE === 'true') return memoryStore;
  return null;
}
