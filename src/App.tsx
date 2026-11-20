import { Suspense, useEffect } from 'react';
import { Switch, Route, Redirect, useLocation, Link } from 'wouter';
import { usePageMeta, useNoindex } from '@/lib/usePageMeta';
import { lazyWithReload as lazy } from '@/lib/chunkReload';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ErrorBoundary from '@/components/ErrorBoundary';
import Home from '@/pages/Home';
import { Analytics } from '@vercel/analytics/react';

// Every page except Home loads when it is first visited, so the map library, search and guides
// do not slow down the first load on a phone.
const MapPage = lazy(() => import('@/pages/MapPage'));
const Colleges = lazy(() => import('@/pages/Colleges'));
const CollegeDetail = lazy(() => import('@/pages/CollegeDetail'));
const Learn = lazy(() => import('@/pages/Learn'));
const ArticlePage = lazy(() => import('@/pages/ArticlePage'));
const Training = lazy(() => import('@/pages/Training'));
const About = lazy(() => import('@/pages/About'));
const ForCoaches = lazy(() => import('@/pages/ForCoaches'));

function NotFound() {
  usePageMeta('Page not found', "This page doesn't exist on Rugby Campus.");
  useNoindex(true);
  return (
    <div className="max-w-6xl mx-auto px-5 py-24 min-h-[60vh]">
      <h1 className="font-heading text-[32px] text-ink mb-3">Page not found</h1>
      <p className="text-muted text-[15px] mb-6">That page doesn't exist, or it has moved.</p>
      <p className="flex flex-wrap gap-x-6 gap-y-2 text-[14px] font-semibold">
        <Link href="/colleges" className="text-navy">All colleges</Link>
        <Link href="/map" className="text-navy">Map</Link>
        <Link href="/learn" className="text-navy">Guides</Link>
      </p>
    </div>
  );
}

/** Full-height grey block while the map code loads, so the footer never jumps to the top. */
const MapFallback = () => <div className="bg-[#f3f4f6]" style={{ height: 'calc(100vh - 56px)' }} aria-hidden />;
const LazyMap = () => <Suspense fallback={<MapFallback />}><MapPage /></Suspense>;

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location]);
  return null;
}

export default function App() {
  const [location] = useLocation();
  return (
    <div className="min-h-screen flex flex-col font-body bg-white">
      <ScrollToTop />
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[10001] focus:bg-white focus:text-navy focus:px-4 focus:py-2 focus:rounded-md focus:border focus:border-line text-[13px] font-semibold">
        Skip to content
      </a>
      <Navigation />
      <main id="main" tabIndex={-1} className="flex-1 pt-14 outline-none">
        <ErrorBoundary resetKey={location}>
        <Suspense fallback={<div className="min-h-screen" aria-hidden />}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/map" component={LazyMap} />
          <Route path="/colleges" component={Colleges} />
          <Route path="/colleges/:slug" component={CollegeDetail} />
          <Route path="/learn" component={Learn} />
          <Route path="/learn/:slug" component={ArticlePage} />
          <Route path="/training" component={Training} />
          <Route path="/about" component={About} />
          <Route path="/work-with-me">{() => <Redirect to="/about" />}</Route>
          <Route path="/for-coaches" component={ForCoaches} />
          <Route component={NotFound} />
        </Switch>
        </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
      {/* Vercel Web Analytics: page views only, no cookies. It starts counting once Web Analytics is switched on for the project in Vercel. */}
      <Analytics />
    </div>
  );
}
