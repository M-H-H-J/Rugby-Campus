// Server-renders the real page components for the prerender script, so crawlers read the same words visitors see.
// Only pages with no data fetching belong here; effects (page meta, focus, storage) don't run on the server.
import { renderToStaticMarkup } from 'react-dom/server';
import { Router } from 'wouter';
import About from '@/pages/About';
import Training from '@/pages/Training';
import ForCoaches from '@/pages/ForCoaches';
import Learn from '@/pages/Learn';
import Privacy from '@/pages/Privacy';

export { PRIVACY_UPDATED, PRIVACY_TITLE, PRIVACY_DESCRIPTION } from '@/pages/Privacy';

const PAGES = { '/about': About, '/training': Training, '/for-coaches': ForCoaches, '/learn': Learn, '/privacy': Privacy } as const;
export type RenderedPath = keyof typeof PAGES;

export function renderPage(path: RenderedPath): string {
  const Page = PAGES[path];
  return renderToStaticMarkup(<Router ssrPath={path}><Page /></Router>);
}
