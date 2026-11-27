import variants from '@/data/collegeImageVariants.json';

/**
 * Campus photos: Supabase colleges.image_url (and colleges.ts) store "/college-images/<slug>.jpg".
 * scripts/optimize-college-images.mjs writes WebP copies next to it as "<slug>-<width>.webp" and lists them in
 * collegeImageVariants.json. A path with no generated copies (a new photo, an external URL) gets no srcset,
 * so the browser just loads the stored image: nothing ever points at a WebP that doesn't exist.
 */
const VARIANTS: Record<string, { widths: number[]; ratio: number }> = variants;
const LOCAL_JPG = /^\/college-images\/([a-z0-9-]+)\.jpe?g$/i;

export interface CampusSources {
  /** "…-480.webp 480w, …-960.webp 960w, …" */
  srcSet: string;
  /** The largest WebP, for preloads and link previews that accept WebP. */
  largest: string;
  /** Height / width of the original photo. */
  ratio: number;
}

export function campusSources(url: string | undefined | null): CampusSources | null {
  const m = LOCAL_JPG.exec(url?.trim() ?? '');
  const v = m ? VARIANTS[m[1].toLowerCase()] : undefined;
  if (!m || !v?.widths.length) return null;
  const file = (w: number) => `/college-images/${m[1].toLowerCase()}-${w}.webp`;
  return { srcSet: v.widths.map((w) => `${file(w)} ${w}w`).join(', '), largest: file(v.widths[v.widths.length - 1]), ratio: v.ratio };
}

/** `sizes` hints, matched to the layouts that show campus photos. */
export const CAMPUS_SIZES = {
  /** Profile hero: full width on phones, the 6xl content column (1152px) on desktop. */
  hero: '(min-width: 1200px) 1152px, 100vw',
  /** Three-up directory grid (sm: two-up). */
  card: '(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw',
  /** Homepage lead card: half the 7xl column on desktop. */
  lead: '(min-width: 1024px) 620px, 100vw',
} as const;
