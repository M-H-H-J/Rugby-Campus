import { campusSources, CAMPUS_SIZES } from '@/lib/campusImage';

interface Props {
  src: string;
  alt: string;
  size: keyof typeof CAMPUS_SIZES;
  width: number;
  height: number;
  className?: string;
  /** Only the profile hero is eager; every other campus photo lazy-loads. */
  eager?: boolean;
}

/** A campus photo as WebP at the right width, with the stored .jpg as the fallback for browsers without WebP. */
export default function CampusPhoto({ src, alt, size, width, height, className, eager = false }: Props) {
  const webp = campusSources(src);
  const img = (
    <img
      src={src} alt={alt} width={width} height={height}
      loading={eager ? 'eager' : 'lazy'} decoding={eager ? 'sync' : 'async'}
      {...(eager ? { fetchPriority: 'high' as const } : {})}
      className={className}
    />
  );
  if (!webp) return img;
  return (
    <picture className="contents">
      <source type="image/webp" srcSet={webp.srcSet} sizes={CAMPUS_SIZES[size]} />
      {img}
    </picture>
  );
}
