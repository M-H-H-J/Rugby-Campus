// Temporary site-wide password lock (Vercel Routing Middleware).
// Locked only while the SITE_PASSWORD env var is set in Vercel.
// To unlock the site: delete SITE_PASSWORD in Vercel and redeploy.
// Any username is accepted; only the password is checked.

export const config = {
  // Every path: pages, /api/*, /assets/*, images, robots.txt, sitemap.
  matcher: '/:path*',
};

const REALM = 'Rugby Campus';

async function sha256(text: string): Promise<Uint8Array> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return new Uint8Array(buf);
}

// Constant-time compare: hash both sides to equal length, then XOR every byte.
async function safeEqual(a: string, b: string): Promise<boolean> {
  const [ha, hb] = await Promise.all([sha256(a), sha256(b)]);
  let diff = 0;
  for (let i = 0; i < ha.length; i++) diff |= ha[i] ^ hb[i];
  return diff === 0;
}

function passwordFromHeader(header: string | null): string | null {
  if (!header || !header.toLowerCase().startsWith('basic ')) return null;
  try {
    const decoded = atob(header.slice(6).trim());
    const colon = decoded.indexOf(':');
    return colon === -1 ? null : decoded.slice(colon + 1);
  } catch {
    return null;
  }
}

export default async function middleware(request: Request): Promise<Response | undefined> {
  const expected = process.env.SITE_PASSWORD;
  if (!expected) return undefined; // no password set => site open

  const given = passwordFromHeader(request.headers.get('authorization'));
  if (given !== null && (await safeEqual(given, expected))) {
    return undefined; // correct => continue to the normal site
  }

  return new Response('Password required.', {
    status: 401,
    headers: {
      'WWW-Authenticate': `Basic realm="${REALM}", charset="UTF-8"`,
      'X-Robots-Tag': 'noindex, nofollow',
      'Cache-Control': 'no-store',
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
