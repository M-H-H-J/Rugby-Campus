// vercel.json rewrites /assets/* here only when no built file matches (rewrites run after the filesystem).
// A stale tab asking for an old hashed chunk gets a plain 404, never index.html served as JavaScript.
interface RawRes { statusCode: number; setHeader(k: string, v: string): void; end(body?: string): void }

export default function handler(_req: unknown, res: RawRes) {
  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  // A function's Cache-Control wins over vercel.json, so the /assets immutable rule never reaches this 404.
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('CDN-Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex');
  res.end('Not found');
}
