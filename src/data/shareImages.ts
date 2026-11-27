/**
 * 1200×630 link-preview cards in public/og/, made by scripts/make-og-images.mjs (re-run it after changing a card here
 * or a guide title). College profiles use their campus photo instead. Anything not listed falls back to the site card.
 */
export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;
export const SITE_OG = '/og/rugby-campus.jpg';

export interface ShareCard {
  /** Route path, e.g. "/learn" */
  path: string;
  file: string;
  kicker: string;
  headline: string;
  /** Alt text for og:image:alt and twitter:image:alt */
  alt: string;
  /** "map" draws the 50 programs on the US map; "hugh" uses Hugh's headshot (About only). */
  art: 'map' | 'hugh';
}

const card = (path: string, file: string, kicker: string, headline: string, art: ShareCard['art'] = 'map'): ShareCard =>
  ({ path, file: `/og/${file}.jpg`, kicker, headline, art, alt: `Rugby Campus: ${headline}` });

export const PAGE_CARDS: ShareCard[] = [
  card('/', 'rugby-campus', "Men's US college rugby · 2026–27", 'Every top college rugby program in America. Mapped.'),
  card('/colleges', 'colleges', 'Tier 1 to Tier 4 · CRAA D1A and NCR D1', 'College rugby programs in America'),
  card('/map', 'map', 'Interactive map', 'Every program on the map, down to the town'),
  card('/learn', 'learn', 'Guides', 'How US college rugby works'),
  card('/training', 'training', 'Training', 'Arrive ready to compete'),
  card('/for-coaches', 'for-coaches', 'For college coaches', 'Verify your program, or ask about a featured listing'),
  card('/about', 'about', 'About Rugby Campus', 'The resource I needed at 17.', 'hugh'),
  card('/privacy', 'privacy', 'Privacy', 'Privacy, in plain English'),
  card('/ai-info', 'ai-info', 'For AI assistants', 'What Rugby Campus is, and which page to cite'),
];

/** Guides pass their own card (only real guides have one, so a mistyped slug never points at a missing file). */
export const guideCard = (a: { slug: string; title: string }) => ({ file: `/og/learn-${a.slug}.jpg`, alt: `Rugby Campus guide: ${a.title}` });

/** The share card for a route path; the site card for anything without its own. */
export function shareCardFor(path: string): Pick<ShareCard, 'file' | 'alt'> {
  const p = path === '/' ? '/' : path.replace(/\/$/, '');
  return PAGE_CARDS.find((c) => c.path === p) ?? PAGE_CARDS[0];
}
