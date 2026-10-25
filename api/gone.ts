// Retired college pages (see RETIRED_SLUGS in src/lib/useColleges.ts) are rewritten here by vercel.json,
// so they answer with a real 404 instead of a 200 "College not found" page. No env vars, no data.
interface RawRes { statusCode: number; setHeader(k: string, v: string): void; end(body?: string): void }

const HTML = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>No longer listed — Rugby Campus</title></head>
<body style="font-family:system-ui,sans-serif;max-width:40rem;margin:4rem auto;padding:0 1.25rem;color:#071B33;line-height:1.6">
<h1 style="font-size:1.6rem">This program is no longer listed</h1>
<p>Rugby Campus no longer lists this college. <a href="/colleges" style="color:#00458c">See all programs</a>.</p>
</body></html>`;

export default function handler(_req: unknown, res: RawRes) {
  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('X-Robots-Tag', 'noindex');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.end(HTML);
}
