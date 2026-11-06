/**
 * Hugh's own photos (he owns the rights). Files live in public/images/hugh/.
 * Run `node scripts/optimize-hugh-photos.mjs` to (re)generate them from the originals;
 * it also rewrites the width/height numbers below from the real output.
 * Each photo has a small (-sm, 400px wide) and a large (-lg, max 1600px wide) webp.
 */
export interface HughPhoto {
  key: 'headshot' | 'westPoint' | 'coachCap' | 'coachShirt';
  /** File name stem inside /images/hugh/ */
  base: string;
  /** Size of the -lg file, so the browser can reserve space (no layout shift) */
  width: number;
  height: number;
  /** Size of the -sm file */
  smWidth: number;
  alt: string;
  caption?: string;
}

export const HUGH_PHOTOS: Record<HughPhoto['key'], HughPhoto> = {
  headshot: {
    key: 'headshot', base: 'hugh-johnston-headshot', width: 1480, height: 2000, smWidth: 400,
    alt: 'Hugh Johnston, smiling, in a grey Notre Dame College Rugby polo',
  },
  westPoint: {
    key: 'westPoint', base: 'hugh-johnston-west-point-huddle', width: 1536, height: 1153, smWidth: 400,
    alt: 'Hugh Johnston talking to the Notre Dame College team in a huddle at West Point',
    caption: 'NDC vs Army · 9–9 · 30 Sep 2023',
  },
  coachCap: {
    key: 'coachCap', base: 'hugh-johnston-ndc-cap', width: 1600, height: 1066, smWidth: 400,
    alt: 'Hugh Johnston in a Notre Dame College Rugby cap and black hoodie, mid-conversation on the sideline',
  },
  coachShirt: {
    key: 'coachShirt', base: 'hugh-johnston-coach-shirt', width: 1536, height: 865, smWidth: 400,
    alt: 'Hugh Johnston, seen from behind in a COACH shirt, with the Notre Dame College team gathered on the field in front of him',
  },
};

export const photoSrc = (p: HughPhoto, size: 'sm' | 'lg') => `/images/hugh/${p.base}-${size}.webp`;
export const photoSrcSet = (p: HughPhoto) => `${photoSrc(p, 'sm')} ${p.smWidth}w, ${photoSrc(p, 'lg')} ${p.width}w`;
/** JPG copy of the headshot, used for link previews (WhatsApp / Facebook handle JPG best). */
export const HEADSHOT_OG_PATH = '/images/hugh/hugh-johnston-headshot-og.jpg';
