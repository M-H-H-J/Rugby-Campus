import { useEffect, useMemo } from 'react';
import { Switch, Route, useLocation } from 'wouter';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Home from '@/pages/Home';
import MapPage from '@/pages/MapPage';
import Colleges from '@/pages/Colleges';
import CollegeDetail from '@/pages/CollegeDetail';
import Learn from '@/pages/Learn';
import ArticlePage from '@/pages/ArticlePage';
import Training from '@/pages/Training';
import About from '@/pages/About';
import WorkWithMe from '@/pages/WorkWithMe';
import ForCoaches from '@/pages/ForCoaches';

const TOOL_ROUTES = ['/map', '/colleges'];

function useCanvasClass(location: string): string {
  return useMemo(() => {
    const isToolSurface = TOOL_ROUTES.some(
      (r) => location === r || location.startsWith(r + '/')
    );
    return isToolSurface ? 'bg-paper' : 'bg-cream';
  }, [location]);
}

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location]);
  return null;
}

export default function App() {
  const [location] = useLocation();
  const canvasClass = useCanvasClass(location);

  return (
    <div className={`min-h-screen flex flex-col font-body ${canvasClass}`}>
      <ScrollToTop />
      <Navigation />
      <main className="flex-1 pt-16">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/map" component={MapPage} />
          <Route path="/colleges" component={Colleges} />
          <Route path="/colleges/:slug" component={CollegeDetail} />
          <Route path="/learn" component={Learn} />
          <Route path="/learn/:slug" component={ArticlePage} />
          <Route path="/training" component={Training} />
          <Route path="/about" component={About} />
          <Route path="/work-with-me" component={WorkWithMe} />
          <Route path="/for-coaches" component={ForCoaches} />
          <Route>
            <div className="max-w-6xl mx-auto px-5 py-24 text-center">
              <h1 className="font-heading text-[32px] text-ink mb-3">Page not found</h1>
              <p className="text-muted text-[14px]">The page you're looking for doesn't exist.</p>
            </div>
          </Route>
        </Switch>
      </main>
      <Footer />
    </div>
  );
}
