import { Component, type ErrorInfo, type ReactNode } from 'react';
import { CONTACT_EMAIL } from '@/config';
import { isChunkLoadError, reloadOnce } from '@/lib/chunkReload';

interface Props { children: ReactNode; resetKey?: string }
interface State { error: unknown; reloading: boolean }

/** Keeps the nav and footer on screen when a page throws, and reloads once when a deploy removed old chunks. */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, reloading: false };

  static getDerivedStateFromError(error: unknown): Partial<State> {
    return { error };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    if (isChunkLoadError(error) && reloadOnce()) { this.setState({ reloading: true }); return; }
    console.error('Page error:', error, info.componentStack);
  }

  componentDidUpdate(prev: Props) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) this.setState({ error: null, reloading: false });
  }

  render() {
    if (!this.state.error) return this.props.children;
    if (this.state.reloading) return <div className="min-h-[60vh]" aria-busy="true" />;
    return (
      <div className="max-w-6xl mx-auto px-5 py-24 min-h-[60vh]" role="alert">
        <h1 className="font-heading text-[32px] text-ink mb-3">This page didn't load</h1>
        <p className="text-muted text-[15px] mb-6 max-w-xl">
          The site may have just been updated. Reloading usually fixes it. If it keeps happening, email{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-navy underline underline-offset-2">{CONTACT_EMAIL}</a>.
        </p>
        <button type="button" onClick={() => window.location.reload()} className="btn bg-navy text-white px-5 py-2.5 rounded-md text-[13px] font-semibold">
          Reload the page
        </button>
      </div>
    );
  }
}
