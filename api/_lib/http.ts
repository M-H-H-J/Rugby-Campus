import { createHash, randomBytes } from 'node:crypto';

export interface Req { method?: string; headers: Record<string, string | string[] | undefined>; body?: unknown }
export interface Res { status(n: number): Res; json(b: unknown): void; setHeader(k: string, v: string | string[]): void; end(): void }

const h1 = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? '';

export function clientIp(req: Req): string {
  const xff = h1(req.headers['x-forwarded-for']);
  return (xff.split(',')[0] || h1(req.headers['x-real-ip']) || 'unknown').trim();
}
/** One-way hash so no raw IP is ever stored or logged. */
export function hashed(value: string): string {
  return createHash('sha256').update((process.env.SEARCH_HASH_SALT || 'rc-search-dev-salt-change-me') + '|' + value).digest('hex').slice(0, 24);
}
export function readCookie(req: Req, name: string): string | null {
  const raw = h1(req.headers['cookie']);
  for (const part of raw.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return null;
}
/** Returns the visitor's anonymous cookie id, setting it if missing. */
export function ensureSid(req: Req, res: Res): string {
  const existing = readCookie(req, 'rc_sid');
  if (existing && /^[a-f0-9]{32}$/.test(existing)) return existing;
  const sid = randomBytes(16).toString('hex');
  res.setHeader('Set-Cookie', `rc_sid=${sid}; Path=/; Max-Age=2592000; HttpOnly; Secure; SameSite=Lax`);
  return sid;
}
export function send(res: Res, status: number, body: unknown) {
  res.setHeader('Cache-Control', 'no-store');
  res.status(status).json(body);
}
export function readBody(req: Req): Record<string, unknown> {
  const b = req.body;
  if (typeof b === 'string') { try { return JSON.parse(b); } catch { return {}; } }
  return b && typeof b === 'object' ? (b as Record<string, unknown>) : {};
}
