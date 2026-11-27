// Server-renders the real page components for the prerender script, so crawlers read the same words visitors see.
// Only pages with no data fetching belong here; effects (page meta, focus, storage) don't run on the server.
import { renderToStaticMarkup } from 'react-dom/server';
import { Router } from 'wouter';
import About from '@/pages/About';
import Training from '@/pages/Training';
import ForCoaches from '@/pages/ForCoaches';
import Learn from '@/pages/Learn';
import Privacy from '@/pages/Privacy';
import AiInfo from '@/pages/AiInfo';

export { PRIVACY_UPDATED, PRIVACY_TITLE, PRIVACY_DESCRIPTION } from '@/pages/Privacy';
export { AI_INFO_UPDATED, AI_INFO_TITLE, AI_INFO_DESCRIPTION, CITE_TABLE } from '@/pages/AiInfo';

const PAGES = { '/about': About, '/training': Training, '/for-coaches': ForCoaches, '/learn': Learn, '/privacy': Privacy, '/ai-info': AiInfo } as const;
export type RenderedPath = keyof typeof PAGES;

export function renderPage(path: RenderedPath): string {
  const Page = PAGES[path];
  return renderToStaticMarkup(<Router ssrPath={path}><Page /></Router>);
}
