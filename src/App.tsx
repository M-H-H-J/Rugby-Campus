import { lazy, Suspense, useEffect } from 'react';
import { Switch, Route, Redirect, useLocation } from 'wouter';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
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

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location]);
  return null;
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col font-body bg-white">
      <ScrollToTop />
      <Navigation />
      <main className="flex-1 pt-14">
        <Suspense fallback={<div className="min-h-[60vh]" aria-hidden />}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/map" component={MapPage} />
          <Route path="/colleges" component={Colleges} />
          <Route path="/colleges/:slug" component={CollegeDetail} />
          <Route path="/learn" component={Learn} />
          <Route path="/learn/:slug" component={ArticlePage} />
          <Route path="/training" component={Training} />
          <Route path="/about" component={About} />
          <Route path="/work-with-me">{() => <Redirect to="/about" />}</Route>
          <Route path="/for-coaches" component={ForCoaches} />
          <Route>
            <div className="max-w-6xl mx-auto px-5 py-24 text-center">
              <h1 className="font-heading text-[32px] text-ink mb-3">Page not found</h1>
              <p className="text-muted text-[14px]">The page you're looking for doesn't exist.</p>
            </div>
          </Route>
        </Switch>
        </Suspense>
      </main>
      <Footer />
      {/* Vercel Web Analytics: page views only, no cookies. It starts counting once Web Analytics is switched on for the project in Vercel. */}
      <Analytics />
    </div>
  );
}
