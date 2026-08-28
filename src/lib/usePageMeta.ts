import { useEffect } from 'react';
import { SITE_NAME } from '@/config';

/** Sets document title + meta description per page for SEO. */
export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    document.title = title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — Find Your Rugby College in the USA`;
    if (description) {
      let el = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
      if (!el) { el = document.createElement('meta'); el.name = 'description'; document.head.appendChild(el); }
      el.content = description;
      let og = document.querySelector('meta[property="og:description"]') as HTMLMetaElement | null;
      if (!og) { og = document.createElement('meta'); og.setAttribute('property', 'og:description'); document.head.appendChild(og); }
      og.content = description;
    }
    let ogTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement | null;
    if (!ogTitle) { ogTitle = document.createElement('meta'); ogTitle.setAttribute('property', 'og:title'); document.head.appendChild(ogTitle); }
    ogTitle.content = title ? `${title} — ${SITE_NAME}` : SITE_NAME;
  }, [title, description]);
}
