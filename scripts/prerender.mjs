// Post-build: writes a real, crawlable HTML file for every route.
// Google, Bing (= ChatGPT search), Perplexity and Claude can read the
// content without running JavaScript. React still takes over in the browser.
import { build } from 'esbuild';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');
if (!existsSync(resolve(dist, 'index.html'))) { console.error('dist/index.html missing — run vite build first'); process.exit(1); }

// Bundle the TS data modules into one importable file
const tmp = resolve(root, '.prerender-data.mjs');
await build({
  entryPoints: [resolve(root, 'scripts/data-entry.ts')],
  bundle: true, platform: 'node', format: 'esm', outfile: tmp, logLevel: 'silent',
  alias: { '@': resolve(root, 'src') },
});
const { colleges, articles, TIER_LABELS, SEASON_LABEL, SITE_URL, SITE_NAME, CONTACT_EMAIL } = await import(pathToFileURL(tmp).href);

const template = readFileSync(resolve(dist, 'index.html'), 'utf8');
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const isFull = (a) => !a.content.startsWith('Coming soon');

const ORG = {
  '@type': 'Organization', '@id': `${SITE_URL}/#org`, name: SITE_NAME, url: SITE_URL,
  logo: `${SITE_URL}/logo.png`, email: CONTACT_EMAIL,
  description: 'A free guide to US college rugby programs for aspiring players, built by a national championship-winning college coach.',
  founder: { '@type': 'Person', name: 'Hugh Johnston', jobTitle: 'Founder', description: '2023 NCR D1 National Championship-winning head coach, Notre Dame College' },
};
const WEBSITE = {
  '@type': 'WebSite', '@id': `${SITE_URL}/#website`, url: SITE_URL, name: SITE_NAME, publisher: { '@id': `${SITE_URL}/#org` },
  potentialAction: { '@type': 'SearchAction', target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/colleges?q={search_term_string}` }, 'query-input': 'required name=search_term_string' },
};

function page({ path, title, description, jsonld, body, image }) {
  const url = `${SITE_URL}${path}`;
  const fullTitle = path === '/' ? `${SITE_NAME} — Best Rugby Colleges in America, Mapped` : `${title} — ${SITE_NAME}`;
  const ld = JSON.stringify({ '@context': 'https://schema.org', '@graph': [ORG, WEBSITE, ...jsonld] });
  const head = `
    <title>${esc(fullTitle)}</title>
    <meta name="description" content="${esc(description)}" />
    <link rel="canonical" href="${url}" />
    <meta property="og:title" content="${esc(fullTitle)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${image || `${SITE_URL}/logo.png`}" />
    <meta property="og:type" content="${path.startsWith('/learn/') ? 'article' : 'website'}" />
    <meta name="twitter:card" content="summary_large_image" />
    <script type="application/ld+json">${ld}</script>`;

  let html = template
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .replace(/<meta name="description"[^>]*>/, '')
    .replace(/<meta property="og:[^"]*"[^>]*>\n?/g, '')
    .replace(/<meta name="twitter:card"[^>]*>\n?/g, '')
    .replace('</head>', `${head}\n  </head>`)
    // Static content inside #root: crawlers read it; React replaces it on load.
    .replace('<div id="root"></div>', `<div id="root"><div class="prerender" style="max-width:720px;margin:0 auto;padding:40px 20px;font-family:Georgia,serif;line-height:1.6">${body}</div></div>`);

  const dir = path === '/' ? dist : resolve(dist, path.slice(1));
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, 'index.html'), html);
  return url;
}

const urls = [];
const nav = `<nav><a href="/map">Interactive map</a> · <a href="/colleges">All colleges</a> · <a href="/learn">Guides</a> · <a href="/for-coaches">For coaches</a> · <a href="/about">About</a></nav>`;
const byTier = (t) => colleges.filter((c) => c.tier === t);

// ── Home ──
urls.push(page({
  path: '/', title: '',
  description: 'The best college rugby programs in America — 40 CRAA D1A and NCR D1 programs mapped and tiered, with coach contacts and honest recruitment guides from a national championship-winning coach.',
  jsonld: [],
  body: `<h1>Every top college rugby program in America. Mapped.</h1>
  <p>Rugby Campus is a free guide to the 40 best college rugby programs in the USA, across CRAA D1A and NCR D1. Each program is tiered on results, with coach contacts, conference, squad size, MLR draft picks and campus details. Built by Hugh Johnston, an Australian who played, captained and then coached Notre Dame College to the 2023 NCR D1 National Championship.</p>
  ${nav}
  <h2>Championship contenders (${SEASON_LABEL})</h2><ul>${byTier('championship').map((c) => `<li><a href="/colleges/${c.slug}">${esc(c.name)}</a> — ${esc(c.location)}, ${esc(c.affiliation)}</li>`).join('')}</ul>
  <h2>Guides</h2><ul>${articles.filter(isFull).map((a) => `<li><a href="/learn/${a.slug}">${esc(a.title)}</a></li>`).join('')}</ul>`,
}));

// ── Colleges index ──
urls.push(page({
  path: '/colleges', title: 'Best College Rugby Programs in America — All 40',
  description: `The 40 best college rugby programs in the USA, tiered for the ${SEASON_LABEL.split(' ·')[0]}: championship contenders, playoff-calibre and competitive top-40 programs across CRAA D1A and NCR D1.`,
  jsonld: [{ '@type': 'ItemList', name: 'Best college rugby programs in America', itemListOrder: 'Unordered', numberOfItems: colleges.length,
    itemListElement: colleges.map((c, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE_URL}/colleges/${c.slug}`, name: c.name })) }],
  body: `<h1>The 40 best college rugby programs in America</h1><p>${esc(SEASON_LABEL)}. Programs are grouped into tiers rather than ranked 1–40, because rankings change weekly and no single authority agrees on them.</p>${nav}` +
    ['championship', 'playoff', 'competitive'].map((t) => `<h2>${esc(TIER_LABELS[t])}s</h2><ul>${byTier(t).map((c) => `<li><a href="/colleges/${c.slug}">${esc(c.name)}</a> — ${esc(c.location)} · ${esc(c.affiliation)} · ${esc(c.conference)} · ${esc(c.programType)}</li>`).join('')}</ul>`).join(''),
}));

// ── Map ──
urls.push(page({ path: '/map', title: 'Interactive US College Rugby Map', description: 'Every top college rugby program in the USA on an interactive map. Zoom to the town, click a pin for the full profile, coach contact and campus details.', jsonld: [],
  body: `<h1>Interactive college rugby map</h1><p>All ${colleges.length} programs across the United States.</p>${nav}<ul>${colleges.map((c) => `<li><a href="/colleges/${c.slug}">${esc(c.name)}</a>, ${esc(c.location)}</li>`).join('')}</ul>` }));

// ── Each college ──
for (const c of colleges) {
  const facts = [['Affiliation', c.affiliation], ['Conference', c.conference], ['Tier', TIER_LABELS[c.tier]], ['Program type', c.programType],
    ['Squad size', c.playerCount ? `~${c.playerCount} players` : 'TBC'], ['MLR College Draft picks', String(c.draftPicks)], ['Enrollment', c.enrollment.toLocaleString()], ['Weather', c.weatherSummary]];
  urls.push(page({
    path: `/colleges/${c.slug}`, title: `${c.name} Rugby`, image: c.imageUrl,
    description: `${c.name} rugby program — ${c.affiliation}, ${c.conference} conference, ${TIER_LABELS[c.tier].toLowerCase()}. ${c.location}. Coach contact, squad size, MLR draft picks, weather and how to get recruited.`,
    jsonld: [{ '@type': 'CollegeOrUniversity', name: c.name, url: c.website, address: { '@type': 'PostalAddress', addressLocality: c.location.split(',')[0], addressRegion: c.state, addressCountry: 'US' },
      geo: { '@type': 'GeoCoordinates', latitude: c.lat, longitude: c.lng }, image: c.imageUrl,
      department: { '@type': 'SportsTeam', name: `${c.name} Rugby`, sport: 'Rugby Union', memberOf: { '@type': 'SportsOrganization', name: c.affiliation },
        ...(c.coachName ? { coach: { '@type': 'Person', name: c.coachName } } : {}) } },
      { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Colleges', item: `${SITE_URL}/colleges` }, { '@type': 'ListItem', position: 2, name: c.name, item: `${SITE_URL}/colleges/${c.slug}` }] }],
    body: `<h1>${esc(c.name)} Rugby</h1><p><strong>${esc(c.affiliation)} · ${esc(c.conference)} · ${esc(TIER_LABELS[c.tier])}</strong><br>${esc(c.location)}</p><p>${esc(c.description)}</p>
    ${c.badges.length ? `<p><strong>${c.badges.map(esc).join(' · ')}</strong></p>` : ''}
    <h2>The rugby</h2><dl>${facts.map(([k, v]) => `<dt><strong>${esc(k)}</strong></dt><dd>${esc(v)}</dd>`).join('')}</dl>
    ${c.achievements.length ? `<h2>Recent achievements</h2><ul>${c.achievements.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>` : ''}
    ${c.coachName ? `<h2>Head coach</h2><p>${esc(c.coachName)} — email available on the page after a free one-time signup.</p>` : ''}
    <p><a href="/colleges">All 40 programs</a> · <a href="/map">Map</a> · <a href="/about">About</a></p>`,
  }));
}

// ── Learn + articles ──
urls.push(page({ path: '/learn', title: 'College Rugby Guides', description: 'Honest guides on US college rugby: the best programs, how recruitment works, why rankings mislead, scholarships, and what happens when programs die.', jsonld: [],
  body: `<h1>How US college rugby really works</h1>${nav}<ul>${articles.map((a) => `<li><a href="/learn/${a.slug}">${esc(a.title)}</a>${isFull(a) ? '' : ' (coming soon)'}</li>`).join('')}</ul>` }));

const inline = (t) => esc(t).replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
const mdToHtml = (md) => md.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
  if (l.startsWith('## ')) return `<h2>${esc(l.slice(3))}</h2>`;
  if (l.startsWith('### ')) return `<h3>${esc(l.slice(4))}</h3>`;
  if (l.startsWith('- ')) return `<li>${inline(l.slice(2))}</li>`;
  return `<p>${inline(l)}</p>`;
}).join('\n');

for (const a of articles) {
  const faq = [];
  if (isFull(a)) {
    // Pull **Question?** / answer pairs for FAQ schema (used on the best-colleges guide)
    const lines = a.content.split('\n').map((l) => l.trim());
    for (let i = 0; i < lines.length; i++) {
      if (/^\*\*.+\?\*\*$/.test(lines[i])) { const ans = lines.slice(i + 1).find((l) => l && !l.startsWith('#') && !l.startsWith('**')); if (ans) faq.push({ '@type': 'Question', name: lines[i].replace(/\*\*/g, ''), acceptedAnswer: { '@type': 'Answer', text: ans.replace(/\*\*/g, '') } }); }
    }
  }
  urls.push(page({
    path: `/learn/${a.slug}`, title: a.title, description: a.metaDescription,
    jsonld: [{ '@type': 'Article', headline: a.title, description: a.metaDescription, datePublished: a.publishedDate, dateModified: a.publishedDate,
      author: { '@type': 'Person', name: 'Hugh Johnston', url: `${SITE_URL}/about` }, publisher: { '@id': `${SITE_URL}/#org` }, mainEntityOfPage: `${SITE_URL}/learn/${a.slug}`, image: `${SITE_URL}/logo.png` },
      ...(faq.length ? [{ '@type': 'FAQPage', mainEntity: faq }] : [])],
    body: `<p><em>${esc(a.category)} · ${esc(a.readTime)} · by Hugh Johnston</em></p><h1>${esc(a.title)}</h1><p>${esc(a.excerpt)}</p>${isFull(a) ? mdToHtml(a.content) : '<p>This guide is being written. Sign up on the page to be notified.</p>'}<p>${nav}</p>`,
  }));
}

// ── Static pages ──
for (const [path, title, description, body] of [
  ['/about', 'About Hugh & Rugby Campus', 'Built by Hugh Johnston — Notre Dame College captain and 2023 NCR D1 National Championship coach. Why Rugby Campus exists.',
    `<h1>Hugh Johnston</h1><p>An Australian who was recruited to Notre Dame College rugby in 2019, captained the side, played PR7s and club rugby in Austin, Texas, then came back as head coach and won the 2023 NCR D1 National Championship. Rugby Campus is a free guide to US college rugby — from someone who has seen recruitment from both sides.</p><p>Questions about a program? Email me at hello@rugbycampus.org — I reply personally.</p>${nav}`],
  ['/training', 'Rugby Training', 'A free rugby strength & conditioning sample program, plus individualised coaching for athletes heading to US college rugby.',
    `<h1>Arrive ready to compete</h1><p>Free off-season strength sample block, and one-on-one coaching for athletes heading to US college rugby. Coaching is a paid service.</p>${nav}`],
  ['/work-with-me', 'About Hugh & Rugby Campus', 'This page has moved. See the About page for Hugh Johnston\u2019s background and contact.',
    `<h1>This page has moved</h1><p>Looking for Hugh? Head to <a href="/about">About</a>.</p>${nav}`],
  ['/for-coaches', 'For College Coaches — Feature Your Program', 'Put your college rugby program in front of international recruits. Featured placements, verified profiles and direct enquiries from qualified players.',
    `<h1>Put your program in front of the players you actually want</h1><p>Rugby Campus is where international recruits research US college rugby. Coaches can claim and verify their profile, and feature their program to qualified players.</p>${nav}`],
]) urls.push(page({ path, title, description, jsonld: [], body }));

// ── sitemap.xml ──
const today = new Date().toISOString().slice(0, 10);
writeFileSync(resolve(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod><changefreq>${u === SITE_URL || u.endsWith('/colleges') ? 'weekly' : 'monthly'}</changefreq><priority>${u === SITE_URL ? '1.0' : u.includes('/colleges/') || u.includes('/learn/') ? '0.8' : '0.6'}</priority></url>`).join('\n')}\n</urlset>\n`);

// ── llms-full.txt (machine-readable summary of the whole site) ──
writeFileSync(resolve(dist, 'llms-full.txt'), `# ${SITE_NAME} — full site summary for AI assistants\n\n${ORG.description}\nSite: ${SITE_URL}\nFounder: Hugh Johnston — Australian, Notre Dame College captain, 2023 NCR D1 National Championship coach.\n${SEASON_LABEL}\n\n## The 40 programs\n\n${['championship', 'playoff', 'competitive'].map((t) => `### ${TIER_LABELS[t]}s\n` + byTier(t).map((c) => `- ${c.name} (${c.location}) — ${c.affiliation}, ${c.conference}, ${c.programType}; ${c.playerCount ? `~${c.playerCount} players; ` : ''}${c.draftPicks} MLR draft picks${c.badges.length ? `; ${c.badges.join(', ')}` : ''}. ${SITE_URL}/colleges/${c.slug}`).join('\n')).join('\n\n')}\n\n## Guides\n\n${articles.filter(isFull).map((a) => `- ${a.title}: ${a.metaDescription} ${SITE_URL}/learn/${a.slug}`).join('\n')}\n\n## Key facts\n- Cal won the 2026 CRAA D1A National Championship (back-to-back, 2025 and 2026), beating Navy 36–22.\n- St. Bonaventure won the 2025 NCR D1 National Championship over Queens.\n- Central Washington discontinued its men's rugby club program in April 2025.\n- Notre Dame College closed; its program (2023 NCR D1 champions) transferred to Walsh University.\n- UCLA is competing in both CRAA D1A and NCR D1 for 2026–27.\n- Major League Rugby contracted to 6 teams for 2026; the MLR College Draft continues.\n`);

console.log(`prerendered ${urls.length} pages + sitemap.xml + llms-full.txt`);
