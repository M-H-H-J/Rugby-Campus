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

const SITE_ORIGINS = ['https://www.rugbycampus.org', 'https://rugbycampus.org'];
/** This project's Vercel hosts: the production alias, and previews under the rc-0753 team (rugby-campus-<hash|git-branch>-rc-0753.vercel.app). */
const PROJECT_HOST = 'rugby-campus.vercel.app';
const PREVIEW_HOST = /^rugby-campus-[a-z0-9-]+-rc-0753\.vercel\.app$/;

function originOf(value: string): URL | null {
  if (!value || value === 'null') return null;
  try { return new URL(value); } catch { return null; }
}

/**
 * True when the browser says the request came from a Rugby Campus page: the live domain, a Vercel preview of this
 * project, the host that served the request (same-origin on any preview), or API_ALLOWED_ORIGINS (comma-separated).
 */
export function isAllowedOrigin(origin: string, ownHost: string): boolean {
  const u = originOf(origin);
  if (!u) return false;
  const local = u.hostname === 'localhost' || u.hostname === '127.0.0.1';
  if (u.protocol !== 'https:' && !(local && u.protocol === 'http:')) return false;
  const extra = (process.env.API_ALLOWED_ORIGINS || '').split(',').map((s) => s.trim().replace(/\/$/, '')).filter(Boolean);
  if (SITE_ORIGINS.includes(u.origin) || extra.includes(u.origin)) return true;
  if (u.protocol === 'https:' && (u.hostname === PROJECT_HOST || PREVIEW_HOST.test(u.hostname))) return true;
  return !!ownHost && u.host === ownHost.toLowerCase();
}

/**
 * Every /api POST goes through this first. Requiring application/json forces a CORS preflight, which fails from
 * other sites, so a hidden form or no-cors fetch elsewhere can't drive these endpoints from its visitors' browsers.
 * Returns true when it has already answered (the handler must stop).
 */
export function rejectRequest(req: Req, res: Res): boolean {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); send(res, 405, { ok: false, reason: 'method', message: 'POST only' }); return true; }
  const type = h1(req.headers['content-type']).toLowerCase();
  if (!type.startsWith('application/json')) { send(res, 415, { ok: false, reason: 'content_type', message: 'Send JSON.' }); return true; }
  // "Origin: null" (privacy extensions, no-referrer contexts) is treated as missing, so a valid Referer still counts.
  const rawOrigin = h1(req.headers['origin']);
  const origin = rawOrigin === 'null' ? '' : rawOrigin;
  const referer = h1(req.headers['referer']);
  const claimed = origin || (originOf(referer)?.origin ?? '');
  const ownHost = h1(req.headers['x-forwarded-host']) || h1(req.headers['host']);
  if ((origin || referer) && !isAllowedOrigin(claimed, ownHost)) { send(res, 403, { ok: false, reason: 'origin', message: 'Not allowed.' }); return true; }
  return false;
}

export function readBody(req: Req): Record<string, unknown> {
  const b = req.body;
  if (typeof b === 'string') { try { return JSON.parse(b); } catch { return {}; } }
  return b && typeof b === 'object' ? (b as Record<string, unknown>) : {};
}
