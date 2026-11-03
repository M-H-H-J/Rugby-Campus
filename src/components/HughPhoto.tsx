import { HUGH_PHOTOS, photoSrc, photoSrcSet, type HughPhoto as Photo } from '@/lib/hughPhotos';

interface Props {
  photo: keyof typeof HUGH_PHOTOS;
  /** Responsive sizes hint, e.g. "(min-width: 1024px) 480px, 100vw" */
  sizes: string;
  /** Only the first image on a page should be eager. Everything else lazy-loads. */
  eager?: boolean;
  className?: string;
  imgClassName?: string;
}

/** One of Hugh's photos with width/height set (no layout shift), srcset, and lazy loading. */
export default function HughPhoto({ photo, sizes, eager = false, className = '', imgClassName = '' }: Props) {
  const p: Photo = HUGH_PHOTOS[photo];
  return (
    <img
      src={photoSrc(p, 'lg')}
      srcSet={photoSrcSet(p)}
      sizes={sizes}
      width={p.width}
      height={p.height}
      alt={p.alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      className={`block w-full h-auto ${imgClassName} ${className}`.trim()}
    />
  );
}
