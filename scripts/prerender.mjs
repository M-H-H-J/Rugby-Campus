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

// Bundle the TS data modules (and the server-rendered pages) into importable files
const tmp = resolve(root, '.prerender-data.mjs');
const pagesTmp = resolve(root, '.prerender-pages.mjs');
const shared = { bundle: true, platform: 'node', format: 'esm', logLevel: 'silent', alias: { '@': resolve(root, 'src') } };
await build({ ...shared, entryPoints: [resolve(root, 'scripts/data-entry.ts')], outfile: tmp });
await build({ ...shared, entryPoints: [resolve(root, 'scripts/page-entry.tsx')], outfile: pagesTmp, jsx: 'automatic', define: { 'process.env.NODE_ENV': '"production"' },
  // react-dom/server is CommonJS and requires Node built-ins.
  banner: { js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);" } });
const { renderPage, PRIVACY_UPDATED, PRIVACY_TITLE, PRIVACY_DESCRIPTION } = await import(pathToFileURL(pagesTmp).href);
const { colleges, articles, formatGuideDate, collegeUpdated, HOME_HEADLINE, homeDescription, MONEY_LINE, TIER_LABELS, TIER_ORDER, TIER_SUBLINE, SEASON_LABEL, SITE_URL, SITE_NAME, CONTACT_EMAIL, costText, climateText, weatherSentence, climateFromTemps, airportRows, rugbyAidText, SAFETY_TEXT, SAFETY_URL, CAMPUS_FEEL_LABEL, SIZE_LABEL, sizeBand, isVeryHot, VERY_HOT_LABEL, sizeText, mlrSummary, visibleBadges } = await import(pathToFileURL(tmp).href);
const searchFacts = JSON.parse(readFileSync(resolve(root, 'src/data/collegeSearchFacts.json'), 'utf8')).colleges;

const template = readFileSync(resolve(dist, 'index.html'), 'utf8');
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const isFull = (a) => !a.content.startsWith('Coming soon');

const ORG = {
  '@type': 'Organization', '@id': `${SITE_URL}/#org`, name: SITE_NAME, url: SITE_URL,
  logo: `${SITE_URL}/logo.png`, email: CONTACT_EMAIL,
  description: 'A free guide to US college rugby programs for aspiring players, built by a national championship-winning college coach.',
  founder: { '@type': 'Person', name: 'Hugh Johnston', jobTitle: 'Founder', image: `${SITE_URL}/images/hugh/hugh-johnston-headshot-og.jpg`, description: '2023 NCR D1 National Championship-winning head coach, Notre Dame College' },
};
const WEBSITE = {
  '@type': 'WebSite', '@id': `${SITE_URL}/#website`, url: SITE_URL, name: SITE_NAME, publisher: { '@id': `${SITE_URL}/#org` },
  potentialAction: { '@type': 'SearchAction', target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/colleges?find={search_term_string}` }, 'query-input': 'required name=search_term_string' },
};

// Social apps (WhatsApp, Facebook) often ignore a short path like /college-images/x.jpg, so always give a full address.
const absUrl = (u) => (!u ? `${SITE_URL}/logo.png` : /^https?:\/\//i.test(u) ? u : `${SITE_URL}${u.startsWith('/') ? '' : '/'}${u}`);

// The same top bar the app draws, so the first paint looks like the page that replaces it.
const NAV_LINKS = [['/', 'Home'], ['/map', 'Map'], ['/colleges', 'Colleges'], ['/learn', 'Learn'], ['/training', 'Training'], ['/about', 'About']];
const header = `<header class="prerender-header"><div class="prerender-header-inner"><a href="/" aria-label="Rugby Campus home"><img src="/logo.png" alt="Rugby Campus" width="97" height="36" /></a><nav aria-label="Main">${NAV_LINKS.map(([h, l]) => `<a href="${h}">${l}</a>`).join('')}</nav></div></header>`;

/** fullTitle: the whole <title>, used as given (guides pass their metaTitle). noindex pages get no canonical.
 *  lastmod: the date the page's content last really changed (sitemap). app: body is server-rendered React, laid out like the live page. */
function page({ path, title, fullTitle: givenTitle, description, jsonld, body, image, noindex = false, file, lastmod, app = false }) {
  const url = path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`;
  const fullTitle = givenTitle ?? (path === '/' ? `${SITE_NAME} | Best Rugby Colleges in America, Mapped` : `${title} | ${SITE_NAME}`);
  const ld = JSON.stringify({ '@context': 'https://schema.org', '@graph': [ORG, WEBSITE, ...jsonld] });
  const head = `
    <title>${esc(fullTitle)}</title>
    <meta name="description" content="${esc(description)}" />
    ${noindex ? '<meta name="robots" content="noindex" />' : `<link rel="canonical" href="${url}" />`}
    <meta property="og:title" content="${esc(fullTitle)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${absUrl(image)}" />
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
    .replace('<div id="root"></div>', `<div id="root">${header}${app ? `<main class="pt-14">${body}</main>` : `<main class="prerender">${body}</main>`}</div>`);

  if (file) { writeFileSync(resolve(dist, file), html); return null; }
  const dir = path === '/' ? dist : resolve(dist, path.slice(1));
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, 'index.html'), html);
  return url;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const latest = (dates) => dates.filter(Boolean).sort().at(-1);
const urls = [];
let pages = 0;
const add = (opts) => {
  const u = page(opts); pages++;
  if (!u) return;
  if (!ISO_DATE.test(opts.lastmod ?? '')) throw new Error(`prerender: ${opts.path} needs a real lastmod date, got ${opts.lastmod}`);
  urls.push({ url: u, lastmod: opts.lastmod });
};
const DATA_LASTMOD = latest(colleges.map((c) => collegeUpdated(c.slug)));
const GUIDES_LASTMOD = latest(articles.map((a) => a.updatedDate));
// Static pages: bump the date when the page's own words change.
const PAGE_LASTMOD = { '/': '2026-11-27', '/about': '2026-11-20', '/training': '2026-11-27', '/for-coaches': '2026-11-27' };
const nav = `<nav><a href="/map">Interactive map</a> · <a href="/colleges">All colleges</a> · <a href="/learn">Guides</a> · <a href="/for-coaches">For coaches</a> · <a href="/about">About</a> · <a href="/privacy">Privacy</a></nav>`;
const byTier = (t) => colleges.filter((c) => c.tier === t);

// ── Home ──
add({
  path: '/', title: '', lastmod: latest([PAGE_LASTMOD['/'], DATA_LASTMOD, GUIDES_LASTMOD]),
  description: homeDescription(colleges.length),
  jsonld: [],
  body: `<h1>${esc(HOME_HEADLINE)}</h1>
  <p>Rugby Campus is a free guide to men's college rugby programs in the USA: ${colleges.length} men's programs across CRAA D1A and NCR D1. Each program is tiered on results, with coach emails (free with an email signup), conference, squad size, and MLR draft and playing numbers (drafted and played are counted separately), and campus details. Built by Hugh Johnston, an Australian who played, captained and then coached Notre Dame College to the 2023 NCR D1 National Championship.</p>
  ${nav}
  ${TIER_ORDER.map((t) => `<h2>${esc(TIER_LABELS[t])}${t === 'championship' ? ' (strongest)' : ''}: ${esc(SEASON_LABEL)}</h2><ul>${byTier(t).map((c) => `<li><a href="/colleges/${c.slug}">${esc(c.name)}</a> — ${esc(c.location)}, ${esc(c.affiliation)}</li>`).join('')}</ul>`).join('')}
  <h2>Guides</h2><ul>${articles.filter(isFull).map((a) => `<li><a href="/learn/${a.slug}">${esc(a.title)}</a></li>`).join('')}</ul>`,
});

// ── Colleges index ──
add({
  path: '/colleges', title: 'Best College Rugby Programs in America', lastmod: DATA_LASTMOD,
  description: `Best college rugby programs in America for ${SEASON_LABEL.split(' ·')[0].replace(' season', '')}, grouped into Tier 1 to Tier 4 across CRAA D1A and NCR D1, with coach contacts and campus facts.`,
  jsonld: [{ '@type': 'ItemList', name: 'College rugby programs in America', itemListOrder: 'Unordered', numberOfItems: colleges.length,
    itemListElement: colleges.map((c, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE_URL}/colleges/${c.slug}`, name: c.name })) }],
  body: `<h1>College rugby programs in America</h1><p>${esc(SEASON_LABEL)}. Programs are grouped into Tier 1 (strongest) to Tier 4 rather than ranked 1 to 50, because rankings change weekly and no single authority agrees on them.</p>${nav}<p>${colleges.length} men's D1 rugby programs. Same division, very different standard.</p><p>This list is men's rugby. Women's programs aren't up yet.</p>` +
    TIER_ORDER.map((t) => `<h2>${esc(TIER_LABELS[t])}</h2><p>${esc(TIER_SUBLINE[t])}</p><ul>${byTier(t).map((c) => `<li><a href="/colleges/${c.slug}">${esc(c.name)}</a> — ${esc(c.location)} · ${esc(c.affiliation)} · ${esc(c.conference)}${c.programType ? ` · ${esc(c.programType)}` : ''}</li>`).join('')}</ul>`).join(''),
});

// ── Map ──
add({ path: '/map', title: 'Interactive US College Rugby Map', lastmod: DATA_LASTMOD, description: `${colleges.length} US college rugby programs on an interactive map. Zoom to the town, click a pin for the full profile, coach contact and campus details.`, jsonld: [],
  body: `<h1>Interactive college rugby map</h1><p>These are programs worth a look, not every college with a team.</p><div class="prerender-map" aria-hidden="true"></div>${nav}<ul>${colleges.map((c) => `<li><a href="/colleges/${c.slug}">${esc(c.name)}</a>, ${esc(c.location)}</li>`).join('')}</ul>` });

// Cost / study / campus facts from the search data (same numbers the college page shows)
function factsHtml(slug) {
  const f = searchFacts[slug];
  if (!f) return '';
  const cost = costText(f);
  const rows = [['Cost per year', cost.askCoach ? 'Ask the coach' : `${cost.headline}, ${cost.sub.charAt(0).toLowerCase()}${cost.sub.slice(1)}`]];
  if (f.campus_feel && CAMPUS_FEEL_LABEL[f.campus_feel]) rows.push(['Campus feel', CAMPUS_FEEL_LABEL[f.campus_feel]]);
  const band = sizeBand(f.enrollment_undergrad);
  if (band) rows.push(['Size', sizeText(f)]);
  for (const row of airportRows(f)) rows.push(row);
  const climate = climateText(f);
  if (climate) rows.push(['Climate', climate + (isVeryHot(f) ? `. ${VERY_HOT_LABEL}.` : '')]);
  rows.push(['Rugby aid', rugbyAidText(f)]);
  if (f.big_sport_tag) rows.push(['Athletics', f.big_sport_tag]);
  if (f.intl_warning) rows.push(['International students', f.intl_warning]);
  return `<h2>Cost, study and campus</h2><dl>${rows.map(([k, v]) => `<dt><strong>${esc(k)}</strong></dt><dd>${esc(v)}</dd>`).join('')}</dl>` +
    `<p><strong>Campus safety.</strong> <a href="${esc(SAFETY_URL)}" rel="noopener noreferrer" target="_blank">${esc(SAFETY_TEXT)}</a> (US Department of Education).</p>` +
    (f.majors_top?.length ? `<p><strong>Biggest fields of study:</strong> ${f.majors_top.map(esc).join(', ')}</p>` : '');
}

// ── Each college ──
for (const c of colleges) {
  const mlr = mlrSummary(c);
  const facts = [['Affiliation', c.affiliation], ['Conference', c.conference], ['Tier', TIER_LABELS[c.tier]], ...(c.programType ? [['Program type', c.programType]] : []),
    ...(c.playerCountNote || c.playerCount ? [['Squad size', c.playerCountNote || `~${c.playerCount} players`]] : []),
    ['Drafted in the MLR College Draft (2020–26)', mlr.draftedText],
    ['Played at least one MLR match (confirmed)', mlr.playedText],
    ...(climateFromTemps(c.monthlyTemps) ? [['Weather', weatherSentence(climateFromTemps(c.monthlyTemps))]] : [])];
  add({
    path: `/colleges/${c.slug}`, title: `${c.name} Rugby`, image: c.imageUrl, lastmod: collegeUpdated(c.slug),
    description: `${c.name} rugby: ${c.affiliation}, ${c.conference}, ${TIER_LABELS[c.tier]}. Coach contact, squad size, MLR numbers, weather and campus facts.`,
    jsonld: [{ '@type': 'CollegeOrUniversity', name: c.name, url: c.website, address: { '@type': 'PostalAddress', addressLocality: c.location.split(',')[0], addressRegion: c.state, addressCountry: 'US' },
      geo: { '@type': 'GeoCoordinates', latitude: c.lat, longitude: c.lng }, image: absUrl(c.imageUrl),
      department: { '@type': 'SportsTeam', name: `${c.name} Rugby`, sport: 'Rugby Union', memberOf: { '@type': 'SportsOrganization', name: c.affiliation },
        ...(c.coachName ? { coach: { '@type': 'Person', name: c.coachName } } : {}) } },
      { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Colleges', item: `${SITE_URL}/colleges` }, { '@type': 'ListItem', position: 2, name: c.name, item: `${SITE_URL}/colleges/${c.slug}` }] }],
    body: `<h1>${esc(c.name)} Rugby</h1><p><strong>${esc(c.affiliation)} · ${esc(c.conference)} · ${esc(TIER_LABELS[c.tier])}</strong><br>${esc(c.location)}</p><p>${esc(c.description)}</p>
    ${visibleBadges(c.badges).length ? `<p><strong>${visibleBadges(c.badges).map(esc).join(' · ')}</strong></p>` : ''}
    <h2>The rugby</h2><dl>${facts.map(([k, v]) => `<dt><strong>${esc(k)}</strong></dt><dd>${esc(v)}</dd>`).join('')}</dl>
    ${mlr.drafted > 0 ? `<p>${esc(mlr.breakdown)}${c.mlrNote ? ` ${esc(c.mlrNote)}` : ''} ${esc(mlr.explainer)}</p><p>${esc(mlr.sources)}</p>` : ''}
    <p><a href="mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Correction: ${c.name}`)}&amp;body=${encodeURIComponent(`I spotted something on ${SITE_URL}/colleges/${c.slug}:\n\n`)}">Spot something wrong? Tell us</a></p>
    ${factsHtml(c.slug)}
    ${c.achievements.length ? `<h2>Recent achievements</h2><ul>${c.achievements.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>` : ''}
    ${c.coachName ? `<h2>Head coach</h2><p>${esc(c.coachName)}.${c.coachEmail ? ' Email available on the page after a free one-time signup.' : ''}</p>` : ''}
    ${c.recruitmentFormUrl ? `<p><a href="${esc(c.recruitmentFormUrl)}" rel="noopener noreferrer" target="_blank">Recruitment form</a></p>` : ''}
    <p><a href="/colleges">All programs</a> · <a href="/map">Map</a> · <a href="/about">About</a></p>`,
  });
}

// ── Learn + articles ──
add({ path: '/learn', title: 'College Rugby Guides', description: 'Guides on US college rugby: the best programs, how recruitment works, why rankings mislead, scholarships, and what happens when programs die.', jsonld: [],
  lastmod: GUIDES_LASTMOD, app: true, body: renderPage('/learn') });

// Mirrors renderContent in src/pages/ArticlePage.tsx: links, **bold**, *italic*, "- " and "1. " lists.
const inline = (t) => esc(t).replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');
const OL_ITEM = /^\d+\.\s/;
const mdToHtml = (md) => {
  const out = [];
  let open = null;
  for (const l of md.split('\n').map((x) => x.trim()).filter(Boolean)) {
    const kind = l.startsWith('- ') ? 'ul' : OL_ITEM.test(l) ? 'ol' : null;
    if (kind !== open) {
      if (open) out.push(`</${open}>`);
      if (kind) out.push(`<${kind}>`);
      open = kind;
    }
    if (kind === 'ul') out.push(`<li>${inline(l.slice(2))}</li>`);
    else if (kind === 'ol') out.push(`<li>${inline(l.replace(OL_ITEM, ''))}</li>`);
    else if (l.startsWith('## ')) out.push(`<h2>${esc(l.slice(3))}</h2>`);
    else if (l.startsWith('### ')) out.push(`<h3>${esc(l.slice(4))}</h3>`);
    else out.push(`<p>${inline(l)}</p>`);
  }
  if (open) out.push(`</${open}>`);
  return out.join('\n');
};

for (const a of articles) {
  const faq = [];
  if (isFull(a)) {
    // Pull **Question?** / answer pairs for FAQ schema (used on the best-colleges guide)
    const lines = a.content.split('\n').map((l) => l.trim());
    for (let i = 0; i < lines.length; i++) {
      if (/^\*\*.+\?\*\*$/.test(lines[i])) { const ans = lines.slice(i + 1).find((l) => l && !l.startsWith('#') && !l.startsWith('**')); if (ans) faq.push({ '@type': 'Question', name: lines[i].replace(/\*\*/g, ''), acceptedAnswer: { '@type': 'Answer', text: ans.replace(/\*\*/g, '') } }); }
    }
  }
  add({
    path: `/learn/${a.slug}`, title: a.title, fullTitle: a.metaTitle, description: a.metaDescription,
    lastmod: a.updatedDate,
    jsonld: [{ '@type': 'Article', headline: a.title, description: a.metaDescription, datePublished: a.publishedDate, dateModified: a.updatedDate,
      author: { '@type': 'Person', name: 'Hugh Johnston', url: `${SITE_URL}/about` }, publisher: { '@id': `${SITE_URL}/#org` }, mainEntityOfPage: `${SITE_URL}/learn/${a.slug}`, image: `${SITE_URL}/logo.png` },
      ...(faq.length ? [{ '@type': 'FAQPage', mainEntity: faq }] : [])],
    body: `<p><em>${esc(a.category)} · ${esc(a.readTime)}</em></p><h1>${esc(a.title)}</h1><p>${esc(a.excerpt)}</p><p>By <a href="/about">Hugh Johnston</a> · Updated <time datetime="${a.updatedDate}">${esc(formatGuideDate(a.updatedDate))}</time></p>${isFull(a) ? mdToHtml(a.content) : '<p>This guide is being written. Sign up on the page to be notified.</p>'}<p>${nav}</p>`,
  });
}

// ── Static pages: the real components, server-rendered ──
for (const [path, title, description, image] of [
  ['/about', 'About Hugh & Rugby Campus', 'Built by Hugh Johnston, Notre Dame College captain and 2023 NCR D1 National Championship coach. Why Rugby Campus exists.', '/images/hugh/hugh-johnston-headshot-og.jpg'],
  ['/training', 'Rugby Training', 'A free rugby strength & conditioning sample program, plus paid one-on-one coaching for high-school players getting ready for US college rugby.'],
  ['/for-coaches', 'For College Coaches: Verify or Feature Your Program', 'Verify your program profile for free, or ask about a featured listing. Rugby Campus is a free guide to US college rugby for international players and their parents.'],
]) add({ path, title, description, jsonld: [], body: renderPage(path), image, lastmod: PAGE_LASTMOD[path], app: true });
add({ path: '/privacy', title: PRIVACY_TITLE, description: PRIVACY_DESCRIPTION, jsonld: [], body: renderPage('/privacy'), lastmod: PRIVACY_UPDATED, app: true });

// ── 404 (served by Vercel with status 404 for any unknown path; no canonical, noindex) ──
add({ path: '/404', file: '404.html', noindex: true, fullTitle: `Page not found | ${SITE_NAME}`, description: 'This page does not exist on Rugby Campus.', jsonld: [],
  body: `<h1>Page not found</h1><p>That page doesn't exist, or it has moved.</p><p><a href="/colleges">All colleges</a> · <a href="/map">Map</a> · <a href="/learn">Guides</a></p>` });

// ── sitemap.xml ──
writeFileSync(resolve(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(({ url: u, lastmod }) => `  <url><loc>${u}</loc><lastmod>${lastmod}</lastmod><changefreq>${u === `${SITE_URL}/` || u.endsWith('/colleges') ? 'weekly' : 'monthly'}</changefreq><priority>${u === `${SITE_URL}/` ? '1.0' : u.includes('/colleges/') || u.includes('/learn/') ? '0.8' : '0.6'}</priority></url>`).join('\n')}\n</urlset>\n`);

// ── llms-full.txt (machine-readable summary of the whole site) ──
// The MLR count comes from mlrSummary only: the "N drafted into MLR" badge is dropped (visibleBadges) so it isn't said twice.
const honours = (c) => {
  const extra = visibleBadges(c.badges).filter((b) => !c.achievements.some((a) => a.includes(b)));
  return [...extra, ...c.achievements];
};
const mlrText = (c) => {
  const m = mlrSummary(c);
  if (m.drafted === 0) return 'no MLR draftees found';
  return `${m.drafted} drafted in the MLR College Draft 2020–26 (${m.played ? `${m.played} confirmed played an MLR match` : 'none confirmed played an MLR match'})`;
};
const programLine = (c) => {
  const parts = [[c.affiliation, c.conference, c.programType].filter(Boolean).join(', ')];
  if (c.playerCount) parts.push(`~${c.playerCount} players`);
  parts.push(mlrText(c));
  const h = honours(c);
  if (h.length) parts.push(h.join('; '));
  return `- ${c.name} (${c.location}) — ${parts.join('; ')}. ${SITE_URL}/colleges/${c.slug}`;
};
writeFileSync(resolve(dist, 'llms-full.txt'), [
  `# ${SITE_NAME} — full site summary for AI assistants`,
  '',
  ORG.description,
  `Site: ${SITE_URL}`,
  'Founder: Hugh Johnston — Australian, Notre Dame College captain, 2023 NCR D1 National Championship coach.',
  SEASON_LABEL,
  `Coverage: ${colleges.length} men's college rugby programs. Women's programs are not listed yet.`,
  `${MONEY_LINE} Coach email addresses are shown after a free one-time email signup; everything else is open.`,
  `Privacy: ${SITE_URL}/privacy`,
  '',
  '## The programs',
  '',
  TIER_ORDER.map((t) => [`### ${TIER_LABELS[t]}: ${TIER_SUBLINE[t]}`, ...byTier(t).map(programLine)].join('\n')).join('\n\n'),
  '',
  '## Guides',
  '',
  articles.filter(isFull).map((a) => `- ${a.title}: ${a.metaDescription} ${SITE_URL}/learn/${a.slug}`).join('\n'),
  '',
  '## Key facts',
  "- Men's rugby is not an NCAA sport anywhere. The NCAA lists varsity women's rugby as an Emerging Sport for Women.",
  '- Cal won the 2026 CRAA D1A National Championship (back-to-back, 2025 and 2026), beating Navy 36–22.',
  '- St. Bonaventure won the 2025 NCR D1 National Championship over Queens.',
  "- Central Washington ended varsity men's and women's rugby in April 2025 (effective at the end of 2024–25); a student-run men's club restarted in fall 2025.",
  '- Notre Dame College closed; its program (2023 NCR D1 champions) transferred to Walsh University.',
  '- UCLA plays both CRAA D1A and NCR D1 for 2026–27.',
  '- Major League Rugby contracted to 6 teams for 2026; the MLR College Draft continues.',
  '',
].join('\n'));

// pages = every HTML file written (the sitemap routes plus 404.html).
console.log(`prerendered ${pages} pages + sitemap.xml + llms-full.txt`);
