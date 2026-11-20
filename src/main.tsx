import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import { reloadOnce } from './lib/chunkReload'
import './index.css'

// Vite fires this when a preloaded chunk or CSS file is missing (old tab after a redeploy).
window.addEventListener('vite:preloadError', (e) => {
  if (reloadOnce()) e.preventDefault();
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
